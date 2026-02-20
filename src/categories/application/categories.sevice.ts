import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { UpdateCategoryDto } from "./dtos/update-category.dto";

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateCategoryDto) {
        const exists = await this.prisma.category.findUnique({
            where: {slug: dto.slug}
        });
        if(exists) {
            throw  new ConflictException(`Category slug '${dto.slug}' already exist`);
        }
        return this.prisma.category.create({data: dto});
    }

    async update(id: number, dto: UpdateCategoryDto){
        const category = await this.prisma.category.findUnique({where: {id}});
        if(!category) throw new NotFoundException('Category Not found');

        if(dto.slug && dto.slug !== category.slug) {
            const exists = await this.prisma.category.findUnique({where: {slug: dto.slug}});
            if(exists) throw new ConflictException('Slug already exists');
        }

        return this.prisma.category.update({
            where: {id},
            data: dto,
        })
    }

    async findAll() {
        const categories = await this.prisma.category.findMany({
            orderBy: {name: 'asc'}
        })
        return {category: categories};
    }

    async remove(id: number) {
        const category = await this.prisma.category.findUnique({where: {id}});
        if(!category) throw new NotFoundException('ບໍ່ພົບໝວດໝູ່');
        const coursesCount = await this.prisma.course.count({where: {categoryId: id}});
        if(coursesCount > 0) throw new BadRequestException('ບໍ່ສາມາດລຶບໝວດໝູ່ທີ່ມີຫຼັກສູດຢູ່ແລ້ວໄດ້');

        return this.prisma.category.delete({where: {id}});
    }
}