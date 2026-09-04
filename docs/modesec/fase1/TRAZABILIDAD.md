---
estado:     vigente
verificado: 2026-09-04 contra commit HEAD (FASE CC-05)
fuente:     derivado de fase1/2.4_SISTEMA_COMPETENCIAS.md y contenidos/3.1_DIAGRAMA_CONTENIDOS.md
codigos:    EST-V02 · EST-V03
---

# Tabla de Trazabilidad — `COMP-203413` → RA → Contenido → Ventana → Endpoint

**Propósito:** esta es la respuesta directa a "demuéstrame la trazabilidad". Cada fila recorre la
cadena completa desde la competencia oficial del curso hasta el endpoint real que la sirve. Donde
un eslabón falta, se escribe como **hueco declarado**, no se rellena con algo que no exista.

**Granularidad de "unidad de aprendizaje":** una fila por cada ítem de la columna "Tema" de
[`contenidos/3.1_DIAGRAMA_CONTENIDOS.md`](../contenidos/3.1_DIAGRAMA_CONTENIDOS.md) §4 — el nivel
que corresponde 1:1 con la entidad `LearningUnit` del sistema (confirmado contra
`stire-seeder-demo.ts`, que crea `LearningUnit` a este mismo nivel de grano: "Unidad 1: Variables y
tipos de datos", "Unidad 2: Estructuras de control" — no al nivel más fino de sub-bullets como
"Numéricos" o "Cadenas", que son descripción de contenido dentro de una unidad, no unidades
separadas).

**Verificación de contenido sembrado (`db:seed:demo`):** de las 10 unidades de esta tabla, **solo 2
tienen contenido y actividad reales sembrados** en la base de datos demo (`stire-seeder-demo.ts`,
líneas 182-244): "Unidad 1: Variables y tipos de datos" y "Unidad 2: Estructuras de control". Las
8 restantes tienen el **modelo de datos que las soporta** (`LearningUnit`/`Content`/`Activity` son
genéricas, no específicas de un tema) pero **ninguna instancia poblada** — es un hueco de
contenido, no de arquitectura.

| # | `COMP-203413` | RA de unidad | Contenido (§3.1) | Ventana | Endpoint real | Hueco declarado |
|---|---|---|---|---|---|---|
| 1 | Aplica los fundamentos de la algoritmia... (p. 4) | `RA-203413-U1` | 1.1 Algoritmo y pensamiento computacional | `EST-V02` Lección | `GET /content/unit/:unitId`, `GET /learning-unit/:id` | ⚠️ Sin contenido sembrado en `db:seed:demo` — modelo soporta, instancia no existe. |
| 2 | ídem | `RA-203413-U1` | 1.2 Variables y tipos de datos | `EST-V02` Lección → `EST-V03` Práctica | `GET /content/unit/:unitId` → `GET /activities?learningUnitId=:id` → `POST /submissions/start` → `POST /submissions/:id/submit` | Ninguno — corresponde a "Unidad 1: Variables y tipos de datos" del seed demo, con contenido y actividad ("Quiz: ¿Qué es una variable?", "Ejercicio: Suma de dos números") reales. |
| 3 | ídem | `RA-203413-U1` | 1.3 Operadores y expresiones | `EST-V02` Lección | `GET /content/unit/:unitId` | ⚠️ Sin contenido sembrado en `db:seed:demo`. |
| 4 | ídem | `RA-203413-U1` | 1.4 Representación algorítmica | `EST-V02` Lección | `GET /content/unit/:unitId` | ⚠️ Sin contenido sembrado en `db:seed:demo`. |
| 5 | ídem | `RA-203413-U1` | 2.1 Decisión simple y compuesta | `EST-V02` Lección → `EST-V03` Práctica | `GET /content/unit/:unitId` → `GET /activities?learningUnitId=:id` → `POST /submissions/start` → `POST /submissions/:id/submit` | Contenido parcial — corresponde a "Unidad 2: Estructuras de control" del seed demo, con actividad real ("Completa el condicional") y contenido ("Condicionales if/else"). El seed demo colapsa 2.1-2.5 en una sola `LearningUnit`; no hay evidencia de que 2.2-2.5 estén separadas en la BD real. |
| 6 | ídem | `RA-203413-U1` | 2.2 Selección múltiple | `EST-V02` Lección → `EST-V03` Práctica | (mismos endpoints que fila 5) | ⚠️ Hueco declarado: si "Unidad 2: Estructuras de control" del seed es una sola `LearningUnit`, no está claro si 2.2 tiene su propia unidad o vive dentro de la misma unidad que 2.1. No verificable sin inspeccionar la BD real (fuera de alcance de esta fase documental). |
| 7 | ídem | `RA-203413-U1` | 2.3 Ciclos | `EST-V02` Lección → `EST-V03` Práctica | (mismos endpoints que fila 5) | ⚠️ Mismo hueco que fila 6. |
| 8 | ídem | `RA-203413-U1` | 2.4 Acumulación y control | `EST-V02` Lección → `EST-V03` Práctica | (mismos endpoints que fila 5) | ⚠️ Mismo hueco que fila 6. |
| 9 | ídem | `RA-203413-U1` | 2.5 Ciclos anidados | `EST-V02` Lección → `EST-V03` Práctica | (mismos endpoints que fila 5) | ⚠️ Mismo hueco que fila 6. |
| 10 | Aplica los fundamentos de la algoritmia... (p. 4) | `RA-203413-U2` (versión §6, p. 11 — ver `2.4_SISTEMA_COMPETENCIAS.md` §3.2 sobre la contradicción §5/§6) | 3.1 Función, procedimiento y descomposición | `EST-V02` Lección → `EST-V03` Práctica | `GET /content/unit/:unitId` → `GET /activities?learningUnitId=:id` → `POST /submissions/start` → `POST /submissions/:id/submit` | ⚠️ Sin contenido sembrado en `db:seed:demo`. |

---

## Huecos declarados — resumen

1. **8 de 10 unidades sin contenido/actividad sembrados** (filas 1, 3, 4, 6, 7, 8, 9, 10): el
   modelo de datos las soporta genéricamente, pero no hay instancias reales en `db:seed:demo`. No
   se corrige en esta fase (documental).
2. **Granularidad 2.1-2.5 no confirmable contra la BD real** (filas 6-9): el seed demo usa una
   sola `LearningUnit` ("Unidad 2: Estructuras de control") para todo el módulo de control de
   flujo; la tabla `3.1_DIAGRAMA_CONTENIDOS.md` propone 5 sub-unidades (2.1-2.5) como PROPUESTA
   STIRE. Si esa propuesta se implementa literalmente como 5 `LearningUnit` separadas o se
   mantiene colapsada en 1, es una decisión de FASE CC-06 (mockups) o de una fase de
   implementación — no se resuelve aquí.
3. **`RA-203413-U2` en la fila 10 hereda la contradicción §5/§6 del Plan de Curso** documentada en
   `2.4_SISTEMA_COMPETENCIAS.md` §3.2 — el eslabón "RA de unidad" de esta fila no tiene un único
   texto fuente, tiene dos, y difieren.
4. **Ninguna fila llega a una ventana `DOC-V0x` o `ADM-V0x`:** la cadena competencia→ventana de
   este documento es exclusivamente la del estudiante (`EST-V02`/`EST-V03`), porque son las únicas
   ventanas que consumen contenido/actividad de una unidad de aprendizaje directamente. Las
   ventanas docente (`DOC-V01` lista temas/unidades de una clase, `DOC-V03` crearía casos de
   prueba — `REQUERIDO-PENDIENTE`) y administrador no tienen un eslabón por-unidad-de-aprendizaje
   equivalente; no se fuerza una fila para ellas.
