import assert from "node:assert/strict";
import test from "node:test";
import { CategoryService } from "../dist/category/category.service.js";

test("returns a page of active categories with pagination metadata", async () => {
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
    findAndCount: async (options) => {
      assert.deepEqual(options, {
        where: { isActive: true },
        order: { name: "ASC" },
        skip: 10,
        take: 10,
      });
      return [categories, 21];
    },
  };
  const service = new CategoryService(repository);

  assert.deepEqual(await service.getCategories(2, 10), {
    data: [
      {
        id: categories[0].id,
        parent: 0,
        name: "Electronics",
        slug: "electronics",
        description: "Electronics",
        image: "https://example.com/electronics.png",
        isActive: true,
      },
    ],
    pagination: {
      page: 2,
      limit: 10,
      total: 21,
      totalPages: 3,
    },
  });
});
