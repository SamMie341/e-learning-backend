import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.ser.vice';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
    ],
    controllers: [DashboardController],
    providers: [DashboardService]
})
export class DashboardModule {}
