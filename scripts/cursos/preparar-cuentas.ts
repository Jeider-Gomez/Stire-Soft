/**
 * Cuentas de la simulación, creadas por el flujo real de la aplicación:
 *   1. La docente se registra pidiendo el rol de docente (como en la pantalla de registro).
 *   2. Un administrador aprueba su solicitud (como en el panel de administración).
 *   3. Los estudiantes se registran.
 * Todas las cuentas usan la contraseña de pruebas del proyecto. Si una cuenta ya existe, se deja como está.
 *
 * Uso:
 *   STIRE_API=... ADMIN_EMAIL=... ADMIN_PASSWORD=... npx ts-node -r tsconfig-paths/register scripts/cursos/preparar-cuentas.ts
 */
import { Api, requerida } from './api';
import { DOCENTE, ESTUDIANTES, PASSWORD_PRUEBAS } from './personas';

async function existe(base: string, email: string): Promise<boolean> {
  try {
    await new Api(base).login(email, PASSWORD_PRUEBAS);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const base = requerida('STIRE_API');

  if (await existe(base, DOCENTE.email)) {
    console.log(`La docente ${DOCENTE.email} ya existe.`);
  } else {
    await new Api(base).post('/auth/register', {
      email: DOCENTE.email,
      password: PASSWORD_PRUEBAS,
      fullName: DOCENTE.nombre,
      requestedRole: 'docente',
      roleRequestReason: 'Docente de Fundamentos de Algoritmia de la Licenciatura en Informática.',
    });
    console.log(`Docente registrada: ${DOCENTE.email} (solicitud de rol docente enviada).`);
  }

  const admin = new Api(base);
  await admin.login(requerida('ADMIN_EMAIL'), requerida('ADMIN_PASSWORD'));
  const res = await admin.get<Array<{ id: number; user?: { email?: string }; userEmail?: string }> | { data?: Array<{ id: number; user?: { email?: string }; userEmail?: string }> }>(
    '/role-requests?status=pending',
  );
  const pendientes = Array.isArray(res) ? res : res?.data ?? [];
  const solicitud = pendientes.find((r) => (r.user?.email ?? r.userEmail) === DOCENTE.email);
  if (solicitud) {
    await admin.patch(`/role-requests/${solicitud.id}`, { decision: 'approve', note: 'Docente del programa verificada.' });
    console.log('El administrador aprobó la solicitud de rol docente.');
  }

  for (const e of ESTUDIANTES) {
    if (await existe(base, e.email)) {
      console.log(`Estudiante ${e.email} ya existe.`);
      continue;
    }
    await new Api(base).post('/auth/register', { email: e.email, password: PASSWORD_PRUEBAS, fullName: e.nombre });
    console.log(`Estudiante registrado: ${e.nombre} <${e.email}>`);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
