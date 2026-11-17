import { readFileSync } from 'fs';
import * as path from 'path';

// P-6 (17/11): un GET igual que ya está en camino no se repite, y la carga de datos del estudiante no se hace dos veces a
// la vez (antes, en una lección, 4 pedidos salían dos veces y las clases del docente, tres).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('P-6 · pedidos repetidos', () => {
  const api = leer('composables', 'useApi.ts');
  const tienda = leer('stores', 'student.ts');

  it('los GET iguales en camino se comparten y se olvidan al terminar', () => {
    expect(api).toContain('const getsEnCamino = new Map<string, Promise<unknown>>()');
    expect(api).toMatch(/\.finally\(\(\) => getsEnCamino\.delete\(clave\)\)/);
    // La clave lleva el token: dos cuentas nunca comparten una respuesta.
    expect(api).toContain("const clave = `${authStore.token ?? ''} ${endpoint}`");
  });

  it('cada quien recibe su propia copia', () => {
    expect(api).toContain('return enCamino.then((r) => copiar(r as T))');
    expect(api).toContain('structuredClone(r)');
  });

  it('solo los GET: POST, PUT, PATCH y DELETE siempre van', () => {
    for (const m of ['POST', 'PUT', 'PATCH', 'DELETE']) expect(api).toContain(`method: '${m}'`);
    expect(api.match(/getsEnCamino\.set/g)).toHaveLength(1);
  });

  it('la carga del estudiante en curso se espera en vez de repetirse', () => {
    expect(tienda).toContain('cargaEnCurso ??= cargarDatosEstudiante().finally(() => { cargaEnCurso = null })');
    // Cambiar a la clase que ya está cargada (abrir una lección desde cero) no repite los pedidos.
    expect(tienda).toMatch(/if \(cargaEnCurso\) await cargaEnCurso\.catch\(\(\) => undefined\)\s+const yaEsta = hasLoaded\.value && currentClassId\.value === classId/);
    expect(tienda).toContain('if (yaEsta) return');
  });

  it('copiar deja una copia independiente', () => {
    const original = { a: [1, 2], b: { c: 'x' } };
    const copia = structuredClone(original);
    copia.a.push(3);
    expect(original.a).toEqual([1, 2]);
  });
});
