import { MigrationInterface, QueryRunner } from 'typeorm';

/** Registro de acciones del administrador (v3, Fase F): quién hizo qué sobre quién. */
export class AccionesAdmin1794000000000 implements MigrationInterface {
  name = 'AccionesAdmin1794000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `acciones_admin` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        '`deletedAt` timestamp NULL, ' +
        '`adminId` int NOT NULL, ' +
        '`accion` varchar(40) NOT NULL, ' +
        '`objetivoTipo` varchar(40) NULL, ' +
        '`objetivoId` int NULL, ' +
        '`detalle` varchar(300) NULL, ' +
        'INDEX `IDX_acciones_admin_admin` (`adminId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `acciones_admin`');
  }
}
