import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * El juicio de confianza de cada entrega se guarda (META-02, docs/DISENO_CONFIANZA.md). Antes solo vivía en la pantalla:
 * el estudiante no podía ver su calibración con el tiempo. Null = no se preguntó o lo omitió.
 */
export class ConfianzaEntrega1792200000000 implements MigrationInterface {
  name = 'ConfianzaEntrega1792200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `submissions` ADD `confianza` varchar(10) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `submissions` DROP COLUMN `confianza`');
  }
}
