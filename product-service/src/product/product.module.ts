import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductController } from "./product.controller.js";
import {
  Product,
  ProductImage,
  ProductSpecification,
  ProductTag,
} from "./product.entity.js";
import { ProductService } from "./product.service.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      ProductSpecification,
      ProductTag,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
