import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { dataSource } from "./data-source.js";
import { parseCategorySeedData } from "./seeders/catalog-seed-data.js";
import { seedCategories } from "./seeders/category.seeder.js";

const catalogPath = resolve(
  process.env.PRODUCT_CATALOG_FILE ??
    "/Volumes/Work/Nest js projects/product.json",
);
const catalogData: unknown = JSON.parse(await readFile(catalogPath, "utf8"));
const categories = parseCategorySeedData(catalogData);

await dataSource.initialize();
try {
  await dataSource.transaction(async (manager) => {
    await seedCategories(manager, categories);
  });
  console.info(`Seeded ${categories.length} categories from ${catalogPath}.`);
} finally {
  await dataSource.destroy();
}
