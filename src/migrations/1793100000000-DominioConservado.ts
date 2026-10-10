import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Dominio conservado al cambiar las reglas del dominio (10/10): el valor que el estudiante ya tenía en una lección donde
 * el cálculo nuevo da menos. Lo llena src/scripts/recalcular-dominio.ts; null en las demás lecciones.
 */
export class DominioConservado1793100000000 implements MigrationInterface {
  name = 'DominioConservado1793100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `learning_progress` ADD `dominioConservado` float NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `learning_progress` DROP COLUMN `dominioConservado`');
  }
}
