import { MigrationInterface, QueryRunner } from 'typeorm';

/** Un módulo puede quedar siempre abierto, sin esperar el dominio del anterior (src/section/entities/section.entity.ts). */
export class ModuloAbiertoSiempre1793700000000 implements MigrationInterface {
  name = 'ModuloAbiertoSiempre1793700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sections` ADD `abiertoSiempre` tinyint NOT NULL DEFAULT 0');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sections` DROP COLUMN `abiertoSiempre`');
  }
}
