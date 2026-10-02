import { MigrationInterface, QueryRunner } from 'typeorm';

/** Asistencia con QR: sesiones de una clase y cómo quedó cada estudiante en cada una. */
export class AddAsistencia1791200000000 implements MigrationInterface {
  name = 'AddAsistencia1791200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `sesiones_asistencia` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`classId` int NOT NULL, ' +
        '`fecha` date NOT NULL, ' +
        '`tema` varchar(120) NULL, ' +
        '`abierta` tinyint NOT NULL DEFAULT 1, ' +
        '`creadaPorId` int NOT NULL, ' +
        '`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        'INDEX `IDX_sesiones_asistencia_clase_fecha` (`classId`, `fecha`), ' +
        'PRIMARY KEY (`id`), ' +
        'CONSTRAINT `FK_sesiones_asistencia_clase` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE CASCADE' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `registros_asistencia` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`sesionId` int NOT NULL, ' +
        '`userId` int NOT NULL, ' +
        '`estado` varchar(10) NOT NULL, ' +
        '`metodo` varchar(10) NOT NULL, ' +
        '`dispositivo` varchar(32) NULL, ' +
        '`marcadoPorId` int NOT NULL, ' +
        '`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        '`updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), ' +
        'UNIQUE INDEX `UQ_registros_asistencia_sesion_usuario` (`sesionId`, `userId`), ' +
        'INDEX `IDX_registros_asistencia_usuario` (`userId`), ' +
        'PRIMARY KEY (`id`), ' +
        'CONSTRAINT `FK_registros_asistencia_sesion` FOREIGN KEY (`sesionId`) REFERENCES `sesiones_asistencia`(`id`) ON DELETE CASCADE' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `registros_asistencia`');
    await queryRunner.query('DROP TABLE `sesiones_asistencia`');
  }
}
