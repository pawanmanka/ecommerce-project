import type { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertProductIdsToUuids1730000003000
  implements MigrationInterface
{
  name = "ConvertProductIdsToUuids1730000003000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `product_images` DROP FOREIGN KEY `FK_product_images_product`",
    );
    await queryRunner.query(
      "ALTER TABLE `product_specifications` DROP FOREIGN KEY `FK_product_specifications_product`",
    );
    await queryRunner.query(
      "ALTER TABLE `product_tags` DROP FOREIGN KEY `FK_product_tags_product`",
    );
    await queryRunner.query(
      "ALTER TABLE `products` ADD COLUMN `sourceId` int NULL",
    );
    await queryRunner.query(
      "UPDATE `products` SET `sourceId` = `id`",
    );
    await queryRunner.query(
      "ALTER TABLE `products` MODIFY `sourceId` int NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `products` ADD UNIQUE KEY `UQ_products_source_id` (`sourceId`)",
    );
    await queryRunner.query(
      "CREATE TEMPORARY TABLE `product_id_map` (`sourceId` int NOT NULL PRIMARY KEY, `uuid` varchar(36) NOT NULL)",
    );
    await queryRunner.query(
      "INSERT INTO `product_id_map` (`sourceId`, `uuid`) SELECT `sourceId`, UUID() FROM `products`",
    );
    await queryRunner.query(
      "ALTER TABLE `products` MODIFY `id` varchar(36) NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `product_images` MODIFY `productId` varchar(36) NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `product_specifications` MODIFY `productId` varchar(36) NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `product_tags` MODIFY `productId` varchar(36) NOT NULL",
    );
    await queryRunner.query(`
      UPDATE \`products\` p
      JOIN \`product_id_map\` idMap ON idMap.\`sourceId\` = p.\`sourceId\`
      SET p.\`id\` = idMap.\`uuid\`
    `);
    for (const table of [
      "product_images",
      "product_specifications",
      "product_tags",
    ]) {
      await queryRunner.query(`
        UPDATE \`${table}\` detail
        JOIN \`products\` p ON p.\`sourceId\` = CAST(detail.\`productId\` AS UNSIGNED)
        SET detail.\`productId\` = p.\`id\`
      `);
    }
    await queryRunner.query("DROP TEMPORARY TABLE `product_id_map`");
    await queryRunner.query(`
      ALTER TABLE \`product_images\`
      ADD CONSTRAINT \`FK_product_images_product\` FOREIGN KEY (\`productId\`)
        REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE \`product_specifications\`
      ADD CONSTRAINT \`FK_product_specifications_product\` FOREIGN KEY (\`productId\`)
        REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE \`product_tags\`
      ADD CONSTRAINT \`FK_product_tags_product\` FOREIGN KEY (\`productId\`)
        REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `product_images` DROP FOREIGN KEY `FK_product_images_product`",
    );
    await queryRunner.query(
      "ALTER TABLE `product_specifications` DROP FOREIGN KEY `FK_product_specifications_product`",
    );
    await queryRunner.query(
      "ALTER TABLE `product_tags` DROP FOREIGN KEY `FK_product_tags_product`",
    );
    for (const table of [
      "product_images",
      "product_specifications",
      "product_tags",
    ]) {
      await queryRunner.query(`
        UPDATE \`${table}\` detail
        JOIN \`products\` p ON detail.\`productId\` = p.\`id\`
        SET detail.\`productId\` = p.\`sourceId\`
      `);
      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY \`productId\` int NOT NULL`,
      );
    }
    await queryRunner.query(
      "UPDATE `products` SET `id` = CAST(`sourceId` AS CHAR)",
    );
    await queryRunner.query(
      "ALTER TABLE `products` MODIFY `id` int NOT NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `products` DROP INDEX `UQ_products_source_id`, DROP COLUMN `sourceId`",
    );
    await queryRunner.query(`
      ALTER TABLE \`product_images\`
      ADD CONSTRAINT \`FK_product_images_product\` FOREIGN KEY (\`productId\`)
        REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE \`product_specifications\`
      ADD CONSTRAINT \`FK_product_specifications_product\` FOREIGN KEY (\`productId\`)
        REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE \`product_tags\`
      ADD CONSTRAINT \`FK_product_tags_product\` FOREIGN KEY (\`productId\`)
        REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
    `);
  }
}
