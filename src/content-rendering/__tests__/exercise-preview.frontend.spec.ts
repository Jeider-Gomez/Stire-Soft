import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { StudentQuestionDto } from '../../activity-questions/dto/student-question.dto';
import { QuestionType } from '../../common/enums/question-type.enum';
// frontend-nuxt/utils/exercisePreview.ts: la vista previa del docente («así lo verá el estudiante»). Replica la
// sanitización del backend; si alguna vez dejara pasar una respuesta, el docente vería en la vista previa algo
// distinto de lo que ve el estudiante. Jest no compila frontend-nuxt/, así que se transpila aquí.
type Preview = (type: string, config: Record<string, unknown>) => Record<string, unknown>;

function loadPreview(): Preview {
  const file = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', 'exercisePreview.ts');
  const js = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports['toStudentPreviewConfig'] as Preview;
}

const preview = loadPreview();

// Configuraciones con la forma exacta que producen los constructores del docente.
const CONFIGS: Record<string, Record<string, unknown>> = {
  mcq: { options: [{ id: 'a', text: 'let' }, { id: 'b', text: 'print' }], correctAnswerId: 'a', isMultipleChoice: false, explanation: 'let declara' },
  coding: { language: 'javascript', starterCode: '// x', testCases: [{ input: '1', expectedOutput: '2', isPublic: true }, { input: '3', expectedOutput: '4', isPublic: false }] },
  fill_code: { codeTemplate: 'let x = ___a___;', language: 'javascript', blanks: [{ id: 'a', answer: '5', regexMode: false }] },
  drag_drop: { items: [{ id: 'i1', content: 'string' }], targets: [{ id: 't1', label: 'primitivo' }], mappings: { i1: 't1' } },
  matching: { leftColumn: [{ id: 'l1', text: 'const' }], rightColumn: [{ id: 'r1', text: 'constante' }], pairs: { l1: 'r1' } },
  ordering: { blocks: [{ id: 'b1', content: 'leer' }, { id: 'b2', content: 'sumar' }], correctOrder: ['b1', 'b2'] },
  html_css: { starterHtml: '', starterCss: '', rules: [{ id: 'r', label: 'h1', isPublic: true, check: { kind: 'exists' } }, { id: 'o', label: 'p', isPublic: false }], modelSolution: { html: '<h1>x</h1>', css: '' } },
};

const ANSWER_KEYS = ['correctAnswerId', 'explanation', 'mappings', 'pairs', 'correctOrder', 'modelSolution', 'rules', 'hiddenTestCases', 'answer', 'check'];

function keysDeep(v: unknown, acc: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => keysDeep(x, acc));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { acc.push(k); keysDeep(x, acc); }
  return acc;
}

describe('toStudentPreviewConfig (frontend-nuxt/utils/exercisePreview.ts)', () => {
  it.each(Object.keys(CONFIGS))('%s: ninguna respuesta llega a la vista previa', (type) => {
    const keys = keysDeep(preview(type, CONFIGS[type]));
    for (const k of ANSWER_KEYS) expect(keys).not.toContain(k);
  });

  it('coding: solo los casos públicos, y cuántos ocultos hay', () => {
    const out = preview('coding', CONFIGS.coding) as { testCases: unknown[]; hiddenTestCaseCount: number };
    expect(out.testCases).toHaveLength(1);
    expect(out.hiddenTestCaseCount).toBe(1);
  });

  it.each(Object.keys(CONFIGS))('%s: produce las mismas claves que ve el estudiante (StudentQuestionDto)', (type) => {
    const dto = StudentQuestionDto.fromEntity({ id: 1, activityId: 1, type: type as QuestionType, question: 'q', points: 20, order: 0, config: CONFIGS[type] } as never);
    const fromBackend = Object.keys(dto.config).filter((k) => k !== 'timeLimitMs').sort();
    expect(Object.keys(preview(type, CONFIGS[type])).sort()).toEqual(fromBackend);
  });
});
