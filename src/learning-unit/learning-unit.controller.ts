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
import { LearningUnitService } from './learning-unit.service';
import { CreateLearningUnitDto } from './dto/create-learning-unit.dto';
import { UpdateLearningUnitDto } from './dto/update-learning-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrerequisitesGuard } from '../common/guards/prerequisites.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('learning-unit')
@UseGuards(JwtAuthGuard)
export class LearningUnitController {
  constructor(private readonly learningUnitService: LearningUnitService) {}

  /**
   * Crear una unidad de aprendizaje (solo docentes/admin)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  create(@Body() createDto: CreateLearningUnitDto, @GetUser() user: User) {
    return this.learningUnitService.create(createDto, user);
  }

  /**
   * Obtener todas las unidades activas (para estudiantes)
   */
  // OLA 3 - PUNTO 2: catálogo de unidades activas — abierto a cualquier rol
  // autenticado de forma deliberada.
  @Get()
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  findAll() {
    return this.learningUnitService.findAll();
  }

  /**
   * Obtener todas las unidades incluyendo inactivas (docentes/admin)
   */
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  findAllIncludingInactive() {
    return this.learningUnitService.findAllIncludingInactive();
  }

  /**
   * Obtener una unidad por ID
   */
  @Get(':id')
  @UseGuards(PrerequisitesGuard)
  @Roles('estudiante', 'docente', 'admin')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.learningUnitService.findOne(+id, user);
  }

  /**
   * Actualizar una unidad (solo docentes/admin)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateLearningUnitDto, @GetUser() user: User) {
    return this.learningUnitService.update(+id, updateDto, user);
  }

  /**
   * Eliminar una unidad (solo admin)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.learningUnitService.remove(+id, user);
  }
}
