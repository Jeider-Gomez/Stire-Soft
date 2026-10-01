import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Entregas (docs/DISENO_INTERVENCION_DOCENTE.md §3 y §10): el docente crea el espacio donde se entrega un proyecto.
 * Reemplaza «recibir proyectos» por clase (fase 2 de Proyectos): esa columna se quita y los envíos sin entrega, que
 * eran solo las pruebas del 30/09, se borran.
 */
export class AddEntregas1790400000000 implements MigrationInterface {
  name = 'AddEntregas1790400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `entregas` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`classId` int NOT NULL, ' +
        '`learningUnitId` int NULL, ' +
        '`titulo` varchar(150) NOT NULL, ' +
        '`consigna` text NOT NULL, ' +
        "`tipoProyecto` varchar(20) NOT NULL DEFAULT 'cualquiera', " +
        '`plantilla` json NULL, ' +
        '`abreAt` timestamp NULL, ' +
        '`cierraAt` timestamp NULL, ' +
        '`aceptaTarde` tinyint NOT NULL DEFAULT 1, ' +
        '`maxVersiones` int NOT NULL DEFAULT 3, ' +
        '`conNota` tinyint NOT NULL DEFAULT 0, ' +
        '`cuentaParaDominio` tinyint NOT NULL DEFAULT 0, ' +
        "`dificultad` enum('basico','intermedio','avanzado') NOT NULL DEFAULT 'basico', " +
        '`publicada` tinyint NOT NULL DEFAULT 0, ' +
        '`asignadaA` json NULL, ' +
        '`createdBy` int NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_entregas_classId` (`classId`), ' +
        'INDEX `IDX_entregas_learningUnitId` (`learningUnitId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query(
      'CREATE TABLE `entrega_eventos` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`entregaId` int NOT NULL, ' +
        '`studentId` int NOT NULL, ' +
        '`envioId` int NULL, ' +
        '`tipo` varchar(30) NOT NULL, ' +
        '`detalle` json NULL, ' +
        '`actorId` int NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_entrega_eventos_entrega_estudiante` (`entregaId`, `studentId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
    await queryRunner.query('DELETE FROM `proyecto_envios`');
    await queryRunner.query('ALTER TABLE `proyecto_envios` ADD `entregaId` int NOT NULL');
    await queryRunner.query('ALTER TABLE `proyecto_envios` ADD `tarde` tinyint NOT NULL DEFAULT 0');
    await queryRunner.query('CREATE INDEX `IDX_proyecto_envios_entrega_estudiante` ON `proyecto_envios` (`entregaId`, `studentId`)');
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `aceptaProyectos`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` ADD `aceptaProyectos` tinyint NOT NULL DEFAULT 0');
    await queryRunner.query('DROP INDEX `IDX_proyecto_envios_entrega_estudiante` ON `proyecto_envios`');
    await queryRunner.query('ALTER TABLE `proyecto_envios` DROP COLUMN `tarde`');
    await queryRunner.query('ALTER TABLE `proyecto_envios` DROP COLUMN `entregaId`');
    await queryRunner.query('DROP TABLE `entrega_eventos`');
    await queryRunner.query('DROP TABLE `entregas`');
  }
}
