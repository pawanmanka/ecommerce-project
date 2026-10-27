import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { CategoryService } from "./category.service.js";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getCategories() {
    return this.categoryService.getCategories();
  }

  @Get(":slug")
  async getCategory(@Param("slug") slug: string) {
    const category = await this.categoryService.getBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category "${slug}" was not found`);
    }
    return category;
  }
}
