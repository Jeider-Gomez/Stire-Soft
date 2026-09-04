---
estado:     vigente
verificado: 2026-09-04 contra commit HEAD (FASE CC-05B)
fuente:     derivado de fase1/2.4_SISTEMA_COMPETENCIAS.md y contenidos/3.1_DIAGRAMA_CONTENIDOS.md
codigos:    EST-V02 · EST-V03
---

# Tabla de Trazabilidad — `COMP-203413` → RA → Contenido → Ventana → Endpoint

**Propósito:** esta es la respuesta directa a "demuéstrame la trazabilidad". Cada fila recorre la
cadena completa desde la competencia oficial del curso hasta el endpoint real que la sirve.

> **Actualización D-06 (FASE CC-05B):** STIRE-Soft es una herramienta de apoyo al docente, con
> alcance declarado — razonamiento algorítmico y estructuras de control (`RA-203413-U1` completo +
> parte algorítmica de `U2`), no `COMP-203413` completa. Se agrega la columna **Cobertura STIRE**
> para distinguir explícitamente tres cosas que antes se mezclaban bajo "hueco": (a) contenido que
> STIRE cubre por decisión de alcance, (b) contenido que queda deliberadamente fuera y se dicta por
> otros medios del curso, y (c) contenido que sí está dentro del alcance declarado pero todavía no
> está listo (esto último es lo único que cuenta como hueco real). Ver
> [`contenidos/3.1_DIAGRAMA_CONTENIDOS.md`](../contenidos/3.1_DIAGRAMA_CONTENIDOS.md) §6 para el
> detalle de la decisión de alcance.

**Granularidad de "unidad de aprendizaje":** una fila por cada ítem de la columna "Tema" de
`3.1_DIAGRAMA_CONTENIDOS.md` §4 — el nivel que corresponde 1:1 con la entidad `LearningUnit` del
sistema (confirmado contra `stire-seeder-demo.ts`, que crea `LearningUnit` a este mismo nivel de
grano: "Unidad 1: Variables y tipos de datos", "Unidad 2: Estructuras de control" — no al nivel más
fino de sub-bullets como "Numéricos" o "Cadenas", que son descripción de contenido dentro de una
unidad, no unidades separadas).

## Leyenda — Cobertura STIRE

| Valor | Significado |
|---|---|
| `cubierto` | Dentro del alcance MVP declarado (D-06); es contenido que la herramienta sirve. |
| `fuera de alcance — se dicta por otros medios` | Excluido deliberadamente del MVP; el docente lo cubre por otra vía (clase, taller, revisión directa). No es un hueco. |
| `pendiente` | Dentro del alcance MVP, pero todavía no verificable/entregado. **El único valor que cuenta como hueco real.** |

---

| # | `COMP-203413` | RA de unidad | Contenido (§3.1) | Ventana | Endpoint real | Cobertura STIRE |
|---|---|---|---|---|---|---|
| 1 | Aplica los fundamentos de la algoritmia... (p. 4) | `RA-203413-U1` | 1.1 Algoritmo y pensamiento computacional | `EST-V02` Lección | `GET /content/unit/:unitId`, `GET /learning-unit/:id` | `cubierto` |
| 2 | ídem | `RA-203413-U1` | 1.2 Variables y tipos de datos | `EST-V02` Lección → `EST-V03` Práctica | `GET /content/unit/:unitId` → `GET /activities?learningUnitId=:id` → `POST /submissions/start` → `POST /submissions/:id/submit` | `cubierto` — contenido y actividad reales en `db:seed:demo` ("Quiz: ¿Qué es una variable?", "Ejercicio: Suma de dos números"). |
| 3 | ídem | `RA-203413-U1` | 1.3 Operadores y expresiones | `EST-V02` Lección | `GET /content/unit/:unitId` | `cubierto` |
| 4 | ídem | `RA-203413-U1` | 1.4 Representación algorítmica | `EST-V02` Lección | `GET /content/unit/:unitId` | `cubierto` |
| 5 | ídem | `RA-203413-U1` | 2.1 Decisión simple y compuesta | `EST-V02` Lección → `EST-V03` Práctica | `GET /content/unit/:unitId` → `GET /activities?learningUnitId=:id` → `POST /submissions/start` → `POST /submissions/:id/submit` | `cubierto` — contenido y actividad reales en `db:seed:demo` ("Condicionales if/else", "Completa el condicional"). |
| 6 | ídem | `RA-203413-U1` | 2.2 Selección múltiple | `EST-V02` Lección → `EST-V03` Práctica | (mismos endpoints que fila 5) | `cubierto` |
| 7 | ídem | `RA-203413-U1` | 2.3 Ciclos | `EST-V02` Lección → `EST-V03` Práctica | (mismos endpoints que fila 5) | `cubierto` |
| 8 | ídem | `RA-203413-U1` | 2.4 Acumulación y control | `EST-V02` Lección → `EST-V03` Práctica | (mismos endpoints que fila 5) | `cubierto` |
| 9 | ídem | `RA-203413-U1` | 2.5 Ciclos anidados | `EST-V02` Lección → `EST-V03` Práctica | (mismos endpoints que fila 5) | `cubierto` |
| 10 | Aplica los fundamentos de la algoritmia... (p. 4) | `RA-203413-U2` (versión §6, p. 11) | 3.1 Función, procedimiento y descomposición | `EST-V02` Lección → `EST-V03` Práctica | `GET /content/unit/:unitId` → `GET /activities?learningUnitId=:id` → `POST /submissions/start` → `POST /submissions/:id/submit` | `cubierto` |
| 11 | Aplica los fundamentos de la algoritmia... (p. 4) | `RA-203413-U1`, `RA-203413-U2` | Contenido de 8 de las 10 unidades de arriba (filas 1, 3, 4, 6, 7, 8, 9, 10) sin sembrar en `db:seed:demo` | `EST-V02` / `EST-V03` (mismas de cada fila) | mismos endpoints — responden vacío/404 sin datos, no es falla de arquitectura | `pendiente` — trabajo de contenido, no de arquitectura. Ver Hueco #1. |
| 12 | — | `RA-203413-U1` | Granularidad 2.1-2.5 (filas 6-9): el seed demo colapsa las 5 en una sola `LearningUnit` ("Unidad 2: Estructuras de control"); no verificable si la BD real las separa | `EST-V02` / `EST-V03` | — | `pendiente` — decisión de FASE CC-06 o de implementación. Ver Hueco #2. |
| 13 | Aplica los fundamentos de la algoritmia... (p. 4) | `RA-203413-U2` — contradicción interna §5/§6 del Plan de Curso (ver `2.4_SISTEMA_COMPETENCIAS.md` §3.2) | 3.1 Función, procedimiento y descomposición (fila 10) | — | — | `pendiente` — no es un hallazgo de STIRE, es del documento institucional. Se pregunta al docente titular. Ver Hueco #3. |

---

## Recuento de cobertura

| Valor | Filas |
|---|---|
| `cubierto` | 10 (filas 1-10) |
| `fuera de alcance — se dicta por otros medios` | 0 en esta tabla — el contenido fuera de alcance (HTML5/CSS, DOM, Unidad 3 OVA/REDA) nunca tuvo fila propia aquí porque nunca fue una `LearningUnit`; su detalle vive en `3.1_DIAGRAMA_CONTENIDOS.md` §6.2, no se duplica aquí. |
| `pendiente` (hueco real) | **3** (filas 11, 12, 13) |

## Huecos reales — exactamente 3

1. **Contenido de 8 de 10 unidades sin sembrar en `db:seed:demo`** (fila 11): el modelo de datos
   las soporta genéricamente (`LearningUnit`/`Content`/`Activity` son entidades genéricas), pero no
   hay instancias pobladas. Es trabajo de contenido, no de arquitectura — no se corrige en esta
   fase (documental).
2. **Granularidad 2.1-2.5 no verificable contra la BD real** (fila 12): el seed demo usa una sola
   `LearningUnit` para todo el control de flujo; si la propuesta de 5 sub-unidades se implementa
   literalmente separada o se mantiene colapsada es una decisión de FASE CC-06 o de implementación.
3. **Contradicción interna del propio Plan de Curso entre §5 y §6 sobre `RA-203413-U2`** (fila 13):
   no es un hallazgo de STIRE — es del documento institucional (`FDOC-088`). Se señala, no se
   resuelve por cuenta propia: se pregunta al docente titular.

**Nota:** ninguna fila llega a una ventana `DOC-V0x` o `ADM-V0x` — la cadena de esta tabla es
exclusivamente la del estudiante (`EST-V02`/`EST-V03`), porque son las únicas ventanas que
consumen contenido/actividad de una unidad de aprendizaje directamente.

---

## Nota de sustentación

El recorte de alcance (D-06) es una decisión **pedagógica**, no una limitación técnica: STIRE
podría, con más tiempo, construir un evaluador de HTML/CSS o un flujo de entrega de portafolio,
pero no sería la herramienta correcta para ese trabajo — un juez de código es preciso donde hay una
respuesta objetivamente verificable, y débil donde el criterio es visual o pedagógico. El docente
conserva esa parte del curso, que es exactamente lo que MOCAVI plantea sobre mediación docente: la
tecnología no reemplaza el rol del profesor, lo complementa donde aporta valor real. El alcance
está escrito aquí y en `3.1_DIAGRAMA_CONTENIDOS.md` §6 desde antes de la sustentación — no es algo
que se descubra o se justifique improvisando frente al jurado.
