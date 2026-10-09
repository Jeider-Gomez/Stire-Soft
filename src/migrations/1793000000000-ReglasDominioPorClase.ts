import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Reglas del dominio que el docente ajusta por clase (09/10; docs/DISENO_DOMINIO.md §6): cada cuántas horas se reabre un
 * intento de un ejercicio con el límite usado (nunca «cerrado para siempre») y si los niveles altos pesan más.
 */
export class ReglasDominioPorClase1793000000000 implements MigrationInterface {
  name = 'ReglasDominioPorClase1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` ADD `horasParaReabrir` int NOT NULL DEFAULT 24');
    await queryRunner.query('ALTER TABLE `classes` ADD `nivelesPesanDistinto` tinyint NOT NULL DEFAULT 0');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `nivelesPesanDistinto`');
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `horasParaReabrir`');
  }
}
