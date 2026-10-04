import { readdirSync, readFileSync, statSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Segunda versión de STIRE (v2.0.0), línea A de la lista de chequeo de interfaz (Pressman, caps. 12–14):
// docs/calidad/listas-chequeo/PLAN_DE_MEJORA.md. El contraste, el teclado y la barra del celular están en
// listas-chequeo-v2.frontend.spec.ts.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
const vues = (dir: string): string[] =>
  readdirSync(path.join(raiz, dir)).flatMap((f) => {
    const rel = path.join(dir, f);
    return statSync(path.join(raiz, rel)).isDirectory() ? vues(rel) : f.endsWith('.vue') ? [rel] : [];
  });
const plantilla = (rel: string) => {
  const s = readFileSync(path.join(raiz, rel), 'utf8');
  const i = s.indexOf('<template');
  return i < 0 ? '' : s.slice(i, s.lastIndexOf('</template>'));
};
const PANTALLAS = [...vues('pages'), ...vues('components'), ...vues('layouts')];

// Carga un archivo de utils/ tal como lo usan las pantallas (Jest no compila frontend-nuxt/).
function cargar<T>(...p: string[]): T {
  const js = ts.transpileModule(leer(...p), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

describe('UX-01 · migas también en el ejercicio', () => {
  it('el encabezado del ejercicio dice Inicio › lección › ejercicio, con la página actual marcada', () => {
    expect(leer('layouts', 'workspace.vue')).toMatch(/<nav aria-label="Ubicación"[\s\S]*?to="\/estudiante"[\s\S]*?:to="backLink"[\s\S]*?aria-current="page"/);
  });
});

describe('UX-02 · confirmar con un diálogo propio, no con window.confirm()', () => {
  it('ninguna pantalla usa confirm() del navegador', () => {
    const con = PANTALLAS.filter((f) => /(^|[^\w.])confirm\(/m.test(readFileSync(path.join(raiz, f), 'utf8')));
    expect(con).toEqual([]);
  });

  it.each(['student.vue', 'teacher.vue', 'admin.vue', 'workspace.vue'])('%s monta el diálogo una sola vez', (layout) => {
    expect(leer('layouts', layout).match(/<DialogoConfirmar \/>/g)?.length).toBe(1);
  });

  it('el diálogo es un alertdialog modal, pone el foco en «Cancelar» y se cierra con Escape', () => {
    const d = leer('components', 'DialogoConfirmar.vue');
    expect(d).toContain('role="alertdialog"');
    expect(d).toContain('aria-modal="true"');
    expect(d).toContain('botonCancelar.value?.focus()');
    expect(d).toContain('useEscapeToClose(');
    // si llega otro pedido con uno abierto, el anterior se responde «no»: nunca dos diálogos encima (PAT-04)
    expect(leer('composables', 'useConfirmar.ts')).toContain('pedido.value?.responder(false)');
  });
});

describe('UX-04 · consistencia: íconos de una sola familia y títulos en estilo de oración', () => {
  const EMOJI = /[\u{1F300}-\u{1FAFF}✅❌⚠✔⏳ℹ⚙⬆⬇✏↩]/u;

  it('ninguna plantilla usa emojis como íconos (salvo los símbolos del registro de consola del ejercicio)', () => {
    const con = PANTALLAS.flatMap((f) =>
      plantilla(f)
        .split('\n')
        .filter((l) => EMOJI.test(l) && !l.trim().startsWith('<!--') && !/log\.startsWith/.test(l))
        .map((l) => `${f}: ${l.trim().slice(0, 80)}`),
    );
    expect(con).toEqual([]);
  });

  it('los títulos ya no usan mayúscula en cada palabra ni «Dashboard»', () => {
    const viejos = ['Iniciar Sesión', 'Crear Cuenta', 'Mi Perfil', 'Mis Clases y Grupos', 'Repasos Diarios de Algoritmia', 'Gestión Global de Usuarios', 'Volver al Dashboard'];
    const con = PANTALLAS.filter((f) => viejos.some((v) => plantilla(f).includes(v)));
    expect(con).toEqual([]);
  });

  // La revisión del «después» encontró 138 rótulos más con mayúscula en cada palabra: menú, docente, administración y
  // constructores de ejercicios. Una muestra de cada pantalla, para que no vuelvan.
  it.each([
    ['components/layout/SidebarNav.vue', ['Mi Progreso', 'Mis Clases', 'Plan de Estudio', 'Gestión Docente', 'Logs y Mantenimiento']],
    ['pages/docente/index.vue', ['Crear Nueva Clase', 'Panel Docente', 'Total Estudiantes', 'Código de Clase']],
    ['pages/docente/rendimiento.vue', ['Alumnos en Rezago', 'Roster de Estudiantes', 'Tasa Éxito']],
    ['pages/docente/mensajes.vue', ['Enviar Mensaje', 'Redactar Mensaje']],
    ['pages/estudiante/mensajes.vue', ['Enviar Mensaje', 'Escribir a un Docente']],
    ['pages/estudiante/index.vue', ['Mis Clases', 'Asignatura Activa']],
    ['pages/estudiante/repasos.vue', ['Volver al Inicio', 'Iniciar Refuerzo']],
    ['pages/estudiante/evaluacion/[activityId].vue', ['Volver al Inicio', 'Historial de Calificación']],
    ['pages/admin/index.vue', ['Gestión de Usuarios', 'Aprobar Solicitud']],
    ['pages/admin/sistema.vue', ['Auditoría y Mantenimiento']],
    ['components/docente/exercise-builders/McqExerciseBuilder.vue', ['Agregar Opción']],
    ['components/docente/exercise-builders/CodingExerciseBuilder.vue', ['Agregar Caso', 'Casos de Prueba']],
  ])('%s usa estilo de oración', (rel, viejos) => {
    const s = leer(...(rel as string).split('/'));
    expect((viejos as string[]).filter((v) => s.includes(v))).toEqual([]);
  });
});

describe('PAT-03 · errores bajo el campo y formato asistido', () => {
  const { faltantesDelIngreso } = cargar<{ faltantesDelIngreso: (c: string, k: string) => Record<string, string> }>('utils', 'registro.ts');
  const { codigoMientrasEscribe } = cargar<{ codigoMientrasEscribe: (t: string) => string }>('utils', 'codigoClase.ts');

  it('el inicio de sesión dice qué arreglar en cada campo', () => {
    expect(faltantesDelIngreso('', '')).toEqual({ email: 'Escribe tu correo.', password: 'Escribe tu contraseña.' });
    expect(faltantesDelIngreso('correo-malo', 'x').email).toMatch(/nombre@dominio\.com/);
    expect(faltantesDelIngreso('ana@unicordoba.edu.co', 'Clave1')).toEqual({});
  });

  it('el formulario no usa el globo del navegador y muestra el error bajo el campo', () => {
    const login = leer('pages', 'auth', 'login.vue');
    expect(login).toContain('<form novalidate @submit.prevent="handleLogin"');
    expect(login).toContain('id="email-falta"');
    expect(login).toContain('id="clave-falta"');
    expect(login).toMatch(/:aria-describedby="faltan\.email \? 'email-falta'/);
  });

  it('el código de clase se escribe en mayúsculas, sin tildes y con guiones, sin borrar el guion del final', () => {
    expect(codigoMientrasEscribe('algo 203413')).toBe('ALGO-203413');
    expect(codigoMientrasEscribe('pensár-')).toBe('PENSAR-');
    expect(codigoMientrasEscribe('a__b--c')).toBe('A-B-C');
  });

  it('MOB-03: los campos del código piden el teclado en mayúsculas y sin autocorrector', () => {
    for (const p of [['pages', 'estudiante', 'clases.vue'], ['pages', 'auth', 'register.vue']]) {
      const s = leer(...p);
      expect(s).toContain('autocapitalize="characters"');
      expect(s).toContain('spellcheck="false"');
      expect(s).toContain('codigoMientrasEscribe(');
    }
  });
});

describe('UX-06 y MOB-04 · el código no se pierde con un F5 ni sin red', () => {
  type B = { code?: string; html?: string; css?: string; at: number } | null;
  const ag = cargar<{
    claveBorrador: (u: number, a: number) => string;
    guardarBorrador: (s: unknown, k: string, d: object, ahora?: number) => void;
    leerBorrador: (s: unknown, k: string) => B;
    borrarBorrador: (s: unknown, k: string) => void;
    borradorDistinto: (b: B, p: object) => boolean;
  }>('utils', 'autoguardado.ts');
  const memoria = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
  };

  it('la copia es por estudiante y por ejercicio, y se lee igual que se guardó', () => {
    const s = memoria();
    const k = ag.claveBorrador(7, 236);
    expect(k).toBe('stire:borrador:7:236');
    ag.guardarBorrador(s, k, { code: 'console.log(1)' }, 1000);
    expect(ag.leerBorrador(s, k)).toEqual({ code: 'console.log(1)', at: 1000 });
    expect(ag.leerBorrador(s, ag.claveBorrador(8, 236))).toBeNull();
    ag.borrarBorrador(s, k);
    expect(ag.leerBorrador(s, k)).toBeNull();
  });

  it('un almacenamiento bloqueado o un dato dañado no rompen nada', () => {
    const roto = {
      getItem: () => { throw new Error('bloqueado'); },
      setItem: () => { throw new Error('lleno'); },
      removeItem: () => { throw new Error('x'); },
    };
    expect(() => ag.guardarBorrador(roto, 'k', { code: 'a' })).not.toThrow();
    expect(ag.leerBorrador(roto, 'k')).toBeNull();
    expect(ag.leerBorrador({ getItem: () => '{no es json', setItem() {}, removeItem() {} }, 'k')).toBeNull();
    expect(ag.leerBorrador({ getItem: () => '{"code":5,"at":1}', setItem() {}, removeItem() {} }, 'k')).toBeNull();
  });

  it('solo se recupera (y se avisa) si el borrador es distinto de la plantilla', () => {
    expect(ag.borradorDistinto({ code: 'plantilla', at: 1 }, { code: 'plantilla' })).toBe(false);
    expect(ag.borradorDistinto({ code: 'mío', at: 1 }, { code: 'plantilla' })).toBe(true);
    expect(ag.borradorDistinto(null, { code: 'x' })).toBe(false);
  });

  it('el store guarda la copia en cada cambio, la recupera al abrir el ejercicio y reintenta al volver la red', () => {
    const store = leer('stores', 'workspace.ts');
    const disparar = store.slice(store.indexOf('function triggerAutosave'), store.indexOf('function restaurarPlantilla'));
    expect(disparar.indexOf('guardarBorrador(')).toBeGreaterThan(-1);
    expect(disparar.indexOf('guardarBorrador(')).toBeLessThan(disparar.indexOf('puedeAutoguardar('));
    expect(store).toMatch(/leerBorrador\(almacen\(\), clave\)[\s\S]*?borradorDistinto\(borrador, plantillaActual\)/);
    expect(store).toMatch(/window\.addEventListener\('online'/);
  });

  it('la pantalla avisa lo recuperado y el aviso de «sin conexión» está en todos los diseños', () => {
    expect(leer('pages', 'estudiante', 'evaluacion', '[activityId].vue')).toContain('<AvisoBorrador />');
    expect(leer('components', 'exercise', 'HtmlCssExercise.vue')).toContain('<AvisoBorrador />');
    for (const l of ['student.vue', 'teacher.vue', 'admin.vue', 'workspace.vue']) expect(leer('layouts', l)).toContain('<AvisoSinConexion />');
    expect(leer('components', 'AvisoSinConexion.vue')).toMatch(/v-if="!enLinea"[\s\S]*role="status"/);
  });
});

describe('Veracidad · el encabezado no nombra un programa que no es', () => {
  // Decía «Unicor · Ing. Sistemas» y «Facultad de Ingeniería de Sistemas»; ahora lo toma de la asignatura de la clase
  // (organizacion-academica.frontend.spec.ts).
  it('no queda «Ingeniería de Sistemas» en el encabezado', () => {
    expect(leer('components', 'layout', 'HeaderNav.vue')).not.toMatch(/Ing. Sistemas|Ingeniería de Sistemas/);
  });
});
