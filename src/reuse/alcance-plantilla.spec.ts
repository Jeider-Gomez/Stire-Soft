import { cercania, contextoDe, problemaDelAlcance, puedeVerPlantilla } from './alcance-plantilla';

// Plantillas por alcance (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3): quién ve una plantilla y cuál conviene más.
const EDU = { facultad: 'Facultad de Educación y Ciencias Humanas' };
const ALGO = { id: 1, programId: 10, institutionId: 100, periodoPlan: 3, program: EDU }; // Fundamentos de Algoritmia
const PROG = { id: 2, programId: 10, institutionId: 100, periodoPlan: 4, program: EDU }; // Fundamentos de Programación
const ALGO_BIS = { id: 6, programId: 10, institutionId: 100, periodoPlan: 3, program: EDU }; // otra del 3.er semestre
const MATE = { id: 3, programId: 11, institutionId: 100, periodoPlan: 2, program: { facultad: 'facultad de educación y ciencias humanas ' } };
const ING = { id: 4, programId: 12, institutionId: 100, periodoPlan: 1, program: { facultad: 'Facultad de Ingeniería' } };
const ELECTIVA_IA = { id: 5, programId: null, institutionId: 100, periodoPlan: null, program: null };
const COLEGIO = { id: 7, programId: 20, institutionId: 200, periodoPlan: 8, program: null };
const LIBRE = { id: 8, programId: null, institutionId: null, periodoPlan: null, program: null };

describe('puedeVerPlantilla — cada docente ve lo que se compartió con alguien como él', () => {
  const docenteDeAlgoritmia = contextoDe([ALGO]);
  const sinClases = contextoDe([]);

  it('«todos»: cualquier docente, incluso sin clases; «nadie»: nadie', () => {
    expect(puedeVerPlantilla('todos', LIBRE, sinClases)).toBe(true);
    expect(puedeVerPlantilla('nadie', ALGO, docenteDeAlgoritmia)).toBe(false);
  });
  it('«asignatura»: solo quien dicta esa misma asignatura', () => {
    expect(puedeVerPlantilla('asignatura', ALGO, docenteDeAlgoritmia)).toBe(true);
    expect(puedeVerPlantilla('asignatura', PROG, docenteDeAlgoritmia)).toBe(false);
  });
  it('«programa»: quien dicta cualquier asignatura del programa', () => {
    expect(puedeVerPlantilla('programa', PROG, docenteDeAlgoritmia)).toBe(true);
    expect(puedeVerPlantilla('programa', MATE, docenteDeAlgoritmia)).toBe(false);
  });
  it('«facultad»: la misma facultad de la misma institución (sin importar mayúsculas ni espacios)', () => {
    expect(puedeVerPlantilla('facultad', MATE, docenteDeAlgoritmia)).toBe(true);
    expect(puedeVerPlantilla('facultad', ING, docenteDeAlgoritmia)).toBe(false);
  });
  it('«institución»: cualquier docente de la institución, también la electiva libre', () => {
    expect(puedeVerPlantilla('institucion', ING, docenteDeAlgoritmia)).toBe(true);
    expect(puedeVerPlantilla('institucion', ELECTIVA_IA, docenteDeAlgoritmia)).toBe(true);
    expect(puedeVerPlantilla('institucion', COLEGIO, docenteDeAlgoritmia)).toBe(false);
  });
  it('un docente sin clases solo ve lo compartido con todos', () => {
    for (const alcance of ['asignatura', 'programa', 'facultad', 'institucion'] as const) {
      expect(puedeVerPlantilla(alcance, ALGO, sinClases)).toBe(false);
    }
  });
});

describe('cercania — qué plantilla conviene más para la asignatura que se va a dictar', () => {
  it('misma asignatura, mismo semestre del programa, mismo programa, misma facultad, misma institución, el resto', () => {
    expect([ALGO, ALGO_BIS, PROG, MATE, ING, COLEGIO].map((o) => cercania(o, ALGO))).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('sin asignatura elegida, todas valen lo mismo', () => {
    expect(cercania(ALGO, null)).toBe(5);
    expect(cercania(null, ALGO)).toBe(5);
  });
});

describe('problemaDelAlcance — para compartir con un grupo la clase necesita esos datos', () => {
  it('sin asignatura solo se comparte con nadie o con todos', () => {
    expect(problemaDelAlcance('todos', null)).toBeNull();
    expect(problemaDelAlcance('asignatura', null)).toMatch(/elige la asignatura/);
  });
  it('una electiva sin programa no se comparte «con su programa»; un curso libre no tiene institución', () => {
    expect(problemaDelAlcance('programa', ELECTIVA_IA)).toMatch(/no es de un programa/);
    expect(problemaDelAlcance('institucion', ELECTIVA_IA)).toBeNull();
    expect(problemaDelAlcance('institucion', LIBRE)).toMatch(/curso libre/);
    expect(problemaDelAlcance('facultad', COLEGIO)).toMatch(/no tiene facultad/);
    expect(problemaDelAlcance('facultad', ALGO)).toBeNull();
  });
});
