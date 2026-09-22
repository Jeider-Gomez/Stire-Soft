import { validateAdminInput } from './create-first-admin';

describe('validateAdminInput (script admin:create-first)', () => {
  it('sin ADMIN_EMAIL o ADMIN_PASSWORD, rechaza y no dice más', () => {
    expect(validateAdminInput(undefined, 'Segura123!')).toMatch(/Faltan variables de entorno/);
    expect(validateAdminInput('a@x.com', undefined)).toMatch(/Faltan variables de entorno/);
    expect(validateAdminInput('  ', 'Segura123!')).toMatch(/Faltan variables de entorno/);
  });

  it('contraseña débil (sin mayúscula/número/símbolo) se rechaza con el mismo mensaje que el registro público', () => {
    expect(validateAdminInput('a@x.com', 'minuscula')).toMatch(/más segura/);
    expect(validateAdminInput('a@x.com', 'abc')).toMatch(/más segura/);
  });

  it('email y contraseña válidos: no hay error', () => {
    expect(validateAdminInput('admin@dominio.com', 'Segura123!')).toBeNull();
  });
});
