import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('class')
@UseGuards(JwtAuthGuard)
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  /**
   * Crear una nueva clase (solo docentes)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente')
  create(@Body() createClassDto: CreateClassDto, @GetUser() user: User) {
    return this.classService.create(createClassDto, user.id);
  }

  /**
   * Obtener todas las clases
   */
  @Get()
  findAll() {
    return this.classService.findAll();
  }

  /**
   * Obtener mis clases como docente
   */
  @Get('my-classes')
  @UseGuards(RolesGuard)
  @Roles('docente')
  findMyClasses(@GetUser() user: User) {
    return this.classService.findByTeacher(user.id);
  }

  /**
   * Obtener mis clases como estudiante
   */
  @Get('my-enrollments')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  findMyEnrollments(@GetUser() user: User) {
    return this.classService.findByStudent(user.id);
  }

  /**
   * Obtener una clase por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classService.findOne(+id);
  }

  /**
   * Actualizar una clase (solo docentes)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto, @GetUser() user: User) {
    return this.classService.update(+id, updateClassDto, user.id);
  }

  /**
   * Agregar un estudiante a una clase (solo docentes)
   */
  @Post(':id/students/:studentId')
  @UseGuards(RolesGuard)
  @Roles('docente')
  addStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.classService.addStudent(+id, +studentId);
  }

  /**
   * Remover un estudiante de una clase (solo docentes)
   */
  @Delete(':id/students/:studentId')
  @UseGuards(RolesGuard)
  @Roles('docente')
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string) {
    return this.classService.removeStudent(+id, +studentId);
  }

  /**
   * Obtener estudiantes de una clase
   */
  @Get(':id/students')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getStudents(@Param('id') id: string) {
    return this.classService.getStudents(+id);
  }

  /**
   * Eliminar una clase (solo docentes)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  remove(@Param('id') id: string) {
    return this.classService.remove(+id);
  }
}
