import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Sugerencias de Julio en STIRE (16/10, como docente de Pensamiento).
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as T;
}

describe('n.º 12: la ficha del estudiante muestra todo el historial de entregas', () => {
  const h = cargar<{ textoConteo: (v: number, t: number) => string; estadoEntrega: (s: string) => string }>('historialEntregas');

  it('dice cuántas se ven de cuántas hay', () => {
    expect(h.textoConteo(20, 47)).toBe('Las 20 más recientes de 47');
    expect(h.textoConteo(47, 47)).toBe('47 entregas');
    expect(h.textoConteo(1, 1)).toBe('1 entrega');
    expect(h.estadoEntrega('graded')).toBe('Calificado');
  });

  it('la ficha usa el historial por páginas y no la lista de las 5 recientes', () => {
    const ficha = leer('pages', 'docente', 'estudiante', '[studentId].vue');
    expect(ficha).toContain('<DocenteHistorialEntregas :student-id="dashboard.studentId" />');
    expect(ficha).not.toContain('v-for="sub in dashboard.recentSubmissions"');
    const comp = leer('components', 'docente', 'HistorialEntregas.vue');
    expect(comp).toContain("datos.entregas<PaginaEntregas>(props.studentId, siguiente)");
    expect(comp).toMatch(/v-if="entregas\.length < total"[\s\S]*?Ver entregas anteriores/);
    expect(comp).not.toContain('useApi(');
    expect(leer('composables', 'useRendimiento.ts')).toContain('/analytics/student/${studentId}/entregas?pagina=${pagina}');
  });
});

describe('n.º 13: los mensajes llevan una imagen y se pueden corregir', () => {
  it('la ventana de escribir tiene la zona de la imagen y el texto pegado con imagen va a ella', () => {
    const v = leer('components', 'mensajes', 'VentanaRedactar.vue');
    expect(v).toContain('<ZonaPantallazo ref="zonaRef" v-model="imagen" titulo="Imagen" texto-alt="Imagen que se enviará con el mensaje" id-base="redactar-imagen" />');
    expect(v).toContain('@paste="pegarEnTexto"');
    for (const pagina of [['docente', 'mensajes.vue'], ['estudiante', 'mensajes.vue']]) {
      const p = leer('pages', ...pagina);
      expect(p).toContain('async function enviarMensaje(imagen: Blob | null) {');
      expect(p).toContain('estado.enviar(destinatario.value, contenido.value, imagen)');
    }
  });

  it('se envía el texto y luego la imagen; si la imagen falla, el aviso no deja reenviar el mensaje', () => {
    const c = leer('composables', 'useMensajes.ts');
    expect(c).toMatch(/api\.post<\{ id: number \}>\('\/message'[\s\S]*?api\.put\(`\/message\/\$\{creado\.id\}\/imagen`, datos\)/);
    expect(c).toContain('El mensaje se envió, pero la imagen no');
    expect(c).toContain("api.patch<Mensaje>(`/message/${m.id}`, { content: contenido.trim() })");
    expect(c).toContain("api.apiFetch<Blob>(`/message/${id}/imagen`, { responseType: 'blob' })");
  });

  it('la bandeja muestra la imagen, «Editar» en los enviados y «Editado» en los corregidos', () => {
    const b = leer('components', 'mensajes', 'BandejaMensajes.vue');
    expect(b).toContain('<MensajesImagenMensaje v-if="m.imagenId" :mensaje-id="m.id" />');
    expect(b).toMatch(/v-if="bandeja === 'enviados' && editando !== m\.id"[\s\S]*?Editar/);
    expect(b).toContain('<p v-if="m.editadoEn && editando !== m.id" class="text-[11px] text-base-texto-secundario">Editado</p>');
    expect(leer('components', 'mensajes', 'ImagenMensaje.vue')).toContain('URL.revokeObjectURL(url.value)');
  });

  it('las sugerencias conservan sus textos en la zona del pantallazo', () => {
    const z = leer('components', 'ZonaPantallazo.vue');
    expect(z).toContain("titulo: 'Pantallazo'");
    expect(z).toContain("textoAlt: 'Pantallazo que se enviará con la sugerencia'");
  });
});
