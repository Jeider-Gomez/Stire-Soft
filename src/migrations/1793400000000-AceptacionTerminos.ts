import { MigrationInterface, QueryRunner } from 'typeorm';

/** Mayoría de edad, términos aceptados y consentimiento de investigación (src/user/aceptacion-terminos.ts). */
export class AceptacionTerminos1793400000000 implements MigrationInterface {
  name = 'AceptacionTerminos1793400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` ADD `mayorDeEdadConfirmadoEn` timestamp NULL, ADD `terminosVersion` varchar(20) NULL, ' +
        'ADD `terminosAceptadosEn` timestamp NULL, ADD `investigacionConsentida` tinyint NULL, ' +
        'ADD `investigacionDecididaEn` timestamp NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `investigacionDecididaEn`, DROP COLUMN `investigacionConsentida`, ' +
        'DROP COLUMN `terminosAceptadosEn`, DROP COLUMN `terminosVersion`, DROP COLUMN `mayorDeEdadConfirmadoEn`',
    );
  }
}
