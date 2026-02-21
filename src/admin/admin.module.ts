import { Module } from "@nestjs/common";
import { AdminController } from "./presentation/admin.controller";
import { ManageUsersUseCase } from "./application/use-cases/manage-users.use-case";
import { IAdminUserRepository } from "./domain/ports/admin-user.repository";
import { PrismaAdminUserAdapter } from "./infrastructure/adapters/prisma-admin-user.adapter";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [AdminController],
    providers: [
        ManageUsersUseCase,
        {
            provide: IAdminUserRepository,
            useClass: PrismaAdminUserAdapter,
        },
    ],
})
export class AdminModule {}