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
import { ClassStudent } from './entities/class-student.entity';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(ClassStudent)
    private readonly classStudentRepository: Repository<ClassStudent>,
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
    const classes = await this.classRepository.find({
      where: { teacherId },
      relations: ['teacher', 'classStudents', 'classStudents.student'],
    });
    
    return classes.map(c => {
      c.students = c.classStudents?.map(cs => cs.student) || [];
      return c;
    });
  }

  /**
   * Obtener clases donde un estudiante está inscrito
   */
  async findByStudent(studentId: number): Promise<Class[]> {
    const classes = await this.classRepository
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.teacher', 'teacher')
      .leftJoinAndSelect('class.classStudents', 'classStudent')
      .leftJoinAndSelect('classStudent.student', 'student')
      .where('student.id = :studentId', { studentId })
      .getMany();
      
    return classes.map(c => {
      c.students = c.classStudents?.map(cs => cs.student) || [];
      return c;
    });
  }

  /**
   * Obtener una clase por ID
   */
  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: ['teacher', 'classStudents', 'classStudents.student'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    classEntity.students = classEntity.classStudents?.map(cs => cs.student) || [];
    return classEntity;
  }

  /**
   * Actualizar una clase
   */
  async update(id: number, updateClassDto: UpdateClassDto, teacherId: number): Promise<Class> {
    const classEntity = await this.findOne(id);

    // Validate ownership
    if (classEntity.teacherId !== teacherId) {
      throw new ConflictException('No tienes permiso para modificar esta clase');
    }

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
    const alreadyEnrolled = classEntity.classStudents?.some((cs) => cs.student.id === studentId);
    if (alreadyEnrolled) {
      throw new ConflictException('El estudiante ya está inscrito en esta clase');
    }

    const classStudent = this.classStudentRepository.create({
      classId,
      studentId,
    });
    
    await this.classStudentRepository.save(classStudent);
    return this.findOne(classId);
  }

  /**
   * Remover estudiante de una clase
   */
  async removeStudent(classId: number, studentId: number): Promise<Class> {
    const classEntity = await this.findOne(classId);

    await this.classStudentRepository.delete({ classId, studentId });
    return this.findOne(classId);
  }

  /**
   * Obtener estudiantes de una clase
   */
  async getStudents(classId: number) {
    const classEntity = await this.findOne(classId);
    // Ahora que mapped `students` es poblado en findOne, devolvemos junto con la fecha
    return classEntity.classStudents?.map(cs => ({
      ...cs.student,
      registrationDate: cs.registrationDate
    })) || [];
  }

  /**
   * Eliminar una clase
   */
  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.classRepository.remove(classEntity);
  }
}
