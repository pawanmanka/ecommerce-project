export interface CategorySeed {
  sourceId: number;
  parent: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

export interface ProductSeed {
  id: number;
  sku: string;
  categorySourceId: number;
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

export interface CatalogSeed {
  categories: CategorySeed[];
  products: ProductSeed[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

export function parseCatalogSeed(value: unknown): CatalogSeed {
  if (
    !isRecord(value) ||
    !Array.isArray(value.categories) ||
    !Array.isArray(value.products)
  ) {
    throw new Error("Catalog JSON must include categories and products arrays");
  }

  const categories = parseCategorySeedData(value);
  const categoryIds = new Set(categories.map(({ sourceId }) => sourceId));

  const productIds = new Set<number>();
  const products: ProductSeed[] = [];
  for (const product of value.products) {
    if (
      !isRecord(product) ||
      !isInteger(product.id) ||
      product.id < 1 ||
      !isInteger(product.categoryId) ||
      product.categoryId < 1 ||
      typeof product.sku !== "string" ||
      typeof product.name !== "string" ||
      typeof product.slug !== "string" ||
      typeof product.brand !== "string" ||
      typeof product.description !== "string" ||
      typeof product.shortDescription !== "string" ||
      !isFiniteNumber(product.price) ||
      !isFiniteNumber(product.originalPrice) ||
      typeof product.currency !== "string" ||
      !isInteger(product.stock) ||
      product.stock < 0 ||
      typeof product.availability !== "string" ||
      !isFiniteNumber(product.rating) ||
      !isInteger(product.reviewCount) ||
      product.reviewCount < 0 ||
      !isStringArray(product.images) ||
      !isStringRecord(product.specifications) ||
      !isStringArray(product.tags) ||
      typeof product.isActive !== "boolean" ||
      typeof product.featured !== "boolean"
    ) {
      throw new Error("Catalog JSON contains an invalid product record");
    }
    if (!categoryIds.has(product.categoryId)) {
      throw new Error(
        `Product ${String(product.id)} references missing category ${String(product.categoryId)}`,
      );
    }
    if (productIds.has(product.id)) {
      throw new Error(`Duplicate product id: ${String(product.id)}`);
    }
    productIds.add(product.id);
    products.push({
      id: product.id,
      sku: product.sku,
      categorySourceId: product.categoryId,
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
      images: product.images,
      specifications: product.specifications,
      tags: product.tags,
      isActive: product.isActive,
      featured: product.featured,
    });
  }

  return { categories, products };
}

export function parseCategorySeedData(value: unknown): CategorySeed[] {
  if (!isRecord(value) || !Array.isArray(value.categories)) {
    throw new Error('Catalog JSON "categories" key must be an array');
  }

  const categoryIds = new Set<number>();
  const categories: CategorySeed[] = [];
  for (const category of value.categories) {
    if (
      !isRecord(category) ||
      !isInteger(category.id) ||
      category.id < 1 ||
      (category.parent !== undefined &&
        (!isInteger(category.parent) || category.parent < 0)) ||
      typeof category.name !== "string" ||
      typeof category.slug !== "string" ||
      typeof category.description !== "string" ||
      typeof category.image !== "string" ||
      typeof category.isActive !== "boolean"
    ) {
      throw new Error("Catalog JSON contains an invalid category record");
    }
    if (categoryIds.has(category.id)) {
      throw new Error(`Duplicate category id: ${String(category.id)}`);
    }
    categoryIds.add(category.id);
    categories.push({
      sourceId: category.id,
      parent: isInteger(category.parent) ? category.parent : 0,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
    });
  }

  for (const category of categories) {
    if (category.parent !== 0 && !categoryIds.has(category.parent)) {
      throw new Error(
        `Category ${category.sourceId} references missing parent ${category.parent}`,
      );
    }
  }

  return categories;
}
