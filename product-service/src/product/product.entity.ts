import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Category } from "../category/category.entity.js";

const decimalNumberTransformer = {
  to: (value: number): number => value,
  from: (value: string | number): number => Number(value),
};

@Entity("products")
@Index("IDX_products_category_active", ["categoryId", "isActive"])
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", unique: true })
  sourceId: number;

  @Column({ type: "varchar", length: 32, unique: true })
  sku: string;

  @Column({ type: "varchar", length: 36 })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "categoryId" })
  category: Relation<Category>;

  @Column({ type: "varchar", length: 200 })
  name: string;

  @Column({ type: "varchar", length: 220, unique: true })
  slug: string;

  @Column({ type: "varchar", length: 120 })
  brand: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "varchar", length: 255 })
  shortDescription: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalNumberTransformer,
  })
  price: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalNumberTransformer,
  })
  originalPrice: number;

  @Column({ type: "varchar", length: 3 })
  currency: string;

  @Column({ type: "int", unsigned: true })
  stock: number;

  @Column({ type: "varchar", length: 30 })
  availability: string;

  @Column({
    type: "decimal",
    precision: 3,
    scale: 2,
    transformer: decimalNumberTransformer,
  })
  rating: number;

  @Column({ type: "int", unsigned: true })
  reviewCount: number;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: Relation<ProductImage[]>;

  @OneToMany(
    () => ProductSpecification,
    (specification) => specification.product,
    { cascade: true },
  )
  specifications: Relation<ProductSpecification[]>;

  @OneToMany(() => ProductTag, (tag) => tag.product, { cascade: true })
  tags: Relation<ProductTag[]>;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "boolean", default: false })
  featured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity("product_images")
@Index("IDX_product_images_product_position", ["productId", "position"])
export class ProductImage {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id: string;

  @Column({ type: "varchar", length: 36 })
  productId: string;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product: Relation<Product>;

  @Column({ type: "varchar", length: 500 })
  url: string;

  @Column({ type: "int", unsigned: true })
  position: number;
}

@Entity("product_specifications")
@Index("UQ_product_specifications_product_name", ["productId", "name"], {
  unique: true,
})
export class ProductSpecification {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id: string;

  @Column({ type: "varchar", length: 36 })
  productId: string;

  @ManyToOne(() => Product, (product) => product.specifications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product: Relation<Product>;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "text" })
  value: string;
}

@Entity("product_tags")
@Index("UQ_product_tags_product_name", ["productId", "name"], { unique: true })
export class ProductTag {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id: string;

  @Column({ type: "varchar", length: 36 })
  productId: string;

  @ManyToOne(() => Product, (product) => product.tags, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product: Relation<Product>;

  @Column({ type: "varchar", length: 120 })
  name: string;
}
