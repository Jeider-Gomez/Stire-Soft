import { MigrationInterface, QueryRunner } from 'typeorm';

/** Notas sin porcentajes (promedio simple) además de con porcentajes (docs/DISENO_INTERVENCION_DOCENTE.md §6). */
export class AddUsarPesos1790700000000 implements MigrationInterface {
  name = 'AddUsarPesos1790700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `esquemas_calificacion` ADD `usarPesos` tinyint NOT NULL DEFAULT 1');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `esquemas_calificacion` DROP COLUMN `usarPesos`');
  }
}
