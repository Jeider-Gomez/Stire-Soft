import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { In, Repository } from 'typeorm';
import { SesionAsistencia } from './entities/sesion-asistencia.entity';
import { RegistroAsistencia } from './entities/registro-asistencia.entity';
import {
  AsistenciaInvalidaError, codigoDeAsistencia, fechaDeHoy, leerCodigoDeAsistencia, validarDispositivo, validarEstado, validarFecha,
  validarTema, VENTANA_QR_MS, type EstadoAsistencia,
} from './asistencia-reglas';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { Class } from '../class/entities/class.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User } from '../user/entities/user.entity';

function reglas<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof AsistenciaInvalidaError) throw new BadRequestException(e.message);
    throw e;
  }
}

export interface EstudianteEnSesion {
  id: number;
  nombre: string;
  email: string;
  fotoId: string | null;
  /** null = sin marcar mientras la sesión está abierta. */
  estado: EstadoAsistencia | null;
  metodo: 'qr' | 'manual' | null;
  hora: Date | null;
  /** «Mismo celular que …»: otra cuenta marcó con QR desde el mismo dispositivo en esta sesión. */
  alerta: string | null;
}

/** Asistencia con QR rotativo o a mano (docs/calidad/PRUEBA_DOS_SEMANAS.md). Todo es opcional para el docente. */
@Injectable()
export class AsistenciaService {
  private readonly secreto: string;

  constructor(
    @InjectRepository(SesionAsistencia) private readonly sesiones: Repository<SesionAsistencia>,
    @InjectRepository(RegistroAsistencia) private readonly registros: Repository<RegistroAsistencia>,
    @InjectRepository(Enrollment) private readonly matriculas: Repository<Enrollment>,
    @InjectRepository(Class) private readonly clases: Repository<Class>,
    private readonly autorizacion: AuthorizationService,
    config: ConfigService,
  ) {
    // Clave propia derivada de JWT_SECRET: un QR de asistencia no sirve como token ni al revés.
    this.secreto = createHmac('sha256', config.get<string>('JWT_SECRET') ?? '').update('stire-asistencia').digest('hex');
  }

  /** El QR del estudiante en este momento (cambia cada 20 s). */
  miCodigo(user: User, dispositivo: unknown): { codigo: string; venceEnMs: number; ventanaMs: number } {
    const d = reglas(() => validarDispositivo(dispositivo));
    return { ...codigoDeAsistencia(this.secreto, user.id, d), ventanaMs: VENTANA_QR_MS };
  }

  private async estudiantesDeClase(classId: number): Promise<Array<{ id: number; nombre: string; email: string; fotoId: string | null }>> {
    const matriculas = await this.matriculas.find({ where: { classId, status: EnrollmentStatus.ACTIVE }, relations: ['student'] });
    return matriculas
      .map((m) => ({ id: m.studentId, nombre: m.student?.fullName ?? '—', email: m.student?.email ?? '', fotoId: m.student?.fotoId ?? null }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  private async sesionDelDocente(user: User, sesionId: number): Promise<SesionAsistencia> {
    const sesion = await this.sesiones.findOne({ where: { id: sesionId } });
    if (!sesion) throw new NotFoundException('Sesión de asistencia no encontrada');
    await this.autorizacion.assertTeacherOwnsClass(user, sesion.classId);
    return sesion;
  }

  /** Empieza la asistencia de hoy. Si ya hay una abierta de hoy en la clase, la devuelve (un doble clic no duplica). */
  async crearSesion(user: User, classId: number, datos: Record<string, unknown>): Promise<SesionAsistencia> {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const fecha = reglas(() => validarFecha(datos.fecha));
    const tema = reglas(() => validarTema(datos.tema));
    if (fecha === fechaDeHoy() && datos.nueva !== true) {
      const abierta = await this.sesiones.findOne({ where: { classId, fecha, abierta: true }, order: { id: 'DESC' } });
      if (abierta) return abierta;
    }
    return this.sesiones.save(this.sesiones.create({ classId, fecha, tema, abierta: true, creadaPorId: user.id }));
  }

  /** Las sesiones de la clase, de la más reciente a la más antigua, con cuántos quedaron en cada estado. */
  async sesionesDeClase(user: User, classId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const sesiones = await this.sesiones.find({ where: { classId }, order: { fecha: 'DESC', id: 'DESC' } });
    const total = (await this.estudiantesDeClase(classId)).length;
    const registros = sesiones.length ? await this.registros.find({ where: { sesionId: In(sesiones.map((s) => s.id)) } }) : [];
    return sesiones.map((s) => {
      const suyos = registros.filter((r) => r.sesionId === s.id);
      const cuenta = (e: EstadoAsistencia) => suyos.filter((r) => r.estado === e).length;
      return { ...s, total, presentes: cuenta('presente'), tarde: cuenta('tarde'), excusa: cuenta('excusa'), ausentes: cuenta('ausente'), sinMarcar: Math.max(0, total - suyos.length) };
    });
  }

  /** Una sesión con toda la lista: quién está, cómo marcó y las alertas de «mismo celular». */
  async detalle(user: User, sesionId: number): Promise<{ sesion: SesionAsistencia; clase: string; estudiantes: EstudianteEnSesion[] }> {
    const sesion = await this.sesionDelDocente(user, sesionId);
    const [estudiantes, registros, clase] = await Promise.all([
      this.estudiantesDeClase(sesion.classId),
      this.registros.find({ where: { sesionId } }),
      this.clases.findOne({ where: { id: sesion.classId }, select: ['id', 'name'] }),
    ]);
    const nombre = new Map(estudiantes.map((e) => [e.id, e.nombre]));
    return {
      sesion,
      clase: clase?.name ?? '',
      estudiantes: estudiantes.map((e) => {
        const r = registros.find((x) => x.userId === e.id);
        const otros = r?.dispositivo ? registros.filter((x) => x.dispositivo === r.dispositivo && x.userId !== e.id) : [];
        return {
          ...e,
          estado: r?.estado ?? (sesion.abierta ? null : 'ausente'),
          metodo: r?.metodo ?? null,
          hora: r?.updatedAt ?? null,
          alerta: otros.length ? `Mismo celular que ${otros.map((o) => nombre.get(o.userId) ?? 'otra cuenta').join(', ')}` : null,
        };
      }),
    };
  }

  /** El docente escanea el QR del celular del estudiante. Devuelve a quién marcó (nombre y foto, para comparar). */
  async marcarConQr(user: User, sesionId: number, codigo: unknown) {
    const sesion = await this.sesionDelDocente(user, sesionId);
    if (!sesion.abierta) throw new BadRequestException('La sesión está cerrada: ábrela de nuevo para seguir marcando.');
    const { userId, dispositivo } = reglas(() => leerCodigoDeAsistencia(this.secreto, codigo));
    const estudiante = (await this.estudiantesDeClase(sesion.classId)).find((e) => e.id === userId);
    if (!estudiante) throw new ForbiddenException('Ese estudiante no está matriculado en esta clase.');

    const previo = await this.registros.findOne({ where: { sesionId, userId } });
    const yaEstaba = !!previo && previo.estado !== 'ausente';
    if (!yaEstaba) {
      await this.registros.save(
        this.registros.merge(previo ?? this.registros.create({ sesionId, userId }), { estado: 'presente', metodo: 'qr', dispositivo, marcadoPorId: user.id }),
      );
    }
    const mismoCelular = await this.registros.find({ where: { sesionId, dispositivo } });
    const otros = mismoCelular.filter((r) => r.userId !== userId).map((r) => r.userId);
    const nombres = otros.length ? (await this.estudiantesDeClase(sesion.classId)).filter((e) => otros.includes(e.id)).map((e) => e.nombre) : [];
    return {
      estudiante: { id: estudiante.id, nombre: estudiante.nombre, fotoId: estudiante.fotoId },
      estado: yaEstaba ? previo.estado : 'presente',
      yaEstaba,
      alerta: nombres.length ? `Mismo celular que ${nombres.join(', ')}` : null,
    };
  }

  /** Marcar o corregir a mano. `estado: null` quita la marca (vuelve a «sin marcar»). */
  async marcarManual(user: User, sesionId: number, userId: number, estado: unknown) {
    const sesion = await this.sesionDelDocente(user, sesionId);
    const e = reglas(() => validarEstado(estado));
    if (!(await this.estudiantesDeClase(sesion.classId)).some((x) => x.id === userId)) {
      throw new ForbiddenException('Ese estudiante no está matriculado en esta clase.');
    }
    const previo = await this.registros.findOne({ where: { sesionId, userId } });
    if (e === null) {
      if (previo) await this.registros.delete({ id: previo.id });
      return { userId, estado: null };
    }
    // Corregir a mano no borra el celular con que marcó (la alerta sigue visible si la hubo).
    await this.registros.save(
      this.registros.merge(previo ?? this.registros.create({ sesionId, userId, dispositivo: null }), { estado: e, metodo: 'manual', marcadoPorId: user.id }),
    );
    return { userId, estado: e };
  }

  async actualizarSesion(user: User, sesionId: number, datos: Record<string, unknown>): Promise<SesionAsistencia> {
    const sesion = await this.sesionDelDocente(user, sesionId);
    if (typeof datos.abierta === 'boolean') sesion.abierta = datos.abierta;
    if ('tema' in datos) sesion.tema = reglas(() => validarTema(datos.tema));
    return this.sesiones.save(sesion);
  }

  async eliminarSesion(user: User, sesionId: number): Promise<{ eliminada: true }> {
    const sesion = await this.sesionDelDocente(user, sesionId);
    await this.registros.delete({ sesionId: sesion.id });
    await this.sesiones.delete({ id: sesion.id });
    return { eliminada: true };
  }

  /** La tabla de toda la clase (para la planilla y para exportar): una fila por estudiante, una columna por sesión. */
  async resumen(user: User, classId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const sesiones = await this.sesiones.find({ where: { classId }, order: { fecha: 'ASC', id: 'ASC' } });
    const estudiantes = await this.estudiantesDeClase(classId);
    const registros = sesiones.length ? await this.registros.find({ where: { sesionId: In(sesiones.map((s) => s.id)) } }) : [];
    return {
      sesiones: sesiones.map((s) => ({ id: s.id, fecha: s.fecha, tema: s.tema, abierta: s.abierta })),
      filas: estudiantes.map((e) => {
        const estados: Record<number, EstadoAsistencia | null> = {};
        for (const s of sesiones) estados[s.id] = registros.find((r) => r.sesionId === s.id && r.userId === e.id)?.estado ?? (s.abierta ? null : 'ausente');
        return { ...e, estados, porcentaje: porcentajeAsistencia(Object.values(estados)) };
      }),
    };
  }

  /** El estudiante ve su asistencia en cada clase (solo la suya). */
  async mia(user: User) {
    const matriculas = await this.matriculas.find({ where: { studentId: user.id, status: EnrollmentStatus.ACTIVE }, relations: ['class'] });
    if (!matriculas.length) return [];
    const sesiones = await this.sesiones.find({ where: { classId: In(matriculas.map((m) => m.classId)) }, order: { fecha: 'DESC', id: 'DESC' } });
    const registros = sesiones.length ? await this.registros.find({ where: { userId: user.id, sesionId: In(sesiones.map((s) => s.id)) } }) : [];
    return matriculas.map((m) => {
      const suyas = sesiones.filter((s) => s.classId === m.classId).map((s) => ({
        id: s.id, fecha: s.fecha, tema: s.tema,
        estado: registros.find((r) => r.sesionId === s.id)?.estado ?? (s.abierta ? null : 'ausente'),
      }));
      return { classId: m.classId, clase: m.class?.name ?? '', sesiones: suyas, porcentaje: porcentajeAsistencia(suyas.map((s) => s.estado)) };
    });
  }
}

/** Presente, tarde y excusa cuentan como asistencia; las sesiones sin marcar (abiertas) no cuentan todavía. */
export function porcentajeAsistencia(estados: Array<EstadoAsistencia | null>): number | null {
  const cerradas = estados.filter((e): e is EstadoAsistencia => e !== null);
  if (!cerradas.length) return null;
  return Math.round((cerradas.filter((e) => e !== 'ausente').length / cerradas.length) * 100);
}
