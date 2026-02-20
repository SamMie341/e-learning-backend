import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { FindUserOptions, IAdminUserRepository } from "src/admin/domain/ports/admin-user.repository";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PrismaAdminUserAdapter implements IAdminUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll({ page, limit, search }: FindUserOptions): Promise<{ users: User[]; total: number }> {
        const skip = (page - 1) * limit;

        const whereCondition = search ? {
            OR: [
                { username: { contains: search, mode: 'insensitive' as const } },
                { fullname: { contains: search, mode: 'insensitive' as const } },
            ]
        } : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: whereCondition,
                skip,
                take: limit,
                include: { role: true },
                orderBy: { id: 'desc' }
            }),
            this.prisma.user.count({ where: whereCondition }),
        ]);
        return { users, total };
    }

    async findById(userId: number): Promise<User | null> {
        return await this.prisma.user.findUnique({where: {id: userId}});
    }
    async updateRole(userId: number, roleId: number): Promise<User> {
       return await this.prisma.user.update({
        where: {id: userId},
        data: {roleId},
        include: { role: true}
       })
    }
}