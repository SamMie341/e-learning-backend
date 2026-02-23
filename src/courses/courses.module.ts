import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CoursesController } from "./presentation/courses.controller";
import { CoursesService } from "./application/courses.service";
import { UploadModule } from "src/upload/upload.module";

@Module({
    imports: [
        AuthModule,
        UploadModule,
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService],
})
export class CoursesModule { }