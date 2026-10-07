import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 07/10: hallazgos de José en la prueba S08-E01 («las notificaciones no dejan leer el texto completo», «en el teléfono no se
// ven bien») y pedido de Jeider de avisos del docente a toda la clase (citaciones, recordatorios, informes).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Form = { tipo: 'aviso' | 'citacion' | 'recordatorio'; titulo: string; cuerpo: string; fecha: string; lugar: string };
const u = cargar<{
  avisoParaEnviar: (f: Form) => Record<string, unknown>;
  faltaEnAviso: (f: Form, claseId: number) => string | null;
  nombreTipoAviso: (t: Form['tipo']) => string;
}>('avisosClase');

describe('la campana de notificaciones (07/10)', () => {
  const c = leer('components', 'layout', 'NotificationBell.vue');

  it('cada notificación se lee completa: sin cortar el título ni el mensaje', () => {
    expect(c).not.toMatch(/line-clamp|class="[^"]*\btruncate\b/);
    expect(c).toContain('whitespace-pre-line break-words');
  });

  it('en el celular el panel ocupa el ancho de la pantalla; en el computador, una columna', () => {
    expect(c).toContain('fixed inset-x-2 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96');
  });

  it('lleva a donde se resuelve (su enlace) y se pueden marcar todas como leídas', () => {
    expect(c).toContain('if (n.enlace) return n.enlace');
    expect(c).toContain("api.patch('/notifications/read-all')");
    expect(c).toContain('Marcar todas como leídas');
  });
});

describe('avisos a la clase: el formulario', () => {
  const base: Form = { tipo: 'aviso', titulo: 'No hay clase', cuerpo: 'Es festivo', fecha: '', lugar: '' };

  it('dice qué falta antes de publicar, no después de fallar', () => {
    expect(u.faltaEnAviso(base, 0)).toBe('Elige la clase.');
    expect(u.faltaEnAviso({ ...base, titulo: 'x' }, 3)).toBe('Ponle un título corto.');
    expect(u.faltaEnAviso({ ...base, tipo: 'citacion' }, 3)).toBe('Una citación necesita el día y la hora.');
    expect(u.faltaEnAviso(base, 3)).toBeNull();
  });

  it('la fecha del formulario sale en ISO; un aviso sin fecha no la manda aunque haya quedado escrita', () => {
    const cita = u.avisoParaEnviar({ ...base, tipo: 'citacion', fecha: '2026-10-15T08:00', lugar: ' Aula 3 ' });
    expect(cita.fechaEvento).toBe(new Date('2026-10-15T08:00').toISOString());
    expect(cita.lugar).toBe('Aula 3');
    expect(u.avisoParaEnviar({ ...base, fecha: '2026-10-15T08:00', lugar: 'Aula 3' })).toMatchObject({ fechaEvento: null, lugar: null });
  });

  it('las páginas de mensajes tienen la pestaña «Avisos de la clase» (la notificación lleva a ?ver=avisos)', () => {
    for (const rol of ['docente', 'estudiante']) {
      const p = leer('pages', rol, 'mensajes.vue');
      expect(p).toContain('<MensajesPestanasMensajes');
      expect(p).toContain(`<MensajesAvisosClase v-if="verAvisos" rol="${rol}" />`);
    }
    expect(leer('components', 'mensajes', 'PestanasMensajes.vue')).toContain("{ query: { ver: 'avisos' } }");
    expect(u.nombreTipoAviso('citacion')).toBe('Citación');
  });
});
