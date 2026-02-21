import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./presentation/http/auth.controller";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { IAuthProvider } from "./domain/ports/auth-provider.port";
import { ExternalAuthAdapter } from "./infrastructure/adapters/external-auth.adapter";
import { PrismaModule } from "../prisma/prisma.module";
import { ILoginLogger } from "./domain/ports/login-logger.port";
import { PrismaLoginLogAdapter } from "./infrastructure/adapters/prisma-login-log.adapter";
import { IUserRepository } from "./domain/ports/user-repository.port";
import { PrismaUserRepositoryAdapter } from "./infrastructure/adapters/prisma-user-repository.adapter";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports:[
        PassportModule,
        HttpModule,
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {expiresIn: '1d'},
            }),
            inject: [ConfigService]
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
        },
        JwtStrategy,
    ],
    exports: [LoginUseCase, JwtStrategy, PassportModule],
})
export class AuthModule {}