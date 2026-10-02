import { MigrationInterface, QueryRunner } from 'typeorm';

/** Registro de cambios de rol: a quién, de qué rol a cuál, quién lo hizo, por dónde y cuándo. */
export class AddCambiosDeRol1791000000000 implements MigrationInterface {
  name = 'AddCambiosDeRol1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `cambios_de_rol` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`userId` int NOT NULL, ' +
        '`rolAnterior` varchar(20) NOT NULL, ' +
        '`rolNuevo` varchar(20) NOT NULL, ' +
        '`cambiadoPorId` int NULL, ' +
        '`origen` varchar(20) NOT NULL, ' +
        '`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        'INDEX `IDX_cambios_de_rol_user_fecha` (`userId`, `createdAt`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `cambios_de_rol`');
  }
}
