import { aCsv, codigoParticipante, COLUMNAS_INVESTIGACION, filasInvestigacion, type ProgresoParaInvestigacion } from './investigacion';
import { InvestigacionService } from './investigacion.service';

// Exportación para la investigación (ítem 34 de la evaluación heurística): solo quienes consintieron, sin nombres.
describe('Datos para la investigación, anonimizados', () => {
  const progreso = (studentId: number, learningUnitId: number): ProgresoParaInvestigacion => ({
    studentId, learningUnitId, status: 'en_practica', mastery: 0.5, attemptsCount: 3, successRate: 0.6667,
    completedActivities: 2, entryConfidence: null,
  });

  it('el código es estable, no revela el id y cambia con la sal', () => {
    const a = codigoParticipante(7, 'sal-1');
    expect(a).toMatch(/^P-[0-9a-f]{10}$/);
    expect(codigoParticipante(7, 'sal-1')).toBe(a);
    expect(codigoParticipante(8, 'sal-1')).not.toBe(a);
    expect(codigoParticipante(7, 'sal-2')).not.toBe(a);
  });

  it('quien no aceptó participar no aparece', () => {
    const filas = filasInvestigacion([progreso(1, 10), progreso(2, 10)], new Set([1]), new Map(), 's');
    expect(filas).toHaveLength(1);
    expect(filas[0][0]).toBe(codigoParticipante(1, 's'));
  });

  it('cada fila trae lección, estado, dominio, intentos y SUS, y ningún nombre ni correo', () => {
    const [fila] = filasInvestigacion([progreso(1, 10)], new Set([1]), new Map([[1, 72.5]]), 's');
    expect(fila).toEqual([codigoParticipante(1, 's'), '10', 'en_practica', '0.500', '3', '0.667', '2', '', '72.5']);
    expect(COLUMNAS_INVESTIGACION).not.toContain('nombre');
    expect(COLUMNAS_INVESTIGACION).not.toContain('correo');
  });

  it('el CSV pone comillas donde hace falta', () => {
    expect(aCsv(['a', 'b'], [['1', 'con, coma'], ['2', 'dice "hola"']])).toBe('a,b\n1,"con, coma"\n2,"dice ""hola"""\n');
  });

  it('el servicio solo consulta el progreso si alguien consintió, y usa la sal del servidor', async () => {
    const usuarios = { find: jest.fn().mockResolvedValue([{ id: 1 }]) };
    const progresos = { find: jest.fn().mockResolvedValue([progreso(1, 10), progreso(2, 10)]) };
    const encuestas = { find: jest.fn().mockResolvedValue([{ userId: 1, puntaje: 60 }, { userId: 1, puntaje: 80 }]) };
    const config = { get: jest.fn((k: string) => (k === 'INVESTIGACION_SAL' ? 'sal-servidor' : undefined)) };
    const servicio = new InvestigacionService(usuarios as never, progresos as never, encuestas as never, config as never);

    const { csv, participantes } = await servicio.exportarCsv();
    expect(participantes).toBe(1);
    expect(usuarios.find).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ investigacionConsentida: true }) }));
    const lineas = csv.trim().split('\n');
    expect(lineas).toHaveLength(2);
    expect(lineas[1]).toContain(codigoParticipante(1, 'sal-servidor'));
    expect(lineas[1].endsWith(',80')).toBe(true);

    usuarios.find.mockResolvedValue([]);
    progresos.find.mockClear();
    expect((await servicio.exportarCsv()).participantes).toBe(0);
    expect(progresos.find).not.toHaveBeenCalled();
  });
});
