import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { ReuseService } from './reuse.service';
import { BankQueryDto, CopyActivityDto, ImportClassContentDto } from './dto/reuse.dto';

@ApiTags('Reutilización')
@Controller('reuse')
@UseGuards(JwtAuthGuard)
@Roles('docente', 'admin')
export class ReuseController {
  constructor(private readonly reuseService: ReuseService) {}

  @Post('classes/:classId/import')
  @ApiOperation({ summary: 'Traer a esta clase secciones de otra clase propia o de una plantilla compartida (como borrador, sin estudiantes ni notas)' })
  importClassContent(
    @Param('classId', ParseIntPipe) classId: number,
    @Body() dto: ImportClassContentDto,
    @GetUser() user: User,
  ) {
    return this.reuseService.importClassContent(user, classId, dto);
  }

  @Get('plantillas')
  @ApiOperation({ summary: 'Plantillas de otros docentes: clases cuyo contenido su docente compartió para copiarlo' })
  plantillas(@GetUser() user: User) {
    return this.reuseService.plantillas(user);
  }

  @Get('classes/:classId/modulos')
  @ApiOperation({ summary: 'Módulos de una clase propia o de una plantilla compartida, para elegir cuáles copiar' })
  modulosParaCopiar(@Param('classId', ParseIntPipe) classId: number, @GetUser() user: User) {
    return this.reuseService.modulosParaCopiar(user, classId);
  }

  @Get('bank')
  @ApiOperation({ summary: 'Banco del docente: los ejercicios de todas sus clases, con filtros' })
  bank(@Query() query: BankQueryDto, @GetUser() user: User) {
    return this.reuseService.bank(user, query);
  }

  @Post('activities/:activityId/copy')
  @ApiOperation({ summary: 'Copiar un ejercicio propio a una unidad propia (desde el banco o como variante), en borrador' })
  copyActivity(
    @Param('activityId', ParseIntPipe) activityId: number,
    @Body() dto: CopyActivityDto,
    @GetUser() user: User,
  ) {
    return this.reuseService.copyActivity(user, activityId, dto);
  }
}
