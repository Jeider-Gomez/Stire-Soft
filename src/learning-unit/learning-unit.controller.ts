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
  create(@Body() createDto: CreateLearningUnitDto) {
    return this.learningUnitService.create(createDto);
  }

  /**
   * Obtener todas las unidades activas (para estudiantes)
   */
  @Get()
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
  findOne(@Param('id') id: string) {
    return this.learningUnitService.findOne(+id);
  }

  /**
   * Actualizar una unidad (solo docentes/admin)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateLearningUnitDto) {
    return this.learningUnitService.update(+id, updateDto);
  }

  /**
   * Eliminar una unidad (solo admin)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.learningUnitService.remove(+id);
  }
}
