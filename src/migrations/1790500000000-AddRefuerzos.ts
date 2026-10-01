import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Refuerzos y retos (docs/DISENO_INTERVENCION_DOCENTE.md §4 y §10.4) y actividades asignadas a algunos estudiantes
 * (§4.1): para los demás no existen y no cuentan en su dominio.
 */
export class AddRefuerzos1790500000000 implements MigrationInterface {
  name = 'AddRefuerzos1790500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `activities` ADD `asignadaA` json NULL');
    await queryRunner.query(
      'CREATE TABLE `refuerzos` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`classId` int NOT NULL, ' +
        '`tipo` varchar(10) NOT NULL, ' +
        '`titulo` varchar(150) NOT NULL, ' +
        '`mensaje` text NULL, ' +
        '`learningUnitIds` json NOT NULL, ' +
        '`estudiantes` json NOT NULL, ' +
        '`pasos` json NOT NULL, ' +
        '`fechaLimite` timestamp NULL, ' +
        '`dominioInicial` json NOT NULL, ' +
        '`archivado` tinyint NOT NULL DEFAULT 0, ' +
        '`createdBy` int NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_refuerzos_classId` (`classId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `refuerzo_pasos_hechos` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`refuerzoId` int NOT NULL, ' +
        '`studentId` int NOT NULL, ' +
        '`paso` int NOT NULL, ' +
        '`hechoAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'UNIQUE INDEX `IDX_refuerzo_pasos_hechos_unico` (`refuerzoId`, `studentId`, `paso`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `refuerzo_pasos_hechos`');
    await queryRunner.query('DROP TABLE `refuerzos`');
    await queryRunner.query('ALTER TABLE `activities` DROP COLUMN `asignadaA`');
  }
}
