import { MigrationInterface, QueryRunner } from 'typeorm';

/** Cuándo ve el estudiante cada explicación (src/content/explicaciones-alternativas.ts); las de siempre quedan igual. */
export class ExplicacionesAlternativas1793800000000 implements MigrationInterface {
  name = 'ExplicacionesAlternativas1793800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `contents` ADD `cuando` varchar(10) NOT NULL DEFAULT 'siempre'");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `contents` DROP COLUMN `cuando`');
  }
}
