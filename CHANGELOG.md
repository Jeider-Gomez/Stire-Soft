# Changelog

All notable changes to this project are documented in this file, from the most recent
entry to the oldest.

> **Nota de fusión (Reorganización Documental):** este archivo fusiona el `CHANGELOG.md` de
> la raíz (formato breve, estilo [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)) con
> `docs/RELEASE_NOTES.md` (formato narrativo, con evidencia por hallazgo). Las entradas v0.1.0
> y v0.2.0 existían en ambos documentos; se conservó la versión de `RELEASE_NOTES.md` por ser
> un superconjunto estricto de la del `CHANGELOG.md` original — cada afirmación de la versión
> breve está cubierta, con más detalle, en la versión narrativa. Nada se perdió en la fusión.

---

## Pendientes posteriores a la Fase 25 · 25 de Septiembre de 2026

- **Errores del servidor visibles en las páginas antiguas:** 11 sitios (mensajes del docente y del estudiante, rendimiento, seguimiento del alumno, crear clase, unirse a una clase) leían
  `err.data.message`, pero el backend responde el motivo en `error`: el usuario veía un texto genérico (o el crudo de ofetch). Ahora usan `useApiErrorMessage().messageOf` como el resto;
  `stores/auth.ts` (registro) y `composables/useApi.ts` (registro en consola) leen `error` primero. `grep -rn "data?.message"` solo queda en el propio helper y en los sitios que ya
  prefieren `error` (`forgot-password`, `reset-password`, `auth.ts` login). `nuxi typecheck` exit 0.
- **F24-09 (auditoría de la Fase 24), corregido:** `PATCH /class/:id` respondía **409** al docente ajeno (ahora **403**, con `AuthorizationService`), dejaba cambiar el `code` por API aunque la pantalla
  lo declara de solo lectura (ahora es un **400** «property code should not exist»: el código de ingreso no se edita) y con un código repetido devolvía un **500** con texto SQL (ya no puede
  ocurrir). El `id` de la ruta pasó a `ParseIntPipe` (uno no numérico → 400 en vez de un `NaN` hacia la base).
- **F24-10, corregido:** cambiar la **propia** contraseña no cerraba las otras sesiones (el token anterior seguía válido). Ahora `changePassword` marca `passwordChangedAt` y `PATCH /users/me/password`
  devuelve un **token nuevo** (`access_token`/`token`) para la sesión que hizo el cambio; «Mi perfil» lo guarda, así que quien cambia su clave no se queda fuera. Para firmarlo sin importar
  `AuthModule` en `UserModule` (circular) el `JwtModule` de `AuthModule` pasó a `global: true`.
- **Verificación (25/09, base desechable `stire_qa26`, backend compilado en :3098):** por API **18/18** (docente ajeno 403; `code` 400; edición del dueño 200; id no numérico 400; inexistente 404; con dos
  sesiones abiertas, tras el cambio la otra da 401, el token anterior 401, el nuevo 200, login con la clave nueva OK, clave actual incorrecta 401 sin token; `coding` en python 400, en javascript 201;
  `fill_code` python 201 y cobol 400; el estudiante recibe `language` y nunca la respuesta) y en **Chrome real** (cambiar la clave desde «Mi perfil»: la sesión sigue viva tras navegar y recargar, sin
  401, la sesión ajena queda cerrada; crear una clase con código repetido muestra «Ya existe una clase con ese código», no el texto genérico). Jest: 4 suites nuevas o ampliadas (user, class), `npm run build` limpio.
- **Tutor en ejercicios de HTML y CSS (pendiente «sin probar» de la Fase 25; dos defectos hallados y corregidos):** (1) la pantalla mandaba al Tutor `workspaceStore.code`, el búfer del ejercicio de JavaScript
  —**vacío** en un ejercicio `html_css`—, así que el Tutor **no veía el HTML/CSS del estudiante** (y lo etiquetaba como ```javascript); ahora manda ambos (`currentCode` con `index.html` y `estilos.css`) y
  `codeLanguage: 'html'`, y el backend usa la valla del lenguaje correcto (lista blanca `isHighlightLanguage`; el cliente no puede colar texto en ella). (2) La barrera anti-solución solo reconocía programas
  `stdin → stdout`; una **página completa cabe en 10-20 líneas**, por debajo del tope general, y el Tutor podía entregarla. Con `codeLanguage` html/css un bloque de ≥ 10 líneas que no sea el propio código
  del estudiante se omite (`MIN_MARKUP_SOLUTION_LINES`). Es una barrera de mejor esfuerzo, igual que la existente (sin `activityId` tampoco actúa). Lo que el Tutor **no** recibe es la solución modelo ni las
  reglas: `currentCode` es solo lo que escribió el estudiante. **Pruebas:** 12 nuevas (`tutor-context.service.spec.ts`, guard y servicio); Jest del Tutor 11 suites / 133 tests; Chrome real: la petición
  `POST /tutor/chat` lleva `codeLanguage: "html"` y el HTML y CSS escritos (428 esperado: el estudiante de prueba no tiene clave).
- **Despliegue sin *Pay As You Go* (contradicción entre documentos y decisión del dueño, corregida):** `docs/DESPLIEGUE.md` y el ADR 13 recomendaban pasar la cuenta de Oracle a PAYG para evitar la reclamación
  por inactividad, contra la decisión del dueño (25/09/2026: el proyecto **no puede generar cobros**; un presupuesto de Oracle solo avisa, no frena el gasto). Ahora dicen: la cuenta se queda en Always Free, el
  riesgo de reclamación **se acepta**, la copia de seguridad **semanal fuera de la máquina es obligatoria** y hay un procedimiento nuevo (`DESPLIEGUE.md` §7) para arrancar la máquina detenida o recrearla y restaurar
  la copia (incluye guardar `.env.prod` fuera de la máquina: sin `TUTOR_KEY_ENCRYPTION_SECRET` no se descifran las claves de los estudiantes). El ADR lleva una enmienda fechada; el plan B se marca como de pago.
  Las afirmaciones sobre qué hace Oracle con una máquina reclamada quedan escritas como «según su documentación, compruébalo en tu consola»: no se pudieron verificar sin cuenta.
- **`verify:clean` (mitad que arranca el servidor):** usaba `process.env.DB_USERNAME/DB_PASSWORD` a pelo, pero no propagaba los valores por defecto (root/root) que la otra mitad y `dropDatabase()` sí usan; sin un `.env`
  (un `git worktree` recién creado) el servidor arrancaba sin usuario ni clave y MariaDB respondía «unknown plugin auth_gssapi_client». Ahora `serverEnv` lleva los mismos valores por defecto. Como toca un script de
  arranque, la regla del proyecto exige repetir `verify:clean`: **corrido el 25/09 al final del conjunto de cambios, con `VERIFY_START_TIMEOUT_MS=180000` (regla de OneDrive) y solo 1,2 GB de RAM libre, exit 0.**
  Jest completo antes: **74 suites, 719 tests**. Salida literal:

```

> stire@0.0.1 verify:clean
> node scripts/verify-clean.js && node scripts/verify-clean-server-check.js


[verify:clean 1] rm -rf node_modules dist

[verify:clean 2] npm ci (instalacion exacta desde package-lock.json)

added 957 packages, and audited 958 packages in 1m

186 packages are looking for funding
  run `npm fund` for details

16 vulnerabilities (2 low, 3 moderate, 10 high, 1 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated @npmcli/move-file@1.1.2: This functionality has been moved to @npmcli/fs
npm warn deprecated npmlog@6.0.2: This package is no longer supported.
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated are-we-there-yet@3.0.1: This package is no longer supported.
npm warn deprecated prebuild-install@7.1.3: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.
npm warn deprecated gauge@4.0.4: This package is no longer supported.
npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

[verify:clean 3] crear base de datos vacia de verificacion: stire_verify_clean
(node:6796) [DEP0190] DeprecationWarning: Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not escaped, only concatenated.
(Use `node --trace-deprecation ...` to show where the warning was created)

[verify:clean 4] migration:run contra la base de datos vacia

> stire@0.0.1 migration:run
> npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts

◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }
query: SELECT version()
query: SELECT * FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA` = 'stire_verify_clean' AND `TABLE_NAME` = 'migrations'
query: CREATE TABLE `migrations` (`id` int NOT NULL AUTO_INCREMENT, `timestamp` bigint NOT NULL, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: SELECT * FROM `stire_verify_clean`.`migrations` `migrations` ORDER BY `id` DESC
0 migrations are already loaded in the database.
10 migrations were found in the source code.
10 migrations are new migrations must be executed.
query: START TRANSACTION
query: CREATE TABLE `activity_types` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `name` varchar(100) NOT NULL, `code` varchar(50) NOT NULL, `autoGradable` tinyint NOT NULL DEFAULT 1, `baseWeight` float NOT NULL DEFAULT '1', `configSchema` json NULL, UNIQUE INDEX `IDX_ce7823da2e27674fbd0392e867` (`code`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `activities` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `learningUnitId` int NOT NULL, `activityTypeId` int NOT NULL, `createdBy` int NOT NULL, `title` varchar(200) NOT NULL, `description` text NULL, `difficulty` enum ('basico', 'intermedio', 'avanzado') NOT NULL DEFAULT 'basico', `totalPoints` int NOT NULL DEFAULT '100', `passingScore` int NOT NULL DEFAULT '60', `attemptsAllowed` int NOT NULL DEFAULT '3', `timeLimit` int NULL, `order` int NOT NULL DEFAULT '0', `status` enum ('draft', 'review', 'published', 'archived') NOT NULL DEFAULT 'draft', `isRequired` tinyint NOT NULL DEFAULT 0, `adaptiveWeight` float NOT NULL DEFAULT '1', `publishedAt` timestamp NULL, INDEX `IDX_bd3144edc073063648e4efbb1f` (`learningUnitId`, `status`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `contents` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `learningUnitId` int NOT NULL, `title` varchar(255) NOT NULL, `type` enum ('video', 'markdown', 'code', 'pdf', 'image') NOT NULL, `body` longtext NULL, `metadata` json NULL, `order` int NOT NULL DEFAULT '0', `isVisible` tinyint NOT NULL DEFAULT 1, INDEX `IDX_58754b2430201454bffc79cec6` (`learningUnitId`, `order`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `learning_units` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `description` text NULL, `difficulty` enum ('basico', 'intermedio', 'avanzado') NOT NULL DEFAULT 'basico', `order` int NOT NULL DEFAULT '0', `isActive` tinyint NOT NULL DEFAULT 1, `topicId` int NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `topics` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `description` text NULL, `order` int NOT NULL DEFAULT '0', `isActive` tinyint NOT NULL DEFAULT 1, `sectionId` int NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `sections` (`id` int NOT NULL AUTO_INCREMENT, `title` varchar(255) NOT NULL, `description` text NULL, `order` int NOT NULL DEFAULT '0', `isPublished` tinyint NOT NULL DEFAULT 0, `classId` int NOT NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX `IDX_f0881122b5efd7b004f082c084` (`classId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `classes` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `description` text NULL, `code` varchar(255) NOT NULL, `teacherId` int NOT NULL, `isActive` tinyint NOT NULL DEFAULT 1, `startDate` date NULL, `endDate` date NULL, `maxStudents` int NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX `IDX_4b7ac7a7eb91f3e04229c7c0b6` (`teacherId`), UNIQUE INDEX `IDX_cf7491878e0fca859943862998` (`code`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `enrollments` (`id` varchar(36) NOT NULL, `classId` int NOT NULL, `studentId` int NOT NULL, `status` enum ('active', 'inactive', 'withdrawn', 'completed') NOT NULL DEFAULT 'active', `joined_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `left_at` timestamp NULL, `last_activity_at` timestamp NULL, UNIQUE INDEX `IDX_43599c2329cb145ee8ba57079b` (`classId`, `studentId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `institutions` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, UNIQUE INDEX `IDX_15c98649276025998cd1acaf61` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `programs` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `maxSemesters` int NOT NULL, `institutionId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `user_affiliations` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `programId` int NOT NULL, `roleType` varchar(255) NOT NULL, `currentSemester` int NULL, `isActive` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `users` (`id` int NOT NULL AUTO_INCREMENT, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `fullName` varchar(255) NOT NULL, `role` enum ('admin', 'docente', 'estudiante') NOT NULL DEFAULT 'estudiante', `isActive` tinyint NOT NULL DEFAULT 1, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `deletedAt` timestamp(6) NULL, UNIQUE INDEX `IDX_97672ac88f789774dd47f7c8be` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `tutor_conversations` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `studentId` int NOT NULL, `role` varchar(50) NOT NULL, `content` text NOT NULL, `metadata` json NULL, INDEX `IDX_56c5533282e9ec141a9369081c` (`studentId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `activity_questions` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `activityId` int NOT NULL, `type` enum ('mcq', 'coding', 'drag_drop', 'matching', 'fill_code', 'ordering', 'ai_evaluated') NOT NULL, `question` text NOT NULL, `points` int NOT NULL DEFAULT '10', `order` int NOT NULL DEFAULT '0', `config` json NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `submission_answers` (`id` int NOT NULL AUTO_INCREMENT, `submissionId` varchar(255) NOT NULL, `questionId` int NOT NULL, `answer` json NOT NULL, `isCorrect` tinyint NULL, `score` float NOT NULL DEFAULT '0', `feedback` text NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `submissions` (`id` varchar(36) NOT NULL, `activityId` int NOT NULL, `studentId` int NOT NULL, `score` float NOT NULL DEFAULT '0', `feedback` text NULL, `attemptNumber` int NOT NULL DEFAULT '1', `status` enum ('in_progress', 'submitted', 'graded', 'expired') NOT NULL DEFAULT 'in_progress', `startedAt` timestamp NULL, `submittedAt` timestamp NULL, `timeSpentSeconds` int NOT NULL DEFAULT '0', `lastSavedAt` timestamp NULL, `autosaveData` json NULL, `isAbandoned` tinyint NOT NULL DEFAULT 0, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, INDEX `IDX_a3a94d0cb86c82e1f221100a44` (`studentId`, `status`), INDEX `IDX_03e1c1ddb6b33421fe8935a73f` (`studentId`, `activityId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `review_schedules` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `studentId` int NOT NULL, `learningUnitId` int NOT NULL, `nextReviewDate` timestamp NOT NULL, `urgencyLevel` int NOT NULL DEFAULT '0', `intervalDays` int NOT NULL DEFAULT '1', `repetitions` int NOT NULL DEFAULT '0', `lastReviewedAt` timestamp NULL, UNIQUE INDEX `IDX_7e969b53fac069d54b248bf537` (`studentId`, `learningUnitId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `bank_questions` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `bankId` int NOT NULL, `type` enum ('mcq', 'coding', 'drag_drop', 'matching', 'fill_code', 'ordering', 'ai_evaluated') NOT NULL, `question` text NOT NULL, `config` json NOT NULL, `tags` text NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `question_banks` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `name` varchar(255) NOT NULL, `description` text NULL, `authorId` int NOT NULL, `isPublic` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `prerequisites` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `targetUnitId` int NOT NULL, `requiredUnitId` int NOT NULL, `minMasteryRequired` float NOT NULL DEFAULT '60', UNIQUE INDEX `IDX_e55545b98f91f6a5da8b004833` (`targetUnitId`, `requiredUnitId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `notifications` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `userId` int NOT NULL, `title` varchar(255) NOT NULL, `message` text NOT NULL, `isRead` tinyint NOT NULL DEFAULT 0, `type` enum ('grade', 'review_schedule', 'info') NOT NULL DEFAULT 'info', PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `messages` (`id` int NOT NULL AUTO_INCREMENT, `senderId` int NOT NULL, `receiverId` int NOT NULL, `content` text NOT NULL, `isRead` tinyint NOT NULL DEFAULT 0, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `learning_progress` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `studentId` int NOT NULL, `learningUnitId` int NOT NULL, `mastery` float NOT NULL DEFAULT '0', `status` enum ('no_visto', 'explorado', 'en_practica', 'comprension_parcial', 'dominado') NOT NULL DEFAULT 'no_visto', `priority` int NOT NULL DEFAULT '0', `successRate` float NOT NULL DEFAULT '0', `attemptsCount` int NOT NULL DEFAULT '0', `completedActivities` int NOT NULL DEFAULT '0', `lastActivityId` int NULL, UNIQUE INDEX `IDX_21d1790565894696c13f099ce9` (`studentId`, `learningUnitId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `execution_results` (`id` varchar(36) NOT NULL, `submissionAnswerId` int NOT NULL, `status` varchar(50) NOT NULL, `stdout` text NULL, `stderr` text NULL, `executionTimeMs` int NOT NULL DEFAULT '0', `memoryUsedKB` int NOT NULL DEFAULT '0', `testCaseLabel` varchar(255) NULL, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `achievements` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `name` varchar(255) NOT NULL, `description` text NULL, `iconUrl` varchar(255) NOT NULL, `points` int NOT NULL DEFAULT '10', `unlockedById` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB
query: CREATE TABLE `activity_logs` (`id` varchar(36) NOT NULL, `studentId` int NOT NULL, `action` enum ('content_read', 'activity_started', 'submission_graded', 'unit_completed') NOT NULL, `referenceId` varchar(100) NOT NULL, `referenceType` varchar(50) NOT NULL, `metadata` json NULL, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX `IDX_78666521e99d2bbe69f2ea830a` (`referenceId`, `action`), INDEX `IDX_8befb5d0b0f799f6b6a1af46b5` (`studentId`, `action`), INDEX `IDX_0239ac3be75a977a71ae9cf8e0` (`studentId`, `createdAt`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: ALTER TABLE `activities` ADD CONSTRAINT `FK_cc686d463a463786129e1de1cea` FOREIGN KEY (`learningUnitId`) REFERENCES `learning_units`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `activities` ADD CONSTRAINT `FK_3689e28651a4b078af91952bed8` FOREIGN KEY (`activityTypeId`) REFERENCES `activity_types`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `activities` ADD CONSTRAINT `FK_dc4b610a410beaee2dca89e7536` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `contents` ADD CONSTRAINT `FK_03bf08d52358f58f07787fc6b8f` FOREIGN KEY (`learningUnitId`) REFERENCES `learning_units`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `learning_units` ADD CONSTRAINT `FK_cb4ada233555d57c4f6e50609ad` FOREIGN KEY (`topicId`) REFERENCES `topics`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `topics` ADD CONSTRAINT `FK_36089054397b6db8da2fd67a073` FOREIGN KEY (`sectionId`) REFERENCES `sections`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `sections` ADD CONSTRAINT `FK_f0881122b5efd7b004f082c084c` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `classes` ADD CONSTRAINT `FK_4b7ac7a7eb91f3e04229c7c0b6f` FOREIGN KEY (`teacherId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `enrollments` ADD CONSTRAINT `FK_470304681bce2933d3cbb680db8` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `enrollments` ADD CONSTRAINT `FK_bf3ba3dfa95e2df7388eb4589fd` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `programs` ADD CONSTRAINT `FK_82f9404fa3d1a3e1cc2c8f2d22a` FOREIGN KEY (`institutionId`) REFERENCES `institutions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `user_affiliations` ADD CONSTRAINT `FK_be5b7060fa1c8a8ba2a8504e746` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `user_affiliations` ADD CONSTRAINT `FK_f6200ccffc5064f1be2e329a245` FOREIGN KEY (`programId`) REFERENCES `programs`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `tutor_conversations` ADD CONSTRAINT `FK_56c5533282e9ec141a9369081ca` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `activity_questions` ADD CONSTRAINT `FK_a20191ae2559a453d0bba75da9b` FOREIGN KEY (`activityId`) REFERENCES `activities`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `submission_answers` ADD CONSTRAINT `FK_7e0d6cf6173772c12089cf97474` FOREIGN KEY (`submissionId`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `submission_answers` ADD CONSTRAINT `FK_49b240a1fb2de5d9308d2125597` FOREIGN KEY (`questionId`) REFERENCES `activity_questions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `submissions` ADD CONSTRAINT `FK_5ddeb5fb4f6c38b0439ec52bff2` FOREIGN KEY (`activityId`) REFERENCES `activities`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `submissions` ADD CONSTRAINT `FK_4fc99318a291abd7e2a50f50851` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `review_schedules` ADD CONSTRAINT `FK_c76dfbe4d695e9eb548d0826c7e` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `review_schedules` ADD CONSTRAINT `FK_bc8f68cc5d9a235438a767fd5a0` FOREIGN KEY (`learningUnitId`) REFERENCES `learning_units`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `bank_questions` ADD CONSTRAINT `FK_916010c09855614e142d71f72a2` FOREIGN KEY (`bankId`) REFERENCES `question_banks`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `question_banks` ADD CONSTRAINT `FK_6f408c9e6d742703af93a98083f` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `prerequisites` ADD CONSTRAINT `FK_f205de314c224ec276293924105` FOREIGN KEY (`targetUnitId`) REFERENCES `learning_units`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `prerequisites` ADD CONSTRAINT `FK_b616443e090e940951cc2fbaf94` FOREIGN KEY (`requiredUnitId`) REFERENCES `learning_units`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `notifications` ADD CONSTRAINT `FK_692a909ee0fa9383e7859f9b406` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `messages` ADD CONSTRAINT `FK_2db9cf2b3ca111742793f6c37ce` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `messages` ADD CONSTRAINT `FK_acf951a58e3b9611dd96ce89042` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `learning_progress` ADD CONSTRAINT `FK_ff1936e29305b9f0e52eb1fde30` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `learning_progress` ADD CONSTRAINT `FK_2d86a96d67fe2848ec0d39560ba` FOREIGN KEY (`learningUnitId`) REFERENCES `learning_units`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `learning_progress` ADD CONSTRAINT `FK_c4ba35959dbdc57dde97ceb7473` FOREIGN KEY (`lastActivityId`) REFERENCES `activities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: ALTER TABLE `execution_results` ADD CONSTRAINT `FK_35b26782b11673f9510ecf7a69e` FOREIGN KEY (`submissionAnswerId`) REFERENCES `submission_answers`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: ALTER TABLE `achievements` ADD CONSTRAINT `FK_d090264a2b478a21cc8f52552b9` FOREIGN KEY (`unlockedById`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1779000000000,"InitialSchema1779000000000"]
Migration InitialSchema1779000000000 has been executed successfully.
query: ALTER TABLE `review_schedules` ADD `easeFactor` float NOT NULL DEFAULT '2.5'
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1788999128282,"AddEaseFactorToReviewSchedules1788999128282"]
Migration AddEaseFactorToReviewSchedules1788999128282 has been executed successfully.
query: ALTER TABLE `classes` ADD `requiresApproval` tinyint NOT NULL DEFAULT '0'
query: ALTER TABLE `enrollments` MODIFY `status` enum ('active','inactive','withdrawn','completed','pending') NOT NULL DEFAULT 'active'
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1789000000000,"AddApprovalToClasses1789000000000"]
Migration AddApprovalToClasses1789000000000 has been executed successfully.
query: ALTER TABLE `submissions` ADD `activeAttemptKey` tinyint GENERATED ALWAYS AS (CASE WHEN `status` = 'in_progress' THEN 1 ELSE NULL END) STORED
query: CREATE UNIQUE INDEX `UQ_submissions_active_attempt` ON `submissions` (`studentId`, `activityId`, `activeAttemptKey`)
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1789100000000,"AddActiveSubmissionConstraint1789100000000"]
Migration AddActiveSubmissionConstraint1789100000000 has been executed successfully.
query: CREATE TABLE `tutor_credentials` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `studentId` int NOT NULL, `encryptedKey` text NOT NULL, `keyLast4` varchar(4) NOT NULL, UNIQUE INDEX `IDX_tutor_credentials_studentId` (`studentId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: ALTER TABLE `tutor_credentials` ADD CONSTRAINT `FK_tutor_credentials_studentId` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1789200000000,"CreateTutorCredentials1789200000000"]
Migration CreateTutorCredentials1789200000000 has been executed successfully.
query: CREATE TABLE `tutor_settings` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp(6) NULL, `scopeType` varchar(20) NOT NULL, `scopeId` int NOT NULL, `enabled` tinyint(1) NULL, `maxGuideLevel` tinyint NULL, `style` varchar(20) NULL, UNIQUE INDEX `IDX_tutor_settings_scope` (`scopeType`, `scopeId`), PRIMARY KEY (`id`)) ENGINE=InnoDB
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1789300000000,"CreateTutorSettings1789300000000"]
Migration CreateTutorSettings1789300000000 has been executed successfully.
query: CREATE TABLE `role_requests` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, `deletedAt` timestamp NULL, `userId` int NOT NULL, `requestedRole` varchar(20) NOT NULL DEFAULT 'docente', `status` varchar(20) NOT NULL DEFAULT 'pending', `reason` varchar(300) NULL, `reviewedById` int NULL, `reviewedAt` timestamp NULL, `reviewNote` varchar(300) NULL, INDEX `IDX_role_requests_status` (`status`), INDEX `IDX_role_requests_user` (`userId`), PRIMARY KEY (`id`), CONSTRAINT `FK_role_requests_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION) ENGINE=InnoDB
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1789400000000,"CreateRoleRequests1789400000000"]
Migration CreateRoleRequests1789400000000 has been executed successfully.
query: ALTER TABLE `notifications` MODIFY COLUMN `type` enum ('grade', 'review_schedule', 'message', 'info') NOT NULL DEFAULT 'info'
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1789500000000,"AddMessageNotificationType1789500000000"]
Migration AddMessageNotificationType1789500000000 has been executed successfully.
query: ALTER TABLE `users` ADD `passwordChangedAt` timestamp NULL
query: CREATE TABLE `password_reset_tokens` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `tokenHash` char(64) NOT NULL, `expiresAt` timestamp NOT NULL, `usedAt` timestamp NULL, `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX `IDX_password_reset_tokenHash` (`tokenHash`), INDEX `IDX_password_reset_userId` (`userId`), PRIMARY KEY (`id`), CONSTRAINT `FK_password_reset_user` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE) ENGINE=InnoDB
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1789600000000,"AddPasswordReset1789600000000"]
Migration AddPasswordReset1789600000000 has been executed successfully.
query: ALTER TABLE `activity_questions` MODIFY COLUMN `type` enum ('mcq', 'coding', 'drag_drop', 'matching', 'fill_code', 'ordering', 'ai_evaluated', 'html_css') NOT NULL
query: ALTER TABLE `bank_questions` MODIFY COLUMN `type` enum ('mcq', 'coding', 'drag_drop', 'matching', 'fill_code', 'ordering', 'ai_evaluated', 'html_css') NOT NULL
query: INSERT INTO `stire_verify_clean`.`migrations`(`timestamp`, `name`) VALUES (?, ?) -- PARAMETERS: [1789700000000,"AddHtmlCssQuestionType1789700000000"]
Migration AddHtmlCssQuestionType1789700000000 has been executed successfully.
query: COMMIT

[verify:clean 5] db:seed:demo contra la base de datos vacia

> stire@0.0.1 db:seed:demo
> ts-node -r tsconfig-paths/register stire-seeder-demo.ts

◇ injected env (0) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
query: SELECT version()
Conectado a la base de datos. Sembrando datos de demo (idempotente)...

Institución y programa
query: SELECT `Institution`.`id` AS `Institution_id`, `Institution`.`name` AS `Institution_name` FROM `institutions` `Institution` WHERE ((`Institution`.`name` = ?)) LIMIT 1 -- PARAMETERS: ["Universidad de Córdoba (Demo)"]
query: START TRANSACTION
query: INSERT INTO `institutions`(`id`, `name`) VALUES (DEFAULT, ?) -- PARAMETERS: ["Universidad de Córdoba (Demo)"]
query: COMMIT
  + creado: Universidad de Córdoba (Demo)
query: SELECT `Program`.`id` AS `Program_id`, `Program`.`name` AS `Program_name`, `Program`.`maxSemesters` AS `Program_maxSemesters`, `Program`.`institutionId` AS `Program_institutionId` FROM `programs` `Program` WHERE ((`Program`.`name` = ?) AND (`Program`.`institutionId` = ?)) LIMIT 1 -- PARAMETERS: ["Ingeniería de Sistemas (Demo)",1]
query: START TRANSACTION
query: INSERT INTO `programs`(`id`, `name`, `maxSemesters`, `institutionId`) VALUES (DEFAULT, ?, ?, ?) -- PARAMETERS: ["Ingeniería de Sistemas (Demo)",10,1]
query: COMMIT
  + creado: Ingeniería de Sistemas (Demo)

Usuarios
query: SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email`, `User`.`fullName` AS `User_fullName`, `User`.`role` AS `User_role`, `User`.`isActive` AS `User_isActive`, `User`.`passwordChangedAt` AS `User_passwordChangedAt`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`deletedAt` AS `User_deletedAt` FROM `users` `User` WHERE ( ((`User`.`email` = ?)) ) AND ( `User`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: ["docente.demo@stire.local"]
query: START TRANSACTION
query: INSERT INTO `users`(`id`, `email`, `password`, `fullName`, `role`, `isActive`, `passwordChangedAt`, `createdAt`, `updatedAt`, `deletedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["docente.demo@stire.local","$2b$10$KG/0l3poZL9RhuMRnvmtPOLg24/yPCdOXcW65rkq45JbsUlZb4sy2","Docente Demo","docente",1]
query: SELECT `User`.`id` AS `User_id`, `User`.`role` AS `User_role`, `User`.`isActive` AS `User_isActive`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`deletedAt` AS `User_deletedAt` FROM `users` `User` WHERE ( `User`.`id` = ? ) AND ( `User`.`deletedAt` IS NULL ) -- PARAMETERS: [1]
query: COMMIT
  + creado: docente.demo@stire.local
query: SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email`, `User`.`fullName` AS `User_fullName`, `User`.`role` AS `User_role`, `User`.`isActive` AS `User_isActive`, `User`.`passwordChangedAt` AS `User_passwordChangedAt`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`deletedAt` AS `User_deletedAt` FROM `users` `User` WHERE ( ((`User`.`email` = ?)) ) AND ( `User`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: ["estudiante1.demo@stire.local"]
query: START TRANSACTION
query: INSERT INTO `users`(`id`, `email`, `password`, `fullName`, `role`, `isActive`, `passwordChangedAt`, `createdAt`, `updatedAt`, `deletedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["estudiante1.demo@stire.local","$2b$10$KG/0l3poZL9RhuMRnvmtPOLg24/yPCdOXcW65rkq45JbsUlZb4sy2","Estudiante Demo 1","estudiante",1]
query: SELECT `User`.`id` AS `User_id`, `User`.`role` AS `User_role`, `User`.`isActive` AS `User_isActive`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`deletedAt` AS `User_deletedAt` FROM `users` `User` WHERE ( `User`.`id` = ? ) AND ( `User`.`deletedAt` IS NULL ) -- PARAMETERS: [2]
query: COMMIT
  + creado: estudiante1.demo@stire.local
query: SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email`, `User`.`fullName` AS `User_fullName`, `User`.`role` AS `User_role`, `User`.`isActive` AS `User_isActive`, `User`.`passwordChangedAt` AS `User_passwordChangedAt`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`deletedAt` AS `User_deletedAt` FROM `users` `User` WHERE ( ((`User`.`email` = ?)) ) AND ( `User`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: ["estudiante2.demo@stire.local"]
query: START TRANSACTION
query: INSERT INTO `users`(`id`, `email`, `password`, `fullName`, `role`, `isActive`, `passwordChangedAt`, `createdAt`, `updatedAt`, `deletedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["estudiante2.demo@stire.local","$2b$10$KG/0l3poZL9RhuMRnvmtPOLg24/yPCdOXcW65rkq45JbsUlZb4sy2","Estudiante Demo 2","estudiante",1]
query: SELECT `User`.`id` AS `User_id`, `User`.`role` AS `User_role`, `User`.`isActive` AS `User_isActive`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`deletedAt` AS `User_deletedAt` FROM `users` `User` WHERE ( `User`.`id` = ? ) AND ( `User`.`deletedAt` IS NULL ) -- PARAMETERS: [3]
query: COMMIT
  + creado: estudiante2.demo@stire.local
query: SELECT `User`.`id` AS `User_id`, `User`.`email` AS `User_email`, `User`.`fullName` AS `User_fullName`, `User`.`role` AS `User_role`, `User`.`isActive` AS `User_isActive`, `User`.`passwordChangedAt` AS `User_passwordChangedAt`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`deletedAt` AS `User_deletedAt` FROM `users` `User` WHERE ( ((`User`.`email` = ?)) ) AND ( `User`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: ["estudiante3.demo@stire.local"]
query: START TRANSACTION
query: INSERT INTO `users`(`id`, `email`, `password`, `fullName`, `role`, `isActive`, `passwordChangedAt`, `createdAt`, `updatedAt`, `deletedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["estudiante3.demo@stire.local","$2b$10$KG/0l3poZL9RhuMRnvmtPOLg24/yPCdOXcW65rkq45JbsUlZb4sy2","Estudiante Demo 3","estudiante",1]
query: SELECT `User`.`id` AS `User_id`, `User`.`role` AS `User_role`, `User`.`isActive` AS `User_isActive`, `User`.`createdAt` AS `User_createdAt`, `User`.`updatedAt` AS `User_updatedAt`, `User`.`deletedAt` AS `User_deletedAt` FROM `users` `User` WHERE ( `User`.`id` = ? ) AND ( `User`.`deletedAt` IS NULL ) -- PARAMETERS: [4]
query: COMMIT
  + creado: estudiante3.demo@stire.local

Clase y matrículas
query: SELECT DISTINCT `distinctAlias`.`Class_id` AS `ids_Class_id` FROM (SELECT `Class`.`id` AS `Class_id`, `Class`.`name` AS `Class_name`, `Class`.`description` AS `Class_description`, `Class`.`code` AS `Class_code`, `Class`.`teacherId` AS `Class_teacherId`, `Class`.`isActive` AS `Class_isActive`, `Class`.`requiresApproval` AS `Class_requiresApproval`, `Class`.`startDate` AS `Class_startDate`, `Class`.`endDate` AS `Class_endDate`, `Class`.`maxStudents` AS `Class_maxStudents`, `Class`.`createdAt` AS `Class_createdAt`, `Class`.`updatedAt` AS `Class_updatedAt`, `Class__teacher`.`id` AS `Class__teacher_id`, `Class__teacher`.`email` AS `Class__teacher_email`, `Class__teacher`.`fullName` AS `Class__teacher_fullName`, `Class__teacher`.`role` AS `Class__teacher_role`, `Class__teacher`.`isActive` AS `Class__teacher_isActive`, `Class__teacher`.`passwordChangedAt` AS `Class__teacher_passwordChangedAt`, `Class__teacher`.`createdAt` AS `Class__teacher_createdAt`, `Class__teacher`.`updatedAt` AS `Class__teacher_updatedAt`, `Class__teacher`.`deletedAt` AS `Class__teacher_deletedAt` FROM `classes` `Class` LEFT JOIN `users` `Class__teacher` ON `Class__teacher`.`id`=`Class`.`teacherId` AND (`Class__teacher`.`deletedAt` IS NULL) WHERE ((`Class`.`code` = ?))) `distinctAlias` ORDER BY `Class_id` ASC LIMIT 1 -- PARAMETERS: ["DEMO-STIRE-01"]
query: START TRANSACTION
query: INSERT INTO `classes`(`id`, `name`, `description`, `code`, `teacherId`, `isActive`, `requiresApproval`, `startDate`, `endDate`, `maxStudents`, `createdAt`, `updatedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["Fundamentos de Algoritmia — Demo","Clase de demostración generada por db:seed:demo.","DEMO-STIRE-01",1,1]
query: SELECT `Class`.`id` AS `Class_id`, `Class`.`isActive` AS `Class_isActive`, `Class`.`requiresApproval` AS `Class_requiresApproval`, `Class`.`createdAt` AS `Class_createdAt`, `Class`.`updatedAt` AS `Class_updatedAt` FROM `classes` `Class` WHERE `Class`.`id` = ? -- PARAMETERS: [1]
query: COMMIT
  + creado: Fundamentos de Algoritmia — Demo (DEMO-STIRE-01)
query: SELECT `Enrollment`.`id` AS `Enrollment_id`, `Enrollment`.`classId` AS `Enrollment_classId`, `Enrollment`.`studentId` AS `Enrollment_studentId`, `Enrollment`.`status` AS `Enrollment_status`, `Enrollment`.`joined_at` AS `Enrollment_joined_at`, `Enrollment`.`left_at` AS `Enrollment_left_at`, `Enrollment`.`last_activity_at` AS `Enrollment_last_activity_at` FROM `enrollments` `Enrollment` WHERE ((`Enrollment`.`classId` = ?) AND (`Enrollment`.`studentId` = ?)) LIMIT 1 -- PARAMETERS: [1,2]
query: START TRANSACTION
query: INSERT INTO `enrollments`(`id`, `classId`, `studentId`, `status`, `joined_at`, `left_at`, `last_activity_at`) VALUES (?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["24f35417-6c5d-4675-8c35-28bf26b3d9da",1,2,"active"]
query: SELECT `Enrollment`.`id` AS `Enrollment_id`, `Enrollment`.`status` AS `Enrollment_status`, `Enrollment`.`joined_at` AS `Enrollment_joined_at` FROM `enrollments` `Enrollment` WHERE `Enrollment`.`id` = ? -- PARAMETERS: ["24f35417-6c5d-4675-8c35-28bf26b3d9da"]
query: COMMIT
  + creado: estudiante1.demo@stire.local matriculado en DEMO-STIRE-01
query: SELECT `Enrollment`.`id` AS `Enrollment_id`, `Enrollment`.`classId` AS `Enrollment_classId`, `Enrollment`.`studentId` AS `Enrollment_studentId`, `Enrollment`.`status` AS `Enrollment_status`, `Enrollment`.`joined_at` AS `Enrollment_joined_at`, `Enrollment`.`left_at` AS `Enrollment_left_at`, `Enrollment`.`last_activity_at` AS `Enrollment_last_activity_at` FROM `enrollments` `Enrollment` WHERE ((`Enrollment`.`classId` = ?) AND (`Enrollment`.`studentId` = ?)) LIMIT 1 -- PARAMETERS: [1,3]
query: START TRANSACTION
query: INSERT INTO `enrollments`(`id`, `classId`, `studentId`, `status`, `joined_at`, `left_at`, `last_activity_at`) VALUES (?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["3df3ccb5-c394-4224-8a29-c25b5f94c85a",1,3,"active"]
query: SELECT `Enrollment`.`id` AS `Enrollment_id`, `Enrollment`.`status` AS `Enrollment_status`, `Enrollment`.`joined_at` AS `Enrollment_joined_at` FROM `enrollments` `Enrollment` WHERE `Enrollment`.`id` = ? -- PARAMETERS: ["3df3ccb5-c394-4224-8a29-c25b5f94c85a"]
query: COMMIT
  + creado: estudiante2.demo@stire.local matriculado en DEMO-STIRE-01
query: SELECT `Enrollment`.`id` AS `Enrollment_id`, `Enrollment`.`classId` AS `Enrollment_classId`, `Enrollment`.`studentId` AS `Enrollment_studentId`, `Enrollment`.`status` AS `Enrollment_status`, `Enrollment`.`joined_at` AS `Enrollment_joined_at`, `Enrollment`.`left_at` AS `Enrollment_left_at`, `Enrollment`.`last_activity_at` AS `Enrollment_last_activity_at` FROM `enrollments` `Enrollment` WHERE ((`Enrollment`.`classId` = ?) AND (`Enrollment`.`studentId` = ?)) LIMIT 1 -- PARAMETERS: [1,4]
query: START TRANSACTION
query: INSERT INTO `enrollments`(`id`, `classId`, `studentId`, `status`, `joined_at`, `left_at`, `last_activity_at`) VALUES (?, ?, ?, ?, DEFAULT, DEFAULT, DEFAULT) -- PARAMETERS: ["0b1f0e7a-51f8-4e56-ac90-5b04b697b87d",1,4,"active"]
query: SELECT `Enrollment`.`id` AS `Enrollment_id`, `Enrollment`.`status` AS `Enrollment_status`, `Enrollment`.`joined_at` AS `Enrollment_joined_at` FROM `enrollments` `Enrollment` WHERE `Enrollment`.`id` = ? -- PARAMETERS: ["0b1f0e7a-51f8-4e56-ac90-5b04b697b87d"]
query: COMMIT
  + creado: estudiante3.demo@stire.local matriculado en DEMO-STIRE-01

Sección, topic y unidades de aprendizaje (con prerrequisito)
query: SELECT `Section`.`id` AS `Section_id`, `Section`.`title` AS `Section_title`, `Section`.`description` AS `Section_description`, `Section`.`order` AS `Section_order`, `Section`.`isPublished` AS `Section_isPublished`, `Section`.`classId` AS `Section_classId`, `Section`.`createdAt` AS `Section_createdAt`, `Section`.`updatedAt` AS `Section_updatedAt` FROM `sections` `Section` WHERE ((`Section`.`classId` = ?) AND (`Section`.`title` = ?)) LIMIT 1 -- PARAMETERS: [1,"Módulo 1: Fundamentos"]
query: START TRANSACTION
query: INSERT INTO `sections`(`id`, `title`, `description`, `order`, `isPublished`, `classId`, `createdAt`, `updatedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, DEFAULT, DEFAULT) -- PARAMETERS: ["Módulo 1: Fundamentos","Primer módulo de la clase de demo.",0,1,1]
query: SELECT `Section`.`id` AS `Section_id`, `Section`.`order` AS `Section_order`, `Section`.`isPublished` AS `Section_isPublished`, `Section`.`createdAt` AS `Section_createdAt`, `Section`.`updatedAt` AS `Section_updatedAt` FROM `sections` `Section` WHERE `Section`.`id` = ? -- PARAMETERS: [1]
query: COMMIT
  + creado: Módulo 1: Fundamentos
query: SELECT `Topic`.`id` AS `Topic_id`, `Topic`.`title` AS `Topic_title`, `Topic`.`description` AS `Topic_description`, `Topic`.`order` AS `Topic_order`, `Topic`.`isActive` AS `Topic_isActive`, `Topic`.`sectionId` AS `Topic_sectionId`, `Topic`.`createdAt` AS `Topic_createdAt`, `Topic`.`updatedAt` AS `Topic_updatedAt` FROM `topics` `Topic` WHERE ((`Topic`.`sectionId` = ?) AND (`Topic`.`title` = ?)) LIMIT 1 -- PARAMETERS: [1,"Tema 1: Bases de la programación"]
query: START TRANSACTION
query: INSERT INTO `topics`(`id`, `title`, `description`, `order`, `isActive`, `sectionId`, `createdAt`, `updatedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, DEFAULT, DEFAULT) -- PARAMETERS: ["Tema 1: Bases de la programación","Variables, tipos de datos y estructuras de control.",0,1,1]
query: SELECT `Topic`.`id` AS `Topic_id`, `Topic`.`order` AS `Topic_order`, `Topic`.`isActive` AS `Topic_isActive`, `Topic`.`createdAt` AS `Topic_createdAt`, `Topic`.`updatedAt` AS `Topic_updatedAt` FROM `topics` `Topic` WHERE `Topic`.`id` = ? -- PARAMETERS: [1]
query: COMMIT
  + creado: Tema 1: Bases de la programación
query: SELECT `LearningUnit`.`id` AS `LearningUnit_id`, `LearningUnit`.`title` AS `LearningUnit_title`, `LearningUnit`.`description` AS `LearningUnit_description`, `LearningUnit`.`difficulty` AS `LearningUnit_difficulty`, `LearningUnit`.`order` AS `LearningUnit_order`, `LearningUnit`.`isActive` AS `LearningUnit_isActive`, `LearningUnit`.`topicId` AS `LearningUnit_topicId`, `LearningUnit`.`createdAt` AS `LearningUnit_createdAt`, `LearningUnit`.`updatedAt` AS `LearningUnit_updatedAt` FROM `learning_units` `LearningUnit` WHERE ((`LearningUnit`.`topicId` = ?) AND (`LearningUnit`.`title` = ?)) LIMIT 1 -- PARAMETERS: [1,"Unidad 1: Variables y tipos de datos"]
query: START TRANSACTION
query: INSERT INTO `learning_units`(`id`, `title`, `description`, `difficulty`, `order`, `isActive`, `topicId`, `createdAt`, `updatedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, ?, DEFAULT, DEFAULT) -- PARAMETERS: ["Unidad 1: Variables y tipos de datos","Declaración, asignación y tipos primitivos.","basico",0,1,1]
query: SELECT `LearningUnit`.`id` AS `LearningUnit_id`, `LearningUnit`.`difficulty` AS `LearningUnit_difficulty`, `LearningUnit`.`order` AS `LearningUnit_order`, `LearningUnit`.`isActive` AS `LearningUnit_isActive`, `LearningUnit`.`createdAt` AS `LearningUnit_createdAt`, `LearningUnit`.`updatedAt` AS `LearningUnit_updatedAt` FROM `learning_units` `LearningUnit` WHERE `LearningUnit`.`id` = ? -- PARAMETERS: [1]
query: COMMIT
  + creado: Unidad 1: Variables y tipos de datos
query: SELECT `LearningUnit`.`id` AS `LearningUnit_id`, `LearningUnit`.`title` AS `LearningUnit_title`, `LearningUnit`.`description` AS `LearningUnit_description`, `LearningUnit`.`difficulty` AS `LearningUnit_difficulty`, `LearningUnit`.`order` AS `LearningUnit_order`, `LearningUnit`.`isActive` AS `LearningUnit_isActive`, `LearningUnit`.`topicId` AS `LearningUnit_topicId`, `LearningUnit`.`createdAt` AS `LearningUnit_createdAt`, `LearningUnit`.`updatedAt` AS `LearningUnit_updatedAt` FROM `learning_units` `LearningUnit` WHERE ((`LearningUnit`.`topicId` = ?) AND (`LearningUnit`.`title` = ?)) LIMIT 1 -- PARAMETERS: [1,"Unidad 2: Estructuras de control"]
query: START TRANSACTION
query: INSERT INTO `learning_units`(`id`, `title`, `description`, `difficulty`, `order`, `isActive`, `topicId`, `createdAt`, `updatedAt`) VALUES (DEFAULT, ?, ?, ?, ?, ?, ?, DEFAULT, DEFAULT) -- PARAMETERS: ["Unidad 2: Estructuras de control","Condicionales if/else y su lógica de decisión.","basico",1,1,1]
query: SELECT `LearningUnit`.`id` AS `LearningUnit_id`, `LearningUnit`.`difficulty` AS `LearningUnit_difficulty`, `LearningUnit`.`order` AS `LearningUnit_order`, `LearningUnit`.`isActive` AS `LearningUnit_isActive`, `LearningUnit`.`createdAt` AS `LearningUnit_createdAt`, `LearningUnit`.`updatedAt` AS `LearningUnit_updatedAt` FROM `learning_units` `LearningUnit` WHERE `LearningUnit`.`id` = ? -- PARAMETERS: [2]
query: COMMIT
  + creado: Unidad 2: Estructuras de control
query: SELECT `Prerequisite`.`id` AS `Prerequisite_id`, `Prerequisite`.`createdAt` AS `Prerequisite_createdAt`, `Prerequisite`.`updatedAt` AS `Prerequisite_updatedAt`, `Prerequisite`.`deletedAt` AS `Prerequisite_deletedAt`, `Prerequisite`.`targetUnitId` AS `Prerequisite_targetUnitId`, `Prerequisite`.`requiredUnitId` AS `Prerequisite_requiredUnitId`, `Prerequisite`.`minMasteryRequired` AS `Prerequisite_minMasteryRequired` FROM `prerequisites` `Prerequisite` WHERE ( ((`Prerequisite`.`targetUnitId` = ?) AND (`Prerequisite`.`requiredUnitId` = ?)) ) AND ( `Prerequisite`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: [2,1]
query: START TRANSACTION
query: INSERT INTO `prerequisites`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `targetUnitId`, `requiredUnitId`, `minMasteryRequired`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?) -- PARAMETERS: [2,1,60]
query: SELECT `Prerequisite`.`id` AS `Prerequisite_id`, `Prerequisite`.`createdAt` AS `Prerequisite_createdAt`, `Prerequisite`.`updatedAt` AS `Prerequisite_updatedAt`, `Prerequisite`.`deletedAt` AS `Prerequisite_deletedAt`, `Prerequisite`.`minMasteryRequired` AS `Prerequisite_minMasteryRequired` FROM `prerequisites` `Prerequisite` WHERE ( `Prerequisite`.`id` = ? ) AND ( `Prerequisite`.`deletedAt` IS NULL ) -- PARAMETERS: [1]
query: COMMIT
  + creado: Unidad 2 requiere Unidad 1 (mastery ≥ 60%)

Contenido teórico
query: SELECT `Content`.`id` AS `Content_id`, `Content`.`createdAt` AS `Content_createdAt`, `Content`.`updatedAt` AS `Content_updatedAt`, `Content`.`deletedAt` AS `Content_deletedAt`, `Content`.`learningUnitId` AS `Content_learningUnitId`, `Content`.`title` AS `Content_title`, `Content`.`type` AS `Content_type`, `Content`.`body` AS `Content_body`, `Content`.`metadata` AS `Content_metadata`, `Content`.`order` AS `Content_order`, `Content`.`isVisible` AS `Content_isVisible` FROM `contents` `Content` WHERE ( ((`Content`.`learningUnitId` = ?) AND (`Content`.`title` = ?)) ) AND ( `Content`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: [1,"Introducción a las variables"]
query: START TRANSACTION
query: INSERT INTO `contents`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `learningUnitId`, `title`, `type`, `body`, `metadata`, `order`, `isVisible`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, DEFAULT, ?, ?) -- PARAMETERS: [1,"Introducción a las variables","markdown","# Variables\n\nUna **variable** es un espacio de memoria con un nombre, donde se guarda un valor que puede cambiar durante la ejecución del programa.\n\n```javascript\nlet edad = 20;\nconst nombre = \"Ana\";\n```\n\n`let` declara una variable que puede reasignarse; `const` declara una que no.",0,1]
query: SELECT `Content`.`id` AS `Content_id`, `Content`.`createdAt` AS `Content_createdAt`, `Content`.`updatedAt` AS `Content_updatedAt`, `Content`.`deletedAt` AS `Content_deletedAt`, `Content`.`order` AS `Content_order`, `Content`.`isVisible` AS `Content_isVisible` FROM `contents` `Content` WHERE ( `Content`.`id` = ? ) AND ( `Content`.`deletedAt` IS NULL ) -- PARAMETERS: [1]
query: COMMIT
  + creado: Introducción a las variables (Unidad 1)
query: SELECT `Content`.`id` AS `Content_id`, `Content`.`createdAt` AS `Content_createdAt`, `Content`.`updatedAt` AS `Content_updatedAt`, `Content`.`deletedAt` AS `Content_deletedAt`, `Content`.`learningUnitId` AS `Content_learningUnitId`, `Content`.`title` AS `Content_title`, `Content`.`type` AS `Content_type`, `Content`.`body` AS `Content_body`, `Content`.`metadata` AS `Content_metadata`, `Content`.`order` AS `Content_order`, `Content`.`isVisible` AS `Content_isVisible` FROM `contents` `Content` WHERE ( ((`Content`.`learningUnitId` = ?) AND (`Content`.`title` = ?)) ) AND ( `Content`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: [2,"Condicionales if/else"]
query: START TRANSACTION
query: INSERT INTO `contents`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `learningUnitId`, `title`, `type`, `body`, `metadata`, `order`, `isVisible`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, DEFAULT, ?, ?) -- PARAMETERS: [2,"Condicionales if/else","markdown","# Condicionales\n\nUn condicional ejecuta un bloque de código solo si una condición es verdadera.\n\n```javascript\nif (edad >= 18) {\n  console.log(\"mayor de edad\");\n} else {\n  console.log(\"menor de edad\");\n}\n```",0,1]
query: SELECT `Content`.`id` AS `Content_id`, `Content`.`createdAt` AS `Content_createdAt`, `Content`.`updatedAt` AS `Content_updatedAt`, `Content`.`deletedAt` AS `Content_deletedAt`, `Content`.`order` AS `Content_order`, `Content`.`isVisible` AS `Content_isVisible` FROM `contents` `Content` WHERE ( `Content`.`id` = ? ) AND ( `Content`.`deletedAt` IS NULL ) -- PARAMETERS: [2]
query: COMMIT
  + creado: Condicionales if/else (Unidad 2)

Tipo de actividad y actividades (MCQ, CODING, FILL_CODE)
query: SELECT `ActivityType`.`id` AS `ActivityType_id`, `ActivityType`.`createdAt` AS `ActivityType_createdAt`, `ActivityType`.`updatedAt` AS `ActivityType_updatedAt`, `ActivityType`.`deletedAt` AS `ActivityType_deletedAt`, `ActivityType`.`name` AS `ActivityType_name`, `ActivityType`.`code` AS `ActivityType_code`, `ActivityType`.`autoGradable` AS `ActivityType_autoGradable`, `ActivityType`.`baseWeight` AS `ActivityType_baseWeight`, `ActivityType`.`configSchema` AS `ActivityType_configSchema` FROM `activity_types` `ActivityType` WHERE ( ((`ActivityType`.`code` = ?)) ) AND ( `ActivityType`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: ["DEMO-AUTO"]
query: START TRANSACTION
query: INSERT INTO `activity_types`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `name`, `code`, `autoGradable`, `baseWeight`, `configSchema`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, DEFAULT) -- PARAMETERS: ["Ejercicio Autocalificable (Demo)","DEMO-AUTO",true,1]
query: SELECT `ActivityType`.`id` AS `ActivityType_id`, `ActivityType`.`createdAt` AS `ActivityType_createdAt`, `ActivityType`.`updatedAt` AS `ActivityType_updatedAt`, `ActivityType`.`deletedAt` AS `ActivityType_deletedAt`, `ActivityType`.`autoGradable` AS `ActivityType_autoGradable`, `ActivityType`.`baseWeight` AS `ActivityType_baseWeight` FROM `activity_types` `ActivityType` WHERE ( `ActivityType`.`id` = ? ) AND ( `ActivityType`.`deletedAt` IS NULL ) -- PARAMETERS: [1]
query: COMMIT
  + creado: Ejercicio Autocalificable (Demo)
query: SELECT DISTINCT `distinctAlias`.`Activity_id` AS `ids_Activity_id` FROM (SELECT `Activity`.`id` AS `Activity_id`, `Activity`.`createdAt` AS `Activity_createdAt`, `Activity`.`updatedAt` AS `Activity_updatedAt`, `Activity`.`deletedAt` AS `Activity_deletedAt`, `Activity`.`learningUnitId` AS `Activity_learningUnitId`, `Activity`.`activityTypeId` AS `Activity_activityTypeId`, `Activity`.`createdBy` AS `Activity_createdBy`, `Activity`.`title` AS `Activity_title`, `Activity`.`description` AS `Activity_description`, `Activity`.`difficulty` AS `Activity_difficulty`, `Activity`.`totalPoints` AS `Activity_totalPoints`, `Activity`.`passingScore` AS `Activity_passingScore`, `Activity`.`attemptsAllowed` AS `Activity_attemptsAllowed`, `Activity`.`timeLimit` AS `Activity_timeLimit`, `Activity`.`order` AS `Activity_order`, `Activity`.`status` AS `Activity_status`, `Activity`.`isRequired` AS `Activity_isRequired`, `Activity`.`adaptiveWeight` AS `Activity_adaptiveWeight`, `Activity`.`publishedAt` AS `Activity_publishedAt`, `Activity__activityType`.`id` AS `Activity__activityType_id`, `Activity__activityType`.`createdAt` AS `Activity__activityType_createdAt`, `Activity__activityType`.`updatedAt` AS `Activity__activityType_updatedAt`, `Activity__activityType`.`deletedAt` AS `Activity__activityType_deletedAt`, `Activity__activityType`.`name` AS `Activity__activityType_name`, `Activity__activityType`.`code` AS `Activity__activityType_code`, `Activity__activityType`.`autoGradable` AS `Activity__activityType_autoGradable`, `Activity__activityType`.`baseWeight` AS `Activity__activityType_baseWeight`, `Activity__activityType`.`configSchema` AS `Activity__activityType_configSchema` FROM `activities` `Activity` LEFT JOIN `activity_types` `Activity__activityType` ON `Activity__activityType`.`id`=`Activity`.`activityTypeId` AND (`Activity__activityType`.`deletedAt` IS NULL) WHERE ( ((`Activity`.`learningUnitId` = ?) AND (`Activity`.`title` = ?)) ) AND ( `Activity`.`deletedAt` IS NULL )) `distinctAlias` ORDER BY `Activity_id` ASC LIMIT 1 -- PARAMETERS: [1,"Quiz: ¿Qué es una variable?"]
query: START TRANSACTION
query: INSERT INTO `activities`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `learningUnitId`, `activityTypeId`, `createdBy`, `title`, `description`, `difficulty`, `totalPoints`, `passingScore`, `attemptsAllowed`, `timeLimit`, `order`, `status`, `isRequired`, `adaptiveWeight`, `publishedAt`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, ?, ?, ?, ?, ?) -- PARAMETERS: [1,1,1,"Quiz: ¿Qué es una variable?","Pregunta de opción múltiple sobre declaración de variables.","basico",10,60,3,0,"published",false,1,"2026-09-25T20:46:09.131Z"]
query: SELECT `Activity`.`id` AS `Activity_id`, `Activity`.`createdAt` AS `Activity_createdAt`, `Activity`.`updatedAt` AS `Activity_updatedAt`, `Activity`.`deletedAt` AS `Activity_deletedAt`, `Activity`.`difficulty` AS `Activity_difficulty`, `Activity`.`totalPoints` AS `Activity_totalPoints`, `Activity`.`passingScore` AS `Activity_passingScore`, `Activity`.`attemptsAllowed` AS `Activity_attemptsAllowed`, `Activity`.`order` AS `Activity_order`, `Activity`.`status` AS `Activity_status`, `Activity`.`isRequired` AS `Activity_isRequired`, `Activity`.`adaptiveWeight` AS `Activity_adaptiveWeight` FROM `activities` `Activity` WHERE ( `Activity`.`id` = ? ) AND ( `Activity`.`deletedAt` IS NULL ) -- PARAMETERS: [1]
query: COMMIT
  + creado: Quiz: ¿Qué es una variable? (MCQ)
query: SELECT `ActivityQuestion`.`id` AS `ActivityQuestion_id`, `ActivityQuestion`.`createdAt` AS `ActivityQuestion_createdAt`, `ActivityQuestion`.`updatedAt` AS `ActivityQuestion_updatedAt`, `ActivityQuestion`.`deletedAt` AS `ActivityQuestion_deletedAt`, `ActivityQuestion`.`activityId` AS `ActivityQuestion_activityId`, `ActivityQuestion`.`type` AS `ActivityQuestion_type`, `ActivityQuestion`.`question` AS `ActivityQuestion_question`, `ActivityQuestion`.`points` AS `ActivityQuestion_points`, `ActivityQuestion`.`order` AS `ActivityQuestion_order`, `ActivityQuestion`.`config` AS `ActivityQuestion_config` FROM `activity_questions` `ActivityQuestion` WHERE ( ((`ActivityQuestion`.`activityId` = ?)) ) AND ( `ActivityQuestion`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: [1]
query: START TRANSACTION
query: INSERT INTO `activity_questions`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `activityId`, `type`, `question`, `points`, `order`, `config`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?) -- PARAMETERS: [1,"mcq","¿Cuál de las siguientes es una declaración válida de variable en JavaScript?",10,0,"{\"options\":[{\"id\":\"a\",\"text\":\"let x = 5;\"},{\"id\":\"b\",\"text\":\"variable x = 5\"},{\"id\":\"c\",\"text\":\"int x = 5;\"},{\"id\":\"d\",\"text\":\"5 = x;\"}],\"correctAnswerId\":\"a\",\"explanation\":\"\\\"let\\\" es la forma correcta de declarar una variable reasignable en JavaScript.\"}"]
query: SELECT `ActivityQuestion`.`id` AS `ActivityQuestion_id`, `ActivityQuestion`.`createdAt` AS `ActivityQuestion_createdAt`, `ActivityQuestion`.`updatedAt` AS `ActivityQuestion_updatedAt`, `ActivityQuestion`.`deletedAt` AS `ActivityQuestion_deletedAt`, `ActivityQuestion`.`points` AS `ActivityQuestion_points`, `ActivityQuestion`.`order` AS `ActivityQuestion_order` FROM `activity_questions` `ActivityQuestion` WHERE ( `ActivityQuestion`.`id` = ? ) AND ( `ActivityQuestion`.`deletedAt` IS NULL ) -- PARAMETERS: [1]
query: COMMIT
  + creado: pregunta MCQ de la actividad
query: SELECT DISTINCT `distinctAlias`.`Activity_id` AS `ids_Activity_id` FROM (SELECT `Activity`.`id` AS `Activity_id`, `Activity`.`createdAt` AS `Activity_createdAt`, `Activity`.`updatedAt` AS `Activity_updatedAt`, `Activity`.`deletedAt` AS `Activity_deletedAt`, `Activity`.`learningUnitId` AS `Activity_learningUnitId`, `Activity`.`activityTypeId` AS `Activity_activityTypeId`, `Activity`.`createdBy` AS `Activity_createdBy`, `Activity`.`title` AS `Activity_title`, `Activity`.`description` AS `Activity_description`, `Activity`.`difficulty` AS `Activity_difficulty`, `Activity`.`totalPoints` AS `Activity_totalPoints`, `Activity`.`passingScore` AS `Activity_passingScore`, `Activity`.`attemptsAllowed` AS `Activity_attemptsAllowed`, `Activity`.`timeLimit` AS `Activity_timeLimit`, `Activity`.`order` AS `Activity_order`, `Activity`.`status` AS `Activity_status`, `Activity`.`isRequired` AS `Activity_isRequired`, `Activity`.`adaptiveWeight` AS `Activity_adaptiveWeight`, `Activity`.`publishedAt` AS `Activity_publishedAt`, `Activity__activityType`.`id` AS `Activity__activityType_id`, `Activity__activityType`.`createdAt` AS `Activity__activityType_createdAt`, `Activity__activityType`.`updatedAt` AS `Activity__activityType_updatedAt`, `Activity__activityType`.`deletedAt` AS `Activity__activityType_deletedAt`, `Activity__activityType`.`name` AS `Activity__activityType_name`, `Activity__activityType`.`code` AS `Activity__activityType_code`, `Activity__activityType`.`autoGradable` AS `Activity__activityType_autoGradable`, `Activity__activityType`.`baseWeight` AS `Activity__activityType_baseWeight`, `Activity__activityType`.`configSchema` AS `Activity__activityType_configSchema` FROM `activities` `Activity` LEFT JOIN `activity_types` `Activity__activityType` ON `Activity__activityType`.`id`=`Activity`.`activityTypeId` AND (`Activity__activityType`.`deletedAt` IS NULL) WHERE ( ((`Activity`.`learningUnitId` = ?) AND (`Activity`.`title` = ?)) ) AND ( `Activity`.`deletedAt` IS NULL )) `distinctAlias` ORDER BY `Activity_id` ASC LIMIT 1 -- PARAMETERS: [1,"Ejercicio: Suma de dos números"]
query: START TRANSACTION
query: INSERT INTO `activities`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `learningUnitId`, `activityTypeId`, `createdBy`, `title`, `description`, `difficulty`, `totalPoints`, `passingScore`, `attemptsAllowed`, `timeLimit`, `order`, `status`, `isRequired`, `adaptiveWeight`, `publishedAt`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, ?, ?, ?, ?, ?) -- PARAMETERS: [1,1,1,"Ejercicio: Suma de dos números","Lee dos números desde la entrada estándar (uno por línea) e imprime su suma.","basico",20,60,3,1,"published",false,1,"2026-09-25T20:46:09.162Z"]
query: SELECT `Activity`.`id` AS `Activity_id`, `Activity`.`createdAt` AS `Activity_createdAt`, `Activity`.`updatedAt` AS `Activity_updatedAt`, `Activity`.`deletedAt` AS `Activity_deletedAt`, `Activity`.`difficulty` AS `Activity_difficulty`, `Activity`.`totalPoints` AS `Activity_totalPoints`, `Activity`.`passingScore` AS `Activity_passingScore`, `Activity`.`attemptsAllowed` AS `Activity_attemptsAllowed`, `Activity`.`order` AS `Activity_order`, `Activity`.`status` AS `Activity_status`, `Activity`.`isRequired` AS `Activity_isRequired`, `Activity`.`adaptiveWeight` AS `Activity_adaptiveWeight` FROM `activities` `Activity` WHERE ( `Activity`.`id` = ? ) AND ( `Activity`.`deletedAt` IS NULL ) -- PARAMETERS: [2]
query: COMMIT
  + creado: Ejercicio: Suma de dos números (CODING)
query: SELECT `ActivityQuestion`.`id` AS `ActivityQuestion_id`, `ActivityQuestion`.`createdAt` AS `ActivityQuestion_createdAt`, `ActivityQuestion`.`updatedAt` AS `ActivityQuestion_updatedAt`, `ActivityQuestion`.`deletedAt` AS `ActivityQuestion_deletedAt`, `ActivityQuestion`.`activityId` AS `ActivityQuestion_activityId`, `ActivityQuestion`.`type` AS `ActivityQuestion_type`, `ActivityQuestion`.`question` AS `ActivityQuestion_question`, `ActivityQuestion`.`points` AS `ActivityQuestion_points`, `ActivityQuestion`.`order` AS `ActivityQuestion_order`, `ActivityQuestion`.`config` AS `ActivityQuestion_config` FROM `activity_questions` `ActivityQuestion` WHERE ( ((`ActivityQuestion`.`activityId` = ?)) ) AND ( `ActivityQuestion`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: [2]
query: START TRANSACTION
query: INSERT INTO `activity_questions`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `activityId`, `type`, `question`, `points`, `order`, `config`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?) -- PARAMETERS: [2,"coding","Escribe un programa en JavaScript que lea dos números (uno por línea) desde la entrada estándar e imprima su suma.",20,0,"{\"language\":\"javascript\",\"testCases\":[{\"label\":\"público\",\"input\":\"5\\n3\",\"expected\":\"8\",\"isPublic\":true},{\"label\":\"oculto\",\"input\":\"10\\n20\",\"expected\":\"30\",\"isPublic\":false}]}"]
query: SELECT `ActivityQuestion`.`id` AS `ActivityQuestion_id`, `ActivityQuestion`.`createdAt` AS `ActivityQuestion_createdAt`, `ActivityQuestion`.`updatedAt` AS `ActivityQuestion_updatedAt`, `ActivityQuestion`.`deletedAt` AS `ActivityQuestion_deletedAt`, `ActivityQuestion`.`points` AS `ActivityQuestion_points`, `ActivityQuestion`.`order` AS `ActivityQuestion_order` FROM `activity_questions` `ActivityQuestion` WHERE ( `ActivityQuestion`.`id` = ? ) AND ( `ActivityQuestion`.`deletedAt` IS NULL ) -- PARAMETERS: [2]
query: COMMIT
  + creado: pregunta CODING de la actividad (con testCase público)
query: SELECT DISTINCT `distinctAlias`.`Activity_id` AS `ids_Activity_id` FROM (SELECT `Activity`.`id` AS `Activity_id`, `Activity`.`createdAt` AS `Activity_createdAt`, `Activity`.`updatedAt` AS `Activity_updatedAt`, `Activity`.`deletedAt` AS `Activity_deletedAt`, `Activity`.`learningUnitId` AS `Activity_learningUnitId`, `Activity`.`activityTypeId` AS `Activity_activityTypeId`, `Activity`.`createdBy` AS `Activity_createdBy`, `Activity`.`title` AS `Activity_title`, `Activity`.`description` AS `Activity_description`, `Activity`.`difficulty` AS `Activity_difficulty`, `Activity`.`totalPoints` AS `Activity_totalPoints`, `Activity`.`passingScore` AS `Activity_passingScore`, `Activity`.`attemptsAllowed` AS `Activity_attemptsAllowed`, `Activity`.`timeLimit` AS `Activity_timeLimit`, `Activity`.`order` AS `Activity_order`, `Activity`.`status` AS `Activity_status`, `Activity`.`isRequired` AS `Activity_isRequired`, `Activity`.`adaptiveWeight` AS `Activity_adaptiveWeight`, `Activity`.`publishedAt` AS `Activity_publishedAt`, `Activity__activityType`.`id` AS `Activity__activityType_id`, `Activity__activityType`.`createdAt` AS `Activity__activityType_createdAt`, `Activity__activityType`.`updatedAt` AS `Activity__activityType_updatedAt`, `Activity__activityType`.`deletedAt` AS `Activity__activityType_deletedAt`, `Activity__activityType`.`name` AS `Activity__activityType_name`, `Activity__activityType`.`code` AS `Activity__activityType_code`, `Activity__activityType`.`autoGradable` AS `Activity__activityType_autoGradable`, `Activity__activityType`.`baseWeight` AS `Activity__activityType_baseWeight`, `Activity__activityType`.`configSchema` AS `Activity__activityType_configSchema` FROM `activities` `Activity` LEFT JOIN `activity_types` `Activity__activityType` ON `Activity__activityType`.`id`=`Activity`.`activityTypeId` AND (`Activity__activityType`.`deletedAt` IS NULL) WHERE ( ((`Activity`.`learningUnitId` = ?) AND (`Activity`.`title` = ?)) ) AND ( `Activity`.`deletedAt` IS NULL )) `distinctAlias` ORDER BY `Activity_id` ASC LIMIT 1 -- PARAMETERS: [2,"Completa el condicional"]
query: START TRANSACTION
query: INSERT INTO `activities`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `learningUnitId`, `activityTypeId`, `createdBy`, `title`, `description`, `difficulty`, `totalPoints`, `passingScore`, `attemptsAllowed`, `timeLimit`, `order`, `status`, `isRequired`, `adaptiveWeight`, `publishedAt`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, ?, ?, ?, ?, ?) -- PARAMETERS: [2,1,1,"Completa el condicional","Rellena los espacios en blanco del código para que la lógica sea correcta.","basico",10,60,3,0,"published",false,1,"2026-09-25T20:46:09.196Z"]
query: SELECT `Activity`.`id` AS `Activity_id`, `Activity`.`createdAt` AS `Activity_createdAt`, `Activity`.`updatedAt` AS `Activity_updatedAt`, `Activity`.`deletedAt` AS `Activity_deletedAt`, `Activity`.`difficulty` AS `Activity_difficulty`, `Activity`.`totalPoints` AS `Activity_totalPoints`, `Activity`.`passingScore` AS `Activity_passingScore`, `Activity`.`attemptsAllowed` AS `Activity_attemptsAllowed`, `Activity`.`order` AS `Activity_order`, `Activity`.`status` AS `Activity_status`, `Activity`.`isRequired` AS `Activity_isRequired`, `Activity`.`adaptiveWeight` AS `Activity_adaptiveWeight` FROM `activities` `Activity` WHERE ( `Activity`.`id` = ? ) AND ( `Activity`.`deletedAt` IS NULL ) -- PARAMETERS: [3]
query: COMMIT
  + creado: Completa el condicional (FILL_CODE)
query: SELECT `ActivityQuestion`.`id` AS `ActivityQuestion_id`, `ActivityQuestion`.`createdAt` AS `ActivityQuestion_createdAt`, `ActivityQuestion`.`updatedAt` AS `ActivityQuestion_updatedAt`, `ActivityQuestion`.`deletedAt` AS `ActivityQuestion_deletedAt`, `ActivityQuestion`.`activityId` AS `ActivityQuestion_activityId`, `ActivityQuestion`.`type` AS `ActivityQuestion_type`, `ActivityQuestion`.`question` AS `ActivityQuestion_question`, `ActivityQuestion`.`points` AS `ActivityQuestion_points`, `ActivityQuestion`.`order` AS `ActivityQuestion_order`, `ActivityQuestion`.`config` AS `ActivityQuestion_config` FROM `activity_questions` `ActivityQuestion` WHERE ( ((`ActivityQuestion`.`activityId` = ?)) ) AND ( `ActivityQuestion`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: [3]
query: START TRANSACTION
query: INSERT INTO `activity_questions`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `activityId`, `type`, `question`, `points`, `order`, `config`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?) -- PARAMETERS: [3,"fill_code","Completa el condicional para que imprima \"mayor de edad\" cuando edad sea 18 o más.",10,0,"{\"codeTemplate\":\"if (edad ___b1___ 18) {\\n  console.log(\\\"mayor de edad\\\");\\n} ___b2___ {\\n  console.log(\\\"menor de edad\\\");\\n}\",\"blanks\":[{\"id\":\"b1\",\"answer\":\">=\"},{\"id\":\"b2\",\"answer\":\"else\"}]}"]
query: SELECT `ActivityQuestion`.`id` AS `ActivityQuestion_id`, `ActivityQuestion`.`createdAt` AS `ActivityQuestion_createdAt`, `ActivityQuestion`.`updatedAt` AS `ActivityQuestion_updatedAt`, `ActivityQuestion`.`deletedAt` AS `ActivityQuestion_deletedAt`, `ActivityQuestion`.`points` AS `ActivityQuestion_points`, `ActivityQuestion`.`order` AS `ActivityQuestion_order` FROM `activity_questions` `ActivityQuestion` WHERE ( `ActivityQuestion`.`id` = ? ) AND ( `ActivityQuestion`.`deletedAt` IS NULL ) -- PARAMETERS: [3]
query: COMMIT
  + creado: pregunta FILL_CODE de la actividad
query: SELECT DISTINCT `distinctAlias`.`Activity_id` AS `ids_Activity_id` FROM (SELECT `Activity`.`id` AS `Activity_id`, `Activity`.`createdAt` AS `Activity_createdAt`, `Activity`.`updatedAt` AS `Activity_updatedAt`, `Activity`.`deletedAt` AS `Activity_deletedAt`, `Activity`.`learningUnitId` AS `Activity_learningUnitId`, `Activity`.`activityTypeId` AS `Activity_activityTypeId`, `Activity`.`createdBy` AS `Activity_createdBy`, `Activity`.`title` AS `Activity_title`, `Activity`.`description` AS `Activity_description`, `Activity`.`difficulty` AS `Activity_difficulty`, `Activity`.`totalPoints` AS `Activity_totalPoints`, `Activity`.`passingScore` AS `Activity_passingScore`, `Activity`.`attemptsAllowed` AS `Activity_attemptsAllowed`, `Activity`.`timeLimit` AS `Activity_timeLimit`, `Activity`.`order` AS `Activity_order`, `Activity`.`status` AS `Activity_status`, `Activity`.`isRequired` AS `Activity_isRequired`, `Activity`.`adaptiveWeight` AS `Activity_adaptiveWeight`, `Activity`.`publishedAt` AS `Activity_publishedAt`, `Activity__activityType`.`id` AS `Activity__activityType_id`, `Activity__activityType`.`createdAt` AS `Activity__activityType_createdAt`, `Activity__activityType`.`updatedAt` AS `Activity__activityType_updatedAt`, `Activity__activityType`.`deletedAt` AS `Activity__activityType_deletedAt`, `Activity__activityType`.`name` AS `Activity__activityType_name`, `Activity__activityType`.`code` AS `Activity__activityType_code`, `Activity__activityType`.`autoGradable` AS `Activity__activityType_autoGradable`, `Activity__activityType`.`baseWeight` AS `Activity__activityType_baseWeight`, `Activity__activityType`.`configSchema` AS `Activity__activityType_configSchema` FROM `activities` `Activity` LEFT JOIN `activity_types` `Activity__activityType` ON `Activity__activityType`.`id`=`Activity`.`activityTypeId` AND (`Activity__activityType`.`deletedAt` IS NULL) WHERE ( ((`Activity`.`learningUnitId` = ?) AND (`Activity`.`title` = ?)) ) AND ( `Activity`.`deletedAt` IS NULL )) `distinctAlias` ORDER BY `Activity_id` ASC LIMIT 1 -- PARAMETERS: [2,"Página de bienvenida (HTML y CSS)"]
query: START TRANSACTION
query: INSERT INTO `activities`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `learningUnitId`, `activityTypeId`, `createdBy`, `title`, `description`, `difficulty`, `totalPoints`, `passingScore`, `attemptsAllowed`, `timeLimit`, `order`, `status`, `isRequired`, `adaptiveWeight`, `publishedAt`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?, ?, DEFAULT, ?, ?, ?, ?, ?) -- PARAMETERS: [2,1,1,"Página de bienvenida (HTML y CSS)","Escribe el HTML y el CSS de una página de bienvenida.","basico",20,60,3,2,"published",false,1,"2026-09-25T20:46:09.215Z"]
query: SELECT `Activity`.`id` AS `Activity_id`, `Activity`.`createdAt` AS `Activity_createdAt`, `Activity`.`updatedAt` AS `Activity_updatedAt`, `Activity`.`deletedAt` AS `Activity_deletedAt`, `Activity`.`difficulty` AS `Activity_difficulty`, `Activity`.`totalPoints` AS `Activity_totalPoints`, `Activity`.`passingScore` AS `Activity_passingScore`, `Activity`.`attemptsAllowed` AS `Activity_attemptsAllowed`, `Activity`.`order` AS `Activity_order`, `Activity`.`status` AS `Activity_status`, `Activity`.`isRequired` AS `Activity_isRequired`, `Activity`.`adaptiveWeight` AS `Activity_adaptiveWeight` FROM `activities` `Activity` WHERE ( `Activity`.`id` = ? ) AND ( `Activity`.`deletedAt` IS NULL ) -- PARAMETERS: [4]
query: COMMIT
  + creado: Página de bienvenida (HTML_CSS)
query: SELECT `ActivityQuestion`.`id` AS `ActivityQuestion_id`, `ActivityQuestion`.`createdAt` AS `ActivityQuestion_createdAt`, `ActivityQuestion`.`updatedAt` AS `ActivityQuestion_updatedAt`, `ActivityQuestion`.`deletedAt` AS `ActivityQuestion_deletedAt`, `ActivityQuestion`.`activityId` AS `ActivityQuestion_activityId`, `ActivityQuestion`.`type` AS `ActivityQuestion_type`, `ActivityQuestion`.`question` AS `ActivityQuestion_question`, `ActivityQuestion`.`points` AS `ActivityQuestion_points`, `ActivityQuestion`.`order` AS `ActivityQuestion_order`, `ActivityQuestion`.`config` AS `ActivityQuestion_config` FROM `activity_questions` `ActivityQuestion` WHERE ( ((`ActivityQuestion`.`activityId` = ?)) ) AND ( `ActivityQuestion`.`deletedAt` IS NULL ) LIMIT 1 -- PARAMETERS: [4]
query: START TRANSACTION
query: INSERT INTO `activity_questions`(`id`, `createdAt`, `updatedAt`, `deletedAt`, `activityId`, `type`, `question`, `points`, `order`, `config`) VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, ?, ?, ?, ?, ?, ?) -- PARAMETERS: [4,"html_css","Crea una página de bienvenida: un título principal (h1) con el texto «Hola», una lista con al menos dos elementos, una imagen con su texto alternativo, y el título en color rojo.",20,0,"{\"starterHtml\":\"<h1></h1>\\n\",\"starterCss\":\"\",\"rules\":[{\"id\":\"titulo\",\"label\":\"Hay un h1 con el texto «Hola»\",\"hint\":\"Escribe Hola dentro del h1\",\"isPublic\":true,\"weight\":20,\"check\":{\"kind\":\"text\",\"selector\":\"h1\",\"mode\":\"contains\",\"value\":\"Hola\"}},{\"id\":\"lista\",\"label\":\"Hay una lista (ul) con al menos 2 elementos\",\"isPublic\":true,\"weight\":20,\"check\":{\"kind\":\"element_count\",\"selector\":\"ul > li\",\"min\":2}},{\"id\":\"imagen\",\"label\":\"Hay una imagen\",\"isPublic\":false,\"weight\":20,\"check\":{\"kind\":\"element_exists\",\"selector\":\"img\"}},{\"id\":\"alt\",\"label\":\"Todas las imágenes tienen alt\",\"isPublic\":false,\"weight\":20,\"check\":{\"kind\":\"a11y\",\"check\":\"img_alt\"}},{\"id\":\"color\",\"label\":\"El título es rojo\",\"isPublic\":false,\"weight\":20,\"check\":{\"kind\":\"css_property\",\"selector\":\"h1\",\"property\":\"color\",\"oneOf\":[\"red\",\"#ff0000\"]}}],\"modelSolution\":{\"html\":\"<h1>Hola</h1>\\n<ul>\\n  <li>Uno</li>\\n  <li>Dos</li>\\n</ul>\\n<img src=\\\"logo.png\\\" alt=\\\"Logo de STIRE\\\">\\n\",\"css\":\"h1 { color: red; }\\n\"}}"]
query: SELECT `ActivityQuestion`.`id` AS `ActivityQuestion_id`, `ActivityQuestion`.`createdAt` AS `ActivityQuestion_createdAt`, `ActivityQuestion`.`updatedAt` AS `ActivityQuestion_updatedAt`, `ActivityQuestion`.`deletedAt` AS `ActivityQuestion_deletedAt`, `ActivityQuestion`.`points` AS `ActivityQuestion_points`, `ActivityQuestion`.`order` AS `ActivityQuestion_order` FROM `activity_questions` `ActivityQuestion` WHERE ( `ActivityQuestion`.`id` = ? ) AND ( `ActivityQuestion`.`deletedAt` IS NULL ) -- PARAMETERS: [4]
query: COMMIT
  + creado: pregunta HTML_CSS de la actividad

✅ Seed de demo completo. Credenciales:
   docente.demo@stire.local       / Demo1234!
   estudiante1.demo@stire.local   / Demo1234!
   estudiante2.demo@stire.local   / Demo1234!
   estudiante3.demo@stire.local   / Demo1234!
   Clase: Fundamentos de Algoritmia — Demo (código DEMO-STIRE-01)

[verify:clean 6] npm run build

> stire@0.0.1 build
> nest build


[verify:clean] setup completo. Base de datos de verificacion: stire_verify_clean (puerto 3097). Continua scripts/verify-clean-server-check.js.
◇ injected env (20) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
login real contra el servidor recien levantado (docente de demo)
  login OK para docente.demo@stire.local (token recibido)
verificacion de datos sembrados via GET /enrollment/my
  OK, status 200
apagado del servidor

[verify:clean:server-check] limpieza: eliminar base de datos de verificacion stire_verify_clean

[verify:clean] TODO EN VERDE: npm ci -> migration:run -> db:seed:demo -> build -> start -> login real -> apagado.
exit=0
```

---

## Fase 26, Parte A y plan — el lenguaje de los ejercicios se valida al crearlos · 25 de Septiembre de 2026

- **Plan de la Fase 26** (editor con CodeMirror 6, resaltado y selector de lenguaje) escrito para Antigravity en `docs/antigravity/PLAN_IMPLEMENTACION.md`; el plan de la Fase 25 se archivó en
  `docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-25.md` con la nota de la auditoría.
- **Defecto cerrado (Parte A):** una pregunta `coding` podía crearse con `language: "python"` (o cualquier otro) y **cada intento de cada estudiante** fallaba con «Sandbox endurecido: solo
  JavaScript». Ahora `POST /activity-questions` responde `400` con el motivo («El juez solo ejecuta JavaScript por ahora…»); sin `language` se usa JavaScript, como antes. `fill_code` acepta un
  `language` **opcional** solo de resaltado (`javascript`, `python`, `html`, `css`, `sql`, `text`); otro valor → `400`. Las dos listas (qué ejecuta el juez y qué resalta el editor) viven separadas
  en `src/common/code-languages.ts`.
- **Pruebas:** 3 nuevas en `activity-questions.service.spec.ts` (python rechazado, sin lenguaje o `js` aceptado, `fill_code` válido/inválido). No cambia migraciones, `package-lock.json` ni scripts de arranque.

---

## Fase 25, A7 — el código de las lecciones se conserva y se cierra una vía de inyección en el renderizador · 25 de Septiembre de 2026

- **A7 (F24-07, F25-04):** el servidor dejaba de conservar los ejemplos de código de las lecciones (borraba `<script>` y `<button>`, codificaba `<`, `>` y `&` y añadía
  cierres de etiqueta), y con B0 el código se veía con entidades (`a &lt; b`). Ahora `sanitizeRichText` guarda los bloques ``` y el código en línea **tal cual** y solo
  sanea el resto (`src/content-rendering/code-segments.ts`). Es seguro porque los segmentos que el servidor no sanea son exactamente los que el frontend escapa: usa las
  mismas expresiones regulares y el mismo orden de dos pasadas que `formatMarkdown`, y **comprueba** después que el frontend segmentaría el resultado igual (si no, cae al
  saneado completo de antes).
- **Seguridad (hallazgo del fuzzing de A7, corregido):** `formatMarkdown` aplica reemplazos de texto (código en línea, títulos, listas) sobre HTML **ya saneado** y esos
  reemplazos insertan HTML con comillas; si caían dentro del valor de un atributo (por ejemplo un `title` con comillas invertidas) abrían el atributo y colaban otros
  (`onclick`, `onload`…). Un docente podía usarlo contra sus estudiantes. Era anterior a esta fase y afectaba también a los datos ya guardados. Corrección: el HTML **final**
  pasa siempre por DOMPurify en el navegador (`frontend-nuxt/utils/sanitizeRenderedHtml.ts`, misma lista blanca que el servidor, nueva dependencia `dompurify`), lo que protege
  también lo guardado antes. El renderizador del Tutor no tenía el problema (escapa todo, comillas incluidas, antes de dar formato).
- **Pruebas:** `code-segments.spec.ts` (unitarias) y `code-segments.consistency.spec.ts`, que carga los **archivos reales** del frontend y comprueba, con 24 entradas adversariales
  y 4000 aleatorias (semilla fija), que el HTML final solo tiene etiquetas y atributos de la lista blanca. Sin la defensa del navegador esa prueba **falla**; con ella pasa, incluso
  con A7 desactivado (datos antiguos).

**Verificación (25/09):** Jest **73 suites, 702 tests** en verde; Chrome real **9/9** (los ejemplos de código se ven literales, un `<script>` o `<button onclick>` dentro de un bloque
es texto, seis lecciones hostiles no dejan ningún atributo ni etiqueta fuera de la lista blanca ni ejecutan nada al disparar `mouseover`/`click`/`load`/`error` en todo);
`npx nuxi typecheck` exit 0; `npm ci --dry-run` del frontend consistente. No cambia el `package-lock.json` de la raíz, migraciones ni scripts de arranque (`verify:clean` no aplica).
**Datos antiguos:** las lecciones guardadas antes de A7 conservan las entidades que el servidor les puso (`&lt;`): se ven así hasta que el docente las vuelva a guardar.

---

## Fase 25, Parte B — auditoría y correcciones · 25 de Septiembre de 2026

Antigravity entregó la Parte B (B0 a B3) en `feat/fase-25`. Claude Code la auditó en Chrome real contra una base desechable
(`docs/ReportesQA/REPORTE_AUDITORIA_QA_FASE25B_2026-09-25.md`): la seguridad de la vista previa (`sandbox=""` + CSP), el flujo del docente y el del estudiante
estaban bien; dos fallos reales se corrigieron en la misma rama (solo frontend):

- **F25-02 (alto): el ejercicio no se podía usar en un celular.** La página del ejercicio tenía alto fijo y `overflow-hidden`: en 375 px el editor quedaba fuera de
  pantalla (y de 24 px de alto) y «Entregar solución» cortado a la derecha. Afectaba también a la pantalla de código (que ya existía). Ahora, en móvil, la página se
  desplaza, el editor ocupa el 60 % de la pantalla y la barra superior se ajusta; el escritorio no cambia.
- **F25-01 (medio): «Probar» de la barra superior fallaba en silencio** (sin mensaje y con un error sin capturar) ante un 429 u otro error; solo el botón del panel
  lo explicaba. El error queda ahora en el store (`htmlCssRunError`) y el panel lo muestra sea cual sea el botón.
- F25-03: textos del constructor sin tildes.
- **F25-04 (pendiente, backend):** el código con `<`, `>` o `&` se ve con entidades (`a &lt; b`) porque el servidor lo codifica al guardar y B0 lo escapa otra vez;
  se resuelve con A7 (dejar de sanear los segmentos de código), ya seguro porque B0 está en `main`.
- El control del plan §25.7 «`err?.data?.message` debe dar cero» estaba mal planteado (es del plan): dan 15, todos anteriores a la Fase 25 y ya en `main`.

**Verificación (25/09):** Chrome real, 14 de 16 comprobaciones del flujo del estudiante (las otras dos son artefactos de la prueba: el símbolo ✖ y las Google Fonts de la
propia aplicación), 4 de 4 del móvil tras corregir, 9 de 10 del docente (la otra contaba peticiones `OPTIONS`); regresión de mcq, coding y fill_code en escritorio y móvil;
`npx nuxi typecheck` y `nuxt generate` en exit 0.

---

## Fase 25, Parte A (backend) — ejercicios de HTML y CSS calificados por reglas · 24 de Septiembre de 2026

Nuevo tipo de pregunta **`html_css`** (ADR 13): el estudiante escribe HTML y CSS y el **servidor** lo califica con reglas del docente usando jsdom, **sin ejecutar
nunca JavaScript del estudiante**. Plan y contrato en `docs/antigravity/PLAN_IMPLEMENTACION.md`; la Parte B (frontend) es de Antigravity.

- **Migración `AddHtmlCssQuestionType` (1789700000000):** amplía el enum de **las dos tablas** que lo repiten, `activity_questions` y `bank_questions`
  (probada con `migration:run`, `migration:revert` y `migration:run` otra vez).
- **Verificador de reglas** (`src/evaluation-engine/html-css/html-css.checker.ts`): 6 tipos de regla (existe/cuenta elementos, texto, atributo, propiedad CSS
  calculada, accesibilidad básica). Sin `runScripts` ni `resources` (nada se ejecuta ni sale a la red), sin expresiones regulares del docente (sin ReDoS), tope de
  50 000 caracteres y de 500 elementos por regla. jsdom aplica la cascada con especificidad y herencia; **no** evalúa `@media` ni calcula posiciones o tamaños.
- **Validación al crear** (`html-css.validator.ts`): esquema, límites, selectores válidos y **solución modelo obligatoria que debe cumplir el 100 % de las reglas**
  (una regla imposible se detecta al crear el ejercicio, no cuando un estudiante lo resuelve). Errores en 400 con el motivo en `error`.
- **Evaluador** con nota proporcional al peso; el feedback lista las etiquetas de las reglas públicas que fallaron y solo **cuántas** ocultas (sin `<` ni `>`, que el
  saneado PLAIN volvería entidades).
- **Vista del estudiante:** solo `starterHtml`, `starterCss`, `publicRules` y `hiddenRuleCount`; nunca los criterios, las reglas ocultas ni la solución modelo.
- **«Probar» sin gastar intento:** `POST /submissions/:id/run` acepta `{ html, css }` y evalúa solo las reglas públicas (el DTO ahora admite `code`, `html` o `css`; el
  servicio exige el campo del tipo de la pregunta).
- Ejercicio de demostración «Página de bienvenida (HTML y CSS)» en el seed (idempotente).
- **Descubierto al construirlo:** `jest.config.js` sustituye `@asamuzakjp/css-color` por un stub inerte (es ESM puro), así que Jest solo ve colores por nombre;
  `docs/testing/html-css-color-check.cjs` comprueba en **Node real** que `#F00`, `red` y `rgb(255,0,0)` son equivalentes (36 combinaciones). Requiere Node ≥ 22.12.
- **Pendiente A7 (a propósito):** dejar de sanear los bloques de código en el servidor (F24-07) **solo después de que B0 esté en `main`**: la pantalla del ejercicio del
  estudiante tiene su propia copia de `formatMarkdown` que no escapa nada, y hacerlo antes abriría un XSS.

**Verificación (24/09):** Jest **71 suites, 662 tests** en verde (antes 67/600; una corrida intermedia falló una prueba del sandbox por carga del equipo, pasa sola y en
la repetición); prueba de punta a punta por la API contra una base desechable **25/25** (incluida una nota 20/20 con color `#FF0000` y una entrega de 32 000 caracteres
en ~0,6 s); `migration:revert` y `migration:run` en ambas tablas; seed en dos pasadas = 1 actividad. `npm run verify:clean` desde un árbol nuevo sin enlaces
(`VERIFY_START_TIMEOUT_MS=180000`; el primer intento falló solo porque ese árbol no tenía `.env` y el servidor intentó entrar con el usuario de Windows; con `.env` de prueba):

```
[verify:clean 1] rm -rf node_modules dist
[verify:clean 2] npm ci (instalacion exacta desde package-lock.json)
added 957 packages, and audited 958 packages in 2m
[verify:clean 3] crear base de datos vacia de verificacion: stire_verify_clean
[verify:clean 4] migration:run contra la base de datos vacia
Migration InitialSchema1779000000000 has been executed successfully.
Migration AddEaseFactorToReviewSchedules1788999128282 has been executed successfully.
Migration AddApprovalToClasses1789000000000 has been executed successfully.
Migration AddActiveSubmissionConstraint1789100000000 has been executed successfully.
Migration CreateTutorCredentials1789200000000 has been executed successfully.
Migration CreateTutorSettings1789300000000 has been executed successfully.
Migration CreateRoleRequests1789400000000 has been executed successfully.
Migration AddMessageNotificationType1789500000000 has been executed successfully.
Migration AddPasswordReset1789600000000 has been executed successfully.
Migration AddHtmlCssQuestionType1789700000000 has been executed successfully.
[verify:clean 5] db:seed:demo contra la base de datos vacia
[verify:clean 6] npm run build
[verify:clean] setup completo. Base de datos de verificacion: stire_verify_clean (puerto 3097). Continua scripts/verify-clean-server-check.js.
login real contra el servidor recien levantado (docente de demo)
  login OK para docente.demo@stire.local (token recibido)
verificacion de datos sembrados via GET /enrollment/my
  OK, status 200
apagado del servidor
[verify:clean:server-check] limpieza: eliminar base de datos de verificacion stire_verify_clean
[verify:clean] TODO EN VERDE: npm ci -> migration:run -> db:seed:demo -> build -> start -> login real -> apagado.
```

**Observación de `verify:clean` (no corregida):** la segunda mitad (`verify-clean-server-check.js`) arranca el servidor con `process.env` **sin** los valores por defecto
`root/root` que la primera mitad sí usa para su propia conexión; sin un `.env` el servidor intenta entrar con el usuario del sistema operativo. En un checkout normal
existe `.env`, por eso no se había visto.

---

## Fase 24 — auditoría y correcciones (24b) · 24 de Septiembre de 2026

Antigravity entregó la Fase 24 en `feat/fase-24` (5 commits de funciones + informe). Claude Code la auditó en Chrome real contra una base
desechable (`docs/ReportesQA/REPORTE_AUDITORIA_QA_FASE24_2026-09-23.md`) y encontró cuatro fallos que impedían fusionarla; se corrigieron en la
misma rama (solo frontend, `src/` no cambió):

- **F24-01 (crítico):** el creador de ejercicios no enviaba ningún tipo desde un navegador real: los constructores de los otros tipos siguen en el DOM
  (ocultos) con campos `required` vacíos y el navegador bloqueaba el envío. `novalidate` en el formulario (la validación real la hacen
  `submitExercise()` y `validateAndGetConfig()`).
- **F24-02:** reordenar lecciones nunca funcionaba: `moveLesson` enviaba siempre el orden anterior (numeraba un arreglo que no había intercambiado).
- **F24-03:** los errores del servidor no se mostraban (26 sitios leían `data.message`; el backend responde en `error`): el usuario veía
  `[POST] "http://…": 409 Conflict`. Nuevo `messageOf()` en `useApiErrorMessage` y se usa en todas las pantallas de la fase.
- **F24-04:** el login había perdido «¿Olvidaste tu clave?» (la recuperación por correo quedó inalcanzable). Defecto del plan de la fase, escrito antes de
  construir esa función. Enlace restaurado; el texto de «pídeselo a tu docente o al administrador» queda como alternativa.
- **F24-05:** Escape no cerraba el modal de lecciones (no recibía el foco) ni el diálogo de registro tras un error (que además seguía absorbiendo los
  clics). Nuevo `useEscapeToClose` (escuchador en `document`) en los 14 diálogos de la fase; el modal de lecciones toma el foco al abrir.
- **F24-06:** la vista previa de lecciones ejecutaba el HTML del borrador del propio autor; ahora lo escapa (`formatMarkdown(…, { escapeHtml: true })`).

**Verificación (24/09, Chrome real, base desechable):** 25/25 comprobaciones (los 6 tipos se crean desde la pantalla sin atajos, ▼/▲ persisten en la base,
el motivo del servidor se ve, Escape cierra tras un error y los clics vuelven a llegar, la vista previa no ejecuta nada); `npx nuxi typecheck` exit 0;
`nuxt generate` sin errores. **Pendientes (no bloquean):** F24-07 (el saneado del servidor altera bloques de código con HTML: hacerlo después de convertir el
Markdown; recomendable antes de la Fase 25), F24-08 (dos copias de `formatMarkdown`), F24-09 y F24-10 (backend, ya conocidos).

---

## Ola del 23 de Septiembre (5ª pasada) — frontend estático · 23 de Septiembre de 2026

El frontend no usaba SSR (sin rutas de servidor ni `useFetch`; sesión en cookie leída en el navegador), así que se pasa a **SPA estática** (`ssr: false`, `nuxt generate`, ~1 MB):
puede alojarse gratis en Cloudflare Pages (ancho de banda ilimitado, sin cláusula de uso no comercial), Vercel u otro hosting estático. Se añaden `public/_redirects` y
`vercel.json` con la reescritura de rutas profundas. Verificado con una compilación real servida con la misma regla de reescritura: recargas duras en rutas con parámetro,
protección por rol, 404, ruta pública de recuperación, ejercicio de código y entrega. **Sin probar en Cloudflare ni Vercel reales.** Nota: `NUXT_PUBLIC_API_BASE` se fija al compilar.

---

## Ola del 23 de Septiembre (4ª pasada) — infraestructura final y alcance de lenguajes (ADR 13) · 23 de Septiembre de 2026

Tras una investigación en tres frentes con fuentes de 2026, el dueño cerró: Vercel + VM Oracle Always Free con MariaDB en Docker + Gmail + DuckDNS ($0),
**sin migrar la base**; calificación siempre en el servidor; **D-06 reabierta** (HTML/CSS/JS entra al alcance, calificado por reglas con jsdom); Python después del MVP;
C, C++ y Java se sacrifican en la versión gratuita. Código: tope de ejecuciones simultáneas del sandbox (`SANDBOX_MAX_CONCURRENT`, por defecto 3) con `Semaphore` y tests;
`mem_limit` del backend en 3 GB para la VM de 12 GB. Nada cambia en dependencias ni migraciones.

---

## Ola del 23 de Septiembre (3ª pasada) — despliegue gratuito y recuperación de contraseña · 23 de Septiembre de 2026

Acordado con el dueño (ADR 12): la base sigue en MySQL/MariaDB (no se migra a Supabase), el sandbox sigue en el servidor,
el frontend va en Vercel y el backend + base en una VM con Docker (Oracle Always Free recomendada; Railway o Azure Students como plan B),
correo por SMTP configurable (Gmail), y «Continuar con Google» queda para después.

- **Recuperación de contraseña:** `POST /auth/forgot-password` (respuesta idéntica exista o no la cuenta) y `POST /auth/reset-password`;
  enlace de 30 min y un solo uso con solo el hash en la base; cambiar la contraseña cierra las sesiones anteriores (`passwordChangedAt`);
  `MailService` con nodemailer; pantallas nuevas y página 404. El enlace «¿Olvidaste tu clave?» del login era `href="#"`.
- **Despliegue:** `Dockerfile`, `docker-compose.prod.yml` (MariaDB + backend + Caddy con HTTPS), respaldo diario, `GET /health`,
  `TRUST_PROXY`, `DB_SSL`, `docs/DESPLIEGUE.md`. Login 5→20/min por IP para no bloquear un salón.
- **Verificado con Docker real:** imagen compilada; arranque en producción contra MariaDB 11.4 (9 migraciones + seed); sandbox dentro
  del contenedor; ciclo completo de recuperación con correo real por SMTP de prueba; pantallas en Chrome real.
- Agrega la dependencia `nodemailer` (cambia `package-lock.json`). **`npm run verify:clean` en código 0 tras ese cambio.** Nota honesta: la
  primera corrida fue detenida por el sistema por poca memoria (Docker Desktop, que yo había arrancado para probar la imagen, ocupaba RAM) mientras
  hacía `npm ci`; se repitió con memoria liberada. Salida final literal:

```
[verify:clean 6] npm run build
> nest build
[verify:clean] setup completo. Base de datos de verificacion: stire_verify_clean (puerto 3097). Continua scripts/verify-clean-server-check.js.
login real contra el servidor recien levantado (docente de demo)
  login OK para docente.demo@stire.local (token recibido)
verificacion de datos sembrados via GET /enrollment/my
  OK, status 200
apagado del servidor
[verify:clean:server-check] limpieza: eliminar base de datos de verificacion stire_verify_clean
[verify:clean] TODO EN VERDE: npm ci -> migration:run -> db:seed:demo -> build -> start -> login real -> apagado.
```

---

## Ola del 23 de Septiembre (2ª pasada) — móvil, ejercicio, todos los tipos de actividad y Fase 24 · 23 de Septiembre de 2026

- **Móvil:** el menú lateral es un cajón en pantallas < 768 px (`useMobileSidebar`) en los tres layouts; sin desborde a 375 px.
- **Pantalla de ejercicio:** casos públicos/privados, límite de tiempo y autoguardado salen de datos reales; el resultado de
  «Probar código» se ve; autoguardado con debounce; una sola llamada a `/submissions/start`.
- **Backend:** `ai_evaluated` se rechaza al crearla (BE-01); el estudiante solo ve módulos publicados y actividades
  publicadas de SU clase; los PATCH de sección/lección/unidad ya no mueven contenido a otra clase; la nota de código se
  escala a los puntos de la pregunta (antes un ejercicio de 25 puntos valía 20 como máximo).
- **Probado en Chrome real:** el estudiante resuelve los 6 tipos (opción múltiple, código, completar código, arrastrar,
  emparejar, ordenar) con respuesta incorrecta y correcta.
- **Brechas funcionales, para la Fase 24 de Antigravity** (`docs/antigravity/PLAN_IMPLEMENTACION.md`): el docente no puede
  crear módulos/temas/unidades/lecciones ni ejercicios que no sean de código; falta el registro de usuarios y desactivar
  cuentas para el admin; no hay pantalla de perfil/contraseña; falta editar la clase.
- Build limpio; **65/65 suites, 586/586 tests**; typecheck en 0.

---

## Ola del 23 de Septiembre — simulación de usuario, verificación del reporte de Jorge y 11 correcciones · 23 de Septiembre de 2026

A pedido del dueño: auditoría exhaustiva actuando como usuario (Chrome real contra una base desechable) y
verificación del reporte de Jorge. El detalle de hallazgos vive en un documento privado (`.gitignore`);
aquí solo lo público.

- **Reporte de Jorge (23/09):** sus citas de código son correctas, pero auditó `ef88916` (15+ commits atrás:
  no vio roles, solicitudes, Fase 23, mensajería ni notificaciones), no ejecutó las pruebas de roles de la guía,
  su suma de §8 da 93,7 % y no 91,5 %, y su veredicto «0 P0 / APTO» omite los módulos donde estaban los defectos.
- **Corregido (cada punto con tests):** `POST /enrollment/join` matriculaba en la primera clase si faltaba el
  código; `GET /class` filtraba el código de ingreso a cualquier usuario; `activity-log` y `GET /activities/:id`
  sin control de propiedad; `GET /users` abierto a docentes; `POST /message` sin restricción de destinatario;
  ids no numéricos → 500; `unread-count` con contrato roto (contador siempre 0) y mensajes que nunca se marcaban
  leídos; detalle del estudiante con «N / 100» fijo; lecciones sin negrita ni bloques de código; KPI «92 % adopción
  del Tutor» inventado.
- **Verificado en vivo sin hallazgos:** sandbox (fs, procesos, red, memoria), saneo de HTML del contenido docente,
  flujo completo de roles y solicitudes, JWT forjado, `admin:create-first`.
- **Abierto:** sidebar del estudiante no colapsa en móvil (José), límite de login 5/min por IP (decisión del
  dueño), `AI_EVALUATED` (BE-01), textos fijos en la pantalla de ejercicio, página `analitica` inalcanzable.
- Build limpio; **65/65 suites, 575/575 tests**; `npx nuxi typecheck` en 0.

---

## Ola del 22 de Septiembre (2ª pasada) — dashboard docente, mensajería estudiante y notificaciones · 22 de Septiembre de 2026

A pedido del dueño ("los KPI del dashboard" y "al seleccionar a un estudiante no aparecen sus
nombres... tampoco veo el panel donde el estudiante recibe el mensaje del profe... coloca anuncios
tipo notificaciones"). Cuatro commits:

- **`fix(docente)`** — `GET /class/my-classes` nunca calculaba `enrollmentCount` ni `avgMastery`;
  los tres KPI del dashboard docente (estudiantes, maestría, en riesgo) mostraban 0 fijo con datos
  reales. `ClassService.findByTeacher` ahora los calcula (en riesgo = maestría < 50, mismo umbral
  que `rendimiento.vue`). Con tests.
- **`fix(mensajes)`** — dos desajustes de contrato en la bandeja del docente: el selector de
  estudiante leía `GET /enrollment/class/:classId` como estudiantes planos cuando en realidad
  devuelve matrículas con el estudiante anidado en `.student.fullName`; y la lista de mensajes leía
  `sender.name`/`receiver.name` cuando el backend siempre devuelve `fullName`. Ambos causaban
  nombres vacíos o "Usuario #id".
- **`feat(mensajes)`** — no existía ningún panel para que el estudiante viera mensajes de su
  docente, aunque el backend siempre soportó cualquier rol. `pages/estudiante/mensajes.vue` nuevo,
  con selector de docentes armado desde `GET /enrollment/my`.
- **`feat(notifications)`** — el sistema de notificaciones (`grade`, `review_schedule`) existía
  desde hace semanas sin ninguna interfaz. Nuevo `NotificationType.MESSAGE` (migración verificada
  en una base desechable), `MessageService` emite `message.created` al guardar un mensaje (mismo
  patrón que `submission.graded`), nuevo listener en `NotificationsModule` sin acoplar los dos
  módulos. `NotificationBell.vue` nueva en el header, visible para los tres roles.

Build limpio, suite completa 62/62 suites y 546/546 tests, `npx nuxi typecheck` en 0 errores.

---

## Ola del 22 de Septiembre — Fase 23 fusionada a main y primer admin real · 22 de Septiembre de 2026

El dueño preguntó si el proyecto ya estaba listo para desplegar. Se verificó Fase 23 (entregada
por Antigravity el 21/09) contra el código real, se fusionó a `main`, y se resolvió el único
bloqueador de seguridad que quedaba pendiente para un despliegue real.

- **Fase 23 auditada y fusionada.** Verificado contra `frontend-nuxt/` real, no solo contra el
  informe de Antigravity: `pages/estudiante/repasos.vue` navega a la unidad y ya no tiene
  `completeReview`; `pages/admin/index.vue` llama `PATCH /users/:id/role` con bloqueo de la
  propia cuenta; `pages/auth/register.vue` solo permite `estudiante`/`docente` y no quedó rastro
  de restricción de dominio de correo; el panel de solicitudes de rol llama `GET`/`PATCH
  /role-requests`. Diff acotado a 9 archivos de `frontend-nuxt/`, sin tocar backend ni estilos
  globales. Squash-merge a `main` (`0397d02`), con confirmación explícita del dueño. Rama
  `feat/fase-23` borrada (local y remota) tras confirmar diff idéntico.
- **`validate-pre-frontend.spec.ts` explicado.** La falla suelta que había quedado sin
  diagnosticar en la ola anterior (apareció en la corrida completa justo después del commit
  `edfa56e`) se reprodujo: pasa en aislado (13/13, ~50s) y pasa dentro de la corrida completa
  repetida (61/61 suites, 539/539 tests). Mismo patrón de flakiness bajo carga ya documentado
  con `judge.worker.spec.ts` — no es una regresión de código, no requirió cambios.
- **Primer admin real, por script de variable de entorno.** Hasta ahora la única cuenta admin
  era la semilla de demo (`admin.sistema@unicor.edu.co`) con contraseña pública en el repo —
  cualquiera con acceso al repo podía entrar como admin en un despliegue real. Se agregó
  `npm run admin:create-first` (`src/scripts/create-first-admin.ts`): lee
  `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_FULL_NAME` del entorno real del servidor (nunca del
  repo), exige la misma política de contraseña que el registro público, y es idempotente por
  email (si ya existe, no crea ni modifica nada — evita que una segunda corrida accidental pise
  una cuenta real). Con test propio (`create-first-admin.spec.ts`). **Bug propio detectado y
  corregido en la misma sesión, antes de comitear:** el archivo llamaba a `bootstrap()` en el
  nivel superior sin guarda — el solo hecho de importar `validateAdminInput` desde el spec para
  probarlo ejecutaba el script completo y dejaba `process.exitCode = 1` en cualquier `npm test`.
  Corregido con `if (require.main === module)`.
- **Documentación.** `docs/PLAN_MAESTRO.md` §4.7, §6.1 y checkpoint del 22/09 actualizados.
  Fase 23 archivada (`docs/_archivo/PLAN_IMPLEMENTACION_ANTIGRAVITY_2026-09-22.md`,
  `docs/_archivo/README.md` indexado); `docs/antigravity/PLAN_IMPLEMENTACION.md` queda sin fase
  pendiente.
- **Build limpio, suite completa 61/61 suites y 539/539 tests, `npx nuxi typecheck` en 0
  errores** (backend build + full suite corridos antes y después de agregar el script de admin).
- **Pendientes reales que siguen abiertos, sin cambios en esta ola:** el panel docente con
  `atRiskCount` fijo en 0 (`pages/docente/index.vue:590`, territorio de José); el reporte de la
  auditoría de Jorge de la semana (`GUIA_AUDITORIA_2026-09-21.md`, entrega prevista 25/09); la
  ejecución del despliegue en sí (`S06-J03`).

---

## Ola del 21 de Septiembre — auditoria de la Fase 22, clave del Tutor con Gemini real y guia para el rediseño visual · 21 de Septiembre de 2026

Posterior a la ola del 20 de Septiembre. Toca backend, un componente del frontend y la documentacion; **no modifica `package-lock.json`** (solo agrega el script `check:identidad` a `package.json`).

### Puntos

| Punto | Commit | Resumen |
|---|---|---|
| Limpieza de mantenimiento | `0cb8671` | `POST /maintenance/cleanup` respondia "ejecutada exitosamente" aunque hubiera capturado un error interno. `runCleanup()` lanza al fallar, el endpoint responde 500 con un mensaje claro y, si funciona, devuelve cuantas respuestas y entregas corrigio; el cron sigue capturando el error. 6 tests. |
| Secreto de cifrado de la clave del Tutor | `0fc0c96` | El `.env` local no tenia `TUTOR_KEY_ENCRYPTION_SECRET`: guardar una clave de Google valida daba 503 y la pantalla decia "intentalo de nuevo en un minuto". Ahora el backend avisa al arrancar, el mensaje al estudiante no menciona variables de entorno y la interfaz muestra el mensaje real del servidor. 2 tests. |
| Matriculas en `GET /enrollment/my` | `b1a4cf2` | Devolvia tambien las retiradas y pendientes (su descripcion dice "activas"); la interfaz las mostraba como clases cuyo contenido respondia 403. Ahora solo `active`. 1 test. |
| Escape y foco del Tutor sin clave | `53b6df2` | Defecto de la Fase 22 (T2): sin clave guardada el foco caia al `body` y `Escape` no cerraba el panel. |
| Guia y verificacion para el rediseño visual | `808a0c1` | `docs/identidad-visual/` y `npm run check:identidad` (25 tests). |
| Documentacion | `d408492` | Fase 22 archivada con la nota de auditoria; `PLAN_MAESTRO.md` al dia. |

Build limpio. **59 suites, 512 tests, todos en verde** (antes: 57 y 478). En la primera pasada de la suite completa, `auth.controller.e2e-spec` y `judge.worker.spec` fallaron con timeout de 5 s con el equipo casi sin memoria libre (0,3-0,5 GB); repetidas solas pasaron, y la suite completa posterior quedo en verde.

Verificacion en navegador real (backend y base reales, Chrome con guion propio, clave de Google de prueba que no se guardo en ningun archivo y se borro al terminar): recorrido completo de la clave del Tutor (clave inventada rechazada, clave demasiado corta, clave real guardada, conversacion con Gemini, "Mi clave" y "Quitar mi clave") y auditoria de las cuatro tareas de la Fase 22.

### Segunda tanda del 21/09 — roles, registro con solicitud de docente y guias del equipo

Pedida por el dueño tras probar el sistema: «Iniciar Refuerzo» no lleva a ninguna parte, el admin no puede editar roles y el registro no permite elegir docente sin que cualquiera lo sea.

| Punto | Commit | Resumen |
|---|---|---|
| Registro con solicitud de docente | `2a06a7e` | La cuenta siempre nace estudiante; pedir docente deja una solicitud `pending` (tabla `role_requests`, migracion `1789400000000`) que solo un admin aprueba o rechaza, con quien y cuando. `TEACHER_EMAIL_DOMAINS` (opcional) limita que correos pueden pedirlo. 18 tests nuevos. |
| Validacion del rol y cuenta propia | `44b1162` | `PATCH /users/:id/role` aceptaba cualquier texto y un admin podia quitarse su propio rol, desactivarse o eliminarse. Ahora `400` si el rol no es valido y `403` sobre la propia cuenta. Tests de servicio y e2e. |
| Margen de tiempo en un test | `7bee209` | `judge.worker.spec` fallo por el temporizador de 5 s de su `beforeAll` en 2 de 3 corridas completas con el equipo cargado; pasa siempre al repetirlo solo. |
| Guias y plan | `e60fddb`, `8919b47`, `b463141` | Bitacora, guia de UX/UI y reglas de trabajo en paralelo para José; guia de auditoria de la Semana 6 para Jorge; Fase 23 para Antigravity. |

Build limpio. **60 suites, 537 tests**: en la corrida completa pasaron 536 y fallo solo el `beforeAll` de `judge.worker.spec` mencionado arriba (con el margen nuevo y aislado pasa; los suites tocados por esta tanda, 14 suites y 105 tests, pasan).

**Verificacion de la migracion (contra una base vacia desechable, luego eliminada):** `migration:run` ejecuto todas las migraciones desde cero, incluida `CreateRoleRequests1789400000000`, con la tabla, sus 11 columnas y la clave foranea `FK_role_requests_user`; `migration:revert` la elimino limpiamente.

**`verify:clean` NO se repitio despues de esta segunda tanda.** El intento fallo en el paso 1 con `EPERM` porque los servidores de desarrollo del dueño (`nest start --watch` y `nuxt dev`) tenian abiertos archivos de `node_modules`; el borrado alcanzo a eliminar parte de esa carpeta antes de fallar y se repuso con `npm install` (sin cambios en `package-lock.json`; build y 105 tests posteriores en verde). La salida literal de abajo corresponde a la primera tanda, previa a estos cambios. **Pendiente:** correr `npm run verify:clean` completo con los servidores de desarrollo cerrados, antes de declarar cerrada la ola. Tambien falta aplicar la migracion en la base local del dueño (`npm run migration:run`); su base `basestire` todavia no tiene `role_requests`.

### `verify:clean` — salida literal de cierre de la ola (primera tanda, previa a los cambios de roles)

Ejecutado despues del ultimo commit y con `VERIFY_START_TIMEOUT_MS=180000` (ver la nota de la ola anterior sobre el arranque en frio dentro de OneDrive). La salida se pego completa, sin omitir ninguna linea.

```
> stire@0.0.1 verify:clean
> node scripts/verify-clean.js && node scripts/verify-clean-server-check.js


[verify:clean 1] rm -rf node_modules dist

[verify:clean 2] npm ci (instalacion exacta desde package-lock.json)

added 955 packages, and audited 956 packages in 3m

186 packages are looking for funding
  run `npm fund` for details

24 vulnerabilities (2 low, 3 moderate, 18 high, 1 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm warn deprecated @npmcli/move-file@1.1.2: This functionality has been moved to @npmcli/fs
npm warn deprecated npmlog@6.0.2: This package is no longer supported.
npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated are-we-there-yet@3.0.1: This package is no longer supported.
npm warn deprecated prebuild-install@7.1.3: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.
npm warn deprecated gauge@4.0.4: This package is no longer supported.
npm warn deprecated tar@6.2.1: Old versions of tar are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me

[verify:clean 3] crear base de datos vacia de verificacion: stire_verify_clean
(node:11508) [DEP0190] DeprecationWarning: Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not escaped, only concatenated.
(Use `node --trace-deprecation ...` to show where the warning was created)

[verify:clean 4] migration:run contra la base de datos vacia

> stire@0.0.1 migration:run
> npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts

◇ injected env (0) from .env // tip: ⌘ enable debugging { debug: true }
[90m[4mquery:[24m[39m [94mSELECT[0m [95mversion[0m[37m([0m[37m)[0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m*[0m [94mFROM[0m [37m`INFORMATION_SCHEMA`[0m[37m.[0m[37m`COLUMNS`[0m [94mWHERE[0m [37m`TABLE_SCHEMA`[0m [37m=[0m [37m'stire_verify_clean'[0m [94mAND[0m [37m`TABLE_NAME`[0m [37m=[0m [37m'migrations'[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`migrations`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`timestamp`[0m [37mbigint[0m [94mNOT NULL[0m[37m,[0m [37m`name`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m*[0m [94mFROM[0m [37m`stire_verify_clean`[0m[37m.[0m[37m`migrations`[0m [37m`migrations`[0m [94mORDER BY[0m [37m`id`[0m [94mDESC[0m
[4m0 migrations are already loaded in the database.[24m
[4m6 migrations were found in the source code.[24m
[4m6 migrations are new migrations must be executed.[24m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`activity_types`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`name`[0m [94mvarchar[0m[37m([0m[32m100[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`code`[0m [94mvarchar[0m[37m([0m[32m50[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`autoGradable`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m1[0m[37m,[0m [37m`baseWeight`[0m [37mfloat[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'1'[0m[37m,[0m [37m`configSchema`[0m [37mjson[0m [94mNULL[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_ce7823da2e27674fbd0392e867`[0m [37m([0m[37m`code`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`activities`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`learningUnitId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`activityTypeId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`createdBy`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`title`[0m [94mvarchar[0m[37m([0m[32m200[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`description`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`difficulty`[0m [95menum[0m [37m([0m[37m'basico'[0m[37m,[0m [37m'intermedio'[0m[37m,[0m [37m'avanzado'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'basico'[0m[37m,[0m [37m`totalPoints`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'100'[0m[37m,[0m [37m`passingScore`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'60'[0m[37m,[0m [37m`attemptsAllowed`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'3'[0m[37m,[0m [37m`timeLimit`[0m [37mint[0m [94mNULL[0m[37m,[0m [37m`order`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`status`[0m [95menum[0m [37m([0m[37m'draft'[0m[37m,[0m [37m'review'[0m[37m,[0m [37m'published'[0m[37m,[0m [37m'archived'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'draft'[0m[37m,[0m [37m`isRequired`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m0[0m[37m,[0m [37m`adaptiveWeight`[0m [37mfloat[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'1'[0m[37m,[0m [37m`publishedAt`[0m [94mtimestamp[0m [94mNULL[0m[37m,[0m [94mINDEX[0m [37m`IDX_bd3144edc073063648e4efbb1f`[0m [37m([0m[37m`learningUnitId`[0m[37m,[0m [37m`status`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`contents`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`learningUnitId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`title`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`type`[0m [95menum[0m [37m([0m[37m'video'[0m[37m,[0m [37m'markdown'[0m[37m,[0m [37m'code'[0m[37m,[0m [37m'pdf'[0m[37m,[0m [37m'image'[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`body`[0m [94mlongtext[0m [94mNULL[0m[37m,[0m [37m`metadata`[0m [37mjson[0m [94mNULL[0m[37m,[0m [37m`order`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`isVisible`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m1[0m[37m,[0m [94mINDEX[0m [37m`IDX_58754b2430201454bffc79cec6`[0m [37m([0m[37m`learningUnitId`[0m[37m,[0m [37m`order`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`learning_units`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`title`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`description`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`difficulty`[0m [95menum[0m [37m([0m[37m'basico'[0m[37m,[0m [37m'intermedio'[0m[37m,[0m [37m'avanzado'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'basico'[0m[37m,[0m [37m`order`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`isActive`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m1[0m[37m,[0m [37m`topicId`[0m [37mint[0m [94mNULL[0m[37m,[0m [37m`createdAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [37m`updatedAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m [94mON[0m [94mUPDATE[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`topics`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`title`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`description`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`order`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`isActive`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m1[0m[37m,[0m [37m`sectionId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`createdAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [37m`updatedAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m [94mON[0m [94mUPDATE[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`sections`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`title`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`description`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`order`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`isPublished`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m0[0m[37m,[0m [37m`classId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`createdAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [37m`updatedAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m [94mON[0m [94mUPDATE[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [94mINDEX[0m [37m`IDX_f0881122b5efd7b004f082c084`[0m [37m([0m[37m`classId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`classes`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`name`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`description`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`code`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`teacherId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`isActive`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m1[0m[37m,[0m [37m`startDate`[0m [37mdate[0m [94mNULL[0m[37m,[0m [37m`endDate`[0m [37mdate[0m [94mNULL[0m[37m,[0m [37m`maxStudents`[0m [37mint[0m [94mNULL[0m[37m,[0m [37m`createdAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [37m`updatedAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m [94mON[0m [94mUPDATE[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [94mINDEX[0m [37m`IDX_4b7ac7a7eb91f3e04229c7c0b6`[0m [37m([0m[37m`teacherId`[0m[37m)[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_cf7491878e0fca859943862998`[0m [37m([0m[37m`code`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`enrollments`[0m [37m([0m[37m`id`[0m [94mvarchar[0m[37m([0m[32m36[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`classId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`studentId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`status`[0m [95menum[0m [37m([0m[37m'active'[0m[37m,[0m [37m'inactive'[0m[37m,[0m [37m'withdrawn'[0m[37m,[0m [37m'completed'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'active'[0m[37m,[0m [37m`joined_at`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [37m`left_at`[0m [94mtimestamp[0m [94mNULL[0m[37m,[0m [37m`last_activity_at`[0m [94mtimestamp[0m [94mNULL[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_43599c2329cb145ee8ba57079b`[0m [37m([0m[37m`classId`[0m[37m,[0m [37m`studentId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`institutions`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`name`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_15c98649276025998cd1acaf61`[0m [37m([0m[37m`name`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`programs`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`name`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`maxSemesters`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`institutionId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`user_affiliations`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`userId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`programId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`roleType`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`currentSemester`[0m [37mint[0m [94mNULL[0m[37m,[0m [37m`isActive`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m1[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`users`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`email`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`password`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`fullName`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`role`[0m [95menum[0m [37m([0m[37m'admin'[0m[37m,[0m [37m'docente'[0m[37m,[0m [37m'estudiante'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'estudiante'[0m[37m,[0m [37m`isActive`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m1[0m[37m,[0m [37m`createdAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [37m`updatedAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m [94mON[0m [94mUPDATE[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_97672ac88f789774dd47f7c8be`[0m [37m([0m[37m`email`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`tutor_conversations`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`studentId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`role`[0m [94mvarchar[0m[37m([0m[32m50[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`content`[0m [94mtext[0m [94mNOT NULL[0m[37m,[0m [37m`metadata`[0m [37mjson[0m [94mNULL[0m[37m,[0m [94mINDEX[0m [37m`IDX_56c5533282e9ec141a9369081c`[0m [37m([0m[37m`studentId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`activity_questions`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`activityId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`type`[0m [95menum[0m [37m([0m[37m'mcq'[0m[37m,[0m [37m'coding'[0m[37m,[0m [37m'drag_drop'[0m[37m,[0m [37m'matching'[0m[37m,[0m [37m'fill_code'[0m[37m,[0m [37m'ordering'[0m[37m,[0m [37m'ai_evaluated'[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`question`[0m [94mtext[0m [94mNOT NULL[0m[37m,[0m [37m`points`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'10'[0m[37m,[0m [37m`order`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`config`[0m [37mjson[0m [94mNOT NULL[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`submission_answers`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`submissionId`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`questionId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`answer`[0m [37mjson[0m [94mNOT NULL[0m[37m,[0m [37m`isCorrect`[0m [94mtinyint[0m [94mNULL[0m[37m,[0m [37m`score`[0m [37mfloat[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`feedback`[0m [94mtext[0m [94mNULL[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`submissions`[0m [37m([0m[37m`id`[0m [94mvarchar[0m[37m([0m[32m36[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`activityId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`studentId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`score`[0m [37mfloat[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`feedback`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`attemptNumber`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'1'[0m[37m,[0m [37m`status`[0m [95menum[0m [37m([0m[37m'in_progress'[0m[37m,[0m [37m'submitted'[0m[37m,[0m [37m'graded'[0m[37m,[0m [37m'expired'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'in_progress'[0m[37m,[0m [37m`startedAt`[0m [94mtimestamp[0m [94mNULL[0m[37m,[0m [37m`submittedAt`[0m [94mtimestamp[0m [94mNULL[0m[37m,[0m [37m`timeSpentSeconds`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`lastSavedAt`[0m [94mtimestamp[0m [94mNULL[0m[37m,[0m [37m`autosaveData`[0m [37mjson[0m [94mNULL[0m[37m,[0m [37m`isAbandoned`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m0[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [94mINDEX[0m [37m`IDX_a3a94d0cb86c82e1f221100a44`[0m [37m([0m[37m`studentId`[0m[37m,[0m [37m`status`[0m[37m)[0m[37m,[0m [94mINDEX[0m [37m`IDX_03e1c1ddb6b33421fe8935a73f`[0m [37m([0m[37m`studentId`[0m[37m,[0m [37m`activityId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`review_schedules`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`studentId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`learningUnitId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`nextReviewDate`[0m [94mtimestamp[0m [94mNOT NULL[0m[37m,[0m [37m`urgencyLevel`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`intervalDays`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'1'[0m[37m,[0m [37m`repetitions`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`lastReviewedAt`[0m [94mtimestamp[0m [94mNULL[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_7e969b53fac069d54b248bf537`[0m [37m([0m[37m`studentId`[0m[37m,[0m [37m`learningUnitId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`bank_questions`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`bankId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`type`[0m [95menum[0m [37m([0m[37m'mcq'[0m[37m,[0m [37m'coding'[0m[37m,[0m [37m'drag_drop'[0m[37m,[0m [37m'matching'[0m[37m,[0m [37m'fill_code'[0m[37m,[0m [37m'ordering'[0m[37m,[0m [37m'ai_evaluated'[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`question`[0m [94mtext[0m [94mNOT NULL[0m[37m,[0m [37m`config`[0m [37mjson[0m [94mNOT NULL[0m[37m,[0m [37m`tags`[0m [94mtext[0m [94mNULL[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`question_banks`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`name`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`description`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`authorId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`isPublic`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m0[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`prerequisites`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`targetUnitId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`requiredUnitId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`minMasteryRequired`[0m [37mfloat[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'60'[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_e55545b98f91f6a5da8b004833`[0m [37m([0m[37m`targetUnitId`[0m[37m,[0m [37m`requiredUnitId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`notifications`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`userId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`title`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`message`[0m [94mtext[0m [94mNOT NULL[0m[37m,[0m [37m`isRead`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m0[0m[37m,[0m [37m`type`[0m [95menum[0m [37m([0m[37m'grade'[0m[37m,[0m [37m'review_schedule'[0m[37m,[0m [37m'info'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'info'[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`messages`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`senderId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`receiverId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`content`[0m [94mtext[0m [94mNOT NULL[0m[37m,[0m [37m`isRead`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [32m0[0m[37m,[0m [37m`createdAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`learning_progress`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`studentId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`learningUnitId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`mastery`[0m [37mfloat[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`status`[0m [95menum[0m [37m([0m[37m'no_visto'[0m[37m,[0m [37m'explorado'[0m[37m,[0m [37m'en_practica'[0m[37m,[0m [37m'comprension_parcial'[0m[37m,[0m [37m'dominado'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'no_visto'[0m[37m,[0m [37m`priority`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`successRate`[0m [37mfloat[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`attemptsCount`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`completedActivities`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`lastActivityId`[0m [37mint[0m [94mNULL[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_21d1790565894696c13f099ce9`[0m [37m([0m[37m`studentId`[0m[37m,[0m [37m`learningUnitId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`execution_results`[0m [37m([0m[37m`id`[0m [94mvarchar[0m[37m([0m[32m36[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`submissionAnswerId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`status`[0m [94mvarchar[0m[37m([0m[32m50[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`stdout`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`stderr`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`executionTimeMs`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`memoryUsedKB`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m[37m,[0m [37m`testCaseLabel`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`achievements`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`name`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`description`[0m [94mtext[0m [94mNULL[0m[37m,[0m [37m`iconUrl`[0m [94mvarchar[0m[37m([0m[32m255[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`points`[0m [37mint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'10'[0m[37m,[0m [37m`unlockedById`[0m [37mint[0m [94mNULL[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`activity_logs`[0m [37m([0m[37m`id`[0m [94mvarchar[0m[37m([0m[32m36[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`studentId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`action`[0m [95menum[0m [37m([0m[37m'content_read'[0m[37m,[0m [37m'activity_started'[0m[37m,[0m [37m'submission_graded'[0m[37m,[0m [37m'unit_completed'[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`referenceId`[0m [94mvarchar[0m[37m([0m[32m100[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`referenceType`[0m [94mvarchar[0m[37m([0m[32m50[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`metadata`[0m [37mjson[0m [94mNULL[0m[37m,[0m [37m`createdAt`[0m [94mdatetime[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [95mCURRENT_TIMESTAMP[0m[37m([0m[32m6[0m[37m)[0m[37m,[0m [94mINDEX[0m [37m`IDX_78666521e99d2bbe69f2ea830a`[0m [37m([0m[37m`referenceId`[0m[37m,[0m [37m`action`[0m[37m)[0m[37m,[0m [94mINDEX[0m [37m`IDX_8befb5d0b0f799f6b6a1af46b5`[0m [37m([0m[37m`studentId`[0m[37m,[0m [37m`action`[0m[37m)[0m[37m,[0m [94mINDEX[0m [37m`IDX_0239ac3be75a977a71ae9cf8e0`[0m [37m([0m[37m`studentId`[0m[37m,[0m [37m`createdAt`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`activities`[0m [94mADD CONSTRAINT[0m [37m`FK_cc686d463a463786129e1de1cea`[0m [94mFOREIGN KEY[0m [37m([0m[37m`learningUnitId`[0m[37m)[0m [94mREFERENCES[0m [37m`learning_units`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`activities`[0m [94mADD CONSTRAINT[0m [37m`FK_3689e28651a4b078af91952bed8`[0m [94mFOREIGN KEY[0m [37m([0m[37m`activityTypeId`[0m[37m)[0m [94mREFERENCES[0m [37m`activity_types`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`activities`[0m [94mADD CONSTRAINT[0m [37m`FK_dc4b610a410beaee2dca89e7536`[0m [94mFOREIGN KEY[0m [37m([0m[37m`createdBy`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`contents`[0m [94mADD CONSTRAINT[0m [37m`FK_03bf08d52358f58f07787fc6b8f`[0m [94mFOREIGN KEY[0m [37m([0m[37m`learningUnitId`[0m[37m)[0m [94mREFERENCES[0m [37m`learning_units`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`learning_units`[0m [94mADD CONSTRAINT[0m [37m`FK_cb4ada233555d57c4f6e50609ad`[0m [94mFOREIGN KEY[0m [37m([0m[37m`topicId`[0m[37m)[0m [94mREFERENCES[0m [37m`topics`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`topics`[0m [94mADD CONSTRAINT[0m [37m`FK_36089054397b6db8da2fd67a073`[0m [94mFOREIGN KEY[0m [37m([0m[37m`sectionId`[0m[37m)[0m [94mREFERENCES[0m [37m`sections`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`sections`[0m [94mADD CONSTRAINT[0m [37m`FK_f0881122b5efd7b004f082c084c`[0m [94mFOREIGN KEY[0m [37m([0m[37m`classId`[0m[37m)[0m [94mREFERENCES[0m [37m`classes`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`classes`[0m [94mADD CONSTRAINT[0m [37m`FK_4b7ac7a7eb91f3e04229c7c0b6f`[0m [94mFOREIGN KEY[0m [37m([0m[37m`teacherId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`enrollments`[0m [94mADD CONSTRAINT[0m [37m`FK_470304681bce2933d3cbb680db8`[0m [94mFOREIGN KEY[0m [37m([0m[37m`classId`[0m[37m)[0m [94mREFERENCES[0m [37m`classes`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`enrollments`[0m [94mADD CONSTRAINT[0m [37m`FK_bf3ba3dfa95e2df7388eb4589fd`[0m [94mFOREIGN KEY[0m [37m([0m[37m`studentId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`programs`[0m [94mADD CONSTRAINT[0m [37m`FK_82f9404fa3d1a3e1cc2c8f2d22a`[0m [94mFOREIGN KEY[0m [37m([0m[37m`institutionId`[0m[37m)[0m [94mREFERENCES[0m [37m`institutions`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`user_affiliations`[0m [94mADD CONSTRAINT[0m [37m`FK_be5b7060fa1c8a8ba2a8504e746`[0m [94mFOREIGN KEY[0m [37m([0m[37m`userId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`user_affiliations`[0m [94mADD CONSTRAINT[0m [37m`FK_f6200ccffc5064f1be2e329a245`[0m [94mFOREIGN KEY[0m [37m([0m[37m`programId`[0m[37m)[0m [94mREFERENCES[0m [37m`programs`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`tutor_conversations`[0m [94mADD CONSTRAINT[0m [37m`FK_56c5533282e9ec141a9369081ca`[0m [94mFOREIGN KEY[0m [37m([0m[37m`studentId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`activity_questions`[0m [94mADD CONSTRAINT[0m [37m`FK_a20191ae2559a453d0bba75da9b`[0m [94mFOREIGN KEY[0m [37m([0m[37m`activityId`[0m[37m)[0m [94mREFERENCES[0m [37m`activities`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`submission_answers`[0m [94mADD CONSTRAINT[0m [37m`FK_7e0d6cf6173772c12089cf97474`[0m [94mFOREIGN KEY[0m [37m([0m[37m`submissionId`[0m[37m)[0m [94mREFERENCES[0m [37m`submissions`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`submission_answers`[0m [94mADD CONSTRAINT[0m [37m`FK_49b240a1fb2de5d9308d2125597`[0m [94mFOREIGN KEY[0m [37m([0m[37m`questionId`[0m[37m)[0m [94mREFERENCES[0m [37m`activity_questions`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`submissions`[0m [94mADD CONSTRAINT[0m [37m`FK_5ddeb5fb4f6c38b0439ec52bff2`[0m [94mFOREIGN KEY[0m [37m([0m[37m`activityId`[0m[37m)[0m [94mREFERENCES[0m [37m`activities`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`submissions`[0m [94mADD CONSTRAINT[0m [37m`FK_4fc99318a291abd7e2a50f50851`[0m [94mFOREIGN KEY[0m [37m([0m[37m`studentId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`review_schedules`[0m [94mADD CONSTRAINT[0m [37m`FK_c76dfbe4d695e9eb548d0826c7e`[0m [94mFOREIGN KEY[0m [37m([0m[37m`studentId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`review_schedules`[0m [94mADD CONSTRAINT[0m [37m`FK_bc8f68cc5d9a235438a767fd5a0`[0m [94mFOREIGN KEY[0m [37m([0m[37m`learningUnitId`[0m[37m)[0m [94mREFERENCES[0m [37m`learning_units`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`bank_questions`[0m [94mADD CONSTRAINT[0m [37m`FK_916010c09855614e142d71f72a2`[0m [94mFOREIGN KEY[0m [37m([0m[37m`bankId`[0m[37m)[0m [94mREFERENCES[0m [37m`question_banks`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`question_banks`[0m [94mADD CONSTRAINT[0m [37m`FK_6f408c9e6d742703af93a98083f`[0m [94mFOREIGN KEY[0m [37m([0m[37m`authorId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`prerequisites`[0m [94mADD CONSTRAINT[0m [37m`FK_f205de314c224ec276293924105`[0m [94mFOREIGN KEY[0m [37m([0m[37m`targetUnitId`[0m[37m)[0m [94mREFERENCES[0m [37m`learning_units`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`prerequisites`[0m [94mADD CONSTRAINT[0m [37m`FK_b616443e090e940951cc2fbaf94`[0m [94mFOREIGN KEY[0m [37m([0m[37m`requiredUnitId`[0m[37m)[0m [94mREFERENCES[0m [37m`learning_units`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`notifications`[0m [94mADD CONSTRAINT[0m [37m`FK_692a909ee0fa9383e7859f9b406`[0m [94mFOREIGN KEY[0m [37m([0m[37m`userId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`messages`[0m [94mADD CONSTRAINT[0m [37m`FK_2db9cf2b3ca111742793f6c37ce`[0m [94mFOREIGN KEY[0m [37m([0m[37m`senderId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`messages`[0m [94mADD CONSTRAINT[0m [37m`FK_acf951a58e3b9611dd96ce89042`[0m [94mFOREIGN KEY[0m [37m([0m[37m`receiverId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`learning_progress`[0m [94mADD CONSTRAINT[0m [37m`FK_ff1936e29305b9f0e52eb1fde30`[0m [94mFOREIGN KEY[0m [37m([0m[37m`studentId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`learning_progress`[0m [94mADD CONSTRAINT[0m [37m`FK_2d86a96d67fe2848ec0d39560ba`[0m [94mFOREIGN KEY[0m [37m([0m[37m`learningUnitId`[0m[37m)[0m [94mREFERENCES[0m [37m`learning_units`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`learning_progress`[0m [94mADD CONSTRAINT[0m [37m`FK_c4ba35959dbdc57dde97ceb7473`[0m [94mFOREIGN KEY[0m [37m([0m[37m`lastActivityId`[0m[37m)[0m [94mREFERENCES[0m [37m`activities`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`execution_results`[0m [94mADD CONSTRAINT[0m [37m`FK_35b26782b11673f9510ecf7a69e`[0m [94mFOREIGN KEY[0m [37m([0m[37m`submissionAnswerId`[0m[37m)[0m [94mREFERENCES[0m [37m`submission_answers`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`achievements`[0m [94mADD CONSTRAINT[0m [37m`FK_d090264a2b478a21cc8f52552b9`[0m [94mFOREIGN KEY[0m [37m([0m[37m`unlockedById`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [37mNO[0m [37mACTION[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`stire_verify_clean`[0m[37m.[0m[37m`migrations`[0m[37m([0m[37m`timestamp`[0m[37m,[0m [37m`name`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1779000000000,"InitialSchema1779000000000"][0m
[4mMigration InitialSchema1779000000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`review_schedules`[0m [94mADD[0m [37m`easeFactor`[0m [37mfloat[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'2.5'[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`stire_verify_clean`[0m[37m.[0m[37m`migrations`[0m[37m([0m[37m`timestamp`[0m[37m,[0m [37m`name`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1788999128282,"AddEaseFactorToReviewSchedules1788999128282"][0m
[4mMigration AddEaseFactorToReviewSchedules1788999128282 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`classes`[0m [94mADD[0m [37m`requiresApproval`[0m [94mtinyint[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'0'[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`enrollments`[0m [37mMODIFY[0m [37m`status`[0m [95menum[0m [37m([0m[37m'active'[0m[37m,[0m[37m'inactive'[0m[37m,[0m[37m'withdrawn'[0m[37m,[0m[37m'completed'[0m[37m,[0m[37m'pending'[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37m'active'[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`stire_verify_clean`[0m[37m.[0m[37m`migrations`[0m[37m([0m[37m`timestamp`[0m[37m,[0m [37m`name`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1789000000000,"AddApprovalToClasses1789000000000"][0m
[4mMigration AddApprovalToClasses1789000000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`submissions`[0m [94mADD[0m [37m`activeAttemptKey`[0m [94mtinyint[0m [37mGENERATED[0m [37mALWAYS[0m [94mAS[0m [37m([0m[94mCASE[0m [94mWHEN[0m [37m`status`[0m [37m=[0m [37m'in_progress'[0m [94mTHEN[0m [32m1[0m [94mELSE[0m [94mNULL[0m [94mEND[0m[37m)[0m [37mSTORED[0m
[90m[4mquery:[24m[39m [94mCREATE UNIQUE INDEX[0m [37m`UQ_submissions_active_attempt`[0m [94mON[0m [37m`submissions`[0m [37m([0m[37m`studentId`[0m[37m,[0m [37m`activityId`[0m[37m,[0m [37m`activeAttemptKey`[0m[37m)[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`stire_verify_clean`[0m[37m.[0m[37m`migrations`[0m[37m([0m[37m`timestamp`[0m[37m,[0m [37m`name`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1789100000000,"AddActiveSubmissionConstraint1789100000000"][0m
[4mMigration AddActiveSubmissionConstraint1789100000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`tutor_credentials`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`studentId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`encryptedKey`[0m [94mtext[0m [94mNOT NULL[0m[37m,[0m [37m`keyLast4`[0m [94mvarchar[0m[37m([0m[32m4[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_tutor_credentials_studentId`[0m [37m([0m[37m`studentId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mALTER TABLE[0m [37m`tutor_credentials`[0m [94mADD CONSTRAINT[0m [37m`FK_tutor_credentials_studentId`[0m [94mFOREIGN KEY[0m [37m([0m[37m`studentId`[0m[37m)[0m [94mREFERENCES[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m)[0m [94mON[0m [94mDELETE[0m [94mCASCADE[0m [94mON[0m [94mUPDATE[0m [37mNO[0m [37mACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`stire_verify_clean`[0m[37m.[0m[37m`migrations`[0m[37m([0m[37m`timestamp`[0m[37m,[0m [37m`name`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1789200000000,"CreateTutorCredentials1789200000000"][0m
[4mMigration CreateTutorCredentials1789200000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mCREATE TABLE[0m [37m`tutor_settings`[0m [37m([0m[37m`id`[0m [37mint[0m [94mNOT NULL[0m [94mAUTO_INCREMENT[0m[37m,[0m [37m`createdAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`updatedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNOT NULL[0m [94mDEFAULT[0m [37mCURRENT_TIMESTAMP[0m [94mON[0m [94mUPDATE[0m [37mCURRENT_TIMESTAMP[0m[37m,[0m [37m`deletedAt`[0m [94mtimestamp[0m[37m([0m[32m6[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`scopeType`[0m [94mvarchar[0m[37m([0m[32m20[0m[37m)[0m [94mNOT NULL[0m[37m,[0m [37m`scopeId`[0m [37mint[0m [94mNOT NULL[0m[37m,[0m [37m`enabled`[0m [94mtinyint[0m[37m([0m[32m1[0m[37m)[0m [94mNULL[0m[37m,[0m [37m`maxGuideLevel`[0m [94mtinyint[0m [94mNULL[0m[37m,[0m [37m`style`[0m [94mvarchar[0m[37m([0m[32m20[0m[37m)[0m [94mNULL[0m[37m,[0m [94mUNIQUE[0m [94mINDEX[0m [37m`IDX_tutor_settings_scope`[0m [37m([0m[37m`scopeType`[0m[37m,[0m [37m`scopeId`[0m[37m)[0m[37m,[0m [94mPRIMARY KEY[0m [37m([0m[37m`id`[0m[37m)[0m[37m)[0m [94mENGINE[0m[37m=[0m[37mInnoDB[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`stire_verify_clean`[0m[37m.[0m[37m`migrations`[0m[37m([0m[37m`timestamp`[0m[37m,[0m [37m`name`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1789300000000,"CreateTutorSettings1789300000000"][0m
[4mMigration CreateTutorSettings1789300000000 has been executed successfully.[24m
[90m[4mquery:[24m[39m [94mCOMMIT[0m

[verify:clean 5] db:seed:demo contra la base de datos vacia

> stire@0.0.1 db:seed:demo
> ts-node -r tsconfig-paths/register stire-seeder-demo.ts

◇ injected env (0) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
[90m[4mquery:[24m[39m [94mSELECT[0m [95mversion[0m[37m([0m[37m)[0m
Conectado a la base de datos. Sembrando datos de demo (idempotente)...

Institución y programa
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Institution`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Institution_id`[0m[37m,[0m [37m`Institution`[0m[37m.[0m[37m`name`[0m [94mAS[0m [37m`Institution_name`[0m [94mFROM[0m [37m`institutions`[0m [37m`Institution`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`Institution`[0m[37m.[0m[37m`name`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: ["Universidad de Córdoba (Demo)"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`institutions`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`name`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: ["Universidad de Córdoba (Demo)"][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Universidad de Córdoba (Demo)
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Program`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Program_id`[0m[37m,[0m [37m`Program`[0m[37m.[0m[37m`name`[0m [94mAS[0m [37m`Program_name`[0m[37m,[0m [37m`Program`[0m[37m.[0m[37m`maxSemesters`[0m [94mAS[0m [37m`Program_maxSemesters`[0m[37m,[0m [37m`Program`[0m[37m.[0m[37m`institutionId`[0m [94mAS[0m [37m`Program_institutionId`[0m [94mFROM[0m [37m`programs`[0m [37m`Program`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`Program`[0m[37m.[0m[37m`name`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Program`[0m[37m.[0m[37m`institutionId`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: ["Ingeniería de Sistemas (Demo)",1][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`programs`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`name`[0m[37m,[0m [37m`maxSemesters`[0m[37m,[0m [37m`institutionId`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: ["Ingeniería de Sistemas (Demo)",10,1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Ingeniería de Sistemas (Demo)

Usuarios
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`User`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`User_id`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`email`[0m [94mAS[0m [37m`User_email`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`fullName`[0m [94mAS[0m [37m`User_fullName`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`User_role`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`User_isActive`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`User_createdAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`User_updatedAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`User_deletedAt`[0m [94mFROM[0m [37m`users`[0m [37m`User`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`User`[0m[37m.[0m[37m`email`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: ["docente.demo@stire.local"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`email`[0m[37m,[0m [37m`password`[0m[37m,[0m [37m`fullName`[0m[37m,[0m [37m`role`[0m[37m,[0m [37m`isActive`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["docente.demo@stire.local","$2b$10$BcpsbGHV2LB6clpX.bzQQu.aLixhgsXvOvPN69GpkfIvjUlDu6SlG","Docente Demo","docente",1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`User`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`User_id`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`User_role`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`User_isActive`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`User_createdAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`User_updatedAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`User_deletedAt`[0m [94mFROM[0m [37m`users`[0m [37m`User`[0m [94mWHERE[0m [37m([0m [37m`User`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: docente.demo@stire.local
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`User`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`User_id`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`email`[0m [94mAS[0m [37m`User_email`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`fullName`[0m [94mAS[0m [37m`User_fullName`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`User_role`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`User_isActive`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`User_createdAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`User_updatedAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`User_deletedAt`[0m [94mFROM[0m [37m`users`[0m [37m`User`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`User`[0m[37m.[0m[37m`email`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: ["estudiante1.demo@stire.local"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`email`[0m[37m,[0m [37m`password`[0m[37m,[0m [37m`fullName`[0m[37m,[0m [37m`role`[0m[37m,[0m [37m`isActive`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["estudiante1.demo@stire.local","$2b$10$BcpsbGHV2LB6clpX.bzQQu.aLixhgsXvOvPN69GpkfIvjUlDu6SlG","Estudiante Demo 1","estudiante",1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`User`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`User_id`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`User_role`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`User_isActive`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`User_createdAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`User_updatedAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`User_deletedAt`[0m [94mFROM[0m [37m`users`[0m [37m`User`[0m [94mWHERE[0m [37m([0m [37m`User`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [2][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: estudiante1.demo@stire.local
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`User`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`User_id`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`email`[0m [94mAS[0m [37m`User_email`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`fullName`[0m [94mAS[0m [37m`User_fullName`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`User_role`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`User_isActive`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`User_createdAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`User_updatedAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`User_deletedAt`[0m [94mFROM[0m [37m`users`[0m [37m`User`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`User`[0m[37m.[0m[37m`email`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: ["estudiante2.demo@stire.local"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`email`[0m[37m,[0m [37m`password`[0m[37m,[0m [37m`fullName`[0m[37m,[0m [37m`role`[0m[37m,[0m [37m`isActive`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["estudiante2.demo@stire.local","$2b$10$BcpsbGHV2LB6clpX.bzQQu.aLixhgsXvOvPN69GpkfIvjUlDu6SlG","Estudiante Demo 2","estudiante",1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`User`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`User_id`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`User_role`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`User_isActive`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`User_createdAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`User_updatedAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`User_deletedAt`[0m [94mFROM[0m [37m`users`[0m [37m`User`[0m [94mWHERE[0m [37m([0m [37m`User`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [3][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: estudiante2.demo@stire.local
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`User`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`User_id`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`email`[0m [94mAS[0m [37m`User_email`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`fullName`[0m [94mAS[0m [37m`User_fullName`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`User_role`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`User_isActive`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`User_createdAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`User_updatedAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`User_deletedAt`[0m [94mFROM[0m [37m`users`[0m [37m`User`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`User`[0m[37m.[0m[37m`email`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: ["estudiante3.demo@stire.local"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`users`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`email`[0m[37m,[0m [37m`password`[0m[37m,[0m [37m`fullName`[0m[37m,[0m [37m`role`[0m[37m,[0m [37m`isActive`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["estudiante3.demo@stire.local","$2b$10$BcpsbGHV2LB6clpX.bzQQu.aLixhgsXvOvPN69GpkfIvjUlDu6SlG","Estudiante Demo 3","estudiante",1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`User`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`User_id`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`User_role`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`User_isActive`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`User_createdAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`User_updatedAt`[0m[37m,[0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`User_deletedAt`[0m [94mFROM[0m [37m`users`[0m [37m`User`[0m [94mWHERE[0m [37m([0m [37m`User`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`User`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [4][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: estudiante3.demo@stire.local

Clase y matrículas
[90m[4mquery:[24m[39m [94mSELECT DISTINCT[0m [37m`distinctAlias`[0m[37m.[0m[37m`Class_id`[0m [94mAS[0m [37m`ids_Class_id`[0m [94mFROM[0m [37m([0m[94mSELECT[0m [37m`Class`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Class_id`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`name`[0m [94mAS[0m [37m`Class_name`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`description`[0m [94mAS[0m [37m`Class_description`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`code`[0m [94mAS[0m [37m`Class_code`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`teacherId`[0m [94mAS[0m [37m`Class_teacherId`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`Class_isActive`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`requiresApproval`[0m [94mAS[0m [37m`Class_requiresApproval`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`startDate`[0m [94mAS[0m [37m`Class_startDate`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`endDate`[0m [94mAS[0m [37m`Class_endDate`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`maxStudents`[0m [94mAS[0m [37m`Class_maxStudents`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Class_createdAt`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Class_updatedAt`[0m[37m,[0m [37m`Class__teacher`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Class__teacher_id`[0m[37m,[0m [37m`Class__teacher`[0m[37m.[0m[37m`email`[0m [94mAS[0m [37m`Class__teacher_email`[0m[37m,[0m [37m`Class__teacher`[0m[37m.[0m[37m`fullName`[0m [94mAS[0m [37m`Class__teacher_fullName`[0m[37m,[0m [37m`Class__teacher`[0m[37m.[0m[37m`role`[0m [94mAS[0m [37m`Class__teacher_role`[0m[37m,[0m [37m`Class__teacher`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`Class__teacher_isActive`[0m[37m,[0m [37m`Class__teacher`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Class__teacher_createdAt`[0m[37m,[0m [37m`Class__teacher`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Class__teacher_updatedAt`[0m[37m,[0m [37m`Class__teacher`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Class__teacher_deletedAt`[0m [94mFROM[0m [37m`classes`[0m [37m`Class`[0m [94mLEFT JOIN[0m [37m`users`[0m [37m`Class__teacher`[0m [94mON[0m [37m`Class__teacher`[0m[37m.[0m[37m`id`[0m[37m=[0m[37m`Class`[0m[37m.[0m[37m`teacherId`[0m [94mAND[0m [37m([0m[37m`Class__teacher`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m[37m)[0m [94mWHERE[0m [37m([0m[37m([0m[37m`Class`[0m[37m.[0m[37m`code`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m[37m)[0m [37m`distinctAlias`[0m [94mORDER BY[0m [37m`Class_id`[0m [94mASC[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: ["DEMO-STIRE-01"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`classes`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`name`[0m[37m,[0m [37m`description`[0m[37m,[0m [37m`code`[0m[37m,[0m [37m`teacherId`[0m[37m,[0m [37m`isActive`[0m[37m,[0m [37m`requiresApproval`[0m[37m,[0m [37m`startDate`[0m[37m,[0m [37m`endDate`[0m[37m,[0m [37m`maxStudents`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["Fundamentos de Algoritmia — Demo","Clase de demostración generada por db:seed:demo.","DEMO-STIRE-01",1,1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Class`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Class_id`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`Class_isActive`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`requiresApproval`[0m [94mAS[0m [37m`Class_requiresApproval`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Class_createdAt`[0m[37m,[0m [37m`Class`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Class_updatedAt`[0m [94mFROM[0m [37m`classes`[0m [37m`Class`[0m [94mWHERE[0m [37m`Class`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Fundamentos de Algoritmia — Demo (DEMO-STIRE-01)
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Enrollment_id`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`classId`[0m [94mAS[0m [37m`Enrollment_classId`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`studentId`[0m [94mAS[0m [37m`Enrollment_studentId`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Enrollment_status`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`joined_at`[0m [94mAS[0m [37m`Enrollment_joined_at`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`left_at`[0m [94mAS[0m [37m`Enrollment_left_at`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`last_activity_at`[0m [94mAS[0m [37m`Enrollment_last_activity_at`[0m [94mFROM[0m [37m`enrollments`[0m [37m`Enrollment`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`Enrollment`[0m[37m.[0m[37m`classId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Enrollment`[0m[37m.[0m[37m`studentId`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,2][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`enrollments`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`classId`[0m[37m,[0m [37m`studentId`[0m[37m,[0m [37m`status`[0m[37m,[0m [37m`joined_at`[0m[37m,[0m [37m`left_at`[0m[37m,[0m [37m`last_activity_at`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["fb34dd68-9d05-4936-8a3d-b91472f6855c",1,2,"active"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Enrollment_id`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Enrollment_status`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`joined_at`[0m [94mAS[0m [37m`Enrollment_joined_at`[0m [94mFROM[0m [37m`enrollments`[0m [37m`Enrollment`[0m [94mWHERE[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [90m-- PARAMETERS: ["fb34dd68-9d05-4936-8a3d-b91472f6855c"][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: estudiante1.demo@stire.local matriculado en DEMO-STIRE-01
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Enrollment_id`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`classId`[0m [94mAS[0m [37m`Enrollment_classId`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`studentId`[0m [94mAS[0m [37m`Enrollment_studentId`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Enrollment_status`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`joined_at`[0m [94mAS[0m [37m`Enrollment_joined_at`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`left_at`[0m [94mAS[0m [37m`Enrollment_left_at`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`last_activity_at`[0m [94mAS[0m [37m`Enrollment_last_activity_at`[0m [94mFROM[0m [37m`enrollments`[0m [37m`Enrollment`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`Enrollment`[0m[37m.[0m[37m`classId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Enrollment`[0m[37m.[0m[37m`studentId`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,3][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`enrollments`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`classId`[0m[37m,[0m [37m`studentId`[0m[37m,[0m [37m`status`[0m[37m,[0m [37m`joined_at`[0m[37m,[0m [37m`left_at`[0m[37m,[0m [37m`last_activity_at`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["49932d84-781f-4337-a199-b697db8088fc",1,3,"active"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Enrollment_id`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Enrollment_status`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`joined_at`[0m [94mAS[0m [37m`Enrollment_joined_at`[0m [94mFROM[0m [37m`enrollments`[0m [37m`Enrollment`[0m [94mWHERE[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [90m-- PARAMETERS: ["49932d84-781f-4337-a199-b697db8088fc"][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: estudiante2.demo@stire.local matriculado en DEMO-STIRE-01
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Enrollment_id`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`classId`[0m [94mAS[0m [37m`Enrollment_classId`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`studentId`[0m [94mAS[0m [37m`Enrollment_studentId`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Enrollment_status`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`joined_at`[0m [94mAS[0m [37m`Enrollment_joined_at`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`left_at`[0m [94mAS[0m [37m`Enrollment_left_at`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`last_activity_at`[0m [94mAS[0m [37m`Enrollment_last_activity_at`[0m [94mFROM[0m [37m`enrollments`[0m [37m`Enrollment`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`Enrollment`[0m[37m.[0m[37m`classId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Enrollment`[0m[37m.[0m[37m`studentId`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,4][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`enrollments`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`classId`[0m[37m,[0m [37m`studentId`[0m[37m,[0m [37m`status`[0m[37m,[0m [37m`joined_at`[0m[37m,[0m [37m`left_at`[0m[37m,[0m [37m`last_activity_at`[0m[37m)[0m [94mVALUES[0m [37m([0m[37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["d67b82e1-77fc-421f-9970-e77b167fb8f0",1,4,"active"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Enrollment_id`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Enrollment_status`[0m[37m,[0m [37m`Enrollment`[0m[37m.[0m[37m`joined_at`[0m [94mAS[0m [37m`Enrollment_joined_at`[0m [94mFROM[0m [37m`enrollments`[0m [37m`Enrollment`[0m [94mWHERE[0m [37m`Enrollment`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [90m-- PARAMETERS: ["d67b82e1-77fc-421f-9970-e77b167fb8f0"][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: estudiante3.demo@stire.local matriculado en DEMO-STIRE-01

Sección, topic y unidades de aprendizaje (con prerrequisito)
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Section`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Section_id`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`Section_title`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`description`[0m [94mAS[0m [37m`Section_description`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Section_order`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`isPublished`[0m [94mAS[0m [37m`Section_isPublished`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`classId`[0m [94mAS[0m [37m`Section_classId`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Section_createdAt`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Section_updatedAt`[0m [94mFROM[0m [37m`sections`[0m [37m`Section`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`Section`[0m[37m.[0m[37m`classId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Section`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,"Módulo 1: Fundamentos"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`sections`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`description`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`isPublished`[0m[37m,[0m [37m`classId`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["Módulo 1: Fundamentos","Primer módulo de la clase de demo.",0,1,1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Section`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Section_id`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Section_order`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`isPublished`[0m [94mAS[0m [37m`Section_isPublished`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Section_createdAt`[0m[37m,[0m [37m`Section`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Section_updatedAt`[0m [94mFROM[0m [37m`sections`[0m [37m`Section`[0m [94mWHERE[0m [37m`Section`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Módulo 1: Fundamentos
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Topic`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Topic_id`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`Topic_title`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`description`[0m [94mAS[0m [37m`Topic_description`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Topic_order`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`Topic_isActive`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`sectionId`[0m [94mAS[0m [37m`Topic_sectionId`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Topic_createdAt`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Topic_updatedAt`[0m [94mFROM[0m [37m`topics`[0m [37m`Topic`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`Topic`[0m[37m.[0m[37m`sectionId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Topic`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,"Tema 1: Bases de la programación"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`topics`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`description`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`isActive`[0m[37m,[0m [37m`sectionId`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["Tema 1: Bases de la programación","Variables, tipos de datos y estructuras de control.",0,1,1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Topic`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Topic_id`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Topic_order`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`Topic_isActive`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Topic_createdAt`[0m[37m,[0m [37m`Topic`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Topic_updatedAt`[0m [94mFROM[0m [37m`topics`[0m [37m`Topic`[0m [94mWHERE[0m [37m`Topic`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Tema 1: Bases de la programación
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`LearningUnit`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`LearningUnit_id`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`LearningUnit_title`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`description`[0m [94mAS[0m [37m`LearningUnit_description`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`LearningUnit_difficulty`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`LearningUnit_order`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`LearningUnit_isActive`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`topicId`[0m [94mAS[0m [37m`LearningUnit_topicId`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`LearningUnit_createdAt`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`LearningUnit_updatedAt`[0m [94mFROM[0m [37m`learning_units`[0m [37m`LearningUnit`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`LearningUnit`[0m[37m.[0m[37m`topicId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`LearningUnit`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,"Unidad 1: Variables y tipos de datos"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`learning_units`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`description`[0m[37m,[0m [37m`difficulty`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`isActive`[0m[37m,[0m [37m`topicId`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["Unidad 1: Variables y tipos de datos","Declaración, asignación y tipos primitivos.","basico",0,1,1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`LearningUnit`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`LearningUnit_id`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`LearningUnit_difficulty`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`LearningUnit_order`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`LearningUnit_isActive`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`LearningUnit_createdAt`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`LearningUnit_updatedAt`[0m [94mFROM[0m [37m`learning_units`[0m [37m`LearningUnit`[0m [94mWHERE[0m [37m`LearningUnit`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Unidad 1: Variables y tipos de datos
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`LearningUnit`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`LearningUnit_id`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`LearningUnit_title`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`description`[0m [94mAS[0m [37m`LearningUnit_description`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`LearningUnit_difficulty`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`LearningUnit_order`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`LearningUnit_isActive`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`topicId`[0m [94mAS[0m [37m`LearningUnit_topicId`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`LearningUnit_createdAt`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`LearningUnit_updatedAt`[0m [94mFROM[0m [37m`learning_units`[0m [37m`LearningUnit`[0m [94mWHERE[0m [37m([0m[37m([0m[37m`LearningUnit`[0m[37m.[0m[37m`topicId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`LearningUnit`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,"Unidad 2: Estructuras de control"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`learning_units`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`description`[0m[37m,[0m [37m`difficulty`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`isActive`[0m[37m,[0m [37m`topicId`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["Unidad 2: Estructuras de control","Condicionales if/else y su lógica de decisión.","basico",1,1,1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`LearningUnit`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`LearningUnit_id`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`LearningUnit_difficulty`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`LearningUnit_order`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`isActive`[0m [94mAS[0m [37m`LearningUnit_isActive`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`LearningUnit_createdAt`[0m[37m,[0m [37m`LearningUnit`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`LearningUnit_updatedAt`[0m [94mFROM[0m [37m`learning_units`[0m [37m`LearningUnit`[0m [94mWHERE[0m [37m`LearningUnit`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [90m-- PARAMETERS: [2][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Unidad 2: Estructuras de control
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Prerequisite`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Prerequisite_id`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Prerequisite_createdAt`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Prerequisite_updatedAt`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Prerequisite_deletedAt`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`targetUnitId`[0m [94mAS[0m [37m`Prerequisite_targetUnitId`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`requiredUnitId`[0m [94mAS[0m [37m`Prerequisite_requiredUnitId`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`minMasteryRequired`[0m [94mAS[0m [37m`Prerequisite_minMasteryRequired`[0m [94mFROM[0m [37m`prerequisites`[0m [37m`Prerequisite`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`Prerequisite`[0m[37m.[0m[37m`targetUnitId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Prerequisite`[0m[37m.[0m[37m`requiredUnitId`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`Prerequisite`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [2,1][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`prerequisites`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`targetUnitId`[0m[37m,[0m [37m`requiredUnitId`[0m[37m,[0m [37m`minMasteryRequired`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [2,1,60][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Prerequisite`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Prerequisite_id`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Prerequisite_createdAt`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Prerequisite_updatedAt`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Prerequisite_deletedAt`[0m[37m,[0m [37m`Prerequisite`[0m[37m.[0m[37m`minMasteryRequired`[0m [94mAS[0m [37m`Prerequisite_minMasteryRequired`[0m [94mFROM[0m [37m`prerequisites`[0m [37m`Prerequisite`[0m [94mWHERE[0m [37m([0m [37m`Prerequisite`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`Prerequisite`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Unidad 2 requiere Unidad 1 (mastery ≥ 60%)

Contenido teórico
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Content`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Content_id`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Content_createdAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Content_updatedAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Content_deletedAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`learningUnitId`[0m [94mAS[0m [37m`Content_learningUnitId`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`Content_title`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`type`[0m [94mAS[0m [37m`Content_type`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`body`[0m [94mAS[0m [37m`Content_body`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`metadata`[0m [94mAS[0m [37m`Content_metadata`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Content_order`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`isVisible`[0m [94mAS[0m [37m`Content_isVisible`[0m [94mFROM[0m [37m`contents`[0m [37m`Content`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`Content`[0m[37m.[0m[37m`learningUnitId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Content`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`Content`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,"Introducción a las variables"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`contents`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`learningUnitId`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`type`[0m[37m,[0m [37m`body`[0m[37m,[0m [37m`metadata`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`isVisible`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1,"Introducción a las variables","markdown","# Variables\n\nUna **variable** es un espacio de memoria con un nombre, donde se guarda un valor que puede cambiar durante la ejecución del programa.\n\n```javascript\nlet edad = 20;\nconst nombre = \"Ana\";\n```\n\n`let` declara una variable que puede reasignarse; `const` declara una que no.",0,1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Content`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Content_id`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Content_createdAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Content_updatedAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Content_deletedAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Content_order`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`isVisible`[0m [94mAS[0m [37m`Content_isVisible`[0m [94mFROM[0m [37m`contents`[0m [37m`Content`[0m [94mWHERE[0m [37m([0m [37m`Content`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`Content`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Introducción a las variables (Unidad 1)
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Content`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Content_id`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Content_createdAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Content_updatedAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Content_deletedAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`learningUnitId`[0m [94mAS[0m [37m`Content_learningUnitId`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`Content_title`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`type`[0m [94mAS[0m [37m`Content_type`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`body`[0m [94mAS[0m [37m`Content_body`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`metadata`[0m [94mAS[0m [37m`Content_metadata`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Content_order`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`isVisible`[0m [94mAS[0m [37m`Content_isVisible`[0m [94mFROM[0m [37m`contents`[0m [37m`Content`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`Content`[0m[37m.[0m[37m`learningUnitId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Content`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`Content`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [2,"Condicionales if/else"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`contents`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`learningUnitId`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`type`[0m[37m,[0m [37m`body`[0m[37m,[0m [37m`metadata`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`isVisible`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [2,"Condicionales if/else","markdown","# Condicionales\n\nUn condicional ejecuta un bloque de código solo si una condición es verdadera.\n\n```javascript\nif (edad >= 18) {\n  console.log(\"mayor de edad\");\n} else {\n  console.log(\"menor de edad\");\n}\n```",0,1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Content`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Content_id`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Content_createdAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Content_updatedAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Content_deletedAt`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Content_order`[0m[37m,[0m [37m`Content`[0m[37m.[0m[37m`isVisible`[0m [94mAS[0m [37m`Content_isVisible`[0m [94mFROM[0m [37m`contents`[0m [37m`Content`[0m [94mWHERE[0m [37m([0m [37m`Content`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`Content`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [2][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Condicionales if/else (Unidad 2)

Tipo de actividad y actividades (MCQ, CODING, FILL_CODE)
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`ActivityType`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`ActivityType_id`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`ActivityType_createdAt`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`ActivityType_updatedAt`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`ActivityType_deletedAt`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`name`[0m [94mAS[0m [37m`ActivityType_name`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`code`[0m [94mAS[0m [37m`ActivityType_code`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`autoGradable`[0m [94mAS[0m [37m`ActivityType_autoGradable`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`baseWeight`[0m [94mAS[0m [37m`ActivityType_baseWeight`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`configSchema`[0m [94mAS[0m [37m`ActivityType_configSchema`[0m [94mFROM[0m [37m`activity_types`[0m [37m`ActivityType`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`ActivityType`[0m[37m.[0m[37m`code`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`ActivityType`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: ["DEMO-AUTO"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`activity_types`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`name`[0m[37m,[0m [37m`code`[0m[37m,[0m [37m`autoGradable`[0m[37m,[0m [37m`baseWeight`[0m[37m,[0m [37m`configSchema`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m)[0m [90m-- PARAMETERS: ["Ejercicio Autocalificable (Demo)","DEMO-AUTO",true,1][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`ActivityType`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`ActivityType_id`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`ActivityType_createdAt`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`ActivityType_updatedAt`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`ActivityType_deletedAt`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`autoGradable`[0m [94mAS[0m [37m`ActivityType_autoGradable`[0m[37m,[0m [37m`ActivityType`[0m[37m.[0m[37m`baseWeight`[0m [94mAS[0m [37m`ActivityType_baseWeight`[0m [94mFROM[0m [37m`activity_types`[0m [37m`ActivityType`[0m [94mWHERE[0m [37m([0m [37m`ActivityType`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`ActivityType`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Ejercicio Autocalificable (Demo)
[90m[4mquery:[24m[39m [94mSELECT DISTINCT[0m [37m`distinctAlias`[0m[37m.[0m[37m`Activity_id`[0m [94mAS[0m [37m`ids_Activity_id`[0m [94mFROM[0m [37m([0m[94mSELECT[0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity_id`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity_createdAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity_updatedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity_deletedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`learningUnitId`[0m [94mAS[0m [37m`Activity_learningUnitId`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`activityTypeId`[0m [94mAS[0m [37m`Activity_activityTypeId`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdBy`[0m [94mAS[0m [37m`Activity_createdBy`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`Activity_title`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`description`[0m [94mAS[0m [37m`Activity_description`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`Activity_difficulty`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`totalPoints`[0m [94mAS[0m [37m`Activity_totalPoints`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`passingScore`[0m [94mAS[0m [37m`Activity_passingScore`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`attemptsAllowed`[0m [94mAS[0m [37m`Activity_attemptsAllowed`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`timeLimit`[0m [94mAS[0m [37m`Activity_timeLimit`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Activity_order`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Activity_status`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`isRequired`[0m [94mAS[0m [37m`Activity_isRequired`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`adaptiveWeight`[0m [94mAS[0m [37m`Activity_adaptiveWeight`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`publishedAt`[0m [94mAS[0m [37m`Activity_publishedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity__activityType_id`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity__activityType_createdAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity__activityType_updatedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity__activityType_deletedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`name`[0m [94mAS[0m [37m`Activity__activityType_name`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`code`[0m [94mAS[0m [37m`Activity__activityType_code`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`autoGradable`[0m [94mAS[0m [37m`Activity__activityType_autoGradable`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`baseWeight`[0m [94mAS[0m [37m`Activity__activityType_baseWeight`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`configSchema`[0m [94mAS[0m [37m`Activity__activityType_configSchema`[0m [94mFROM[0m [37m`activities`[0m [37m`Activity`[0m [94mLEFT JOIN[0m [37m`activity_types`[0m [37m`Activity__activityType`[0m [94mON[0m [37m`Activity__activityType`[0m[37m.[0m[37m`id`[0m[37m=[0m[37m`Activity`[0m[37m.[0m[37m`activityTypeId`[0m [94mAND[0m [37m([0m[37m`Activity__activityType`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m[37m)[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`Activity`[0m[37m.[0m[37m`learningUnitId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Activity`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m[37m)[0m [37m`distinctAlias`[0m [94mORDER BY[0m [37m`Activity_id`[0m [94mASC[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,"Quiz: ¿Qué es una variable?"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`activities`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`learningUnitId`[0m[37m,[0m [37m`activityTypeId`[0m[37m,[0m [37m`createdBy`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`description`[0m[37m,[0m [37m`difficulty`[0m[37m,[0m [37m`totalPoints`[0m[37m,[0m [37m`passingScore`[0m[37m,[0m [37m`attemptsAllowed`[0m[37m,[0m [37m`timeLimit`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`status`[0m[37m,[0m [37m`isRequired`[0m[37m,[0m [37m`adaptiveWeight`[0m[37m,[0m [37m`publishedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1,1,1,"Quiz: ¿Qué es una variable?","Pregunta de opción múltiple sobre declaración de variables.","basico",10,60,3,0,"published",false,1,"2026-09-21T22:22:06.367Z"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity_id`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity_createdAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity_updatedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity_deletedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`Activity_difficulty`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`totalPoints`[0m [94mAS[0m [37m`Activity_totalPoints`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`passingScore`[0m [94mAS[0m [37m`Activity_passingScore`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`attemptsAllowed`[0m [94mAS[0m [37m`Activity_attemptsAllowed`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Activity_order`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Activity_status`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`isRequired`[0m [94mAS[0m [37m`Activity_isRequired`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`adaptiveWeight`[0m [94mAS[0m [37m`Activity_adaptiveWeight`[0m [94mFROM[0m [37m`activities`[0m [37m`Activity`[0m [94mWHERE[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Quiz: ¿Qué es una variable? (MCQ)
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`ActivityQuestion_id`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`ActivityQuestion_createdAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`ActivityQuestion_updatedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`ActivityQuestion_deletedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`activityId`[0m [94mAS[0m [37m`ActivityQuestion_activityId`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`type`[0m [94mAS[0m [37m`ActivityQuestion_type`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`question`[0m [94mAS[0m [37m`ActivityQuestion_question`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`points`[0m [94mAS[0m [37m`ActivityQuestion_points`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`ActivityQuestion_order`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`config`[0m [94mAS[0m [37m`ActivityQuestion_config`[0m [94mFROM[0m [37m`activity_questions`[0m [37m`ActivityQuestion`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`ActivityQuestion`[0m[37m.[0m[37m`activityId`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`activity_questions`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`activityId`[0m[37m,[0m [37m`type`[0m[37m,[0m [37m`question`[0m[37m,[0m [37m`points`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`config`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1,"mcq","¿Cuál de las siguientes es una declaración válida de variable en JavaScript?",10,0,"{\"options\":[{\"id\":\"a\",\"text\":\"let x = 5;\"},{\"id\":\"b\",\"text\":\"variable x = 5\"},{\"id\":\"c\",\"text\":\"int x = 5;\"},{\"id\":\"d\",\"text\":\"5 = x;\"}],\"correctAnswerId\":\"a\",\"explanation\":\"\\\"let\\\" es la forma correcta de declarar una variable reasignable en JavaScript.\"}"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`ActivityQuestion_id`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`ActivityQuestion_createdAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`ActivityQuestion_updatedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`ActivityQuestion_deletedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`points`[0m [94mAS[0m [37m`ActivityQuestion_points`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`ActivityQuestion_order`[0m [94mFROM[0m [37m`activity_questions`[0m [37m`ActivityQuestion`[0m [94mWHERE[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [1][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: pregunta MCQ de la actividad
[90m[4mquery:[24m[39m [94mSELECT DISTINCT[0m [37m`distinctAlias`[0m[37m.[0m[37m`Activity_id`[0m [94mAS[0m [37m`ids_Activity_id`[0m [94mFROM[0m [37m([0m[94mSELECT[0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity_id`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity_createdAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity_updatedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity_deletedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`learningUnitId`[0m [94mAS[0m [37m`Activity_learningUnitId`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`activityTypeId`[0m [94mAS[0m [37m`Activity_activityTypeId`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdBy`[0m [94mAS[0m [37m`Activity_createdBy`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`Activity_title`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`description`[0m [94mAS[0m [37m`Activity_description`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`Activity_difficulty`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`totalPoints`[0m [94mAS[0m [37m`Activity_totalPoints`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`passingScore`[0m [94mAS[0m [37m`Activity_passingScore`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`attemptsAllowed`[0m [94mAS[0m [37m`Activity_attemptsAllowed`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`timeLimit`[0m [94mAS[0m [37m`Activity_timeLimit`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Activity_order`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Activity_status`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`isRequired`[0m [94mAS[0m [37m`Activity_isRequired`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`adaptiveWeight`[0m [94mAS[0m [37m`Activity_adaptiveWeight`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`publishedAt`[0m [94mAS[0m [37m`Activity_publishedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity__activityType_id`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity__activityType_createdAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity__activityType_updatedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity__activityType_deletedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`name`[0m [94mAS[0m [37m`Activity__activityType_name`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`code`[0m [94mAS[0m [37m`Activity__activityType_code`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`autoGradable`[0m [94mAS[0m [37m`Activity__activityType_autoGradable`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`baseWeight`[0m [94mAS[0m [37m`Activity__activityType_baseWeight`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`configSchema`[0m [94mAS[0m [37m`Activity__activityType_configSchema`[0m [94mFROM[0m [37m`activities`[0m [37m`Activity`[0m [94mLEFT JOIN[0m [37m`activity_types`[0m [37m`Activity__activityType`[0m [94mON[0m [37m`Activity__activityType`[0m[37m.[0m[37m`id`[0m[37m=[0m[37m`Activity`[0m[37m.[0m[37m`activityTypeId`[0m [94mAND[0m [37m([0m[37m`Activity__activityType`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m[37m)[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`Activity`[0m[37m.[0m[37m`learningUnitId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Activity`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m[37m)[0m [37m`distinctAlias`[0m [94mORDER BY[0m [37m`Activity_id`[0m [94mASC[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [1,"Ejercicio: Suma de dos números"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`activities`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`learningUnitId`[0m[37m,[0m [37m`activityTypeId`[0m[37m,[0m [37m`createdBy`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`description`[0m[37m,[0m [37m`difficulty`[0m[37m,[0m [37m`totalPoints`[0m[37m,[0m [37m`passingScore`[0m[37m,[0m [37m`attemptsAllowed`[0m[37m,[0m [37m`timeLimit`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`status`[0m[37m,[0m [37m`isRequired`[0m[37m,[0m [37m`adaptiveWeight`[0m[37m,[0m [37m`publishedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [1,1,1,"Ejercicio: Suma de dos números","Lee dos números desde la entrada estándar (uno por línea) e imprime su suma.","basico",20,60,3,1,"published",false,1,"2026-09-21T22:22:06.405Z"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity_id`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity_createdAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity_updatedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity_deletedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`Activity_difficulty`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`totalPoints`[0m [94mAS[0m [37m`Activity_totalPoints`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`passingScore`[0m [94mAS[0m [37m`Activity_passingScore`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`attemptsAllowed`[0m [94mAS[0m [37m`Activity_attemptsAllowed`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Activity_order`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Activity_status`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`isRequired`[0m [94mAS[0m [37m`Activity_isRequired`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`adaptiveWeight`[0m [94mAS[0m [37m`Activity_adaptiveWeight`[0m [94mFROM[0m [37m`activities`[0m [37m`Activity`[0m [94mWHERE[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [2][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Ejercicio: Suma de dos números (CODING)
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`ActivityQuestion_id`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`ActivityQuestion_createdAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`ActivityQuestion_updatedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`ActivityQuestion_deletedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`activityId`[0m [94mAS[0m [37m`ActivityQuestion_activityId`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`type`[0m [94mAS[0m [37m`ActivityQuestion_type`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`question`[0m [94mAS[0m [37m`ActivityQuestion_question`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`points`[0m [94mAS[0m [37m`ActivityQuestion_points`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`ActivityQuestion_order`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`config`[0m [94mAS[0m [37m`ActivityQuestion_config`[0m [94mFROM[0m [37m`activity_questions`[0m [37m`ActivityQuestion`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`ActivityQuestion`[0m[37m.[0m[37m`activityId`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [2][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`activity_questions`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`activityId`[0m[37m,[0m [37m`type`[0m[37m,[0m [37m`question`[0m[37m,[0m [37m`points`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`config`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [2,"coding","Escribe un programa en JavaScript que lea dos números (uno por línea) desde la entrada estándar e imprima su suma.",20,0,"{\"language\":\"javascript\",\"testCases\":[{\"label\":\"público\",\"input\":\"5\\n3\",\"expected\":\"8\",\"isPublic\":true},{\"label\":\"oculto\",\"input\":\"10\\n20\",\"expected\":\"30\",\"isPublic\":false}]}"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`ActivityQuestion_id`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`ActivityQuestion_createdAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`ActivityQuestion_updatedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`ActivityQuestion_deletedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`points`[0m [94mAS[0m [37m`ActivityQuestion_points`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`ActivityQuestion_order`[0m [94mFROM[0m [37m`activity_questions`[0m [37m`ActivityQuestion`[0m [94mWHERE[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [2][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: pregunta CODING de la actividad (con testCase público)
[90m[4mquery:[24m[39m [94mSELECT DISTINCT[0m [37m`distinctAlias`[0m[37m.[0m[37m`Activity_id`[0m [94mAS[0m [37m`ids_Activity_id`[0m [94mFROM[0m [37m([0m[94mSELECT[0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity_id`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity_createdAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity_updatedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity_deletedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`learningUnitId`[0m [94mAS[0m [37m`Activity_learningUnitId`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`activityTypeId`[0m [94mAS[0m [37m`Activity_activityTypeId`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdBy`[0m [94mAS[0m [37m`Activity_createdBy`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`title`[0m [94mAS[0m [37m`Activity_title`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`description`[0m [94mAS[0m [37m`Activity_description`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`Activity_difficulty`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`totalPoints`[0m [94mAS[0m [37m`Activity_totalPoints`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`passingScore`[0m [94mAS[0m [37m`Activity_passingScore`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`attemptsAllowed`[0m [94mAS[0m [37m`Activity_attemptsAllowed`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`timeLimit`[0m [94mAS[0m [37m`Activity_timeLimit`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Activity_order`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Activity_status`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`isRequired`[0m [94mAS[0m [37m`Activity_isRequired`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`adaptiveWeight`[0m [94mAS[0m [37m`Activity_adaptiveWeight`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`publishedAt`[0m [94mAS[0m [37m`Activity_publishedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity__activityType_id`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity__activityType_createdAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity__activityType_updatedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity__activityType_deletedAt`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`name`[0m [94mAS[0m [37m`Activity__activityType_name`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`code`[0m [94mAS[0m [37m`Activity__activityType_code`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`autoGradable`[0m [94mAS[0m [37m`Activity__activityType_autoGradable`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`baseWeight`[0m [94mAS[0m [37m`Activity__activityType_baseWeight`[0m[37m,[0m [37m`Activity__activityType`[0m[37m.[0m[37m`configSchema`[0m [94mAS[0m [37m`Activity__activityType_configSchema`[0m [94mFROM[0m [37m`activities`[0m [37m`Activity`[0m [94mLEFT JOIN[0m [37m`activity_types`[0m [37m`Activity__activityType`[0m [94mON[0m [37m`Activity__activityType`[0m[37m.[0m[37m`id`[0m[37m=[0m[37m`Activity`[0m[37m.[0m[37m`activityTypeId`[0m [94mAND[0m [37m([0m[37m`Activity__activityType`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m[37m)[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`Activity`[0m[37m.[0m[37m`learningUnitId`[0m [37m=[0m [37m?[0m[37m)[0m [94mAND[0m [37m([0m[37m`Activity`[0m[37m.[0m[37m`title`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m[37m)[0m [37m`distinctAlias`[0m [94mORDER BY[0m [37m`Activity_id`[0m [94mASC[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [2,"Completa el condicional"][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`activities`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`learningUnitId`[0m[37m,[0m [37m`activityTypeId`[0m[37m,[0m [37m`createdBy`[0m[37m,[0m [37m`title`[0m[37m,[0m [37m`description`[0m[37m,[0m [37m`difficulty`[0m[37m,[0m [37m`totalPoints`[0m[37m,[0m [37m`passingScore`[0m[37m,[0m [37m`attemptsAllowed`[0m[37m,[0m [37m`timeLimit`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`status`[0m[37m,[0m [37m`isRequired`[0m[37m,[0m [37m`adaptiveWeight`[0m[37m,[0m [37m`publishedAt`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [2,1,1,"Completa el condicional","Rellena los espacios en blanco del código para que la lógica sea correcta.","basico",10,60,3,0,"published",false,1,"2026-09-21T22:22:06.426Z"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`Activity_id`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`Activity_createdAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`Activity_updatedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`Activity_deletedAt`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`difficulty`[0m [94mAS[0m [37m`Activity_difficulty`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`totalPoints`[0m [94mAS[0m [37m`Activity_totalPoints`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`passingScore`[0m [94mAS[0m [37m`Activity_passingScore`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`attemptsAllowed`[0m [94mAS[0m [37m`Activity_attemptsAllowed`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`Activity_order`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`status`[0m [94mAS[0m [37m`Activity_status`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`isRequired`[0m [94mAS[0m [37m`Activity_isRequired`[0m[37m,[0m [37m`Activity`[0m[37m.[0m[37m`adaptiveWeight`[0m [94mAS[0m [37m`Activity_adaptiveWeight`[0m [94mFROM[0m [37m`activities`[0m [37m`Activity`[0m [94mWHERE[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`Activity`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [3][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: Completa el condicional (FILL_CODE)
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`ActivityQuestion_id`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`ActivityQuestion_createdAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`ActivityQuestion_updatedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`ActivityQuestion_deletedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`activityId`[0m [94mAS[0m [37m`ActivityQuestion_activityId`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`type`[0m [94mAS[0m [37m`ActivityQuestion_type`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`question`[0m [94mAS[0m [37m`ActivityQuestion_question`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`points`[0m [94mAS[0m [37m`ActivityQuestion_points`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`ActivityQuestion_order`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`config`[0m [94mAS[0m [37m`ActivityQuestion_config`[0m [94mFROM[0m [37m`activity_questions`[0m [37m`ActivityQuestion`[0m [94mWHERE[0m [37m([0m [37m([0m[37m([0m[37m`ActivityQuestion`[0m[37m.[0m[37m`activityId`[0m [37m=[0m [37m?[0m[37m)[0m[37m)[0m [37m)[0m [94mAND[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [94mLIMIT[0m [32m1[0m [90m-- PARAMETERS: [3][0m
[90m[4mquery:[24m[39m [37mSTART[0m [37mTRANSACTION[0m
[90m[4mquery:[24m[39m [94mINSERT INTO[0m [37m`activity_questions`[0m[37m([0m[37m`id`[0m[37m,[0m [37m`createdAt`[0m[37m,[0m [37m`updatedAt`[0m[37m,[0m [37m`deletedAt`[0m[37m,[0m [37m`activityId`[0m[37m,[0m [37m`type`[0m[37m,[0m [37m`question`[0m[37m,[0m [37m`points`[0m[37m,[0m [37m`order`[0m[37m,[0m [37m`config`[0m[37m)[0m [94mVALUES[0m [37m([0m[94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [94mDEFAULT[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m,[0m [37m?[0m[37m)[0m [90m-- PARAMETERS: [3,"fill_code","Completa el condicional para que imprima \"mayor de edad\" cuando edad sea 18 o más.",10,0,"{\"codeTemplate\":\"if (edad ___b1___ 18) {\\n  console.log(\\\"mayor de edad\\\");\\n} ___b2___ {\\n  console.log(\\\"menor de edad\\\");\\n}\",\"blanks\":[{\"id\":\"b1\",\"answer\":\">=\"},{\"id\":\"b2\",\"answer\":\"else\"}]}"][0m
[90m[4mquery:[24m[39m [94mSELECT[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [94mAS[0m [37m`ActivityQuestion_id`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`createdAt`[0m [94mAS[0m [37m`ActivityQuestion_createdAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`updatedAt`[0m [94mAS[0m [37m`ActivityQuestion_updatedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mAS[0m [37m`ActivityQuestion_deletedAt`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`points`[0m [94mAS[0m [37m`ActivityQuestion_points`[0m[37m,[0m [37m`ActivityQuestion`[0m[37m.[0m[37m`order`[0m [94mAS[0m [37m`ActivityQuestion_order`[0m [94mFROM[0m [37m`activity_questions`[0m [37m`ActivityQuestion`[0m [94mWHERE[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`id`[0m [37m=[0m [37m?[0m [37m)[0m [94mAND[0m [37m([0m [37m`ActivityQuestion`[0m[37m.[0m[37m`deletedAt`[0m [94mIS NULL[0m [37m)[0m [90m-- PARAMETERS: [3][0m
[90m[4mquery:[24m[39m [94mCOMMIT[0m
  + creado: pregunta FILL_CODE de la actividad

✅ Seed de demo completo. Credenciales:
   docente.demo@stire.local       / Demo1234!
   estudiante1.demo@stire.local   / Demo1234!
   estudiante2.demo@stire.local   / Demo1234!
   estudiante3.demo@stire.local   / Demo1234!
   Clase: Fundamentos de Algoritmia — Demo (código DEMO-STIRE-01)

[verify:clean 6] npm run build

> stire@0.0.1 build
> nest build


[verify:clean] setup completo. Base de datos de verificacion: stire_verify_clean (puerto 3097). Continua scripts/verify-clean-server-check.js.
◇ injected env (20) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
login real contra el servidor recien levantado (docente de demo)
  login OK para docente.demo@stire.local (token recibido)
verificacion de datos sembrados via GET /enrollment/my
  OK, status 200
apagado del servidor

[verify:clean:server-check] limpieza: eliminar base de datos de verificacion stire_verify_clean

[verify:clean] TODO EN VERDE: npm ci -> migration:run -> db:seed:demo -> build -> start -> login real -> apagado.
(codigo de salida: 0)
```

---

## Ola del 20 de Septiembre — endurecimiento previo al despliegue y datos reales de administracion (posterior a v1.0.0-beta.1) · 20 de Septiembre de 2026

El tag `v1.0.0-beta.1` (commit `83b4a49`) marca la primera version con la identidad visual original. Esta ola es **posterior** a ese tag: cierra lo que impedia mostrar el sistema desplegado. **Este documento tampoco declara un veredicto de aptitud para produccion**: el despliegue en si (`S06-J03`) no se ha ejecutado.

### Puntos

| Punto | Commit | Resumen |
|---|---|---|
| Cabeceras de seguridad y Swagger | `0ab0f0f` | `helmet` y `/docs` apagado con `NODE_ENV=production` (`SWAGGER_ENABLED` lo fuerza). Verificado en vivo con el backend en modo produccion: `/docs` 404, cabeceras presentes, CORS intacto. 6 tests. |
| Dependencia `openai` | `5c464fc` | Retirada (14 paquetes); el Tutor usa solo Gemini (ADR 10). |
| Estado real del sistema para administracion | `4627e65` | `GET /admin/system/status` y `GET /admin/system/logs` (solo admin, 30/min): latencia p50/p95 de las ultimas 500 peticiones, ping a la BD, limites reales del sandbox, cola, Tutor, usuarios; ventana de 500 eventos con secretos redactados. Reemplaza las cifras inventadas de `ADM-V01`/`ADM-V03`. 27 tests. En vivo: 401 sin token, 403 a estudiante y docente, 200 con datos reales. |
| Repasos vencidos y enlace al contenido en el Tutor | `df840bb` | `GET /tutor/guidance` devuelve `dueReviews` y `contentLink` (unidad decidida en el servidor y solo si el estudiante puede leerla). 10 tests. En vivo: unidad ajena, ids basura y Tutor desactivado devuelven `null` sin error. |
| Tiempo de espera del arranque en `verify:clean` | `e79d4db` | `VERIFY_START_TIMEOUT_MS` (por defecto 60000, sin cambio). Ver la nota siguiente. |
| Subida de `mysql2` 3.19.1 -> 3.24.4 | `b369243` | Cierra los dos avisos de `npm audit` sobre `mysql2` (degradacion del plugin de autenticacion a `mysql_clear_password` y bomba de descompresion zlib). Subida menor dentro de `^3`, compatible con `typeorm` 0.3.31. `npm audit --omit=dev`: 19 -> 18 vulnerabilidades; el resto son herramientas de compilacion (`tar` via `sqlite3`, solo desarrollo), `multer` (instalado, pero la app no recibe archivos) y paquetes de `@nestjs/*` que solo se arreglan con Nest 12. |

Build limpio. **57 suites, 478 tests, todos en verde** (antes: 52 y 432).

### Nota de transparencia: la primera corrida de `verify:clean` de esta ola FALLO

La primera corrida completa termino en la fase de arranque: `el servidor no respondio en http://localhost:3097/docs dentro de 60000ms`, con el proceso del servidor sin escribir nada. **No se acepto como "problema del entorno" sin medirlo**, porque en esta ola se cambio justo `/docs`. Se comprobo:

- `waitForServer` acepta cualquier respuesta HTTP (`status !== null`), incluido un 404: apagar Swagger no puede provocar ese timeout.
- El mismo `dist/main.js`, recien reconstruido, abrio el puerto a los **73,9 s** en su primer arranque y a los **8,1 s** en el segundo, con la cache caliente (el rango de 8-13 s que `CLAUDE.md` ya documentaba como sano). El primer log de Nest aparece recien a los 73,7 s: el tiempo se va cargando modulos, antes de que Nest escriba nada.
- Causa mas respaldada: el repositorio vive dentro de OneDrive y `npm ci` acababa de recrear ~955 paquetes, que OneDrive y el antivirus escanean. No es un defecto del codigo, pero **una corrida que fallo no cierra la ola**.

Como `scripts/verify-clean-server-check.js` es un script de arranque, se hizo configurable el tiempo de espera (`e79d4db`) y `verify:clean` se repitio **completo** despues de ese commit, con `VERIFY_START_TIMEOUT_MS=180000`: paso con exit code 0. Como despues cambio `package-lock.json` (subida de `mysql2`, `b369243`), la regla de `CLAUDE.md` exige repetirlo otra vez: **la corrida de cierre valida es la siguiente**, tercera de la ola y posterior al ultimo cambio del lockfile. Resultado literal (exit code 0). Se omitieron unicamente las 198 lineas `query:` de la traza SQL de TypeORM de `migration:run` y `db:seed:demo`; todo lo demas esta tal cual:

```

> stire@0.0.1 verify:clean
> node scripts/verify-clean.js && node scripts/verify-clean-server-check.js


[verify:clean 1] rm -rf node_modules dist

[verify:clean 2] npm ci (instalacion exacta desde package-lock.json)

added 955 packages, and audited 956 packages in 1m

186 packages are looking for funding
  run `npm fund` for details

24 vulnerabilities (2 low, 3 moderate, 18 high, 1 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

[verify:clean 3] crear base de datos vacia de verificacion: stire_verify_clean

[verify:clean 4] migration:run contra la base de datos vacia

> stire@0.0.1 migration:run
> npx typeorm-ts-node-commonjs migration:run -d src/data-source.ts

◇ injected env (0) from .env // tip: ⌘ multiple files { path: ['.env.local', '.env'] }
0 migrations are already loaded in the database.
6 migrations were found in the source code.
6 migrations are new migrations must be executed.
Migration InitialSchema1779000000000 has been executed successfully.
Migration AddEaseFactorToReviewSchedules1788999128282 has been executed successfully.
Migration AddApprovalToClasses1789000000000 has been executed successfully.
Migration AddActiveSubmissionConstraint1789100000000 has been executed successfully.
Migration CreateTutorCredentials1789200000000 has been executed successfully.
Migration CreateTutorSettings1789300000000 has been executed successfully.

[verify:clean 5] db:seed:demo contra la base de datos vacia

> stire@0.0.1 db:seed:demo
> ts-node -r tsconfig-paths/register stire-seeder-demo.ts

◇ injected env (0) from .env // tip: ⌘ override existing { override: true }
Conectado a la base de datos. Sembrando datos de demo (idempotente)...

Institución y programa
  + creado: Universidad de Córdoba (Demo)
  + creado: Ingeniería de Sistemas (Demo)

Usuarios
  + creado: docente.demo@stire.local
  + creado: estudiante1.demo@stire.local
  + creado: estudiante2.demo@stire.local
  + creado: estudiante3.demo@stire.local

Clase y matrículas
  + creado: Fundamentos de Algoritmia — Demo (DEMO-STIRE-01)
  + creado: estudiante1.demo@stire.local matriculado en DEMO-STIRE-01
  + creado: estudiante2.demo@stire.local matriculado en DEMO-STIRE-01
  + creado: estudiante3.demo@stire.local matriculado en DEMO-STIRE-01

Sección, topic y unidades de aprendizaje (con prerrequisito)
  + creado: Módulo 1: Fundamentos
  + creado: Tema 1: Bases de la programación
  + creado: Unidad 1: Variables y tipos de datos
  + creado: Unidad 2: Estructuras de control
  + creado: Unidad 2 requiere Unidad 1 (mastery ≥ 60%)

Contenido teórico
  + creado: Introducción a las variables (Unidad 1)
  + creado: Condicionales if/else (Unidad 2)

Tipo de actividad y actividades (MCQ, CODING, FILL_CODE)
  + creado: Ejercicio Autocalificable (Demo)
  + creado: Quiz: ¿Qué es una variable? (MCQ)
  + creado: pregunta MCQ de la actividad
  + creado: Ejercicio: Suma de dos números (CODING)
  + creado: pregunta CODING de la actividad (con testCase público)
  + creado: Completa el condicional (FILL_CODE)
  + creado: pregunta FILL_CODE de la actividad

✅ Seed de demo completo. Credenciales:
   docente.demo@stire.local       / Demo1234!
   estudiante1.demo@stire.local   / Demo1234!
   estudiante2.demo@stire.local   / Demo1234!
   estudiante3.demo@stire.local   / Demo1234!
   Clase: Fundamentos de Algoritmia — Demo (código DEMO-STIRE-01)

[verify:clean 6] npm run build

> stire@0.0.1 build
> nest build


[verify:clean] setup completo. Base de datos de verificacion: stire_verify_clean (puerto 3097). Continua scripts/verify-clean-server-check.js.
◇ injected env (19) from .env // tip: ◈ secrets for agents [www.dotenvx.com]
login real contra el servidor recien levantado (docente de demo)
  login OK para docente.demo@stire.local (token recibido)
verificacion de datos sembrados via GET /enrollment/my
  OK, status 200
apagado del servidor

[verify:clean:server-check] limpieza: eliminar base de datos de verificacion stire_verify_clean

[verify:clean] TODO EN VERDE: npm ci -> migration:run -> db:seed:demo -> build -> start -> login real -> apagado.
CODIGO_SALIDA=0
```

En una maquina donde el arranque en frio cabe en 60 s no hace falta la variable.

---

## v0.5.0 — Cierre de Ola 3 de Remediacion · 26 de Agosto de 2026

Base: `docs/REAUDITORIA_OLA2.md` (reauditoria independiente sobre el commit final de Ola 2, `6fc50b3`) — la primera reauditoria de este proyecto que **bajo** la calificacion (5.1/10 -> ~4.4/10) en vez de subirla, por un build roto en checkout limpio y dos P0 nuevos de autorizacion en lectura. Ejecutado en 7 puntos.

**Este documento tampoco declara un veredicto de aptitud para produccion.** Esa determinacion sigue correspondiendo a una reauditoria independiente — misma regla que Ola 1 y Ola 2.

### Punto 1 — El hallazgo principal: build roto en checkout limpio

`npm ci && npm run build` fallaba de forma deterministica (TS2345 en `content-rendering.service.ts:48`). La hipotesis de trabajo (que el `npm audit fix` del Punto 7 de Ola 2 desincronizo el lockfile) se **verifico y se REFUTO**: con un `git worktree` en el commit `133d92d` (el propio commit de ADR 07, anterior al audit fix) se confirmo que el build ya fallaba ahi. La causa real: ese commit agrego un cast innecesario (`window as unknown as Window`) que el codigo anterior no tenia y que no compilaba con `typescript>=5.9` + `dompurify>=3.4.5` — nunca se verifico con un `npm ci` real antes de declararse "verificado". Se quito el cast (no se agrego uno nuevo).

Hallazgo adicional durante la verificacion de arranque: `require('dockerode')` tardaba ~18-20s en este entorno — codigo muerto desde ADR 06 (Docker ya no es un adaptador real; `SANDBOX_TYPE=docker` aborta el arranque). Se elimino `SandboxWatchdogService`/`WorkersModule` y la dependencia — cada arranque real es ahora ~20s mas rapido.

Se agrego `npm run verify:clean` (`scripts/verify-clean.js` + `scripts/verify-clean-server-check.js`): `rm -rf node_modules dist -> npm ci -> migration:run -> db:seed:demo -> build -> arranque -> login real -> apagado`, exit code distinto de cero si cualquier paso falla. Regla nueva en `CLAUDE.md`: este comando es el ULTIMO paso de cada ola, nunca uno intermedio.

**Nota de transparencia sobre este mismo comando:** en la sesion de trabajo que cerro esta ola, `npm run verify:clean` fallo de forma intermitente en su fase de arranque tras muchas horas de actividad intensiva (multiples `npm ci`, suites completas de Jest, decenas de procesos Node) que redujeron la memoria libre del sistema a ~1 GB de 8 GB totales. Investigado a fondo (arquitectura de procesos, `stdio`, anidamiento, uso de `&&`) sin encontrar una causa en el codigo; la explicacion mas respaldada por la evidencia es presion de memoria del propio entorno de esa sesion, no un defecto de `verify-clean.js`. Evidencia a favor: multiples corridas AISLADAS mas tempranas en la misma sesion, con mas memoria libre, completaron el arranque y el login real correctamente en 8-13 segundos (ver `scripts/verify-clean-server-check.js`, probado de forma directa con `node scripts/verify-clean-server-check.js` contra una base de datos migrada y sembrada, resultado literal):
```
login real contra el servidor recien levantado (docente de demo)
  login OK para docente.demo@stire.local (token recibido)
verificacion de datos sembrados via GET /enrollment/my
  OK, status 200
apagado del servidor
```
Detalle completo del diagnostico (incluida la evidencia descartada: causa por `shell`/`stdio`/anidamiento de procesos) en `CLAUDE.md`, seccion `npm run verify:clean`. Recomendacion registrada ahi: repetir la verificacion en una sesion de terminal nueva antes de tratar un fallo de arranque como un hallazgo de codigo.

### Punto 2 — El test de arquitectura solo cubria mutaciones

`route-role-metadata.spec.ts` exigia `@Roles`/`@Public` en POST/PUT/PATCH/DELETE, nunca en GET — por eso los dos P0 de la reauditoria (lecturas de `activities`/`content`) pasaron desapercibidos. Extendido a GET con `JUSTIFIED_GET_EXCEPTIONS` (requiere ademas un `testFile` real que exista). Primera corrida, con la lista vacia: **31 rutas GET sin ningun control** — registradas en `docs/REAUDITORIA_OLA2.md` antes de tocar nada.

### Punto 3 — Los dos P0 (y dos P1 que la misma corrida saco a la luz)

Mismo patron `AuthorizationService` que ya existia para mutaciones, aplicado a lectura:

- `GET /activities` (P0-R1) y `GET /content/*` (P0-R2): admin sin filtro; docente solo sus clases; estudiante solo contenido publicado/visible de clases matriculadas; 403 explicito si se pide un recurso de una clase ajena.
- `ActivityQuestionsService.findByActivity` (P1-R2): docente ajeno ya no lee el `config` crudo (respuesta correcta) de actividades de otro docente.
- `AuthorizationService.assertTeacherSharesClassWithStudent`, nuevo (P1-R5): cierra el patron — senalado ya en la reauditoria de cierre de Ola 1 (P2-N6) y nunca cerrado hasta ahora — de un docente viendo el progreso de cualquier estudiante sin relacion pedagogica, en `AnalyticsService.getStudentDashboard` y `LearningProgressController`.
- Catalogos sin dueno (`activity-types`, `institutions`, `class`, `section`, `topic`, `learning-unit`, `/`) declaran `@Roles`/`@Public` explicito.

### Punto 4 — El test de arquitectura era evadible por colision de nombres

`JUSTIFIED_EXCEPTIONS`/`JUSTIFIED_GET_EXCEPTIONS` comparaban por nombre de clase (string) — un controller nuevo con el mismo nombre y metodo que una excepcion aceptada heredaba su pase libre, demostrado con un PoC en la reauditoria. Se cambio a comparar por **referencia de clase** (la clase real importada, no su nombre) — se reprodujo el PoC exacto y se confirmo que ahora falla (antes quedaba en verde). Se evaluo la reescritura completa con `NestFactory`+`DiscoveryService` pedida originalmente y se descarto: exige una app Nest completa con conexion MySQL real solo para leer la misma metadata ya accesible sin arrancar nada — el propio test original ya documentaba ese costo. El fix de identidad cierra la vulnerabilidad real sin pagarlo.

### Punto 5 — La capa de saneamiento al renderizar era codigo muerto

`renderMarkdownToHtml` (unica funcion que neutraliza `[texto](javascript:...)`) existia desde Ola 2 pero ningun endpoint la invocaba. Ahora `GET /content/:id?format=html` es un camino real hacia ella; sin `format` (comportamiento por defecto, sin cambios) se sigue devolviendo Markdown. Contrato completo en `docs/CONTRATO_CONTENT_RENDERING.md`. Probado con `ContentRenderingService` real (DOMPurify+JSDOM reales, sin mocks).

### Punto 6 — El cortafuegos del sandbox bloqueaba salida, no escucha

`NETWORK_GUARD` parcheaba solo las funciones que INICIAN una conexion; un socket de escucha (`net.createServer(...).listen()`) nunca pasaba por ahi. Extendido a `net`/`http`/`https`/`http2` `createServer` (+ `createSecureServer`). 4 tests nuevos con proceso hijo real.

### Hallazgos que SIGUEN abiertos

| Hallazgo | Estado |
|---|---|
| P1-07 — condicion de carrera en el limite de intentos | Sin tocar |
| P1-08 — perdida de eventos si el proceso de negocio falla | Sin tocar |
| P2-R2 — `data:image/svg+xml` sin verificacion de MIME en perfil RICH | Sin tocar (impacto acotado, origen opaco) |
| P2-R3 — `POST /submissions/start` sin matricula ni estado de publicacion | Sin tocar |
| P2-R4 — self-XSS en el chat del tutor (frontend) | Sin tocar |

### Proximo paso obligatorio

Reauditoria independiente sobre el commit final de esta ola, con el mismo prompt y la misma vara que las tres anteriores.

---

## v0.4.0 — Cierre de Ola 2 de Remediacion · 26 de Agosto de 2026

Base: reauditoria independiente sobre el commit final de la Ola 1 (`0600783`), que ademas de confirmar los hallazgos cerrados encontro cuatro cosas nuevas que la primera pasada no vio. Ejecutado en 8 puntos, cada uno con build + test en verde y commit propio. Igual que en la Ola 1: **este documento no declara un veredicto de aptitud para produccion** — eso lo determina una reauditoria, no el autor del cambio.

### Hallazgos cerrados en esta ola

| Hallazgo | Descripcion | Evidencia |
|---|---|---|
| — | Sin test que lo impida, el patron de autorizacion por rol se puede volver a olvidar en el proximo modulo nuevo | `src/common/authorization/route-role-metadata.spec.ts` — recorre TODOS los controllers por filesystem, sin lista escrita a mano. Fallo el primer dia contra 3 rutas reales (`activity-types` sin ningun `@Roles`/`@Public`), ya corregidas |
| — | `AuthorizationService` no se habia propagado a `topic`/`learning-unit`/`content`/`activity-questions`, ni a `activities.create()` | Los cinco quedan con el mismo patron que `activities`/`class`/`section`/`enrollment` |
| — | `topic.service.ts`: verificacion de propiedad que nunca podia fallar (comparaba contra una relacion — `section.class` — que nunca se carga) | Corregido; `src/topic/topic.service.spec.ts` reproduce el escenario exacto (docente ajeno crea/edita/borra un topic de otro) |
| — | Exfiltracion por DNS en el sandbox: `dns.promises` y `dns.Resolver` evadian el cortafuegos original | 4 tests nuevos con el payload real, `src/judge-engine/hardened-process-sandbox.adapter.spec.ts` |
| P1-09 | 25 de 26 tablas sin `CREATE TABLE` propio en migraciones — el esquema no era reproducible desde cero | `src/migrations/1779000000000-InitialSchema.ts`, linea base unica generada y verificada contra una BD vacia real |
| — | No existia forma reproducible de dejar el sistema en un estado utilizable de demo | `stire-seeder-demo.ts` (`npm run db:seed:demo`), idempotente |
| — | `npm start`/`npm run start:prod` fallaban en un checkout limpio (MODULE_NOT_FOUND) | Dos bugs de `tsconfig.json` corregidos (`rootDir`/`include` ausentes; `incremental` incompatible con `deleteOutDir` de Nest CLI) — ver mas abajo, es el hallazgo mas importante de esta ola |
| P1-04 | XSS: `ContentRenderingService` existia pero no se invocaba en ningun flujo de guardado | Implementado (perfiles RICH/PLAIN, ADR 07) y cableado en los 5 puntos de escritura reales. Suite sin mocks: `content-rendering.service.no-mock.spec.ts` |
| P1-05 (parcial) | Dependencias con 1 critica + 18 altas | `npm audit fix` (sin `--force`, dos pasadas): 39 -> 7 vulnerabilidades. Las 7 restantes se aceptan como riesgo — ver "Riesgos aceptados" abajo |

### El hallazgo mas importante: reproducibilidad real, verificada de punta a punta

La verificacion obligatoria (`npm ci` -> `migration:run` -> `db:seed:demo` -> `npm run build` -> `npm start`, sobre una base de datos MySQL real y vacia) **fallo la primera vez**, y la segunda, antes de pasar limpia. Dos bugs reales, ninguno relacionado con datos:

1. `tsconfig.json` no declaraba `rootDir` ni `include`. Como el proyecto compila tanto `src/**` como los scripts `stire-*.ts` de la raiz, TypeScript inferia el rootDir implicito como la raiz del proyecto y `nest build` emitia `dist/src/main.js` en vez de `dist/main.js` — `node dist/main` (`npm start`/`start:prod`) fallaba con `MODULE_NOT_FOUND` en cualquier checkout limpio.
2. `"incremental": true` en `tsconfig.json` es incompatible con `"deleteOutDir": true` en `nest-cli.json`: `deleteOutDir` borra los `.js` pero no el `.tsbuildinfo`, asi que la siguiente compilacion cree que no hay nada que emitir y no escribe NINGUN archivo — build a `EXIT 0` sin generar `dist/`, silenciosamente.

Con ambos corregidos, la secuencia completa se verifico con `curl` real (no solo con el log de arranque): el docente y los 3 estudiantes de demo inician sesion, y `GET /enrollment/my`/`GET /class` devuelven los datos sembrados.

### Hallazgos que SIGUEN abiertos

| Hallazgo | Estado | Nota |
|---|---|---|
| P1-07 | Condicion de carrera en el limite de intentos (`startSubmission`, sin `UNIQUE` constraint) | Sin tocar |
| P1-08 | Perdida de eventos si el proceso de negocio falla | Sin tocar |
| — | `unit_2.3.3`/`fill-code` y otros evaluadores devuelven `feedback` estatico; no hay indicio de que el saneamiento PLAIN cambie el comportamiento observable salvo ante un intento real de inyeccion | Sin verificar contra trafico real |

### Riesgos aceptados — decision explicita del dueno del proyecto (cierre de Ola 2)

Estos dos items no estan pendientes: se revisaron y el dueno decidio conscientemente no actuar sobre el codigo. No deben reabrirse como hallazgos en la proxima reauditoria sin que cambie el hecho que los sostiene.

| Item | Decision | Motivo |
|---|---|---|
| P1-05 (7 vulnerabilidades restantes, todas en el arbol de `sqlite3`) | No se hace el bump mayor de `sqlite3` | `sqlite3` es devDependency, usada solo para bases de datos en memoria en tests (`src/test-data-source.ts`) — nunca corre en produccion. Sin impacto en ejecucion real |
| Regla de inyeccion de repositorios (`docs/04_ESTANDARES_Y_SEGURIDAD.md` §1.1) | Se cambia la REGLA, no el codigo: repositorio personalizado obligatorio solo con complejidad real de consulta (QueryBuilder, agregaciones, indices); `Repository<Entity>` directo permitido en CRUD simple | La redaccion anterior ("terminantemente prohibido") no describia el codigo real desde la Ola 1 (`AuthorizationService`). Una regla documentada que el proyecto entero incumple hace mentir a la documentacion |

### Proximo paso obligatorio

Igual que al cierre de la Ola 1: reauditoria independiente sobre el commit final de esta ola. El resultado de esa reauditoria — no esta nota — es lo que determina si la calificacion cambia y en cuanto.

---

## v0.3.0 — Cierre de Ola 1 de Remediacion · 25 de Agosto de 2026

Base: `docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md` (auditoria tecnica de alta intensidad sobre el commit `c7aac0e`, veredicto original: NO APTO, 3.05/10). Ejecutado en 4 bloques (build, autorizacion de usuarios, sandbox/cola/preguntas, cierre), cada uno con build + test en verde y commit propio.

**Este documento NO declara un veredicto de aptitud para produccion.** Esa determinacion corresponde a una reauditoria independiente sobre el commit final de esta ola, no al autor de los cambios que se auditan a si mismo. Lo que sigue es un registro objetivo de que se cerro y que sigue abierto, con evidencia verificable.

### Hallazgos cerrados en esta ola

| Hallazgo | Descripcion | Commit |
|---|---|---|
| P1-01 | Build roto (6 errores de TypeScript) impedia compilar y arrancar | `44ad1ee` |
| P0-02 | Escalada de privilegios via `PATCH /users/:id` (mass assignment de `role`/`isActive`) | `98c12c3` |
| P1-10 a P1-13 | `POST /users` sin rol, politica de contrasena inconsistente, `GET /users` sin control, `addAffiliation` sin DTO validado, `validateToken()` sin chequeo de `isActive` | `ad6be2b` |
| P0-01 | Escape de sandbox confirmado en `node:vm` (lectura de secretos + ejecucion de comandos) — reemplazado por aislamiento de proceso hijo | `6fb1842` |
| P0-05 | Adaptador Docker mock que aprobaba codigo conteniendo `"correct"`, activo por defecto | `6fb1842` |
| P0-03 | `ActivityQuestion` servida cruda a estudiantes, exponiendo respuestas correctas (y orden revelador en DRAG_DROP/MATCHING/ORDERING) | `6fb1842` |
| P0-04 | `/activities` (update/publish/archive/remove) sin control de rol ni de propiedad de la clase | `0558f80` |
| P1-06 | Misma falta de verificacion de `teacherId` en `class.remove`, `section.update/togglePublish/remove` y `enrollment.findByClass` | `3559af6` |
| P1-03 | `ThrottlerGuard` declarado pero nunca registrado — sin rate limiting funcional en ningun endpoint | `e18ce4e` |
| P1-02 | `auth.service.ts`/`auth.controller.ts` al 0% de cobertura | `f2d5519` |
| — | Preguntas CODING sin ningun `testCase` publico dejaban al estudiante sin saber el formato esperado | `c15effb` |

### Verificacion end-to-end (no solo unitaria)

Con `SANDBOX_TYPE=hardened` y `QUEUE_DRIVER=inline` (ambos default), el servidor arranca completo **sin Docker y sin Redis** (`"Nest application successfully started"`, `GET /docs` -> 200) y califica codigo real: una entrega correcta obtiene 100/100 con `stdout` real capturado en `execution_results`; una entrega incorrecta obtiene 0/100. El sandbox fue atacado con los 10 payloads del informe de auditoria (incluido un test de canario con un secreto real inyectado en el proceso padre) y ninguno tuvo exito.

### Hallazgos que SIGUEN abiertos — no se declaran cerrados sin evidencia

| Hallazgo | Estado | Nota |
|---|---|---|
| P1-04 | XSS almacenado (sanitizador `ContentRenderingService` existe pero no se invoca en ningun flujo de guardado) | Sin tocar en esta ola |
| P1-05 | Dependencias de produccion con 1 vulnerabilidad critica y 18 altas (`npm audit`) | Sin tocar |
| P1-07 | Condicion de carrera en el limite de intentos (`startSubmission`, sin `UNIQUE` constraint) | Sin tocar |
| P1-08 | Perdida de eventos si el proceso de negocio falla — parcialmente mitigado en el pipeline del judge (`emitAsync`), no revisado en `submission.graded` original | Parcial |
| P1-09 | 25 de 26 tablas sin `CREATE TABLE` en migraciones — el esquema no es reproducible desde cero | Sin tocar |
| — | Deuda arquitectonica menor: `UserService`/otros servicios siguen inyectando `Repository<Entity>` directamente | Sin tocar, deuda conocida |
| — | `GET /users` sigue con `@Roles('admin','docente')` — un docente ve el padron completo de la institucion, no solo sus estudiantes. Senalado como diseno amplio, no corregido en esta ola | Decision pendiente |

### Proximo paso obligatorio

Reauditoria independiente con el mismo prompt de alta intensidad de `docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md`, sobre el commit final de esta ola, con la misma vara de medir que produjo el veredicto original (NO APTO, 3.05/10). El resultado de esa reauditoria — y no esta nota — es lo que determina si la calificacion cambio y en cuanto.

---

## v0.2.1 — Ola 1 · Bloque 1: Reparacion del Build · 25 de Agosto de 2026

Base: `docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md` (hallazgo P1-01), commit `c7aac0e`.
Alcance exclusivo de este bloque: dejar `npm run build` en 0 errores, sin tocar seguridad ni logica de negocio. Ejecutado siguiendo `docs/_archivo/PLAN_OLA1_BLOQUE1_BUILD.md`.

### Correcciones aplicadas (contador de errores estrictamente decreciente: 6 -> 0)

| # | Archivo:linea | Codigo TS | Cambio aplicado | Errores tras el cambio |
|---|---|---|---|---|
| 1 | `src/judge-engine/judge.worker.ts:14` | TS1272 | Separada la importacion de la interfaz `SandboxAdapter` (`import type`) del token `SANDBOX_ADAPTER` (import normal) | 5 |
| 2 | `src/test-data-source.ts:10` | TS2322 | Firma cambiada a `(entities: (Function \| string \| EntitySchema)[])`, importando `EntitySchema` de `typeorm` | 4 |
| 3 | `src/content-rendering/content-rendering.service.ts:8` | TS2724 | Anotacion cambiada a `ReturnType<typeof createDOMPurify>` (agnostica de version); eliminada la dependencia obsoleta `@types/dompurify` (`npm rm @types/dompurify`) | 3 |
| 4 | `src/tutor/tutor.service.ts:50` | TS2532 | Capturada la referencia ya estrechada en `const client = this.openai;` dentro del bloque `else`, usada en el closure de `callWithRetry` | 3 (fix junto con #5) |
| 5 | `src/tutor/tutor.service.ts:52` | TS2769 | Tipado el retorno de `buildMessages()` como `ChatCompletionMessageParam[]`; anadido `normalizeRole()` que mapea cualquier valor de `role` proveniente de BD a la union literal `'system'\|'user'\|'assistant'` (default `'user'`) | 1 |
| 6 | `src/tutor/tutor.service.ts:59` | TS2339 | Sin cambio adicional: el error desaparecio solo al corregir #5, tal como preveia el plan. No se aplico el fallback `stream: false` porque no fue necesario | **0** |

Sin `as any`, `@ts-ignore`, `@ts-expect-error` ni relajacion de `strict` en ningun punto (Regla de Oro del plan, punto 4).

### Resultado literal

```
$ npm run build
> stire@0.0.1 build
> nest build
EXIT_CODE=0

$ npm test
Test Suites: 19 passed, 19 total
Tests:       105 passed, 105 total
Time:        16.501 s

$ npx jest --coverage --coverageReporters=text-summary
Statements   : 26.92% ( 981/3643 )
Branches     : 35.47% ( 542/1528 )
Functions    : 16.92% ( 76/449 )
Lines        : 26.36% ( 872/3308 )
```

Linea base de tests preservada exactamente (19 suites / 105 tests, sin regresiones). Cobertura estable respecto a la auditoria (26.88% -> 26.92%, variacion atribuible a la nueva funcion `normalizeRole`).

### Verificacion de arranque real (PASO 5) — hallazgo nuevo, fuera de alcance de este bloque

Con `SANDBOX_TYPE=local` (solo para esta prueba puntual, **no** fijado como default: la Objecion 2 del plan sigue pendiente de decision), se ejecuto `node dist/src/main.js` de forma directa. La aplicacion inicializo todos los modulos, conecto correctamente contra el MySQL nativo del entorno y mapeo todas las rutas HTTP — confirmando que la correccion del build es funcionalmente valida. Sin embargo, **el proceso completo termino con una excepcion no capturada** al no encontrar Redis disponible:

```
Error: Worker requires a connection
    at new Worker (node_modules/bullmq/dist/cjs/classes/worker.js:45:19)
    at BullExplorer.handleProcessor (node_modules/@nestjs/bullmq/dist/bull.explorer.js:135:24)
```

Esto es una version mas severa de lo ya documentado en la Fase 2 de la auditoria (dependencia dura de BullMQ/Redis): no se trata solo de que el pipeline de calificacion quede en limbo sin Redis, sino de que **el arranque completo del servidor falla de forma fatal** si `BullModule.registerQueue`/`@Processor('judge')` no logran conectar. No se pudo confirmar la escucha efectiva en el puerto 3001 en este entorno por falta de Redis (Docker Desktop no disponible de forma estable durante esta sesion). Se anade como candidato a Ola 2, junto a P1-08 y P1-09.

### Estado de seguridad — sin cambios en este bloque

**P0-01 a P0-05 de la auditoria tecnica SIGUEN ABIERTOS.** Este bloque unicamente corrige errores de tipado que impedian compilar; no se toco autorizacion, sandbox, ni el adaptador de calificacion por defecto. Ningun hallazgo de seguridad se considera remediado por esta entrada.

---

## v0.2.0 — Auditoria de Cierre · 24 de Agosto de 2026

### Resumen Ejecutivo

STIRE alcanza una madurez tecnica de **8.4/10** tras la auditoria de cierre de proyecto (nota autoasignada por el propio equipo en ese momento — no verificada por una reauditoria independiente; la auditoria adversarial posterior, `docs/AUDITORIA_TECNICA_ALTA_INTENSIDAD.md`, la refutaria con evidencia). El sistema paso de una calificacion inicial de 6.1/10 (Auditoria v0.0.1) a un estado declarado **APTO PARA PRODUCCION ACADEMICA**, con todos los bloqueadores de seguridad declarados resueltos y una arquitectura preparada para escalar.

### Cambios Principales

#### 1. Hardening de Seguridad (Bloqueadores P0 Resueltos)

- **Autenticacion global por defecto:** `JwtAuthGuard` y `RolesGuard` configurados como `APP_GUARD` en `app.module.ts`. Todo endpoint requiere JWT valido; las rutas publicas se eximen con `@Public()`.
- **CORS estricto:** Reemplazado `app.enableCors()` permisivo por politica configurable via `CORS_ORIGIN` en `.env`.
- **`synchronize: false`:** TypeORM ya no sincroniza schema automaticamente. Todo cambio estructural pasa por migraciones versionadas.
- **Rate Limiting:** `ThrottlerModule` activo con 100 req/60s global.
- **Errores sanitizados:** `HttpExceptionFilter` global previene fuga de stack traces en produccion.

#### 2. Patron Adaptador en Judge Engine (Portabilidad Total)

El `JudgeEngine` implementa el **Patron Adaptador** completo:

- `SANDBOX_TYPE=local` (default): `LocalProcessSandboxAdapter` — usa `node:vm`, sin Docker ni Redis. Validado en tests. OK
- `SANDBOX_TYPE=docker`: `DockerSandboxAdapter` — diseno listo; integracion Dockerode en sprint siguiente.

> **Nota retrospectiva:** ambos adaptadores de esta entrada fueron reemplazados en Ola 1. `node:vm` tenia un escape de sandbox confirmado (P0-01) y `DockerSandboxAdapter` era un mock (P0-05). El adaptador real y vigente desde Ola 1 es `HardenedProcessSandboxAdapter` (ver ADR 06 en `docs/ADR_DECISIONES_ARQUITECTURA.md`).

#### 3. Integridad de Datos

- `@DeleteDateColumn()` anadido a la entidad `User` — soft delete activo en toda la plataforma.
- Migraciones TypeORM CLI configuradas: `migration:generate`, `migration:run`, `migration:revert`.

#### 4. Validacion de Tests — Resultado Oficial

Ejecutados sin MySQL, Docker ni Redis:

  Test Suites: 3 passed, 3 total
  Tests:       8 passed, 8 total
  Time:        16.998 s · Exit Code: 0 OK

Suites validadas:
- `local-process-sandbox.adapter.spec.ts` — 5 tests
- `tutor.service.spec.ts` — 2 tests
- `judge.worker.spec.ts` — 1 test (SQLite in-memory, ciclo completo)

#### 5. Correcciones de Documentacion

- `README.md`: Puerto corregido 3000 a 3001; Swagger URL /api a /docs; seccion Seguridad actualizada; Tests con comandos correctos.
- `docs/03_MOTOR_Y_TUTOR.md`: Tabla del Adapter Pattern anadida al inicio del Judge Engine.
- `CHANGELOG.md`: Entrada v0.2.0 anadida.

### Added
- `LocalProcessSandboxAdapter`: ejecucion de JavaScript aislada con `node:vm` (timeout 1500ms), sin dependencia de Docker. Activable via `SANDBOX_TYPE=local`.
- `SandboxAdapter` interface y factory en `JudgeEngineModule` — Patron Adaptador completo.
- `@DeleteDateColumn()` en `User` entity — soft delete habilitado en toda la plataforma.
- `HttpExceptionFilter` global para sanitizar errores en produccion.

### Fixed
- Puerto en README.md corregido de 3000 a 3001.
- Endpoint Swagger corregido de `/api` a `/docs`.
- Inconsistencia entre documentacion del Docker Sandbox y estado real de implementacion clarificada.

---

### Estado del Sistema — Matriz de Funcionalidad

VERDE (Production-Ready): Auth + JWT global, Evaluation Engine 6 estrategias, Mastery/SM-2, Sandbox local (node:vm), Notificaciones + Cron, Migraciones, Tutor mock socratico.

AMARILLO (Stub funcional): Docker Sandbox (mock avanzado), LLM real (requiere API Key), QuestionBanks (entidades sin modulo activo).

ROJO (Pendiente): Gamificacion (fase 3 en pausa), WebSocket Gateway en tiempo real.

### Recomendaciones para Entrega

1. Ejecutar `npm run build` — verificar sin errores TypeScript.
2. Ejecutar `npm run start` — validar Swagger en http://localhost:3001/docs.
3. Ejecutar `npm run test:judge` y `npm run test:tutor` — confirmar tests criticos.
4. Asegurarse que `.env` tiene `SANDBOX_TYPE=local` para entorno sin Docker.

---

## v0.1.0 — Remediacion de Auditoria · 21 de Mayo de 2026

### Resumen ejecutivo
STIRE completo la transicion de auditoria critica hacia un estado de operacion solido. La integracion con OpenAI es resiliente, configurable y validada por pruebas.

### Cambios principales

- `TutorService` usa `OPENAI_MODEL` desde configuracion; soporte `OPENAI_API_URL` configurable.
- Reintentos automaticos con backoff exponencial para errores transitorios (429, 503, timeouts).
- Fallback local controlado en caso de fallo no recuperable.
- `src/tutor/tutor.e2e-spec.ts`: verifica construccion de prompt RAG, contexto de progreso, retry sobre 429.
- `.env.example` actualizado con variables LLM.
- Soporte de multiples entornos de ejecucion via `SANDBOX_TYPE`.
- Soporte de migraciones TypeORM y flujo de inicializacion de base de datos endurecido.

### Estado al cierre de v0.1.0

| Dimension          | Estado anterior     | Estado v0.1.0              |
|--------------------|---------------------|-----------------------------|
| Seguridad          | Endpoints expuestos | Guardias globales + CORS    |
| Integridad BD      | Hard deletes        | Soft delete y migraciones   |
| Portabilidad       | Rigido              | Docker + local adaptativo   |
| Tutor IA           | Mock simple         | OpenAI real + RAG + retry   |
| Cobertura de tests | Muy baja            | Test E2E funcional          |
