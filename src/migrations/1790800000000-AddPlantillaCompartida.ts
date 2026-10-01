import { MigrationInterface, QueryRunner } from 'typeorm';

/** Un docente puede compartir el contenido de su clase como plantilla para que otros docentes lo copien. */
export class AddPlantillaCompartida1790800000000 implements MigrationInterface {
  name = 'AddPlantillaCompartida1790800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` ADD `compartidaComoPlantilla` tinyint NOT NULL DEFAULT 0');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `compartidaComoPlantilla`');
  }
}
