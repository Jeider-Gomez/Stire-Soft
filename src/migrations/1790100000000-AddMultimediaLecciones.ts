import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Multimedia en las lecciones (paso 6):
 * - `contents.type` admite `embed`: un recurso insertado (Genially, Canva, Drive, Office, Scratch…).
 * - `media_files`: imágenes que suben los docentes (1 MB cada una, 50 MB por docente).
 */
export class AddMultimediaLecciones1790100000000 implements MigrationInterface {
  name = 'AddMultimediaLecciones1790100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `contents` MODIFY COLUMN `type` enum ('video', 'markdown', 'code', 'pdf', 'image', 'embed') NOT NULL",
    );
    await queryRunner.query(
      'CREATE TABLE `media_files` (' +
        '`id` varchar(36) NOT NULL, ' +
        '`ownerId` int NOT NULL, ' +
        '`mimeType` varchar(40) NOT NULL, ' +
        '`sizeBytes` int NOT NULL, ' +
        '`data` mediumblob NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_media_files_ownerId` (`ownerId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `media_files`');
    // Falla si ya hay lecciones de tipo `embed` (a propósito): revertir exige antes borrarlas o reclasificarlas.
    await queryRunner.query(
      "ALTER TABLE `contents` MODIFY COLUMN `type` enum ('video', 'markdown', 'code', 'pdf', 'image') NOT NULL",
    );
  }
}
