import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Entrega } from './entities/entrega.entity';
import { EntregaEvento } from './entities/entrega-evento.entity';
import { ProyectoEnvio } from './entities/proyecto-envio.entity';
import { ProyectosService } from './proyectos.service';
import {
  estadoDeEntrega,
  siguienteVersionDeEntrega,
  validarEntrega,
  visibleParaEstudiante,
  type DatosEntrega,
  type EstadoEntrega,
} from './entrega-reglas';
import { ProyectoInvalidoError } from './proyecto-reglas';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { Topic } from '../topic/entities/topic.entity';
import { Section } from '../section/entities/section.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User } from '../user/entities/user.entity';

/** Los errores de las reglas son un 400 con el motivo. */
function reglas<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof ProyectoInvalidoError) throw new BadRequestException(e.message);
    throw e;
  }
}

const datosDe = (e: Entrega): DatosEntrega => ({
  titulo: e.titulo,
  consigna: e.consigna,
  learningUnitId: e.learningUnitId,
  tipoProyecto: e.tipoProyecto,
  plantilla: e.plantilla,
  abreAt: e.abreAt,
  cierraAt: e.cierraAt,
  aceptaTarde: e.aceptaTarde,
  maxVersiones: e.maxVersiones,
  conNota: e.conNota,
  cuentaParaDominio: e.cuentaParaDominio,
  dificultad: e.dificultad,
  publicada: e.publicada,
  asignadaA: e.asignadaA,
});

/** Lo que ve el estudiante de cada versión suya: con la revisión, sin los archivos. */
const versionPublica = (v: ProyectoEnvio) => ({
  id: v.id,
  version: v.version,
  titulo: v.titulo,
  tarde: v.tarde,
  nota: v.nota,
  comentario: v.comentario,
  revisadoAt: v.revisadoAt,
  createdAt: v.createdAt,
});

/**
 * Entregas (docs/DISENO_INTERVENCION_DOCENTE.md §3 y §10): el docente crea el espacio en su clase, opcionalmente en una
 * lección; el estudiante entrega uno de sus proyectos como copia congelada, con un máximo de versiones, y todo queda en
 * el historial.
 */
@Injectable()
export class EntregasService {
  constructor(
    @InjectRepository(Entrega) private readonly entregas: Repository<Entrega>,
    @InjectRepository(EntregaEvento) private readonly eventos: Repository<EntregaEvento>,
    @InjectRepository(ProyectoEnvio) private readonly envios: Repository<ProyectoEnvio>,
    @InjectRepository(Enrollment) private readonly matriculas: Repository<Enrollment>,
    @InjectRepository(User) private readonly usuarios: Repository<User>,
    private readonly proyectos: ProyectosService,
    private readonly autorizacion: AuthorizationService,
  ) {}

  // ───────────────────────── Docente ─────────────────────────

  /** La lección debe ser de la misma clase. Falla cerrado si la cadena lección → tema → módulo está rota. */
  private async exigirLeccionDeLaClase(learningUnitId: number | null, classId: number): Promise<void> {
    if (learningUnitId === null) return;
    const manager = this.entregas.manager;
    const unidad = await manager.findOne(LearningUnit, { where: { id: learningUnitId } });
    const tema = unidad?.topicId != null ? await manager.findOne(Topic, { where: { id: unidad.topicId } }) : null;
    const modulo = tema ? await manager.findOne(Section, { where: { id: tema.sectionId } }) : null;
    if (!modulo || modulo.classId !== classId) throw new BadRequestException('La lección elegida no es de esta clase.');
  }

  private async entregaDelDocente(user: User, id: number): Promise<Entrega> {
    const entrega = await this.entregas.findOne({ where: { id } });
    if (!entrega) throw new NotFoundException('Entrega no encontrada.');
    await this.autorizacion.assertTeacherOwnsClass(user, entrega.classId);
    return entrega;
  }

  async crear(user: User, datos: Record<string, unknown>): Promise<Entrega> {
    const classId = Number(datos.classId);
    if (!Number.isInteger(classId)) throw new BadRequestException('Elige la clase.');
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const validos = reglas(() => validarEntrega(datos));
    await this.exigirLeccionDeLaClase(validos.learningUnitId, classId);
    return this.entregas.save(this.entregas.create({ ...validos, classId, createdBy: user.id }));
  }

  async actualizar(user: User, id: number, datos: Record<string, unknown>): Promise<Entrega> {
    const entrega = await this.entregaDelDocente(user, id);
    const validos = reglas(() => validarEntrega(datos, datosDe(entrega)));
    await this.exigirLeccionDeLaClase(validos.learningUnitId, entrega.classId);
    Object.assign(entrega, validos);
    return this.entregas.save(entrega);
  }

  /** Solo se borra si nadie ha entregado: lo enviado no se pierde. Para cerrarla, se despublica o se le pone cierre. */
  async eliminar(user: User, id: number): Promise<void> {
    const entrega = await this.entregaDelDocente(user, id);
    if ((await this.envios.count({ where: { entregaId: id } })) > 0) {
      throw new ConflictException('Ya hay entregas de estudiantes: no se puede borrar. Despublícala o ponle fecha de cierre.');
    }
    await this.entregas.delete({ id: entrega.id });
  }

  private async estudiantesDe(classId: number, asignadaA: number[] | null): Promise<User[]> {
    const activas = await this.matriculas.find({ where: { classId, status: EnrollmentStatus.ACTIVE } });
    const ids = activas.map((m) => m.studentId).filter((sid) => !asignadaA || asignadaA.includes(sid));
    return ids.length ? this.usuarios.find({ where: { id: In(ids) }, order: { fullName: 'ASC' } }) : [];
  }

  /** Las entregas de la clase con cuántos entregaron, cuántas faltan por revisar y cuántas están revisadas. */
  async deLaClase(user: User, classId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const lista = await this.entregas.find({ where: { classId }, order: { createdAt: 'DESC' } });
    const todos = await this.envios.find({ where: { classId, entregaId: In(lista.map((e) => e.id).concat(0)) } });
    return Promise.all(
      lista.map(async (e) => {
        const estudiantes = await this.estudiantesDe(classId, e.asignadaA);
        const conteo: Record<EstadoEntrega, number> = { sin_entregar: 0, por_revisar: 0, revisada: 0 };
        for (const s of estudiantes) conteo[estadoDeEntrega(todos.filter((v) => v.entregaId === e.id && v.studentId === s.id))]++;
        return { ...e, plantilla: undefined, estudiantes: estudiantes.length, conteo };
      }),
    );
  }

  /** Una entrega con la fila de cada estudiante: sus versiones, su estado y cuántas reaperturas tiene. */
  async detalle(user: User, id: number) {
    const entrega = await this.entregaDelDocente(user, id);
    const estudiantes = await this.estudiantesDe(entrega.classId, entrega.asignadaA);
    const versiones = await this.envios.find({ where: { entregaId: id }, order: { version: 'ASC' } });
    const reaperturas = await this.eventos.find({ where: { entregaId: id, tipo: 'reabierta' } });
    return {
      ...entrega,
      filas: estudiantes.map((s) => {
        const suyas = versiones.filter((v) => v.studentId === s.id);
        return {
          studentId: s.id,
          estudiante: s.fullName || s.email,
          estado: estadoDeEntrega(suyas),
          reaperturas: reaperturas.filter((r) => r.studentId === s.id).length,
          versiones: suyas.map(versionPublica),
        };
      }),
    };
  }

  /** Le da a un estudiante una versión más, como «reabrir» de Moodle; queda en el historial. */
  async reabrir(user: User, id: number, studentId: unknown) {
    const entrega = await this.entregaDelDocente(user, id);
    const sid = Number(studentId);
    const estudiantes = await this.estudiantesDe(entrega.classId, entrega.asignadaA);
    if (!estudiantes.some((s) => s.id === sid)) throw new BadRequestException('Ese estudiante no tiene esta entrega.');
    await this.eventos.save(this.eventos.create({ entregaId: id, studentId: sid, envioId: null, tipo: 'reabierta', detalle: null, actorId: user.id }));
    return { ok: true };
  }

  // ───────────────────────── Estudiante ─────────────────────────

  private async matriculado(user: User, classId: number): Promise<boolean> {
    return !!(await this.matriculas.findOne({ where: { studentId: user.id, classId, status: EnrollmentStatus.ACTIVE } }));
  }

  /** Una entrega que el estudiante puede ver; a cualquier otra le responde 404, como si no existiera. */
  private async entregaDelEstudiante(user: User, id: number): Promise<Entrega> {
    const entrega = await this.entregas.findOne({ where: { id } });
    if (!entrega || !visibleParaEstudiante(entrega, user.id) || !(await this.matriculado(user, entrega.classId))) {
      throw new NotFoundException('Entrega no encontrada.');
    }
    return entrega;
  }

  private async limiteDe(entrega: Entrega, studentId: number): Promise<{ reaperturas: number; limite: number }> {
    const reaperturas = await this.eventos.count({ where: { entregaId: entrega.id, studentId, tipo: 'reabierta' } });
    return { reaperturas, limite: entrega.maxVersiones + reaperturas };
  }

  /** Las entregas que le tocan al estudiante en sus clases (o en una), con su estado. */
  async mias(user: User, classId?: number) {
    const activas = await this.matriculas.find({ where: { studentId: user.id, status: EnrollmentStatus.ACTIVE } });
    const clases = activas.map((m) => m.classId).filter((c) => classId === undefined || c === classId);
    if (!clases.length) return [];
    const lista = (await this.entregas.find({ where: { classId: In(clases), publicada: true }, order: { createdAt: 'DESC' } }))
      .filter((e) => visibleParaEstudiante(e, user.id));
    const versiones = await this.envios.find({ where: { studentId: user.id, entregaId: In(lista.map((e) => e.id).concat(0)) } });
    return Promise.all(
      lista.map(async (e) => {
        const suyas = versiones.filter((v) => v.entregaId === e.id).sort((a, b) => b.version - a.version);
        const { limite } = await this.limiteDe(e, user.id);
        return {
          id: e.id,
          classId: e.classId,
          learningUnitId: e.learningUnitId,
          titulo: e.titulo,
          tipoProyecto: e.tipoProyecto,
          abreAt: e.abreAt,
          cierraAt: e.cierraAt,
          aceptaTarde: e.aceptaTarde,
          conNota: e.conNota,
          estado: estadoDeEntrega(suyas),
          versionesUsadas: suyas.length,
          limite,
          ultima: suyas[0] ? versionPublica(suyas[0]) : null,
        };
      }),
    );
  }

  /** La entrega como la ve el estudiante: consigna, sus versiones con la revisión y su historial. */
  async verComoEstudiante(user: User, id: number) {
    const entrega = await this.entregaDelEstudiante(user, id);
    const suyas = await this.envios.find({ where: { entregaId: id, studentId: user.id }, order: { version: 'DESC' } });
    const historial = await this.eventos.find({ where: { entregaId: id, studentId: user.id }, order: { createdAt: 'DESC', id: 'DESC' } });
    const { limite } = await this.limiteDe(entrega, user.id);
    return {
      id: entrega.id,
      classId: entrega.classId,
      learningUnitId: entrega.learningUnitId,
      titulo: entrega.titulo,
      consigna: entrega.consigna,
      tipoProyecto: entrega.tipoProyecto,
      tienePlantilla: !!entrega.plantilla,
      abreAt: entrega.abreAt,
      cierraAt: entrega.cierraAt,
      aceptaTarde: entrega.aceptaTarde,
      conNota: entrega.conNota,
      limite,
      estado: estadoDeEntrega(suyas),
      versiones: suyas.map(versionPublica),
      historial: await this.conNombres(historial),
    };
  }

  /** Envía una copia congelada de uno de sus proyectos, tal como está guardado en el servidor. */
  async enviar(user: User, id: number, proyectoId: unknown) {
    const entrega = await this.entregaDelEstudiante(user, id);
    const proyecto = await this.proyectos.obtener(user, Number(proyectoId));
    if (entrega.tipoProyecto !== 'cualquiera' && proyecto.tipo !== entrega.tipoProyecto) {
      throw new BadRequestException(`Esta entrega pide un proyecto de ${entrega.tipoProyecto === 'web' ? 'página web' : 'JavaScript'}.`);
    }
    const anteriores = await this.envios.find({ where: { entregaId: id, studentId: user.id } });
    const { reaperturas } = await this.limiteDe(entrega, user.id);
    const { version, tarde } = reglas(() => siguienteVersionDeEntrega(entrega, anteriores, proyecto, reaperturas, new Date()));
    const copia = await this.envios.save(
      this.envios.create({
        proyectoId: proyecto.id,
        studentId: user.id,
        classId: entrega.classId,
        entregaId: id,
        tarde,
        version,
        titulo: proyecto.titulo,
        tipo: proyecto.tipo,
        archivos: proyecto.archivos,
        nota: null,
        comentario: null,
        revisadoAt: null,
      }),
    );
    await this.eventos.save(this.eventos.create({ entregaId: id, studentId: user.id, envioId: copia.id, tipo: 'enviada', detalle: { version, tarde }, actorId: user.id }));
    return versionPublica(copia);
  }

  /** «Empezar desde la plantilla»: crea un proyecto propio con el código inicial de la entrega (o el del tipo). */
  async empezar(user: User, id: number) {
    const entrega = await this.entregaDelEstudiante(user, id);
    const tipo = entrega.tipoProyecto === 'cualquiera' ? 'web' : entrega.tipoProyecto;
    const proyecto = await this.proyectos.crearConArchivos(user, entrega.titulo, tipo, entrega.plantilla);
    return { id: proyecto.id };
  }

  /** El historial con el nombre de quien hizo cada cosa. */
  async conNombres(historial: EntregaEvento[]) {
    const ids = [...new Set(historial.map((h) => h.actorId))];
    const personas = ids.length ? await this.usuarios.find({ where: { id: In(ids) } }) : [];
    const nombre = new Map(personas.map((u) => [u.id, u.fullName || u.email]));
    return historial.map((h) => ({ id: h.id, tipo: h.tipo, detalle: h.detalle, envioId: h.envioId, actor: nombre.get(h.actorId) ?? '', createdAt: h.createdAt }));
  }

  /** Para el editor de proyectos: las entregas abiertas a las que este proyecto se puede enviar. */
  async abiertasPara(user: User, proyectoId: number) {
    const proyecto = await this.proyectos.obtener(user, proyectoId);
    const ahora = new Date();
    return (await this.mias(user))
      .filter((e) => e.tipoProyecto === 'cualquiera' || e.tipoProyecto === proyecto.tipo)
      .filter((e) => (!e.abreAt || e.abreAt <= ahora) && (e.aceptaTarde || !e.cierraAt || e.cierraAt >= ahora))
      .filter((e) => e.versionesUsadas < e.limite)
      .map((e) => ({ id: e.id, titulo: e.titulo, cierraAt: e.cierraAt, versionesUsadas: e.versionesUsadas, limite: e.limite }));
  }
}
