import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException } from "@nestjs/common";
import { CategoryController } from "../dist/category/category.controller.js";

test("uses default pagination values for the category list", () => {
  const calls = [];
  const controller = new CategoryController({
    getCategories: (...args) => calls.push(args),
  });

  controller.getCategories();

  assert.deepEqual(calls, [[1, 10]]);
});

test("passes valid pagination query values to the category service", () => {
  const calls = [];
  const controller = new CategoryController({
    getCategories: (...args) => calls.push(args),
  });

  controller.getCategories("2", "25");

  assert.deepEqual(calls, [[2, 25]]);
});

test("rejects invalid page and limit values", () => {
  const controller = new CategoryController({ getCategories: () => [] });

  assert.throws(() => controller.getCategories("0"), BadRequestException);
  assert.throws(() => controller.getCategories("1", "101"), BadRequestException);
});
