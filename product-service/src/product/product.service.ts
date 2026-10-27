import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { Product } from "./product.entity.js";

export interface ProductResponse {
  id: string;
  sku: string;
  categoryId: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice: number;
  currency: string;
  stock: number;
  availability: string;
  rating: number;
  reviewCount: number;
  images: string[];
  specifications: Record<string, string>;
  tags: string[];
  isActive: boolean;
  featured: boolean;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly products: Repository<Product>,
  ) {}

  async getProducts(filters: {
    categoryId?: string;
    search?: string;
  }): Promise<ProductResponse[]> {
    const query = this.createProductQuery();
    if (filters.categoryId) {
      query.andWhere("product.categoryId = :categoryId", {
        categoryId: filters.categoryId,
      });
    }
    if (filters.search) {
      const keyword = `%${filters.search}%`;
      query.andWhere(
        new Brackets((searchQuery) => {
          searchQuery
            .where("product.name LIKE :keyword", { keyword })
            .orWhere("product.sku LIKE :keyword", { keyword })
            .orWhere("product.brand LIKE :keyword", { keyword })
            .orWhere("product.description LIKE :keyword", { keyword })
            .orWhere("product.shortDescription LIKE :keyword", { keyword })
            .orWhere("productTag.name LIKE :keyword", { keyword })
            .orWhere("productSpecification.name LIKE :keyword", { keyword })
            .orWhere("productSpecification.value LIKE :keyword", { keyword });
        }),
      );
    }
    const products = await query
      .distinct(true)
      .orderBy("product.id", "ASC")
      .getMany();
    return products.map((product) => this.toResponse(product));
  }

  async getBySlug(slug: string): Promise<ProductResponse | null> {
    const product = await this.createProductQuery()
      .andWhere("product.slug = :slug", { slug })
      .getOne();
    return product ? this.toResponse(product) : null;
  }

  private createProductQuery() {
    return this.products
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.images", "productImage")
      .leftJoinAndSelect("product.specifications", "productSpecification")
      .leftJoinAndSelect("product.tags", "productTag")
      .where("product.isActive = :isActive", { isActive: true });
  }

  private toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      sku: product.sku,
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      originalPrice: product.originalPrice,
      currency: product.currency,
      stock: product.stock,
      availability: product.availability,
      rating: product.rating,
      reviewCount: product.reviewCount,
      images: product.images
        .sort((left, right) => left.position - right.position)
        .map(({ url }) => url),
      specifications: Object.fromEntries(
        product.specifications.map(({ name, value }) => [name, value]),
      ),
      tags: product.tags.map(({ name }) => name),
      isActive: product.isActive,
      featured: product.featured,
    };
  }
}
