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
      // 17/11: el estudiante habla con su profe en un chat (cuadro «E-Clase-Mensajes»); el docente sigue con su bandeja.
      expect(p).toContain(rol === 'estudiante' ? '<MensajesConversacionProfe' : '<MensajesBandejaMensajes');
      if (rol === 'docente') expect(p).toContain('<MensajesVentanaRedactar');
      expect(p).toContain('provide(CLAVE_MENSAJES, estado)');
      expect(p).not.toMatch(/api\.(get|post|patch)/);
      expect(p.split('\n').length).toBeLessThan(120);
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

// 17/11 (Jeider: «en el chat no tenemos coherencia con el diseño»): el estudiante habla con su profe en un chat.
describe('El chat con el profe (cuadro «E-Clase-Mensajes»)', () => {
  const m = cargar<{
    conversacionCon: (l: Array<{ id: number; senderId: number; receiverId: number; createdAt: string }>, otro: number) => Array<{ id: number }>;
    diaDeMensaje: (iso: string, ahora?: Date) => string;
  }>('mensajes');

  it('junta lo enviado y lo recibido con ese profe, del más viejo al más nuevo y sin repetir', () => {
    const l = [
      { id: 3, senderId: 9, receiverId: 1, createdAt: '2026-11-04T17:30:00Z' },
      { id: 1, senderId: 1, receiverId: 9, createdAt: '2026-11-04T16:12:00Z' },
      { id: 2, senderId: 1, receiverId: 7, createdAt: '2026-11-04T16:20:00Z' },
      { id: 3, senderId: 9, receiverId: 1, createdAt: '2026-11-04T17:30:00Z' },
    ];
    expect(m.conversacionCon(l, 9).map((x) => x.id)).toEqual([1, 3]);
  });

  it('separa por día: Hoy, Ayer o el día con su fecha', () => {
    const ahora = new Date(2026, 10, 17, 10);
    expect(m.diaDeMensaje(new Date(2026, 10, 17, 8).toISOString(), ahora)).toBe('Hoy');
    expect(m.diaDeMensaje(new Date(2026, 10, 16, 20).toISOString(), ahora)).toBe('Ayer');
    expect(m.diaDeMensaje(new Date(2026, 10, 4, 9).toISOString(), ahora)).toBe('Miércoles 4 nov');
  });

  it('avisos y chat a la vez; Enter envía y se puede adjuntar una imagen', () => {
    const p = leer('pages', 'estudiante', 'mensajes.vue');
    expect(p).toContain('lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]');
    const c = leer('components', 'mensajes', 'ConversacionProfe.vue');
    expect(c).toContain('@keydown.enter.exact.prevent="enviar"');
    expect(c).toContain('<input type="file" accept="image/*"');
    expect(c).toContain('role="log"');
  });
});
