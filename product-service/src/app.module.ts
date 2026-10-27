import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryModule } from "./category/category.module.js";
import { Category } from "./category/category.entity.js";
import { ProductModule } from "./product/product.module.js";
import {
  Product,
  ProductImage,
  ProductSpecification,
  ProductTag,
} from "./product/product.entity.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "mysql" as const,
        host: config.getOrThrow<string>("DB_HOST"),
        port: Number(config.get("DB_PORT") ?? 3306),
        username: config.getOrThrow<string>("DB_USERNAME"),
        password: config.getOrThrow<string>("DB_PASSWORD"),
        database: config.getOrThrow<string>("DB_DATABASE"),
        entities: [
          Category,
          Product,
          ProductImage,
          ProductSpecification,
          ProductTag,
        ],
        synchronize: false,
      }),
    }),
    CategoryModule,
    ProductModule,
  ],
})
export class AppModule {}
