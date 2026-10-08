import {
  Body,
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LearningProgressRepository } from './learning-progress.repository';
import { LearningProgressService } from './learning-progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Learning Progress')
@Controller('learning-progress')
@UseGuards(JwtAuthGuard)
export class LearningProgressController {
  constructor(
    private readonly progressRepo: LearningProgressRepository,
    private readonly authorizationService: AuthorizationService,
    private readonly learningProgressService: LearningProgressService,
  ) {}

  /**
   * GET /learning-progress/student/:studentId
   * Retorna todos los registros de progreso (mastery) de un estudiante.
   *
   * Seguridad BOLA: un estudiante sólo puede ver su propio progreso.
   * Un docente solo puede ver el de un estudiante con quien comparte al
   * menos una clase (OLA 3 - PUNTO 2/3, P1-R5 — antes veía el de cualquier
   * estudiante de la institución). Admin pasa siempre.
   */
  @Get('student/:studentId')
  @ApiOperation({ summary: 'Ver el Mastery de un estudiante por todas sus unidades' })
  async findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(user, studentId);

    return this.progressRepo.find({
      where: { studentId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * GET /learning-progress/student/:studentId/estadisticas?classId= — calendario, próximos repasos, estado de las
   * lecciones y retención (docs/DISENO_INTERVENCION_DOCENTE.md §10.3). Mismo control de acceso que la ruta raíz.
   */
  @Get('student/:studentId/estadisticas')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Estadísticas de un estudiante al estilo de Anki' })
  async estadisticas(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('classId') classId: string | undefined,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(user, studentId);
    const clase = classId ? Number(classId) : null;
    if (clase !== null && !Number.isInteger(clase)) throw new BadRequestException('La clase no es válida.');
    return this.learningProgressService.estadisticas(studentId, clase);
  }

  /**
   * GET /learning-progress/student/:studentId/unit/:unitId
   * Retorna el progreso específico de un estudiante en una unidad de aprendizaje.
   *
   * Seguridad BOLA: mismo control de acceso que la ruta raíz.
   */
  @Get('student/:studentId/unit/:unitId')
  @ApiOperation({ summary: 'Ver Mastery de un estudiante en una unidad específica' })
  async findByStudentAndUnit(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(user, studentId);

    return this.progressRepo.findOne({
      where: { studentId, learningUnitId: unitId },
    });
  }

  @Get('unit/:unitId/mis-ejercicios')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Los ejercicios de una lección para el estudiante: si suben su dominio, nivel, tipo y peso' })
  async misEjercicios(@Param('unitId', ParseIntPipe) unitId: number, @Request() req: any) {
    // Solo en lecciones de sus clases, como la recomendación.
    await this.authorizationService.assertEnrolledInClass(req.user, await this.learningProgressService.resolveClassId(unitId));
    return this.learningProgressService.misEjercicios(req.user.id, unitId);
  }

  @Get('student/:studentId/unit/:unitId/next-activity')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Recomendar la siguiente actividad de una unidad; con ?reto=1, un ejercicio del nivel siguiente' })
  async getNextActivity(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Request() req: any,
    @Query('reto') reto?: string,
  ) {
    const user = req.user;
    if (user.role === 'estudiante' && user.id !== studentId) {
      throw new ForbiddenException('No tienes permiso para ver el progreso de otro estudiante');
    }
    await this.authorizationService.assertTeacherSharesClassWithStudent(user, studentId);
    // La recomendación muestra títulos de actividades: un estudiante solo la ve en unidades de sus clases. Antes bastaba
    // con pedir su propio studentId para ver las de cualquier clase.
    if (user.role === 'estudiante') {
      await this.authorizationService.assertEnrolledInClass(user, await this.learningProgressService.resolveClassId(unitId));
    }
    return this.learningProgressService.getNextActivity(studentId, unitId, { reto: reto === '1' || reto === 'true' });
  }

  /**
   * PUT /learning-progress/unit/:unitId/confidence — «¿Cómo te sientes con este tema?» (1, 2 o 3).
   * Solo el propio estudiante, en una unidad de una clase donde está matriculado.
   */
  @Put('unit/:unitId/confidence')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Guardar cómo se siente el estudiante con una unidad (1 = nuevo, 2 = dudas, 3 = seguro)' })
  async setConfidence(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body('confianza') confianza: number,
    @Request() req: any,
  ) {
    const classId = await this.learningProgressService.resolveClassId(unitId);
    await this.authorizationService.assertEnrolledInClass(req.user, classId);
    const progress = await this.learningProgressService.setEntryConfidence(req.user.id, unitId, confianza);
    return { learningUnitId: unitId, entryConfidence: progress.entryConfidence };
  }
}
