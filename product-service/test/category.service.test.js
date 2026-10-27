import assert from "node:assert/strict";
import test from "node:test";
import { CategoryService } from "../dist/category/category.service.js";

test("returns active categories with the root parent represented as zero", async () => {
  const categories = [
    {
      id: "a1b2c3d4-e5f6-47a8-9abc-def012345678",
      parentId: null,
      name: "Electronics",
      slug: "electronics",
      description: "Electronics",
      image: "https://example.com/electronics.png",
      isActive: true,
    },
  ];
  const repository = {
    find: async (options) => {
      assert.deepEqual(options, {
        where: { isActive: true },
        order: { name: "ASC" },
      });
      return categories;
    },
  };
  const service = new CategoryService(repository);

  assert.deepEqual(await service.getCategories(), [
    {
      id: categories[0].id,
      parent: 0,
      name: "Electronics",
      slug: "electronics",
      description: "Electronics",
      image: "https://example.com/electronics.png",
      isActive: true,
    },
  ]);
});
