import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseCategorySeedData } from "../dist/database/seeders/catalog-seed-data.js";

test("reads only categories from the specified root product.json file", async () => {
  const file = await readFile(
    "/Volumes/Work/Nest js projects/product.json",
    "utf8",
  );
  const categories = parseCategorySeedData(JSON.parse(file));

  assert.equal(categories.length, 20);
  assert.deepEqual(categories[0], {
    sourceId: 1,
    parent: 0,
    name: "Electronics",
    slug: "electronics",
    description: "Shop electronics products, essentials, and accessories.",
    image: "https://placehold.co/800x600?text=electronics",
    isActive: true,
  });
});
