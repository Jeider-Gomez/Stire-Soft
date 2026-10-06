import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { PREFIJO_QR_ASISTENCIA as PREFIJO_SERVIDOR } from '../../asistencia/asistencia-reglas';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
type Estado = 'presente' | 'tarde' | 'excusa' | 'ausente';
const u = (() => {
  const js = ts.transpileModule(leer('utils', 'asistencia.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as {
    PREFIJO_QR_ASISTENCIA: string;
    esQrDeAsistencia: (t: string) => boolean;
    idDeDispositivo: (a: Pick<Storage, 'getItem' | 'setItem'> | null) => string;
    elegirAlAzar: <T>(l: T[], n: number, azar?: () => number) => T[];
    csvAsistencia: (r: { sesiones: Array<{ id: number; fecha: string; tema: string | null; abierta: boolean }>; filas: Array<{ id: number; nombre: string; email: string; estados: Record<string, Estado | null>; porcentaje: number | null }> }) => string;
    textoEstado: (e: Estado | null) => string;
  };
})();

describe('Asistencia (frontend)', () => {
  it('reconoce el QR de asistencia con el mismo prefijo que el servidor, y no el QR de la clase', () => {
    expect(u.PREFIJO_QR_ASISTENCIA).toBe(PREFIJO_SERVIDOR);
    expect(u.esQrDeAsistencia(' STIRE-ASIS:5.1.abcdefgh.x')).toBe(true);
    expect(u.esQrDeAsistencia('https://stire-soft.vercel.app/estudiante/clases?codigo=ALGO')).toBe(false);
  });

  it('el celular se identifica con un valor al azar que se guarda una vez; sin almacenamiento igual funciona', () => {
    const guardado: Record<string, string> = {};
    const almacen = { getItem: (k: string) => guardado[k] ?? null, setItem: (k: string, v: string) => { guardado[k] = v; } };
    const id = u.idDeDispositivo(almacen);
    expect(id).toMatch(/^[a-z0-9]{12}$/);
    expect(u.idDeDispositivo(almacen)).toBe(id);
    const roto = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } };
    expect(u.idDeDispositivo(roto)).toMatch(/^[a-z0-9]{12}$/);
  });

  it('llamar a lista al azar elige n distintos de los presentes', () => {
    const lista = [1, 2, 3, 4, 5];
    const elegidos = u.elegirAlAzar(lista, 3);
    expect(new Set(elegidos).size).toBe(3);
    expect(elegidos.every((x) => lista.includes(x))).toBe(true);
    expect(u.elegirAlAzar([1], 3)).toEqual([1]);
  });

  it('la planilla lleva correo, nombre, una columna por sesión y el porcentaje', () => {
    const csv = u.csvAsistencia({
      sesiones: [{ id: 1, fecha: '2026-10-01', tema: 'Ciclos, parte 1', abierta: false }, { id: 2, fecha: '2026-10-02', tema: null, abierta: true }],
      filas: [{ id: 5, nombre: 'Luisa Rojas', email: 'luisa@x.co', estados: { 1: 'tarde', 2: null }, porcentaje: 100 }],
    });
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1).split('\r\n')).toEqual([
      'Correo electrónico,Nombre,"2026-10-01 Ciclos, parte 1",2026-10-02,Asistencia (%)',
      'luisa@x.co,Luisa Rojas,Tarde,,100',
      '',
    ]);
    expect(u.textoEstado(null)).toBe('Sin marcar');
  });

  it('el estudiante tiene su QR en el menú y el docente una pestaña en la clase con escáner, marcas a mano y sorteo', () => {
    expect(leer('components', 'layout', 'SidebarNav.vue')).toContain('to="/estudiante/asistencia"');
    const estudiante = leer('pages', 'estudiante', 'asistencia.vue');
    const asistenciaEstudiante = leer('composables', 'useAsistenciaEstudiante.ts');
    expect(asistenciaEstudiante).toContain('/asistencia/mi-codigo?dispositivo=${dispositivo}');
    expect(estudiante).toContain('servicioAsistencia.codigo(idDeDispositivo())');
    expect(estudiante).toContain('clearTimeout(temporizador)');
    const docente = leer('pages', 'docente', 'clase', '[classId]', 'asistencia.vue');
    expect(docente).toContain('<AsistenciaEscanerAsistencia');
    expect(docente).toContain('accionesAsistencia.escanear');
    expect(leer('composables', 'useAsistenciaClase.ts')).toContain('/asistencia/sesiones/${sesionId}/escanear`');
    expect(docente).toContain('elegirAlAzar(presentes.value, 3)');
    // el escáner ignora QR ajenos y el mismo código leído muchas veces por segundo
    const escaner = leer('components', 'asistencia', 'EscanerAsistencia.vue');
    expect(escaner).toContain('if (!esQrDeAsistencia(texto)) return');
    expect(escaner).toContain('> ahora - 5000) return');
  });
});
