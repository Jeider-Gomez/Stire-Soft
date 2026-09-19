import { Injectable, ServiceUnavailableException } from '@nestjs/common';
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
export class TutorKeyCryptoService {
  constructor(private readonly configService: ConfigService) {}

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

  private secret(): Buffer {
    const hex = this.configService.get<string>('TUTOR_KEY_ENCRYPTION_SECRET')?.trim() ?? '';
    if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
      throw new ServiceUnavailableException(
        'El servidor no tiene configurado el cifrado de claves del Tutor (TUTOR_KEY_ENCRYPTION_SECRET, 64 caracteres hexadecimales).',
      );
    }
    return Buffer.from(hex, 'hex');
  }
}
