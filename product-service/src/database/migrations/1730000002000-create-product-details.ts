import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductDetails1730000002000 implements MigrationInterface {
  name = "CreateProductDetails1730000002000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`product_images\` (
        \`id\` varchar(36) NOT NULL,
        \`productId\` int NOT NULL,
        \`url\` varchar(500) NOT NULL,
        \`position\` int unsigned NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_product_images_product_position\` (\`productId\`, \`position\`),
        CONSTRAINT \`FK_product_images_product\` FOREIGN KEY (\`productId\`)
          REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE \`product_specifications\` (
        \`id\` varchar(36) NOT NULL,
        \`productId\` int NOT NULL,
        \`name\` varchar(150) NOT NULL,
        \`value\` text NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_product_specifications_product_name\` (\`productId\`, \`name\`),
        CONSTRAINT \`FK_product_specifications_product\` FOREIGN KEY (\`productId\`)
          REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    await queryRunner.query(`
      CREATE TABLE \`product_tags\` (
        \`id\` varchar(36) NOT NULL,
        \`productId\` int NOT NULL,
        \`name\` varchar(120) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_product_tags_product_name\` (\`productId\`, \`name\`),
        CONSTRAINT \`FK_product_tags_product\` FOREIGN KEY (\`productId\`)
          REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE `product_tags`");
    await queryRunner.query("DROP TABLE `product_specifications`");
    await queryRunner.query("DROP TABLE `product_images`");
  }
}
