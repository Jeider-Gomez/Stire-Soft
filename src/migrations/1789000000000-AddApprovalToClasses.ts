import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddApprovalToClasses1789000000000 implements MigrationInterface {
  name = 'AddApprovalToClasses1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `classes` ADD `requiresApproval` tinyint NOT NULL DEFAULT '0'",
    );
    await queryRunner.query(
      "ALTER TABLE `enrollments` MODIFY `status` enum ('active','inactive','withdrawn','completed','pending') NOT NULL DEFAULT 'active'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `enrollments` MODIFY `status` enum ('active','inactive','withdrawn','completed') NOT NULL DEFAULT 'active'",
    );
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `requiresApproval`');
  }
}
