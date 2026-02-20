import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'src/common/enums/role.enum';
import { CreateLessonDto } from './dtos/create-lessons.dto';
import { UpdateLessonsDto } from './dtos/update-lesson.dto';
import { EnrollmentsService } from 'src/enrollments/application/enrollments.service';
import { Response } from 'express';
import { join } from 'path';
import { createReadStream, existsSync, statSync } from 'fs';

@Injectable()
export class LessonsService {
    constructor(private readonly prisma: PrismaService,
        private readonly enrollmentsService: EnrollmentsService
    ) { }

    async create(courseId: number, dto: CreateLessonDto) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        let order = dto.order;
        if (order === undefined) {
            const lastLesson = await this.prisma.lesson.findFirst({
                where: { courseId },
                orderBy: { order: 'desc' },
            });
            order = lastLesson ? lastLesson.order + 1 : 1;
        }

        return this.prisma.lesson.create({
            data: {
                title: dto.title!,
                content: dto.content,
                videoUrl: dto.videoUrl,
                order: order,
                courseId: courseId,
                isPublished: dto.isPublished !== undefined ? dto.isPublished : false,
            },
        });
    }

    async update(lessonId: number, userId: number, role: string, dto: UpdateLessonsDto) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
        if (!lesson) throw new NotFoundException('ບໍ່ພົບບົດຮຽນ');
        if (role !== Role.ADMIN && lesson.course.instructorId !== userId) throw new ForbiddenException('ທ່ານສາມາດແກ້ໄຂບົດຮຽນໄດ້ໃນຫຼັກສູດຂອງທ່ານເອງເທົ່ານັ້ນ');
        return this.prisma.lesson.update({
            where: { id: lessonId },
            data: dto,
        });
    }

    async remove(lessonId: number, userId: number, role: string) {
        const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
        if (!lesson) throw new NotFoundException('ບໍ່ພົບບົດຮຽນ');
        if (role !== Role.ADMIN && lesson.course.instructorId !== userId) throw new ForbiddenException('ທ່ານສາມາດລຶບບົດຮຽນໃນຫຼັກສູດຂອງທ່ານເອງໄດ້ເທົ່ານັ້ນ');

        return this.prisma.lesson.delete({ where: { id: lessonId } });
    }

    async findByCourse(courseId: number, userId: number, role: string) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('ບໍ່ພົບຫຼັກສູດ');

        if (role === Role.ADMIN || course.instructorId === userId) {
            return this.prisma.lesson.findMany({
                where: { courseId },
                orderBy: { order: 'asc' },
            });
        }

        const isEnrolled = await this.enrollmentsService.checkEnrollment(userId, courseId);
        if (!isEnrolled) throw new ForbiddenException('ທ່ານຕ້ອງລົງທະບຽນຮຽນຫຼັກສູດນີ້ເພື່ອເບິ່ງບົດຮຽນ'); 

        const lessons = await this.prisma.lesson.findMany({
            where: {courseId},
            orderBy: {order: 'asc'},
            include: {
                progress: {
                    where: {userId},
                    select: {isCompleted: true}
                }
            }
        });

        return lessons.map(lesson => ({
            ...lesson,
            isCompleted: lesson.progress.length > 0 ? lesson.progress[0].isCompleted : false,
            progress: undefined
        }))
    }

    async updateProgress(userId: number, lessonId: number, isCompleted: boolean) {
        const lesson = await this.prisma.lesson.findUnique({where: {id: lessonId}});
        if(!lesson) throw new NotFoundException('ບໍ່ພົບບົດຮຽນ');

        const enrollment = await this.prisma.enrollment.findUnique({
            where: {userId_courseId: {userId, courseId: lesson.courseId}}
        });
        if(!enrollment) throw new ForbiddenException('ທ່ານຕ້ອງລົງທະບຽນຮຽນກ່ອນ');

        await this.prisma.lessonProgress.upsert({
            where: {userId_lessonId: {userId, lessonId}},
            update: {isCompleted},
            create: {userId, lessonId, isCompleted},
        });

        if(isCompleted){
            const totalLessons = await this.prisma.lesson.count({
                where: {courseId: lesson.courseId}
            });

            const completedLessons = await this.prisma.lessonProgress.count({
                where: {
                    userId,
                    isCompleted: true,
                    lesson: {courseId: lesson.courseId}
                }
            });

            if(completedLessons === totalLessons) {
                await this.prisma.enrollment.update({
                    where: {id: enrollment.id},
                    data: {completedAt: new Date()}
                });
            }
        }

        return {success: true};
    }

    async uploadVideo(lessonId: number, fileName: string) {
        return this.prisma.lesson.update({
            where: {id: lessonId},
            data: {
                videoUrl: fileName,
                duration: 0,
            }
        });
    }

    async streamVideo(filename: string, range: string, res: Response){
        const videoPath = join(process.cwd(), 'uploads/videos', filename);

        if(!existsSync(videoPath)) {
            throw new NotFoundException('ບໍ່ພົບໄຟລ໌ວິດີໂອ');
        }

        const videoSize = statSync(videoPath).size;

        if(range) {
            const parts = range.replace(/bytes=/,"").split("-");
            const start = parseInt(parts[0], 10);

            const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
            const chunkSize = (end-start) + 1;

            const file =createReadStream(videoPath, {start,end});

            const head = {
                'Content-Range': `bytes ${start}-${end}/${videoSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length':chunkSize,
                'Content-Type': 'video/mp4',
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': videoSize,
                'Content-Type':'video/mp4',
            };
            res.writeHead(200, head);
            createReadStream(videoPath).pipe(res);
        }
    }

    async getVideoFilename(lessonId: number): Promise<string> {
        const lesson = await this.prisma.lesson.findUnique({where: {id: lessonId}});
        if(!lesson || !lesson.videoUrl) throw new NotFoundException('ບໍ່ພົບວິດີໂອໃນບົດຮຽນນີ້');
        return lesson.videoUrl;
    }
}
