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
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('evaluation')
@UseGuards(JwtAuthGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  /**
   * Crear una evaluación (docente/admin)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  create(@Body() createDto: CreateEvaluationDto) {
    return this.evaluationService.create(createDto);
  }

  /**
   * Obtener evaluaciones de una unidad
   */
  @Get('unit/:unitId')
  findByUnit(@Param('unitId') unitId: string) {
    return this.evaluationService.findByUnit(+unitId);
  }

  /**
   * Obtener una evaluación por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evaluationService.findOne(+id);
  }

  /**
   * Actualizar una evaluación (docente/admin)
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateEvaluationDto) {
    return this.evaluationService.update(+id, updateDto);
  }

  /**
   * Desactivar una evaluación (docente/admin)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  remove(@Param('id') id: string) {
    return this.evaluationService.remove(+id);
  }
}
