import { Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const VERSION = 'v1';
const IV_BYTES = 12;
const TAG_BYTES = 16;

/**
 * Cifrado en reposo (AES-256-GCM) de la clave de Google AI Studio que aporta cada estudiante.
 * Falla cerrado: sin `TUTOR_KEY_ENCRYPTION_SECRET` válido no se guarda ni se lee ninguna clave.
 */
@Injectable()
export class TutorKeyCryptoService implements OnModuleInit {
  private readonly logger = new Logger(TutorKeyCryptoService.name);

  constructor(private readonly configService: ConfigService) {}

  /** Avisa al arrancar (no al primer estudiante que lo intente) si falta el secreto. */
  onModuleInit(): void {
    if (!this.hasValidSecret()) {
      this.logger.warn(
        'TUTOR_KEY_ENCRYPTION_SECRET falta o no tiene 64 caracteres hexadecimales: ningún estudiante podrá guardar su clave del Tutor. ' +
          `Genera uno con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
      );
    }
  }

  encrypt(plain: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv('aes-256-gcm', this.secret(), iv);
    const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${VERSION}:${Buffer.concat([iv, tag, body]).toString('base64')}`;
  }

  decrypt(payload: string): string {
    const [version, encoded] = payload.split(':');
    if (version !== VERSION || !encoded) {
      throw new ServiceUnavailableException('No se pudo leer la clave guardada del Tutor. Vuelve a configurarla.');
    }
    const raw = Buffer.from(encoded, 'base64');
    const iv = raw.subarray(0, IV_BYTES);
    const tag = raw.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
    const body = raw.subarray(IV_BYTES + TAG_BYTES);
    try {
      const decipher = createDecipheriv('aes-256-gcm', this.secret(), iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
    } catch {
      throw new ServiceUnavailableException('No se pudo leer la clave guardada del Tutor. Vuelve a configurarla.');
    }
  }

  private hasValidSecret(): boolean {
    return /^[0-9a-fA-F]{64}$/.test(this.configService.get<string>('TUTOR_KEY_ENCRYPTION_SECRET')?.trim() ?? '');
  }

  private secret(): Buffer {
    if (!this.hasValidSecret()) {
      // El estudiante no puede arreglar esto: el mensaje va sin nombres de variables y el detalle queda en el registro.
      this.logger.error('Falta TUTOR_KEY_ENCRYPTION_SECRET (64 caracteres hexadecimales): no se puede guardar ni leer la clave del Tutor.');
      throw new ServiceUnavailableException(
        'El Tutor no está listo en el servidor todavía (falta configurar el cifrado de claves). Avisa a tu docente o al administrador; reintentar no lo arregla.',
      );
    }
    return Buffer.from(this.configService.get<string>('TUTOR_KEY_ENCRYPTION_SECRET')!.trim(), 'hex');
  }
}
