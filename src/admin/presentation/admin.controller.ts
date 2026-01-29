import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RoleGuard } from "src/common/guards/roles.guard";
import { AuthGuard } from "@nestjs/passport";

@Controller('super-admin')
@UseGuards(AuthGuard('jwt'), RoleGuard)
export class AdminController {
    @Get('dashboard')
    @Roles(Role.ADMIN)
    getDashboard() {
        return {message: 'Welcome to Super Admin dashboard'};
    }

    @Get('users')
    @Roles(Role.ADMIN)
    getAllUsers() {
        return { message: 'List of all Users'};
    }
}