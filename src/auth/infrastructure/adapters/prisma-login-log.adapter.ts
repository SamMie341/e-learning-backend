import { Injectable } from "@nestjs/common";
import { ILoginLogger } from "../../../auth/domain/ports/login-logger.port";
import { PrismaService } from "../../../prisma/prisma.service";

@Injectable()
export class PrismaLoginLogAdapter implements ILoginLogger {
    constructor(private readonly prisma: PrismaService) { }

    async log(username: string, fullname: string, status: 'SUCCESS' | 'FAILED', ip: string, userAgent: string, message?: string): Promise<void> {
        try {
            await this.prisma.loginLog.create({
                data: {
                    username,
                    fullname,
                    status,
                    ipAddress: ip || '',
                    userAgent: userAgent || '',
                    message,
                },
            });
        } catch (error) {
            console.error('ບັນທຶກ Log ເຂົ້າສູ່ລະບົບຜິດພາດ', error);
        }
    }
}