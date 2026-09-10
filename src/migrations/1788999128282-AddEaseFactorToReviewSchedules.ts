import { MigrationInterface, QueryRunner } from "typeorm";

// FASE CC-09 Bloqueo 2: calculateNextReview() ya calculaba un ease factor
// (rama repetitions >= 2) pero se descartaba al retornar, nunca se
// guardaba. Escrita a mano en vez de con migration:generate: el diff
// automático contra esta base arrastraba ~90 ALTER no relacionados
// (collation/comentarios de columnas ya existentes), ruido que no
// corresponde a este cambio.
export class AddEaseFactorToReviewSchedules1788999128282 implements MigrationInterface {
    name = 'AddEaseFactorToReviewSchedules1788999128282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`review_schedules\` ADD \`easeFactor\` float NOT NULL DEFAULT '2.5'`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`review_schedules\` DROP COLUMN \`easeFactor\``);
    }
}
