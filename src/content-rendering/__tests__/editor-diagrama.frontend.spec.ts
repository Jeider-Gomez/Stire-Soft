import { readFileSync, existsSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

function cargar<T>(archivo: string): T {
  const file = path.join(__dirname, '..', '..', '..', 'frontend-nuxt', 'utils', archivo);
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  const requerir = (ruta: string) => cargar(ruta.replace(/^~\/utils\//, '') + '.ts');
  new Function('module', 'exports', 'require', js)(mod, mod.exports, requerir);
  return mod.exports as T;
}

const raizNuxt = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');

describe('Fase 29: Editor visual de diagramas de flujo', () => {
  describe('EditorDiagrama.vue (componente)', () => {
    const rutaComponente = path.join(raizNuxt, 'components', 'proyectos', 'EditorDiagrama.vue');

    it('el componente existe en components/proyectos/EditorDiagrama.vue', () => {
      expect(existsSync(rutaComponente)).toBe(true);
    });

    it('en celular el dedo mueve la figura y no el lienzo (touch-action: none en figuras y puntos de salida)', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toContain(":style=\"soloLectura ? undefined : 'touch-action: none'\"");
      expect(contenido.match(/style="touch-action: none"/g)).toHaveLength(3);
    });

    it('Esc cancela «Unir con…» y Supr quita la flecha elegida, sin interferir al escribir', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toMatch(/e\.key === 'Escape' && \(modoUnion\.value/);
      expect(contenido).toMatch(/\(e\.key === 'Delete' \|\| e\.key === 'Backspace'\) && flechaSeleccionada\.value/);
      expect(contenido).toContain("t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'");
      expect(contenido).toContain("window.removeEventListener('keydown', onTeclaGlobal)");
    });

    it('la página del proyecto no modifica el proyecto dentro de un computed', () => {
      const pagina = readFileSync(path.join(raizNuxt, 'pages', 'estudiante', 'proyectos', '[id].vue'), 'utf8');
      const computedDiagrama = /const archivoDiagrama = computed\(([^\n]*)\)\r?\n/.exec(pagina)?.[1] ?? '';
      expect(computedDiagrama).toContain("find((a) => a.nombre === 'diagrama.json')");
      expect(computedDiagrama).not.toContain('push');
    });

    it('el reloj de la validación se declara antes del watch inmediato que lo usa al cargar (sin error de inicialización)', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      const reloj = contenido.indexOf('let timerValidacion');
      const watchInmediato = contenido.indexOf('{ immediate: true }');
      expect(reloj).toBeGreaterThan(-1);
      expect(reloj).toBeLessThan(watchInmediato);
    });

    it('en un lienzo más angosto que el diagrama (celular) se abre desplazado hasta la primera figura', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toContain('c.scrollWidth <= c.clientWidth');
      expect(contenido).toContain('c.scrollLeft = Math.max(0, Math.min(...diagrama.value.figuras.map((f) => f.x)) - 16)');
    });

    it('no contiene ningún "as any" ni "@ts-ignore"', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).not.toContain('as any');
      expect(contenido).not.toContain('@ts-ignore');
    });

    it('implementa lienzo SVG con patrón de cuadrícula de 20px', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toContain('<svg');
      // El patrón se identifica como patron-rejilla (id en el <defs> del SVG)
      expect(contenido).toContain('patron-rejilla');
      expect(contenido).toContain('width="20"');
      expect(contenido).toContain('height="20"');
    });

    it('ofrece paleta con las figuras requeridas (inicio, fin, proceso, entrada, salida, decisión)', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toContain("agregarFigura('inicio')");
      expect(contenido).toContain("agregarFigura('fin')");
      expect(contenido).toContain("agregarFigura('proceso')");
      expect(contenido).toContain("agregarFigura('entrada')");
      expect(contenido).toContain("agregarFigura('salida')");
      expect(contenido).toContain("agregarFigura('decision')");
    });

    it('valida el diagrama en vivo mediante traducirDiagrama', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toContain('traducirDiagrama');
    });

    it('soporta la propiedad soloLectura para revisiones o vistas protegidas', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toMatch(/soloLectura\??:\s*boolean/);
    });

    it('soporta modo de conexión interactiva (modoUnion) y labels Sí/No para ramas de decisión', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toContain('modoUnion');
      // Las ramas Sí/No aparecen en la computed flechaSeleccionadaData
      expect(contenido).toContain("'Sí'");
      expect(contenido).toContain("'No'");
    });

    it('gestiona estado de error en JSON corrupto con opción de empezar de nuevo', () => {
      const contenido = readFileSync(rutaComponente, 'utf8');
      expect(contenido).toContain('parseError');
      expect(contenido).toContain('Empezar de nuevo');
      expect(contenido).toContain('restablecerDiagrama');
    });
  });

  describe('Integración en páginas del estudiante y del docente', () => {
    it('el estudiante usa ProyectosEditorDiagrama en proyectos de tipo diagrama', () => {
      const estudianteVista = readFileSync(
        path.join(raizNuxt, 'pages', 'estudiante', 'proyectos', '[id].vue'),
        'utf8',
      );
      expect(estudianteVista).toContain("proyecto.tipo === 'diagrama'");
      expect(estudianteVista).toContain('<ProyectosEditorDiagrama');
      expect(estudianteVista).toContain('v-model="archivoDiagrama.contenido"');
    });

    it('el docente revisa proyectos de diagrama con ProyectosEditorDiagrama en solo-lectura', () => {
      const docenteRevision = readFileSync(
        path.join(raizNuxt, 'pages', 'docente', 'entregas', 'revision', '[envioId].vue'),
        'utf8',
      );
      expect(docenteRevision).toContain("envio.tipo === 'diagrama'");
      expect(docenteRevision).toContain('<ProyectosEditorDiagrama');
      expect(docenteRevision).toContain('solo-lectura');
    });

    it('el formulario de entregas permite editar la plantilla con ProyectosEditorDiagrama cuando tipoProyecto es diagrama', () => {
      const form = readFileSync(path.join(raizNuxt, 'components', 'docente', 'EntregaForm.vue'), 'utf8');
      expect(form).toContain("f.tipoProyecto === 'diagrama'");
      expect(form).toContain('<ProyectosEditorDiagrama');
    });
  });

  describe('Utils: proyectoNavegador y entregas', () => {
    const { TIPOS_QUE_SE_CREAN } = cargar<{ TIPOS_QUE_SE_CREAN: string[] }>('proyectoNavegador.ts');
    const { TIPO_ENTREGA, codigoInicialPorDefecto } = cargar<{
      TIPO_ENTREGA: Record<string, string>;
      codigoInicialPorDefecto: (tipo: string) => Array<{ nombre: string; contenido: string }>;
    }>('entregas.ts');
    const { leerDiagrama, diagramaInicial } = cargar<{
      leerDiagrama: (json: string) => { ok: boolean; diagrama?: { version: number; figuras: Array<{ id: string; tipo: string }> }; mensaje?: string };
      diagramaInicial: () => { version: number; figuras: Array<{ id: string; tipo: string }> };
    }>('diagramaFlujo.ts');

    it('TIPOS_QUE_SE_CREAN incluye "diagrama"', () => {
      expect(TIPOS_QUE_SE_CREAN).toContain('diagrama');
    });

    it('TIPO_ENTREGA incluye "diagrama" con su descripción legible', () => {
      expect(TIPO_ENTREGA.diagrama).toBe('Diagrama de flujo');
    });

    it('codigoInicialPorDefecto("diagrama") retorna diagrama.json válido y legible por leerDiagrama', () => {
      const inicial = codigoInicialPorDefecto('diagrama');
      expect(inicial).toHaveLength(1);
      expect(inicial[0].nombre).toBe('diagrama.json');

      const parsed = JSON.parse(inicial[0].contenido) as { version: number; figuras: unknown[] };
      expect(parsed).toHaveProperty('version', 1);
      expect(parsed.figuras.length).toBeGreaterThanOrEqual(2);

      const lectura = leerDiagrama(inicial[0].contenido);
      expect(lectura.ok).toBe(true);
      if (lectura.ok && lectura.diagrama) {
        expect(lectura.diagrama.figuras.some((f) => f.tipo === 'inicio')).toBe(true);
        expect(lectura.diagrama.figuras.some((f) => f.tipo === 'fin')).toBe(true);
      }
    });

    it('diagramaInicial() genera estructura con figuras inicio y fin', () => {
      const d = diagramaInicial();
      expect(d.version).toBe(1);
      expect(d.figuras.some((f) => f.tipo === 'inicio')).toBe(true);
      expect(d.figuras.some((f) => f.tipo === 'fin')).toBe(true);
    });
  });
});
