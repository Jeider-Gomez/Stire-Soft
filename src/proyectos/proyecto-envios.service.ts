import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { ProyectoEnvio } from './entities/proyecto-envio.entity';
import { Entrega } from './entities/entrega.entity';
import { EntregaEvento } from './entities/entrega-evento.entity';
import { EntregasService } from './entregas.service';
import { eventosDeRevision, validarRevision, type Revision } from './envio-reglas';
import { ProyectoInvalidoError } from './proyecto-reglas';
import { Class } from '../class/entities/class.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';

/** Una entrega revisada que cuenta para el dominio: el progreso de esa lección se recalcula (learning-progress). */
export class EntregaRevisadaEvent {
  constructor(
    public readonly studentId: number,
    public readonly learningUnitId: number,
  ) {}
}

/** Un envío (una versión de un estudiante en una entrega): verlo y revisarlo (docs/DISENO_INTERVENCION_DOCENTE.md §3.3). */
@Injectable()
export class ProyectoEnviosService {
  constructor(
    @InjectRepository(ProyectoEnvio) private readonly envios: Repository<ProyectoEnvio>,
    @InjectRepository(Entrega) private readonly entregas: Repository<Entrega>,
    @InjectRepository(EntregaEvento) private readonly eventos: Repository<EntregaEvento>,
    @InjectRepository(Class) private readonly clases: Repository<Class>,
    @InjectRepository(User) private readonly usuarios: Repository<User>,
    private readonly entregasService: EntregasService,
    private readonly autorizacion: AuthorizationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Un envío con sus archivos: su autor, el docente de la clase o un administrador; a cualquier otro, 404. Trae también
   * las otras versiones del estudiante en esa entrega, el historial y, para el docente, el siguiente sin revisar.
   */
  async obtener(user: User, id: number) {
    const envio = await this.envios.findOne({ where: { id } });
    if (!envio) throw new NotFoundException('Envío no encontrado.');
    const clase = await this.clases.findOne({ where: { id: envio.classId } });
    const esDocente = user.role === UserRole.ADMIN || (user.role === UserRole.DOCENTE && clase?.teacherId === user.id);
    if (!esDocente && !(user.role === UserRole.ESTUDIANTE && envio.studentId === user.id)) throw new NotFoundException('Envío no encontrado.');

    const entrega = await this.entregas.findOne({ where: { id: envio.entregaId } });
    const estudiante = await this.usuarios.findOne({ where: { id: envio.studentId } });
    const versiones = await this.envios.find({ where: { entregaId: envio.entregaId, studentId: envio.studentId }, order: { version: 'DESC' } });
    const historial = await this.eventos.find({ where: { entregaId: envio.entregaId, studentId: envio.studentId }, order: { createdAt: 'DESC', id: 'DESC' } });

    let siguienteSinRevisar: number | null = null;
    if (esDocente) {
      // La última versión de cada estudiante que aún no tiene revisión, sin contar a este estudiante.
      const todas = await this.envios.find({ where: { entregaId: envio.entregaId }, order: { version: 'DESC' } });
      const ultimas = new Map<number, ProyectoEnvio>();
      for (const v of todas) if (!ultimas.has(v.studentId)) ultimas.set(v.studentId, v);
      const pendiente = [...ultimas.values()].filter((v) => !v.revisadoAt && v.studentId !== envio.studentId).sort((a, b) => a.id - b.id)[0];
      siguienteSinRevisar = pendiente?.id ?? null;
    }

    return {
      id: envio.id,
      entregaId: envio.entregaId,
      classId: envio.classId,
      version: envio.version,
      titulo: envio.titulo,
      tipo: envio.tipo,
      tarde: envio.tarde,
      archivos: envio.archivos,
      nota: envio.nota,
      valoracion: envio.valoracion,
      comentario: envio.comentario,
      revisadoAt: envio.revisadoAt,
      createdAt: envio.createdAt,
      estudiante: estudiante?.fullName || estudiante?.email || 'Estudiante',
      clase: clase?.name ?? '',
      entrega: entrega ? { id: entrega.id, titulo: entrega.titulo, escala: entrega.escala, conNota: entrega.conNota, maxVersiones: entrega.maxVersiones, cierraAt: entrega.cierraAt } : null,
      versiones: versiones.map((v) => ({ id: v.id, version: v.version, createdAt: v.createdAt, tarde: v.tarde, revisadoAt: v.revisadoAt, nota: v.nota, valoracion: v.valoracion })),
      historial: await this.entregasService.conNombres(historial),
      siguienteSinRevisar,
    };
  }

  /**
   * El docente pone comentario y, según la escala de la entrega, valoración o nota. Dejar todo vacío lo vuelve a «sin
   * revisar». Cada cambio queda en el historial con el valor anterior. Si la entrega cuenta para el dominio, se
   * recalcula la lección.
   */
  async revisar(user: User, id: number, datos: { nota?: unknown; valoracion?: unknown; comentario?: unknown }) {
    const envio = await this.envios.findOne({ where: { id } });
    if (!envio) throw new NotFoundException('Envío no encontrado.');
    await this.autorizacion.assertTeacherOwnsClass(user, envio.classId);
    const entrega = await this.entregas.findOne({ where: { id: envio.entregaId } });
    let revision: Revision;
    try {
      revision = validarRevision(datos, entrega?.escala ?? 'nota');
    } catch (e) {
      if (e instanceof ProyectoInvalidoError) throw new BadRequestException(e.message);
      throw e;
    }
    const cambios = eventosDeRevision({ nota: envio.nota, valoracion: envio.valoracion, comentario: envio.comentario, revisadoAt: envio.revisadoAt }, revision);
    envio.nota = revision.nota;
    envio.valoracion = revision.valoracion;
    envio.comentario = revision.comentario;
    if (revision.nota === null && revision.valoracion === null && revision.comentario === null) envio.revisadoAt = null;
    else if (cambios.length) envio.revisadoAt = new Date();
    const guardado = await this.envios.save(envio);
    for (const c of cambios) {
      await this.eventos.save(this.eventos.create({ entregaId: envio.entregaId, studentId: envio.studentId, envioId: envio.id, tipo: c.tipo, detalle: c.detalle, actorId: user.id }));
    }
    if (cambios.length && entrega?.cuentaParaDominio && entrega.learningUnitId) {
      this.eventEmitter.emit('entrega.revisada', new EntregaRevisadaEvent(envio.studentId, entrega.learningUnitId));
    }
    return { id: guardado.id, nota: guardado.nota, valoracion: guardado.valoracion, comentario: guardado.comentario, revisadoAt: guardado.revisadoAt };
  }
}
