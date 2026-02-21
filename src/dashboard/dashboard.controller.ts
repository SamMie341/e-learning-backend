import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/presentation/guards/jwt-auth.guard";
import { DashboardService } from "./dashboard.ser.vice";
import { RoleGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboard: DashboardService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(Role.ADMIN)
    @ApiBearerAuth()
    getDashboard() {
        return this.dashboard.getStats();
    }
}