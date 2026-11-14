import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LaboratorioPublicacion } from './entities/laboratorio-publicacion.entity';
import { LaboratorioMeGusta } from './entities/laboratorio-me-gusta.entity';
import { LaboratorioComentario } from './entities/laboratorio-comentario.entity';
import { LaboratorioReporte } from './entities/laboratorio-reporte.entity';
import { ProyectosService } from './proyectos.service';
import { esTipoProyecto, type TipoProyecto } from './proyecto-reglas';
import {
  esAlcance,
  extractoDe,
  iniciales,
  LaboratorioInvalidoError,
  LIMITES_LABORATORIO,
  nombreCorto,
  puedeVer,
  tituloDeCopia,
  validarComentario,
  validarDescripcion,
  validarMotivo,
  type AlcanceLaboratorio,
} from './laboratorio-reglas';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { Class } from '../class/entities/class.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../common/enums/notification-type.enum';

interface Quien {
  id: number;
  esAdmin: boolean;
  clasesQueEnsena: number[];
  clasesDondeEstudia: number[];
}

export interface FiltroLaboratorio {
  alcance?: unknown;
  classId?: unknown;
  tipo?: unknown;
}

/**
 * El Laboratorio (laboratorio-reglas.ts): mostrar un proyecto propio a la clase o a toda la universidad, probar los de
 * otros, dejarles un mensaje, darles «me gusta», hacer una copia propia y reportar lo que no esté bien. Lo que no se
 * puede ver responde 404, como si no existiera.
 */
@Injectable()
export class LaboratorioService {
  constructor(
    @InjectRepository(LaboratorioPublicacion) private readonly publicaciones: Repository<LaboratorioPublicacion>,
    @InjectRepository(LaboratorioMeGusta) private readonly meGusta: Repository<LaboratorioMeGusta>,
    @InjectRepository(LaboratorioComentario) private readonly comentarios: Repository<LaboratorioComentario>,
    @InjectRepository(LaboratorioReporte) private readonly reportes: Repository<LaboratorioReporte>,
    @InjectRepository(Enrollment) private readonly matriculas: Repository<Enrollment>,
    @InjectRepository(Class) private readonly clases: Repository<Class>,
    @InjectRepository(User) private readonly usuarios: Repository<User>,
    private readonly proyectos: ProyectosService,
    private readonly avisos: NotificationsService,
  ) {}

  private reglas<T>(fn: () => T): T {
    try {
      return fn();
    } catch (e) {
      if (e instanceof LaboratorioInvalidoError) throw new BadRequestException(e.message);
      throw e;
    }
  }

  private async quien(user: User): Promise<Quien> {
    const esAdmin = user.role === UserRole.ADMIN;
    const clasesQueEnsena = user.role === UserRole.DOCENTE ? (await this.clases.find({ where: { teacherId: user.id } })).map((c) => c.id) : [];
    const clasesDondeEstudia =
      user.role === UserRole.ESTUDIANTE ? (await this.matriculas.find({ where: { studentId: user.id, status: EnrollmentStatus.ACTIVE } })).map((m) => m.classId) : [];
    return { id: user.id, esAdmin, clasesQueEnsena, clasesDondeEstudia };
  }

  private async exigirAcceso(user: User): Promise<void> {
    if (!(await this.proyectos.disponible(user))) throw new ForbiddenException('El Laboratorio todavía no está disponible para tu cuenta.');
  }

  /** La publicación, si quien pregunta la puede ver; si no, 404. */
  private async visible(user: User, id: number): Promise<{ pub: LaboratorioPublicacion; quien: Quien }> {
    await this.exigirAcceso(user);
    const pub = await this.publicaciones.findOne({ where: { id } });
    const quien = await this.quien(user);
    if (!pub || !puedeVer(pub, quien)) throw new NotFoundException('Ese proyecto no está en el Laboratorio.');
    return { pub, quien };
  }

  /** Nombre corto, iniciales y foto de cada autor; nombre de cada clase. */
  private async nombres(autorIds: number[], classIds: number[]) {
    const autores = autorIds.length ? await this.usuarios.find({ where: { id: In([...new Set(autorIds)]) } }) : [];
    const clases = classIds.length ? await this.clases.find({ where: { id: In([...new Set(classIds)]) } }) : [];
    const autor = new Map(autores.map((u) => [u.id, { nombre: nombreCorto(u.fullName), iniciales: iniciales(u.fullName), fotoId: u.fotoId ?? null, esDocente: u.role !== UserRole.ESTUDIANTE }]));
    const clase = new Map(clases.map((c) => [c.id, { nombre: c.name, teacherId: c.teacherId }]));
    return { autor, clase };
  }

  private async conteos(ids: number[], userId: number) {
    if (!ids.length) return { gustos: new Map<number, number>(), mios: new Set<number>(), mensajes: new Map<number, number>() };
    const gustos = await this.meGusta.find({ where: { publicacionId: In(ids) } });
    const mensajes = await this.comentarios.find({ where: { publicacionId: In(ids) }, select: { id: true, publicacionId: true } });
    const cuenta = (lista: { publicacionId: number }[]) => lista.reduce((m, x) => m.set(x.publicacionId, (m.get(x.publicacionId) ?? 0) + 1), new Map<number, number>());
    return { gustos: cuenta(gustos), mios: new Set(gustos.filter((g) => g.userId === userId).map((g) => g.publicacionId)), mensajes: cuenta(mensajes) };
  }

  private async resumir(lista: LaboratorioPublicacion[], quien: Quien) {
    const { autor, clase } = await this.nombres(lista.map((p) => p.autorId), lista.map((p) => p.classId));
    const { gustos, mios, mensajes } = await this.conteos(lista.map((p) => p.id), quien.id);
    return lista.map((p) => ({
      id: p.id,
      proyectoId: p.autorId === quien.id ? p.proyectoId : null,
      titulo: p.titulo,
      tipo: p.tipo,
      descripcion: p.descripcion,
      alcance: p.alcance,
      autor: autor.get(p.autorId) ?? { nombre: 'Alguien', iniciales: '?', fotoId: null, esDocente: false },
      clase: clase.get(p.classId)?.nombre ?? '',
      classId: p.classId,
      esMia: p.autorId === quien.id,
      puedeModerar: quien.esAdmin || quien.clasesQueEnsena.includes(p.classId),
      oculta: p.oculta,
      meGusta: gustos.get(p.id) ?? 0,
      laMarque: mios.has(p.id),
      mensajes: mensajes.get(p.id) ?? 0,
      extracto: extractoDe(p.tipo, p.archivos ?? []),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Lo que hay en el Laboratorio: de una clase (la que se pida, si es de quien pregunta; si no, todas las suyas) o de
   * toda la universidad. Lo más nuevo primero; se puede filtrar por tipo.
   */
  async listar(user: User, filtro: FiltroLaboratorio = {}) {
    await this.exigirAcceso(user);
    const quien = await this.quien(user);
    const alcance: AlcanceLaboratorio = esAlcance(filtro.alcance) ? filtro.alcance : 'clase';
    const tipo: TipoProyecto | undefined = esTipoProyecto(filtro.tipo) ? filtro.tipo : undefined;
    let lista: LaboratorioPublicacion[];
    if (alcance === 'universidad') {
      lista = await this.publicaciones.find({ where: { alcance: 'universidad', ...(tipo ? { tipo } : {}) }, order: { createdAt: 'DESC' }, take: LIMITES_LABORATORIO.porPagina });
    } else {
      const suyas = [...quien.clasesDondeEstudia, ...quien.clasesQueEnsena];
      const pedida = Number(filtro.classId);
      const clases = suyas.includes(pedida) ? [pedida] : suyas;
      if (!clases.length && !quien.esAdmin) return [];
      lista = await this.publicaciones.find({
        where: { ...(clases.length ? { classId: In(clases) } : {}), ...(tipo ? { tipo } : {}) },
        order: { createdAt: 'DESC' },
        take: LIMITES_LABORATORIO.porPagina,
      });
    }
    return this.resumir(lista.filter((p) => puedeVer(p, quien)), quien);
  }

  /** Una publicación con sus archivos (para probarla y ver el código) y sus mensajes. */
  async obtener(user: User, id: number) {
    const { pub, quien } = await this.visible(user, id);
    const [resumen] = await this.resumir([pub], quien);
    const lista = await this.comentarios.find({ where: { publicacionId: id }, order: { createdAt: 'ASC', id: 'ASC' } });
    const { autor } = await this.nombres(lista.map((c) => c.autorId), []);
    const yaReporte = (await this.reportes.count({ where: { publicacionId: id, userId: user.id } })) > 0;
    return {
      ...resumen,
      archivos: pub.archivos,
      yaReporte,
      comentarios: lista.map((c) => ({
        id: c.id,
        texto: c.texto,
        autor: autor.get(c.autorId) ?? { nombre: 'Alguien', iniciales: '?', fotoId: null, esDocente: false },
        esMio: c.autorId === user.id,
        puedoBorrar: c.autorId === user.id || resumen.puedeModerar,
        createdAt: c.createdAt,
      })),
    };
  }

  /** Mis publicaciones, para marcar en «Mis proyectos» cuáles están en el Laboratorio. */
  async mias(user: User) {
    await this.exigirAcceso(user);
    const lista = await this.publicaciones.find({ where: { autorId: user.id }, order: { updatedAt: 'DESC' } });
    return lista.map((p) => ({ id: p.id, proyectoId: p.proyectoId, alcance: p.alcance, classId: p.classId, descripcion: p.descripcion, oculta: p.oculta, updatedAt: p.updatedAt }));
  }

  /**
   * Mostrar un proyecto propio: se publica una copia de sus archivos en una de las clases de quien lo publica. Si ya
   * estaba publicado, se actualiza (la misma publicación, con sus me gusta y mensajes).
   */
  async publicar(user: User, datos: { proyectoId?: unknown; classId?: unknown; alcance?: unknown; descripcion?: unknown }) {
    const proyecto = await this.proyectos.obtener(user, Number(datos.proyectoId));
    const quien = await this.quien(user);
    const classId = Number(datos.classId);
    if (!quien.clasesDondeEstudia.includes(classId) && !quien.clasesQueEnsena.includes(classId)) {
      throw new BadRequestException('Elige una de tus clases para mostrar el proyecto.');
    }
    if (!esAlcance(datos.alcance)) throw new BadRequestException('Elige con quién lo compartes: tu clase o toda la universidad.');
    const descripcion = this.reglas(() => validarDescripcion(datos.descripcion));
    const previa = await this.publicaciones.findOne({ where: { proyectoId: proyecto.id } });
    const pub = previa ?? this.publicaciones.create({ proyectoId: proyecto.id, autorId: user.id, oculta: false });
    Object.assign(pub, { classId, alcance: datos.alcance, descripcion, titulo: proyecto.titulo, tipo: proyecto.tipo, archivos: proyecto.archivos });
    const guardada = await this.publicaciones.save(pub);
    return { id: guardada.id, actualizada: !!previa };
  }

  /** Quitar una publicación del Laboratorio: su autor o un administrador. El proyecto sigue en «Mis proyectos». */
  async quitar(user: User, id: number): Promise<void> {
    const { pub, quien } = await this.visible(user, id);
    if (pub.autorId !== user.id && !quien.esAdmin) throw new ForbiddenException('Solo quien lo publicó puede quitarlo del Laboratorio.');
    await this.meGusta.delete({ publicacionId: id });
    await this.comentarios.delete({ publicacionId: id });
    await this.reportes.delete({ publicacionId: id });
    await this.publicaciones.delete({ id });
  }

  /** Me gusta / ya no: uno por persona. */
  async alternarMeGusta(user: User, id: number) {
    await this.visible(user, id);
    const ya = await this.meGusta.findOne({ where: { publicacionId: id, userId: user.id } });
    if (ya) await this.meGusta.delete({ publicacionId: id, userId: user.id });
    else await this.meGusta.save(this.meGusta.create({ publicacionId: id, userId: user.id }));
    return { laMarque: !ya, meGusta: await this.meGusta.count({ where: { publicacionId: id } }) };
  }

  /** Un mensaje para el autor; al autor le llega un aviso (si no es él mismo). */
  async comentar(user: User, id: number, datos: { texto?: unknown }) {
    const { pub } = await this.visible(user, id);
    const texto = this.reglas(() => validarComentario(datos.texto));
    const guardado = await this.comentarios.save(this.comentarios.create({ publicacionId: id, autorId: user.id, texto }));
    if (pub.autorId !== user.id) {
      await this.avisos.createNotification(pub.autorId, 'Un mensaje en tu proyecto', `${nombreCorto(user.fullName)} escribió en «${pub.titulo}».`, NotificationType.MESSAGE, {
        enlace: `/estudiante/proyectos/laboratorio/${id}`,
      });
    }
    return { id: guardado.id };
  }

  /** Borrar un mensaje: quien lo escribió, el docente de la clase o un administrador. */
  async borrarComentario(user: User, id: number, comentarioId: number): Promise<void> {
    const { pub, quien } = await this.visible(user, id);
    const c = await this.comentarios.findOne({ where: { id: comentarioId, publicacionId: id } });
    if (!c) throw new NotFoundException('Ese mensaje ya no está.');
    const modera = quien.esAdmin || quien.clasesQueEnsena.includes(pub.classId);
    if (c.autorId !== user.id && !modera) throw new ForbiddenException('Solo quien lo escribió o el docente pueden borrarlo.');
    await this.comentarios.delete({ id: comentarioId });
  }

  /** «Hacer mi copia»: un proyecto nuevo, propio, con los archivos publicados. */
  async copiar(user: User, id: number) {
    const { pub } = await this.visible(user, id);
    const copia = await this.proyectos.crearConArchivos(user, tituloDeCopia(pub.titulo), pub.tipo, pub.archivos);
    return { proyectoId: copia.id };
  }

  /**
   * «¿Algo no está bien?»: un reporte por persona. Le llega un aviso al docente de la clase y, con varios reportes de
   * personas distintas, la publicación se oculta sola hasta que el docente la revise.
   */
  async reportar(user: User, id: number, datos: { motivo?: unknown; comentarioId?: unknown }) {
    const { pub } = await this.visible(user, id);
    if (pub.autorId === user.id) throw new BadRequestException('No puedes reportar tu propio proyecto; si quieres, quítalo del Laboratorio.');
    const motivo = this.reglas(() => validarMotivo(datos.motivo));
    if (await this.reportes.findOne({ where: { publicacionId: id, userId: user.id } })) return { yaReportado: true, oculta: pub.oculta };
    const comentarioId = Number.isInteger(Number(datos.comentarioId)) && Number(datos.comentarioId) > 0 ? Number(datos.comentarioId) : null;
    await this.reportes.save(this.reportes.create({ publicacionId: id, userId: user.id, motivo, comentarioId }));
    const total = await this.reportes.count({ where: { publicacionId: id } });
    if (total >= LIMITES_LABORATORIO.reportesParaOcultar && !pub.oculta) {
      pub.oculta = true;
      await this.publicaciones.save(pub);
    }
    const clase = await this.clases.findOne({ where: { id: pub.classId } });
    if (clase?.teacherId) {
      await this.avisos.createNotification(
        clase.teacherId,
        'Reportaron algo en el Laboratorio',
        `Revisa «${pub.titulo}» (${clase.name}).${motivo ? ` Motivo: ${motivo}` : ''}${pub.oculta ? ' Quedó oculto hasta que lo revises.' : ''}`,
        NotificationType.AVISO,
      );
    }
    return { yaReportado: false, oculta: pub.oculta };
  }

  /** El docente de la clase (o un administrador) oculta o vuelve a mostrar una publicación. */
  async ocultar(user: User, id: number, datos: { oculta?: unknown }) {
    const { pub, quien } = await this.visible(user, id);
    if (!quien.esAdmin && !quien.clasesQueEnsena.includes(pub.classId)) throw new ForbiddenException('Solo el docente de la clase puede ocultarlo.');
    pub.oculta = datos.oculta !== false;
    if (!pub.oculta) await this.reportes.delete({ publicacionId: id });
    await this.publicaciones.save(pub);
    return { oculta: pub.oculta };
  }
}
