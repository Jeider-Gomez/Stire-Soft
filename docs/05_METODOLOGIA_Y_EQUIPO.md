# STIRE — Cómo trabaja el equipo
**Curso DDSE3 2026-2 · Universidad de Córdoba · Equipo de 5**  
**Versión 5.0 · 7 de septiembre de 2026 · Mantiene: Jeider Gómez**

> Este es el documento principal de gestión del proyecto, junto con `MONITOREO_SEMANAL.md`. Trello contiene el trabajo operativo de cada sprint y GitHub contiene los entregables y evidencias técnicas.

---

## 1. En una frase

**Trabajamos en sprints semanales y gestionamos el flujo con un tablero Kanban de cuatro listas.** El viernes se cierra el sprint y se compromete el siguiente; martes y jueves se realizan reportes escritos de avance y riesgo.

La metodología se actualiza tomando como referencia la guía Kanban vigente de 2025: visualizar el workflow, controlar el WIP, establecer políticas explícitas y mejorar continuamente el flujo.

---

## 2. Reglas del equipo

### Regla 1 — Lo que no está en GitHub, no está hecho

El entregable debe existir en el repositorio antes del cierre semanal. No es obligatorio que todos dominen Git: Jeider o Pedro pueden subir archivos recibidos de otro integrante.

El commit de cierre de la bitácora mantiene el formato: `docs: actualiza bitacora semana X`.

### Regla 2 — Máximo 2 tarjetas en curso por persona

Si una persona ya tiene dos tarjetas en `⚙️ En curso`, debe terminar o devolver una antes de iniciar otra. El objetivo es reducir trabajo iniciado pero no terminado.

### Regla 3 — Una tarjeta está hecha solo si se puede mostrar

Para pasar a `✅ Hecho` deben cumplirse las tres condiciones:

1. El archivo, código o entregable existe y está respaldado en GitHub.
2. Está completo y puede mostrarse, no solamente iniciado.
3. Cuando corresponde a un entregable evaluable, Jorge realiza la revisión final contra la rúbrica.

### Regla 4 — Dependencias visibles

Si una tarjeta necesita que otra termine antes de comenzar, la dependencia debe aparecer explícitamente en su descripción, por ejemplo: `Depende de S04-J01`.

### Regla 5 — El compromiso semanal es estable

`📋 Esta semana` representa el compromiso acordado el viernes. Entre semana no se agregan tarjetas salvo una situación excepcional acordada por el equipo. Si aparece una urgencia, se registra y se decide qué trabajo sale para conservar el control del WIP.

---

## 3. Ritmo semanal

```text
VIERNES 8:00 pm       MAR 8:00 pm          JUE 8:00 pm          VIERNES 8:00 pm
┌───────────────┐     ┌─────────────┐      ┌─────────────┐      ┌────────────────┐
│ CIERRE +      │ ──► │ REPORTE DE  │ ──►  │ REPORTE DE  │ ──►  │ CIERRE +       │
│ ARRANQUE      │     │ AVANCE      │      │ RIESGO      │      │ NUEVO SPRINT   │
└───────────────┘     └─────────────┘      └─────────────┘      └────────────────┘
```

### Viernes — Cierre y arranque

| Fase | Tiempo | Qué ocurre |
|---|---:|---|
| Cierre | 20 min | Cada integrante muestra lo terminado y mueve las tarjetas correspondientes a `Hecho`. |
| Retro corta | 5 min | Se identifica qué facilitaría la siguiente semana. |
| Arranque | 15 min | Se seleccionan las tarjetas del nuevo sprint. Máximo 3 por persona. |
| Bitácora | — | Pedro consolida el resultado real en `MONITOREO_SEMANAL.md`. |

### Martes — Reporte de avance

```text
📊 MARTES · [Nombre]
1. Terminé: [qué quedó listo]
2. Estoy en: [tarjeta]
3. Me traba: [bloqueo concreto o "nada"]
```

### Jueves — Reporte de riesgo

```text
⚠️ JUEVES · [Nombre]
1. ¿Llego al viernes? → SÍ / EN RIESGO / NO
2. Me falta: [qué exactamente]
3. Necesito ayuda con: [qué y de quién o "nada"]
```

Si alguien responde `EN RIESGO`, el equipo busca una solución antes del viernes. Si responde `NO`, se divide la tarjeta: lo que sí puede terminarse se cierra y el resto pasa al siguiente sprint con una explicación en la bitácora.

---

## 4. El tablero — Trello

**Enlace del tablero semanal:** https://trello.com/b/WW9nWXQ5/stire-kanban-desarrollo-semana-04  
**Gestión operativa:** Pedro Romero  
**Revisión de calidad:** Jorge Cervantes

Trello es el espacio operativo. Cada sprint utiliza las mismas cuatro listas para mantener un flujo simple, visible y fácil de entender.

### Las cuatro listas

| Lista | Qué es | Regla |
|---|---|---|
| 📥 **Backlog** | Todo lo identificado que todavía no se ha comprometido | No cuenta como WIP. Puede contener trabajo futuro. |
| 📋 **Esta semana** | Trabajo comprometido en el cierre del viernes | Máximo **3 tarjetas por persona**. Entre semana no se agregan tarjetas salvo excepción acordada. |
| ⚙️ **En curso** | Trabajo iniciado y actualmente activo | Máximo **2 tarjetas por persona**. |
| ✅ **Hecho** | Trabajo terminado y demostrable | Debe cumplir la Regla 3 y contar con evidencia. |

> **No se crean columnas adicionales para Bloqueado, Revisión o QA.** Si una tarjeta queda bloqueada, permanece en `⚙️ En curso` y se marca con una etiqueta roja y `🚧 BLOQUEADA` en la descripción. Al liberarse, continúa su flujo normal.

### Estructura visual de etiquetas

Las etiquetas identifican área o riesgo; **no sustituyen las listas**.

| Color | Uso | Ejemplos |
|---|---|---|
| 🔵 Azul | Desarrollo / Frontend | Nuxt, componentes, integración |
| 🔴 Rojo | Riesgo / Bloqueo / QA crítico | backend crítico, pruebas fallidas |
| 🟣 Morado | Diseño / Contenido / UI-UX | Figma, MODESEC, contenidos |
| 🟠 Naranja | Gestión / Seguimiento | Trello, coordinación, cierre |
| 🟢 Verde | Trabajo estable | tarea sin bloqueo |
| 🟡 Amarillo | En riesgo | tarea que puede incumplir fecha |

> En Trello, **la posición determina el estado y el color explica el contexto**.

### Cómo se arma una tarjeta

```text
Título:      S04-J02 · Ventana Estándar — Jeider
Responsable: Jeider
Fecha:       10/09/2026
Etiqueta:    🔵 Desarrollo / Frontend
Descripción:
  🎯 Objetivo
  🔗 Dependencia: S04-J01 · Preparar frontend Nuxt
  ☑️ Pasos
  ☐ ...
  🏁 HECHO CUANDO: ...
```

Cada tarjeta debe tener como mínimo: **responsable, fecha, objetivo, dependencia cuando exista y condición de terminado**.

### Flujo visual

```text
📥 BACKLOG  →  📋 ESTA SEMANA  →  ⚙️ EN CURSO  →  ✅ HECHO
                    compromiso        WIP             evidencia
```

Kanban no exige un número fijo de columnas. Lo fundamental es que el equipo haga explícitos los estados, el punto de inicio y finalización, el control del WIP y las políticas de flujo. La guía de 2025 también incorpora una expectativa de nivel de servicio (SLE) para pronosticar el tiempo de flujo cuando existen datos suficientes.

### SLE provisional

Mientras acumulamos datos históricos:

> **Una tarjeta comprometida en un sprint semanal debería poder pasar de `En curso` a `Hecho` dentro de la misma semana.**

Al acumular varios sprints, Pedro y Jeider revisarán el tiempo de ciclo real y ajustarán esta expectativa. No es una garantía; es una señal para detectar tarjetas demasiado grandes o bloqueadas.

---

## 5. Quién hace qué

| Integrante | Rol principal | Responsabilidades del Sprint |
|---|---|---|
| **Jeider Gómez** | Líder Técnico | Backend, Tutor IA, arquitectura, frontend Nuxt e integración técnica. |
| **Pedro Romero** | Gestión + Documentación + Apoyo Técnico | Mantener Trello, mantener la bitácora, consolidar evidencias y apoyar componentes frontend. |
| **José López** | UI/UX + Comunicación | Validación visual contra Figma, material de sustentación y Pitch de avances. |
| **Julio Galvis** | Diseño Instruccional | Navegación, contenidos y validación pedagógica. |
| **Jorge Cervantes** | Calidad y Pruebas | Pruebas funcionales, revisión de calidad y validación de entregables contra la rúbrica. |

### Responsabilidades que no se deben mezclar

- **Pedro mantiene Trello y `MONITOREO_SEMANAL.md`.**
- **Jorge no administra Trello durante este sprint; revisa calidad y pruebas.**
- **José prepara el Pitch de avances de esta semana.**
- **Jeider y Pedro concentran la mayor carga de programación.**
- **Julio prioriza diseño instruccional y contenidos.**

---

## 6. Trello, GitHub y bitácora

```text
                 ┌───────────────┐
                 │    TRELLO     │
                 │ Trabajo diario│
                 │ + WIP + fechas│
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │    GITHUB     │
                 │ Código + docs │
                 │ + evidencias  │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │   BITÁCORA    │
                 │ Resultado real│
                 │ del sprint    │
                 └───────────────┘
```

**Trello:** qué se hará y qué está ocurriendo.  
**GitHub:** dónde está el resultado.  
**Bitácora:** qué ocurrió realmente al terminar la semana.

La bitácora no copia los checklists completos de Trello. Pedro toma las tarjetas terminadas, evidencias y pendientes y los convierte en registro histórico.

---

## 7. Bitácora semanal

`MONITOREO_SEMANAL.md` es mantenida por **Pedro Romero**.

Debe registrar:

- objetivo del sprint;
- integrantes y responsabilidades;
- avances reales;
- resultados terminados;
- bloqueos y cuellos de botella;
- evidencias;
- pendientes que pasan al siguiente sprint;
- decisiones relevantes.

Cada viernes se actualiza con base en lo que realmente quedó en `✅ Hecho`. No se marca una tarea como terminada únicamente porque alguien haya dicho que la terminó por WhatsApp.

---

## 8. Mejora continua

Cada cierre semanal incluye una retro corta:

1. ¿Qué trabajo fluyó bien?
2. ¿Dónde se acumuló trabajo?
3. ¿Qué tarjeta fue demasiado grande?
4. ¿Qué dependencia bloqueó el flujo?
5. ¿Qué regla o visualización debemos mejorar?

Las modificaciones al flujo deben ser pequeñas, justificadas y probadas en el siguiente sprint. La finalidad no es hacer el tablero más complejo, sino conseguir un flujo más visible, predecible y fácil de gestionar.

---

## 9. Referencia metodológica

La metodología de STIRE se inspira en Kanban aplicado al trabajo de conocimiento y se actualiza tomando como referencia:

- Kanban Guides. (2025). *The Kanban Guide (May 2025).* https://kanbanguides.org/the-kanban-guide/
- Kanban Guides. (2025). *Open Guide to Kanban — In the Context of Knowledge Work (July 2025).* https://kanbanguides.org/open-guide-to-kanban/2025.7/

---

*Solo hay dos documentos principales de gestión: este y `MONITOREO_SEMANAL.md`. El detalle operativo vive en Trello; los entregables y evidencias viven en GitHub.*
