import { Module } from '@nestjs/common';
import { EnrollmentsController } from './presentation/enrollments.controller';
import { EnrollmentsService } from './application/enrollments.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
