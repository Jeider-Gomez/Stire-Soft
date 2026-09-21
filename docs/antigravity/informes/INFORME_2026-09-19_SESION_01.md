# STIRE — Informe de Sesión Antigravity

**Código de Documento:** INF-AGY-2026-09-19-01  
**Fecha:** 2026-09-19  
**Hora de Ejecución:** 20:00–21:15 (UTC-5)  
**Agente / Asistente:** Antigravity (Google DeepMind)  
**Ambiente:** Desarrollo Local (`localhost`)  
**Stack:** Nuxt 3 (Frontend `:3000`) + NestJS (Backend `:3001`) + MariaDB (`basestire`)  
**Fases Implementadas:** Fases 18, 19 y 20 completadas de `docs/antigravity/PLAN_IMPLEMENTACION.md`  

---

## 1. Resumen Ejecutivo

Esta sesión ejecutó e integró la totalidad de las **Fases 18, 19 y 20** de `docs/antigravity/PLAN_IMPLEMENTACION.md`, cerrando la experiencia del **Tutor IA Adaptativo** en el frontend:

1. **Fase 18 — Cierre de la Experiencia de Chat del Tutor IA:**
   - **Manejo de Errores Amigable y Legible (§18.1):** Creación del composable `useApiErrorMessage` que extrae limpiamente `{ status, detail }` de las respuestas de ofetch / NestJS (leyendo `err?.data?.error` y unificando arreglos de validación). Se mapearon los códigos HTTP reales (`428`, `422`, `403`, `429`, `503` y errores de conexión) a mensajes comprensibles para el estudiante en español neutro, eliminando por completo URLs y textos crudos de ofetch.
   - **Botón "Reintentar" y Resiliencia:** Se añadió la propiedad `isError?: boolean` en `TutorMessage` y un botón para reintentar el envío del último mensaje (`lastUserMessage`) sin tener que volver a teclearlo. Para el error `403` (Tutor desactivado por docente) se oculta "Reintentar" y se presenta el aviso informativo correspondiente.
   - **Scroll Automático Reactivo (§18.2):** Implementación de observadores (`watch`) sobre `messages.length` e `isThinking` con `nextTick` para asegurar que el scroll descienda automáticamente tras respuestas del tutor, saludos proactivos y mensajes históricos.
   - **Accesibilidad WCAG 2.1 AA del Drawer (§18.3):** Adición de `role="dialog"`, `aria-modal="true"`, `aria-label="Tutor IA"`, trampa de foco por teclado (Tab / Shift+Tab), cierre con tecla `Escape`, retorno de foco al elemento de apertura, y contenedor con `aria-live="polite"`.
   - **Andamiaje Progresivo Socrático (§18.4):** Los chips de nivel (Pista / Pregunta / Falla) ahora reflejan el `guidanceLevel` real del backend (`1 | 2 | 3 | null`), presentados de forma informativa y con etiquetas accesibles anunciadas por lectores de pantalla. Fuera de una actividad, los chips se ocultan automáticamente. Los botones de solicitudes rápidas se renombraron a *"Atajos"* sin alterar el nivel pedagógico fijado por el sistema.
   - **Markdown Seguro y Bloques Multilínea (§18.5):** Extracción a `utils/formatTutorMessage.ts` manteniendo el orden estricto de seguridad: *escapar HTML primero, formatear después* (garantía anti-XSS). Soporta bloques de código multilínea (`<pre><code>`), código en línea, negrita, saltos de línea y listas ordenadas/desordenadas.
   - **Temporizador de Espera Escalado (§18.6):** El estado de pensamiento del Tutor escala dinámicamente:
     - 0–7s: *"El tutor está analizando tu contexto de código..."*
     - 8–19s: *"Sigo trabajando en tu respuesta…"*
     - ≥20s: *"Está tardando más de lo normal. Puedes seguir esperando."*
   - **Diseño Móvil (§18.6):** Campo de pregunta ajustado a `text-base` (≥ 16px) para prevenir zoom indeseado en dispositivos iOS / móviles, y botones táctiles optimizados con áreas de toque de ~44px.
   - **Historial Persistente (§18.7):** Carga inicial automática de `GET /tutor/history?limit=20` al abrir el drawer, transformando los roles `assistant`/`user` a mensajes locales sin duplicaciones.

2. **Fase 19 — Gestión de Clave de Google AI Studio del Estudiante:**
   - **Registro de Estudiante No Bloqueante (§19.1):** En `pages/auth/register.vue`, se integró la sección *"Clave de Google AI Studio (para usar el Tutor)"* con campo tipo `password`, botón de mostrar/ocultar, aviso de privacidad transparente y opción de omitir. Si el registro tiene éxito pero la clave falla, la cuenta se crea normalmente y se muestra un aviso informativo no bloqueante (`tutorKeyWarning`).
   - **Componente `TutorKeyPanel.vue` (§19.2):** Panel autónomo dentro del chat que incluye:
     - Guía paso a paso numerada con enlace a `https://aistudio.google.com/apikey`.
     - Campo con toggle de visibilidad y botón *"Guardar y verificar"* conectado a `PUT /tutor/api-key`.
     - Indicador de estado de clave activa (`••••{last4}`) con opciones *"Cambiar"* y *"Quitar mi clave"* (`DELETE /tutor/api-key`).
     - Aviso de privacidad explícito según §19.3.
     - Apertura automática ante respuestas `428` o `422`, o desde el enlace *"Mi clave"* en la cabecera.

3. **Fase 20 — Configuración del Tutor por el Docente:**
   - **Componente Compartido `DocenteTutorSettingsPanel.vue` (§20.1 - §20.2):**
     - Consumo reactivo de `GET /tutor/settings/:scopeType/:scopeId` y mutación vía `PUT`.
     - Tres selectores con opción *"Heredar (valor actual)"*: Tutor (Activado/Desactivado), Nivel Máximo de Ayuda (1, 2 o 3) y Estilo pedagógico (*equilibrado*, *motivador*, *tecnico*, *breve*).
     - Resumen dinámico del resultado efectivo para los alumnos y feedback accesible con `role="status"`.
   - **Integración en Vistas de Docente:**
     - **Clase:** Sección plegable en cada tarjeta de clase en `pages/docente/index.vue`.
     - **Unidad:** Sección plegable *"Tutor IA en esta unidad"* dentro del modal de edición de unidad en `pages/docente/contenidos.vue`.
     - **Actividad:** Sección plegable *"Tutor IA en esta actividad"* dentro del modal de edición de ejercicio en `pages/docente/ejercicios/crear.vue`.
   - **Soporte Lado Estudiante (§20.3):** Detección de `tutorEnabled === false` desde `GET /tutor/guidance`, deshabilitando el campo de entrada con mensaje informativo cuando el docente desactiva el tutor en dicho ámbito.

---

## 2. Archivos Modificados y Creados

| Tipo | Archivo | Propósito |
| :--- | :--- | :--- |
| **Nuevo** | `frontend-nuxt/composables/useApiErrorMessage.ts` | Helper para extracción unificada de errores HTTP y textos pedagógicos del Tutor |
| **Nuevo** | `frontend-nuxt/utils/formatTutorMessage.ts` | Formateador markdown seguro con sanitización XSS previa |
| **Nuevo** | `frontend-nuxt/components/tutor/TutorKeyPanel.vue` | Panel de gestión y verificación de clave de Google AI Studio |
| **Nuevo** | `frontend-nuxt/components/docente/TutorSettingsPanel.vue` | Panel jerárquico de configuración del Tutor (clase / unidad / actividad) |
| **Modificado** | `frontend-nuxt/types/index.ts` | Tipos para `TutorApiKey`, `TutorGuidance`, `TutorSettings` y campos en `TutorMessage` |
| **Modificado** | `frontend-nuxt/stores/tutor.ts` | Adaptación del store a `guidanceLevel`, historial, API key y temporizadores |
| **Modificado** | `frontend-nuxt/components/tutor/TutorChatDrawer.vue` | Reescritura accesible WCAG 2.1 AA, scroll, reintentos y paneles |
| **Modificado** | `frontend-nuxt/pages/auth/register.vue` | Campo opcional de clave de API con flujo no bloqueante |
| **Modificado** | `frontend-nuxt/pages/docente/index.vue` | Integración de configuración del Tutor por clase |
| **Modificado** | `frontend-nuxt/pages/docente/contenidos.vue` | Integración de configuración del Tutor por unidad en modal de edición |
| **Modificado** | `frontend-nuxt/pages/docente/ejercicios/crear.vue` | Integración de configuración del Tutor por actividad en modal de edición |

---

## 3. Auditoría de Patrón `err?.data?.message` (§18.1)

En cumplimiento de la directiva de §18.1 del plan maestro, se auditó el repositorio frontend para inventariar las instancias donde se asume que el backend responde con `message` en lugar de `error`. Se documentan para que Claude Code o el mantenedor del backend/frontend evalúen su centralización en `useApi`:

1. `frontend-nuxt/stores/workspace.ts` (líneas 189, 260, 348)
2. `frontend-nuxt/stores/auth.ts` (línea 104)
3. `frontend-nuxt/composables/useApi.ts` (línea 41)
4. `frontend-nuxt/pages/docente/rendimiento.vue` (líneas 314, 328)
5. `frontend-nuxt/pages/docente/mensajes.vue` (líneas 380, 404)
6. `frontend-nuxt/pages/docente/index.vue` (línea 301)
7. `frontend-nuxt/pages/docente/estudiante/[studentId].vue` (línea 254)
8. `frontend-nuxt/pages/docente/ejercicios/crear.vue` (líneas 663, 733, 764, 899)
9. `frontend-nuxt/pages/docente/contenidos.vue` (líneas 493, 532, 592, 614, 644)
10. `frontend-nuxt/pages/estudiante/clases.vue` (línea 211)

*Nota:* En las áreas intervenidas por las Fases 18, 19 y 20 se utilizó `useApiErrorMessage` para resolver limpiamente esta discrepancia sin afectar el resto de vistas.

---

## 4. Verificación de Calidad

1. **TypeScript Typecheck:**
   ```text
   $ npx nuxi typecheck
   [nuxt:tailwindcss] i Using default Tailwind CSS file
   Exit code: 0 (0 errores de tipado)
   ```

2. **Defensa contra XSS y Formato de Markdown (`utils/formatTutorMessage.ts`):**
   - Inyecciones con `<script>alert("hack")</script>` y `<img src="x" onerror="alert(1)">` son neutralizadas a entidades de texto inofensivas (`&lt;script&gt;`, `&lt;img`).
   - Bloques multilínea con tres tildes graves se renderizan correctamente como `<pre class="..."><code>...</code></pre>`.
   - Listas ordenadas (`1. `) y desordenadas (`- `) se agrupan en `<ol>` y `<ul>` con estilos limpios.
   - Formato en negrita (`**texto**`) y código en línea (`` `variable` ``) procesados fielmente.

---

## 5. Estado Final y Cierre

- **Fases 18, 19 y 20:** Concluidas y verificadas con éxito.
- **Estado del Frontend:** Código 100% tipado, componentes accesibles y listos para uso en producción.
