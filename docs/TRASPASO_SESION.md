# Traspaso de sesión — dónde quedamos y cómo se trabaja

> Para una sesión nueva de Claude Code (en la nube o local). Se lee después de `CLAUDE.md`.
> **Última actualización:** 2026-10-09 (tarde, sesión en la nube) · `main @ 5363ab6` + este traspaso. Lo privado (contraseñas de las cuentas de
> prueba, acceso al servidor) **no** va aquí: el repo es público. Jeider lo pega en el primer mensaje.

## 1. Con quién trabajas

- **Jeider Gómez**, líder técnico y dueño del proyecto. El correo de la cuenta de Claude es de Pedro
  Romero, pero quien escribe es Jeider. «Lo mío», «mis tarjetas» = las de Jeider (S0X-J*).
- **Siempre en español**, sin excepción (resúmenes, preguntas, avisos). Jeider no lee inglés. Los
  nombres de código quedan como están.
- Equipo: Pedro (docente de Fundamentos en la prueba), Julio (docente de Pensamiento algorítmico),
  José (identidad visual y UX), Jorge (QA).
- Es un trabajo universitario: practicidad, no ceremonia de empresa. Cuestionar con evidencia las
  ideas del dueño y de la app es lo esperado.

## 2. Reglas que no están en el código

| Regla | Por qué |
|---|---|
| **Cero cobros.** Nunca proponer planes de pago (Pay As You Go, Railway, etc.) como opción por defecto. | Jeider es estudiante; el servidor vive del crédito de Azure for Students. |
| **Herramienta flexible.** Toda función del docente es opcional y configurable; las sugerencias son editables, nunca impuestas. | «Una herramienta que ayuda al profe, no que lo limita». |
| **Territorio de José:** `frontend-nuxt/tailwind.config.ts`, `assets/css/main.css`, `assets/css/temas.css`. Usar sus tokens; no inventar colores. | `npm run check:identidad`. |
| **Trello:** la evaluación de las listas de chequeo es humana. No escribir la nota de la IA en las tarjetas del equipo ni pedirles compararla. | Jeider compara IA vs. humanos solo al consolidar. |
| **Trello:** lo que Jeider hace fuera del repo (Azure, aprobar docentes, revisar sugerencias) no deja rastro. Preguntar antes de marcarlo como no hecho. | Pasó el 07/10. |
| **Desplegar solo cuando Jeider pega los comandos.** Antes, mirar `git log` en el servidor. | Ver §5. |
| **Orden backend → frontend.** Vercel publica el frontend al hacer push a `main`; la API rechaza campos desconocidos (400). Si un cambio agrega campos a un DTO o una ruta nueva, el backend debe desplegarse antes de que el frontend la use. | Pasó el 08/10: «Ver todos los ejercicios» daba error porque la ruta nueva no estaba en el servidor. |
| **Scripts con contraseñas** (recorridos con navegador, capturas, simulaciones) **no van al repo**. | Repo público. |
| **Tesis ≠ software.** `docs/investigacion/` tiene sus propias reglas (modo condicional, sin tecnologías en el cuerpo, solo citas verificadas). | Hubo citas fabricadas por IA en el pasado. |
| **Cada decisión de diseño con fundamento** → entrada BT en `docs/investigacion/BASE_TEORICA.md`. | Para anexar a la tesis. |
| Commits en español, con los pies de atribución que indique la sesión. Push a `main` permitido; revisar `git branch --show-current` antes. | `docs/FLUJO_GIT.md`. |

## 3. Cómo verificar

- `npm ci` en la raíz y en `frontend-nuxt/`.
- `npm run build` (backend) y `npm test` (≈2030 pruebas; usan SQLite en memoria, **no necesitan MySQL**).
- Frontend: `cd frontend-nuxt && npx nuxi typecheck`. Muchas pruebas del frontend están en
  `src/content-rendering/__tests__/*.frontend.spec.ts` (leen los `.vue` como texto y cargan `utils/` con
  `ts.transpileModule`).
- Trinquetes: `pat04-componentes-grandes.frontend.spec.ts` (líneas máximas por archivo; si un archivo
  crece, dividirlo antes de subir el número) y `sin-any.frontend.spec.ts`.
- PAT-01: las páginas no llaman a la API; lo hacen los composables (`composables/use*.ts`).

## 4. Dónde quedamos (09/10/2026)

Prueba con el equipo: semanas 8 y 9 (5 – 16 oct), plan en `docs/calidad/PRUEBA_DOS_SEMANAS.md`.
Hallazgos de Jeider: `docs/calidad/resultados-prueba/HALLAZGOS_JEIDER_S08_2026-10-07.md`.

**Hecho en los últimos días (en `main`):**
- Resultado de la entrega: cuánto subió o bajó el dominio por ejercicio (`dominioAntes/dominioDespues`),
  a dónde seguir (`utils/resultadoEntrega.ts`), calibración solo en el primer intento.
- Inicio del estudiante: «Tu avance» de hoy o de la semana (hora de Colombia) y el curso por estados.
- Ejercicios de programar: pasos para resolverlo (`utils/pasosCodigo.ts`), aviso al volver a uno ya
  aprobado (`yaAprobada`), y «Ver todos los ejercicios» con cuáles todavía suben el dominio
  (ruta `GET /learning-progress/unit/:unitId/mis-ejercicios`).
- Guía en vivo para que el docente arme buenos ejercicios de programar (`utils/guiaEjercicioCodigo.ts`).
- Sugerencias: el admin puede avisarle (opcional) a quien la envió, con la respuesta del equipo
  (`avisar` en `PATCH /reportes/:id`).
- Encuesta SUS cada 7 días (`src/usabilidad/sus.ts`, `DIAS_ENTRE_RESPUESTAS`), **temporal para la prueba**.
- **09/10 (tarde), hallazgos UX-03 y pendientes de Jeider** (detalle en `HALLAZGOS_JEIDER_S08_2026-10-07.md`, al final):
  siguiente lección siempre a mano y «otro parecido» al fallar (`c83b12b`); meta de la lección (85 %) y lo que pide el
  módulo (`2f602fc`); botón «Ver todos: cuáles suben tu dominio» y aviso en los parecidos (`e30e2e7`); retroalimentación
  de opción múltiple en el backend (`ffbe1be`); **opción múltiple con 1 intento por defecto** (`f979155`); guía opcional
  «Para que sea una buena lección» y 3 parecidos en opción múltiple (`cf45fbb`); tooltips y detalles visuales
  (`a2bee90`); barra de fuerza de la clave (`5363ab6`). BT-40, BT-41 y BT-42.
- Sugerencias n.º 2, 3, 5 y 6 resueltas o vistas con «Avisarle»; 7 y 8 descartadas (repetidas).
- Desde la nube: se trabaja directo en `main` con push (Jeider lo autorizó). El dominio de la API debe estar permitido
  en la red del entorno; Node `fetch` no usa el proxy: usar `curl`.

**Producción:** el backend está en `19ba823`. **Falta desplegar `ffbe1be`** (sin migraciones): agrega `retroalimentacion` a la respuesta
de la entrega. El frontend que la muestra **no está en `main`**: está en la rama `claude/wizardly-lovelace-g2i462`
(«frontend del punto 6»). Cuando el backend esté arriba, se lleva a `main`.

## 5. Pendiente

| Qué | Quién / cuándo |
|---|---|
| Desplegar el backend `ffbe1be` (sin migraciones) y después llevar a `main` el frontend del punto 6 (rama `claude/wizardly-lovelace-g2i462`). | Jeider despliega; luego se sube el frontend. |
| **Decisión de Jeider:** ¿pasar a 1 intento también los ejercicios de opción múltiple ya cargados en producción? Lo nuevo ya se crea con 1. Ojo: los cursos tienen 2 parecidos por grupo y la guía recomienda 3. | Esperar respuesta. |
| **Para pensar:** que el dominio baje un escalón solo con evidencia de olvido (un repaso fallado), no a cero. Ver «Para pensar» en `HALLAZGOS_JEIDER_S08_2026-10-07.md`. | Después de la prueba. |
| Contarle a José la barra de la clave (`components/auth/FuerzaClave.vue`) y la guía de la lección. Solo usan sus tokens. | Jeider. |
| Enunciados de prueba de escritorio en la clase de Pedro en producción: el seed ya los explica, pero los datos de producción hay que editarlos como docente. | Pedro o con la API. |
| Revisión pedagógica de los ejercicios de programar de los cursos (S08-J09 en el Backlog de Trello). | Después de la prueba. |
| Volver la encuesta SUS a un intervalo largo y reactivar el apagado automático de Azure al terminar la prueba. | 16/10 (o 23/10 si hay 3.ª semana). |
| Revisión del equipo de las listas de chequeo (viernes 09/10 10:00); prueba de cámara S08-J04 (16/10); exportar a Excel para Pedro (S08-P03); contraste de métricas del inicio (José); JEIDER-S08-11/12/13 (explicación tras el último intento de opción múltiple, barra de fuerza de contraseña con José, tooltips). | Trello. |

## 6. Mapa rápido

- Backend NestJS + TypeORM (MySQL en producción): `src/`. Dominio: `src/common/utils/mastery.calculator.ts`;
  recomendador: `src/learning-progress/recomendar-siguiente.ts`; notificaciones con `clave` para no repetir.
- Frontend Nuxt 3 (generado estático en Vercel): `frontend-nuxt/`.
- Cursos como datos: `src/seeds/cursos/` y `scripts/cursos/`.
- Despliegue: `docs/DESPLIEGUE.md` §8. Calidad y pruebas: `docs/calidad/README.md`.
- Referentes de producto: `docs/investigacion/referentes/`.
