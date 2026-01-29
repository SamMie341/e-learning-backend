import { Injectable } from "@nestjs/common";
import { IUserRepository, LocalUser } from "src/auth/domain/ports/user-repository.port";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PrismaUserRepositoryAdapter implements IUserRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByUsername(username: string): Promise<LocalUser | null> {
        return this.prisma.user.findUnique({
            where: { username },
            include: { role: true }, // Join เอาชื่อ Role มาด้วย
        }) as Promise<LocalUser | null>;
    }

    async createOrUpdate(username: string, fullname: string, roleName = 'student') {
        let role = await this.prisma.role.findUnique({ where: { name: roleName } });
        if (!role) {
            role = await this.prisma.role.create({
                data: {
                    name: roleName,
                    description: `Auto Created role for ${roleName}`
                }
            });
        }

        return this.prisma.user.upsert({
            where: { username },
            update: { fullname },
            create: {
                username,
                fullname,
                roleId: role.id,
            },
            include: { role: true },
        });
    }
}