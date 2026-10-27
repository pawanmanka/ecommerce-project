import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { dataSource } from "./data-source.js";
import {
  parseCatalogSeed,
  type CatalogSeed,
} from "./seeders/catalog-seed-data.js";
import { seedCategories } from "./seeders/category.seeder.js";
import { seedProducts } from "./seeders/product.seeder.js";

async function readCatalogSeed(): Promise<CatalogSeed> {
  const catalogPath = resolve(
    process.env.PRODUCT_CATALOG_FILE ?? "../product.json",
  );
  const fileContents = await readFile(catalogPath, "utf8");
  const catalog = parseCatalogSeed(JSON.parse(fileContents) as unknown);
  console.info(`Loaded catalog seed data from ${catalogPath}.`);
  return catalog;
}

const catalog = await readCatalogSeed();
await dataSource.initialize();
try {
  await dataSource.transaction(async (manager) => {
    const categoryIds = await seedCategories(manager, catalog.categories);
    await seedProducts(manager, catalog.products, categoryIds);
  });
  console.info(
    `Seeded ${catalog.categories.length} categories and ${catalog.products.length} products.`,
  );
} finally {
  await dataSource.destroy();
}
