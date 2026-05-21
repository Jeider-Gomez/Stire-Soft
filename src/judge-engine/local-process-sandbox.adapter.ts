import { Injectable, Logger } from '@nestjs/common';
import { SandboxAdapter, RunResult } from './sandbox-adapter.interface';
import * as vm from 'vm';

@Injectable()
export class LocalProcessSandboxAdapter implements SandboxAdapter {
  private readonly logger = new Logger(LocalProcessSandboxAdapter.name);

  async executeIsolated(code: string, language: string, testCase: any): Promise<RunResult> {
    if (language !== 'javascript' && language !== 'js') {
      return {
        status: 'runtime_error',
        stdout: '',
        stderr: `Local sandbox only supports JavaScript. Received ${language}`,
        timeMs: 0,
        memoryKb: 0,
      };
    }

    const outputs: string[] = [];
    const start = Date.now();

    const sandbox = {
      console: {
        log: (...args: unknown[]) => outputs.push(args.map(String).join(' ')),
      },
      input: testCase.input ?? testCase.inputData ?? '',
      output: '',
      result: undefined,
      setResult: (value: unknown) => {
        sandbox.result = value;
      },
    } as any;

    const context = vm.createContext(sandbox, { name: 'local-sandbox' });
    const scriptText = `"use strict";
      try {
        ${code}
      } catch (error) {
        throw error;
      }
    `;

    let stderr = '';
    let status: RunResult['status'] = 'accepted';
    let stdout = '';

    try {
      const script = new vm.Script(scriptText, { filename: 'sandbox.js' });
      script.runInContext(context, { timeout: 1500 });
      stdout = outputs.join('\n').trim();
    } catch (error) {
      stderr = error instanceof Error ? error.message : String(error);
      status = stderr.includes('Script execution timed out') ? 'time_limit' : 'runtime_error';
    }

    if (status === 'accepted') {
      const expected = String(testCase.expected ?? '').trim();
      const actual = stdout.trim();
      status = expected === actual ? 'accepted' : 'wrong_answer';
    }

    return {
      status,
      stdout,
      stderr,
      timeMs: Date.now() - start,
      memoryKb: 0,
    };
  }
}
