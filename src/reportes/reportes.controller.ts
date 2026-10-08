import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { MAX_BYTES_CAPTURA } from '../media/imagen-subida';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/** «Reportar» un problema, algo confuso o una idea desde cualquier pantalla (docs/calidad/PRUEBA_DOS_SEMANAS.md). */
@ApiTags('Reportes')
@Controller('reportes')
@UseGuards(RolesGuard)
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Post()
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Reportar: { tipo: problema|confuso|idea, gravedad?: 1-3, texto, ruta, dispositivo }' })
  crear(@Body() datos: Record<string, unknown>, @GetUser() user: User) {
    return this.reportes.crear(user, datos ?? {});
  }

  @Get('mios')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Mis reportes y en qué van' })
  mios(@GetUser() user: User) {
    return this.reportes.mios(user);
  }

  // Una captura por sugerencia; el límite diario de sugerencias ya acota cuántas se suben.
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Put(':id/captura')
  @Roles('estudiante', 'docente', 'admin')
  @UseInterceptors(FileInterceptor('captura', { limits: { fileSize: MAX_BYTES_CAPTURA + 1, files: 1 } }))
  @ApiOperation({ summary: 'Adjuntar un pantallazo (PNG, JPG, GIF o WebP, hasta 3 MB) a una sugerencia propia' })
  adjuntarCaptura(@Param('id', ParseIntPipe) id: number, @UploadedFile() archivo: { buffer: Buffer } | undefined, @GetUser() user: User) {
    return this.reportes.adjuntarCaptura(user, id, archivo?.buffer);
  }

  @Get(':id/captura')
  @Roles('estudiante', 'docente', 'admin')
  @ApiOperation({ summary: 'Ver el pantallazo de una sugerencia (quien la envió o el admin)' })
  async verCaptura(@Param('id', ParseIntPipe) id: number, @GetUser() user: User, @Res() res: Response) {
    const { mimeType, data } = await this.reportes.captura(user, id);
    res.set({
      'Content-Type': mimeType,
      'Content-Length': String(data.length),
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cache-Control': 'private, no-store',
    });
    res.send(data);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Bandeja de reportes (admin): ?estado=nuevo|visto|resuelto|descartado' })
  todos(@Query('estado') estado?: string) {
    return this.reportes.todos(estado);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Revisar un reporte: { estado, nota?, avisar? } (avisar: notifica a quien lo envió)' })
  revisar(@Param('id', ParseIntPipe) id: number, @Body() datos: Record<string, unknown>) {
    return this.reportes.revisar(id, datos ?? {});
  }
}
