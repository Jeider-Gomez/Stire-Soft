import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import {
  ActualizarAsignaturaDto,
  BuscarAsignaturasDto,
  CrearAsignaturaDto,
  CrearInstitucionDto,
  CrearProgramaDto,
  MarcarDistintasDto,
  ParecidasDto,
  UnirAsignaturaDto,
} from './dto/catalogo.dto';

@Controller()
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  // OLA 3 - PUNTO 2: catálogo de referencia sin concepto de dueño — abierto
  // a cualquier rol autenticado de forma deliberada.
  @Get('institutions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  findAllInstitutions() {
    return this.institutionService.findAllInstitutions();
  }

  // El docente amplía el catálogo al crear su clase (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.2); repetir devuelve lo existente.
  @Post('institutions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('docente', 'admin')
  createInstitution(@Body() dto: CrearInstitucionDto) {
    return this.institutionService.createInstitution(dto);
  }

  @Get('programs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  findAllPrograms(@Query('institutionId') institutionId: string) {
    return this.institutionService.findAllPrograms(institutionId ? +institutionId : undefined);
  }

  @Post('programs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('docente', 'admin')
  createProgram(@Body() dto: CrearProgramaDto) {
    return this.institutionService.createProgram(dto);
  }

  @Get('asignaturas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('estudiante', 'docente', 'admin')
  buscarAsignaturas(@Query() dto: BuscarAsignaturasDto) {
    return this.institutionService.buscarAsignaturas(dto);
  }

  // «¿Es alguna de estas?» antes de agregar (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.2.1).
  @Get('asignaturas/parecidas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('docente', 'admin')
  parecidas(@Query() dto: ParecidasDto) {
    return this.institutionService.parecidas(dto);
  }

  @Post('asignaturas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('docente', 'admin')
  crearAsignatura(@Body() dto: CrearAsignaturaDto, @GetUser() user: User) {
    return this.institutionService.crearAsignatura(dto, user.id, user.role === UserRole.ADMIN);
  }

  // ─── Pantalla «Catálogo» del admin (§2.2.2) ───
  @Get('asignaturas/revision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  revision() {
    return this.institutionService.revisionDelCatalogo();
  }

  @Patch('asignaturas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  actualizarAsignatura(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarAsignaturaDto) {
    return this.institutionService.actualizarAsignatura(id, dto);
  }

  @Post('asignaturas/:id/unir')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  unir(@Param('id', ParseIntPipe) id: number, @Body() dto: UnirAsignaturaDto) {
    return this.institutionService.unirAsignaturas(id, dto.destinoId);
  }

  @Post('asignaturas/distintas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  marcarDistintas(@Body() dto: MarcarDistintasDto) {
    return this.institutionService.marcarDistintas(dto.aId, dto.bId);
  }
}
