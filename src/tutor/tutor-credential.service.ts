import { Injectable, Logger, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TutorCredential } from './entities/tutor-credential.entity';
import { TutorKeyCryptoService } from './tutor-key-crypto.service';

const GOOGLE_MODELS_URL = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1';

export interface TutorKeyStatus {
  hasKey: boolean;
  last4: string | null;
}

/**
 * Clave de Google AI Studio (capa gratuita) que cada estudiante aporta para usar el Tutor.
 * Nunca se devuelve completa al cliente ni se escribe en logs: solo `hasKey` y los últimos 4 caracteres.
 */
@Injectable()
export class TutorCredentialService {
  private readonly logger = new Logger(TutorCredentialService.name);

  constructor(
    @InjectRepository(TutorCredential) private readonly repo: Repository<TutorCredential>,
    private readonly crypto: TutorKeyCryptoService,
  ) {}

  async getStatus(studentId: number): Promise<TutorKeyStatus> {
    const row = await this.repo.findOne({ where: { studentId } });
    return { hasKey: !!row, last4: row?.keyLast4 ?? null };
  }

  /** null si el estudiante aún no configuró su clave. */
  async getDecryptedKey(studentId: number): Promise<string | null> {
    const row = await this.repo.findOne({ where: { studentId } });
    return row ? this.crypto.decrypt(row.encryptedKey) : null;
  }

  async save(studentId: number, rawKey: string): Promise<TutorKeyStatus> {
    const apiKey = rawKey.trim();
    await this.verifyWithGoogle(apiKey);

    const encryptedKey = this.crypto.encrypt(apiKey);
    const keyLast4 = apiKey.slice(-4);
    const existing = await this.repo.findOne({ where: { studentId } });
    if (existing) {
      existing.encryptedKey = encryptedKey;
      existing.keyLast4 = keyLast4;
      await this.repo.save(existing);
    } else {
      await this.repo.save(this.repo.create({ studentId, encryptedKey, keyLast4 }));
    }
    return { hasKey: true, last4: keyLast4 };
  }

  async remove(studentId: number): Promise<void> {
    await this.repo.delete({ studentId });
  }

  /** Una clave con la cuota agotada (429) sigue siendo una clave válida. */
  private async verifyWithGoogle(apiKey: string): Promise<void> {
    let status: number;
    try {
      const res = await fetch(GOOGLE_MODELS_URL, {
        headers: { 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(8000),
      });
      status = res.status;
    } catch (err: any) {
      this.logger.warn(`No se pudo contactar a Google para verificar una clave: ${err?.name ?? 'error'}`);
      throw new ServiceUnavailableException(
        'No pude verificar tu clave con Google en este momento. Inténtalo de nuevo en un minuto.',
      );
    }

    if (status >= 200 && status < 300) return;
    if (status === 429) return;
    if (status === 400 || status === 401 || status === 403) {
      throw new UnprocessableEntityException(
        'Google no reconoce esa clave. Revisa que la copiaste completa desde Google AI Studio.',
      );
    }
    throw new ServiceUnavailableException('Google no pudo verificar tu clave por ahora. Inténtalo de nuevo en un minuto.');
  }
}
