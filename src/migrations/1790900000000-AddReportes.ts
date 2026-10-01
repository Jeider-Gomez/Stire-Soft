import { MigrationInterface, QueryRunner } from 'typeorm';

/** «Reportar» desde la app: problemas, cosas confusas e ideas, con la pantalla donde pasó. */
export class AddReportes1790900000000 implements MigrationInterface {
  name = 'AddReportes1790900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `reportes` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`userId` int NOT NULL, ' +
        '`rol` varchar(20) NOT NULL, ' +
        '`tipo` varchar(12) NOT NULL, ' +
        '`gravedad` tinyint NULL, ' +
        '`texto` text NOT NULL, ' +
        '`ruta` varchar(300) NOT NULL, ' +
        "`dispositivo` varchar(300) NOT NULL DEFAULT '', " +
        "`clase` varchar(160) NOT NULL DEFAULT '', " +
        "`estado` varchar(10) NOT NULL DEFAULT 'nuevo', " +
        '`nota` text NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_reportes_estado` (`estado`), ' +
        'INDEX `IDX_reportes_userId` (`userId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `reportes`');
  }
}
