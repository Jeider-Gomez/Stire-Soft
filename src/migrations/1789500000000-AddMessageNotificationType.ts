import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageNotificationType1789500000000 implements MigrationInterface {
  name = 'AddMessageNotificationType1789500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `notifications` MODIFY COLUMN `type` " +
        "enum ('grade', 'review_schedule', 'message', 'info') NOT NULL DEFAULT 'info'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reduce el enum a los valores anteriores. Si ya existe alguna fila con
    // type='message' esto falla (a propósito: MySQL no admite un valor de
    // enum fuera de la lista al reducir la columna) — revertir esta
    // migración exige primero borrar o reclasificar esas notificaciones.
    await queryRunner.query(
      "ALTER TABLE `notifications` MODIFY COLUMN `type` " +
        "enum ('grade', 'review_schedule', 'info') NOT NULL DEFAULT 'info'",
    );
  }
}
