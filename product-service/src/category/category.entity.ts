import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Product } from "../product/product.entity.js";

@Entity("categories")
@Index("UQ_categories_source_id", ["sourceId"], { unique: true })
export class Category {
  @PrimaryColumn({ type: "varchar", length: 36 })
  id: string;

  @Column({ type: "int" })
  sourceId: number;

  @Column({ type: "varchar", length: 36, nullable: true })
  parentId: string | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "parentId" })
  parent: Relation<Category> | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Relation<Category[]>;

  @Column({ type: "varchar", length: 120, unique: true })
  name: string;

  @Column({ type: "varchar", length: 150, unique: true })
  slug: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "varchar", length: 500 })
  image: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products: Relation<Product[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
