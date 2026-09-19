import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { Reflector, MetadataScanner } from '@nestjs/core';
import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, CONTROLLER_WATERMARK } from '@nestjs/common/constants';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

// OLA 3 - PUNTO 4: las excepciones se indexan por REFERENCIA DE CLASE, no
// por nombre en string — ver nota junto a `Exception`/`GetException` más
// abajo sobre por qué esto, y no un cambio de mecanismo de escaneo, es lo
// que realmente cierra la colisión de nombres (P1-R3, docs/REAUDITORIA_OLA2.md).
import { TutorController } from '../../tutor/tutor.controller';
import { SubmissionsController } from '../../submissions/submissions.controller';
import { NotificationsController } from '../../notifications/notifications.controller';
import { MessageController } from '../../message/message.controller';
import { UserController } from '../../user/user.controller';
import { AuthController } from '../../auth/auth.controller';
import { EnrollmentController } from '../../enrollment/enrollment.controller';
import { AnalyticsController } from '../../analytics/analytics.controller';
import { LearningProgressController } from '../../learning-progress/learning-progress.controller';
import { ActivitiesController } from '../../activities/activities.controller';
import { ActivityQuestionsController } from '../../activity-questions/activity-questions.controller';
import { ContentController } from '../../content/content.controller';

/**
 * OLA 2 — PUNTO 1: test de arquitectura.
 *
 * Recorre TODOS los *.controller.ts del árbol de trabajo (descubiertos por
 * filesystem, no por una lista escrita a mano — así un controller nuevo
 * queda cubierto automáticamente) y falla si una ruta mutante
 * (POST/PUT/PATCH/DELETE) no declara ni @Roles(...) ni @Public().
 *
 * Deliberadamente NO bootea Nest vía NestFactory/DiscoveryService de una app
 * COMPLETA: la metadata de @Roles/@Public/@Post/etc. la escribe
 * `Reflect.defineMetadata` sobre la clase/función en el momento en que el
 * módulo se importa — no en el momento en que Nest instancia el controller.
 * `DiscoveryService.getControllers()` necesita un `ModulesContainer` de una
 * app ya compilada e inicializada (y por tanto, en este proyecto, una
 * conexión MySQL real para las ~26 entidades de `TypeOrmModule.forFeature`
 * repartidas en cada módulo) solo para terminar leyendo la misma metadata
 * que ya está disponible con un `require()` de cada archivo — evaluado y
 * descartado explícitamente por el autor original de este test por ese
 * costo. Se usa en su lugar `MetadataScanner` (la misma clase que usa el
 * `RouterExplorer` interno de Nest para enumerar los métodos de un
 * controller) + `Reflector` (la misma clase que usa `RolesGuard`)
 * directamente sobre los prototipos — cero DB, cero DI, resultado idéntico
 * al de una app real.
 *
 * Lo que SÍ cambia en Ola 3 (Punto 4) es cómo se identifica una excepción:
 * antes se comparaba `route.controller === ex.controller` con AMBOS lados
 * como *string* (el nombre de la clase) — un controller nuevo con el mismo
 * nombre de clase Y de método que una excepción ya aceptada heredaba su
 * pase libre sin verificación real (P1-R3, verificado con un PoC ejecutado:
 * el test seguía en verde con una ruta sin @Roles/@Public presente). Ahora
 * `Exception.controller`/`GetException.controller` guardan la REFERENCIA a
 * la clase real (importada arriba), y la comparación es `===` de objetos,
 * no de texto — dos clases con el mismo nombre en archivos distintos son
 * objetos JavaScript distintos, así que la colisión deja de ser posible por
 * construcción, sin depender de qué mecanismo de escaneo se use.
 */

const SRC_ROOT = path.resolve(__dirname, '..', '..');

function findControllerFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findControllerFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.controller.ts')) {
      out.push(full);
    }
  }
  return out;
}

const MUTANT_METHODS = new Set<RequestMethod>([
  RequestMethod.POST,
  RequestMethod.PUT,
  RequestMethod.PATCH,
  RequestMethod.DELETE,
]);

type ControllerClass = new (...args: unknown[]) => object;

interface Exception {
  controller: ControllerClass;
  method: string;
  reason: string;
}

/**
 * Excepciones justificadas — ÚNICO lugar donde se permite que una ruta
 * mutante no declare @Roles ni @Public. Todas comparten el mismo patrón:
 * operan EXCLUSIVAMENTE sobre el recurso del propio usuario autenticado
 * (siempre vía `user.id` salido del JWT — nunca de un id que llegue en la
 * URL o el body), verificado leyendo el service correspondiente. No hay
 * escalada de rol posible porque no hay recurso ajeno que tocar.
 *
 * Añadir una entrada aquí exige el mismo trabajo que quitarla: releer el
 * service y confirmar que el ownership está forzado en la query, no dado
 * por supuesto.
 */
const JUSTIFIED_EXCEPTIONS: Exception[] = [
  {
    controller: TutorController,
    method: 'chat',
    reason: 'tutorService.sendMessage(user.id, message) — siempre conversa con el propio usuario.',
  },
  {
    controller: SubmissionsController,
    method: 'startSubmission',
    reason: 'studentId sale de @GetUser(), nunca de la URL ni del body.',
  },
  {
    controller: SubmissionsController,
    method: 'submitAnswers',
    reason: 'submissionsRepo.findOne({ where: { id, studentId } }) — ownership forzado en el WHERE.',
  },
  {
    controller: SubmissionsController,
    method: 'autosave',
    reason: 'mismo WHERE { id, studentId } que submitAnswers.',
  },
  {
    controller: NotificationsController,
    method: 'markRead',
    reason: 'notificationsRepository.findOne({ where: { id, userId } }) — ownership forzado en el WHERE.',
  },
  {
    controller: MessageController,
    method: 'create',
    reason: 'el remitente es siempre user.id; no hay recurso ajeno que tocar al crear.',
  },
  {
    controller: MessageController,
    method: 'markAsRead',
    reason: 'messageRepository.findOne({ where: { id, receiverId: userId } }) — ownership forzado.',
  },
  {
    controller: UserController,
    method: 'addAffiliation',
    reason: 'addAffiliation(user.id, dto) — nunca acepta un id de otro usuario.',
  },
  {
    controller: UserController,
    method: 'updateProfile',
    reason: 'updateProfile(user.id, dto) — nunca acepta un id de otro usuario.',
  },
  {
    controller: UserController,
    method: 'changePassword',
    reason: 'changePassword(user.id, dto) — nunca acepta un id de otro usuario.',
  },
];

interface GetException {
  controller: ControllerClass;
  method: string;
  reason: string;
  /** Ruta (relativa a src/) de un archivo de test que existe y prueba el acotamiento afirmado en `reason`. */
  testFile: string;
}

/**
 * OLA 3 — PUNTO 2: excepciones justificadas para rutas de LECTURA (GET).
 *
 * Mismo espíritu que JUSTIFIED_EXCEPTIONS arriba, con un requisito adicional:
 * cada entrada exige el nombre de un archivo de test que exista de verdad
 * (se verifica con fs.existsSync más abajo) y que pruebe el acotamiento
 * afirmado. La razón del requisito extra: los dos P0 que la Reauditoría de
 * Ola 2 encontró (`GET /activities`, lecturas de `content`) eran precisamente
 * rutas de lectura que "parecían" acotadas por sentido común pero no tenían
 * ninguna verificación real ni ningún test que lo probara — una excepción
 * sin test de respaldo es exactamente el mismo punto ciego otra vez.
 */
const JUSTIFIED_GET_EXCEPTIONS: GetException[] = [
  {
    controller: AuthController,
    method: 'getProfile',
    reason: 'devuelve @GetUser() directo, sin ningún id de la URL — siempre el propio usuario del JWT.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: EnrollmentController,
    method: 'findMy',
    reason: 'enrollmentService.findByStudent(user.id) — nunca un id de la URL.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: MessageController,
    method: 'getInbox',
    reason: 'messageService.getInbox(user.id) — nunca un id de la URL.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: MessageController,
    method: 'getSent',
    reason: 'messageService.getSent(user.id) — nunca un id de la URL.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: MessageController,
    method: 'getUnreadCount',
    reason: 'messageService.getUnreadCount(user.id) — nunca un id de la URL.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: MessageController,
    method: 'getConversation',
    reason: 'messageService.getConversation(user.id, otherUserId) — un lado de la conversación es siempre el propio usuario; la query real filtra por ambos ids, nunca por uno ajeno suplantando al propio.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: NotificationsController,
    method: 'findMyNotifications',
    reason: 'notificationsService.findForUser(user.id, true) — nunca un id de la URL.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: NotificationsController,
    method: 'findAllMyNotifications',
    reason: 'notificationsService.findForUser(user.id, false) — nunca un id de la URL.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: UserController,
    method: 'findOne',
    reason: 'compara requester.id !== id (403 si no coincide); admin puede ver cualquiera — mismo patrón "admin siempre pasa" que AuthorizationService.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: AnalyticsController,
    method: 'getClassMetrics',
    reason: 'analyticsService.getClassMetrics verifica cls.teacherId !== requestingUser.id (403 si es ajena); estudiante siempre 403; admin pasa.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: AnalyticsController,
    method: 'getStudentDashboard',
    reason: 'P1-R5 (Ola 3): AuthorizationService.assertTeacherSharesClassWithStudent — docente sin clase en común con el estudiante objetivo recibe 403; estudiante solo su propio id; admin pasa.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: LearningProgressController,
    method: 'findByStudent',
    reason: 'P1-R5 (Ola 3): mismo patrón que getStudentDashboard — assertTeacherSharesClassWithStudent.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: LearningProgressController,
    method: 'findByStudentAndUnit',
    reason: 'P1-R5 (Ola 3): mismo patrón que findByStudent — assertTeacherSharesClassWithStudent.',
    testFile: 'common/authorization/get-route-exceptions.spec.ts',
  },
  {
    controller: ActivitiesController,
    method: 'findAll',
    reason: 'P0-R1 (Ola 3): abierto a todo rol autenticado; el acotamiento por fila (admin sin filtro, docente solo sus clases, estudiante solo PUBLISHED de clases matriculadas) vive en ActivitiesRepository.findWithPagination, y el 403 puntual cuando se pide un learningUnitId ajeno vive en ActivitiesService.findAll.',
    testFile: 'activities/activities.service.spec.ts',
  },
  {
    controller: ActivitiesController,
    method: 'findOne',
    reason: 'findOneForRequester ya verifica matrícula (assertEnrolledInClass) y oculta drafts a estudiantes — abierto a todo rol autenticado de forma deliberada, acotamiento real dentro del service.',
    testFile: 'activities/activities.service.spec.ts',
  },
  {
    controller: ActivityQuestionsController,
    method: 'findByActivity',
    reason: 'P1-R2 (Ola 3) y Fase G: docente ajeno recibe 403 (assertTeacherOwnsClass); estudiante solo recibe la versión redactada si está matriculado en la clase y la actividad está publicada.',
    testFile: 'activity-questions/activity-questions.service.spec.ts',
  },
  {
    controller: ContentController,
    method: 'findByUnit',
    reason: 'P0-R2 (Ola 3): abierto a todo rol autenticado; acotamiento real (docente dueño/estudiante matriculado/admin) en ContentService.assertCanReadClass.',
    testFile: 'content/content.service.spec.ts',
  },
  {
    controller: ContentController,
    method: 'findOne',
    reason: 'P0-R2 (Ola 3): mismo acotamiento que findByUnit, más 404 si el bloque está oculto y el requester es estudiante.',
    testFile: 'content/content.service.spec.ts',
  },
];

interface ScannedRoute {
  /** Referencia real a la clase — es lo que se compara contra las excepciones, nunca el nombre. */
  ControllerClass: ControllerClass;
  /** Solo para mensajes legibles (violaciones, logs) — NUNCA se usa para comparar identidad. */
  controllerName: string;
  method: string;
  httpMethod: RequestMethod;
  file: string;
}

function scanRoutesByMethod(methodFilter: (m: RequestMethod) => boolean): ScannedRoute[] {
  const scanner = new MetadataScanner();
  const routes: ScannedRoute[] = [];

  for (const file of findControllerFiles(SRC_ROOT)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(file);

    const controllerClasses = Object.values(mod).filter(
      (exported): exported is ControllerClass =>
        typeof exported === 'function' && Reflect.getMetadata(CONTROLLER_WATERMARK, exported) === true,
    );

    for (const ControllerClass of controllerClasses) {
      const prototype = (ControllerClass as { prototype: object }).prototype;
      for (const methodName of scanner.getAllMethodNames(prototype)) {
        const handler = (prototype as Record<string, unknown>)[methodName];
        const httpMethod = Reflect.getMetadata(METHOD_METADATA, handler);
        if (httpMethod === undefined || !methodFilter(httpMethod)) continue;

        routes.push({
          ControllerClass,
          controllerName: ControllerClass.name,
          method: methodName,
          httpMethod,
          file: path.relative(SRC_ROOT, file),
        });
      }
    }
  }

  return routes;
}

function scanMutantRoutes(): ScannedRoute[] {
  return scanRoutesByMethod((m) => MUTANT_METHODS.has(m));
}

function scanGetRoutes(): ScannedRoute[] {
  return scanRoutesByMethod((m) => m === RequestMethod.GET);
}

/**
 * Handler de una ruta ya escaneada, listo para leer con
 * Reflector.getAllAndOverride — el mismo mecanismo que usan
 * RolesGuard/JwtAuthGuard en producción. Ya no vuelve a hacer `require()`
 * ni a buscar la clase por nombre: `route.ControllerClass` YA ES la
 * referencia real capturada durante el escaneo.
 */
function resolveHandler(route: ScannedRoute): { handler: unknown; ControllerClass: ControllerClass } {
  const handler = (route.ControllerClass.prototype as Record<string, unknown>)[route.method];
  return { handler, ControllerClass: route.ControllerClass };
}

describe('Arquitectura — toda ruta mutante declara @Roles o @Public (Ola 2, Punto 1)', () => {
  const controllerFiles = findControllerFiles(SRC_ROOT);
  const mutantRoutes = scanMutantRoutes();
  const reflector = new Reflector();

  it('el descubrimiento por filesystem encuentra controllers reales (guarda contra un glob roto)', () => {
    expect(controllerFiles.length).toBeGreaterThanOrEqual(20);
  });

  it('el scanner encuentra rutas mutantes reales (guarda contra un scanner roto)', () => {
    expect(mutantRoutes.length).toBeGreaterThanOrEqual(20);
  });

  it('ninguna ruta mutante sin @Roles/@Public queda fuera de la lista de excepciones', () => {
    const violations: string[] = [];

    for (const route of mutantRoutes) {
      const { handler, ControllerClass } = resolveHandler(route);

      const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, ControllerClass]);
      const roles = reflector.getAllAndOverride<string[]>('roles', [handler, ControllerClass]);
      if (isPublic || (roles && roles.length > 0)) continue;

      const justified = JUSTIFIED_EXCEPTIONS.some(
        (ex) => ex.controller === route.ControllerClass && ex.method === route.method,
      );
      if (justified) continue;

      violations.push(
        `${route.controllerName}.${route.method} (${RequestMethod[route.httpMethod]} — ${route.file})`,
      );
    }

    if (violations.length > 0) {
      throw new Error(
        `${violations.length} ruta(s) mutante(s) sin @Roles ni @Public y sin excepción justificada en ` +
          `JUSTIFIED_EXCEPTIONS:\n` +
          violations.map((v) => `  - ${v}`).join('\n') +
          '\n\nCada una necesita @Roles(...), @Public(), o una entrada en JUSTIFIED_EXCEPTIONS con el motivo ' +
          '(solo válido si la mutación está estructuralmente limitada al propio usuario autenticado).',
      );
    }
  });

  it('cada excepción justificada sigue existiendo como ruta mutante real (guarda contra excepciones huérfanas)', () => {
    const orphaned = JUSTIFIED_EXCEPTIONS.filter(
      (ex) => !mutantRoutes.some((r) => r.ControllerClass === ex.controller && r.method === ex.method),
    );
    expect(orphaned).toEqual([]);
  });
});

describe('Arquitectura — toda ruta GET de un controller de dominio declara @Roles/@Public (Ola 3, Punto 2)', () => {
  // Reauditoría de Ola 2 (docs/REAUDITORIA_OLA2.md, hallazgos P0-R1 y P0-R2):
  // el test de arquitectura original (arriba) solo cubría rutas mutantes
  // (POST/PUT/PATCH/DELETE) — por eso `GET /activities` y las lecturas de
  // `content`, sin ningún control de acceso, pasaron desapercibidas durante
  // dos olas de remediación. Mismo mecanismo de descubrimiento y de lectura
  // de metadata que el bloque anterior; el requisito de cobertura es más
  // estricto para las excepciones (ver JUSTIFIED_GET_EXCEPTIONS arriba).
  const getRoutes = scanGetRoutes();
  const reflector = new Reflector();

  it('el scanner encuentra rutas GET reales (guarda contra un scanner roto)', () => {
    expect(getRoutes.length).toBeGreaterThanOrEqual(20);
  });

  it('ninguna ruta GET sin @Roles/@Public queda fuera de la lista de excepciones', () => {
    const violations: string[] = [];

    for (const route of getRoutes) {
      const { handler, ControllerClass } = resolveHandler(route);

      const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, ControllerClass]);
      const roles = reflector.getAllAndOverride<string[]>('roles', [handler, ControllerClass]);
      if (isPublic || (roles && roles.length > 0)) continue;

      const justified = JUSTIFIED_GET_EXCEPTIONS.some(
        (ex) => ex.controller === route.ControllerClass && ex.method === route.method,
      );
      if (justified) continue;

      violations.push(`${route.controllerName}.${route.method} (GET — ${route.file})`);
    }

    if (violations.length > 0) {
      throw new Error(
        `${violations.length} ruta(s) GET sin @Roles ni @Public y sin excepción justificada en ` +
          `JUSTIFIED_GET_EXCEPTIONS:\n` +
          violations.map((v) => `  - ${v}`).join('\n') +
          '\n\nCada una necesita @Roles(...), @Public(), o una entrada en JUSTIFIED_GET_EXCEPTIONS con el motivo ' +
          'y un testFile que exista y pruebe el acotamiento.',
      );
    }
  });

  it('cada excepción GET sigue existiendo como ruta real (guarda contra excepciones huérfanas)', () => {
    const orphaned = JUSTIFIED_GET_EXCEPTIONS.filter(
      (ex) => !getRoutes.some((r) => r.ControllerClass === ex.controller && r.method === ex.method),
    );
    expect(orphaned).toEqual([]);
  });

  it('cada excepción GET declara un testFile que existe de verdad (guarda contra excepciones sin respaldo)', () => {
    const missing = JUSTIFIED_GET_EXCEPTIONS.filter(
      (ex) => !fs.existsSync(path.join(SRC_ROOT, ex.testFile)),
    );
    if (missing.length > 0) {
      throw new Error(
        `${missing.length} excepción(es) GET declaran un testFile que no existe:\n` +
          missing.map((ex) => `  - ${ex.controller}.${ex.method} -> ${ex.testFile}`).join('\n'),
      );
    }
  });
});
