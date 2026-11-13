// La lección v3 (Fase D, paso 2; cuadros «E-Leccion» y «E-Leccion-Cerrado» del lienzo).
import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Ubicacion = { modulo: string | null; tema: string | null; rotulo: string | null };
const L = cargar<{
  ubicacionLeccion: (m: unknown[], id: number) => Ubicacion;
  anilloMeta: (d: number, meta: number) => { largo: number; lleno: number; marca: number; lectura: string };
}>('leccionV3');

const u = (id: number) => ({ id });
const modulos = [
  { title: 'Módulo 1: Algoritmos', units: [u(1), u(2), u(3)], topics: [{ title: '¿Qué es un algoritmo?', units: [u(1), u(2)] }, { title: 'Variables', units: [u(3)] }] },
  { title: 'Módulo 2: La web', units: [u(4)], topics: [{ title: 'HTML', units: [u(4)] }] },
];

describe('dónde está la lección', () => {
  it('con un tema de varias lecciones: «Módulo 1 · Tema 1 · Lección 2 de 2»', () => {
    expect(L.ubicacionLeccion(modulos, 2)).toEqual({ modulo: 'Módulo 1: Algoritmos', tema: '¿Qué es un algoritmo?', rotulo: 'Módulo 1 · Tema 1 · Lección 2 de 2' });
  });
  it('si el tema es la propia lección, la posición va dentro del módulo y no se repite el tema', () => {
    expect(L.ubicacionLeccion(modulos, 3)).toEqual({ modulo: 'Módulo 1: Algoritmos', tema: null, rotulo: 'Módulo 1 · Lección 3 de 3' });
    expect(L.ubicacionLeccion(modulos, 4).rotulo).toBe('Módulo 2 · Lección 1 de 1');
  });
  it('sin el plan cargado no inventa nada', () => {
    expect(L.ubicacionLeccion([], 2)).toEqual({ modulo: null, tema: null, rotulo: null });
  });
});

describe('el anillo de la meta en la barra', () => {
  it('se llena con el dominio y se lee con palabras', () => {
    const a = L.anilloMeta(62, 85);
    expect(a.lleno).toBeCloseTo(a.largo * 0.38, 0);
    expect(a.lectura).toBe('Tu dominio de esta lección: 62 % de una meta de 85 %. Ir a practicar.');
    expect(L.anilloMeta(140, 85).lleno).toBe(0);
  });
  it('va en la barra de la lección y lleva a «Practica esta lección»', () => {
    const s = leer('components', 'estudiante', 'SaltosLeccion.vue');
    expect(s).toContain('<a href="#ejercicios"');
    expect(s).toContain(':aria-label="anillo.lectura"');
    expect(leer('components', 'estudiante', 'leccion', 'Practica.vue')).toContain('<section id="ejercicios"');
  });
});

describe('la página de la lección', () => {
  const p = leer('pages', 'estudiante', 'unidad', '[id].vue');

  it('portada con dónde está, la lección principal y escuchar; luego practicar', () => {
    expect(p).toContain('<header class="portada-leccion');
    expect(p).toContain('{{ ubicacion.rotulo }}');
    expect(p.indexOf('id="explicacion"')).toBeLessThan(p.indexOf('<ValorarLeccion'));
    expect(p.indexOf('<ValorarLeccion')).toBeLessThan(p.indexOf('<EstudianteLeccionPractica'));
  });

  it('«Otras formas de verla»: al lado en pantallas anchas, bajo el título en las angostas, y solo las que hay', () => {
    expect(p).toContain('<EstudianteLeccionOtrasFormas modo="fila" class="xl:hidden');
    expect(p).toContain('<EstudianteLeccionOtrasFormas modo="lado" class="hidden xl:block"');
    const f = leer('components', 'estudiante', 'leccion', 'OtrasFormas.vue');
    expect(f).toContain('<div v-if="formas.length"');
    expect(f).toContain('document.querySelector(`#explicacion ${s}`)');
    expect(f).toContain("const CLAVE = 'stire-otras-formas-recogidas'");
    // cada explicación extra del docente tiene su sitio al que se llega
    expect(p).toContain(':id="`bloque-${content.id}`"');
  });

  it('la página no habla con la API (PAT-01) y se ve en claro, oscuro y alto contraste', () => {
    expect(p).not.toMatch(/useApi\(\)|api\.(get|post)/);
    const css = leer('assets', 'css', 'inicio-v3.css');
    expect(css).toContain(':root[data-tema="oscuro"] .portada-leccion');
    expect(css).toContain(':root[data-contraste="alto"] .portada-leccion');
  });
});
