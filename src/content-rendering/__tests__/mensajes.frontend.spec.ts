import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Mensajes (05/10): las dos bandejas, de estudiante y de docente, comparten composable y componentes (PAT-01); cada
// mensaje se lee completo; la ventana de redactar atrapa el foco y se cierra con Escape.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

const u = cargar<{
  otraPersona: (m: Record<string, unknown>, b: string) => string;
  esLargo: (m: { content: string }) => boolean;
  fechaMensaje: (iso: string, ahora?: Date) => string;
}>('mensajes');

describe('reglas de los mensajes', () => {
  const m = { id: 1, senderId: 4, receiverId: 9, content: 'Hola', isRead: false, createdAt: '', sender: { id: 4, fullName: 'Laura' } };
  it('con quién es: quien lo envió en recibidos, a quién se envió en enviados', () => {
    expect(u.otraPersona(m, 'recibidos')).toBe('Laura');
    expect(u.otraPersona(m, 'enviados')).toBe('Usuario #9');
  });
  it('un mensaje largo o con varias líneas se abre con «Leer completo»', () => {
    expect(u.esLargo({ content: 'corto' })).toBe(false);
    expect(u.esLargo({ content: 'x'.repeat(200) })).toBe(true);
    expect(u.esLargo({ content: 'uno\ndos' })).toBe(true);
  });
  it('hoy, la hora; antes, el día', () => {
    const ahora = new Date(2026, 9, 5, 18, 0);
    expect(u.fechaMensaje(new Date(2026, 9, 5, 10, 30).toISOString(), ahora)).toMatch(/10:30/);
    expect(u.fechaMensaje(new Date(2026, 9, 2, 10, 30).toISOString(), ahora)).toMatch(/2/);
  });
});

describe('una sola bandeja para los dos roles', () => {
  it('las páginas no llaman a la API: usan el composable y los componentes compartidos', () => {
    for (const rol of ['estudiante', 'docente']) {
      const p = leer('pages', rol, 'mensajes.vue');
      expect(p).toContain('<MensajesBandejaMensajes');
      expect(p).toContain('<MensajesVentanaRedactar');
      expect(p).toContain('provide(CLAVE_MENSAJES, estado)');
      expect(p).not.toMatch(/api\.(get|post|patch)/);
      expect(p.split('\n').length).toBeLessThan(110);
    }
  });

  it('cada mensaje se lee completo y nada depende de un clic en la tarjeta', () => {
    const b = leer('components', 'mensajes', 'BandejaMensajes.vue');
    expect(b).toContain("{{ abiertos.has(m.id) ? 'Mostrar menos' : 'Leer completo' }}");
    expect(b).toContain(':aria-expanded="abiertos.has(m.id)"');
    expect(b).toContain('whitespace-pre-line');
    expect(b).not.toMatch(/<li[^>]*@click/);
    expect(b).toContain('Marcar como leído');
  });

  it('la ventana de redactar usa la base con foco atrapado y Escape, y el foco vuelve al botón', () => {
    const v = leer('components', 'mensajes', 'VentanaRedactar.vue');
    expect(v).toContain('<AdminDialogo');
    expect(v).toContain('devolver-foco="redactar-mensaje"');
    expect(leer('components', 'mensajes', 'BandejaMensajes.vue')).toContain('id="redactar-mensaje"');
  });

  it('sin «any»: los errores se tratan como unknown', () => {
    expect(leer('composables', 'useMensajes.ts')).not.toMatch(/:\s*any\b/);
  });
});
