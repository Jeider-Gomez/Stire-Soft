import { MigrationInterface, QueryRunner } from 'typeorm';

/** El Laboratorio (v3, Fase D, paso 6): publicar un proyecto en la clase o en la universidad, me gusta, mensajes y reportes. */
export class Laboratorio1793900000000 implements MigrationInterface {
  name = 'Laboratorio1793900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `laboratorio_publicaciones` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`proyectoId` int NOT NULL, ' +
        '`autorId` int NOT NULL, ' +
        '`classId` int NOT NULL, ' +
        '`alcance` varchar(20) NOT NULL, ' +
        '`titulo` varchar(100) NOT NULL, ' +
        '`tipo` varchar(20) NOT NULL, ' +
        "`descripcion` varchar(300) NOT NULL DEFAULT '', " +
        '`archivos` json NOT NULL, ' +
        '`oculta` tinyint NOT NULL DEFAULT 0, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        'UNIQUE INDEX `IDX_laboratorio_publicaciones_proyecto` (`proyectoId`), ' +
        'INDEX `IDX_laboratorio_publicaciones_clase` (`classId`), ' +
        'INDEX `IDX_laboratorio_publicaciones_alcance` (`alcance`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `laboratorio_me_gusta` (' +
        '`publicacionId` int NOT NULL, ' +
        '`userId` int NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_laboratorio_me_gusta_usuario` (`userId`), ' +
        'PRIMARY KEY (`publicacionId`, `userId`)' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `laboratorio_comentarios` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`publicacionId` int NOT NULL, ' +
        '`autorId` int NOT NULL, ' +
        '`texto` varchar(500) NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_laboratorio_comentarios_publicacion` (`publicacionId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `laboratorio_reportes` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`publicacionId` int NOT NULL, ' +
        '`comentarioId` int NULL, ' +
        '`userId` int NOT NULL, ' +
        "`motivo` varchar(300) NOT NULL DEFAULT '', " +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'UNIQUE INDEX `IDX_laboratorio_reportes_publicacion_usuario` (`publicacionId`, `userId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `laboratorio_reportes`');
    await queryRunner.query('DROP TABLE `laboratorio_comentarios`');
    await queryRunner.query('DROP TABLE `laboratorio_me_gusta`');
    await queryRunner.query('DROP TABLE `laboratorio_publicaciones`');
  }
}
