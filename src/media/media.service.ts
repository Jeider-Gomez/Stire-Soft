import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { MediaFile } from './entities/media-file.entity';
import { ImagenRechazadaError, MAX_BYTES_POR_DOCENTE, validarImagen } from './imagen-subida';
import { User, UserRole } from '../user/entities/user.entity';

export interface ImagenGuardada {
  id: string;
  /** Ruta relativa a la API; la pantalla le antepone la dirección del servidor. */
  path: string;
  mimeType: string;
  sizeBytes: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

@Injectable()
export class MediaService {
  constructor(@InjectRepository(MediaFile) private readonly archivos: Repository<MediaFile>) {}

  private async usado(ownerId: number): Promise<number> {
    const fila = await this.archivos
      .createQueryBuilder('m')
      .select('COALESCE(SUM(m.sizeBytes), 0)', 'total')
      .where('m.ownerId = :ownerId', { ownerId })
      .getRawOne<{ total: string | number }>();
    return Number(fila?.total ?? 0);
  }

  async subirImagen(user: User, datos: Buffer | undefined, maxBytes?: number): Promise<ImagenGuardada> {
    if (!datos) throw new BadRequestException('Adjunta una imagen.');
    let mimeType: string;
    try {
      mimeType = validarImagen(datos, await this.usado(user.id), maxBytes);
    } catch (e) {
      if (e instanceof ImagenRechazadaError) throw new BadRequestException(e.message);
      throw e;
    }
    const id = randomUUID();
    await this.archivos.insert({ id, ownerId: user.id, mimeType, sizeBytes: datos.length, data: datos });
    return { id, path: `/media/${id}`, mimeType, sizeBytes: datos.length };
  }

  async cuota(user: User): Promise<{ usadoBytes: number; limiteBytes: number }> {
    return { usadoBytes: await this.usado(user.id), limiteBytes: MAX_BYTES_POR_DOCENTE };
  }

  async obtener(id: string): Promise<{ mimeType: string; data: Buffer }> {
    if (!UUID.test(id)) throw new NotFoundException('Imagen no encontrada.');
    const archivo = await this.archivos
      .createQueryBuilder('m')
      .addSelect('m.data')
      .where('m.id = :id', { id })
      .getOne();
    if (!archivo) throw new NotFoundException('Imagen no encontrada.');
    return { mimeType: archivo.mimeType, data: archivo.data };
  }

  async eliminar(user: User, id: string): Promise<void> {
    if (!UUID.test(id)) throw new NotFoundException('Imagen no encontrada.');
    const archivo = await this.archivos.findOne({ where: { id } });
    if (!archivo) throw new NotFoundException('Imagen no encontrada.');
    if (archivo.ownerId !== user.id && user.role !== UserRole.ADMIN) throw new ForbiddenException('Solo puedes borrar tus imágenes.');
    await this.archivos.delete({ id });
  }
}
