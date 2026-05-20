import { Injectable, Logger } from '@nestjs/common';

export interface RunResult {
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'compile_error' | 'runtime_error';
  stdout: string;
  stderr: string;
  timeMs: number;
  memoryKb: number;
}

@Injectable()
export class DockerSandboxService {
  private readonly logger = new Logger(DockerSandboxService.name);

  async executeIsolated(code: string, language: string, testCase: any): Promise<RunResult> {
    this.logger.log(`[DOCKER MOCK] Ejecutando código en ${language}`);
    
    // Aquí iría la lógica real usando Dockerode o exec(`docker run ...`)
    if (code.includes('timeout')) {
      throw new Error('Timeout: Execution exceeded maximum time limit of 2000ms');
    }

    // Simulando retraso de ejecución segura:
    await new Promise(resolve => setTimeout(resolve, 500));

    // MOCK: Comparar con expected output de forma simplificada
    const isCorrect = testCase.expected.trim() === "mock_match" || code.includes("correct");

    return {
      status: isCorrect ? 'accepted' : 'wrong_answer',
      stdout: isCorrect ? testCase.expected : 'Output incorrecto\n',
      stderr: '',
      timeMs: Math.floor(Math.random() * 50) + 10,
      memoryKb: Math.floor(Math.random() * 1024) + 2048,
    };
  }
}
