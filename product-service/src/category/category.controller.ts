import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import { CategoryService } from "./category.service.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getCategories(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.categoryService.getCategories(
      parsePositiveInteger(page, DEFAULT_PAGE, "page"),
      parsePositiveInteger(limit, DEFAULT_LIMIT, "limit", MAX_LIMIT),
    );
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

function parsePositiveInteger(
  value: string | undefined,
  defaultValue: number,
  parameter: string,
  maximum?: number,
): number {
  if (value === undefined) {
    return defaultValue;
  }
  if (!/^[1-9]\d*$/.test(value)) {
    throw new BadRequestException(`${parameter} must be a positive integer`);
  }
  const parsedValue = Number(value);
  if (
    !Number.isSafeInteger(parsedValue) ||
    (maximum !== undefined && parsedValue > maximum)
  ) {
    throw new BadRequestException(
      maximum === undefined
        ? `${parameter} must be a safe positive integer`
        : `${parameter} must be between 1 and ${maximum}`,
    );
  }
  return parsedValue;
}
