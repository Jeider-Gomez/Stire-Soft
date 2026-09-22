// Crea el primer admin real de un servidor recién desplegado, a partir de
// variables de entorno del propio servidor — nunca de una contraseña fija
// en el repo (la única cuenta admin que existía antes de este script era la
// semilla de demo, admin.sistema@unicor.edu.co, con contraseña pública).
//
// Uso (una sola vez por email, al desplegar):
//   Bash / Linux / macOS:
//     ADMIN_EMAIL=tu-correo@dominio.com ADMIN_PASSWORD='ClaveSegura123!' npm run admin:create-first
//   PowerShell (Windows):
//     $env:ADMIN_EMAIL='tu-correo@dominio.com'; $env:ADMIN_PASSWORD='ClaveSegura123!'; npm run admin:create-first
//
// ADMIN_FULL_NAME es opcional (por defecto "Administrador"). La contraseña
// sigue la misma política que el registro público (mínimo 6 caracteres,
// mayúscula + minúscula + número o símbolo).
//
// Es seguro correrlo varias veces: si el email ya existe, no crea ni
// modifica nada (ni siquiera si ya es admin) — evita que una segunda
// ejecución accidental sobrescriba una cuenta real. Para otro admin, se usa
// el panel de administrador ya existente (cambio de rol) o se corre este
// script de nuevo con otro ADMIN_EMAIL.
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import {
  PASSWORD_COMPLEXITY_REGEX,
  PASSWORD_COMPLEXITY_MESSAGE,
} from '../common/validators/password-complexity';

/** Valida email/password recibidos por variable de entorno antes de tocar la base de datos. */
export function validateAdminInput(
  email: string | undefined,
  password: string | undefined,
): string | null {
  if (!email?.trim() || !password) {
    return 'Faltan variables de entorno. Se necesitan ADMIN_EMAIL y ADMIN_PASSWORD. Nada se creó.';
  }
  if (password.length < 6 || !PASSWORD_COMPLEXITY_REGEX.test(password)) {
    return `ADMIN_PASSWORD inválida: ${PASSWORD_COMPLEXITY_MESSAGE}. Nada se creó.`;
  }
  return null;
}

async function bootstrap() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || 'Administrador';

  const validationError = validateAdminInput(email, password);
  if (validationError || !email || !password) {
    console.error(validationError ?? 'Error de validación. Nada se creó.');
    process.exitCode = 1;
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const userRepository = app.get<import('typeorm').Repository<User>>(getRepositoryToken(User));

  try {
    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      console.log(
        `Ya existe una cuenta con ese email (rol actual: ${existing.role}). No se creó ni modificó nada.`,
      );
      console.log(
        'Si necesitas convertirla en admin, usa el panel de administrador (cambio de rol) en vez de este script.',
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      role: UserRole.ADMIN,
      isActive: true,
    });
    const saved = await userRepository.save(admin);

    console.log(`Admin creado: id=${saved.id}, email=${saved.email}, rol=${saved.role}.`);
    console.log('Ya puedes iniciar sesión con ese email y la contraseña que diste por variable de entorno.');
  } finally {
    await app.close();
  }
}

// Solo corre al ejecutarse directamente (npm run admin:create-first), nunca
// al importar validateAdminInput desde el spec — si no, cada `npm test`
// terminaría con process.exitCode = 1 por faltar ADMIN_EMAIL/ADMIN_PASSWORD.
if (require.main === module) {
  bootstrap();
}
