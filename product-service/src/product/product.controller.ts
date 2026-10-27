import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from "@nestjs/common";
import { ProductService } from "./product.service.js";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  getProducts(
    @Query("categoryId") categoryId?: string,
    @Query("search") search?: string,
  ) {
    if (categoryId !== undefined && !isUuid(categoryId)) {
      throw new BadRequestException("categoryId must be a UUID");
    }
    return this.productService.getProducts({
      categoryId,
      search: search?.trim() || undefined,
    });
  }

  @Get(":slug")
  async getProduct(@Param("slug") slug: string) {
    const product = await this.productService.getBySlug(slug);
    if (!product) {
      throw new NotFoundException(`Product "${slug}" was not found`);
    }
    return product;
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
