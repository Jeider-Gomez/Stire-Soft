import { construirMapaDeCalor, EntregaDelMapa, ProgresoDelMapa } from './mapa-de-calor';

// Una prueba por regla del mapa de calor (docs/investigacion/REFERENTES_PLATAFORMAS_Y_STI.md §9).

const AHORA = new Date(2026, 8, 30, 12);
const hace = (dias: number, minuto = 0) => new Date(AHORA.getTime() - dias * 86_400_000 + minuto * 60_000);

const unidades = [
  { id: 10, title: 'Algoritmos', sectionTitle: 'S1' },
  { id: 11, title: 'Variables', sectionTitle: 'S1' },
  { id: 12, title: 'Ciclos', sectionTitle: 'S2' },
];
const estudiantes = [
  { id: 1, fullName: 'Ana' },
  { id: 2, fullName: 'Beto' },
  { id: 3, fullName: 'Caro' },
];

const progreso = (studentId: number, learningUnitId: number, mastery: number, entryConfidence: number | null = null): ProgresoDelMapa => ({
  studentId, learningUnitId, mastery, status: mastery >= 85 ? 'dominado' : 'en_practica', entryConfidence,
});
let n = 0;
const entrega = (studentId: number, learningUnitId: number, activityId: number, aprobada: boolean, fecha = hace(1, n++)): EntregaDelMapa => ({
  studentId, learningUnitId, activityId, aprobada, fecha,
});

function mapa(progresos: ProgresoDelMapa[], entregas: EntregaDelMapa[]) {
  return construirMapaDeCalor({ unidades, estudiantes, progresos, entregas, ahora: AHORA });
}

describe('construirMapaDeCalor', () => {
  it('una celda por estudiante y unidad con progreso, con su dominio, su confianza y sus entregas', () => {
    const m = mapa([progreso(1, 10, 72.6, 2)], [entrega(1, 10, 100, true), entrega(1, 10, 101, false)]);
    expect(m.celdas).toEqual([{ studentId: 1, unitId: 10, mastery: 73, status: 'en_practica', confianza: 2, entregas: 2 }]);
  });

  it('ignora el progreso y las entregas de unidades de otras clases', () => {
    const m = mapa([progreso(1, 99, 100)], [entrega(1, 99, 500, false), entrega(1, 99, 500, false), entrega(1, 99, 500, false)]);
    expect(m.celdas).toEqual([]);
    expect(m.bloqueados).toEqual([]);
  });

  describe('bloqueados', () => {
    it('tres entregas falladas seguidas en una unidad, la última reciente', () => {
      const m = mapa([progreso(2, 11, 20)], [entrega(2, 11, 1, true), entrega(2, 11, 2, false), entrega(2, 11, 2, false), entrega(2, 11, 3, false)]);
      expect(m.bloqueados).toEqual([{ studentId: 2, fullName: 'Beto', unitId: 11, unitTitle: 'Variables', fallosSeguidos: 3 }]);
    });

    it('un acierto al final rompe la racha', () => {
      const m = mapa([progreso(2, 11, 50)], [entrega(2, 11, 2, false), entrega(2, 11, 2, false), entrega(2, 11, 2, false), entrega(2, 11, 3, true)]);
      expect(m.bloqueados).toEqual([]);
    });

    it('si el último fallo fue hace más de 7 días, ya no cuenta como bloqueo de ahora', () => {
      const viejas = [entrega(2, 11, 2, false, hace(10)), entrega(2, 11, 2, false, hace(9)), entrega(2, 11, 2, false, hace(8))];
      expect(mapa([progreso(2, 11, 10)], viejas).bloqueados).toEqual([]);
    });
  });

  it('tema difícil: menor dominio promedio entre quienes la trabajaron; desempata con más entregas por acierto', () => {
    const m = mapa(
      [progreso(1, 10, 90), progreso(2, 10, 70), progreso(1, 11, 40), progreso(2, 11, 60), progreso(1, 12, 50)],
      [
        entrega(1, 10, 1, true), entrega(2, 10, 1, true),
        entrega(1, 11, 2, false), entrega(1, 11, 2, true), entrega(2, 11, 2, true),
        entrega(1, 12, 3, false), entrega(1, 12, 3, false), entrega(1, 12, 3, true),
      ],
    );
    expect(m.temasDificiles.map((t) => [t.unitTitle, t.dominioPromedio, t.entregasPorAcierto])).toEqual([
      ['Ciclos', 50, 3],
      ['Variables', 50, 1.5],
      ['Algoritmos', 80, 1],
    ]);
  });

  it('listos para más: 85 % o más en todas las unidades que trabajó, y al menos 3', () => {
    const m = mapa(
      [
        progreso(1, 10, 100), progreso(1, 11, 90), progreso(1, 12, 85),
        progreso(2, 10, 100), progreso(2, 11, 100),
        progreso(3, 10, 100), progreso(3, 11, 100), progreso(3, 12, 84),
      ],
      [1, 2, 3].flatMap((s) => [10, 11, 12].map((u) => entrega(s, u, u, true))),
    );
    expect(m.listosParaMas.map((l) => l.fullName)).toEqual(['Ana']);
  });

  it('seguros que fallan: dijo «Me siento seguro» y falló el primer intento de un ejercicio', () => {
    const m = mapa(
      [progreso(1, 12, 60, 3), progreso(2, 12, 60, 1), progreso(3, 12, 100, 3)],
      [
        entrega(1, 12, 7, false), entrega(1, 12, 7, true), entrega(1, 12, 8, true),
        entrega(2, 12, 7, false),
        entrega(3, 12, 7, true), entrega(3, 12, 7, false),
      ],
    );
    expect(m.segurosQueFallan).toEqual([{ studentId: 1, fullName: 'Ana', unitId: 12, unitTitle: 'Ciclos', fallosAlPrimerIntento: 1 }]);
  });
});
