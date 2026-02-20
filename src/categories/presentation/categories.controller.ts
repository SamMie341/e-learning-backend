import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { CategoriesService } from "../application/categories.sevice";
import { AuthGuard } from "@nestjs/passport";
import { RoleGuard } from "src/common/guards/roles.guard";
import { CreateCategoryDto } from "../application/dtos/create-category.dto";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { UpdateCategoryDto } from "../application/dtos/update-category.dto";

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Get()
    getAll() {
        return this.categoriesService.findAll();
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN)
    create(@Body() dto: CreateCategoryDto) {
        return this.categoriesService.create(dto);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'),RoleGuard)
    @Roles(Role.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
        return this.categoriesService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number){
        return this.categoriesService.remove(id);
    }
}
