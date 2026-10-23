import { ForbiddenException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { camposDeAceptacion, terminosAlDia, VERSION_TERMINOS } from './aceptacion-terminos';
import { AceptarTerminosDto } from './dto/aceptar-terminos.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { MayorDeEdadGuard } from '../auth/guards/mayor-de-edad.guard';
import { UserService } from './user.service';

// Público de STIRE: 18 años o más, con términos aceptados como prueba (docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md).
describe('Aceptación de términos y mayoría de edad', () => {
  const ahora = new Date('2026-10-22T15:00:00Z');

  it('sin las dos confirmaciones no hay aceptación: el silencio no autoriza', () => {
    expect(camposDeAceptacion({ confirmaMayorDeEdad: false, aceptaTerminos: true }, ahora)).toBeNull();
    expect(camposDeAceptacion({ confirmaMayorDeEdad: true, aceptaTerminos: false }, ahora)).toBeNull();
  });

  it('guarda la versión vigente y la fecha; la investigación solo si la persona decidió', () => {
    expect(camposDeAceptacion({ confirmaMayorDeEdad: true, aceptaTerminos: true }, ahora)).toEqual({
      mayorDeEdadConfirmadoEn: ahora,
      terminosVersion: VERSION_TERMINOS,
      terminosAceptadosEn: ahora,
    });
    expect(camposDeAceptacion({ confirmaMayorDeEdad: true, aceptaTerminos: true, consienteInvestigacion: false }, ahora))
      .toMatchObject({ investigacionConsentida: false, investigacionDecididaEn: ahora });
  });

  it('si los términos cambian de versión, hay que aceptarlos de nuevo', () => {
    expect(terminosAlDia({ terminosVersion: VERSION_TERMINOS, mayorDeEdadConfirmadoEn: ahora })).toBe(true);
    expect(terminosAlDia({ terminosVersion: '2026-01-01', mayorDeEdadConfirmadoEn: ahora })).toBe(false);
    expect(terminosAlDia({ terminosVersion: null, mayorDeEdadConfirmadoEn: null })).toBe(false);
  });

  it('la pantalla y el servidor piden la misma versión', () => {
    const legal = readFileSync(join(__dirname, '../../frontend-nuxt/utils/legal.ts'), 'utf8');
    expect(legal).toContain(`VERSION_TERMINOS = '${VERSION_TERMINOS}'`);
  });

  it('el registro exige confirmar la mayoría de edad y aceptar los términos', async () => {
    const base = { email: 'a@b.co', password: 'Segura1!', fullName: 'Ana' };
    const sinConfirmar = await validate(plainToInstance(RegisterDto, base));
    expect(sinConfirmar.map((e) => e.property)).toEqual(expect.arrayContaining(['confirmaMayorDeEdad', 'aceptaTerminos']));
    const conFalse = await validate(plainToInstance(RegisterDto, { ...base, confirmaMayorDeEdad: false, aceptaTerminos: true }));
    expect(conFalse.map((e) => e.property)).toEqual(['confirmaMayorDeEdad']);
    const completo = await validate(plainToInstance(RegisterDto, { ...base, confirmaMayorDeEdad: true, aceptaTerminos: true }));
    expect(completo).toEqual([]);
  });

  it('la investigación es opcional al aceptar (las cuentas de antes también aceptan)', async () => {
    expect(await validate(plainToInstance(AceptarTerminosDto, { confirmaMayorDeEdad: true, aceptaTerminos: true }))).toEqual([]);
    const conTexto = await validate(plainToInstance(AceptarTerminosDto, { confirmaMayorDeEdad: true, aceptaTerminos: true, consienteInvestigacion: 'si' }));
    expect(conTexto.map((e) => e.property)).toEqual(['consienteInvestigacion']);
  });

  describe('UserService', () => {
    const guardado = jest.fn(async (u: unknown) => u);
    const repo = { findOne: jest.fn(), save: guardado };
    const servicio = new UserService(repo as never, {} as never, {} as never, {} as never, {} as never);

    beforeEach(() => {
      jest.clearAllMocks();
      repo.findOne.mockResolvedValue({ id: 4, email: 'a@b.co' });
    });

    it('aceptarTerminos guarda la prueba en el usuario', async () => {
      const u = await servicio.aceptarTerminos(4, { confirmaMayorDeEdad: true, aceptaTerminos: true, consienteInvestigacion: true });
      expect(u).toMatchObject({ id: 4, terminosVersion: VERSION_TERMINOS, investigacionConsentida: true });
      expect(u.mayorDeEdadConfirmadoEn).toBeInstanceOf(Date);
    });

    it('aceptarTerminos sin confirmar la edad no guarda nada', async () => {
      await expect(servicio.aceptarTerminos(4, { confirmaMayorDeEdad: false, aceptaTerminos: true })).rejects.toThrow();
      expect(guardado).not.toHaveBeenCalled();
    });

    it('la decisión sobre la investigación se puede cambiar', async () => {
      const u = await servicio.decidirInvestigacion(4, false);
      expect(u).toMatchObject({ investigacionConsentida: false });
      expect(u.investigacionDecididaEn).toBeInstanceOf(Date);
    });
  });

  it('el Tutor no le envía a Google el nombre ni el correo (lo promete la política de datos)', () => {
    const { readdirSync } = jest.requireActual<typeof import('fs')>('fs');
    const dir = join(__dirname, '../tutor');
    const fuentes = readdirSync(dir).filter((f) => f.endsWith('.ts') && !f.includes('spec'));
    for (const f of fuentes) {
      const codigo = readFileSync(join(dir, f), 'utf8');
      expect({ f, nombre: /fullName/.test(codigo), correo: /\.email\b/.test(codigo) }).toEqual({ f, nombre: false, correo: false });
    }
  });

  describe('MayorDeEdadGuard (Tutor con Gemini)', () => {
    const contexto = (user: unknown) => ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as never;
    const guard = new MayorDeEdadGuard();

    it('deja pasar a quien confirmó tener 18 años o más', () => {
      expect(guard.canActivate(contexto({ id: 1, mayorDeEdadConfirmadoEn: ahora }))).toBe(true);
    });

    it('bloquea a quien no ha confirmado, con un mensaje que dice qué hacer', () => {
      expect(() => guard.canActivate(contexto({ id: 1, mayorDeEdadConfirmadoEn: null }))).toThrow(ForbiddenException);
      expect(() => guard.canActivate(contexto({ id: 1 }))).toThrow(/18 años o más/);
    });

    it('protege el chat, la voz y guardar la clave de Gemini', () => {
      const controlador = readFileSync(join(__dirname, '../tutor/tutor.controller.ts'), 'utf8');
      for (const metodo of ['chat(', 'transcribir(', 'saveApiKey(']) {
        const i = controlador.indexOf(`async ${metodo}`);
        const decoradores = controlador.slice(controlador.lastIndexOf('@Throttle', i), i);
        expect(decoradores).toContain('MayorDeEdadGuard');
      }
    });
  });
});
