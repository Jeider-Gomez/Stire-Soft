import { MigrationInterface, QueryRunner } from 'typeorm';

/** Encuesta de usabilidad SUS (UX-08, src/usabilidad/sus.ts; docs/DISENO_ENCUESTA_USABILIDAD.md). */
export class EncuestaSus1792300000000 implements MigrationInterface {
  name = 'EncuestaSus1792300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `encuestas_sus` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `rol` varchar(20) NOT NULL, ' +
        '`respuestas` json NOT NULL, `puntaje` float NOT NULL, `comentario` varchar(500) NULL, ' +
        '`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_encuesta_sus_usuario` (`userId`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `encuestas_sus`');
  }
}
