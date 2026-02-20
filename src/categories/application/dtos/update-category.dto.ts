import { PartialType } from "@nestjs/mapped-types";
import { CreateCategoryDto } from "../../../categories/application/dtos/create-category.dto";

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}