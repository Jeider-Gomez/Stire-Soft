import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * El docente decide si su clase usa logros y medallas, y cuáles categorías (docs/DISENO_LOGROS.md §6). Por defecto,
 * activados con todas las categorías: no tiene que configurar nada. `categoriasLogro` vacío = todas.
 */
export class ConfigLogrosClase1792100000000 implements MigrationInterface {
  name = 'ConfigLogrosClase1792100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` ADD `logrosActivos` tinyint NOT NULL DEFAULT 1, ADD `categoriasLogro` varchar(120) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `categoriasLogro`, DROP COLUMN `logrosActivos`');
  }
}
