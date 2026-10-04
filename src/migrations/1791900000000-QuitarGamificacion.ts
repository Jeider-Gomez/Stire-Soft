import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Quita la tabla `achievements` del módulo de gamificación que nunca se usó (su servicio estaba comentado y su diseño
 * guardaba un solo «desbloqueado por» por logro). En su lugar STIRE usa gamificación sobria: racha de semanas y esfuerzo
 * de la semana (docs/investigacion/REFERENTES_PLATAFORMAS_Y_STI.md §10; BASE_TEORICA.md BT-29). El `down` la recrea igual.
 */
export class QuitarGamificacion1791900000000 implements MigrationInterface {
  name = 'QuitarGamificacion1791900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `achievements`');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `achievements` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, ' +
        "`name` varchar(255) NOT NULL, `description` text NULL, `iconUrl` varchar(255) NOT NULL, `points` int NOT NULL DEFAULT '10', " +
        '`unlockedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    await queryRunner.query(
      'ALTER TABLE `achievements` ADD CONSTRAINT `FK_d090264a2b478a21cc8f52552b9` FOREIGN KEY (`unlockedById`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }
}
