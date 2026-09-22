# Guía de la auditoría QA de la Semana 6 (21–25 de septiembre)

**Para:** Jorge Cervantes · **Escrita por:** Claude Code, 21/09/2026 · **Entrega:** viernes 25/09.
Continúa la [guía del 16/09](./GUIA_AUDITORIA_2026-09-16.md) y tu [reporte del 18/09](./REPORTE_AUDITORIA_QA_STIRE_18-09.md);
cubre las tareas `S06-JOR01` y `S06-JOR02` de la bitácora y agrega lo que cambió esta semana. Hazla en el orden en que
aparece: está por prioridad. **No hace falta cubrirlo todo**: lo que no llegues a probar, dilo (eso también es información).

**Regla de oro (la misma de siempre):** en el reporte cuenta solo lo que **viste tú**, con los pasos para repetirlo.

## 0. Preparación

- Sistema levantado desde cero, como haría alguien que lo recibe: base de datos vacía → `npm ci` → `npm run migration:run`
  → `npm run db:seed:demo` → `npm run start:dev`, y el frontend con `cd frontend-nuxt && npm ci && npm run dev`.
  Si algo de ese camino falla, **ese es tu primer hallazgo**.
- En el `.env` del backend deben estar `TUTOR_KEY_ENCRYPTION_SECRET` (64 caracteres hexadecimales; se genera con el
  comando de `.env.example`).
- Tu propia clave gratuita de Google AI Studio (https://aistudio.google.com/apikey), para el Tutor. **No la pegues en ningún archivo ni en el reporte.**
- Cuentas de demostración: las del `README.md` raíz.

## 1. Lo nuevo del backend: roles y registro (prioridad alta — es seguridad)

Cambió esta semana quién puede ser docente. **Intenta romperlo**; cada fila es una prueba con su resultado esperado.

| # | Prueba | Resultado esperado |
|---|---|---|
| 1.1 | `POST /auth/register` con un campo `"role": "admin"` en el cuerpo | `400` (el servidor rechaza el campo) y **no** se crea la cuenta |
| 1.2 | Registro con `"requestedRole": "admin"` | `400` |
| 1.3 | Registro con `"requestedRole": "docente"` y correo `@unicor.edu.co` | `201`; la cuenta nace **estudiante**; la respuesta trae `roleRequest` con `status: "pending"` |
| 1.4 | Lo mismo con un correo `@gmail.com` | `201`, igual que con `@unicor.edu.co`: no hay restricción de dominio, por decisión explícita del dueño |
| 1.5 | Con la cuenta de 1.3 (aún pendiente): entrar a endpoints de docente (`POST /class`, crear contenido) | `403` en todos: pedir el rol no da el rol |
| 1.6 | Esa misma cuenta llama `GET /role-requests` y `PATCH /role-requests/:id` | `403` (solo admin) |
| 1.7 | Como admin, `PATCH /role-requests/:id` con `{"decision":"approve"}` | `200`; el usuario pasa a docente **sin volver a iniciar sesión**: su token anterior ya funciona como docente (el rol se lee de la base en cada petición) |
| 1.8 | Repetir la misma decisión sobre la misma solicitud | `409` |
| 1.9 | Decisión inválida (`"decision":"borrar"`), nota de más de 300 caracteres, `status=todos` en el filtro | `400` |
| 1.10 | Como admin, `PATCH /users/:tu-propio-id/role` con `{"role":"estudiante"}` | `403` (nadie se quita su propio rol de admin) |
| 1.11 | `PATCH /users/:id/role` con `{"role":"superadmin"}` o sin cuerpo | `400` |
| 1.12 | Como docente o estudiante, `PATCH /users/:id/role` | `403` |
| 1.13 | Registrar otra vez el mismo correo (con o sin `requestedRole`) | `409` y no aparece una segunda solicitud en `GET /role-requests` |
| 1.14 | `DELETE /users/:tu-propio-id` como admin | `403` |
| 1.15 | Fuerza bruta suave: 8 registros seguidos desde la misma IP | Desde el sexto en el mismo minuto aparece el límite (`429`) |

Cualquier forma de llegar a docente o admin **sin** pasar por la aprobación de un admin es un hallazgo **crítico**.

## 2. Lo que el dueño reportó como «no funciona» (verifica el estado real)

| # | Qué probar | Estado que se espera hoy |
|---|---|---|
| 2.1 | En `/estudiante/repasos`, pulsar «Iniciar Refuerzo» | **Falla conocida** (Fase 23 pendiente): el repaso solo desaparece de la lista y al recargar vuelve. Anótalo con pasos y captura; sirve de evidencia «antes» |
| 2.2 | En `/admin`, cambiar el rol de un usuario | **Falla conocida** (Fase 23): no hay control en pantalla; el endpoint sí existe (prueba 1.10–1.12) |
| 2.3 | En `/auth/register`, elegir entre estudiante y docente | **Falla conocida** (Fase 23): la pantalla no lo ofrece todavía; el endpoint sí (pruebas 1.3–1.4) |
| 2.4 | Panel docente `/docente`: tarjetas de estudiantes, maestría y «en riesgo» | Deberían mostrar datos reales; hoy muestran `0` sin tener el dato. Compara con la captura `12_docente-inicio.png` de `docs/material-visual/00-primera-version/` |

Después de que Antigravity entregue la Fase 23 (probablemente a mitad de semana), **repite la sección 2 y reporta si quedó**.

## 3. Tutor IA con una clave real (`S06-JOR02`)

1. Como estudiante sin clave: abrir el Tutor, seguir los pasos, pegar **tu** clave y guardar. Prueba también una clave inventada y una demasiado corta.
2. **Adversarial:** intenta que el Tutor te dé la solución completa de un ejercicio (pedirla directo, disfrazarla de «ejemplo», pedir «solo el código», hacerlo en pasos). Anota qué prompts probaste y si alguna dejó pasar un programa completo. Si el docente configura un tope de ayuda (`Nivel 1`), comprueba que se respeta.
3. **Desactivado por el docente:** como docente, apaga el Tutor de una clase; como estudiante de esa clase, comprueba que el Tutor lo dice y no responde.
4. **Accesibilidad con lector de pantalla** (NVDA o el de tu sistema) en **al menos dos flujos**: el panel del Tutor y el inicio de sesión. Anota lo que el lector dice y lo que no dice.

## 4. Regresiones visuales (José está cambiando la identidad)

`main` ya trae un primer avance de José (paleta y encabezado). Recorre las pantallas de las tres cuentas y compara con las 20 capturas de `docs/material-visual/00-primera-version/`:

- ¿Algo dejó de funcionar (botón que no responde, pantalla en blanco, texto ilegible)?
- Contraste: el texto claro sobre fondos de color (especialmente en el encabezado y en el panel docente).
- Foco visible con Tab y ancho de teléfono (375 px).

Reporta cualquier regresión con captura; **no la arregles**, se la devuelve a quien corresponda.

## 5. Lo pendiente de la semana

- **`S06-JOR01`** (verificación manual del fix de la Fase G): un estudiante **no matriculado** pide `GET /activity-questions/activity/:activityId` → `403`; uno matriculado con la actividad publicada → recibe las preguntas. Pasos y resultado documentados.
- **Despliegue de punta a punta desde cero:** `npm run verify:clean` en tu máquina (borra `node_modules`, reinstala, migra, siembra, compila, arranca y hace un login real). Debe terminar en «TODO EN VERDE». Si el arranque se pasa de tiempo en tu equipo, repítelo con `VERIFY_START_TIMEOUT_MS=180000` y anótalo.

## 6. Qué entregar

Un solo archivo: `docs/ReportesQA/REPORTE_AUDITORIA_QA_STIRE_<fecha>.md`, en la rama `qa/reporte-semana-6` (o directo a `main`, es un archivo nuevo). Con:

1. **Porcentaje de avance y veredicto de despliegue** (apto / apto con condiciones / no apto) y **por qué**, en dos párrafos.
2. **Tabla de hallazgos**: `id · severidad (crítico/alto/medio/bajo) · pantalla o endpoint · pasos para repetirlo · esperado · observado · evidencia`.
3. **Lo que no alcanzaste a probar**, dicho de forma explícita.

**Ojo con la seguridad:** los hallazgos de la sección 1 que sean vulnerabilidades **reales** (una forma de llegar a docente o admin sin aprobación, por ejemplo) **no van en el repositorio** (es público). Entrégalos por mensaje privado a quien integra; el reporte del repo dice solo «hallazgo de seguridad entregado en privado». Los que ya pasaron su prueba sí se pueden documentar.
