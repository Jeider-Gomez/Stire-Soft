import { validate } from 'class-validator';
import { RegisterDto } from '../dto/register.dto';

describe('RegisterDto', () => {
  it('debe fallar si la contraseña no tiene letras mayúsculas', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'weak1!';
    dto.fullName = 'Test Student';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find(e => e.property === 'password');
    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints?.matches).toBeDefined();
  });

  it('debe fallar si la contraseña no tiene números ni caracteres especiales', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'WeakPassword';
    dto.fullName = 'Test Student';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find(e => e.property === 'password');
    expect(passwordError).toBeDefined();
  });

  it('debe fallar si la contraseña es muy corta (menos de 6 caracteres)', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'W1!';
    dto.fullName = 'Test Student';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('debe validar exitosamente con una contraseña que cumple todas las reglas', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'SafePassw0rd!';
    dto.fullName = 'Test Student';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
