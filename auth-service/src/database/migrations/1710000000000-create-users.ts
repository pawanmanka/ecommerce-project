import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1710000000000 implements MigrationInterface {
  name = "CreateUsers1710000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(254) NOT NULL,
        \`passwordHash\` varchar(255) NOT NULL,
        \`resetPasswordTokenHash\` char(64) DEFAULT NULL,
        \`resetPasswordExpiresAt\` datetime DEFAULT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
          ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_users_email\` (\`email\`)
      ) ENGINE=InnoDB
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE `users`");
  }
}
