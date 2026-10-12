import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 12/10, Jeider probando en su celular: el Tutor en el ejercicio, el teclado, las notificaciones y moverse entre lecciones.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(...p: string[]): T {
  const js = ts.transpileModule(leer(...p), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

type Req = { moduloId: number; titulo: string; dominio: number; umbral: number } | null;
type Estado = { id: number; abierto: boolean; dominio: number; requiere: Req };
type Unidad = { id: number; title: string; status: 'dominado' | 'en-progreso' | 'por-iniciar' | 'bloqueado'; masteryPercentage: number };
const nav = cargar<{
  navegacionLeccion: (
    m: Array<{ id: number; title: string; units: Unidad[] }>,
    e: Estado[],
    unitId: number,
  ) => {
    anterior: { id: number } | null;
    siguiente: { id: number; abierta: boolean } | null;
    posicion: { n: number; total: number; modulo: string } | null;
    modulos: Array<{ abierto: boolean; requiere: string | null; lecciones: Array<{ id: number; actual: boolean }> }>;
  };
}>('utils', 'navegacionLeccion.ts');
const noti = cargar<{
  grupoDeFecha: (f: string, ahora: Date) => string;
  agruparNotificaciones: (l: Array<{ id: number; isRead: boolean; createdAt: string }>, soloSinLeer: boolean, ahora: Date) => Array<{ grupo: string; items: Array<{ id: number }> }>;
  textoVacio: (soloSinLeer: boolean, hayLeidas: boolean) => string;
}>('utils', 'notificaciones.ts');
const textos = cargar<{
  avisoRepasosLargo: (r: { overdueCount: number; oldest?: { daysOverdue: number; learningUnitTitle?: string | null } | null } | null) => string | null;
  textoPensando: (s: number) => string;
}>('utils', 'textosTutor.ts');
const modelo = cargar<{ nombreModelo: (m: string | null) => string }>('utils', 'modeloTutor.ts');

describe('celular: moverse entre lecciones como en el computador', () => {
  const u = (id: number, status: Unidad['status'] = 'por-iniciar', m = 0): Unidad => ({ id, title: `L${id}`, status, masteryPercentage: m });
  const modulos = [
    { id: 1, title: 'Módulo 1', units: [u(10, 'dominado', 100), u(11, 'en-progreso', 40)] },
    { id: 2, title: 'Módulo 2', units: [u(20), u(21)] },
  ];
  const estados: Estado[] = [
    { id: 1, abierto: true, dominio: 70, requiere: null },
    { id: 2, abierto: false, dominio: 0, requiere: { moduloId: 1, titulo: 'Módulo 1', dominio: 70, umbral: 80 } },
  ];

  it('anterior y siguiente siguen el plan entero, también entre módulos, y avisa si el siguiente está cerrado', () => {
    const n = nav.navegacionLeccion(modulos, estados, 11);
    expect(n.anterior?.id).toBe(10);
    expect(n.siguiente).toEqual({ id: 20, titulo: 'L20', abierta: false });
    expect(n.posicion).toEqual({ n: 2, total: 2, modulo: 'Módulo 1' });
    expect(nav.navegacionLeccion(modulos, estados, 10).anterior).toBeNull();
    expect(nav.navegacionLeccion(modulos, estados, 21).siguiente).toBeNull();
  });

  it('la hoja marca la lección actual y dice qué abre cada módulo cerrado (José, UX-01)', () => {
    const n = nav.navegacionLeccion(modulos, estados, 11);
    expect(n.modulos[0].lecciones.find((l) => l.actual)?.id).toBe(11);
    expect(n.modulos[1]).toMatchObject({ abierto: false, requiere: 'Se abre con 80 % de dominio en «Módulo 1» (llevas 70 %).' });
  });

  it('la barra va en la lección, abajo, y se esconde al bajar leyendo', () => {
    expect(leer('pages', 'estudiante', 'unidad', '[id].vue')).toContain('<EstudianteNavegacionLeccion :unit-id="unitId" />');
    const c = leer('components', 'estudiante', 'NavegacionLeccion.vue');
    expect(c).toContain("oculta && !hojaAbierta ? 'translate-y-full' : 'translate-y-0'");
    expect(c).toContain('id="tutor-barra"');
  });
});

describe('notificaciones: menos ruido (12/10, Jeider: «se acumulan mucho»)', () => {
  const ahora = new Date(2026, 9, 12, 15, 0);
  it('se agrupan por día: Hoy, Ayer, Esta semana, Antes', () => {
    expect(noti.grupoDeFecha(new Date(2026, 9, 12, 8).toISOString(), ahora)).toBe('Hoy');
    expect(noti.grupoDeFecha(new Date(2026, 9, 11, 23).toISOString(), ahora)).toBe('Ayer');
    expect(noti.grupoDeFecha(new Date(2026, 9, 8).toISOString(), ahora)).toBe('Esta semana');
    expect(noti.grupoDeFecha(new Date(2026, 9, 1).toISOString(), ahora)).toBe('Antes');
  });

  it('«Sin leer» deja solo las nuevas; el vacío dice por qué', () => {
    const l = [
      { id: 1, isRead: false, createdAt: new Date(2026, 9, 12, 9).toISOString() },
      { id: 2, isRead: true, createdAt: new Date(2026, 9, 12, 8).toISOString() },
      { id: 3, isRead: false, createdAt: new Date(2026, 9, 1).toISOString() },
    ];
    expect(noti.agruparNotificaciones(l, true, ahora).map((g) => [g.grupo, g.items.map((n) => n.id)])).toEqual([['Hoy', [1]], ['Antes', [3]]]);
    expect(noti.agruparNotificaciones(l, false, ahora)[0].items.map((n) => n.id)).toEqual([1, 2]);
    expect(noti.textoVacio(true, true)).toBe('No tienes notificaciones sin leer.');
  });
});

describe('el Tutor con el teclado abierto deja espacio para leer', () => {
  const d = leer('components', 'tutor', 'TutorChatDrawer.vue');
  it('escribiendo en el celular, la cabecera se compacta y las franjas se esconden', () => {
    expect(d).toContain('const compacto = computed(() => !pantallaAncha.value && escribiendo.value)');
    expect(d).toContain('v-if="activeContextLabel && !compacto"');
    expect(d).toContain('v-if="tutorStore.guidanceLevel !== null && !compacto"');
    expect(d).toContain('<p v-if="!compacto" class="text-[11px] text-slate-200">');
  });
  it('tocar Enviar no cierra el teclado', () => {
    expect(d).toMatch(/@mousedown\.prevent\s+@click="handleSend"/);
  });
  it('en Android el teclado achica la página (interactive-widget)', () => {
    expect(leer('nuxt.config.ts')).toContain('interactive-widget=resizes-content');
  });
  it('los textos del panel siguen iguales', () => {
    expect(textos.avisoRepasosLargo({ overdueCount: 2, oldest: { daysOverdue: 1, learningUnitTitle: 'Bucles' } })).toBe('Tienes 2 repasos vencidos. El más atrasado: «Bucles» (hace 1 día).');
    expect(textos.avisoRepasosLargo({ overdueCount: 0 })).toBeNull();
    expect(textos.textoPensando(9)).toBe('Sigo trabajando en tu respuesta…');
  });
});

describe('José, UX-04: el modelo del Tutor en palabras', () => {
  it('«gemini-flash-latest» se lee como «Gemini (modelo rápido)»', () => {
    expect(modelo.nombreModelo('gemini-flash-latest')).toBe('Gemini (modelo rápido)');
    expect(modelo.nombreModelo('gemini-2.5-pro')).toBe('Gemini 2.5 (modelo avanzado)');
    expect(modelo.nombreModelo(null)).toBe('—');
  });
});
