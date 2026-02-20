import { Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Put, Request, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { LessonsService } from '../application/lessons.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CreateLessonDto } from '../application/dtos/create-lessons.dto';
import { UpdateLessonsDto } from '../application/dtos/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/presentation/guards/jwt-auth.guard';
import { EnrollmentsService } from 'src/enrollments/application/enrollments.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

@Controller('courses')
export class LessonsController {
    constructor(
        private readonly lessonsService: LessonsService,
        private readonly enrollmentsService: EnrollmentsService,
    ) {}

    @Get(':courseId/lessons')
    @UseGuards(AuthGuard('jwt'))
    getLessons(@Param('courseId', ParseIntPipe) courseId: number, @Request() req) {
        return this.lessonsService.findByCourse(courseId, req.user.id, req.user.role);
    }

    @Post(':courseId/lessons')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN, Role.INSTRUCTOR)
    create(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Body() dto: CreateLessonDto,
    ) {
        return this.lessonsService.create(courseId, dto);
    }

    @Put(':courseId/lessons/:lessonId')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN, Role.INSTRUCTOR)
    update(
        @Param('lessonId', ParseIntPipe) lessonId: number,
        @Body() dto: UpdateLessonsDto,
        @Request() req
    ) {
        return this.lessonsService.update(lessonId, req.user.id, req.user.role, dto);
    }

    @Delete(':courseId/lessons/:lessonId')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN, Role.INSTRUCTOR)
    remove(
        @Param('lessonId',ParseIntPipe) lessonId: number,
        @Request() req
    ) {
        return this.lessonsService.remove(lessonId, req.user.id, req.user.role);
    }

    @Post(':courseId/lessons/:lessonId/progress')
    @UseGuards(JwtAuthGuard)
    updateProgress(
        @Param('lessonId', ParseIntPipe) lessonId: number,
        @Body('isCompleted') isCompleted: boolean,
        @Request() req
    ){
        return this.lessonsService.updateProgress(req.user.id, lessonId, isCompleted);
    }

    @Post(':id/upload')
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({schema: {type: 'object', properties:{file:{type: 'string', format: 'binary'}}}})
    @UseInterceptors(FileInterceptor('video'))
    async uploadVideo(
        @Param('id',ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.lessonsService.uploadVideo(id, file.filename);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async streamVideo(
        @Param('id', ParseIntPipe) id: number,
        @Headers('range') range: string,
        @Res() res: Response,
        @Request() req
    ){
        const filename = await this.lessonsService.getVideoFilename(id);
        return this.lessonsService.streamVideo(filename, range, res);
    }
}
