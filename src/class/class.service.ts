import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UserService } from '../user/user.service';
import { User, UserRole } from '../user/entities/user.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { normalizarCodigo, problemaDelCodigo } from './codigo-clase';
import { Asignatura } from '../institution/entities/asignatura.entity';
import { problemaDelAlcance } from '../reuse/alcance-plantilla';
import { CATEGORIAS_LOGRO } from '../analytics/logros';
import {
  ImpactoBorrado,
  borrarConfiguracionDeClase,
  borrarLecciones,
  exigirQueSePuedaEliminar,
  impactoDeLecciones,
  motivoDeBloqueo,
  trabajoEnClase,
} from '../common/contenido/borrado-contenido';

export interface ClassWithStats extends Class {
  enrollmentCount: number;
  avgMastery?: number;
}

// Vista de catálogo: lo que puede ver quien NO es dueño, admin ni matriculado.
// Sin `code` (es el secreto de ingreso) ni el correo del docente.
export type PublicClass = Omit<Class, 'code' | 'teacher' | 'enrollments' | 'sections' | 'students'> & {
  teacher?: { id: number; fullName: string };
};

/** El cuerpo sin los campos que llegan como lista y se guardan convertidos (datosAcademicos los convierte). */
function sinListas<T extends { categoriasLogro?: string[] | null }>(dto: T): Omit<T, 'categoriasLogro'> {
  const copia = { ...dto };
  delete copia.categoriasLogro;
  return copia;
}

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(LearningProgress)
    private readonly learningProgressRepository: Repository<LearningProgress>,
    private readonly userService: UserService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async create(createClassDto: CreateClassDto, teacherId: number): Promise<Class> {
    // Un solo código por clase, sin importar cómo se escriba: «algo web» y «ALGO-WEB» son el mismo.
    const code = normalizarCodigo(createClassDto.code);
    const problema = problemaDelCodigo(code);
    if (problema) throw new BadRequestException(problema);
    if (await this.classRepository.findOne({ where: { code } })) {
      throw new ConflictException('Ya existe una clase con ese código. Elige otro.');
    }

    const academico = await this.datosAcademicos(createClassDto);
    const classEntity = this.classRepository.create({ ...sinListas(createClassDto), ...academico, code, teacherId });
    this.validarAlcance(classEntity);
    try {
      return await this.classRepository.save(classEntity);
    } catch (err) {
      // Dos docentes creando el mismo código a la vez: el índice único de la base de datos decide.
      if ((err as { code?: string })?.code === 'ER_DUP_ENTRY') throw new ConflictException('Ya existe una clase con ese código. Elige otro.');
      throw err;
    }
  }

  /** Para el formulario del docente: si el código sirve y está libre (no dice de qué clase es si está ocupado). */
  async codigoDisponible(texto: unknown): Promise<{ codigo: string; disponible: boolean; motivo: string | null }> {
    const codigo = normalizarCodigo(texto);
    const problema = problemaDelCodigo(codigo);
    if (problema) return { codigo, disponible: false, motivo: problema };
    const ocupado = !!(await this.classRepository.findOne({ where: { code: codigo }, select: ['id'] }));
    return { codigo, disponible: !ocupado, motivo: ocupado ? 'Ya existe una clase con ese código.' : null };
  }

  async findAll(): Promise<Class[]> {
    return await this.classRepository.find({
      relations: ['teacher'],
    });
  }

  toPublicView(cls: Class): PublicClass {
    const { code, teacher, enrollments, sections, students, ...rest } = cls;
    return { ...rest, teacher: teacher ? { id: teacher.id, fullName: teacher.fullName } : undefined };
  }

  async findCatalogue(): Promise<PublicClass[]> {
    return (await this.findAll()).map((c) => this.toPublicView(c));
  }

  async findByStudent(studentId: number): Promise<Class[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { studentId, status: EnrollmentStatus.ACTIVE },
    });
    if (enrollments.length === 0) return [];
    return await this.classRepository.find({
      // Una clase archivada sale del inicio del estudiante (Fase 30); el docente la sigue viendo en «Archivadas».
      where: { id: In(enrollments.map((e) => e.classId)), isActive: true },
      relations: ['teacher'],
    });
  }

  /** Vista completa para admin, docente dueño y estudiante matriculado; catálogo (sin código) para el resto. */
  async findOneFor(id: number, user: User): Promise<Class | PublicClass> {
    const cls = await this.findOne(id);
    if (user.role === UserRole.ADMIN || cls.teacherId === user.id) return cls;
    if (user.role === UserRole.ESTUDIANTE) {
      const enrolled = await this.enrollmentRepository.findOne({
        where: { classId: id, studentId: user.id, status: EnrollmentStatus.ACTIVE },
      });
      if (enrolled) return cls;
    }
    return this.toPublicView(cls);
  }

  /**
   * Igual que la clase, pero con `enrollmentCount`, `avgMastery` y `atRiskCount`
   * (matrículas activas y maestría del estudiante en las lecciones de esa clase, promediada;
   * "en riesgo" = maestría < 50, mismo umbral que `rendimiento.vue`). Antes el
   * dashboard docente mostraba estos tres datos como 0 fijo porque este endpoint
   * nunca los calculaba.
   */
  async findByTeacher(teacherId: number): Promise<ClassWithStats[]> {
    const classes = await this.classRepository.find({
      where: { teacherId },
      relations: ['teacher'],
    });
    if (classes.length === 0) return [];

    const classIds = classes.map((c) => c.id);
    const enrollments = await this.enrollmentRepository.find({
      where: { classId: In(classIds), status: EnrollmentStatus.ACTIVE },
    });

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];
    const progressList = studentIds.length
      ? await this.learningProgressRepository.find({ where: { studentId: In(studentIds) } })
      : [];

    // Solo las lecciones de cada clase, como en «Rendimiento del grupo» (analytics.service.ts): antes se promediaba el
    // dominio del estudiante en TODAS sus clases, y el inicio del docente decía «0 en rezago» mientras Rendimiento decía
    // «1 de 5» para la misma clase (crítica de diseño del 05/10).
    const unidades: Array<{ unitId: number; classId: number }> = classIds.length
      ? await this.classRepository.manager.query(
          'SELECT lu.id AS unitId, s.classId AS classId FROM learning_units lu JOIN topics t ON lu.topicId = t.id ' +
            'JOIN sections s ON t.sectionId = s.id WHERE s.classId IN (?)',
          [classIds],
        )
      : [];
    const claseDeUnidad = new Map(unidades.map((u) => [Number(u.unitId), Number(u.classId)]));
    const dominioEnClase = (studentId: number, classId: number): number => {
      const suyos = progressList.filter((p) => p.studentId === studentId && claseDeUnidad.get(p.learningUnitId) === classId);
      return suyos.length ? suyos.reduce((acc, p) => acc + p.mastery, 0) / suyos.length : 0;
    };

    return classes.map((cls) => {
      const classEnrollments = enrollments.filter((e) => e.classId === cls.id);
      const masteries = classEnrollments.map((e) => dominioEnClase(e.studentId, cls.id));
      const avgMastery = masteries.length
        ? Math.round((masteries.reduce((acc, m) => acc + m, 0) / masteries.length) * 100) / 100
        : undefined;

      return Object.assign(cls, {
        enrollmentCount: classEnrollments.length,
        avgMastery,
        atRiskCount: masteries.filter((m) => m < 50).length,
      });
    });
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['teacher'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    return classEntity;
  }

  async findByCode(code: string): Promise<Class | null> {
    // TypeORM ignora un `where` con valor undefined y devuelve la PRIMERA fila:
    // sin este guard, un código ausente matriculaba en la clase de menor id.
    if (typeof code !== 'string' || code.trim() === '') return null;
    // El estudiante puede escribirlo con minúsculas, tildes o espacios: se busca en la misma forma en que se guardó.
    const normalizado = normalizarCodigo(code);
    if (!normalizado) return null;
    return await this.classRepository.findOne({
      where: { code: normalizado },
    });
  }

  async update(id: number, updateClassDto: UpdateClassDto, user: User): Promise<Class> {
    const classEntity = await this.findOne(id);

    // F24-09: un docente ajeno recibía 409 (Conflict); es una falta de permiso → 403, igual que el resto de operaciones sobre la clase.
    await this.authorizationService.assertTeacherOwnsClass(user, classEntity.id);

    const academico = await this.datosAcademicos(updateClassDto);
    Object.assign(classEntity, sinListas(updateClassDto), academico);
    this.validarAlcance(classEntity);
    return await this.classRepository.save(classEntity);
  }

  /**
   * Asignatura, periodo y grupo listos para guardar (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md). La asignatura debe existir;
   * la relación se asigna junto con su id porque, ya cargada, TypeORM la usaría en lugar del id. Texto vacío = sin dato.
   */
  private async datosAcademicos(dto: CreateClassDto | UpdateClassDto): Promise<Partial<Class>> {
    const out: Partial<Class> = {};
    if (dto.asignaturaId !== undefined) {
      if (dto.asignaturaId === null) {
        out.asignaturaId = null;
        out.asignatura = null;
      } else {
        const asignatura = await this.classRepository.manager.findOne(Asignatura, { where: { id: dto.asignaturaId } });
        if (!asignatura) throw new BadRequestException('Esa asignatura no existe. Búscala de nuevo o agrégala.');
        out.asignaturaId = asignatura.id;
        out.asignatura = asignatura;
      }
    }
    if (dto.periodo !== undefined) out.periodo = dto.periodo?.trim() || null;
    if (dto.grupo !== undefined) out.grupo = dto.grupo?.trim() || null;
    // Alcance de la plantilla y el antiguo sí/no siempre coinciden: «sí» es compartir con todos.
    if (dto.alcancePlantilla !== undefined) {
      out.alcancePlantilla = dto.alcancePlantilla;
      out.compartidaComoPlantilla = dto.alcancePlantilla !== 'nadie';
    } else if (dto.compartidaComoPlantilla !== undefined) {
      out.alcancePlantilla = dto.compartidaComoPlantilla ? 'todos' : 'nadie';
    }
    if (dto.enfoque !== undefined) out.enfoque = dto.enfoque?.trim() || null;
    // Categorías de logros: en el orden del catálogo, sin repetir; todas (o ninguna marcada) = vacío, que es «todas».
    if (dto.categoriasLogro !== undefined) {
      const elegidas = CATEGORIAS_LOGRO.filter((c) => (dto.categoriasLogro ?? []).includes(c));
      out.categoriasLogro = elegidas.length === 0 || elegidas.length === CATEGORIAS_LOGRO.length ? null : elegidas.join(',');
    }
    return out;
  }

  /** Compartir con la asignatura, el programa, la facultad o la institución exige que la clase tenga esos datos. */
  private validarAlcance(c: Partial<Class>): void {
    const problema = problemaDelAlcance(c.alcancePlantilla ?? 'nadie', c.asignatura);
    if (problema) throw new BadRequestException(problema);
  }

  /**
   * Eliminar una clase (Fase 30, 06/10). Una clase creada por error se puede eliminar aunque tenga módulos, siempre que
   * ningún estudiante haya trabajado en ella (si no, 409: se archiva). Antes se bloqueaba con cualquier módulo porque
   * borrarla fallaba con 500 (las lecciones no caen en cascada con sus temas) y, de lograrse, se perdía el trabajo.
   */
  async remove(id: number, user: User): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, classEntity.id);
    await this.classRepository.manager.transaction(async (manager) => {
      const { impacto, unitIds } = await this.medirClase(manager, classEntity.id);
      exigirQueSePuedaEliminar(impacto);
      await borrarLecciones(manager, unitIds);
      await borrarConfiguracionDeClase(manager, classEntity.id);
      // Módulos (y con ellos sus temas), matrículas y sesiones de asistencia caen en cascada con la clase.
      await manager.delete(Class, { id: classEntity.id });
    });
  }

  /** Qué se pierde si se elimina la clase: su contenido, los estudiantes matriculados y si alguien ya trabajó en ella. */
  async impacto(id: number, user: User): Promise<ImpactoBorrado> {
    const classEntity = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, classEntity.id);
    return (await this.medirClase(this.classRepository.manager, classEntity.id)).impacto;
  }

  private async medirClase(manager: EntityManager, classId: number): Promise<{ impacto: ImpactoBorrado; unitIds: number[] }> {
    const filas: Array<{ seccion: number; tema: number | null; leccion: number | null }> = await manager.query(
      'SELECT s.id AS seccion, t.id AS tema, lu.id AS leccion FROM sections s ' +
        'LEFT JOIN topics t ON t.sectionId = s.id LEFT JOIN learning_units lu ON lu.topicId = t.id WHERE s.classId = ?',
      [classId],
    );
    const distintos = (xs: Array<number | null>) => [...new Set(xs.filter((x): x is number => x != null).map(Number))];
    const unitIds = distintos(filas.map((f) => f.leccion));
    const contenido = await impactoDeLecciones(manager, unitIds, {
      modulos: distintos(filas.map((f) => f.seccion)).length,
      temas: distintos(filas.map((f) => f.tema)).length,
    });
    const trabajo = await trabajoEnClase(manager, classId);
    const matriculas: Array<{ n: string | number }> = await manager.query(
      'SELECT COUNT(*) AS n FROM enrollments WHERE classId = ? AND status = ?',
      [classId, EnrollmentStatus.ACTIVE],
    );
    const sePuedeEliminar = trabajo.estudiantes === 0 && trabajo.entregas === 0;
    const impacto: ImpactoBorrado = {
      modulos: contenido.modulos,
      temas: contenido.temas,
      lecciones: contenido.lecciones,
      ejercicios: contenido.ejercicios,
      estudiantesConAvance: trabajo.estudiantes,
      entregas: trabajo.entregas,
      matriculados: Number(matriculas[0]?.n ?? 0),
      sePuedeEliminar,
      ...(sePuedeEliminar ? {} : { motivo: motivoDeBloqueo(trabajo.estudiantes).replace('Archívalo', 'Archiva la clase') }),
    };
    return { impacto, unitIds };
  }

  /** Archivar: sale del inicio de sus estudiantes, no acepta nuevos ingresos ni trabajo; se conserva todo. */
  async archivar(id: number, user: User): Promise<Class> {
    return this.cambiarActiva(id, user, false);
  }

  async restaurar(id: number, user: User): Promise<Class> {
    return this.cambiarActiva(id, user, true);
  }

  private async cambiarActiva(id: number, user: User, activa: boolean): Promise<Class> {
    const classEntity = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, classEntity.id);
    classEntity.isActive = activa;
    return this.classRepository.save(classEntity);
  }
}
