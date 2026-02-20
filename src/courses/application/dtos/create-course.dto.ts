import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCourseDto {
    @ApiProperty({ example: 'ສອນຂຽນ Flutter 2024' })
    @IsNotEmpty()
    @IsString()
    title!: string;

    @ApiProperty({ example: 'ຫຼັກສູດສຳຫຼັບຜູ້ເລີ່ມຕົ້ນ...' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({example: 1})
    @IsNotEmpty()
    @IsNumber()
    categoryId!: number;

    @ApiProperty({example: false})
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}