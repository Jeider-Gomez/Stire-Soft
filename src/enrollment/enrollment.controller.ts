import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Enrollment')
@Controller('enrollment')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  /**
   * POST /enrollment/join
   * El estudiante se matricula en una clase usando su código.
   */
  @Post('join')
  @UseGuards(RolesGuard)
  @Roles('estudiante')
  @ApiOperation({ summary: 'Matricular estudiante en una clase por código' })
  joinClass(@Body('code') code: string, @GetUser() user: User) {
    return this.enrollmentService.joinClass(user.id, code);
  }

  /**
   * GET /enrollment/my
   * Lista todas las clases en las que el estudiante está matriculado.
   */
  @Get('my')
  @ApiOperation({ summary: 'Obtener mis matrículas activas' })
  findMy(@GetUser() user: User) {
    return this.enrollmentService.findByStudent(user.id);
  }

  /**
   * GET /enrollment/class/:classId
   * El docente ve todos los estudiantes de su clase.
   */
  @Get('class/:classId')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Ver estudiantes matriculados en una clase' })
  findByClass(@Param('classId') classId: string) {
    return this.enrollmentService.findByClass(+classId);
  }
}
