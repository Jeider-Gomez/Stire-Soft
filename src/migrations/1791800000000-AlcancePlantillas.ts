import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Plantillas por alcance (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3): con quién se comparte el contenido de una clase
 * (nadie, su asignatura, su programa, su facultad, su institución o todo STIRE), su enfoque en una línea y cuántas veces
 * la copiaron otros docentes. Las que ya estaban compartidas siguen visibles para todos, como antes.
 */
export class AlcancePlantillas1791800000000 implements MigrationInterface {
  name = 'AlcancePlantillas1791800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `classes` ADD `alcancePlantilla` varchar(20) NOT NULL DEFAULT 'nadie', ADD `enfoque` varchar(160) NULL, " +
        'ADD `vecesCopiada` int NOT NULL DEFAULT 0',
    );
    await queryRunner.query("UPDATE `classes` SET `alcancePlantilla` = 'todos' WHERE `compartidaComoPlantilla` = 1");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `vecesCopiada`, DROP COLUMN `enfoque`, DROP COLUMN `alcancePlantilla`');
  }
}
