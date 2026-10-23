import { readFileSync, readdirSync, statSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Recorrido guiado dentro de STIRE (S10-J04, Jeider a cargo, 18/10): el SUS del equipo bajó sobre todo por «necesitaría
// ayuda de una persona técnica». La primera vez en cada pantalla, un recorrido corto señala sus partes.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
  return mod.exports as T;
}

type Paso = { elemento?: string; titulo: string; texto: string; hazloTu?: boolean };
type Recorrido = { id: string; rol: string; pantalla: string; manual?: string; pasos: Paso[] };
const r = cargar<{
  RECORRIDOS: Recorrido[];
  recorridoDeRuta: (ruta: string, rol: string) => Recorrido | null;
  claveVisto: (id: string, usuario: number | null) => string;
}>('recorridos');

/** Todo el código de las pantallas, para comprobar que cada paso señala algo que existe. */
function vues(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? vues(p) : n.endsWith('.vue') ? [readFileSync(p, 'utf8')] : [];
  });
}
const pantallas = ['components', 'pages', 'layouts'].flatMap((d) => vues(path.join(raiz, d))).join('\n');

describe('recorrido guiado', () => {
  it('cada pantalla clave del estudiante y del docente tiene su recorrido', () => {
    expect(r.recorridoDeRuta('/estudiante', 'estudiante')?.id).toBe('estudiante-inicio');
    expect(r.recorridoDeRuta('/estudiante/unidad/12', 'estudiante')?.id).toBe('estudiante-leccion');
    expect(r.recorridoDeRuta('/estudiante/evaluacion/40', 'estudiante')?.id).toBe('estudiante-ejercicio');
    expect(r.recorridoDeRuta('/estudiante/progreso/', 'estudiante')?.id).toBe('estudiante-progreso');
    expect(r.recorridoDeRuta('/docente', 'docente')?.id).toBe('docente-inicio');
    expect(r.recorridoDeRuta('/docente/clase/5', 'docente')?.id).toBe('docente-clase');
    expect(r.recorridoDeRuta('/docente/contenidos', 'docente')?.id).toBe('docente-contenidos');
    expect(r.recorridoDeRuta('/docente/rendimiento', 'docente')?.id).toBe('docente-estudiantes');
    expect(r.recorridoDeRuta('/docente/clase/5/notas', 'docente')?.id).toBe('docente-notas');
    expect(r.recorridoDeRuta('/admin', 'administrador')?.id).toBe('admin-usuarios');
    expect(r.recorridoDeRuta('/admin/sugerencias', 'administrador')?.id).toBe('admin-sugerencias');
    expect(r.recorridoDeRuta('/admin/usabilidad', 'administrador')?.id).toBe('admin-usabilidad');
    expect(r.recorridoDeRuta('/estudiante/repasos', 'estudiante')?.id).toBe('estudiante-repasos');
    expect(r.recorridoDeRuta('/estudiante/clases', 'estudiante')?.id).toBe('estudiante-clases');
    expect(r.recorridoDeRuta('/estudiante/asistencia', 'estudiante')?.id).toBe('estudiante-asistencia');
    expect(r.recorridoDeRuta('/docente/clase/5/asistencia', 'docente')?.id).toBe('docente-asistencia');
    expect(r.recorridoDeRuta('/estudiante/mensajes', 'estudiante')?.id).toBe('estudiante-mensajes');
    expect(r.recorridoDeRuta('/estudiante/logros', 'estudiante')?.id).toBe('estudiante-logros');
    expect(r.recorridoDeRuta('/estudiante/perfil', 'estudiante')?.id).toBe('estudiante-perfil');
    expect(r.recorridoDeRuta('/docente/entregas', 'docente')?.id).toBe('docente-entregas');
    expect(r.recorridoDeRuta('/docente/ejercicios/crear', 'docente')?.id).toBe('docente-crear-ejercicio');
    expect(r.recorridoDeRuta('/docente/mensajes', 'docente')?.id).toBe('docente-mensajes');
    expect(r.recorridoDeRuta('/admin/dashboard', 'administrador')?.id).toBe('admin-estado');
    expect(r.recorridoDeRuta('/estudiante/proyectos', 'estudiante')?.id).toBe('estudiante-proyectos');
    expect(r.recorridoDeRuta('/docente/perfil', 'docente')?.id).toBe('docente-perfil');
    expect(r.recorridoDeRuta('/docente/refuerzos', 'docente')?.id).toBe('docente-refuerzos');
    expect(r.recorridoDeRuta('/docente/clase/5/ajustes', 'docente')?.id).toBe('docente-ajustes');
    expect(r.recorridoDeRuta('/admin/perfil', 'administrador')?.id).toBe('admin-perfil');
    expect(r.recorridoDeRuta('/admin/catalogo', 'administrador')?.id).toBe('admin-catalogo');
    expect(r.recorridoDeRuta('/admin/sistema', 'administrador')?.id).toBe('admin-registros');
    // Otra pantalla u otro rol: sin recorrido (y sin botón «?»).
    expect(r.recorridoDeRuta('/docente/refuerzos/nuevo', 'docente')).toBeNull();
    expect(r.recorridoDeRuta('/admin', 'docente')).toBeNull();
    expect(r.recorridoDeRuta('/estudiante', 'docente')).toBeNull();
  });

  it('cada paso señala un elemento que existe en las pantallas (data-recorrido o un id que ya estaba)', () => {
    for (const rec of r.RECORRIDOS) {
      for (const [i, p] of rec.pasos.entries()) {
        // Sin elemento, solo la bienvenida del inicio, como primer paso.
        if (!p.elemento) {
          expect(i).toBe(0);
          expect(p.titulo).toBe('Bienvenido a STIRE');
          continue;
        }
        const marca = /data-recorrido="([^"]+)"/.exec(p.elemento)?.[1];
        const id = /^#([\w-]+)$/.exec(p.elemento)?.[1];
        const aria = /^\[aria-labelledby="([^"]+)"\]$/.exec(p.elemento)?.[1];
        const nav = /^(?:nav)?\[aria-label="([^"]+)"\]$/.exec(p.elemento)?.[1];
        if (marca) expect(pantallas).toContain(`data-recorrido="${marca}"`);
        else if (id) expect(pantallas).toContain(`id="${id}"`);
        else if (aria) expect(pantallas).toContain(`aria-labelledby="${aria}"`);
        else if (nav) expect(pantallas).toContain(`aria-label="${nav}"`);
        else throw new Error(`Selector sin comprobar: ${p.elemento}`);
      }
    }
  });

  it('textos cortos, en palabras de usuario (hasta 5 pasos, sin contar la bienvenida)', () => {
    for (const rec of r.RECORRIDOS) {
      expect(rec.pasos.filter((p) => p.elemento).length).toBeLessThanOrEqual(5);
      for (const p of rec.pasos) expect(p.texto.length).toBeLessThanOrEqual(160);
    }
  });

  it('cada recorrido enlaza a una tarea del manual que existe, y la bienvenida está en el inicio de cada rol', () => {
    const manual = cargar<{ MANUAL: Array<{ tareas: Array<{ id: string }> }> }>('manual');
    const tareas = new Set(manual.MANUAL.flatMap((s) => s.tareas.map((t) => t.id)));
    for (const rec of r.RECORRIDOS) expect(tareas.has(rec.manual ?? '')).toBe(true);
    for (const id of ['estudiante-inicio', 'docente-inicio', 'admin-usuarios']) {
      expect(r.RECORRIDOS.find((x) => x.id === id)?.pasos[0].titulo).toBe('Bienvenido a STIRE');
    }
  });

  it('«hazlo tú»: en el ejercicio, tocar «Probar código» o el Tutor lleva al paso siguiente', () => {
    const ejercicio = r.RECORRIDOS.find((x) => x.id === 'estudiante-ejercicio');
    expect(ejercicio?.pasos.filter((p) => p.hazloTu).map((p) => p.elemento)).toEqual(['[data-recorrido="probar"]', '#lanzador-tutor']);
    const c = leer('composables', 'useRecorrido.ts');
    expect(c).toContain('advanceOnClick: p.hazloTu ?? false');
    expect(c).toContain('if (r.manual) globo.description.appendChild(enlaceAlManual(r.manual))');
  });

  it('sale solo la primera vez (por persona y pantalla) y se repite desde «?» en la cabecera', () => {
    expect(r.claveVisto('estudiante-inicio', 7)).toBe('stire-recorrido-estudiante-inicio-7');
    const c = leer('composables', 'useRecorrido.ts');
    expect(c).toContain('if (!r || yaVisto(r) || !apariencia.value.recorridosAutomaticos) return');
    expect(c).toContain('onDestroyed: () => marcarVisto(r)');
    expect(c).toContain('.filter((p) => seVe(p.elemento))');
    expect(c).toContain("showButtons: pasos.length > 1 ? ['next', 'previous', 'close'] : ['next', 'close']");
    expect(c).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(c).toContain("setAttribute('aria-label', 'Cerrar el recorrido')");
    // El «?» es ahora el menú de ayuda (MenuAyuda.vue): en la cabecera y en el ejercicio, con el recorrido si lo hay.
    expect(leer('components', 'layout', 'HeaderNav.vue')).toContain('<LayoutMenuAyuda />');
    expect(leer('layouts', 'workspace.vue')).toContain('<LayoutMenuAyuda :con-sugerencias="false" class="shrink-0" />');
    const m = leer('components', 'layout', 'MenuAyuda.vue');
    expect(m).toContain('<li v-if="recorrido.actual.value">');
    expect(m).toContain('recorrido.mostrar()');
    for (const l of ['student.vue', 'teacher.vue', 'workspace.vue', 'admin.vue']) {
      expect(leer('layouts', l)).toContain('watch(() => rutaActual.path, primeraVez, { immediate: true })');
    }
  });
});

// 23/10, pedido del dueño: saltar el recorrido y no volver a verlo solo.
describe('«Saltar recorrido» y «No volver a mostrar recorridos»', () => {
  it('cada globo trae las dos opciones; saltar cierra (y marca visto) y la casilla apaga los automáticos', () => {
    const c = leer('composables', 'useRecorrido.ts');
    expect(c).toContain("saltar.textContent = 'Saltar recorrido'");
    expect(c).toContain("document.createTextNode('No volver a mostrar recorridos')");
    expect(c).toContain('pasos.length > 1 ? () => recorrido.destroy() : null');
    expect(c).toContain('(apagar) => cambiar({ recorridosAutomaticos: !apagar })');
    expect(c).toContain('onDestroyed: () => marcarVisto(r)');
    // Apagados, no aparecen solos ni tras la espera; «?» (mostrar) sigue funcionando.
    expect(c).toContain('!yaVisto(r) && apariencia.value.recorridosAutomaticos) dibujar(r)');
    expect(c).toMatch(/function mostrar\(\) \{\s+if \(actual\.value\) dibujar\(actual\.value\)/);
  });

  it('se vuelve a encender en Apariencia › Ayuda, y por defecto están encendidos', () => {
    const ajustes = leer('components', 'perfil', 'AparienciaLectura.vue');
    expect(ajustes).toContain('<legend class="text-xs font-semibold text-base-texto-primario mb-1">Ayuda</legend>');
    expect(ajustes).toContain('cambiar({ recorridosAutomaticos: !a.recorridosAutomaticos })');
    const ap = leer('utils', 'apariencia.ts');
    expect(ap).toContain('recorridosAutomaticos: true,');
    expect(ap).toContain('recorridosAutomaticos: p.recorridosAutomaticos !== false');
  });

  it('las opciones se tocan bien en el celular (44 px)', () => {
    const css = leer('assets', 'css', 'recorrido.css');
    expect(css).toMatch(/\.recorrido-opciones label \{[^}]*min-height: 44px/);
    expect(css).toMatch(/\.recorrido-saltar \{[^}]*min-height: 44px/);
  });
});
