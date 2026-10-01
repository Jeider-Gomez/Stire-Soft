import { Difficulty } from '../../common/enums/difficulty.enum';
import { QuestionType } from '../../common/enums/question-type.enum';
import { FALLOS_PARA_PAUSA, fallosSeguidos, recomendarSiguiente, type ActividadParaRecomendar } from './recomendar-siguiente';
import { FALLOS_PARA_BLOQUEO } from '../../analytics/mapa-de-calor';
import { AtascoListener } from '../../notifications/listeners/atasco.listener';
import { SubmissionGradedEvent } from '../../common/events/submission-graded.event';

// Tope estilo ASSISTments (docs/DISENO_INTERVENCION_DOCENTE.md §4.4; BASE_TEORICA.md BT-16).

const act = (id: number): ActividadParaRecomendar => ({ id, title: `A${id}`, order: id, difficulty: Difficulty.BASICO, questionType: QuestionType.MCQ, totalPoints: 100, passingScore: 60, attemptsAllowed: 0 });
const en = (min: number) => new Date(2026, 9, 1, 10, min);
const UNIDAD = [act(1), act(2), act(3), act(4)];

describe('Tope: el estudiante no practica en círculo', () => {
  it('es el mismo umbral con el que el docente ve a alguien «bloqueado»', () => {
    expect(FALLOS_PARA_PAUSA).toBe(FALLOS_PARA_BLOQUEO);
  });

  it('cuenta los fallos seguidos desde el último; un aprobado corta la racha', () => {
    expect(fallosSeguidos([{ aprobado: false, fecha: en(1) }, { aprobado: true, fecha: en(2) }, { aprobado: false, fecha: en(3) }])).toBe(1);
    expect(fallosSeguidos([{ aprobado: false, fecha: en(3) }, { aprobado: false, fecha: en(1) }, { aprobado: false, fecha: en(2) }])).toBe(3);
    expect(fallosSeguidos([])).toBe(0);
  });

  it(`con ${FALLOS_PARA_PAUSA} fallos seguidos la recomendación es una pausa: volver a la explicación, y el ejercicio sigue disponible`, () => {
    const dos = [1, 2].map((id, i) => ({ activityId: id, score: 20, calificado: true, fecha: en(i) }));
    expect(recomendarSiguiente({ actividades: UNIDAD, intentos: dos, confianza: null, repasoVencido: false })!.motivo).not.toBe('pausa');
    const tres = [...dos, { activityId: 3, score: 10, calificado: true, fecha: en(5) }];
    const r = recomendarSiguiente({ actividades: UNIDAD, intentos: tres, confianza: null, repasoVencido: false })!;
    expect(r.motivo).toBe('pausa');
    expect(r.mensaje).toContain('vuelve a la explicación');
    expect(r.actividad.id).toBe(4);
    // tras aprobar, la racha se corta y vuelve la práctica normal
    const aprobado = [...tres, { activityId: 4, score: 90, calificado: true, fecha: en(6) }];
    expect(recomendarSiguiente({ actividades: UNIDAD, intentos: aprobado, confianza: null, repasoVencido: false })!.motivo).not.toBe('pausa');
  });
});

describe('Tope: aviso al docente', () => {
  function crear(scores: number[]) {
    const actividades = [{ id: 1, learningUnitId: 30, totalPoints: 100, passingScore: 60 }];
    const intentos = scores.map((score, i) => ({ activityId: 1, score, submittedAt: en(i), createdAt: en(i) }));
    const repos: Record<string, unknown> = {
      Activity: { find: jest.fn(() => Promise.resolve(actividades)) },
      Submission: { find: jest.fn(() => Promise.resolve(intentos)) },
      User: { findOne: jest.fn(() => Promise.resolve({ fullName: 'Luisa Rojas' })) },
    };
    const dataSource = {
      getRepository: (e: { name: string }) => repos[e.name],
      query: jest.fn(() => Promise.resolve([{ teacherId: 9, classId: 5, unidad: 'Varios caminos con else if' }])),
    };
    const notificaciones = { createNotification: jest.fn(() => Promise.resolve({})) };
    const listener = new AtascoListener(dataSource as never, notificaciones as never);
    return { listener, notificaciones };
  }
  const evento = new SubmissionGradedEvent('s', 16, 1, 30, 10, 60, 100);

  it('al llegar al tope avisa al docente de la clase, con el nombre y la lección', async () => {
    const { listener, notificaciones } = crear([10, 20, 30]);
    await listener.handle(evento);
    expect(notificaciones.createNotification).toHaveBeenCalledWith(9, 'Luisa Rojas se atascó', expect.stringContaining('«Varios caminos con else if»'), 'info');
  });

  it('un aviso por racha: ni antes del tope ni en cada fallo de más', async () => {
    for (const scores of [[10, 20], [10, 20, 30, 40], [10, 90, 20, 30]]) {
      const { listener, notificaciones } = crear(scores);
      await listener.handle(evento);
      expect(notificaciones.createNotification).not.toHaveBeenCalled();
    }
  });
});
