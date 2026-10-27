import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Category } from "../category/category.entity.js";
import {
  Product,
  ProductImage,
  ProductSpecification,
  ProductTag,
} from "../product/product.entity.js";
import { CreateCategories1730000000000 } from "./migrations/1730000000000-create-categories.js";
import { CreateProducts1730000001000 } from "./migrations/1730000001000-create-products.js";
import { CreateProductDetails1730000002000 } from "./migrations/1730000002000-create-product-details.js";
import { ConvertProductIdsToUuids1730000003000 } from "./migrations/1730000003000-convert-product-ids-to-uuids.js";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.DB_PORT ?? 3306);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT must be an integer between 1 and 65535");
}

export const dataSource = new DataSource({
  type: "mysql",
  host: requiredEnv("DB_HOST"),
  port,
  username: requiredEnv("DB_USERNAME"),
  password: requiredEnv("DB_PASSWORD"),
  database: requiredEnv("DB_DATABASE"),
  entities: [Category, Product, ProductImage, ProductSpecification, ProductTag],
  migrations: [
    CreateCategories1730000000000,
    CreateProducts1730000001000,
    CreateProductDetails1730000002000,
    ConvertProductIdsToUuids1730000003000,
  ],
  synchronize: false,
});
