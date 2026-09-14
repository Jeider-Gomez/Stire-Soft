import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveSubmissionConstraint1789100000000 implements MigrationInterface {
  name = 'AddActiveSubmissionConstraint1789100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // NULL permite múltiples intentos finalizados; 1 solo permite un IN_PROGRESS.
    await queryRunner.query(
      "ALTER TABLE `submissions` ADD `activeAttemptKey` tinyint GENERATED ALWAYS AS (CASE WHEN `status` = 'in_progress' THEN 1 ELSE NULL END) STORED",
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_submissions_active_attempt` ON `submissions` (`studentId`, `activityId`, `activeAttemptKey`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `UQ_submissions_active_attempt` ON `submissions`');
    await queryRunner.query('ALTER TABLE `submissions` DROP COLUMN `activeAttemptKey`');
  }
}
