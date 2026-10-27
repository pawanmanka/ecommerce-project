import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Category } from "../dist/category/category.entity.js";
import {
  Product,
  ProductImage,
  ProductSpecification,
  ProductTag,
} from "../dist/product/product.entity.js";
import { seedCategories } from "../dist/database/seeders/category.seeder.js";
import { seedProducts } from "../dist/database/seeders/product.seeder.js";

test("category seeder creates UUIDs and returns the source ID map", async () => {
  const sourceCategory = {
    sourceId: 1,
    parent: 0,
    name: "Electronics",
    slug: "electronics",
    description: "Electronics",
    image: "https://example.com/electronics.png",
    isActive: true,
  };
  let savedCategory;
  const manager = {
    getRepository(entity) {
      assert.equal(entity, Category);
      return {
        findBy: async () => [],
        save: async (rows) => {
          [savedCategory] = rows;
          return rows;
        },
        update: async () => {},
      };
    },
  };

  const categoryIds = await seedCategories(manager, [sourceCategory]);
  assert.match(savedCategory.id, /^[0-9a-f-]{36}$/i);
  assert.equal(savedCategory.parentId, null);
  assert.equal(categoryIds.get(sourceCategory.sourceId), savedCategory.id);
});

test("product seeder resolves category UUID and persists normalized details", async () => {
  const categoryUuid = "a1b2c3d4-e5f6-47a8-9abc-def012345678";
  const product = {
    id: 1,
    sku: "PRD-00001",
    categorySourceId: 1,
    name: "Nova Wireless Earbuds Classic",
    slug: "earbuds",
    brand: "Nova",
    description: "Wireless earbuds",
    shortDescription: "Earbuds",
    price: 336.99,
    originalPrice: 370.69,
    currency: "INR",
    stock: 7,
    availability: "in_stock",
    rating: 4.2,
    reviewCount: 17,
    images: ["front.png", "detail.png"],
    specifications: { model: "ELE-0001" },
    tags: ["electronics", "earbuds"],
    isActive: true,
    featured: true,
  };
  const saved = new Map();
  const deleted = [];
  const savedProductsBySourceId = new Map();
  let submittedProductRows;
  const manager = {
    getRepository(entity) {
      return {
        findBy: async () =>
          entity === Product ? [...savedProductsBySourceId.values()] : [],
        save: async (rows) => {
          if (entity === Product) {
            submittedProductRows = rows;
            const persistedRows = rows.map((row) => ({
              ...row,
              id: row.id ?? randomUUID(),
            }));
            saved.set(entity, persistedRows);
            for (const row of persistedRows) {
              savedProductsBySourceId.set(row.sourceId, row);
            }
            return persistedRows;
          }
          saved.set(entity, rows);
          return rows;
        },
        delete: async (criteria) => {
          deleted.push([entity, criteria]);
        },
      };
    },
  };

  await seedProducts(manager, [product], new Map([[1, categoryUuid]]));

  const productUuid = saved.get(Product)[0].id;
  assert.match(productUuid, /^[0-9a-f-]{36}$/i);
  assert.equal(Object.hasOwn(submittedProductRows[0], "id"), false);
  assert.equal(saved.get(Product)[0].sourceId, product.id);
  assert.equal(saved.get(Product)[0].categoryId, categoryUuid);
  assert.ok(
    [...saved.get(ProductImage), ...saved.get(ProductSpecification), ...saved.get(ProductTag)]
      .every(({ productId }) => productId === productUuid),
  );
  assert.deepEqual(
    saved.get(ProductImage).map(({ url, position }) => [url, position]),
    [
      ["front.png", 0],
      ["detail.png", 1],
    ],
  );
  assert.deepEqual(
    saved.get(ProductSpecification).map(({ name, value }) => [name, value]),
    [["model", "ELE-0001"]],
  );
  assert.deepEqual(
    saved.get(ProductTag).map(({ name }) => name),
    ["electronics", "earbuds"],
  );
  assert.equal(deleted.length, 3);

  const firstProductUuid = productUuid;
  await seedProducts(manager, [product], new Map([[1, categoryUuid]]));
  assert.equal(saved.get(Product)[0].id, firstProductUuid);
  assert.equal(submittedProductRows[0].id, firstProductUuid);
});
