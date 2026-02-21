import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateCourseDto } from "./dtos/create-course.dto";
import { UpdateCourseDto } from "./dtos/update-course.dto";
import { Role } from "../../common/enums/role.enum";
import { GetCoursesFilterDto } from "./dtos/get-courses-filter.dto";

@Injectable()
export class CoursesService {
    constructor(private readonly prisma: PrismaService) { }

    private formatDuration(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }

    async updateThumbnail(courseId: number, imageUrl: string) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('ບໍ່ພົບຫຼັກສູດ');

        return this.prisma.course.update({
            where: { id: courseId },
            data: { thumbnail: imageUrl },
        })
    }

    async create(userId: number, dto: CreateCourseDto, thumbnailUrl?: string) {
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId }
        });

        if (!category) throw new NotFoundException('ບໍ່ພົບປະເພດ');

        return this.prisma.course.create({
            data: {
                title: dto.title,
                description: dto.description!,
                isPublished: dto.isPublished || false,
                categoryId: dto.categoryId,
                instructorId: userId,
                thumbnail: thumbnailUrl,
            },
        });
    }

    async update(id: number, userId: number, role: string, dto: UpdateCourseDto) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course) throw new NotFoundException('ບໍ່ພົບຫຼັກສູດ');

        if (role !== Role.ADMIN && course.instructorId !== userId) throw new ForbiddenException('ທ່ານສາມາດແກ້ໄຂຫຼັກສູດຂອງທ່ານເອງໄດ້ເທົ່ານັ້ນ');

        if (dto.categoryId) {
            const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
            if (!cat) throw new NotFoundException('ບໍ່ພົບໝວດໝູ່ຫຼັກສູດ');
        }

        return this.prisma.course.update({
            where: { id },
            data: dto,
        })
    }

    async findAll(filter: GetCoursesFilterDto) {
        const { search, categoryId } = filter;

        const courses = await this.prisma.course.findMany({
            where: {
                ...(search && {
                    title: {
                        contains: search,
                        mode: 'insensitive',
                    }
                }),
                ...(categoryId && {
                    categoryId: Number(categoryId),
                }),
            },
            include: {
                category: true,
                instructor: { select: { id: true, username: true, fullname: true } },
                lessons: { select: { id: true, duration: true } },
            },
            orderBy: { createdAt: 'desc' }
        });
        return courses.map(course => {
            const totalSeconds = course.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
            const { lessons, ...courseData } = course;

            return {
                ...courseData,
                totalDuration: totalSeconds,
                totalDurationText: this.formatDuration(totalSeconds)
            }
        })
    }

    async findOne(id: number) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                category: true,
                instructor: { select: { id: true, fullname: true, empImg: true } },
                lessons: {
                    orderBy: { id: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        duration: true,
                    }
                }
            }
        });
        if (!course) throw new NotFoundException('ບໍ່ພົບຫຼັກສູດ')

        const totalSeconds = course.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

        return {
            ...course,
            totalDuration: totalSeconds,
            totalDurationText: this.formatDuration(totalSeconds)
        };
    }

    async remove(id: number, userId: number, role: string) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course) throw new NotFoundException('ບໍ່ພົບຫຼັກສູດ');

        if (role !== Role.ADMIN && course.instructorId !== userId) throw new ForbiddenException('ທ່ານສາມາດລຶບຫຼັກສູດຂອງທ່ານເອງໄດ້ເທົ່ານັ້ນ');

        return this.prisma.course.delete({ where: { id } });
    }
}