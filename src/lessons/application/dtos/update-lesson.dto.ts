import { PartialType } from "@nestjs/mapped-types";
import { CreateLessonDto } from "../../../lessons/application/dtos/create-lessons.dto";

export class UpdateLessonsDto extends PartialType(CreateLessonDto) {}