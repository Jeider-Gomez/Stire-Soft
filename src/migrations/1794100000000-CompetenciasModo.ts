import { MigrationInterface, QueryRunner } from 'typeorm';

/** Competencias en la clase (P39): apagadas por defecto; el docente elige si solo informan o también recomiendan. */
export class CompetenciasModo1794100000000 implements MigrationInterface {
  name = 'CompetenciasModo1794100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `classes` ADD `competenciasModo` varchar(12) NOT NULL DEFAULT 'apagado'");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `competenciasModo`');
  }
}
