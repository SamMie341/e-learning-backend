import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CoursesService } from "../application/courses.service";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { CreateCourseDto } from "../application/dtos/create-course.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateCourseDto } from "../application/dtos/update-course.dto";
import { GetCoursesFilterDto } from "../application/dtos/get-courses-filter.dto";
import { ApiBearerAuth, ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { StorageService } from "src/upload/storage.service";
import * as multer from "multer";

@Controller('courses')
export class CoursesController {
    constructor(
        private readonly coursesService: CoursesService,
        private readonly storageService: StorageService,
    ) { }

    @Get()
    getAll(@Query() filter: GetCoursesFilterDto) {
        return this.coursesService.findAll(filter);
    }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({summary: 'ເພີ່ມຫຼັກສູດໃໝ່'})
    @ApiConsumes('multipart/form-data')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('thumbnail',{
        storage: multer.memoryStorage(),
        limits: { fileSize: 4 * 1024 *1024 }
    }))
    async create(
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
        @Request() req,) {

        const dto = new CreateCourseDto();
        dto.title = body.title;
        dto.description = body.description;
        dto.categoryId = Number(body.categoryId);

        if (body.isPublished) {
            dto.isPublished = body.isPublished === 'true';
        }

        let thumbnailUrl: string | null = null;

        if (file) {
            const uploadResult = await this.storageService.uploadFile(file, 'courses');
            thumbnailUrl = uploadResult.url;
        }

        const userId = req.user.id;
        return this.coursesService.create(userId, dto,thumbnailUrl!);
    }

    @Post(':id/thumbnail')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN, Role.INSTRUCTOR)
    @UseInterceptors(FileInterceptor('thumbnail',{
        storage: multer.memoryStorage(),
        limits: {fileSize: 4 * 1024 * 1024 }
    }))
    async uploadThumbnail(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        const uploadResult = await this.storageService.uploadFile(file, 'courses');
        return this.coursesService.updateThumbnail(id, uploadResult.url);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN, Role.INSTRUCTOR)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateCourseDto,
        @Request() req
    ){
        return this.coursesService.update(id, req.user.id, req.user.role, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN, Role.INSTRUCTOR)
    remove(@Param('id', ParseIntPipe) id: number,@Request() req) {
        return this.coursesService.remove(id, req.user.id, req.user.role);
    }
}