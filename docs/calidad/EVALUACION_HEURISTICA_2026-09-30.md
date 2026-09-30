---
estado:     hecha — 2026-09-30
método:     evaluación heurística (Nielsen y Molich, 1990) + recorrido cognitivo (Lewis et al., 1990) por un evaluador
dónde:      la web real (stire-soft.vercel.app contra la API de producción), Chrome, a 375 px (estudiante) y 1440 px (docente)
cuentas:    luisa.rojas@example.com (estudiante del grupo 2) y laura.martinez.docente@example.com
---

# Evaluación heurística y recorrido cognitivo — 30/09/2026

**Por qué:** antes de las rondas con el equipo (ver `GUIA_RONDA_1_EQUIPO.md`), un evaluador revisa las pantallas contra principios de
usabilidad conocidos. Encuentra lo evidente para que las rondas con personas se gasten en lo que solo una persona puede mostrar.
**Límite:** un solo evaluador encuentra una parte de los problemas; por eso esto va antes de las rondas, no en lugar de ellas.

Gravedad: **3** = da un dato falso o impide la tarea · **2** = confunde o frena · **1** = cosmético.

## Hallazgos corregidos

| # | Pantalla | Heurística | Gravedad | Qué pasaba | Qué se hizo |
|---|---|---|---|---|---|
| H1 | Docente → Rendimiento y Mis clases | Visibilidad del estado (dato correcto) | **3** | Las métricas de una clase mezclaban el progreso y las entregas de **otras** clases: Andrés tenía 96,8 % y 77 entregas **en las dos**. | El servidor solo cuenta lo de las unidades de esa clase. Prueba de regresión. |
| H2 | Estudiante → Inicio y Mi progreso | Coincidencia con el mundo real | **3** | «5 para hoy» y «Repasar conceptos (5)» cuando los 5 repasos eran **de mañana**. | Solo cuentan los vencidos o críticos; «Mi progreso» añade «N más en los próximos días». |
| H3 | Estudiante → Mi progreso e Inicio | Visibilidad del estado | **3** | Mientras cargaba mostraba **0** como si fuera real; segundos después, 5. | «—» y «Cargando…» hasta la primera carga completa. |
| H4 | Estudiante → Inicio y Mi progreso | Consistencia | **2** | Tres umbrales distintos: «La meta es 70 %», «Umbral de maestría: 70 %» y «Dominado» desde 85 % (el del servidor). Los nombres de estado usaban cortes propios (70/40). | Un solo umbral, 85 %, y los mismos cortes del servidor (85/60/20). |
| H5 | Estudiante → Inicio | Consistencia / reconocimiento | **2** | «0 % de Dominio» junto a «Dominio 100 %» sin decir de qué es cada uno. | «0 % de dominio en esta unidad». |
| H6 | Estudiante → Inicio | Diseño minimalista | **2** | La página medía **7865 px** en un teléfono: las 17 unidades con todos sus ejercicios abiertos. | Los ejercicios de cada unidad quedan plegados («Ver 6 ejercicios»). |
| H7 | Estudiante → Inicio | Lenguaje del usuario | **2** | «Actividades ponderadas (40 %)» (peso interno del ejercicio) y «En el período activo». | Sin el peso; «Desde que empezaste». |
| H8 | Todas | Visibilidad del estado (WCAG 2.4.2) | **2** | Todas las pestañas se llamaban igual: con varias abiertas o con lector de pantalla no se sabe dónde se está. | Título por pantalla: «Mi progreso · STIRE-Soft». |
| H9 | Ejercicio (teléfono) | Accesibilidad | **2** | El botón del tutor era solo un ícono, sin nombre para el lector de pantalla. | `aria-label="Abrir el Tutor IA"`. |
| H10 | Estudiante → Inicio | Consistencia (regla del proyecto) | **1** | Emojis como íconos (🏛 🔥 🗺 🧠 ▶ 🔒 ⚡). | Íconos de Lucide. |
| H11 | Docente → Rendimiento y Mis clases | Lenguaje | **1** | «97.36%» (punto decimal, decimales sin valor). | «97 %». |

Pruebas: `src/content-rendering/__tests__/evaluacion-heuristica.frontend.spec.ts` (7) y `analytics.service.spec.ts` (2 nuevas).

## Hallazgos abiertos (para decidir o para las rondas)

| # | Pantalla | Gravedad | Qué pasa | Propuesta |
|---|---|---|---|---|
| A1 | Docente → Contenidos | 2 | Si la unidad no tiene lecciones, «Escribir lección» abre el editor de texto: para agregar un recurso hay que cancelar. | Abrir el panel con las dos opciones. |
| A2 | Toda la app | 2 | Mucho texto de 10 y 11 px (en el inicio del estudiante, más de 500 elementos por debajo de 11 px). | Revisar con José (identidad visual): subir el texto secundario a 12 px. No se tocó `main.css` ni `tailwind.config.ts`. |
| A3 | Estudiante → Inicio | 1 | Otros emojis siguen en pantallas no revisadas. | Reemplazarlos al pasar por cada pantalla. |
| A4 | Estudiante → Ejercicio | 1 | «Todo o nada» es jerga de calificación. | Confirmar en la ronda 1 si se entiende. |

## Lo que funciona bien

- La pantalla del ejercicio es clara en el teléfono: enunciado, opciones grandes y un solo botón principal.
- El creador de ejercicios explica cada tipo con «qué hace el estudiante» e «ideal para».
- El panel del docente da primero los números que importan (estudiantes, dominio, rezago) y una acción clara por clase.
