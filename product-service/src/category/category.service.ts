import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./category.entity.js";

export interface CategoryResponse {
  id: string;
  parent: string | 0;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  async getCategories(): Promise<CategoryResponse[]> {
    const categories = await this.categories.find({
      where: { isActive: true },
      order: { name: "ASC" },
    });
    return categories.map((category) => this.toResponse(category));
  }

  async getBySlug(slug: string): Promise<CategoryResponse | null> {
    const category = await this.categories.findOneBy({
      slug,
      isActive: true,
    });
    return category ? this.toResponse(category) : null;
  }

  private toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      parent: category.parentId ?? 0,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
    };
  }
}
