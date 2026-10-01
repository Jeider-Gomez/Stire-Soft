import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Notas a la manera del docente (docs/DISENO_INTERVENCION_DOCENTE.md §6): cómo se calcula la final (porcentajes,
 * promedio o ninguna) y la nota de cada módulo. Los esquemas que ya existían usaban porcentajes.
 */
export class AddCalculoDeNotas1790700000000 implements MigrationInterface {
  name = 'AddCalculoDeNotas1790700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `esquemas_calificacion` ADD `calculo` varchar(12) NOT NULL DEFAULT 'porcentajes'");
    await queryRunner.query('ALTER TABLE `esquemas_calificacion` ADD `grupos` json NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `esquemas_calificacion` DROP COLUMN `grupos`');
    await queryRunner.query('ALTER TABLE `esquemas_calificacion` DROP COLUMN `calculo`');
  }
}
