import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
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
  constructor(
    private readonly classService: ClassService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente')
  create(@Body() createClassDto: CreateClassDto, @GetUser() user: User) {
    return this.classService.create(createClassDto, user.id);
  }

  // OLA 3 - PUNTO 2: catálogo de clases disponibles — abierto a cualquier
  // rol autenticado de forma deliberada, pero SIN el código de ingreso ni el
  // correo del docente (el código es el secreto que da acceso a la clase).
  // Solo el admin ve la vista completa.
  @Get()
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  findAll(@GetUser() user: User) {
    return user.role === 'admin' ? this.classService.findAll() : this.classService.findCatalogue();
  }

  @Get('my-classes')
  @UseGuards(RolesGuard)
  @Roles('docente', 'estudiante')
  findMyClasses(@GetUser() user: User) {
    if (user.role === 'docente') {
      return this.classService.findByTeacher(user.id);
    }
    return this.classService.findByStudent(user.id); // Estudiante: solo sus clases activas
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.classService.findOneFor(id, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
    @GetUser() user: User,
  ) {
    return this.classService.update(id, updateClassDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.classService.remove(+id, user);
  }
}
