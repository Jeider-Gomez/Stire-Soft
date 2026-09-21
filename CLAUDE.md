# CLAUDE.md — reglas de trabajo de este proyecto

Este archivo es la fuente de verdad de las reglas de ingeniería del proyecto STIRE.
`docs/ESTADO_STIRE_HANDOFF.md` es el documento de traspaso (dónde estamos, qué se cerró,
qué queda abierto); este archivo es el que dice **cómo** se trabaja aquí, y se lee siempre.

---

## Regla de Oro

`npm run build` + `npm test` tras cada bloque de trabajo. Contador de errores estrictamente
decreciente. Si algo rompe, parar y reportar — no seguir acumulando cambios sobre un build roto.

## `npm run verify:clean` es el ÚLTIMO paso de cada ola, nunca uno intermedio

**Regla añadida en Ola 3, tras la Reauditoría de Ola 2 (`docs/REAUDITORIA_OLA2.md`, hallazgo
P1-R1).** `npm run verify:clean` reproduce de punta a punta la secuencia completa:
`rm -rf node_modules dist → npm ci → migration:run → db:seed:demo → npm run build → arranque →
login real → apagado`, contra una base de datos vacía real, y termina con exit code distinto de
cero si cualquier paso falla.

**Por qué existe esta regla:** la Ola 2 declaró esta misma secuencia "verificada de punta a
punta" en su Punto 5, y volvió a tocar `package-lock.json` en su Punto 7 (`npm audit fix`) sin
repetir la verificación después de ese cambio. La reauditoría de Ola 2 reprodujo la secuencia de
forma literal contra un `npm ci` real y el build falló de inmediato — no por el `npm audit fix`
en sí (se verificó con un `git worktree` histórico que el error ya existía **antes**, introducido
en el propio commit de Ola 2 que implementó ADR 07: un cast de tipo innecesario,
`window as unknown as Window`, en `content-rendering.service.ts:48`, que rompía la compatibilidad
estructural con `WindowLike` de `dompurify` y que el código anterior — sin ese cast — no tenía).
La causa raíz real, en ambos casos, es la misma: **una verificación que se corrió una vez, contra
un `node_modules` que ya existía en la máquina del autor, y que nunca se repitió con un `npm ci`
genuino después de un cambio posterior** — el mismo patrón, más allá de la causa técnica exacta,
que ya había producido los dos bugs de `tsconfig.json` que la propia Ola 2 identificó como su
hallazgo más importante.

**La regla, en consecuencia:**
- `npm run verify:clean` se corre **una sola vez por ola, al final**, después de que todos los
  puntos de esa ola estén implementados y commiteados — nunca a mitad de una ola para "confirmar
  que vamos bien", porque un cambio posterior en la misma ola (una dependencia, un lockfile, un
  `npm audit fix`) puede invalidar silenciosamente lo que esa corrida intermedia confirmó.
- Si algo **después** de correrlo modifica `package-lock.json`, `tsconfig.json`, `nest-cli.json`
  o cualquier script de arranque/migración/seed, hay que volver a correrlo antes de declarar la
  ola cerrada. No hay excepción de "es un cambio chico".
- El resultado literal (salida completa, no un resumen) se pega en `CHANGELOG.md` como
  evidencia de cierre de la ola — igual que ya se hacía con los logs de `npm ci`/`build`/`start`
  desde la Ola 2, ahora automatizado en un solo comando.
- Ningún hallazgo de build/arranque se declara cerrado sin la salida de este comando. "Corrió en
  mi máquina" (con un `node_modules` que no vino de un `npm ci` fresco) no es evidencia.

**Nota de diagnóstico (Ola 3, no oculta):** durante el cierre de esta ola, `npm run verify:clean`
falló de forma intermitente en su fase de arranque (el hijo que corre `dist/main.js` quedaba vivo
pero nunca abría su puerto ni escribía a stdout/stderr) en la MISMA máquina donde, minutos antes,
la secuencia idéntica había funcionado sin problema. Se investigó a fondo (arquitectura de
procesos, `stdio`/`shell`, anidamiento, `&&` vs. invocaciones separadas) sin encontrar una causa
en el código. La causa más probable, encontrada al final: la sesión de trabajo que produjo esta
ola llevaba muchas horas de actividad intensiva (`npm ci` repetido, suites de Jest completas,
muchos procesos Node concurrentes) y había reducido la memoria libre del sistema a ~1 GB de 8 GB
totales — condición bajo la cual el arranque de una app NestJS completa (grafo de DI de ~30
módulos, metadata de TypeORM para 26 entidades) puede degradarse severamente o no completar en el
plazo esperado, sin que sea un defecto de `verify-clean.js` en sí. Evidencia a favor: en varias
corridas AISLADAS más tempranas de la misma sesión (memoria menos comprometida), tanto el arranque
como el login real funcionaron correctamente y con rapidez (variando entre ~8 y ~13 segundos).
**Recomendación:** si `npm run verify:clean` falla en su fase de arranque, comprobar primero la
memoria libre del sistema antes de sospechar del script; repetir en una sesión de terminal nueva
(no en medio de una sesión larga con muchos procesos acumulados) antes de declarar un hallazgo de
código.

## Prohibiciones

- **Prohibido** `as any`, `@ts-ignore`, relajar `tsconfig` o desactivar reglas para hacer pasar
  un build. Si una librería externa exige un cast, que sea el más estrecho posible (nunca a
  `any`) y con un comentario que explique la incompatibilidad real — no un cast reflejo para
  silenciar al compilador. El propio bug de `content-rendering.service.ts:48` (arriba) es el
  ejemplo canónico de por qué: el cast no era necesario, se agregó sin verificar que rompía el
  build, y nadie lo notó hasta una reauditoría con `npm ci` real.
- **`npm run lint` incluye `--fix` y muta el árbol de trabajo.** Para auditar formato sin tocar
  el árbol, usar `eslint` directamente sin `--fix`.

## Disciplina de commits y push

- **Sin test, un fix no está terminado.** El test prueba la propiedad, no la intención.
- **Sin commit sin mensaje aprobado. Sin push sin confirmación explícita del dueño del proyecto.**
- Un commit por punto de la instrucción recibida, cuando así se indique — no agrupar puntos
  independientes en un solo commit ni dividir uno solo en varios sin que se pida.
- Ramas, Pull Requests, versiones (tags) y cómo evitar conflictos entre personas e IA:
  `docs/FLUJO_GIT.md`. No hay rama `dev`; `main` siempre funciona.
- Rediseño visual (José): su territorio y su forma de entregar están en `docs/identidad-visual/`;
  `npm run check:identidad` comprueba antes de cada Pull Request que no salió de él.

## Hallazgos e hipótesis

- **Todo hallazgo — del dueño del proyecto o de una auditoría — se trata como HIPÓTESIS hasta
  verificarlo contra el árbol de trabajo real.** Varias hipótesis de este proyecto ya cayeron con
  evidencia (el manejo de `env` en Windows, causa real libuv; P1-13, que resultó ser código
  muerto; y la causa raíz atribuida al `npm audit fix` del Punto 7 de Ola 2 para el build roto,
  que resultó ser un bug introducido antes, en el propio commit de ADR 07 del Punto 6 — ver
  arriba). Cuestionarlos con código y con una reproducción real (no solo lectura) es el
  comportamiento esperado, no una excepción.
- Antes de aceptar el resultado de un proceso de verificación en frío (subagente u otro), volver
  a comprobar sus citas de archivo:línea más decisivas contra el código real.

## Seguridad y datos

- **Documentos con detalle de vulnerabilidades abiertas van en `.gitignore`**, nunca al repo (que
  es público por decisión explícita del dueño del proyecto). El código corregido sí se publica.
- **El repositorio es público por decisión explícita.** No volver a proponer hacerlo privado.
  Historial verificado limpio: sin secretos, `.env` nunca trackeado. La única condición: si se
  despliega en un servidor accesible, cerrar antes los hallazgos de autorización abiertos.
- Repositorio Personalizado obligatorio solo con complejidad real de consulta (`QueryBuilder`,
  agregaciones, índices); `Repository<Entity>` directo permitido en CRUD simple (regla vigente
  desde el cierre de Ola 2 — ver `docs/ESTADO_STIRE_HANDOFF.md` §4).

## Dónde está cada cosa

- `docs/ESTADO_STIRE_HANDOFF.md` — estado del proyecto, qué se cerró, qué queda abierto.
- `CHANGELOG.md` — historial de olas de remediación, punto por punto, con commits.
- `docs/REAUDITORIA_OLA2.md` (gitignorado) — última reauditoría independiente, hallazgos con
  severidad y evidencia.
- `docs/04_ESTANDARES_Y_SEGURIDAD.md` — estándares de código y seguridad vigentes.
