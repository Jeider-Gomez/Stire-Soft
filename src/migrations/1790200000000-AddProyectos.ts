import { MigrationInterface, QueryRunner } from 'typeorm';

/** Proyectos (docs/DISENO_PROYECTOS.md): el espacio de programación propio de cada estudiante. */
export class AddProyectos1790200000000 implements MigrationInterface {
  name = 'AddProyectos1790200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `proyectos` (' +
        '`id` int NOT NULL AUTO_INCREMENT, ' +
        '`ownerId` int NOT NULL, ' +
        '`titulo` varchar(100) NOT NULL, ' +
        '`tipo` varchar(20) NOT NULL, ' +
        '`archivos` json NOT NULL, ' +
        '`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
        '`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ' +
        'INDEX `IDX_proyectos_ownerId` (`ownerId`), ' +
        'PRIMARY KEY (`id`)' +
        ') ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `proyectos`');
  }
}
