import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProducts1730000001000 implements MigrationInterface {
  name = "CreateProducts1730000001000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`products\` (
        \`id\` int NOT NULL,
        \`sku\` varchar(32) NOT NULL,
        \`categoryId\` varchar(36) NOT NULL,
        \`name\` varchar(200) NOT NULL,
        \`slug\` varchar(220) NOT NULL,
        \`brand\` varchar(120) NOT NULL,
        \`description\` text NOT NULL,
        \`shortDescription\` varchar(255) NOT NULL,
        \`price\` decimal(10,2) NOT NULL,
        \`originalPrice\` decimal(10,2) NOT NULL,
        \`currency\` varchar(3) NOT NULL,
        \`stock\` int unsigned NOT NULL,
        \`availability\` varchar(30) NOT NULL,
        \`rating\` decimal(3,2) NOT NULL,
        \`reviewCount\` int unsigned NOT NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`featured\` tinyint NOT NULL DEFAULT 0,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
          ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_products_sku\` (\`sku\`),
        UNIQUE KEY \`UQ_products_slug\` (\`slug\`),
        KEY \`IDX_products_category_active\` (\`categoryId\`, \`isActive\`),
        CONSTRAINT \`FK_products_category\` FOREIGN KEY (\`categoryId\`)
          REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE `products`");
  }
}
