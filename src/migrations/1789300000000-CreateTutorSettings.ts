import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTutorSettings1789300000000 implements MigrationInterface {
  name = 'CreateTutorSettings1789300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `tutor_settings` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        '`deletedAt` timestamp(6) NULL, ' +
        '`scopeType` varchar(20) NOT NULL, ' +
        '`scopeId` int NOT NULL, ' +
        '`enabled` tinyint(1) NULL, ' +
        '`maxGuideLevel` tinyint NULL, ' +
        '`style` varchar(20) NULL, ' +
        'UNIQUE INDEX `IDX_tutor_settings_scope` (`scopeType`, `scopeId`), ' +
        'PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `IDX_tutor_settings_scope` ON `tutor_settings`');
    await queryRunner.query('DROP TABLE `tutor_settings`');
  }
}
