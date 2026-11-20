# Traspaso de sesión: dónde quedamos y cómo se trabaja

> Para una sesión nueva de Claude Code (en la nube o local). Se lee después de `CLAUDE.md`.
> **Última actualización:** 2026-11-20 (ver primero §0). Lo privado (contraseñas, acceso al servidor) **no** va aquí: el repo es
> público. Jeider lo pega en el primer mensaje.

## 0. Lo más reciente (16–20/11/2026): empieza por aquí

**Rama de trabajo:** `feat/v3-fase-a`. Tras build y pruebas en verde, cada commit se sube a la rama **y** a `main` sin
preguntar (pedido de Jeider, 16/11). Si toca el servidor, Jeider pega el comando de despliegue y Claude lo corre por
SSH; el comando lleva siempre `migration:run` después de `up -d --build` (las migraciones no corren solas). Si varios
chats trabajan a la vez, anotarse en `docs/v3/BITACORA.md`.

**Hecho y desplegado (Azure al día con `main` el 20/11, `cccc18a`; Vercel publica solo):**

| Qué | Dónde |
|---|---|
| Revisión antes de desplegar (fases E y F de la v3): recorrido, candados, tema oscuro, barra del docente, nombres coherentes, manual en el celular | `CHANGELOG.md`, 16/11 |
| Activar el Tutor (pedido de Pedro): tarjeta «Activa tu Tutor» en el inicio del estudiante (recomendada, no obligatoria), formulario fijo abajo con «Pegar», guía más grande en el celular | `components/tutor/TutorKeyPanel.vue`, `CampoClave.vue`, `estudiante/inicio/ActivaTutor.vue` |
| Competencias: solo cuentan las entregas calificadas (antes, una que esperaba al juez contaba como fallada) | `src/learning-progress/competencias.service.ts` |
| **Arreglo grave:** con 10 entregas a la vez el servidor se colgaba (la conexión de la transacción no se soltaba antes de avisar y llamar al juez) | `src/submissions/submissions.service.ts`, commit `9434c21` |
| El aviso de «Clase creada» copiando otra dice que lo copiado está sin publicar | `frontend-nuxt/composables/useClasesDocente.ts` |
| Migración `CompetenciasModo` corrida en producción el 20/11 (faltaba) | — |

**Simulaciones (para el artículo):**

- `scripts/cursos/simular-al-azar.ts`: un estudiante con perfil al azar recorre el curso; imprime competencias, repasos
  y una proyección de SM-2.
- `scripts/simulacion/docente-y-estudiantes.ts`: un docente crea dos clases desde cero (competencias en «recomendar» y
  en «informar») y 15 estudiantes simulados con habilidad conocida recorren cada una. Informe:
  `docs/calidad/simulacion/SIMULACION_DOCENTE_ESTUDIANTES_2026-11-20.md`. Resultados principales:
  - la ecuación de Toscano subestima en 0,15, con r = 0,46 frente a la habilidad real;
  - «recomendar» y «solo ver» casi no se diferencian en 6 lecciones;
  - al banco le faltan ejercicios intermedios.
- Se corren contra un servidor local con la base `stire_pruebas_local`:
  `DB_DATABASE=stire_pruebas_local TRUST_PROXY=1 node dist/main.js` (puerto 3001). Nunca contra `basestire` ni contra
  producción.

**Propuestas esperando el visto bueno de Jeider (no construir antes):**

| Propuesta | Archivo | Lo que debe decidir |
|---|---|---|
| El Asistente del docente que conversa: te sugiere con datos de la clase, te pregunta antes de preparar (como un cuestionario) y afinan juntos el borrador | `scripts/diseno-v3/propuestas/Asistente-conversa.html` | Preguntas fijas o de la IA; sugerencias al abrir o como aviso; solo panel o también al crear una clase |
| Diagnóstico de entrada para los estudiantes nuevos y análisis de los exámenes que asigna el docente (dificultad, discriminación, distractores, por competencia) | `docs/curso-ddse3/PROPUESTA_DIAGNOSTICO_COMPETENCIAS.md` | Empezar por el análisis de exámenes; cuándo sale el diagnóstico; si hay uno de cierre |
| Laboratorio de prompts: casos de prueba y comparación de versiones en el panel del administrador (P41) | `docs/prompts/README.md` | Va junto con el Asistente |

**Artículos (dos, según el profesor Toscano):**

- El del proyecto, para **Acta Scientiæ Informaticæ**: `docs/curso-ddse3/articulo/`, máximo 6 páginas y ya tiene 6.
  Lo que se agregue tiene que reemplazar algo.
- El de implementación y evaluación, para **3 revistas de la lista del profesor**
  (`docs/curso-ddse3/guias/Guia_Revistas_Cientificas.docx`). **Todavía no se eligieron.** La propuesta del 20/11 es
  Campus Virtuales como principal, y RITA y RISTI de respaldo, pendiente de verificar su categoría, costo y extensión.
- **No hay prueba piloto con estudiantes del curso** (Jeider, 20/11). La prueba con usuarios finales tiene 9 personas
  y falta la décima, que debe responder la escala SUS.
- Lo que falta para el artículo está en `docs/curso-ddse3/articulo/PENDIENTES.md`.

**En curso o pedido el 20/11:**

- Más corridas de la simulación (semillas 20261122 a 20261124, 12 lecciones), para agregar sus resultados al informe.
- **Hecha (20/11):** simulación en el navegador de una estudiante novata, con la tabla de perfiles que pidió Toscano:
  `docs/calidad/simulacion/SIMULACION_NAVEGADOR_NOVATO_2026-11-20.md`. Se arreglaron la clave pegada en el código de la
  clase, el error de mayúsculas en nombres conocidos y los «casi» con varias diferencias. **Queda pendiente:** en el
  celular, el globo del recorrido tapa lo que explica.
- **Lista, sin correr:** `scripts/simulacion/curso-con-asistente.ts`. El docente pide al Asistente estructuras,
  ejercicios y programación en 8 versiones del pedido, y el script mide cada borrador. **Necesita una clave de Google AI
  Studio** en `STIRE_CLAVE_GOOGLE`; no hay ninguna en el `.env` local, y la clave nunca va al repositorio.
- **Pendiente de desplegar en Azure:** `746a82e` (orientación al entregar, servidor). Lo del frontend publica solo.

## 1. Con quién trabajas

- **Jeider Gómez**, líder técnico y dueño del proyecto. El correo de la cuenta de Claude es de Pedro Romero, pero quien
  escribe es Jeider. «Lo mío», «mis tarjetas» = las de Jeider.
- **Siempre en español**, sin excepción. Jeider no lee inglés.
- Equipo: Pedro (docente de Fundamentos en la prueba; políticas y bitácora), Julio (docente de Pensamiento
  algorítmico), José (identidad visual), Jorge (QA).
- Profesores: **Alexander Toscano** (Diseño y Desarrollo de Software Educativo 3, el curso del proyecto) y **Ali**
  (Fundamentos de Algoritmia, asesora a Jeider y quiere probar STIRE en su clase cuando esté listo).
- Trabajo universitario: practicidad, sin ceremonia. Cuestionar con evidencia las ideas del dueño y de la app es lo
  esperado.

## 2. Reglas que no están en el código

| Regla | Por qué |
|---|---|
| **Cero cobros.** Nunca proponer planes de pago como opción por defecto. | Jeider es estudiante; el servidor vive del crédito de Azure for Students. |
| **Herramienta flexible.** Toda función del docente es opcional y configurable; las sugerencias son editables. | «Una herramienta que ayuda al profe, no que lo limita». |
| **Identidad visual:** desde el 26/10 Claude decide la identidad en toda la app; José evalúa después todo junto. Usar los tokens de `tailwind.config.ts`, `main.css` y `temas.css`. | Decisión de Jeider. |
| **Evaluaciones humanas sin la IA.** El equipo nunca ve ni compara la nota de la IA hasta entregar. Lo de la IA va a la carpeta privada de OneDrive, no al grupo ni a Trello. | «Revisión humana como la vez pasada». |
| **Nunca escribir «con Claude Code» ni mencionar la IA** en la bitácora ni en Trello: el trabajo se atribuye a Jeider o al responsable. | Pedido de Jeider. |
| **No mencionar la pausa del plan de menores** en mensajes, documentos ni Trello. Decir «mayores de 18» está bien. | Pedido de Jeider (27/10). |
| **Para el equipo, lo estrictamente necesario**, que se pueda hacer ya y que **nada dependa de Jeider**. | Semana autónoma; equipo saturado. |
| **Trello:** lo que Jeider hace fuera del repo no deja rastro. Preguntar antes de marcarlo como no hecho. | Pasó el 07/10. |
| **Desplegar solo cuando Jeider pega los comandos** (si los pega, Claude los corre por SSH), y el **backend antes que el frontend** que lo usa. Vercel publica el frontend al hacer push a `main`. | La API rechaza campos desconocidos. |
| **Scripts con contraseñas no van al repo.** Cuentas de prueba con `Test123.` (laura.martinez.docente@, santiago.ruiz@, valentina.perez@, admin.simulacion@ … example.com). Nunca la contraseña personal de Jeider ni escribir credenciales en un navegador. | Repo público. |
| **Tesis ≠ software:** `docs/investigacion/` tiene reglas propias y solo citas verificadas. Cada decisión de diseño con fundamento → entrada BT en `docs/investigacion/BASE_TEORICA.md`. | Hubo citas fabricadas por IA. |
| Commits en español con los pies de atribución de la sesión; push a `main` permitido. Sin prueba, un arreglo no está terminado. | `CLAUDE.md`, `docs/FLUJO_GIT.md`. |

## 3. Cómo verificar

- `npm run build` (backend) y `npm test` en la raíz (≈3080 pruebas, SQLite en memoria). Frontend: `cd frontend-nuxt &&
  npm run build` (si falla por un `.nuxt/nuxt.lock` viejo, borrarlo).
- Las pruebas del frontend están en `src/content-rendering/__tests__/*.frontend.spec.ts`: leen los `.vue` como texto y
  cargan `utils/` con `ts.transpileModule`. El trinquete `pat04-componentes-grandes` limita las líneas por archivo.
- PAT-01: las páginas no llaman a la API; lo hacen los composables.

## 4. Dónde estamos (28/10/2026)

**Plan de remodelación en curso** (`docs/PLAN_REMODELACION.md`): sin funciones nuevas hasta el diseño de la Fase 2,
salvo correcciones. Fases: 0 orden → 1 auditoría → 2 diseño → 3 construcción por pantalla → 4 evaluación heurística
humana (abre la v3.0.0) → 5 investigación.

**Semana 11 (26/10–6/11), el equipo:** verificación del panel del docente (S11-RV), **evaluación heurística humana** en
la hoja de Google (cada uno sus ítems, ver Trello S11-HE; plazo 5/11), **prueba con 2 personas cada uno** (S11-PP, aplazada al 13/11;
`docs/calidad/PRUEBA_CON_PERSONAS.md`) y Pedro revisa las políticas (S11-P03). Jeider junta el informe de la prueba (15/11).

**Mejoras de la evaluación de la IA antes de la humana** (`docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md`, bloque A,
con registro de avance): hechos los ítems 2, 3, 4, 5, 7, 8, 11, 13, 21, 27, 28, 29 y 31 (28/10). El ítem 2 (respuesta del
Tutor por partes) **necesita desplegar el backend y reiniciar Caddy** (`docs/DESPLIEGUE.md` §8, «Actualizar»); mientras
no se despliegue, el chat sigue funcionando como antes.

**Insumos de la remodelación reunidos el 28/10** (todo en `docs/PENDIENTES.md`, P35 a P44):

| Documento | Qué decide |
|---|---|
| `docs/curso-ddse3/RETROALIMENTACION_TOSCANO_2026-10-28.md` | Lo que pidió Toscano: desagregar ejercicios, remitir al concepto, explicar el código en el editor, repaso sin rojo, confianza por competencia |
| `docs/PROPUESTA_PARTE_FORMATIVA.md` | Leer con `leerNumero()` (hoy se usan arreglos desde la Unidad 1 y se enseñan en la 3), escalera de ejercicios, panel izquierdo explicado, «Practica esto primero», **competencias como sistema aparte del dominio** (indicadores del FDOC, evidencia de calidad, niveles, control del docente), ejercicios breves |
| `docs/PLAN_TUTOR_Y_ASISTENTE.md` | Los dos asistentes: contexto justo por pantalla, política pedagógica común, ficha guiada, crear clase desde cero, **laboratorio de prompts**, memoria del Tutor en tres capas, varios proveedores de IA, logo con doble borde, **orden de trabajo** |
| `docs/investigacion/EVALUACION_HEURISTICA_STIRE_2026-10-27.md` | Evaluación de la IA (3,94/5 para grado 10–11) |

## 4 bis. Lo del 31/10/2026: el entorno de programar (Jeider probó como estudiante)

**Hecho y desplegado:** prompt del Tutor v1 a v11 con registro en `docs/prompts/` (instantáneas y receta); el Tutor ve la plantilla y los huecos en
los ejercicios de completar; el modelo rápido va primero (respuestas en ~1 s); el juez define `leerTexto()`, `leerNumero()` y `leerLineas()`
(`src/judge-engine/sandbox-lectura.ts`) y los ejercicios básicos de las unidades 1 y 2 ya no traen `lineas`; panel «Salida» bajo el editor, que se
oculta, con «Probar con mis datos» (`POST /submissions/:id/run` con `input`) y tres vistas; el Asistente del docente y su lista de chequeo usan las
funciones nuevas; el resultado de la entrega dice el dominio y la fecha reales del repaso.

**Falta (ver `PENDIENTES.md`):** P54 casos con nombre y mostrar el tipo de caso que falló; P55 etiqueta del lenguaje en los bloques de código; P51 un
ejercicio previo de solo `console.log` y enunciados en pasos; P52 el Tutor detecta al estudiante perdido; P50 código ejecutable en las lecciones (un
Web Worker propio); **P57 ejercicios de función** (la firma viene dada y STIRE llama a la función con los casos, como LeetCode); P56 condiciones más
flexibles; recargar el curso con `.\scripts\cursos\recargar-curso.ps1` (PowerShell; pide el correo y la contraseña del docente con la escritura oculta; lo corre Jeider, nunca Claude; no actualiza ejercicios con entregas).

**Límites de esta forma de trabajar:** no se escriben contraseñas en sitios reales (ni siquiera las de las cuentas demo); no se pasan verificaciones
de robots; el despliegue lo pega Jeider (backend antes que frontend); para que Claude pruebe solo hace falta correr STIRE en `localhost` con las cuentas demo.
Investigación y retroalimentación: `docs/investigacion/referentes/ENSENANZA_DE_PROGRAMACION.md` y `docs/calidad/PRUEBA_*_2026-10-31.md`.

## 5. Decisiones pendientes de Jeider

| Decisión | Contexto |
|---|---|
| **Decidido 28/10:** cada uno con su propia clave de IA | La guía paso a paso va dentro de STIRE; la clave institucional queda como decisión futura (P46) |
| **Decidido 28/10:** cubrir los distintos estilos | Varias representaciones que el estudiante elige, en lecciones y ejercicios (P45) |
| **Decidido 28/10:** competencias genéricas y bajo control del docente | Apagadas por defecto, lista desde plantilla, FDOC, copia o a mano, cualquier tipo de evidencia; Jeider las valida después con Ali y Toscano |
| Privacidad e investigación (ítems 33 y 34) | Espera la revisión de Pedro (S11-P03) |

## 6. Mapa rápido

- Backend NestJS + TypeORM (MySQL en producción): `src/`. Dominio: `src/common/utils/motor-dominio.ts`; perfil de
  aprendizaje: `src/analytics/perfil-aprendizaje.ts`; Tutor: `src/tutor/`; Asistente: `src/asistente-docente/`.
- Frontend Nuxt 3 (Vercel): `frontend-nuxt/`. Cursos como datos: `src/seeds/cursos/` y `scripts/cursos/`.
- Despliegue: `docs/DESPLIEGUE.md` §8. Calidad: `docs/calidad/README.md`. Pendientes: `docs/PENDIENTES.md`.
