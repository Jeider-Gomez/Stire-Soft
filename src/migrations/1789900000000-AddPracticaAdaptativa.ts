import { MigrationInterface, QueryRunner } from 'typeorm';

// Práctica adaptativa (docs/DISENO_PRACTICA_ADAPTATIVA.md): la respuesta del estudiante a «¿Cómo te sientes con este
// tema?» y la marca de repaso en cada intento. Columnas opcionales o con valor por defecto: no rompe datos existentes.
export class AddPracticaAdaptativa1789900000000 implements MigrationInterface {
  name = 'AddPracticaAdaptativa1789900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `learning_progress` ADD `entryConfidence` tinyint NULL');
    await queryRunner.query('ALTER TABLE `submissions` ADD `isReview` tinyint NOT NULL DEFAULT 0');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `submissions` DROP COLUMN `isReview`');
    await queryRunner.query('ALTER TABLE `learning_progress` DROP COLUMN `entryConfidence`');
  }
}
