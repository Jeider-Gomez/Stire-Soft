import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from './entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    private readonly userService: UserService,
  ) {}

  /**
   * Crear una nueva clase
   */
  async create(createClassDto: CreateClassDto, teacherId: number): Promise<Class> {
    // Verificar que el código no exista
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

  /**
   * Obtener todas las clases
   */
  async findAll(): Promise<Class[]> {
    return await this.classRepository.find({
      relations: ['teacher'],
    });
  }

  /**
   * Obtener clases de un docente
   */
  async findByTeacher(teacherId: number): Promise<Class[]> {
    return await this.classRepository.find({
      where: { teacherId },
      relations: ['teacher', 'students'],
    });
  }

  /**
   * Obtener clases donde un estudiante está inscrito
   */
  async findByStudent(studentId: number): Promise<Class[]> {
    return await this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoin('class.students', 'student')
      .where('student.id = :studentId', { studentId })
      .getMany();
  }

  /**
   * Obtener una clase por ID
   */
  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['teacher', 'students'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    return classEntity;
  }

  /**
   * Actualizar una clase
   */
  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const classEntity = await this.findOne(id);
    Object.assign(classEntity, updateClassDto);
    return await this.classRepository.save(classEntity);
  }

  /**
   * Agregar estudiante a una clase
   */
  async addStudent(classId: number, studentId: number): Promise<Class> {
    const classEntity = await this.findOne(classId);
    const student = await this.userService.findOne(studentId);

    if (student.role !== UserRole.ESTUDIANTE) {
      throw new BadRequestException('El usuario no es un estudiante');
    }

    // Verificar si ya está inscrito
    const alreadyEnrolled = classEntity.students.some((s) => s.id === studentId);
    if (alreadyEnrolled) {
      throw new ConflictException('El estudiante ya está inscrito en esta clase');
    }

    classEntity.students.push(student);
    return await this.classRepository.save(classEntity);
  }

  /**
   * Remover estudiante de una clase
   */
  async removeStudent(classId: number, studentId: number): Promise<Class> {
    const classEntity = await this.findOne(classId);

    classEntity.students = classEntity.students.filter((s) => s.id !== studentId);
    return await this.classRepository.save(classEntity);
  }

  /**
   * Obtener estudiantes de una clase
   */
  async getStudents(classId: number) {
    const classEntity = await this.findOne(classId);
    return classEntity.students;
  }

  /**
   * Eliminar una clase
   */
  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.classRepository.remove(classEntity);
  }
}
