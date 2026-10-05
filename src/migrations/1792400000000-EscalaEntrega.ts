import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Escala de calificación de cada entrega (src/proyectos/entrega-reglas.ts): solo comentario, aprobado o no, desempeño
 * (Superior, Alto, Básico, Bajo) o nota de 0,0 a 5,0. Las que ya tenían nota pasan a `nota`; el resto, a `comentario`.
 * Cada envío guarda su valoración cuando la escala no es numérica.
 */
export class EscalaEntrega1792400000000 implements MigrationInterface {
  name = 'EscalaEntrega1792400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `entregas` ADD `escala` varchar(15) NOT NULL DEFAULT 'comentario'");
    await queryRunner.query("UPDATE `entregas` SET `escala` = 'nota' WHERE `conNota` = 1");
    await queryRunner.query('ALTER TABLE `proyecto_envios` ADD `valoracion` varchar(15) NULL');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `proyecto_envios` DROP COLUMN `valoracion`');
    await queryRunner.query('ALTER TABLE `entregas` DROP COLUMN `escala`');
  }
}
