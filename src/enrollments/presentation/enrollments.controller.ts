import { Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from '../application/enrollments.service';
import { JwtAuthGuard } from '../../auth/presentation/guards/jwt-auth.guard';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) {}

    @Post(':courseId')
    enroll(@Param('courseId',ParseIntPipe) courseId: number, @Request() req) {
        return this.enrollmentsService.enroll(req.user.id, courseId);
    }

    @Get('my-courses')
    getMyCourses(@Request() req){
        return this.enrollmentsService.findMyCourses(req.user.id);
    }

    @Get(':courseId/check')
    async checkStatus(
        @Param('courseId', ParseIntPipe) courseId: number,
        @Request() req
    ) {
        const isEnrolled = await this.enrollmentsService.checkEnrollment(req.user.id, courseId);
        return {enrolled: isEnrolled};
    }
}
