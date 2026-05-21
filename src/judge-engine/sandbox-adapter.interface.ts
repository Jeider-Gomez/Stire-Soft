export const SANDBOX_ADAPTER = 'SANDBOX_ADAPTER';

export interface RunResult {
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'compile_error' | 'runtime_error';
  stdout: string;
  stderr: string;
  timeMs: number;
  memoryKb: number;
}

export interface SandboxAdapter {
  executeIsolated(code: string, language: string, testCase: any): Promise<RunResult>;
}
