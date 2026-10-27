import { MigrationInterface, QueryRunner } from 'typeorm';

/** Cuándo se corrigió un aviso ya publicado (src/avisos-clase): el estudiante ve «editado». */
export class AvisoEditado1793600000000 implements MigrationInterface {
  name = 'AvisoEditado1793600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `avisos_clase` ADD `editadoEn` timestamp NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `avisos_clase` DROP COLUMN `editadoEn`');
  }
}
