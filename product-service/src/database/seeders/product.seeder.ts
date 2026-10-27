import { randomUUID } from "node:crypto";
import type { EntityManager } from "typeorm";
import { In } from "typeorm";
import {
  Product,
  ProductImage,
  ProductSpecification,
  ProductTag,
} from "../../product/product.entity.js";
import type { ProductSeed } from "./catalog-seed-data.js";

export async function seedProducts(
  manager: EntityManager,
  products: ProductSeed[],
  categoryIds: Map<number, string>,
): Promise<void> {
  if (products.length === 0) {
    return;
  }
  const productRepository = manager.getRepository(Product);
  const sourceIds = products.map(({ id }) => id);
  const existingProducts = await productRepository.findBy({
    sourceId: In(sourceIds),
  });
  const existingById = new Map(
    existingProducts.map((product) => [product.sourceId, product]),
  );
  const productRows = products.map((product) => {
    const categoryId = categoryIds.get(product.categorySourceId);
    if (!categoryId) {
      throw new Error(
        `No database category found for source category ${product.categorySourceId}`,
      );
    }
    return {
      ...(existingById.has(product.id)
        ? { id: existingById.get(product.id)!.id }
        : {}),
      sourceId: product.id,
      sku: product.sku,
      categoryId,
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
      isActive: product.isActive,
      featured: product.featured,
      ...(existingById.has(product.id)
        ? { createdAt: existingById.get(product.id)!.createdAt }
        : {}),
    };
  });

  const persistedProducts: Product[] = [];
  for (let offset = 0; offset < productRows.length; offset += 100) {
    persistedProducts.push(
      ...(await productRepository.save(productRows.slice(offset, offset + 100))),
    );
  }
  const productIds = new Map(
    persistedProducts.map((product) => [product.sourceId, product.id]),
  );
  for (const product of products) {
    if (!productIds.get(product.id)) {
      throw new Error(
        `No database product ID found for source ID ${product.id}`,
      );
    }
  }

  const persistedProductIds = [...productIds.values()];
  await manager
    .getRepository(ProductImage)
    .delete({ productId: In(persistedProductIds) });
  await manager
    .getRepository(ProductSpecification)
    .delete({ productId: In(persistedProductIds) });
  await manager
    .getRepository(ProductTag)
    .delete({ productId: In(persistedProductIds) });

  const images = products.flatMap((product) =>
    product.images.map((url, position) => ({
      id: randomUUID(),
      productId: productIds.get(product.id)!,
      url,
      position,
    })),
  );
  const specifications = products.flatMap((product) =>
    Object.entries(product.specifications).map(([name, value]) => ({
      id: randomUUID(),
      productId: productIds.get(product.id)!,
      name,
      value,
    })),
  );
  const tags = products.flatMap((product) =>
    product.tags.map((name) => ({
      id: randomUUID(),
      productId: productIds.get(product.id)!,
      name,
    })),
  );

  await saveInBatches(manager.getRepository(ProductImage), images);
  await saveInBatches(
    manager.getRepository(ProductSpecification),
    specifications,
  );
  await saveInBatches(manager.getRepository(ProductTag), tags);
}

async function saveInBatches<T extends object>(
  repository: { save(entities: T[]): Promise<T[]> },
  records: T[],
): Promise<void> {
  for (let offset = 0; offset < records.length; offset += 100) {
    await repository.save(records.slice(offset, offset + 100));
  }
}
