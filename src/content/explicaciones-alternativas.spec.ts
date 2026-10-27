import { ContentService } from './content.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { UserRole } from '../user/entities/user.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { explicacionesDelEstudiante, seMuestra, type SenalesExplicacion } from './explicaciones-alternativas';

// Explicaciones alternativas (27/10): cada explicación dice cuándo la ve el estudiante.
const nada: SenalesExplicacion = { noClaro: false, fallos: 0, enRepaso: false };

describe('cuándo se muestra cada explicación', () => {
  it('la principal siempre; las alternativas solo cuando hacen falta', () => {
    expect(seMuestra('siempre', nada)).toBe(true);
    expect(seMuestra(undefined, nada)).toBe(true);
    expect(seMuestra('noclaro', nada)).toBe(false);
    expect(seMuestra('falla2', nada)).toBe(false);
    expect(seMuestra('repaso', nada)).toBe(false);
  });
  it('«si no entendió» se abre al tocar «No me quedó claro» o al fallar dos veces', () => {
    expect(seMuestra('noclaro', { ...nada, noClaro: true })).toBe(true);
    expect(seMuestra('noclaro', { ...nada, fallos: 2 })).toBe(true);
    expect(seMuestra('noclaro', { ...nada, fallos: 1 })).toBe(false);
  });
  it('«si falla dos veces» solo con dos fallos; «en el repaso», cuando la lección ya se repasa', () => {
    expect(seMuestra('falla2', { ...nada, noClaro: true })).toBe(false);
    expect(seMuestra('falla2', { ...nada, fallos: 3 })).toBe(true);
    expect(seMuestra('repaso', { ...nada, enRepaso: true })).toBe(true);
  });
  it('filtra en el orden de la lección', () => {
    const c = [{ id: 1, cuando: 'siempre' }, { id: 2, cuando: 'noclaro' }, { id: 3, cuando: 'repaso' }];
    expect(explicacionesDelEstudiante(c, { ...nada, enRepaso: true }).map((x) => x.id)).toEqual([1, 3]);
  });
});

describe('ContentService.findByUnit con explicaciones alternativas', () => {
  const contenidos = [{ id: 1, cuando: 'siempre', isVisible: true }, { id: 2, cuando: 'noclaro', isVisible: true }];
  const consultas: string[] = [];
  const repo = {
    findByUnit: jest.fn(async () => contenidos),
    manager: { query: jest.fn(async (sql: string) => { consultas.push(sql); return sql.includes('valoraciones_leccion') ? [{ 1: 1 }] : sql.includes('COUNT') ? [{ n: 0 }] : []; }) },
  };
  const unidades = { findOne: jest.fn(async () => ({ id: 8, topic: { section: { classId: 5 } } })) };
  const clases = { findOne: jest.fn(async () => ({ id: 5, teacherId: 10 })) };
  const matriculas = { findOne: jest.fn(async () => ({ classId: 5, studentId: 20, status: EnrollmentStatus.ACTIVE })) };
  const service = new ContentService(repo as never, unidades as never, new AuthorizationService(clases as never, matriculas as never), {} as never);

  it('el estudiante que tocó «No me quedó claro» ve también la alternativa', async () => {
    const r = await service.findByUnit(8, { id: 20, role: UserRole.ESTUDIANTE } as never);
    expect(r.map((c) => c.id)).toEqual([1, 2]);
    expect(consultas.some((q) => q.includes('`util` = 0'))).toBe(true);
  });
  it('el estudiante que no la necesita ve solo la principal', async () => {
    repo.manager.query.mockImplementation(async (sql: string) => (sql.includes('COUNT') ? [{ n: 1 }] : []));
    const r = await service.findByUnit(8, { id: 20, role: UserRole.ESTUDIANTE } as never);
    expect(r.map((c) => c.id)).toEqual([1]);
  });
  it('el docente las ve todas, sin consultar señales', async () => {
    repo.manager.query.mockClear();
    const r = await service.findByUnit(8, { id: 10, role: UserRole.DOCENTE } as never);
    expect(r.map((c) => c.id)).toEqual([1, 2]);
    expect(repo.manager.query).not.toHaveBeenCalled();
  });
});
