import { ActivityQuestion } from '../entities/activity-question.entity';
import { QuestionType } from '../../common/enums/question-type.enum';
import { SANDBOX_TIMEOUT_MS } from '../../judge-engine/sandbox-limits';

// P0-03 — vista de una pregunta para el estudiante: nunca la entidad cruda.
// El campo `config` contiene la "ground truth" de evaluación (respuesta
// correcta) y, hasta ahora, se servía completo a cualquier autenticado.
//
// Quitar el campo de la solución NO basta en DRAG_DROP/MATCHING/ORDERING:
// si `items`/`rightColumn`/`blocks` se sirven en el mismo orden en que están
// guardados (que suele coincidir con el orden correcto), el ORDEN ES la
// respuesta. Por eso esas listas se barajan, no solo se filtran.
export class StudentQuestionDto {
  id: number;
  activityId: number;
  type: QuestionType;
  question: string;
  points: number;
  order: number;
  config: Record<string, any>;

  static fromEntity(q: ActivityQuestion): StudentQuestionDto {
    const dto = new StudentQuestionDto();
    dto.id = q.id;
    dto.activityId = q.activityId;
    dto.type = q.type;
    dto.question = q.question;
    dto.points = q.points;
    dto.order = q.order;
    dto.config = StudentQuestionDto.sanitizeConfig(q.type, q.config);
    return dto;
  }

  private static shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private static sanitizeConfig(type: QuestionType, config: any): Record<string, any> {
    if (!config || typeof config !== 'object') return {};

    switch (type) {
      case QuestionType.MCQ: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { correctAnswerId, explanation, ...rest } = config;
        return rest;
      }

      case QuestionType.CODING: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { hiddenTestCases, testCases, ...rest } = config;
        const all: any[] = Array.isArray(testCases) ? testCases : [];
        const hiddenCount =
          all.filter((tc: any) => tc?.isPublic !== true).length +
          (Array.isArray(hiddenTestCases) ? hiddenTestCases.length : 0);
        return {
          ...rest,
          testCases: all.filter((tc: any) => tc?.isPublic === true),
          // Solo CUÁNTOS hay ocultos (nunca su contenido) y el límite real de
          // tiempo: la pantalla del ejercicio mostraba «3 públicos / 2 privados /
          // 1000 ms» fijos.
          hiddenTestCaseCount: hiddenCount,
          timeLimitMs: SANDBOX_TIMEOUT_MS,
        };
      }

      case QuestionType.HTML_CSS: {
        // Fase 25: la pregunta guarda las reglas con su criterio (`check`) y la SOLUCIÓN MODELO. El estudiante recibe solo
        // el código inicial y la etiqueta/pista de las reglas PÚBLICAS; de las ocultas, únicamente cuántas hay.
        const rules: any[] = Array.isArray(config.rules) ? config.rules : [];
        const publicRules = rules.filter((r) => r?.isPublic === true);
        return {
          starterHtml: typeof config.starterHtml === 'string' ? config.starterHtml : '',
          starterCss: typeof config.starterCss === 'string' ? config.starterCss : '',
          publicRules: publicRules.map((r) => ({
            id: r.id,
            label: r.label,
            ...(typeof r.hint === 'string' && r.hint ? { hint: r.hint } : {}),
          })),
          hiddenRuleCount: rules.length - publicRules.length,
        };
      }

      case QuestionType.FILL_CODE: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { blanks, ...rest } = config;
        return {
          ...rest,
          // Se conserva el id y regexMode para que el frontend renderice los
          // huecos; NUNCA la respuesta (`answer`).
          blanks: Array.isArray(blanks)
            ? blanks.map((b: any) => ({ id: b.id, regexMode: b.regexMode }))
            : [],
        };
      }

      case QuestionType.DRAG_DROP: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { mappings, items, targets, ...rest } = config;
        return {
          ...rest,
          items: Array.isArray(items) ? StudentQuestionDto.shuffle(items) : items,
          targets: Array.isArray(targets) ? StudentQuestionDto.shuffle(targets) : targets,
        };
      }

      case QuestionType.MATCHING: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { pairs, leftColumn, rightColumn, ...rest } = config;
        return {
          ...rest,
          leftColumn,
          rightColumn: Array.isArray(rightColumn)
            ? StudentQuestionDto.shuffle(rightColumn)
            : rightColumn,
        };
      }

      case QuestionType.ORDERING: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { correctOrder, blocks, ...rest } = config;
        return {
          ...rest,
          // No nombrado explícitamente en el brief, pero es la misma clase de
          // vulnerabilidad que DRAG_DROP/MATCHING: si `blocks` llega en el
          // orden correcto, el orden ES la respuesta.
          blocks: Array.isArray(blocks) ? StudentQuestionDto.shuffle(blocks) : blocks,
        };
      }

      default:
        return config;
    }
  }
}
