import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CategoriesService } from '../categories/application/categories.sevice';
import { CategoriesController } from '../categories/presentation/categories.controller';

@Module({
    imports: [AuthModule],
    controllers: [CategoriesController],
    providers: [CategoriesService],
    exports: [CategoriesService]
})
export class CategoriesModule {}
