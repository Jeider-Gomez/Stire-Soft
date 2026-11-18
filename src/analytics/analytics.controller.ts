import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../user/entities/user.entity';
import { CompetenciasService } from '../learning-progress/competencias.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly competenciasService: CompetenciasService,
  ) {}

  // Competencias (P39): «Mis competencias» del estudiante en una clase; su docente o un admin también las ven.
  @Get('student/:studentId/competencias')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  getCompetencias(@Param('studentId', ParseIntPipe) studentId: number, @Query('classId', ParseIntPipe) classId: number, @Req() req: { user: User }) {
    return this.competenciasService.deEstudiante(studentId, classId, req.user);
  }

  // Competencias de la clase para el docente: cuántos van en cada nivel y a quién le cuesta.
  @Get('class/:classId/competencias')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getCompetenciasClase(@Param('classId', ParseIntPipe) classId: number, @Req() req: { user: User }) {
    return this.competenciasService.deClase(classId, req.user);
  }

  // El docente elige el modo: apagadas, solo ver o elegir ejercicios (cuadro D3-Competencias).
  @Patch('class/:classId/competencias/modo')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  cambiarModoCompetencias(@Param('classId', ParseIntPipe) classId: number, @Body('modo') modo: unknown, @Req() req: { user: User }) {
    return this.competenciasService.cambiarModo(classId, typeof modo === 'string' ? modo : '', req.user);
  }

  // «Practica esto primero» (P36, Toscano): cuando un ejercicio no sale, la competencia que falta y dónde practicarla.
  @Get('practicar-primero/:activityId')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  getPracticarPrimero(@Param('activityId', ParseIntPipe) activityId: number, @Req() req: { user: User }) {
    return this.competenciasService.practicarPrimeroDe(req.user, activityId);
  }

  @Get('student/:studentId')
  getStudentDashboard(@Param('studentId') studentId: string, @Req() req: any) {
    return this.analyticsService.getStudentDashboard(+studentId, req.user);
  }

  // Historial completo de la ficha, por páginas (sugerencia n.º 12): la ficha solo traía las 5 entregas más recientes.
  @Get('student/:studentId/entregas')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  getEntregas(@Param('studentId', ParseIntPipe) studentId: number, @Query('pagina') pagina: string | undefined, @Req() req: { user: User }) {
    return this.analyticsService.getStudentSubmissions(studentId, req.user, Number(pagina) || 1);
  }

  // Perfil de aprendizaje (MOD-02): el propio estudiante, su docente o un admin.
  @Get('student/:studentId/perfil')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  getPerfil(@Param('studentId', ParseIntPipe) studentId: number, @Req() req: { user: User }) {
    return this.analyticsService.getPerfilAprendizaje(studentId, req.user);
  }

  // El estudiante eligió un formato de la lección (diagrama, pseudocódigo, pasos, escuchar, video o ejemplo en vivo).
  @Post('formato')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  registrarFormato(@Body('formato') formato: unknown, @Req() req: { user: User }) {
    return this.analyticsService.registrarFormato(req.user, typeof formato === 'string' ? formato : '');
  }

  /** Mapa de calor del docente: estudiantes × unidades y las listas de a quién ayudar (paso 6). */
  // Logros y medallas (logros.ts): los del propio estudiante, o los de un estudiante de su clase para el docente.
  @Get('student/:studentId/logros')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  getLogros(@Param('studentId', ParseIntPipe) studentId: number, @Req() req: { user: User }) {
    return this.analyticsService.getLogros(studentId, req.user);
  }

  // Calibración del juicio de confianza (calibracion.ts): la del propio estudiante, o la de un estudiante de su clase.
  @Get('student/:studentId/calibracion')
  @UseGuards(RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  getCalibracion(@Param('studentId', ParseIntPipe) studentId: number, @Req() req: { user: User }) {
    return this.analyticsService.getCalibracion(studentId, req.user);
  }

  @Post('logros/vistos')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  marcarLogrosVistos(@Req() req: { user: { id: number } }) {
    return this.analyticsService.marcarLogrosVistos(req.user.id);
  }

  @Get('class/:classId/heatmap')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getClassHeatmap(@Param('classId', ParseIntPipe) classId: number, @Req() req: any) {
    return this.analyticsService.getClassHeatmap(classId, req.user);
  }

  /** Resumen de la semana para «Hoy»: esta semana frente a la anterior y quién no ha practicado. */
  @Get('class/:classId/semana')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getResumenSemanal(@Param('classId', ParseIntPipe) classId: number, @Req() req: any) {
    return this.analyticsService.getResumenSemanal(classId, req.user);
  }

  /** «Errores que más se repiten esta semana» para «Hoy» (MOD-02): de concepto y de escritura, con quién tiene cada uno. */
  @Get('class/:classId/errores-semana')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  getErroresDeLaSemana(@Param('classId', ParseIntPipe) classId: number, @Req() req: { user: User }) {
    return this.analyticsService.getErroresDeLaSemana(classId, req.user);
  }

  @Get('class/:classId')
  getClassMetrics(@Param('classId') classId: string, @Req() req: any) {
    return this.analyticsService.getClassMetrics(+classId, req.user);
  }
}
