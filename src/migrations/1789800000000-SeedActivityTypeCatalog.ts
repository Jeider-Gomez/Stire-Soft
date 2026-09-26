import { MigrationInterface, QueryRunner } from 'typeorm';
import { ACTIVITY_TYPE_CATALOG } from '../activity-types/activity-type-catalog';

/**
 * Los tipos de actividad son un catálogo del sistema, pero solo los creaba el seed de demostración. En el primer
 * despliegue real (26/09/2026, sin seed de demo, a propósito) la tabla quedó vacía y ningún docente podía crear un
 * ejercicio: el formulario exige elegir un tipo. `INSERT IGNORE` (el código es único) no duplica ni toca los que ya
 * existan, así que es seguro en bases que ya corrieron el seed.
 */
export class SeedActivityTypeCatalog1789800000000 implements MigrationInterface {
  name = 'SeedActivityTypeCatalog1789800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const t of ACTIVITY_TYPE_CATALOG) {
      await queryRunner.query(
        'INSERT IGNORE INTO `activity_types` (`name`, `code`, `autoGradable`, `baseWeight`) VALUES (?, ?, ?, ?)',
        [t.name, t.code, t.autoGradable ? 1 : 0, t.baseWeight],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Solo se quitan los tipos que ninguna actividad usa: borrar uno en uso rompería la clave foránea de `activities`.
    const codes = ACTIVITY_TYPE_CATALOG.map((t) => t.code);
    await queryRunner.query(
      `DELETE FROM \`activity_types\` WHERE \`code\` IN (${codes.map(() => '?').join(', ')}) ` +
        'AND `id` NOT IN (SELECT `activityTypeId` FROM `activities` WHERE `activityTypeId` IS NOT NULL)',
      codes,
    );
  }
}
