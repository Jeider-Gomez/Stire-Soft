import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { Section } from '../section/entities/section.entity';
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

export interface ClassWithStats extends Class {
  enrollmentCount: number;
  avgMastery?: number;
}

// Vista de catálogo: lo que puede ver quien NO es dueño, admin ni matriculado.
// Sin `code` (es el secreto de ingreso) ni el correo del docente.
export type PublicClass = Omit<Class, 'code' | 'teacher' | 'enrollments' | 'sections' | 'students'> & {
  teacher?: { id: number; fullName: string };
};

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
    const classEntity = this.classRepository.create({ ...createClassDto, ...academico, code, teacherId });
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
      where: { id: In(enrollments.map((e) => e.classId)) },
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
   * (matrículas activas y maestría global del estudiante, promediada por clase;
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

    const masteryByStudent = new Map<number, number>();
    for (const studentId of studentIds) {
      const studentProgress = progressList.filter((p) => p.studentId === studentId);
      const avg = studentProgress.length
        ? studentProgress.reduce((acc, p) => acc + p.mastery, 0) / studentProgress.length
        : 0;
      masteryByStudent.set(studentId, avg);
    }

    return classes.map((cls) => {
      const classEnrollments = enrollments.filter((e) => e.classId === cls.id);
      const masteries = classEnrollments.map((e) => masteryByStudent.get(e.studentId) ?? 0);
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
    Object.assign(classEntity, updateClassDto, academico);
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
    return out;
  }

  /** Compartir con la asignatura, el programa, la facultad o la institución exige que la clase tenga esos datos. */
  private validarAlcance(c: Partial<Class>): void {
    const problema = problemaDelAlcance(c.alcancePlantilla ?? 'nadie', c.asignatura);
    if (problema) throw new BadRequestException(problema);
  }

  async remove(id: number, user: User): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, classEntity.id);
    // Con contenido, borrar fallaba con 500 (las unidades no se borran en cascada con sus temas) y, de lograrse,
    // se perderían entregas y el progreso de los estudiantes.
    const secciones = await this.classRepository.manager.count(Section, { where: { classId: classEntity.id } });
    if (secciones > 0) {
      throw new ConflictException(
        'Esta clase ya tiene contenido y no se puede eliminar: se perderían las entregas y el progreso de tus estudiantes.',
      );
    }
    await this.classRepository.remove(classEntity);
  }
}
