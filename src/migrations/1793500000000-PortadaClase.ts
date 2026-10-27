import { MigrationInterface, QueryRunner } from 'typeorm';

/** Color de portada de cada clase (src/class/portadas.ts). Sin valor, la aplicación usa el color automático. */
export class PortadaClase1793500000000 implements MigrationInterface {
  name = 'PortadaClase1793500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` ADD `portada` varchar(7) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `classes` DROP COLUMN `portada`');
  }
}
