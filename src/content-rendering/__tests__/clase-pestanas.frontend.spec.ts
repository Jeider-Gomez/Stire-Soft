import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// La clase como lugar (docs/DISENO_INTERVENCION_DOCENTE.md §8, fase E; BASE_TEORICA.md BT-13): pestañas de la clase y
// la lista «Hoy». Se prueban los archivos reales de frontend-nuxt.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...partes: string[]) => readFileSync(path.join(raiz, ...partes), 'utf8');

function cargar(archivo: string, deps: Record<string, unknown> = {}): Record<string, unknown> {
  const js = ts.transpileModule(leer('utils', archivo), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (nombre: string) => deps[nombre]);
  return mod.exports;
}

const pestanas = cargar('pestanasClase.ts') as {
  enlacePestana: (p: string, id: number) => string;
  claseDeLaRuta: (ruta: string, consulta: Record<string, unknown>) => number | null;
  pestanaDeLaRuta: (ruta: string) => string | null;
  PESTANAS_CLASE: Array<{ id: string }>;
  SECCIONES_MENU: Array<{ id: string; texto: string; incluye: string[] }>;
  seccionDelMenu: (p: string | null) => string | null;
  claseDelMenu: (deLaRuta: number | null, recordada: number | null, ids: number[]) => number | null;
  colorDeClase: (i: number) => string;
};
const { pendientesDeHoy } = cargar('hoyClase.ts', { './refuerzos': cargar('refuerzos.ts') }) as {
  pendientesDeHoy: (d: unknown) => Array<{ clave: string; tipo: string; titulo: string; detalle: string; personas: Array<{ id: number; nota?: string }>; acciones: Array<{ texto: string; to: string }> }>;
};

describe('Pestañas de la clase', () => {
  it('cada pestaña lleva a su pantalla con la clase ya elegida', () => {
    expect(pestanas.PESTANAS_CLASE.map((p) => p.id)).toEqual(['hoy', 'contenido', 'estudiantes', 'asistencia', 'entregas', 'refuerzos', 'notas', 'ajustes']);
    expect(pestanas.enlacePestana('hoy', 5)).toBe('/docente/clase/5');
    expect(pestanas.enlacePestana('contenido', 5)).toBe('/docente/contenidos?classId=5');
    expect(pestanas.enlacePestana('estudiantes', 5)).toBe('/docente/rendimiento?classId=5');
    expect(pestanas.enlacePestana('entregas', 5)).toBe('/docente/entregas?clase=5');
    expect(pestanas.enlacePestana('refuerzos', 5)).toBe('/docente/refuerzos?clase=5');
    expect(pestanas.enlacePestana('notas', 5)).toBe('/docente/clase/5/notas');
    expect(pestanas.enlacePestana('asistencia', 5)).toBe('/docente/clase/5/asistencia');
    expect(pestanas.enlacePestana('ajustes', 5)).toBe('/docente/clase/5/ajustes');
  });

  it('la clase activa sale de la ruta o de la consulta', () => {
    expect(pestanas.claseDeLaRuta('/docente/clase/7/ajustes', {})).toBe(7);
    expect(pestanas.claseDeLaRuta('/docente/rendimiento', { classId: '5' })).toBe(5);
    expect(pestanas.claseDeLaRuta('/docente/entregas', { clase: '3' })).toBe(3);
    expect(pestanas.claseDeLaRuta('/docente/mensajes', {})).toBeNull();
    expect(pestanas.claseDeLaRuta('/docente/entregas', { clase: 'x' })).toBeNull();
  });

  it('la sección de la clase sale de la ruta, para marcarla en la barra lateral', () => {
    expect(pestanas.pestanaDeLaRuta('/docente/clase/7')).toBe('hoy');
    expect(pestanas.pestanaDeLaRuta('/docente/clase/7/')).toBe('hoy');
    expect(pestanas.pestanaDeLaRuta('/docente/clase/7/asistencia')).toBe('asistencia');
    expect(pestanas.pestanaDeLaRuta('/docente/clase/7/notas')).toBe('notas');
    expect(pestanas.pestanaDeLaRuta('/docente/clase/7/ajustes')).toBe('ajustes');
    expect(pestanas.pestanaDeLaRuta('/docente/contenidos')).toBe('contenido');
    expect(pestanas.pestanaDeLaRuta('/docente/rendimiento')).toBe('estudiantes');
    expect(pestanas.pestanaDeLaRuta('/docente/estudiante/12')).toBe('estudiantes');
    expect(pestanas.pestanaDeLaRuta('/docente/entregas/3')).toBe('entregas');
    expect(pestanas.pestanaDeLaRuta('/docente/refuerzos/nuevo')).toBe('refuerzos');
    // lo que no es una sección de la clase no marca ninguna
    expect(pestanas.pestanaDeLaRuta('/docente/mensajes')).toBeNull();
    expect(pestanas.pestanaDeLaRuta('/docente')).toBeNull();
    expect(pestanas.pestanaDeLaRuta('/docente/clase/7/otra')).toBeNull();
    // cada pestaña lleva a una ruta que esa misma función reconoce como suya
    for (const p of pestanas.PESTANAS_CLASE) {
      const ruta = pestanas.enlacePestana(p.id, 5).split('?')[0];
      expect(pestanas.pestanaDeLaRuta(ruta)).toBe(p.id);
    }
  });

  it('cada pantalla de la clase muestra el encabezado con su sección marcada', () => {
    const esperado: Array<[string[], string]> = [
      [['pages', 'docente', 'clase', '[classId]', 'index.vue'], 'activa="hoy"'],
      [['pages', 'docente', 'contenidos.vue'], 'activa="contenido"'],
      [['pages', 'docente', 'rendimiento.vue'], 'activa="estudiantes"'],
      [['pages', 'docente', 'estudiante', '[studentId].vue'], 'activa="estudiantes"'],
      [['pages', 'docente', 'entregas', 'index.vue'], 'activa="entregas"'],
      [['pages', 'docente', 'refuerzos', 'index.vue'], 'activa="refuerzos"'],
      [['pages', 'docente', 'clase', '[classId]', 'notas.vue'], 'activa="notas"'],
      [['pages', 'docente', 'clase', '[classId]', 'asistencia.vue'], 'activa="asistencia"'],
      [['pages', 'docente', 'clase', '[classId]', 'ajustes.vue'], 'activa="ajustes"'],
    ];
    for (const [archivo, activa] of esperado) {
      const vue = leer(...archivo);
      expect(vue).toContain('<DocentePestanasClase');
      expect(vue).toContain(activa);
    }
    expect(existsSync(path.join(raiz, 'pages', 'docente', 'clase', '[classId].vue'))).toBe(false);
    expect(leer('components', 'docente', 'PestanasClase.vue')).toContain(`:aria-current="p.id === activa ? 'page' : undefined"`);
    // En computador las secciones viven en la barra lateral: las pestañas horizontales solo quedan en el celular.
    expect(leer('components', 'docente', 'PestanasClase.vue')).toContain('<nav aria-label="Secciones de la clase" class="md:hidden">');
    // El nombre de la clase (que en «Hoy» enlaza a la página actual) va fuera del <nav>: una sola pestaña actual.
    const pestanasVue = leer('components', 'docente', 'PestanasClase.vue');
    expect(pestanasVue.indexOf('{{ nombre }}')).toBeLessThan(pestanasVue.indexOf('<nav aria-label="Secciones de la clase" class="md:hidden">'));
  });

  it('el menú lleva a cada clase y ya no es un menú por herramienta', () => {
    // Desde el 07/10 las clases del menú viven en ClasesDelMenu.vue (con sus iniciales).
    const menu = leer('components', 'layout', 'SidebarNav.vue') + leer('components', 'layout', 'ClasesDelMenu.vue');
    expect(menu).toContain(`<LayoutClasesDelMenu v-if="authStore.currentRole === 'docente'" />`);
    // al cambiar de clase el docente se queda en la misma sección (Contenido, Entregas…); sin sección, va a «Hoy»
    expect(menu).toContain(`:to="enlacePestana(seccionActual ?? 'hoy', c.id)"`);
    // la clase activa despliega sus secciones debajo, con la actual marcada
    expect(menu).toContain('<li v-for="s in SECCIONES_MENU" :key="s.id">');
    expect(menu).toContain(`:aria-current="p === seccionActual ? 'page' : undefined"`);
    // dos grupos de la misma materia se distinguen por el código
    expect(menu).toContain('{{ c.code }}');
    for (const herramienta of ['to="/docente/contenidos"', 'to="/docente/rendimiento"', 'to="/docente/entregas"', 'to="/docente/refuerzos"']) {
      expect(menu).not.toContain(herramienta);
    }
    // La tarjeta de cada clase en «Mis clases» abre su «Hoy».
    expect(leer('pages', 'docente', 'index.vue')).toContain('<span>Ver hoy en la clase</span>');
  });

  it('la clase se elige solo en la barra lateral: sin selector repetido y las pantallas siguen el cambio', () => {
    for (const archivo of [['pages', 'docente', 'contenidos.vue'], ['pages', 'docente', 'rendimiento.vue'], ['pages', 'docente', 'entregas', 'index.vue'], ['pages', 'docente', 'refuerzos', 'index.vue']]) {
      const vue = leer(...archivo);
      expect(vue).not.toMatch(/<label[^>]*>\s*Clase:?\s*<\/label>/);
      expect(vue).not.toMatch(/<select[^>]*(class-selector|entregas-clase|ref-lista-clase)/);
      // la dirección cambia al elegir otra clase en la barra, pero la pantalla sigue montada: tiene que mirarla
      expect(vue).toMatch(/watch\(\(\) => route\.query\.(classId|clase)/);
    }
  });

  it('en la tarjeta, «N estudiantes» lleva a la misma pantalla que la pestaña «Estudiantes» y el aviso dice quién necesita apoyo', () => {
    const d = leer('pages', 'docente', 'index.vue');
    expect(pestanas.enlacePestana('estudiantes', 7)).toBe('/docente/rendimiento?classId=7');
    expect(d).toMatch(/:to="`\/docente\/rendimiento\?classId=\$\{cls\.id\}`"[\s\S]{0,300}estudiantes`/);
    // «N estudiantes» ya no lleva a Ajustes y el «Activo» que salía igual en todas se fue.
    expect(d).not.toContain(':to="`/docente/clase/${cls.id}/ajustes`"');
    expect(d).not.toMatch(/\n\s*Activo\n/);
    expect(d).toContain("`${cls.atRiskCount} necesitan apoyo`");
  });
});

describe('«Hoy» de la clase', () => {
  const ahora = new Date('2026-09-30T15:00:00Z');
  const haceDias = (n: number) => new Date(ahora.getTime() - n * 86400000).toISOString();
  const enHoras = (n: number) => new Date(ahora.getTime() + n * 3600000).toISOString();
  const vacio = { classId: 5, solicitudes: 0, entregas: [], mapa: { bloqueados: [], segurosQueFallan: [], listosParaMas: [] }, refuerzos: [], ahora };

  it('sin nada pendiente, la lista está vacía («Todo al día»)', () => {
    expect(pendientesDeHoy(vacio)).toEqual([]);
    // una fuente caída no inventa pendientes
    expect(pendientesDeHoy({ ...vacio, solicitudes: null, entregas: null, mapa: null, refuerzos: null })).toEqual([]);
  });

  it('ordena por urgencia: solicitudes, bloqueados, por revisar, salto fallido, refuerzos quietos, cierres y listos', () => {
    const lista = pendientesDeHoy({
      ...vacio,
      solicitudes: 2,
      entregas: [
        { id: 1, titulo: 'Calculadora', cierraAt: enHoras(30), publicada: true, estudiantes: 10, conteo: { sin_entregar: 4, por_revisar: 3, revisada: 3 } },
        { id: 2, titulo: 'Página', cierraAt: enHoras(24 * 10), publicada: true, estudiantes: 10, conteo: { sin_entregar: 9, por_revisar: 0, revisada: 1 } },
      ],
      mapa: {
        bloqueados: [
          { studentId: 16, fullName: 'Luisa Rojas', unitId: 34, unitTitle: 'Else if', fallosSeguidos: 4 },
          { studentId: 17, fullName: 'Julián Ortega', unitId: 34, unitTitle: 'Else if', fallosSeguidos: 3 },
        ],
        segurosQueFallan: [{ studentId: 18, fullName: 'Camila Díaz', unitId: 35, unitTitle: 'Bucles' }],
        listosParaMas: [{ studentId: 19, fullName: 'Daniela Castro' }],
      },
      refuerzos: [
        { id: 9, tipo: 'refuerzo', titulo: 'Otra forma', fechaLimite: null, archivado: false, createdAt: haceDias(4), totalPasos: 3, lecciones: [{ id: 40 }], estudiantes: [{ studentId: 20, nombre: 'Andrés Montes', pasosHechos: 0 }] },
      ],
    });
    expect(lista.map((p) => p.tipo)).toEqual(['solicitudes', 'bloqueados', 'revisar', 'salto_fallido', 'refuerzo_quieto', 'entrega_cierra', 'listos']);
    // los bloqueados de una misma lección van juntos, con un solo refuerzo para los dos
    expect(lista[1].titulo).toBe('2 estudiantes bloqueados en «Else if»');
    expect(lista[1].acciones[0]).toEqual({ texto: 'Asignar refuerzo a los 2', to: '/docente/refuerzos/nuevo?tipo=refuerzo&clase=5&estudiantes=16%2C17&lecciones=34' });
    expect(lista[2]).toMatchObject({ titulo: 'Por revisar: «Calculadora»', detalle: '3 estudiantes esperan tu comentario.' });
    expect(lista[4].titulo).toBe('1 estudiante no ha empezado el refuerzo «Otra forma»');
    expect(lista[5].detalle).toBe('4 de 10 todavía no entregan.');
    expect(lista[6].acciones[0].to).toBe('/docente/refuerzos/nuevo?tipo=reto&clase=5&estudiantes=19');
  });

  it('a quien ya tiene un refuerzo en curso en esa lección no se le propone otro', () => {
    const lista = pendientesDeHoy({
      ...vacio,
      mapa: { ...vacio.mapa, bloqueados: [
        { studentId: 16, fullName: 'Luisa Rojas', unitId: 34, unitTitle: 'Else if', fallosSeguidos: 4 },
        { studentId: 17, fullName: 'Julián Ortega', unitId: 34, unitTitle: 'Else if', fallosSeguidos: 3 },
      ] },
      refuerzos: [{ id: 9, tipo: 'refuerzo', titulo: 'Otra forma', fechaLimite: null, archivado: false, createdAt: haceDias(1), totalPasos: 2, lecciones: [{ id: 34 }], estudiantes: [{ studentId: 16, nombre: 'Luisa Rojas', pasosHechos: 1 }] }],
    });
    expect(lista).toHaveLength(1);
    expect(lista[0].personas).toEqual([{ id: 16, nombre: 'Luisa Rojas', nota: 'ya tiene un refuerzo' }, { id: 17, nombre: 'Julián Ortega', nota: undefined }]);
    expect(lista[0].acciones[0]).toEqual({ texto: 'Asignar refuerzo', to: '/docente/refuerzos/nuevo?tipo=refuerzo&clase=5&estudiantes=17&lecciones=34' });

    // si todos lo tienen, la acción es mirar cómo van
    const todos = pendientesDeHoy({ ...vacio, mapa: { ...vacio.mapa, bloqueados: [{ studentId: 16, fullName: 'Luisa Rojas', unitId: 34, unitTitle: 'Else if', fallosSeguidos: 4 }] },
      refuerzos: [{ id: 9, tipo: 'refuerzo', titulo: 'Otra forma', fechaLimite: null, archivado: false, createdAt: haceDias(1), totalPasos: 2, lecciones: [{ id: 34 }], estudiantes: [{ studentId: 16, nombre: 'Luisa Rojas', pasosHechos: 0 }] }] });
    expect(todos.map((p) => p.acciones[0].texto)).toEqual(['Ver sus refuerzos']);
  });

  it('un refuerzo reciente sin empezar todavía no es pendiente; uno vencido sin terminar sí, con los pasos de cada uno', () => {
    const reciente = { id: 1, tipo: 'refuerzo', titulo: 'R', fechaLimite: null, archivado: false, createdAt: haceDias(2), totalPasos: 3, lecciones: [], estudiantes: [{ studentId: 1, nombre: 'A', pasosHechos: 0 }] };
    expect(pendientesDeHoy({ ...vacio, refuerzos: [reciente] })).toEqual([]);
    expect(pendientesDeHoy({ ...vacio, refuerzos: [{ ...reciente, archivado: true, createdAt: haceDias(9) }] })).toEqual([]);

    const vencido = { ...reciente, tipo: 'reto', fechaLimite: haceDias(1), estudiantes: [{ studentId: 1, nombre: 'A', pasosHechos: 2 }, { studentId: 2, nombre: 'B', pasosHechos: 3 }] };
    const [p] = pendientesDeHoy({ ...vacio, refuerzos: [vencido] });
    expect(p.titulo).toBe('Venció el reto «R» y 1 estudiante no lo terminó');
    expect(p.personas).toEqual([{ id: 1, nombre: 'A', nota: '2 de 3 pasos' }]);
  });

  it('quien lleva una semana sin practicar aparece después de los refuerzos quietos, con cuántos días, y «Escribirles»', () => {
    const semana = { total: 4, estaSemana: { estudiantesActivos: 2, ejercicios: 5, aprobados: 3 }, semanaAnterior: { estudiantesActivos: 3, ejercicios: 8, aprobados: 5 },
      sinActividad: [{ studentId: 3, nombre: 'Camila', dias: 9 }, { studentId: 4, nombre: 'Andrés', dias: null }] };
    const lista = pendientesDeHoy({ ...vacio, semana, mapa: { ...vacio.mapa, listosParaMas: [{ studentId: 19, fullName: 'Daniela' }] } });
    expect(lista.map((p) => p.tipo)).toEqual(['sin_actividad', 'listos']);
    expect(lista[0].titulo).toBe('2 estudiantes llevan una semana o más sin practicar');
    expect(lista[0].personas).toEqual([{ id: 3, nombre: 'Camila', nota: 'hace 9 días' }, { id: 4, nombre: 'Andrés', nota: 'aún no ha practicado' }]);
    expect(lista[0].acciones[0]).toEqual({ texto: 'Escribirles', to: '/docente/mensajes' });
    // y la pantalla muestra la semana frente a la anterior
    expect(leer('pages', 'docente', 'clase', '[classId]', 'index.vue')).toContain('accionesResumen.semana<SemanaHoy>()');
    // el espacio antes del total va dentro de la expresión: Vue recorta el de un <template> y salía «más.4 estudiantes»
    expect(leer('pages', 'docente', 'clase', '[classId]', 'index.vue')).toContain("totalEstudiantes === null ? '' : ` ${totalEstudiantes}");
  });

  it('una entrega en borrador, ya cerrada o que cierra en más de 3 días no aparece como «cierra pronto»', () => {
    const base = { id: 1, titulo: 'E', publicada: true, estudiantes: 5, conteo: { sin_entregar: 2, por_revisar: 0, revisada: 0 } };
    const entregas = [
      { ...base, id: 1, cierraAt: enHoras(-1) },
      { ...base, id: 2, cierraAt: enHoras(80) },
      { ...base, id: 3, cierraAt: enHoras(5), publicada: false },
      { ...base, id: 4, cierraAt: null },
      { ...base, id: 5, cierraAt: enHoras(5), conteo: { sin_entregar: 0, por_revisar: 0, revisada: 5 } },
    ];
    expect(pendientesDeHoy({ ...vacio, entregas })).toEqual([]);
  });
});

describe('Menú lateral del docente v2: una clase elegida y cinco secciones', () => {
  it('cinco secciones; dos agrupan pantallas que siguen existiendo y Ajustes va aparte', () => {
    expect(pestanas.SECCIONES_MENU.map((s) => s.texto)).toEqual(['Resumen', 'Contenido del curso', 'Estudiantes y avance', 'Entregas', 'Asistencia y notas']);
    const cubiertas = pestanas.SECCIONES_MENU.flatMap((s) => s.incluye).concat(['ajustes']).sort();
    expect(cubiertas).toEqual(pestanas.PESTANAS_CLASE.map((p) => p.id).sort());
  });

  it('cada pantalla marca la sección que la contiene', () => {
    expect(pestanas.seccionDelMenu('refuerzos')).toBe('estudiantes');
    expect(pestanas.seccionDelMenu('notas')).toBe('asistencia');
    expect(pestanas.seccionDelMenu('contenido')).toBe('contenido');
    expect(pestanas.seccionDelMenu('ajustes')).toBe('ajustes');
    expect(pestanas.seccionDelMenu(null)).toBeNull();
  });

  it('muestra la clase de la dirección; fuera de una clase, la última elegida si sigue siendo suya; si no, la primera', () => {
    expect(pestanas.claseDelMenu(7, 3, [3, 7])).toBe(7);
    expect(pestanas.claseDelMenu(null, 3, [3, 7])).toBe(3);
    expect(pestanas.claseDelMenu(null, 99, [3, 7])).toBe(3);
    expect(pestanas.claseDelMenu(42, null, [3, 7])).toBe(3);
    expect(pestanas.claseDelMenu(null, null, [])).toBeNull();
  });

  it('el color de cada clase se repite en ciclo y nunca falla', () => {
    expect(pestanas.colorDeClase(0)).toBe(pestanas.colorDeClase(6));
    expect(pestanas.colorDeClase(-1)).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('el menú: selector con la lista de clases, Inicio y Mensajes arriba, Crear clase abre la ventana de Inicio', () => {
    const menu = leer('components', 'layout', 'ClasesDelMenu.vue');
    expect(menu).toContain('aria-haspopup="menu"');
    expect(menu).toContain('to="/docente?crear=1"');
    expect(menu).toContain("localStorage.setItem(CLAVE_RECORDADA");
    const lateral = leer('components', 'layout', 'SidebarNav.vue');
    expect(lateral.indexOf('<span>Inicio</span>')).toBeGreaterThan(-1);
    expect(lateral.indexOf('to="/docente/mensajes"')).toBeLessThan(lateral.indexOf('<LayoutClasesDelMenu'));
    expect(leer('pages', 'docente', 'index.vue')).toContain('if (useRoute().query.crear) creando.value = true');
  });
});
