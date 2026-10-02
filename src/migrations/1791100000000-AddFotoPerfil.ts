import { MigrationInterface, QueryRunner } from 'typeorm';

/** Foto de perfil opcional: el id de una imagen de media_files. */
export class AddFotoPerfil1791100000000 implements MigrationInterface {
  name = 'AddFotoPerfil1791100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` ADD `fotoId` varchar(36) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `fotoId`');
  }
}
