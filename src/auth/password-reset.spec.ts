import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { MailService } from '../mail/mail.service';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

describe('AuthService — recuperación de contraseña', () => {
  const user = { id: 7, email: 'ana@x.com', fullName: 'Ana <b>Pérez', isActive: true };
  let userService: any, tokens: any, mail: any, service: AuthService;

  beforeEach(() => {
    userService = { findOneByEmail: jest.fn().mockResolvedValue(user), resetPassword: jest.fn() };
    tokens = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => x),
      findOne: jest.fn(),
    };
    mail = { send: jest.fn().mockResolvedValue(true) };
    const config = { get: jest.fn((k: string) => (k === 'FRONTEND_URL' ? 'https://stire.example/' : undefined)) };
    service = new AuthService(userService, {} as any, {} as any, tokens, mail, config as any);
  });

  it('cuenta existente: guarda SOLO el hash del token, vence en 30 min y manda el enlace por correo', async () => {
    const res = await service.forgotPassword('ana@x.com');

    const saved = tokens.save.mock.calls[0][0];
    expect(saved.userId).toBe(7);
    expect(saved.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    const minutes = (saved.expiresAt.getTime() - Date.now()) / 60000;
    expect(minutes).toBeGreaterThan(29);
    expect(minutes).toBeLessThanOrEqual(30);

    const msg = mail.send.mock.calls[0][0];
    const raw = msg.text.match(/token=([0-9a-f]{64})/)[1];
    expect(sha(raw)).toBe(saved.tokenHash);
    expect(msg.text).toContain('https://stire.example/auth/reset-password?token=');
    expect(msg.html).not.toContain('<b>');
    expect(JSON.stringify(saved)).not.toContain(raw);
    expect(res.message).toMatch(/Si el correo está registrado/);
  });

  it('pedir un enlace nuevo invalida los anteriores', async () => {
    await service.forgotPassword('ana@x.com');
    expect(tokens.update).toHaveBeenCalledWith({ userId: 7, usedAt: expect.anything() }, { usedAt: expect.any(Date) });
  });

  it('correo inexistente o cuenta inactiva: misma respuesta, sin token ni correo', async () => {
    const ok = await service.forgotPassword('ana@x.com');
    userService.findOneByEmail.mockResolvedValue(null);
    tokens.save.mockClear(); mail.send.mockClear();
    expect(await service.forgotPassword('nadie@x.com')).toEqual(ok);
    userService.findOneByEmail.mockResolvedValue({ ...user, isActive: false });
    expect(await service.forgotPassword('ana@x.com')).toEqual(ok);
    expect(tokens.save).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('que el correo falle no rompe la respuesta', async () => {
    mail.send.mockRejectedValue(new Error('SMTP caído'));
    await expect(service.forgotPassword('ana@x.com')).resolves.toHaveProperty('message');
  });

  it('reset: token válido cambia la contraseña y consume el enlace (búsqueda por hash)', async () => {
    tokens.findOne.mockResolvedValue({ id: 3, userId: 7 });
    const raw = 'a'.repeat(64);

    await service.resetPassword(raw, 'NuevaClave1!');

    expect(tokens.findOne.mock.calls[0][0].where.tokenHash).toBe(sha(raw));
    expect(tokens.update).toHaveBeenCalledWith({ id: 3, usedAt: expect.anything() }, { usedAt: expect.any(Date) });
    expect(userService.resetPassword).toHaveBeenCalledWith(7, 'NuevaClave1!');
  });

  it('reset: token inexistente, vencido o ya usado → 400 y no se toca la contraseña', async () => {
    tokens.findOne.mockResolvedValue(null);
    await expect(service.resetPassword('b'.repeat(64), 'NuevaClave1!')).rejects.toThrow(BadRequestException);
    expect(userService.resetPassword).not.toHaveBeenCalled();
  });

  it('reset: si otra petición ganó el reclamo del mismo enlace → 400', async () => {
    tokens.findOne.mockResolvedValue({ id: 3, userId: 7 });
    tokens.update.mockResolvedValue({ affected: 0 });
    await expect(service.resetPassword('a'.repeat(64), 'NuevaClave1!')).rejects.toThrow(BadRequestException);
    expect(userService.resetPassword).not.toHaveBeenCalled();
  });
});

describe('DTOs de recuperación', () => {
  const bad = async (cls: any, o: object) => (await validate(plainToInstance(cls, o))).length > 0;
  it('forgot exige un email válido; reset exige token de 64 caracteres y contraseña con la política del registro', async () => {
    expect(await bad(ForgotPasswordDto, { email: 'no-es-correo' })).toBe(true);
    expect(await bad(ForgotPasswordDto, { email: 'ana@x.com' })).toBe(false);
    expect(await bad(ResetPasswordDto, { token: 'corto', password: 'NuevaClave1!' })).toBe(true);
    expect(await bad(ResetPasswordDto, { token: 'a'.repeat(64), password: 'debil' })).toBe(true);
    expect(await bad(ResetPasswordDto, { token: 'a'.repeat(64), password: 'NuevaClave1!' })).toBe(false);
  });
});

describe('JwtStrategy — un cambio de contraseña cierra las sesiones anteriores', () => {
  const build = (user: any) =>
    new JwtStrategy({ findOne: jest.fn().mockResolvedValue(user) } as any, { get: () => 'secreto' } as any);
  const at = (d: Date) => Math.floor(d.getTime() / 1000);

  it('token emitido ANTES del cambio → 401', async () => {
    const changed = new Date('2026-09-23T12:00:00Z');
    const strategy = build({ id: 1, isActive: true, passwordChangedAt: changed });
    await expect(strategy.validate({ sub: 1, iat: at(changed) - 60 })).rejects.toThrow(UnauthorizedException);
  });

  it('token emitido después del cambio, o cuenta sin cambios, sigue valiendo', async () => {
    const changed = new Date('2026-09-23T12:00:00Z');
    await expect(build({ id: 1, isActive: true, passwordChangedAt: changed }).validate({ sub: 1, iat: at(changed) + 5 })).resolves.toBeDefined();
    await expect(build({ id: 1, isActive: true, passwordChangedAt: null }).validate({ sub: 1, iat: 1 })).resolves.toBeDefined();
  });
});

describe('MailService', () => {
  const cfg = (o: Record<string, string>) => ({ get: (k: string) => o[k] }) as any;

  it('sin SMTP configurado: no envía, no lanza y devuelve false', async () => {
    const svc = new MailService(cfg({ NODE_ENV: 'production' }));
    expect(svc.isConfigured).toBe(false);
    await expect(svc.send({ to: 'a@b.c', subject: 's', text: 't' })).resolves.toBe(false);
  });

  it('con SMTP_HOST y MAIL_FROM queda configurado', () => {
    expect(new MailService(cfg({ SMTP_HOST: 'smtp.gmail.com', MAIL_FROM: 'STIRE <x@gmail.com>' })).isConfigured).toBe(true);
  });
});
