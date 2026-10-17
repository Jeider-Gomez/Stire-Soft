import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Mensajes con imagen y que se pueden editar (sugerencia n.º 13, Julio 16/10): la imagen adjunta (un archivo de
 * media_files, privado al remitente y al destinatario) y cuándo se editó el texto por última vez.
 */
export class MensajesImagenYEdicion1793200000000 implements MigrationInterface {
  name = 'MensajesImagenYEdicion1793200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `messages` ADD `imagenId` varchar(36) NULL, ADD `editadoEn` datetime NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `messages` DROP COLUMN `editadoEn`, DROP COLUMN `imagenId`');
  }
}
