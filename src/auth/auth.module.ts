import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./presentation/http/auth.controller";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { IAuthProvider } from "./domain/ports/auth-provider.port";
import { ExternalAuthAdapter } from "./infrastructure/adapters/external-auth.adapter";
import { PrismaModule } from "src/prisma/prisma.module";
import { ILoginLogger } from "./domain/ports/loggin-logger.port";
import { PrismaLoginLogAdapter } from "./infrastructure/adapters/prisma-login-log.adapter";
import { IUserRepository } from "./domain/ports/user-repository.port";
import { PrismaUserRepositoryAdapter } from "./infrastructure/adapters/prisma-user-repository.adapter";

@Module({
    imports:[
        HttpModule,
        PrismaModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
            signOptions: {expiresIn: '1d' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        LoginUseCase,
        {
            provide: IAuthProvider,
            useClass: ExternalAuthAdapter,
        },
        {
            provide: ILoginLogger,
            useClass: PrismaLoginLogAdapter,
        },
        {
            provide: IUserRepository,
            useClass: PrismaUserRepositoryAdapter,
        }
    ],
    exports: [LoginUseCase],
})
export class AuthModule {}