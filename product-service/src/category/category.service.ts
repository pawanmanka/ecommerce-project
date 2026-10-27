import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type {
  PaginatedData,
  PaginationMetadata,
} from "../common/api-response.interceptor.js";
import { Category } from "./category.entity.js";

export interface PaginatedCategories extends PaginatedData<CategoryResponse> {
  pagination: PaginationMetadata;
}

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

  async getCategories(
    page: number,
    limit: number,
  ): Promise<PaginatedCategories> {
    const [categories, total] = await this.categories.findAndCount({
      where: { isActive: true },
      order: { name: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: categories.map((category) => this.toResponse(category)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
