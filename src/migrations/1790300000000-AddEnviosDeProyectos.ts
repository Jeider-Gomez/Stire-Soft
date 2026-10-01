import { MigrationInterface, QueryRunner } from 'typeorm';

/** Proyectos, fase 2 (docs/DISENO_PROYECTOS.md §3): enviar al docente una copia congelada, con nota y comentario. */
export class AddEnviosDeProyectos1790300000000 implements MigrationInterface {
  name = 'AddEnviosDeProyectos1790300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` ADD `aceptaProyectos` tinyint NOT NULL DEFAULT 0');
    await queryRunner.query(
      'CREATE TABLE `proyecto_envios` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`proyectoId` int NOT NULL, ' +
        '`studentId` int NOT NULL, ' +
        '`classId` int NOT NULL, ' +
        '`version` int NOT NULL, ' +
        '`titulo` varchar(100) NOT NULL, ' +
        '`tipo` varchar(20) NOT NULL, ' +
        '`archivos` json NOT NULL, ' +
        '`nota` decimal(2,1) NULL, ' +
        '`comentario` text NULL, ' +
        '`revisadoAt` timestamp NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_proyecto_envios_classId` (`classId`), ' +
        'INDEX `IDX_proyecto_envios_proyecto_clase` (`proyectoId`, `classId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `proyecto_envios`');
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `aceptaProyectos`');
  }
}
