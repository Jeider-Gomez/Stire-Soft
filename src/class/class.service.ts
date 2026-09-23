import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { EnrollmentStatus } from '../enrollment/enums/enrollment-status.enum';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UserService } from '../user/user.service';
import { User, UserRole } from '../user/entities/user.entity';
import { AuthorizationService } from '../common/authorization/authorization.service';

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
    const existing = await this.classRepository.findOne({
      where: { code: createClassDto.code },
    });

    if (existing) {
      throw new ConflictException('Ya existe una clase con ese código');
    }

    const classEntity = this.classRepository.create({
      ...createClassDto,
      teacherId,
    });

    return await this.classRepository.save(classEntity);
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
    return await this.classRepository.findOne({
      where: { code },
    });
  }

  async update(id: number, updateClassDto: UpdateClassDto, teacherId: number): Promise<Class> {
    const classEntity = await this.findOne(id);

    if (classEntity.teacherId !== teacherId) {
      throw new ConflictException('No tienes permiso para modificar esta clase');
    }

    Object.assign(classEntity, updateClassDto);
    return await this.classRepository.save(classEntity);
  }

  async remove(id: number, user: User): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.authorizationService.assertTeacherOwnsClass(user, classEntity.id);
    await this.classRepository.remove(classEntity);
  }
}
