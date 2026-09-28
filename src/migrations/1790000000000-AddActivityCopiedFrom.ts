import { MigrationInterface, QueryRunner } from 'typeorm';

// Reutilización (docs/DISENO_PRACTICA_ADAPTATIVA.md §3.5): cada actividad copiada guarda de dónde salió.
export class AddActivityCopiedFrom1790000000000 implements MigrationInterface {
  name = 'AddActivityCopiedFrom1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `activities` ADD `copiedFromId` int NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `activities` DROP COLUMN `copiedFromId`');
  }
}
