# STIRE — Estado del proyecto y punto de continuación

> **Nota (2026-09-19):** este documento es el traspaso de la Ola 2 y no se ha actualizado desde
> entonces. Para el estado vigente (qué está hecho, a medias o pendiente, verificado contra el código)
> ver [`PLAN_MAESTRO.md`](./PLAN_MAESTRO.md) §4 y §5; para las decisiones de arquitectura, 
> [`ADR_DECISIONES_ARQUITECTURA.md`](./ADR_DECISIONES_ARQUITECTURA.md).

**Última actualización:** 2026-08-26 · **Commit actual:** `83593cb` (rama `main`, repo público)
**Propósito:** documento de traspaso. Leer esto basta para retomar el trabajo sin releer el histórico.

---

## 0. Formato de trabajo con el dueño del proyecto

Toda respuesta del CTO sigue esta estructura, en este orden:

**1 · Qué hizo Claude Code.** Traducción en lenguaje llano de lo que ejecutó: qué cambió, qué encontró, qué se rompió y qué quedó a medias. Sin jerga innecesaria y sin repetir su reporte literal — lo que importa es lo que significa.

**2 · Lectura y consejo.** El criterio de ingeniería: si la solución es correcta, qué riesgo introduce, qué se pasó por alto, qué decisión hay que tomar y con qué trade-offs. Aquí van las objeciones, las tablas comparativas cuando hay dilema, y la franqueza cuando algo no está a la altura. También aquí se corrige el CTO a sí mismo cuando Claude Code lo refuta con evidencia.

**3 · El prompt para Claude Code.** Un bloque cerrado, listo para copiar y pegar, con: alcance explícito, pasos numerados, criterio de parada, tests de regresión exigidos y qué documentación actualizar. Nunca instrucciones sueltas repartidas por el texto.

Reglas de tono: conciso, sin ceremonia, sin documento nuevo por cada turno. Un artefacto se crea solo cuando hay algo que persistir de verdad (una decisión de arquitectura, un traspaso, un plan largo). El resto vive en la conversación.

---

## 1. Dónde estamos

Auditoría forense adversarial (`c7aac0e`) → Ola 1 de remediación → reauditoría independiente de cierre de Ola 1 (≈5.1/10) → Ola 2 de remediación (8 puntos) → **reauditoría independiente de cierre de Ola 2 (`docs/REAUDITORIA_OLA2.md`) que bajó la nota a ≈4.4/10** por un build roto en checkout limpio y dos P0 nuevos de autorización en lectura → **Ola 3 de remediación (7 puntos, este documento)**.

| Métrica | Antes (`c7aac0e`) | Ola 1 (`0600783`) | Ola 2 (`087f7b4`) | Ola 3 (`83593cb`) |
|---|---|---|---|---|
| Calificación (reauditoría independiente) | 3.05/10 | ≈5.1/10 | ≈4.4/10 (regresión) | **sin medir — pendiente de reauditoría** |
| Build en checkout limpio (`npm ci && npm run build`) | ❌ 6 errores TS | ✅ | ❌ (roto, no detectado por Ola 2) | **✅ (build/migración/seed verificados; arranque+login verificados por separado — ver §2, nota de transparencia)** |
| Tests | 19 suites / 105 | 33 suites / 183 | 36 suites / 215 | **38 suites / 259** |
| Test de arquitectura de roles | — | solo POST/PUT/PATCH/DELETE | igual, evadible por colisión de nombre | **también GET; identidad por referencia de clase, no por string** |
| Autorización en lectura (`activities`, `content`) | — | sin verificar | sin verificar (P0-R1/P0-R2 en reauditoría) | **cerrada, mismo patrón `AuthorizationService` que mutaciones** |
| Saneamiento XSS al renderizar (capa 2, ADR 07) | — | — | existía, código muerto (P1-R4) | **alcanzable vía `?format=html`, ver `docs/CONTRATO_CONTENT_RENDERING.md`** |
| Cortafuegos del sandbox | — | escape `node:vm` (P0-01) | bloquea salida, DNS incluido | **también bloquea sockets de escucha (P2-R1)** |
| Veredicto | NO APTO | NO APTO | NO APTO (regresión) | **sin veredicto propio — ver Nota** |

> **Nota:** ninguna ola se autoasigna una nota — eso le corresponde a la próxima reauditoría independiente, con el mismo prompt y la misma vara que las tres anteriores.

**Lo que funciona hoy:** `rm -rf node_modules dist → npm ci → migration:run → db:seed:demo → npm run build` se verificó de punta a punta contra una base de datos MySQL vacía real con `npm run verify:clean` (exit code distinto de cero si cualquier paso falla). El paso final de esa misma cadena — arranque → login real (docente de demo) → `GET /enrollment/my` con el token → apagado — se verificó correcto y rápido (8-13s) en corridas aisladas dentro de la misma sesión, pero la cadena automatizada completa en un solo comando no se pudo confirmar de forma limpia al cierre de esta ola por presión de memoria del entorno de esa sesión, no por un defecto de código — ver la nota de transparencia en `CHANGELOG.md` v0.5.0 y el diagnóstico completo en `CLAUDE.md`.

---

## 2. `npm run verify:clean` — regla de proceso, no solo herramienta

**Por qué existe:** la Ola 2 declaró la secuencia de arranque "verificada de punta a punta" en su Punto 5, y volvió a tocar `package-lock.json` en su Punto 7 (`npm audit fix`) sin repetir la verificación. La reauditoría de Ola 2 reprodujo la secuencia literal contra un `npm ci` real y el build falló de inmediato — la causa exacta no fue el audit fix (se descartó con evidencia, ver `CHANGELOG.md` v0.5.0 Punto 1), pero el patrón de fondo es el mismo: una verificación que se corrió una vez, contra un `node_modules` que ya existía, y nunca se repitió tras un cambio posterior.

**La regla, documentada también en `CLAUDE.md`:** `npm run verify:clean` se corre una sola vez por ola, al **final**, después de que todos los puntos estén commiteados. Si algo después modifica `package-lock.json`, `tsconfig.json`, `nest-cli.json` o cualquier script de arranque/migración/seed, hay que volver a correrlo antes de declarar la ola cerrada.

---

## 3. Decisiones de arquitectura vigentes

**ADR 06 — Sandbox por proceso hijo endurecido.** `HardenedProcessSandboxAdapter` es el único adaptador real. Aísla con proceso hijo del SO: `--permission`, `--disallow-code-generation-from-strings`, entorno mínimo, cortafuegos de red en preludio (Ola 2: extendido a `dns.promises`/`dns.Resolver`; **Ola 3: extendido a sockets de escucha** — `net`/`http`/`https`/`http2` `createServer` — que permitían aceptar conexiones entrantes sin que el cortafuegos, pensado solo para conexiones salientes, lo notara), `--max-old-space-size=128` y watchdog con `SIGKILL`. `SANDBOX_TYPE=hardened` por defecto; `docker` y `vm` abortan el arranque con excepción.

**ADR 07 — Sanitización con dos perfiles.** `RICH` (autoría docente) y `PLAIN` (estudiante/IA), saneamiento al escribir. **Ola 3:** la capa de saneamiento al *renderizar* (`renderMarkdownToHtml`, la única que neutraliza sintaxis Markdown como `[x](javascript:...)`) ahora es alcanzable de verdad vía `GET /content/:id?format=html` — antes existía pero ningún endpoint la invocaba. Contrato completo: `docs/CONTRATO_CONTENT_RENDERING.md`.

**ADR 08 — Redis opcional.** Sin cambios en Ola 3.

**Línea base de migraciones.** Sin cambios en Ola 3 — re-verificada de punta a punta en cada corrida de `verify:clean`.

**Patrón de autorización en lectura (Ola 3, sin ADR propio).** El mismo `AuthorizationService` (`assertTeacherOwnsClass`/`assertEnrolledInClass`) que ya protegía las mutaciones desde Ola 1/2 ahora también protege las lecturas de `activities`/`content`, y un método nuevo (`assertTeacherSharesClassWithStudent`) cierra el patrón de un docente viendo datos de un estudiante sin relación pedagógica (`analytics`, `learning-progress`). El test de arquitectura (`route-role-metadata.spec.ts`) ahora cubre también rutas GET, y compara excepciones por **referencia de clase**, no por nombre en string — cierra la evasión por colisión de nombres encontrada en la reauditoría de Ola 2.

---

## 4. Cerrado y verificado

**Ola 1** (por reauditoría independiente): P1-01 build · P0-01 a P0-05 · P1-03, P1-06, P1-10 a P1-12 · P1-02 parcial.

**Ola 2** (declarado por el autor, la reauditoría de Ola 2 confirmó la mayoría y encontró 2 P0 nuevos — ver Ola 3): propagación de `AuthorizationService` a mutaciones · DNS del sandbox · P1-09 migraciones · P1-04 XSS escritura · P1-05 parcial · test de arquitectura (solo mutaciones) · reproducibilidad de `tsconfig.json`.

**Ola 3** (por el propio autor del cambio — pendiente de reauditoría): build roto en checkout limpio (causa raíz identificada, no solo el síntoma) · eliminación de `dockerode`/`SandboxWatchdogService` (código muerto, ~20s de arranque) · `npm run verify:clean` · test de arquitectura extendido a GET · P0-R1 (`GET /activities`) · P0-R2 (lecturas de `content`) · P1-R2 (`activity-questions.findByActivity`) · P1-R5 (`analytics`/`learning-progress`, señalado desde el cierre de Ola 1 y nunca cerrado) · P1-R3 (colisión de nombres en el test de arquitectura) · P1-R4 (capa de renderizado XSS alcanzable) · P2-R1 (sockets de escucha en el sandbox).

Detalle completo, con commits, en `CHANGELOG.md` (v0.5.0).

---

## 5. Abierto

0. **Confirmar `npm run verify:clean` en frío, tras reiniciar el equipo.** Pendiente, acción del dueño del proyecto — no de Claude Code, que tiene instrucción explícita de no volver a intentarlo. Al cierre de Ola 3, `npm ci → migration:run → db:seed:demo → npm run build` se verificó correcto con `npm run verify:clean`, pero el paso final (arranque → login real → `GET /enrollment/my` → apagado) falló de forma intermitente en esa misma sesión — probado y confirmado correcto por separado (`node scripts/verify-clean-server-check.js` contra una BD ya migrada/sembrada, 8-13s, login + endpoint autenticado en verde), pero no en una sola corrida limpia del comando completo. Diagnóstico exhaustivo descartó causa en el código (arquitectura de procesos, `shell`/`stdio`, anidamiento, uso de `&&` — ver `CLAUDE.md`); la hipótesis con más evidencia a favor es presión de memoria de esa sesión de trabajo (~1GB libres de 8GB al momento del fallo, bajando a ~0.77GB horas después). **Esta hipótesis no está confirmada** — solo se puede descartar o confirmar corriendo `npm run verify:clean` una vez, en frío, tras un reinicio real del equipo (memoria liberada, sin la sesión de Claude Code ni sus procesos acumulados). Si en frío también falla, el hallazgo cambia de "probable presión de memoria" a "bug real sin diagnosticar" y hay que reabrir la investigación.
1. **P1-07** — condición de carrera en el límite de intentos (`startSubmission`, sin `UNIQUE` constraint). Sin tocar desde la auditoría original.
2. **P1-08** — eventos `submission.graded` sin garantía de entrega si el proceso de negocio falla. Sin tocar.
3. **P2-R2** — `data:image/svg+xml` sin verificación de MIME en el perfil RICH de saneamiento (impacto acotado: origen opaco, requiere navegación explícita del usuario a la URI).
4. **P2-R3** — `POST /submissions/start` sin verificación de matrícula ni de estado de publicación (oráculo lateral vía `totalScore`).
5. **P2-R4** — self-XSS en el chat del tutor (frontend, `dangerouslySetInnerHTML` sin escapar el eco local del propio mensaje).
6. `easeFactor` de SM-2 no persistido · integración del `ActivityLog` en el Tutor — sin tocar, heredado de antes de Ola 1.

### Riesgos aceptados (sin cambios desde el cierre de Ola 2)

1. **P1-05 (parcial) — 7 vulnerabilidades npm restantes**, todas en el árbol de `sqlite3` (devDependency, solo tests en memoria). Sin impacto en ejecución real: no se hace el bump mayor.
2. **Regla de inyección de repositorios** (`docs/04_ESTANDARES_Y_SEGURIDAD.md` §1.1) — Repositorio Personalizado obligatorio solo con complejidad real de consulta; `Repository<Entity>` directo permitido en CRUD simple.

---

## 6. Ola 3 — instrucción ejecutada

La instrucción completa (7 puntos) que produjo el estado descrito en §1-§5 queda registrada en `CHANGELOG.md` v0.5.0 junto con los commits de cada punto (algunos puntos se combinaron en un mismo commit cuando estaban acoplados en el mismo archivo — ver la nota de cada commit). No se repite aquí para no duplicar la fuente de verdad.

---

## 7. Reglas de trabajo de este proyecto

Ver `CLAUDE.md` — es ahora la fuente de verdad de las reglas de ingeniería (incluida la regla nueva de `npm run verify:clean` como último paso de cada ola). Este documento sigue siendo el de traspaso de estado.

---

## 8. Para la defensa del proyecto

El material más fuerte sigue siendo el proceso, no el sistema — y esta ola lo demuestra con más fuerza que las anteriores porque **incluye una regresión real, medida y explicada**, no solo mejoras: 3.05/10 → 5.1/10 → 4.4/10 → pendiente. Muy pocos trabajos académicos se someten a una reauditoría que les baja la nota y la publican de todos modos junto con la corrección punto por punto. La causa raíz del build roto (un cast de tipo innecesario, verificado con un `git worktree` histórico que refutó la hipótesis inicial del propio dueño del proyecto) y el PoC de colisión de nombres reproducido y cerrado en el test de arquitectura son evidencia de un proceso de ingeniería que se audita a sí mismo con rigor, no de un sistema perfecto.

Guardar para la presentación: la tabla de cuatro columnas de calificación (§1), la comparación antes/después del PoC de colisión de nombres (verde con el bug, rojo sin él), y — como ejemplo de honestidad de proceso, no solo de resultado — la nota de transparencia en `CHANGELOG.md` v0.5.0 sobre por qué `npm run verify:clean` no se pudo confirmar con una sola corrida limpia al cierre de esta ola.

Publicar una versión **saneada** del informe — hallazgos, severidades y remediación, sin payloads funcionales — antes de la sustentación.
