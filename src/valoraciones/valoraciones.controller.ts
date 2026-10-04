import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { ValoracionesService } from './valoraciones.service';
import { ValorarLeccionDto } from './dto/valorar.dto';

/** «¿Te sirvió esta explicación?» (UI-04): el curso se mejora con lo que dicen los estudiantes. */
@ApiTags('Valoraciones')
@Controller('valoraciones')
@UseGuards(RolesGuard)
export class ValoracionesController {
  constructor(private readonly valoraciones: ValoracionesService) {}

  @Put('leccion/:unitId')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Valorar la explicación de una lección (Sí / No y qué no quedó claro)' })
  valorar(@Param('unitId', ParseIntPipe) unitId: number, @Body() dto: ValorarLeccionDto, @GetUser() user: User) {
    return this.valoraciones.valorar(user, unitId, dto);
  }

  @Get('leccion/:unitId/mia')
  @Roles('estudiante')
  @ApiOperation({ summary: 'Mi valoración de una lección' })
  mia(@Param('unitId', ParseIntPipe) unitId: number, @GetUser() user: User) {
    return this.valoraciones.mia(user, unitId);
  }

  @Get('clase/:classId')
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Valoraciones de las lecciones de la clase, sin nombres' })
  deLaClase(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.valoraciones.deLaClase(user, classId);
  }
}
