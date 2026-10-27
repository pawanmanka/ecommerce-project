import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategories1730000000000 implements MigrationInterface {
  name = "CreateCategories1730000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`categories\` (
        \`id\` varchar(36) NOT NULL,
        \`sourceId\` int NOT NULL,
        \`parentId\` varchar(36) NULL,
        \`name\` varchar(120) NOT NULL,
        \`slug\` varchar(150) NOT NULL,
        \`description\` text NOT NULL,
        \`image\` varchar(500) NOT NULL,
        \`isActive\` tinyint NOT NULL DEFAULT 1,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
          ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_categories_source_id\` (\`sourceId\`),
        UNIQUE KEY \`UQ_categories_name\` (\`name\`),
        UNIQUE KEY \`UQ_categories_slug\` (\`slug\`),
        KEY \`IDX_categories_parent\` (\`parentId\`),
        CONSTRAINT \`FK_categories_parent\` FOREIGN KEY (\`parentId\`)
          REFERENCES \`categories\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE `categories`");
  }
}
