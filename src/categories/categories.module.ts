import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriesService } from 'src/categories/application/categories.sevice';
import { CategoriesController } from 'src/categories/presentation/categories.controller';

@Module({
    imports: [AuthModule],
    controllers: [CategoriesController],
    providers: [CategoriesService],
    exports: [CategoriesService]
})
export class CategoriesModule {}
