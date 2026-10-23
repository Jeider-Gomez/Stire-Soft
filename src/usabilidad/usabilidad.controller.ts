import { Body, Controller, Get, Header, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { UsabilidadService } from './usabilidad.service';
import { ResponderSusDto } from './dto/responder-sus.dto';
import { InvestigacionService } from './investigacion.service';

/** Encuesta de usabilidad SUS (UX-08): la responde quien usa STIRE; el admin ve los resultados sin nombres. */
@ApiTags('Usabilidad')
@Controller('usabilidad')
@UseGuards(RolesGuard)
export class UsabilidadController {
  constructor(
    private readonly usabilidad: UsabilidadService,
    private readonly investigacion: InvestigacionService,
  ) {}

  @Get('sus/estado')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Si ya respondí la encuesta y si me toca responderla' })
  estado(@GetUser() user: User) {
    return this.usabilidad.estado(user);
  }

  @Post('sus')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Responder la encuesta SUS (10 respuestas de 1 a 5)' })
  responder(@Body() dto: ResponderSusDto, @GetUser() user: User) {
    return this.usabilidad.responder(user, dto);
  }

  @Get('sus/resultados')
  @Roles('admin')
  @ApiOperation({ summary: 'Resultados de la encuesta SUS, sin nombres' })
  resultados() {
    return this.usabilidad.resultados();
  }

  // Datos para la investigación: solo de quienes aceptaron participar, con un código en lugar del nombre.
  @Get('investigacion/exportar')
  @Roles('admin')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({ summary: 'CSV anonimizado (participante, lección, dominio, intentos, SUS) de quienes consintieron' })
  async exportarInvestigacion() {
    return (await this.investigacion.exportarCsv()).csv;
  }
}
