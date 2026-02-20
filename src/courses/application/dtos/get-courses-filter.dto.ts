import { IsNumber, IsOptional, IsString } from "class-validator";
import {Type} from "class-transformer";

export class GetCoursesFilterDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    categoryId?: number;
}