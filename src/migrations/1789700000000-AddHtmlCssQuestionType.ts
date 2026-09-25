import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fase 25 — nuevo tipo de pregunta `html_css` (HTML y CSS calificados por reglas, ADR 13).
 *
 * `QuestionType` se repite como `enum` de MySQL en DOS tablas (las dos entidades usan el mismo enum de TypeScript):
 * `activity_questions` y `bank_questions`. Se amplían las dos, si no, guardar una pregunta `html_css` en el banco
 * fallaría con «Data truncated for column 'type'».
 */
export class AddHtmlCssQuestionType1789700000000 implements MigrationInterface {
  name = 'AddHtmlCssQuestionType1789700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['activity_questions', 'bank_questions']) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY COLUMN \`type\` ` +
          "enum ('mcq', 'coding', 'drag_drop', 'matching', 'fill_code', 'ordering', 'ai_evaluated', 'html_css') NOT NULL",
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reduce el enum a los valores anteriores. Si ya existe alguna fila con type='html_css' esto falla (a propósito:
    // MySQL no admite un valor fuera de la lista al reducir la columna): revertir exige antes borrar o reclasificar
    // esas preguntas.
    for (const table of ['activity_questions', 'bank_questions']) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY COLUMN \`type\` ` +
          "enum ('mcq', 'coding', 'drag_drop', 'matching', 'fill_code', 'ordering', 'ai_evaluated') NOT NULL",
      );
    }
  }
}
