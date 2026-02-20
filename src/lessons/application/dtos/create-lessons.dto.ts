import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateLessonDto {
    @IsNotEmpty()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsNotEmpty()
    @IsString()
    videoUrl?: string;

    @IsOptional()
    video?: any;

    @Type(() => Number)
    @IsOptional()
    @IsNumber()
    duration?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    order?: number;

    @IsOptional()
    @IsBoolean()
    @Transform(({value}) => {
        if(value === 'true') return true;
        if(value === 'false') return false;
        return value;
    })
    isPublished?: boolean;
}