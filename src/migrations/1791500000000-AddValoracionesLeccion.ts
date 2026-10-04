import { MigrationInterface, QueryRunner } from 'typeorm';

/** «¿Te sirvió esta explicación?»: un voto por estudiante y lección (UI-04 de la lista de chequeo de Sistemas Tutores). */
export class AddValoracionesLeccion1791500000000 implements MigrationInterface {
  name = 'AddValoracionesLeccion1791500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `valoraciones_leccion` (' +
        '`id` int NOT NULL AUTO_INCREMENT, `studentId` int NOT NULL, `learningUnitId` int NOT NULL, `util` tinyint NOT NULL, ' +
        '`comentario` varchar(300) NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), ' +
        '`updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), ' +
        'UNIQUE INDEX `IDX_valoracion_estudiante_leccion` (`studentId`, `learningUnitId`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `valoraciones_leccion`');
  }
}
