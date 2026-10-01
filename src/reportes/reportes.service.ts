import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { Reporte } from './entities/reporte.entity';
import { ESTADOS_REPORTE, LIMITES_REPORTE, ReporteInvalidoError, validarReporte, validarRevision, type EstadoReporte } from './reporte-reglas';
import { User } from '../user/entities/user.entity';
import { Class } from '../class/entities/class.entity';

function reglas<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof ReporteInvalidoError) throw new BadRequestException(e.message);
    throw e;
  }
}

/** «Reportar» desde cualquier pantalla y la bandeja del admin (docs/calidad/PRUEBA_DOS_SEMANAS.md). */
@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Reporte) private readonly reportes: Repository<Reporte>,
    @InjectRepository(User) private readonly usuarios: Repository<User>,
    @InjectRepository(Class) private readonly clases: Repository<Class>,
  ) {}

  /** Nombre y código de la clase en la que estaba, si la app lo mandó; solo es un rótulo para separar resultados. */
  private async nombreDeClase(classId: unknown): Promise<string> {
    const id = Number(classId);
    if (!Number.isInteger(id) || id <= 0) return '';
    const c = await this.clases.findOne({ where: { id } });
    return c ? `${c.name} (${c.code})`.slice(0, 160) : '';
  }

  async crear(user: User, datos: Record<string, unknown>) {
    const v = reglas(() => validarReporte(datos));
    const ultimoDia = await this.reportes.count({ where: { userId: user.id, createdAt: MoreThanOrEqual(new Date(Date.now() - 24 * 60 * 60 * 1000)) } });
    if (ultimoDia >= LIMITES_REPORTE.porDia) {
      throw new HttpException('Llegaste al máximo de reportes por hoy. ¡Gracias por tantos!', HttpStatus.TOO_MANY_REQUESTS);
    }
    const clase = await this.nombreDeClase(datos.classId);
    const r = await this.reportes.save(this.reportes.create({ ...v, clase, userId: user.id, rol: user.role, estado: 'nuevo' }));
    return { id: r.id };
  }

  /** Lo que yo reporté y en qué va (con la nota del admin, si dejó una). */
  async mios(user: User) {
    const lista = await this.reportes.find({ where: { userId: user.id }, order: { createdAt: 'DESC' }, take: 50 });
    return lista.map((r) => ({ id: r.id, tipo: r.tipo, gravedad: r.gravedad, texto: r.texto, ruta: r.ruta, clase: r.clase, estado: r.estado, nota: r.nota, createdAt: r.createdAt }));
  }

  /** Bandeja del admin: lo más grave primero y, dentro de eso, lo más nuevo. */
  async todos(estado?: string) {
    if (estado && !(ESTADOS_REPORTE as readonly string[]).includes(estado)) throw new BadRequestException('Estado no válido.');
    const lista = await this.reportes.find({ where: estado ? { estado: estado as EstadoReporte } : {}, order: { createdAt: 'DESC' }, take: 500 });
    const ids = [...new Set(lista.map((r) => r.userId))];
    const usuarios = ids.length ? await this.usuarios.find({ where: { id: In(ids) } }) : [];
    const nombre = new Map(usuarios.map((u) => [u.id, u.fullName]));
    return lista
      .map((r) => ({ ...r, autor: nombre.get(r.userId) ?? '—' }))
      .sort((a, b) => (b.gravedad ?? 0) - (a.gravedad ?? 0) || b.createdAt.getTime() - a.createdAt.getTime());
  }

  async revisar(id: number, datos: Record<string, unknown>) {
    const v = reglas(() => validarRevision(datos));
    const r = await this.reportes.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Reporte no encontrado');
    Object.assign(r, v);
    await this.reportes.save(r);
    return { id: r.id, estado: r.estado, nota: r.nota };
  }
}
