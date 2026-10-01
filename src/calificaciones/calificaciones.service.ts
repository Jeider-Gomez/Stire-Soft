import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EsquemaCalificacion } from './entities/esquema-calificacion.entity';
import { NotaRegistrada } from './entities/nota-registrada.entity';
import { NotaHistorial } from './entities/nota-historial.entity';
import {
  CalificacionInvalidaError, CLAVE_FINAL, construirLibro, validarEsquema, validarMotivo, validarNota,
  type Esquema, type EntradaLibro,
} from './calificacion-reglas';
import { Entrega } from '../proyectos/entities/entrega.entity';
import { ProyectoEnvio } from '../proyectos/entities/proyecto-envio.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User } from '../user/entities/user.entity';

function reglas<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof CalificacionInvalidaError) throw new BadRequestException(e.message);
    throw e;
  }
}

/**
 * Formas de calificar (docs/DISENO_INTERVENCION_DOCENTE.md §6): esquema opcional de la clase, nota propuesta por
 * estudiante con su desglose, notas manuales y ajuste de la final con motivo e historial. Exportar a Moodle se hace
 * en el navegador con estos mismos datos.
 */
@Injectable()
export class CalificacionesService {
  constructor(
    @InjectRepository(EsquemaCalificacion) private readonly esquemas: Repository<EsquemaCalificacion>,
    @InjectRepository(NotaRegistrada) private readonly registradas: Repository<NotaRegistrada>,
    @InjectRepository(NotaHistorial) private readonly historialRepo: Repository<NotaHistorial>,
    @InjectRepository(Entrega) private readonly entregas: Repository<Entrega>,
    @InjectRepository(ProyectoEnvio) private readonly envios: Repository<ProyectoEnvio>,
    @InjectRepository(Enrollment) private readonly matriculas: Repository<Enrollment>,
    @InjectRepository(LearningProgress) private readonly progresos: Repository<LearningProgress>,
    private readonly autorizacion: AuthorizationService,
  ) {}

  /** Lecciones de módulos publicados, en el orden del curso, con su módulo (para armar una nota por módulo). */
  private async leccionesPublicadas(classId: number): Promise<Array<{ id: number; titulo: string; moduloId: number; modulo: string }>> {
    const filas: Array<{ id: number; title: string; moduloId: number; modulo: string }> = await this.esquemas.manager.query(
      'SELECT lu.id AS id, lu.title AS title, s.id AS moduloId, s.title AS modulo FROM learning_units lu JOIN topics t ON lu.topicId = t.id JOIN sections s ON t.sectionId = s.id ' +
        'WHERE s.classId = ? AND s.isPublished = 1 ORDER BY s.`order`, t.`order`, lu.`order`, lu.id',
      [classId],
    );
    return filas.map((f) => ({ id: Number(f.id), titulo: f.title, moduloId: Number(f.moduloId), modulo: f.modulo }));
  }

  /** Módulos publicados con sus lecciones, en orden. */
  private modulos(lecciones: Array<{ id: number; moduloId: number; modulo: string }>): Array<{ id: number; titulo: string; lecciones: number[] }> {
    const mapa = new Map<number, { id: number; titulo: string; lecciones: number[] }>();
    for (const l of lecciones) {
      const m = mapa.get(l.moduloId) ?? { id: l.moduloId, titulo: l.modulo, lecciones: [] };
      m.lecciones.push(l.id);
      mapa.set(l.moduloId, m);
    }
    return [...mapa.values()];
  }

  private async todasLasLecciones(classId: number): Promise<Set<number>> {
    const filas: Array<{ id: number }> = await this.esquemas.manager.query(
      'SELECT lu.id AS id FROM learning_units lu JOIN topics t ON lu.topicId = t.id JOIN sections s ON t.sectionId = s.id WHERE s.classId = ?',
      [classId],
    );
    return new Set(filas.map((f) => Number(f.id)));
  }

  private async estudiantes(classId: number, soloId?: number): Promise<Array<{ id: number; nombre: string; email: string }>> {
    const matriculas = await this.matriculas.find({
      where: { classId, status: EnrollmentStatus.ACTIVE, ...(soloId ? { studentId: soloId } : {}) },
      relations: ['student'],
    });
    return matriculas
      .map((m) => ({ id: m.studentId, nombre: m.student?.fullName ?? '—', email: m.student?.email ?? '' }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  private aEsquema(e: EsquemaCalificacion): Esquema {
    return { componentes: e.componentes, usarPesos: e.usarPesos, notaAprobatoria: e.notaAprobatoria, visibleParaEstudiantes: e.visibleParaEstudiantes };
  }

  /** Los datos que necesita el cálculo, para toda la clase o para un estudiante. */
  private async entrada(classId: number, esquema: Esquema, soloEstudiante?: number): Promise<{ entrada: EntradaLibro; lecciones: Array<{ id: number; titulo: string; moduloId: number; modulo: string }> }> {
    const [lecciones, estudiantes, entregas] = await Promise.all([
      this.leccionesPublicadas(classId),
      this.estudiantes(classId, soloEstudiante),
      this.entregas.find({ where: { classId }, order: { createdAt: 'ASC' } }),
    ]);
    const ids = estudiantes.map((e) => e.id);
    const idsLeccion = [...new Set([...lecciones.map((l) => l.id), ...esquema.componentes.flatMap((c) => c.lecciones ?? [])])];
    const [progresos, envios, registradas] = await Promise.all([
      ids.length && idsLeccion.length ? this.progresos.find({ where: { studentId: In(ids), learningUnitId: In(idsLeccion) } }) : Promise.resolve([]),
      ids.length && entregas.length ? this.envios.find({ where: { classId, studentId: In(ids) } }) : Promise.resolve([]),
      ids.length ? this.registradas.find({ where: { classId, studentId: In(ids) } }) : Promise.resolve([]),
    ]);
    const dominio = new Map<number, Map<number, number>>();
    for (const p of progresos) {
      const m = dominio.get(p.studentId) ?? new Map<number, number>();
      m.set(p.learningUnitId, Number(p.mastery));
      dominio.set(p.studentId, m);
    }
    return {
      lecciones,
      entrada: {
        esquema, estudiantes, dominio, ahora: new Date(),
        lecciones: lecciones.map((l) => l.id),
        entregas: entregas.map((e) => ({ id: e.id, titulo: e.titulo, conNota: e.conNota, publicada: e.publicada, asignadaA: e.asignadaA, cierraAt: e.cierraAt, aceptaTarde: e.aceptaTarde })),
        envios: envios.map((v) => ({ entregaId: v.entregaId, studentId: v.studentId, version: v.version, nota: v.nota, revisadoAt: v.revisadoAt })),
        registradas: registradas.map((r) => ({ studentId: r.studentId, clave: r.clave, nota: r.nota, motivo: r.motivo, updatedAt: r.updatedAt })),
      },
    };
  }

  // ───────────────────────── Docente ─────────────────────────

  /**
   * El libro de la clase. Las notas son opcionales: sin esquema no hay tabla, solo lo que el docente necesita para
   * armar el suyo (módulos con sus lecciones y entregas con nota).
   */
  async libro(user: User, classId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const guardado = await this.esquemas.findOne({ where: { classId } });
    const esquema = guardado ? this.aEsquema(guardado) : { componentes: [], usarPesos: false, notaAprobatoria: 3, visibleParaEstudiantes: false };
    const { entrada, lecciones } = await this.entrada(classId, esquema);
    const { filas, resumen } = guardado ? construirLibro(entrada) : { filas: [], resumen: { promedio: null, aprueban: 0, reprueban: 0, sinNota: 0 } };
    return {
      esquema: guardado ? esquema : null,
      actualizadoAt: guardado?.updatedAt ?? null,
      modulos: this.modulos(lecciones),
      lecciones: lecciones.map((l) => ({ id: l.id, titulo: l.titulo })),
      entregas: entrada.entregas.filter((e) => e.conNota).map((e) => ({ id: e.id, titulo: e.titulo, publicada: e.publicada })),
      filas,
      resumen,
    };
  }

  /**
   * Dejar de usar notas en la clase: se quita el esquema. Las notas que el docente puso y su historial se conservan,
   * por si lo vuelve a armar.
   */
  async quitarEsquema(user: User, classId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    await this.esquemas.delete({ classId });
    return this.libro(user, classId);
  }

  async guardarEsquema(user: User, classId: number, datos: Record<string, unknown>) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const esquema = reglas(() => validarEsquema(datos));
    const lecciones = await this.todasLasLecciones(classId);
    if (esquema.componentes.some((c) => (c.lecciones ?? []).some((id) => !lecciones.has(id)))) {
      throw new BadRequestException('Alguna lección elegida no es de esta clase.');
    }
    const entregas = new Set((await this.entregas.find({ where: { classId } })).map((e) => e.id));
    if (esquema.componentes.some((c) => (c.entregas ?? []).some((id) => !entregas.has(id)))) {
      throw new BadRequestException('Alguna entrega elegida no es de esta clase.');
    }
    const actual = await this.esquemas.findOne({ where: { classId } });
    await this.esquemas.save(this.esquemas.create({ ...(actual ?? {}), classId, ...esquema, updatedBy: user.id }));
    return this.libro(user, classId);
  }

  /**
   * Pone, cambia o quita una nota del docente: la de un componente manual o el ajuste de la final (con motivo). Cada
   * cambio queda en el historial con antes → después.
   */
  async registrarNota(user: User, classId: number, studentId: number, datos: Record<string, unknown>) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const guardado = await this.esquemas.findOne({ where: { classId } });
    if (!guardado) throw new BadRequestException('Guarda primero el esquema de calificación de la clase.');
    const clave = String(datos.clave ?? '');
    const componente = guardado.componentes.find((c) => c.clave === clave);
    if (clave !== CLAVE_FINAL && componente?.tipo !== 'manual') {
      throw new BadRequestException('Solo se ponen a mano las notas de los componentes manuales y el ajuste de la final.');
    }
    if ((await this.estudiantes(classId, studentId)).length === 0) throw new NotFoundException('El estudiante no está en esta clase.');

    const nota = reglas(() => validarNota(datos.nota));
    const motivo = reglas(() => validarMotivo(datos.motivo, clave === CLAVE_FINAL && nota !== null));
    const actual = await this.registradas.findOne({ where: { classId, studentId, clave } });
    const antes = actual?.nota ?? null;
    if (antes === nota && (actual?.motivo ?? null) === motivo) return { cambio: false };

    if (nota === null) {
      if (actual) await this.registradas.delete(actual.id);
    } else {
      await this.registradas.save(this.registradas.create({ ...(actual ?? {}), classId, studentId, clave, nota, motivo, updatedBy: user.id }));
    }
    await this.historialRepo.save(this.historialRepo.create({
      classId, studentId, clave, nombre: clave === CLAVE_FINAL ? 'Nota final' : (componente?.nombre ?? clave), antes, despues: nota, motivo, actorId: user.id,
    }));
    return { cambio: true };
  }

  async historial(user: User, classId: number, studentId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const eventos = await this.historialRepo.find({ where: { classId, studentId }, order: { createdAt: 'DESC', id: 'DESC' } });
    return eventos.map((e) => ({ id: e.id, clave: e.clave, nombre: e.nombre, antes: e.antes, despues: e.despues, motivo: e.motivo, createdAt: e.createdAt }));
  }

  // ───────────────────────── Estudiante ─────────────────────────

  /** Su nota y su desglose, si el docente decidió mostrarlos. El motivo del ajuste es del docente y no se muestra. */
  async mia(user: User, classId: number) {
    await this.autorizacion.assertEnrolledInClass(user, classId);
    const guardado = await this.esquemas.findOne({ where: { classId } });
    if (!guardado || !guardado.visibleParaEstudiantes) return { visible: false as const };
    const esquema = this.aEsquema(guardado);
    const { entrada } = await this.entrada(classId, esquema, user.id);
    const fila = construirLibro(entrada).filas[0];
    if (!fila) return { visible: false as const };
    return {
      visible: true as const,
      notaAprobatoria: esquema.notaAprobatoria,
      usarPesos: esquema.usarPesos,
      componentes: esquema.componentes.map((c) => ({ clave: c.clave, nombre: c.nombre, tipo: c.tipo, peso: c.peso, ...fila.componentes[c.clave] })),
      propuesta: fila.propuesta,
      faltan: fila.faltan,
      ajustada: fila.ajuste !== null,
      final: fila.final,
      aprueba: fila.aprueba,
    };
  }
}
