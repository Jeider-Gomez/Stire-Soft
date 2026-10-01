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
  PESTANAS_CLASE: Array<{ id: string }>;
};
const { pendientesDeHoy } = cargar('hoyClase.ts', { './refuerzos': cargar('refuerzos.ts') }) as {
  pendientesDeHoy: (d: unknown) => Array<{ clave: string; tipo: string; titulo: string; detalle: string; personas: Array<{ id: number; nota?: string }>; acciones: Array<{ texto: string; to: string }> }>;
};

describe('Pestañas de la clase', () => {
  it('cada pestaña lleva a su pantalla con la clase ya elegida', () => {
    expect(pestanas.PESTANAS_CLASE.map((p) => p.id)).toEqual(['hoy', 'contenido', 'estudiantes', 'entregas', 'refuerzos', 'notas', 'ajustes']);
    expect(pestanas.enlacePestana('hoy', 5)).toBe('/docente/clase/5');
    expect(pestanas.enlacePestana('contenido', 5)).toBe('/docente/contenidos?classId=5');
    expect(pestanas.enlacePestana('estudiantes', 5)).toBe('/docente/rendimiento?classId=5');
    expect(pestanas.enlacePestana('entregas', 5)).toBe('/docente/entregas?clase=5');
    expect(pestanas.enlacePestana('refuerzos', 5)).toBe('/docente/refuerzos?clase=5');
    expect(pestanas.enlacePestana('notas', 5)).toBe('/docente/clase/5/notas');
    expect(pestanas.enlacePestana('ajustes', 5)).toBe('/docente/clase/5/ajustes');
  });

  it('la clase activa sale de la ruta o de la consulta', () => {
    expect(pestanas.claseDeLaRuta('/docente/clase/7/ajustes', {})).toBe(7);
    expect(pestanas.claseDeLaRuta('/docente/rendimiento', { classId: '5' })).toBe(5);
    expect(pestanas.claseDeLaRuta('/docente/entregas', { clase: '3' })).toBe(3);
    expect(pestanas.claseDeLaRuta('/docente/mensajes', {})).toBeNull();
    expect(pestanas.claseDeLaRuta('/docente/entregas', { clase: 'x' })).toBeNull();
  });

  it('cada pantalla de la clase muestra las pestañas con la suya marcada', () => {
    const esperado: Array<[string[], string]> = [
      [['pages', 'docente', 'clase', '[classId]', 'index.vue'], 'activa="hoy"'],
      [['pages', 'docente', 'contenidos.vue'], 'activa="contenido"'],
      [['pages', 'docente', 'rendimiento.vue'], 'activa="estudiantes"'],
      [['pages', 'docente', 'estudiante', '[studentId].vue'], 'activa="estudiantes"'],
      [['pages', 'docente', 'entregas', 'index.vue'], 'activa="entregas"'],
      [['pages', 'docente', 'refuerzos', 'index.vue'], 'activa="refuerzos"'],
      [['pages', 'docente', 'clase', '[classId]', 'notas.vue'], 'activa="notas"'],
      [['pages', 'docente', 'clase', '[classId]', 'ajustes.vue'], 'activa="ajustes"'],
    ];
    for (const [archivo, activa] of esperado) {
      const vue = leer(...archivo);
      expect(vue).toContain('<DocentePestanasClase');
      expect(vue).toContain(activa);
    }
    expect(existsSync(path.join(raiz, 'pages', 'docente', 'clase', '[classId].vue'))).toBe(false);
    expect(leer('components', 'docente', 'PestanasClase.vue')).toContain(`:aria-current="p.id === activa ? 'page' : undefined"`);
    // El nombre de la clase (que en «Hoy» enlaza a la página actual) va fuera del <nav>: una sola pestaña actual.
    const pestanasVue = leer('components', 'docente', 'PestanasClase.vue');
    expect(pestanasVue.indexOf('{{ nombre }}')).toBeLessThan(pestanasVue.indexOf('<nav aria-label="Secciones de la clase">'));
  });

  it('el menú lleva a cada clase y ya no es un menú por herramienta', () => {
    const menu = leer('components', 'layout', 'SidebarNav.vue');
    expect(menu).toContain(':to="`/docente/clase/${c.id}`"');
    // dos grupos de la misma materia se distinguen por el código
    expect(menu).toContain('{{ c.code }}');
    for (const herramienta of ['to="/docente/contenidos"', 'to="/docente/rendimiento"', 'to="/docente/entregas"', 'to="/docente/refuerzos"']) {
      expect(menu).not.toContain(herramienta);
    }
    // La tarjeta de cada clase en «Mis clases» abre su «Hoy».
    expect(leer('pages', 'docente', 'index.vue')).toContain('<span>Abrir la clase</span>');
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
