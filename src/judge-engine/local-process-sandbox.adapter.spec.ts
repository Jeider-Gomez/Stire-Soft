import { LocalProcessSandboxAdapter } from './local-process-sandbox.adapter';
import { DockerSandboxAdapter } from './docker-sandbox.service';

describe('LocalProcessSandboxAdapter', () => {
  let adapter: LocalProcessSandboxAdapter;

  beforeEach(() => {
    adapter = new LocalProcessSandboxAdapter();
  });

  it('should capture console.log output for valid JavaScript code', async () => {
    const result = await adapter.executeIsolated("console.log('Hola Mundo')", 'javascript', {
      expected: 'Hola Mundo',
    });

    expect(result.status).toBe('accepted');
    expect(result.stdout).toBe('Hola Mundo');
    expect(result.stderr).toBe('');
  });

  it('should return a controlled runtime_error for syntax errors', async () => {
    const result = await adapter.executeIsolated('const a = ;', 'javascript', {
      expected: '',
    });

    expect(result.status).toBe('runtime_error');
    expect(result.stderr).toContain('Unexpected');
    expect(result.stdout).toBe('');
  });

  it('should reject unsupported languages with a clear message', async () => {
    const result = await adapter.executeIsolated('print("Hola")', 'python', {
      expected: '',
    });

    expect(result.status).toBe('runtime_error');
    expect(result.stderr).toContain('Local sandbox only supports JavaScript');
  });
});

describe('DockerSandboxAdapter (mock)', () => {
  let adapter: DockerSandboxAdapter;

  beforeEach(() => {
    adapter = new DockerSandboxAdapter();
  });

  it('should return accepted when code contains a success marker', async () => {
    const result = await adapter.executeIsolated('console.log("bad")', 'javascript', {
      expected: 'mock_match',
    });

    expect(result.status).toBe('accepted');
    expect(result.stdout).toBe('mock_match');
  });

  it('should return wrong_answer for non-matching output', async () => {
    const result = await adapter.executeIsolated('console.log("bad")', 'javascript', {
      expected: 'wrong_value',
    });

    expect(result.status).toBe('wrong_answer');
    expect(result.stdout).toContain('Output incorrecto');
  });
});
