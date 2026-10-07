import { MigrationInterface, QueryRunner } from 'typeorm';

/** 07/10: avisos del docente a toda su clase (citaciones, recordatorios, informes) y su tipo de notificación. */
export class AvisosClase1792800000000 implements MigrationInterface {
  name = 'AvisosClase1792800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `avisos_clase` (`id` int NOT NULL AUTO_INCREMENT, `classId` int NOT NULL, `autorId` int NOT NULL, ' +
        "`tipo` varchar(12) NOT NULL DEFAULT 'aviso', `titulo` varchar(120) NOT NULL, `cuerpo` text NOT NULL, `fechaEvento` datetime NULL, " +
        '`lugar` varchar(160) NULL, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_avisos_clase_clase_fecha` (`classId`, `createdAt`), PRIMARY KEY (`id`), ' +
        'CONSTRAINT `FK_avisos_clase_clase` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE CASCADE) ENGINE=InnoDB',
    );
    await queryRunner.query(
      "ALTER TABLE `notifications` MODIFY COLUMN `type` enum ('grade', 'review_schedule', 'message', 'info', 'aviso') NOT NULL DEFAULT 'info'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Como en AddMessageNotificationType: reducir el enum falla si quedan notificaciones de tipo 'aviso' (a propósito).
    await queryRunner.query(
      "ALTER TABLE `notifications` MODIFY COLUMN `type` enum ('grade', 'review_schedule', 'message', 'info') NOT NULL DEFAULT 'info'",
    );
    await queryRunner.query('DROP TABLE `avisos_clase`');
  }
}
