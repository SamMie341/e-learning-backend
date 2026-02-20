import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-z0-9-\u0E80-\u0EFF]+$/, {message: 'Slug must contain only lowercase letters,numbers and hyphens'})
    slug!: string;

    @IsString()
    description?: string;
}