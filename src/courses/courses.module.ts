import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CoursesController } from "./presentation/courses.controller";
import { CoursesService } from "./application/courses.service";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

@Module({
    imports: [
        AuthModule,
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads/courses',
                filename(req, file, callback) {
                    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                    callback(null, `${randomName}${extname(file.originalname)}`);
                },
            })
        })
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService],
})
export class CoursesModule { }