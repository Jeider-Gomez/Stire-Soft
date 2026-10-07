import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 07/10: cada notificación lleva a donde se resuelve (`enlace`: la lección, la entrega, los repasos) y puede tener una
 * `clave` que impide repetirla (el hito de un módulo, los repasos de un día). Las existentes quedan sin enlace ni clave.
 */
export class NotificacionesConEnlace1792700000000 implements MigrationInterface {
  name = 'NotificacionesConEnlace1792700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `notifications` ADD `enlace` varchar(300) NULL');
    await queryRunner.query('ALTER TABLE `notifications` ADD `clave` varchar(120) NULL');
    await queryRunner.query('CREATE UNIQUE INDEX `UQ_notifications_usuario_clave` ON `notifications` (`userId`, `clave`)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `UQ_notifications_usuario_clave` ON `notifications`');
    await queryRunner.query('ALTER TABLE `notifications` DROP COLUMN `clave`');
    await queryRunner.query('ALTER TABLE `notifications` DROP COLUMN `enlace`');
  }
}
