import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UseUserIdAsUserProfilePrimaryKey1720000000000 implements MigrationInterface {
  name = 'UseUserIdAsUserProfilePrimaryKey1720000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_profiles` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `user_profiles` DROP INDEX `UQ_user_profiles_userId`',
    );
    await queryRunner.query('ALTER TABLE `user_profiles` DROP COLUMN `id`');
    await queryRunner.query(
      'ALTER TABLE `user_profiles` ADD PRIMARY KEY (`userId`)',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_profiles` ADD COLUMN `id` varchar(36) NULL FIRST',
    );
    await queryRunner.query(
      'UPDATE `user_profiles` SET `id` = UUID() WHERE `id` IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `user_profiles` MODIFY COLUMN `id` varchar(36) NOT NULL',
    );
    await queryRunner.query('ALTER TABLE `user_profiles` DROP PRIMARY KEY');
    await queryRunner.query(
      'ALTER TABLE `user_profiles` ADD PRIMARY KEY (`id`)',
    );
    await queryRunner.query(
      'ALTER TABLE `user_profiles` ADD UNIQUE KEY `UQ_user_profiles_userId` (`userId`)',
    );
  }
}
