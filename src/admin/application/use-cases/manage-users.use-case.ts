import { Injectable, NotFoundException } from "@nestjs/common";
import { IAdminUserRepository } from "../../../admin/domain/ports/admin-user.repository";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class ManageUsersUseCase {
    constructor(
        private readonly userRepo: IAdminUserRepository,
        private readonly prisma: PrismaService,
    ) { }

    async getUsers(page: number = 1, limit: number = 10, search?: string) {
        return this.userRepo.findAll({ page, limit, search });
    }

    async changeUserRole(userId: number, roleName: string) {
        const role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if(!role) throw new NotFoundException(`Role '${roleName}' not found`);

        const user = await this.userRepo.findById(userId);
        if(!user) throw new NotFoundException(`User ID ${userId} not found`);
        
        return this.userRepo.updateRole(userId,role.id);
    }
}