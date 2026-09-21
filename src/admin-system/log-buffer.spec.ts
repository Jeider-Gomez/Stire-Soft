import { LogBuffer, redactSecrets } from './log-buffer';
import { BufferedLogger } from './buffered-logger';

describe('redactSecrets', () => {
  it('oculta tokens Bearer y JWT', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.firmaDePruebaMuyLarga';
    expect(redactSecrets(`Authorization: Bearer ${jwt}`)).not.toContain(jwt);
    expect(redactSecrets(`token recibido ${jwt}`)).toContain('[jwt oculto]');
  });

  it('oculta claves de Google AI Studio en los dos formatos (AIza… y AQ.…)', () => {
    const clasica = 'AIzaSyD-1234567890abcdefghijklmnopqrstuv';
    const nueva = 'AQ.Ab8RN6KN-I5K1oUNsiQVPOcNgA59mwAxeeNl';
    const out = redactSecrets(`falla con ${clasica} y con ${nueva}`);
    expect(out).not.toContain(clasica);
    expect(out).not.toContain(nueva);
    expect(out).toContain('[clave de Google oculta]');
  });

  it('oculta la cabecera x-goog-api-key y pares password/secret/token', () => {
    expect(redactSecrets('headers: x-goog-api-key: abc123secreto')).not.toContain('abc123secreto');
    expect(redactSecrets('password=hunter2&user=ana')).not.toContain('hunter2');
    expect(redactSecrets('{"contraseña":"Cl4ve!"}')).not.toContain('Cl4ve!');
    expect(redactSecrets('JWT_SECRET=supersecreto')).not.toContain('supersecreto');
  });

  it('no altera texto que no contiene secretos', () => {
    const texto = 'Nest application successfully started on port 3001';
    expect(redactSecrets(texto)).toBe(texto);
  });
});

describe('LogBuffer', () => {
  it('conserva solo los últimos `capacity` eventos', () => {
    const buffer = new LogBuffer(3);
    ['a', 'b', 'c', 'd', 'e'].forEach((m) => buffer.push('log', m));
    expect(buffer.size).toBe(3);
    expect(buffer.recent(10).map((e) => e.message)).toEqual(['e', 'd', 'c']);
  });

  it('devuelve los más recientes primero y respeta el límite', () => {
    const buffer = new LogBuffer(10);
    ['1', '2', '3', '4'].forEach((m) => buffer.push('log', m));
    expect(buffer.recent(2).map((e) => e.message)).toEqual(['4', '3']);
  });

  it('filtra por nivel', () => {
    const buffer = new LogBuffer(10);
    buffer.push('log', 'info 1');
    buffer.push('error', 'fallo');
    buffer.push('warn', 'aviso');
    expect(buffer.recent(10, ['error']).map((e) => e.message)).toEqual(['fallo']);
    expect(buffer.recent(10, ['warn', 'error']).map((e) => e.message)).toEqual(['aviso', 'fallo']);
  });

  it('redacta secretos y acota el largo del mensaje al guardarlo', () => {
    const buffer = new LogBuffer(5);
    buffer.push('error', `fallo con Bearer abc.def.ghi y ${'x'.repeat(2000)}`);
    const [entry] = buffer.recent(1);
    expect(entry.message).not.toContain('abc.def.ghi');
    expect(entry.message.length).toBeLessThanOrEqual(500);
  });

  it('acepta errores y objetos como mensaje sin lanzar', () => {
    const buffer = new LogBuffer(5);
    buffer.push('error', new Error('boom'));
    buffer.push('log', { a: 1 });
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => buffer.push('log', circular)).not.toThrow();
    expect(buffer.recent(3).map((e) => e.message)).toEqual(expect.arrayContaining(['Error: boom', '{"a":1}']));
  });
});

describe('BufferedLogger', () => {
  let stdout: jest.SpyInstance;
  let stderr: jest.SpyInstance;

  beforeEach(() => {
    stdout = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderr = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });
  afterEach(() => {
    stdout.mockRestore();
    stderr.mockRestore();
  });

  it('deja el evento en el buffer con su nivel y su contexto, además de escribir en consola', () => {
    const buffer = new LogBuffer(10);
    const logger = new BufferedLogger(buffer);
    logger.log('arranque listo', 'NestApplication');
    logger.warn('memoria alta', 'SandboxPool');
    logger.error('se cayó algo', 'traza\nlinea2', 'JudgeWorker');

    const entries = buffer.recent(10);
    expect(entries.map((e) => [e.level, e.context, e.message])).toEqual([
      ['error', 'JudgeWorker', 'se cayó algo'],
      ['warn', 'SandboxPool', 'memoria alta'],
      ['log', 'NestApplication', 'arranque listo'],
    ]);
    expect(stdout.mock.calls.length + stderr.mock.calls.length).toBeGreaterThan(0);
  });

  it('no toma un stack como si fuera el contexto', () => {
    const buffer = new LogBuffer(10);
    new BufferedLogger(buffer).error('boom', 'Error: x\n    at foo (a.ts:1:1)');
    expect(buffer.recent(1)[0].context).toBeNull();
  });
});
