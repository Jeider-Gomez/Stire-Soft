import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { MediaService } from './media.service';
import { MAX_BYTES_IMAGEN } from './imagen-subida';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

/** Lo que usamos del archivo que entrega multer (sin depender de @types/multer). */
interface ArchivoSubido { buffer: Buffer }

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  /**
   * POST /media/images — el docente sube una imagen para sus lecciones (campo `archivo`, máx. 1 MB).
   * multer corta la lectura un byte después del límite: un archivo enorme no llega a ocupar memoria.
   */
  @Post('images')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @UseInterceptors(FileInterceptor('archivo', { limits: { fileSize: MAX_BYTES_IMAGEN + 1, files: 1 } }))
  @ApiOperation({ summary: 'Subir una imagen para una lección (PNG, JPG, GIF o WebP; máx. 1 MB)' })
  subir(@UploadedFile() archivo: ArchivoSubido | undefined, @GetUser() user: User) {
    return this.media.subirImagen(user, archivo?.buffer);
  }

  @Get('images/quota')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @ApiOperation({ summary: 'Cuánto espacio de imágenes usó el docente' })
  cuota(@GetUser() user: User) {
    return this.media.cuota(user);
  }

  /**
   * GET /media/:id — pública: la pide una etiqueta <img>, que no manda el token. El id es un UUID que solo aparece en
   * lecciones. Se sirve como imagen y nada más: tipo fijo desde la base, nosniff y una política que no ejecuta nada.
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Ver una imagen de una lección' })
  async ver(@Param('id') id: string, @Res() res: Response) {
    const { mimeType, data } = await this.media.obtener(id);
    res.set({
      'Content-Type': mimeType,
      'Content-Length': String(data.length),
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      // helmet pone same-origin: la página (Vercel) y la API (Azure) son sitios distintos.
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(data);
  }

  @Delete('images/:id')
  @UseGuards(RolesGuard)
  @Roles('docente', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Borrar una imagen propia' })
  eliminar(@Param('id') id: string, @GetUser() user: User) {
    return this.media.eliminar(user, id);
  }
}
