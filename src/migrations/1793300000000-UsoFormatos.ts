import { MigrationInterface, QueryRunner } from 'typeorm';

/** Cuántas veces elige cada estudiante cada formato de una lección (perfil de aprendizaje, MOD-02). */
export class UsoFormatos1793300000000 implements MigrationInterface {
  name = 'UsoFormatos1793300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `uso_formatos` (`id` int NOT NULL AUTO_INCREMENT, `studentId` int NOT NULL, `formato` varchar(20) NOT NULL, ' +
        '`veces` int NOT NULL DEFAULT 0, `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), ' +
        'UNIQUE INDEX `IDX_uso_formatos_estudiante_formato` (`studentId`, `formato`), PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `uso_formatos`');
  }
}
