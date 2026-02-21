import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enums/role.enum";
import { RoleGuard } from "../../common/guards/roles.guard";

@Controller('student')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class StudentController {
    @Get('my-courses')
    @Roles(Role.STUDENT, Role.ADMIN, Role.ADMIN)
    getMyCourses(@Request() req) {
        return {
            message: `Course for user ${req.user.username}`,
            courses: ['NestJS zero to zero', 'Clean ar']
        };
    }
}