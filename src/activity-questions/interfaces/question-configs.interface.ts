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

export type QuestionConfig =
  | McqConfig
  | CodingConfig
  | DragDropConfig
  | FillCodeConfig
  | OrderingConfig
  | MatchingConfig;
