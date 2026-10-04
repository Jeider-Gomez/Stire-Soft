import { MigrationInterface, QueryRunner } from 'typeorm';
import { ambitoDe, normalizarNombre } from '../institution/normalizar';

/**
 * Orden del catálogo (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.2.1): nombre normalizado y ámbito con índice único
 * (no hay dos asignaturas iguales en el mismo lugar), oficial o agregada, sinónimos de las que se unen, y los pares que
 * el admin marcó como distintos. Marca como oficiales las asignaturas que ya existen (las precargó la migración anterior)
 * y agrega la electiva libre «Uso de la Inteligencia Artificial en la Educación» (Prof. Víctor Castro, Unicórdoba).
 */
export class OrdenCatalogo1791700000000 implements MigrationInterface {
  name = 'OrdenCatalogo1791700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `asignaturas` ADD `nombreNormalizado` varchar(150) NOT NULL DEFAULT \'\', ADD `ambito` varchar(20) NOT NULL DEFAULT \'libre\', ' +
        'ADD `oficial` tinyint NOT NULL DEFAULT 0, ADD `sinonimos` varchar(600) NULL',
    );
    const filas: Array<{ id: number; nombre: string; programId: number | null; institutionId: number | null }> = await queryRunner.query(
      'SELECT `id`, `nombre`, `programId`, `institutionId` FROM `asignaturas`',
    );
    for (const f of filas) {
      await queryRunner.query('UPDATE `asignaturas` SET `nombreNormalizado` = ?, `ambito` = ?, `oficial` = 1 WHERE `id` = ?', [
        normalizarNombre(f.nombre),
        ambitoDe(f.programId, f.institutionId),
        f.id,
      ]);
    }
    await queryRunner.query('CREATE UNIQUE INDEX `IDX_asignaturas_ambito_nombre` ON `asignaturas` (`ambito`, `nombreNormalizado`)');
    await queryRunner.query(
      'CREATE TABLE `asignaturas_distintas` (`menorId` int NOT NULL, `mayorId` int NOT NULL, PRIMARY KEY (`menorId`, `mayorId`), ' +
        'CONSTRAINT `FK_distintas_menor` FOREIGN KEY (`menorId`) REFERENCES `asignaturas`(`id`) ON DELETE CASCADE, ' +
        'CONSTRAINT `FK_distintas_mayor` FOREIGN KEY (`mayorId`) REFERENCES `asignaturas`(`id`) ON DELETE CASCADE) ENGINE=InnoDB',
    );

    const [unicor]: Array<{ id: number }> = await queryRunner.query("SELECT `id` FROM `institutions` WHERE `name` = 'Universidad de Córdoba'");
    if (unicor) {
      const nombre = 'Uso de la Inteligencia Artificial en la Educación';
      const nn = normalizarNombre(nombre);
      const ambito = ambitoDe(null, unicor.id);
      await queryRunner.query(
        'INSERT INTO `asignaturas` (`nombre`, `nombreNormalizado`, `ambito`, `institutionId`, `oficial`) SELECT ?, ?, ?, ?, 1 FROM DUAL ' +
          'WHERE NOT EXISTS (SELECT 1 FROM `asignaturas` WHERE `ambito` = ? AND `nombreNormalizado` = ?)',
        [nombre, nn, ambito, unicor.id, ambito, nn],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `asignaturas_distintas`');
    await queryRunner.query('DROP INDEX `IDX_asignaturas_ambito_nombre` ON `asignaturas`');
    await queryRunner.query('ALTER TABLE `asignaturas` DROP COLUMN `sinonimos`, DROP COLUMN `oficial`, DROP COLUMN `ambito`, DROP COLUMN `nombreNormalizado`');
  }
}
