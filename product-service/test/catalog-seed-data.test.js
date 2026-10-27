import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseCatalogSeed } from "../dist/database/seeders/catalog-seed-data.js";

test("parses the root product catalog and preserves its category references", async () => {
  const raw = await readFile("../product.json", "utf8");
  const catalog = parseCatalogSeed(JSON.parse(raw));

  assert.equal(catalog.categories.length, 20);
  assert.equal(catalog.products.length, 500);
  assert.ok(catalog.categories.every((category) => category.parent === 0));
  assert.ok(
    catalog.products.every((product) =>
      catalog.categories.some(
        (category) => category.sourceId === product.categorySourceId,
      ),
    ),
  );
  assert.deepEqual(catalog.products[0].images, [
    "https://placehold.co/800x800?text=Product+1+Front",
    "https://placehold.co/800x800?text=Product+1+Detail",
  ]);
  assert.equal(catalog.products[0].specifications.model, "ELE-0001");
  assert.ok(catalog.products[0].tags.includes("earbuds"));
});

test("rejects products referencing an unknown source category", () => {
  assert.throws(
    () =>
      parseCatalogSeed({
        categories: [],
        products: [
          {
            id: 1,
            categoryId: 7,
            sku: "PRD-1",
            name: "Test",
            slug: "test",
            brand: "Test",
            description: "Test",
            shortDescription: "Test",
            price: 1,
            originalPrice: 1,
            currency: "INR",
            stock: 1,
            availability: "in_stock",
            rating: 4,
            reviewCount: 0,
            images: [],
            specifications: {},
            tags: [],
            isActive: true,
            featured: false,
          },
        ],
      }),
    /references missing category 7/,
  );
});
