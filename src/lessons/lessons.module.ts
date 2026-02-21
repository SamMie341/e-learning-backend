import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LessonsController } from './presentation/lessons.controller';
import { LessonsService } from './application/lessons.service';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
    imports: [PrismaModule,AuthModule,EnrollmentsModule,
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads/videos',
                filename(req, file, callback)  {
                    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                    callback(null, `ບົດຮຽນ-${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter(req, file, callback) {
                if(file.mimetype === 'video/mp4') {
                    callback(null, true);
                } else {
                    callback(new Error('ອະນຸຍາດສະເພາະ mp4 ເທົ່ານັ້ນ'),false);
                }
            },
        })
    ],
    controllers: [LessonsController],
    providers: [LessonsService]
})
export class LessonsModule {}
