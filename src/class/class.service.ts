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

  async findByTeacher(teacherId: number): Promise<Class[]> {
    return await this.classRepository.find({
      where: { teacherId },
      relations: ['teacher'],
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

  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.classRepository.remove(classEntity);
  }
}
