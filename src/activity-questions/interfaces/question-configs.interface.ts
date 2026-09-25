export interface McqConfig {
  options: { id: string; text: string }[];
  correctAnswerId: string | string[]; // Array if multiple choice
  explanation?: string;
  isMultipleChoice?: boolean;
}

export interface CodingConfig {
  language: string; // 'python3', 'javascript', 'cpp', etc.
  starterCode: string;
  publicTestCases: Array<{ input: string; expected: string; label?: string }>;
  hiddenTestCases?: Array<{ input: string; expected: string; weight: number }>; // DB only
  memoryLimitMB?: number;
  timeLimitSeconds?: number;
}

export interface DragDropConfig {
  items: { id: string; content: string }[];
  targets: { id: string; label: string }[];
  mappings: Record<string, string>; // itemId -> targetId
}

export interface FillCodeConfig {
  codeTemplate: string; // e.g., "for i in ___:" where ___ are blanks
  language?: string; // Fase 26: lenguaje con el que el editor resalta la plantilla (HIGHLIGHT_LANGUAGES); no se ejecuta
  blanks: Array<{ id: string; answer: string; regexMode?: boolean }>;
}

export interface OrderingConfig {
  blocks: Array<{ id: string; content: string }>;
  correctOrder: string[]; // Array of block ids in the correct order
}

export interface MatchingConfig {
  leftColumn: Array<{ id: string; content: string }>;
  rightColumn: Array<{ id: string; content: string }>;
  pairs: Record<string, string>; // leftId -> rightId
}

// ── HTML y CSS calificados por reglas (Fase 25, ADR 13) ─────────────────────────────────────────────────────────
// Se califica con jsdom SIN ejecutar el JavaScript del estudiante. Lo que se puede comprobar: presencia y jerarquía de
// etiquetas, atributos, textos, propiedades CSS y accesibilidad básica. Lo que NO: posición, tamaño renderizado,
// @media/responsive, animaciones (criterio del docente).
export type HtmlCssCheck =
  | { kind: 'element_exists'; selector: string; min?: number }
  | { kind: 'element_count'; selector: string; equals?: number; min?: number; max?: number }
  | { kind: 'text'; selector: string; mode: 'contains' | 'equals'; value: string; caseSensitive?: boolean }
  | { kind: 'attribute'; selector: string; name: string; mode: 'exists' | 'equals' | 'contains'; value?: string }
  | { kind: 'css_property'; selector: string; property: string; oneOf: string[] }
  | { kind: 'a11y'; check: 'img_alt' | 'form_labels' | 'html_lang' | 'document_title' | 'single_h1' };

export interface HtmlCssRule {
  id: string; // ^[a-z0-9_-]{1,40}$, único dentro de la pregunta
  label: string; // ≤ 160; lo que ve el estudiante
  hint?: string; // ≤ 240
  isPublic: boolean; // pública: el estudiante ve su etiqueta y si pasa; oculta: solo cuántas hay
  weight: number; // entero 1..100
  check: HtmlCssCheck;
}

export interface HtmlCssConfig {
  starterHtml: string;
  starterCss: string;
  rules: HtmlCssRule[];
  modelSolution: { html: string; css: string }; // el servidor comprueba que cumple el 100 % de las reglas
}

export type QuestionConfig =
  | McqConfig
  | CodingConfig
  | DragDropConfig
  | FillCodeConfig
  | OrderingConfig
  | MatchingConfig
  | HtmlCssConfig;
