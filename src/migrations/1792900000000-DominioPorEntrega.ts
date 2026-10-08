import { MigrationInterface, QueryRunner } from 'typeorm';

/** 07/10: el dominio de la lección antes y después de cada entrega, para que el estudiante vea cuánto le sumó cada ejercicio. */
export class DominioPorEntrega1792900000000 implements MigrationInterface {
  name = 'DominioPorEntrega1792900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `submissions` ADD `dominioAntes` int NULL, ADD `dominioDespues` int NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `submissions` DROP COLUMN `dominioDespues`, DROP COLUMN `dominioAntes`');
  }
}
