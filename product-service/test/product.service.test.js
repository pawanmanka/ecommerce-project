import assert from "node:assert/strict";
import test from "node:test";
import { Brackets } from "typeorm";
import { ProductService } from "../dist/product/product.service.js";

function createService() {
  const queryBuilder = {
    calls: [],
    leftJoinAndSelect(...args) {
      this.calls.push(["leftJoinAndSelect", ...args]);
      return this;
    },
    where(...args) {
      this.calls.push(["where", ...args]);
      return this;
    },
    andWhere(...args) {
      this.calls.push(["andWhere", ...args]);
      return this;
    },
    distinct(...args) {
      this.calls.push(["distinct", ...args]);
      return this;
    },
    orderBy(...args) {
      this.calls.push(["orderBy", ...args]);
      return this;
    },
    getMany: async () => [],
    getOne: async () => null,
  };
  const repository = { createQueryBuilder: () => queryBuilder };
  return { service: new ProductService(repository), queryBuilder };
}

test("filters active products by category UUID and keyword", async () => {
  const { service, queryBuilder } = createService();
  const resultRows = [
    {
      id: "a1b2c3d4-e5f6-47a8-9abc-def012345678",
      sku: "PRD-00001",
      categoryId: "a1b2c3d4-e5f6-47a8-9abc-def012345678",
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
      images: [
        { url: "second-image", position: 1 },
        { url: "first-image", position: 0 },
      ],
      specifications: [{ name: "model", value: "ELE-0001" }],
      tags: [{ name: "earbuds" }],
      isActive: true,
      featured: true,
    },
  ];
  queryBuilder.getMany = async () => resultRows;

  const products = await service.getProducts({
    categoryId: resultRows[0].categoryId,
    search: "earbuds",
  });

  assert.equal(products[0].id, resultRows[0].id);
  assert.equal(products[0].categoryId, resultRows[0].categoryId);
  assert.deepEqual(products[0].images, ["first-image", "second-image"]);
  assert.deepEqual(products[0].specifications, { model: "ELE-0001" });
  assert.deepEqual(products[0].tags, ["earbuds"]);
  assert.deepEqual(
    queryBuilder.calls.find(
      ([method, condition]) =>
        method === "andWhere" &&
        condition === "product.categoryId = :categoryId",
    ),
    [
      "andWhere",
      "product.categoryId = :categoryId",
      { categoryId: resultRows[0].categoryId },
    ],
  );
  assert.ok(
    queryBuilder.calls.some(
      ([method, condition]) =>
        method === "andWhere" && condition instanceof Brackets,
    ),
  );
});
