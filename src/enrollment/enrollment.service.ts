import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { EnrollmentStatus } from './enums/enrollment-status.enum';
import { ClassService } from '../class/class.service';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly classService: ClassService,
    private readonly userService: UserService,
  ) {}

  async joinClass(userId: number, code: string): Promise<Enrollment> {
    const user = await this.userService.findOne(userId);
    if (user.role === UserRole.DOCENTE) {
      throw new ForbiddenException('Los docentes no pueden matricularse como estudiantes.');
    }

    const classEntity = await this.classService.findByCode(code);
    if (!classEntity) {
      throw new NotFoundException('Clase no encontrada o código inválido');
    }

    if (!classEntity.isActive) {
      throw new BadRequestException('La clase no está activa');
    }

    const now = new Date();
    if (classEntity.startDate && now < classEntity.startDate) {
      throw new BadRequestException('La clase aún no ha comenzado');
    }
    if (classEntity.endDate && now > classEntity.endDate) {
      throw new BadRequestException('La clase ya ha finalizado');
    }

    if (classEntity.maxStudents) {
      const activeCount = await this.enrollmentRepository.count({
        where: { classId: classEntity.id, status: EnrollmentStatus.ACTIVE },
      });
      if (activeCount >= classEntity.maxStudents) {
        throw new BadRequestException('La clase ha alcanzado el límite de estudiantes');
      }
    }

    let enrollment = await this.enrollmentRepository.findOne({
      where: { studentId: userId, classId: classEntity.id },
    });

    if (enrollment) {
      if (enrollment.status === EnrollmentStatus.ACTIVE) {
        throw new ConflictException('Ya estás inscrito en esta clase');
      }
      if (enrollment.status === EnrollmentStatus.COMPLETED) {
        throw new ConflictException('Ya has completado esta clase');
      }

      enrollment.status = EnrollmentStatus.ACTIVE;
      enrollment.leftAt = undefined;
      enrollment.lastActivityAt = new Date();
      return await this.enrollmentRepository.save(enrollment);
    }

    enrollment = this.enrollmentRepository.create({
      studentId: userId,
      classId: classEntity.id,
      status: EnrollmentStatus.ACTIVE,
      lastActivityAt: new Date(),
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { studentId },
      relations: ['class', 'class.teacher'],
    });
  }

  async findByClass(classId: number): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { classId },
      relations: ['student'],
    });
  }

  async validateEnrollment(userId: number, classId: number): Promise<Enrollment> {
    const user = await this.userService.findOne(userId);
    if (user.role === UserRole.DOCENTE) {
      throw new ForbiddenException('Los docentes no tienen matrículas de estudiante.');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { studentId: userId, classId },
    });

    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new ForbiddenException('No tienes acceso activo a esta clase');
    }

    return enrollment;
  }

  async updateLastActivity(userId: number, classId: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { studentId: userId, classId },
    });

    if (enrollment && enrollment.status === EnrollmentStatus.ACTIVE) {
      enrollment.lastActivityAt = new Date();
      await this.enrollmentRepository.save(enrollment);
    }
  }
}
