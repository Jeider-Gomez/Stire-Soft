---
estado:     vigente
verificado: 2026-09-04 contra commit HEAD (FASE CC-06)
fuente:     normativo (índice)
codigos:    no aplica (índice)
---

# 📐 MODESEC — Diseño educativo y multimedial de STIRE-Soft

Carpeta de trabajo del modelo **MODESEC-ISO/IEC 12207** aplicado al proyecto **STIRE**
(Sistema Tutor Inteligente para la Resolución de Ejercicios).

**Curso:** DDSE3 2026-2 · Universidad de Córdoba · Docente: Dr. Raúl Emiro Toscano Miranda
**Norma de la asignatura:** presentación `DDS3-01.pdf` §3 · **Fuente base:** Caro, Toscano, Hernández y David (2012), *MODESEC*.

**Archivo Figma (FASE CC-06):** `STIRE-Soft — Sistema Visual` · fileKey `1MjKiDrjU65ezO3ztO0v4m` ·
<https://www.figma.com/design/1MjKiDrjU65ezO3ztO0v4m> — fundaciones (Color/Tipo/Espacio/Radio/Borde/Icono),
12 iconos D-01, componente `Ventana Estándar` (variante `Rol=Estudiante` diseñada; Docente/Admin
placeholder para CC-07/CC-08), y `COMP-V00` + `EST-V01..V06` en 4 estados cada una.

---

## 1. Por dónde empezar

| Si quieres… | Abre |
|---|---|
| Entender la experiencia, principios pedagógicos y trazabilidad | [`MARCO_UX_PEDAGOGICO_STIRE.md`](MARCO_UX_PEDAGOGICO_STIRE.md) |
| Consultar la nomenclatura oficial y microcopy visible para UI | [`NAMING_STIRE.md`](NAMING_STIRE.md) |
| Ver la especificación por actor (Estudiante, Docente, Admin) | [`usuarios/`](usuarios/) |
| Entender qué es MODESEC y qué se hace en cada fase | [`00_QUE_ES_MODESEC.md`](00_QUE_ES_MODESEC.md) |
| Saber qué nos falta y quién lo hace | [`01_GAP_Y_PLAN.md`](01_GAP_Y_PLAN.md) |
| Leer la Fase II completa de un tirón (entrega al docente) | [`FASE_II_DISENO_MULTIMEDIAL.md`](FASE_II_DISENO_MULTIMEDIAL.md) |
| Presentar en clase | [`entregables/STIRE_MODESEC_FASE_II.pptx`](entregables/) |

---

## 2. Cómo está organizada esta carpeta y por qué

```
docs/modesec/
├── README.md                          ← este índice: estado y responsables
├── usuarios/                          ← INSUMOS POR ROL (Estudiante, Docente, Administrador)
│   ├── README.md                      ← índice de especificaciones por actor
│   ├── estudiante/README.md           ← insumo maestro rol estudiante (EST-V01..V06)
│   ├── docente/README.md              ← insumo maestro rol docente (DOC-V01..V05)
│   └── administrador/README.md        ← insumo maestro rol administrador (ADM-V01..V03)
├── 00_QUE_ES_MODESEC.md               ← el modelo explicado (las 5 fases, los 17 formatos)
├── 01_GAP_Y_PLAN.md                   ← qué falta, quién lo hace, en qué orden
├── PLANTILLAS_MODESEC_FASE2.md        ← plantillas vacías (no se edita: se copia)
├── FASE_II_DISENO_MULTIMEDIAL.md      ← documento consolidado de la Fase II
│
├── contenidos/     (dueño: Julio)     ← §3.1 · §3.3.2 · §3.3.3
├── guiones/        (dueño: por asignar)← §3.2 guión didáctico + guión técnico
├── ventanas/       (dueño: José)      ← §3.3 · §3.3.1
├── assets/                            ← TODOS los gráficos (.svg fuente + .png render)
└── entregables/                       ← lo que se entrega o se presenta (.pptx)
```

**Cuatro decisiones de organización, y la razón de cada una:**

1. **Una carpeta por tipo de pieza, no una por persona.** Las carpetas siguen la numeración de
   MODESEC (`3.1`, `3.2`, `3.3`…), no los nombres del equipo. Si alguien cambia de rol o entra
   tarde, la carpeta no se renombra. El dueño se declara en este README, que es un solo archivo
   fácil de actualizar.
2. **El número de la sección va en el nombre del archivo.** `3.3.1_FICHAS_VENTANAS.md` se ordena
   solo y el docente puede auditar sección por sección contra la guía sin abrir nada. Un archivo
   llamado `fichas.md` obliga a adivinar a qué punto de la norma responde.
3. **Los gráficos viven en `assets/`, nunca dentro del Markdown.** Markdown no guarda imágenes:
   solo las enlaza. Por eso cada figura se genera como **SVG** (fuente vectorial, editable y
   versionable: Git puede mostrar qué cambió) y se renderiza a **PNG** (lo que GitHub muestra
   incrustado). El documento enlaza el PNG y referencia el SVG como fuente. Así el texto y la
   imagen viajan juntos en el mismo commit y ningún gráfico depende de un enlace externo que
   mañana caduca.
4. **`entregables/` separado del trabajo.** Lo que se le entrega al docente (el .pptx) no se mezcla
   con el material de trabajo. Se regenera desde los documentos, nunca al revés: **la fuente de
   verdad es el Markdown**.

> **Regla del equipo:** un cambio en una sección se hace en su archivo `.md`. El documento
> consolidado y el .pptx se actualizan *después*, a partir de él. Nunca al contrario.

---

## 3. Estado de la Fase II

| § | Pieza | Formato MODESEC | Archivo | Dueño | Estado |
|---|---|---|---|---|---|
| 3.1 | Diagrama de contenidos | — (Gráfico 1) | [`contenidos/3.1_DIAGRAMA_CONTENIDOS.md`](contenidos/3.1_DIAGRAMA_CONTENIDOS.md) | Julio | ✅ Completo |
| 3.2 | Guión didáctico | Formato 10 | [`guiones/3.2_GUION_TECNICO_MULTIMEDIAL.md`](guiones/3.2_GUION_TECNICO_MULTIMEDIAL.md) | Por asignar | ✅ Completo |
| 3.2 | Guión técnico | Formato 11 | mismo archivo | Por asignar | ✅ Completo |
| 3.2.3 | Selección y producción de recursos multimedia | — | mismo archivo | Por asignar | 🟡 Inventario hecho, producción pendiente |
| 3.3 | Ventana estándar | Formato 12 | [`ventanas/3.3_VENTANA_ESTANDAR.md`](ventanas/3.3_VENTANA_ESTANDAR.md) | José | ✅ Completo |
| 3.3.1 | Fichas de descripción de ventanas (7 categorías) | Formato 13 | [`ventanas/3.3.1_FICHAS_VENTANAS.md`](ventanas/3.3.1_FICHAS_VENTANAS.md) | José / Julio / Jeider | ✅ Completo (15 ventanas multi-rol) |
| 3.3.2 | Guía de metáforas | Formato 14 | [`contenidos/3.3.2_GUIA_METAFORAS.md`](contenidos/3.3.2_GUIA_METAFORAS.md) | Julio | ✅ Completo (12 iconos) |
| 3.3.3 | Mapa de navegación | Gráfico 2 | [`contenidos/3.3.3_MAPA_NAVEGACION.md`](contenidos/3.3.3_MAPA_NAVEGACION.md) | Julio | ✅ Completo |

**Fases anteriores y posteriores:** ver el semáforo completo en [`01_GAP_Y_PLAN.md`](01_GAP_Y_PLAN.md).
La Fase I (Diseño educativo) está **parcialmente cubierta** por documentos que hoy viven fuera de
esta carpeta y aún no están en formato MODESEC; ese es el principal riesgo declarado del proyecto.

---

## 4. Gráficos disponibles (`assets/`)

| Figura | Fuente (editable) | Render (para incrustar) |
|---|---|---|
| Diagrama de contenidos | `assets/3.1_diagrama_contenidos.svg` | `assets/png/3.1_diagrama_contenidos.png` |
| Ventana estándar (A–E) | `assets/3.3_ventana_estandar.svg` | `assets/png/3.3_ventana_estandar.png` |
| Ventanas V-01 … V-06 | `assets/3.3.1_v0*.svg` | `assets/png/3.3.1_v0*.png` |
| Guía de metáforas (12 iconos) | `assets/3.3.2_guia_metaforas.svg` | `assets/png/3.3.2_guia_metaforas.png` |
| Mapa de navegación | `assets/3.3.3_mapa_navegacion.svg` | `assets/png/3.3.3_mapa_navegacion.png` |

Los SVG se editan con cualquier editor de texto o con Figma/Inkscape. Si cambias un SVG,
**regenera el PNG** antes de commitear, para que el documento no muestre una versión vieja.

---

## 5. Cómo publicar los cambios en GitHub

```bash
# desde la raíz del repositorio Stire-Soft
git add docs/modesec
git commit -m "docs(modesec): completa Fase II — guion tecnico, mapa de navegacion y graficos"
git push origin main
```

Para la bitácora del curso, recuerda que `MONITOREO_SEMANAL.md` va en la **raíz** del repositorio,
no aquí (así lo exige la guía del estudiante de la Clase 02).
