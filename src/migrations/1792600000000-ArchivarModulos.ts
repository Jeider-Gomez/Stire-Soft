import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fase 30: el docente puede archivar un módulo (guardar todo sin que el estudiante lo vea) y restaurarlo. Los temas y las
 * lecciones ya tenían `isActive`; los módulos solo tenían `isPublished`. Todos los módulos existentes quedan activos.
 */
export class ArchivarModulos1792600000000 implements MigrationInterface {
  name = 'ArchivarModulos1792600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sections` ADD `isActive` tinyint NOT NULL DEFAULT 1');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `sections` DROP COLUMN `isActive`');
  }
}
