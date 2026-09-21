import { ServiceUnavailableException } from '@nestjs/common';
import { TutorKeyCryptoService } from './tutor-key-crypto.service';

const SECRET = 'a'.repeat(64);

function build(secret: string | undefined) {
  return new TutorKeyCryptoService({ get: () => secret } as any);
}

describe('TutorKeyCryptoService', () => {
  it('cifra y descifra sin perder el texto, y el resultado no contiene la clave en claro', () => {
    const crypto = build(SECRET);
    const plain = 'AIzaSyFAKE-KEY_1234567890abcdefghijklmno';

    const payload = crypto.encrypt(plain);

    expect(payload.startsWith('v1:')).toBe(true);
    expect(payload).not.toContain(plain);
    expect(crypto.decrypt(payload)).toBe(plain);
  });

  it('usa un IV distinto en cada cifrado (mismo texto, distinto resultado)', () => {
    const crypto = build(SECRET);
    expect(crypto.encrypt('misma-clave-1234567890')).not.toBe(crypto.encrypt('misma-clave-1234567890'));
  });

  it('falla cerrado si el secreto del servidor falta o no son 64 caracteres hexadecimales', () => {
    expect(() => build(undefined).encrypt('x')).toThrow(ServiceUnavailableException);
    expect(() => build('corto').encrypt('x')).toThrow(ServiceUnavailableException);
    expect(() => build('z'.repeat(64)).encrypt('x')).toThrow(ServiceUnavailableException);
  });

  it('sin secreto, el mensaje al estudiante no menciona variables de entorno y el detalle queda en el registro', () => {
    const crypto = build(undefined);
    const errorLog = jest.spyOn((crypto as any).logger, 'error').mockImplementation(() => undefined);

    let message = '';
    try {
      crypto.encrypt('x');
    } catch (e: any) {
      message = e.message;
    }

    expect(message).not.toContain('TUTOR_KEY_ENCRYPTION_SECRET');
    expect(message).toMatch(/reintentar no lo arregla/i);
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('TUTOR_KEY_ENCRYPTION_SECRET'));
  });

  it('avisa al arrancar si falta el secreto y calla si es válido', () => {
    const sinSecreto = build(undefined);
    const warn = jest.spyOn((sinSecreto as any).logger, 'warn').mockImplementation(() => undefined);
    sinSecreto.onModuleInit();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('TUTOR_KEY_ENCRYPTION_SECRET'));

    const conSecreto = build(SECRET);
    const warn2 = jest.spyOn((conSecreto as any).logger, 'warn').mockImplementation(() => undefined);
    conSecreto.onModuleInit();
    expect(warn2).not.toHaveBeenCalled();
  });

  it('no descifra un payload manipulado ni uno cifrado con otro secreto', () => {
    const payload = build(SECRET).encrypt('AIzaSyFAKE-KEY_1234567890abcdefghijklmno');
    const tampered = payload.slice(0, -2) + (payload.endsWith('A') ? 'B=' : 'A=');

    expect(() => build(SECRET).decrypt(tampered)).toThrow(ServiceUnavailableException);
    expect(() => build('b'.repeat(64)).decrypt(payload)).toThrow(ServiceUnavailableException);
    expect(() => build(SECRET).decrypt('v9:basura')).toThrow(ServiceUnavailableException);
  });
});
