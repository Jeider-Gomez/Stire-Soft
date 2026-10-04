import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Logros y medallas del estudiante (src/analytics/logros.ts; BT-29). Los logros se calculan con los datos que ya existen;
 * esta tabla solo guarda cuándo se obtuvo cada uno y si el estudiante ya lo vio, para celebrarlo una sola vez.
 */
export class LogrosEstudiante1792000000000 implements MigrationInterface {
  name = 'LogrosEstudiante1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `logros_estudiante` (`studentId` int NOT NULL, `clave` varchar(60) NOT NULL, ' +
        '`obtenidoEn` datetime(6) NOT NULL, `visto` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (`studentId`, `clave`), ' +
        'CONSTRAINT `FK_logros_estudiante_usuario` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE) ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `logros_estudiante`');
  }
}
