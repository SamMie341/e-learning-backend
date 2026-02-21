import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
    constructor(private readonly prisma: PrismaService) {}

    async enroll(userId: number, courseId: number) {
        const course = await this.prisma.course.findUnique({where:{id: courseId}});
        if(!course) throw new NotFoundException('ບໍ່ພົບຫຼັກສູດ');

        const existing = await this.prisma.enrollment.findUnique({where:{
            userId_courseId: {userId, courseId}
        }});
        if(existing) throw new ConflictException('ທ່ານລົງທະບຽນຮຽນຫຼັກສູດນີ້ແລ້ວ');
        
        return this.prisma.enrollment.create({
            data: {userId, courseId}
        });
    }

    async findMyCourses(userId: number) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: {userId},
            include: {
                course: {
                    include: {
                        category: true,
                        _count: {
                            select: {lessons: true}
                        },
                        lessons: {
                            select: {
                                id: true,
                                progress: {
                                    where: {userId, isCompleted: true},
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {enrolledAt: 'desc'},
        });

        return enrollments.map((enrollment) => {
            const totalLessons = enrollment.course._count.lessons;
            const completedLessons = enrollment.course.lessons.filter(l => l.progress.length > 0).length;
            const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

            return {
                id: enrollment.id,
                enrolledAt: enrollment.enrolledAt,
                course: {
                    id: enrollment.course.id,
                    title: enrollment.course.title,
                    thumbnail: enrollment.course.thumbnail,
                    description: enrollment.course.description,
                    category: enrollment.course.category,
                    totalLessons: totalLessons,
                    completedLessons: completedLessons,
                    progressPercent: progressPercent,
                }
            }
        })
    }

    async checkEnrollment(userId: number, courseId: number) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {userId_courseId: {userId,courseId}}
        });
        return !!enrollment;
    }
}
