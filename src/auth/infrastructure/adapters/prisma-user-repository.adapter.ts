import { Injectable } from "@nestjs/common";
import { IUserRepository, LocalUser } from "../../../auth/domain/ports/user-repository.port";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class PrismaUserRepositoryAdapter implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async updateLastLogin(id: number): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
                lastActiveAt: new Date(),
            }
        });
    }

    async findByUsername(username: string): Promise<LocalUser | null> {
        return this.prisma.user.findUnique({
            where: { username },
            include: { role: true }, 
        }) as Promise<LocalUser | null>;
    }

    async createOrUpdate(username: string, fullname: string, roleName = 'student', extraData?: {
        empImg?: string;
        department?: string;
        division?: string;
        unit: string;
        status: string;
    }): Promise<LocalUser> {
        let role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role) {
            role = await this.prisma.role.create({
                data: {
                    name: roleName,
                    description: `Auto Created role for ${roleName}`
                }
            });
        }

        const user = await this.prisma.user.upsert({
            where: { username },
            update: { fullname, empImg: extraData?.empImg, department: extraData?.department, division: extraData?.division, unit: extraData?.unit, status: extraData?.status },
            create: {
                username,
                fullname,
                roleId: role.id,
                status: extraData?.status || 'active',
                unit: extraData?.unit || '',
                empImg: extraData?.empImg || '',
            },
            include: { role: true },
        });

        return {
            ...user,
            fullname: user.fullname || '',
            empImg: user.empImg || '',
        } as LocalUser;
    }
}