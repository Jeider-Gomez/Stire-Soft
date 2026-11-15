import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccionAdmin } from './entities/accion-admin.entity';

export interface NuevaAccion {
  adminId: number;
  accion: string;
  objetivoTipo?: string;
  objetivoId?: number;
  detalle?: string;
}

@Injectable()
export class AccionesAdminService {
  private readonly logger = new Logger(AccionesAdminService.name);

  constructor(@InjectRepository(AccionAdmin) private readonly repo: Repository<AccionAdmin>) {}

  /** Anotar la acción nunca debe romper la acción en sí: si falla, solo se avisa en el registro del servidor. */
  async registrar(a: NuevaAccion): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          adminId: a.adminId,
          accion: a.accion,
          objetivoTipo: a.objetivoTipo ?? null,
          objetivoId: a.objetivoId ?? null,
          detalle: a.detalle?.slice(0, 300) ?? null,
        }),
      );
    } catch (e) {
      this.logger.warn(`No se pudo anotar la acción ${a.accion}: ${(e as Error).message}`);
    }
  }

  recientes(limite = 100): Promise<AccionAdmin[]> {
    return this.repo.find({ order: { createdAt: 'DESC', id: 'DESC' }, take: Math.min(Math.max(limite, 1), 200) });
  }
}
