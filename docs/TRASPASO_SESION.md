# Traspaso de sesión: dónde quedamos y cómo se trabaja

> Para una sesión nueva de Claude Code (en la nube o local). Se lee después de `CLAUDE.md`.
> **Última actualización:** 2026-10-28. Lo privado (contraseñas, acceso al servidor) **no** va aquí: el repo es
> público. Jeider lo pega en el primer mensaje.

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
| **Desplegar solo cuando Jeider pega los comandos**, y el **backend antes que el frontend** que lo usa. Vercel publica el frontend al hacer push a `main`. | La API rechaza campos desconocidos. |
| **Scripts con contraseñas no van al repo.** Cuentas de prueba con `Test123.` (laura.martinez.docente@, santiago.ruiz@, valentina.perez@, admin.simulacion@ … example.com). Nunca la contraseña personal de Jeider ni escribir credenciales en un navegador. | Repo público. |
| **Tesis ≠ software:** `docs/investigacion/` tiene reglas propias y solo citas verificadas. Cada decisión de diseño con fundamento → entrada BT en `docs/investigacion/BASE_TEORICA.md`. | Hubo citas fabricadas por IA. |
| Commits en español con los pies de atribución de la sesión; push a `main` permitido. Sin prueba, un arreglo no está terminado. | `CLAUDE.md`, `docs/FLUJO_GIT.md`. |

## 3. Cómo verificar

- `npm run build` (backend) y `npm test` en la raíz (≈2520 pruebas, SQLite en memoria). Frontend: `cd frontend-nuxt &&
  npm run build` (si falla por un `.nuxt/nuxt.lock` viejo, borrarlo).
- Las pruebas del frontend están en `src/content-rendering/__tests__/*.frontend.spec.ts`: leen los `.vue` como texto y
  cargan `utils/` con `ts.transpileModule`. El trinquete `pat04-componentes-grandes` limita las líneas por archivo.
- PAT-01: las páginas no llaman a la API; lo hacen los composables.

## 4. Dónde estamos (28/10/2026)

**Plan de remodelación en curso** (`docs/PLAN_REMODELACION.md`): sin funciones nuevas hasta el diseño de la Fase 2,
salvo correcciones. Fases: 0 orden → 1 auditoría → 2 diseño → 3 construcción por pantalla → 4 evaluación heurística
humana (abre la v3.0.0) → 5 investigación.

**Semana 11 (26/10–6/11), el equipo:** verificación del panel del docente (S11-RV), **evaluación heurística humana** en
la hoja de Google (cada uno sus ítems, ver Trello S11-HE; plazo 5/11), **prueba con 2 personas cada uno** (S11-PP, 6/11;
`docs/calidad/PRUEBA_CON_PERSONAS.md`) y Pedro revisa las políticas (S11-P03). Jeider junta el informe de la prueba (8/11).

**Mejoras de la evaluación de la IA antes de la humana** (`docs/calidad/EVALUACION_HEURISTICA_PLAN_A_5.md`, bloque A,
con registro de avance): hechos los ítems 3, 4, 8, 13 y 28. Faltan 2, 5, 7, 11, 21, 27, 29, 31 y revisar todos los
mensajes de error (3).

**Insumos de la remodelación reunidos el 28/10** (todo en `docs/PENDIENTES.md`, P35 a P44):

| Documento | Qué decide |
|---|---|
| `docs/curso-ddse3/RETROALIMENTACION_TOSCANO_2026-10-28.md` | Lo que pidió Toscano: desagregar ejercicios, remitir al concepto, explicar el código en el editor, repaso sin rojo, confianza por competencia |
| `docs/PROPUESTA_PARTE_FORMATIVA.md` | Leer con `leerNumero()` (hoy se usan arreglos desde la Unidad 1 y se enseñan en la 3), escalera de ejercicios, panel izquierdo explicado, «Practica esto primero», **competencias como sistema aparte del dominio** (indicadores del FDOC, evidencia de calidad, niveles, control del docente), ejercicios breves |
| `docs/PLAN_TUTOR_Y_ASISTENTE.md` | Los dos asistentes: contexto justo por pantalla, política pedagógica común, ficha guiada, crear clase desde cero, **laboratorio de prompts**, memoria del Tutor en tres capas, varios proveedores de IA, logo con doble borde, **orden de trabajo** |
| `docs/investigacion/EVALUACION_HEURISTICA_STIRE_2026-10-27.md` | Evaluación de la IA (3,94/5 para grado 10–11) |

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
