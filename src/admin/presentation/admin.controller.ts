import { Body, Controller, Get, Param, ParseIntPipe, Put, Query, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RoleGuard } from "src/common/guards/roles.guard";
import { AuthGuard } from "@nestjs/passport";
import { ManageUsersUseCase } from "../application/use-cases/manage-users.use-case";

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(Role.ADMIN)
export class AdminController {

    constructor(private readonly manageUsersUseCase: ManageUsersUseCase){}

    // @Get('dashboard')
    // @Roles(Role.ADMIN)
    // getDashboard() {
    //     return {message: 'Welcome to Super Admin dashboard'};
    // }

    @Get('users')
    getAllUsers(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
    ) {
        return this.manageUsersUseCase.getUsers(Number(page), Number(limit), search);
    }

    @Put('users/:id/role')
    async changeRole(
        @Param('id', ParseIntPipe) id: number,
        @Body('role') roleName: string,
    ) {
        return this.manageUsersUseCase.changeUserRole(id, roleName);
    }
}