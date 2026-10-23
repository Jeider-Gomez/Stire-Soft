import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { EncuestaSus } from './entities/encuesta-sus.entity';
import { aCsv, COLUMNAS_INVESTIGACION, filasInvestigacion } from './investigacion';

/** Exportación anonimizada para la investigación: solo quienes aceptaron participar (src/usabilidad/investigacion.ts). */
@Injectable()
export class InvestigacionService {
  constructor(
    @InjectRepository(User) private readonly usuarios: Repository<User>,
    @InjectRepository(LearningProgress) private readonly progresos: Repository<LearningProgress>,
    @InjectRepository(EncuestaSus) private readonly encuestas: Repository<EncuestaSus>,
    private readonly config: ConfigService,
  ) {}

  async exportarCsv(): Promise<{ csv: string; participantes: number }> {
    const consintieron = await this.usuarios.find({
      where: { role: UserRole.ESTUDIANTE, investigacionConsentida: true },
      select: ['id'],
    });
    const ids = new Set(consintieron.map((u) => u.id));
    const progresos = ids.size ? await this.progresos.find() : [];
    // El último SUS de cada participante (las encuestas se repiten cada 7 días).
    const sus = new Map<number, number>();
    if (ids.size) {
      for (const e of await this.encuestas.find({ order: { createdAt: 'ASC' } })) {
        if (ids.has(e.userId)) sus.set(e.userId, e.puntaje);
      }
    }
    // La sal hace que el código no se pueda calcular desde el id sin acceso al servidor.
    const sal = this.config.get<string>('INVESTIGACION_SAL') ?? this.config.get<string>('JWT_SECRET') ?? 'stire';
    const filas = filasInvestigacion(progresos, ids, sus, sal);
    return { csv: aCsv(COLUMNAS_INVESTIGACION, filas), participantes: ids.size };
  }
}
