import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Formas de calificar (docs/DISENO_INTERVENCION_DOCENTE.md §6): esquema opcional por clase, notas que pone el docente
 * (componentes manuales y ajuste de la final) y su historial.
 */
export class AddCalificaciones1790600000000 implements MigrationInterface {
  name = 'AddCalificaciones1790600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `esquemas_calificacion` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`classId` int NOT NULL, ' +
        '`componentes` json NOT NULL, ' +
        '`notaAprobatoria` decimal(2,1) NOT NULL DEFAULT 3.0, ' +
        '`visibleParaEstudiantes` tinyint NOT NULL DEFAULT 0, ' +
        '`updatedBy` int NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        'UNIQUE INDEX `IDX_esquemas_calificacion_classId` (`classId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `notas_registradas` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`classId` int NOT NULL, ' +
        '`studentId` int NOT NULL, ' +
        '`clave` varchar(30) NOT NULL, ' +
        '`nota` decimal(2,1) NOT NULL, ' +
        '`motivo` text NULL, ' +
        '`updatedBy` int NOT NULL, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        'UNIQUE INDEX `IDX_notas_registradas_unica` (`classId`, `studentId`, `clave`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `notas_historial` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`classId` int NOT NULL, ' +
        '`studentId` int NOT NULL, ' +
        '`clave` varchar(30) NOT NULL, ' +
        '`nombre` varchar(60) NOT NULL, ' +
        '`antes` decimal(2,1) NULL, ' +
        '`despues` decimal(2,1) NULL, ' +
        '`motivo` text NULL, ' +
        '`actorId` int NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_notas_historial_clase_estudiante` (`classId`, `studentId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `notas_historial`');
    await queryRunner.query('DROP TABLE `notas_registradas`');
    await queryRunner.query('DROP TABLE `esquemas_calificacion`');
  }
}
