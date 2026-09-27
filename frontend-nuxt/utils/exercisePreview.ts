/**
 * Vista previa del docente: convierte la configuración de un ejercicio (con sus respuestas) en lo que
 * recibe el estudiante. Replica `StudentQuestionDto.sanitizeConfig` del backend
 * (src/activity-questions/dto/student-question.dto.ts): si cambia allá, cambia aquí.
 * La prueba src/content-rendering/__tests__/exercise-preview.frontend.spec.ts comprueba que ninguna
 * respuesta llega a la vista previa.
 */
type Config = Record<string, any>

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function toStudentPreviewConfig(type: string, config: Config | null | undefined): Config {
  if (!config || typeof config !== 'object') return {}
  switch (type) {
    case 'mcq': {
      const { correctAnswerId, explanation, ...rest } = config
      return rest
    }
    case 'coding': {
      const { hiddenTestCases, testCases, ...rest } = config
      const all: any[] = Array.isArray(testCases) ? testCases : []
      return {
        ...rest,
        testCases: all.filter((tc) => tc?.isPublic === true),
        hiddenTestCaseCount: all.filter((tc) => tc?.isPublic !== true).length + (Array.isArray(hiddenTestCases) ? hiddenTestCases.length : 0)
      }
    }
    case 'html_css': {
      const rules: any[] = Array.isArray(config.rules) ? config.rules : []
      const publicRules = rules.filter((r) => r?.isPublic === true)
      return {
        starterHtml: typeof config.starterHtml === 'string' ? config.starterHtml : '',
        starterCss: typeof config.starterCss === 'string' ? config.starterCss : '',
        publicRules: publicRules.map((r) => ({ id: r.id, label: r.label, ...(r.hint ? { hint: r.hint } : {}) })),
        hiddenRuleCount: rules.length - publicRules.length
      }
    }
    case 'fill_code': {
      const { blanks, ...rest } = config
      return { ...rest, blanks: Array.isArray(blanks) ? blanks.map((b: any) => ({ id: b.id, regexMode: b.regexMode })) : [] }
    }
    case 'drag_drop': {
      const { mappings, items, targets, ...rest } = config
      return { ...rest, items: Array.isArray(items) ? shuffle(items) : items, targets: Array.isArray(targets) ? shuffle(targets) : targets }
    }
    case 'matching': {
      const { pairs, leftColumn, rightColumn, ...rest } = config
      return { ...rest, leftColumn, rightColumn: Array.isArray(rightColumn) ? shuffle(rightColumn) : rightColumn }
    }
    case 'ordering': {
      const { correctOrder, blocks, ...rest } = config
      return { ...rest, blocks: Array.isArray(blocks) ? shuffle(blocks) : blocks }
    }
    default:
      return config
  }
}
