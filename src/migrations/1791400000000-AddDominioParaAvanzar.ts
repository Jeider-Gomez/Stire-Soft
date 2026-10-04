import { MigrationInterface, QueryRunner } from 'typeorm';

/** Bloqueo suave por módulo: dominio (%) del módulo anterior para abrir el siguiente; 0 = sin bloqueo. */
export class AddDominioParaAvanzar1791400000000 implements MigrationInterface {
  name = 'AddDominioParaAvanzar1791400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` ADD `dominioParaAvanzar` int NOT NULL DEFAULT 50');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `dominioParaAvanzar`');
  }
}
