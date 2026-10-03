import { MigrationInterface, QueryRunner } from 'typeorm';

/** Pantallazo opcional en una sugerencia («Sugerencias»): el id de la imagen en media_files. */
export class AddCapturaReporte1791300000000 implements MigrationInterface {
  name = 'AddCapturaReporte1791300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `reportes` ADD `capturaId` varchar(36) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `reportes` DROP COLUMN `capturaId`');
  }
}
