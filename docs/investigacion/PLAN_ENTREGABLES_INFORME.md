---
estado:     vigente
verificado: 2026-09-14
fuente:     asesoría metodológica externa (artefacto Claude, "Producción de los Entregables STIRE", rev. 2, 14 sep. 2026)
codigos:    no aplica (investigación, no ventanas)
---

# Plan de producción de los entregables del §5.4 del informe

> Guarda el contenido de la asesoría metodológica recibida el 14 de septiembre de 2026 sobre cómo
> cerrar el apartado 5.4 del informe de investigación. Complementa a
> [`CONTEXTO_STIRE.md`](CONTEXTO_STIRE.md) (los datos autorizados) con el plan de qué producir, en
> qué orden y con qué estructura. Los borradores ya producidos viven en
> [`entregables/`](entregables/).

---

## 1. Qué cambió en el informe (13 sep. vs. 24 ago. 2026)

Los tres apartados del 5.4 se reescribieron con el rótulo **«preliminar»** y en modo condicional
("el tutor deberá", "la información sería analizada"), y se añadieron dos cláusulas de deslinde
(ver `CONTEXTO_STIRE.md` §2). Acierto a conservar. Consecuencia que atraviesa los cuatro
entregables: **la arquitectura del cuerpo del informe es funcional, no técnica** — describe qué
hace cada componente y qué información circula, nunca con qué tecnología se construye. El stack
real (NestJS, MySQL, TypeORM, BullMQ, Redis, Docker) documentado en el resto de este repositorio
no entra al cuerpo del informe; a lo sumo, a un anexo rotulado "exploración técnica preliminar".

## 2. Cinco arreglos de estructura, previos a añadir contenido nuevo

> **Confirmado contra el documento real** (`Análisis y diseño actual.docx`, Google Drive, ID
> `1DzoEr52yzrhDTSDRgdATPO4je-cv07Vd`, modificado 2026-09-13) el 2026-09-14 — no se dio por cierto
> el reporte del artefacto sin verificarlo, siguiendo el criterio de este proyecto de tratar todo
> hallazgo como hipótesis hasta comprobarlo. Los cinco problemas son reales, tal como se describen
> abajo con sus anclas de texto exactas para ubicarlos en Word.

1. **Apartados duplicados — confirmado.** El documento contiene 5.4.1, 5.4.2 y 5.4.3 dos veces
   seguidas. **Bloque antiguo a borrar completo** (en indicativo, sin rótulo "preliminar"):
   empieza en `### 5.4.1 Características definidas para el tutor inteligente` ("Como resultado
   del proceso de análisis de necesidades, revisión de literatura y co-diseño...") y termina justo
   antes de `### 5.4.1 Características definidas para la propuesta del tutor inteligente` (nótese
   el "para la propuesta" añadido — así se distinguen). El bloque antiguo incluye su propio
   5.4.2 "Modelo pedagógico propuesto" (sin "preliminar") y su propio 5.4.3 "Arquitectura funcional
   propuesta" (sin "preliminar"), ambos también en indicativo. **Bloque nuevo a conservar**:
   empieza en `### 5.4.1 Características definidas para la propuesta del tutor inteligente` y
   termina en el párrafo "En consecuencia, la arquitectura funcional propuesta permite articular
   los componentes pedagógicos definidos..." (justo antes del capítulo "Conclusiones").
2. **«5.4.2 Modelo pedagógico preliminar propuesto» sin encabezado — confirmado.** En el bloque
   nuevo a conservar, ese título quedó como párrafo normal (sin el `###` que sí tienen 5.4.1 y
   5.4.3 inmediatamente antes y después de él). Aplicar estilo de encabezado nivel 3 en Word.
3. **No existe el numeral padre 5.4 — confirmado.** La tabla de contenido salta de 5.3.4
   directamente a 5.4.1, sin una entrada "5.4" que los agrupe. Crear `5.4 Resultados del proceso
   de diseño de la propuesta` como encabezado nivel 2, antes de 5.4.1.
4. **El 5.3 al mismo nivel que sus subapartados — confirmado.** "5.3 Resultados del análisis de
   tutores inteligentes" y "5.3.1 Hallazgos de Khan Academy y Khanmigo" (y 5.3.2/5.3.3/5.3.4) usan
   el mismo estilo de encabezado (nivel 3) en el documento real. Bajar 5.3 a nivel 2.
5. **Numeración de figuras — confirmado, con precisión adicional.** Las figuras van 1 (repetida:
   hay una "Figura 1" en la lista de figuras del inicio del documento y otra "Figura 1" distinta
   ya dentro del capítulo 4, "Aplicación de la entrevista semiestructurada..." — revisar esa
   colisión también), 2, 3, 4 (`Análisis de la investigación`, cap. 4), luego salta directo a 9, 10
   y 11 ("Sesión de co-diseño...", "Modelo pedagógico del tutor inteligente con repetición
   espaciada", "Arquitectura funcional del tutor inteligente propuesto") — las tres **dentro del
   capítulo 4, sección "4.4 Fase 3. Diseño colaborativo del tutor inteligente"**, no en el
   capítulo 5. Después continúan 12 a 17 ya en el capítulo 4 (encuesta/test diagnóstico). El
   capítulo 5 ("Resultados"), incluido el §5.4 completo, **no declara ninguna figura propia**.
   Confirma exactamente el criterio del artefacto: el capítulo 4 ya se atribuyó las figuras que
   deberían mostrar el modelo y la arquitectura *como resultado* en el capítulo 5. Al renumerar,
   decidir si esas tres figuras (9, 10, 11) se mueven al §5.4 o se duplican con numeración nueva
   allí — no basta con renumerar en el sitio donde están hoy.

**Responsable:** el dueño del proyecto, directamente en Word — no delegable a una IA. Motivo
técnico verificado en esta sesión: el conector de Drive disponible solo permite leer el documento
como texto plano o reemplazar el archivo completo; no expone edición de estilos de encabezado ni
de los campos de tabla de contenido/figuras de Word, y reescribir el `.docx` completo desde texto
plano perdería el resto del formato (fuentes, numeración automática, tablas, imágenes).

## 3. La cadena de trazabilidad (orden obligatorio de producción)

```
Diagnóstico ──┐
              ├──► 01 Características (§5.4.1) ──► 02 Modelo pedagógico (§5.4.2) ──┐
Análisis de   │                                 └──► 03 Arquitectura funcional (§5.4.3) ──► 04 Interfaz (§5.4.4)
referentes ───┘
```

Las características (entregable 01) son el pivote: no se inventan, se derivan del cruce entre lo
que el diagnóstico reveló y lo que los referentes demostraron. El modelo pedagógico y la
arquitectura describen cómo se enseña y qué lo sostiene; la interfaz materializa ambos.

**El eslabón que faltaba:** la Tabla 2 original solo mapeaba plataforma → característica ("de
Khanmigo se tomó la tutoría socrática"). Falta el mapeo **necesidad diagnosticada →
característica** — la pregunta de sustentación es "¿por qué esta característica y no otra?", y la
respuesta debe apoyarse en un dato del diagnóstico, no en que una plataforma comercial la tenga.
Este es el propósito central del entregable 01.

## 4. Los cuatro entregables

Cada uno produce dos piezas: un formato diligenciable (evidencia de la sesión) y el texto que
entra al informe. Nombres de archivo de la serie del proyecto:

### 01 — Matriz de trazabilidad de características
`S05a_MatrizTrazabilidad_Caracteristicas.docx` · **Estado: producido**, ver
[`entregables/S05a_MatrizTrazabilidad_Caracteristicas.md`](entregables/S05a_MatrizTrazabilidad_Caracteristicas.md)

- Tabla de 7 columnas × 6 filas (CAR-01 a CAR-06): ID, característica, necesidad que la origina,
  evidencia y fuente, referente que la respalda, etapa del modelo que la realiza, componente de
  arquitectura que la soporta. La columna 6 (etapa) ya se completó tras producir el entregable 02.
  **La columna 7 (componente de arquitectura) se deja en blanco** hasta producir el entregable 03
  (para no pre-empatar antes de que ese entregable fije el criterio, en su apartado 7).
- Gráfico: mapa de las 6 características en 3 familias — adaptación (CAR-01, CAR-05),
  acompañamiento (CAR-02, CAR-03), consolidación (CAR-04, CAR-06).
- Va en §5.4.1, sobre el texto ya existente.

### 02 — Especificación del modelo pedagógico
`S05b_ModeloPedagogico_Especificacion.docx` · **Estado: producido**, ver
[`entregables/S05b_ModeloPedagogico_Especificacion.md`](entregables/S05b_ModeloPedagogico_Especificacion.md)

- Parte de `Sesion5_PlantillaDiseno.docx` (8 mayo 2026), que tiene las 3 etapas pero no la regla
  de decisión (umbral de dominio, intervalos, disparador de repaso).
- **Decisión ya tomada** (ver `CONTEXTO_STIRE.md` §5): progresión multiplicativa, no bandas fijas.
  1 día → 3 días → factor multiplicativo según dominio, tope 60 días, umbral de avance 60%.
- Estructura en 7 apartados: (1) fundamento teórico [Bloom 1968, Woźniak/Gorzelańczyk 1994,
  Cepeda et al. 2006, Roediger/Karpicke 2006 — ver `MATRIZ_ARTICULOS_AMPLIADA.md`], (2) objetivos
  de aprendizaje del tutor, (3) las tres etapas con criterio de salida verificable para cada una,
  (4) especificación de la repetición espaciada (variables, regla de cálculo, tabla de progresión
  para 3 niveles de dominio × 6 repasos, disparadores, tope), (5) escalamiento de la ayuda en 4
  niveles (pregunta orientadora → pista → ejemplo análogo → explicación), (6) indicadores de
  seguimiento, (7) supuestos y limitaciones (debe incluir que el modelo no fue aplicado ni
  evaluado empíricamente).
- Dos gráficos: ciclo de 3 etapas con caminos de retorno explícitos; progresión de intervalos de
  repaso (número de repaso × días hasta el siguiente, 2-3 series por nivel de dominio).
- Texto: 900-1200 palabras, apartado §5.4.2 completo.

### 03 — Especificación de la arquitectura funcional
`S06b_ArquitecturaFuncional_Especificacion.docx` · **Estado: producido**, ver
[`entregables/S06b_ArquitecturaFuncional_Especificacion.md`](entregables/S06b_ArquitecturaFuncional_Especificacion.md).
Su apartado 7 ("Correspondencia característica → componente") ya se usó para completar la columna
7, antes pendiente, de la matriz del entregable 01 — la matriz quedó completa el 2026-09-14.

- Parte de `Sesion6_GuiaTecnica.docx` (11 mayo 2026); su sección 6 "Diagrama de arquitectura"
  está vacía — es literalmente lo que falta.
- **Límite estricto:** arquitectura *funcional*, no técnica. Nada de capas, colas de trabajo,
  contenedores ni motores de base de datos — eso contradice la cláusula de deslinde. La
  documentación técnica real es valiosa pero va a un anexo o a un producto aparte.
- Estructura en 8 apartados: (1) propósito y alcance con deslinde explícito, (2) los 4
  componentes (responsabilidad, qué recibe, qué entrega), (3) tabla de entradas, (4) tabla de
  salidas (con referencia a los ID de característica que atiende), (5) flujo principal (6-8
  pasos), (6) modelo de información conceptual (estudiante, unidad, actividad, intento, progreso,
  agenda de repaso — sin tipos de dato ni claves), (7) correspondencia característica →
  componente (cierra el círculo con el entregable 01 — aquí se llenan sus columnas 6-7), (8)
  supuestos y fuera de alcance.
- Dos gráficos: diagrama de componentes y flujo (sin iconos de infraestructura); diagrama de
  secuencia simplificado de un intento de ejercicio (opcional, 5-6 pasos).
- Texto: 800-1000 palabras, apartado §5.4.3.

### 04 — Catálogo de la propuesta de interfaz
`S06c_PropuestaInterfaz_Catalogo.docx` · **Estado: producido**, ver
[`entregables/S06c_PropuestaInterfaz_Catalogo.md`](entregables/S06c_PropuestaInterfaz_Catalogo.md)

- Parte del Figma *STIRE Soft — Sistema Visual* (inventario completo en `CONTEXTO_STIRE.md` §5).
- Ficha por pantalla (estudiante + docente, no administrador): ID, actor, propósito, características
  que materializa (referencia a CAR-0X), elementos clave, estado representado, captura PNG 2×.
- Argumento de ~200-250 palabras sobre los tokens `estado-unidad` y `urgencia-repaso` como
  operacionalización visual del modelo pedagógico.
- Especificación de un recorrido de 5-6 pantallas (Inicio → Lección → Trazado → Ejercicio →
  Tutor IA → Repasos) para la página "Prototipo", hoy vacía en Figma.
- Texto §5.4.4 (600-800 palabras) + pies de figura APA para las 4 figuras seleccionadas (EST-V02
  trazado, EST-V04 Tutor IA, EST-V05 Repasos, DOC-V04 Rendimiento del Grupo) + párrafo de
  trazabilidad EST-V03 ↔ Ejercicio 1 de sesión 2.

## 5. Sobre el Figma — inventario y pendientes

Ver detalle completo en `CONTEXTO_STIRE.md` §5. Resumen de acciones antes de exportar:

- **Privacidad — resuelto 2026-09-14.** DOC-V04 y DOC-V05 mostraban nombres con correos
  institucionales reales-verosímiles («Carlos Ruiz — carlos.ruiz@unicor.edu.co»); al fichar el
  entregable 04 se encontró el mismo patrón, sin correo, también en DOC-V06 (más «Prof. Roberto
  Toscano (Coordinación)», apellido igual al del director de esta investigación). Los cinco casos
  se sustituyeron por «Estudiante 01» / «Estudiante 02» / «Coordinación Académica», y se añadió
  «Datos simulados con fines ilustrativos.» en el pie de las tres pantallas.
- **Corrección (verificado 2026-09-14 por inspección directa del archivo vía la API de Figma):**
  la página "Prototipo" en sí está vacía, pero el archivo **ya tiene 139 interacciones de clic
  reales** conectando las pantallas — 43 en Estudiante (login/registro, navegación completa,
  modal del Tutor IA, trazado paso a paso) y 96 en Docente (menú lateral funcional entre las 6
  vistas, incluidos sus estados vacío/error, con botones de reintento). El prototipo interactivo
  ya existe y es navegable en modo Presentar directamente sobre esas pantallas. Lo que falta no es
  construir el flujo, sino documentarlo: una figura que muestre el recorrido pedagógicamente
  relevante (Inicio → Lección → Trazado → Ejercicio → Tutor IA → Repasos) con sus 6 características
  asociadas, sin duplicar ni alterar las pantallas reales, y sin perder de vista que existe mucha
  más interactividad además de ese recorrido.
- **Fuera de alcance:** las 9 vistas de administrador no corresponden a ninguna unidad de
  análisis de la investigación — mencionarlas solo en el catálogo del anexo, sin argumento en el
  cuerpo.
- **Rótulos permitidos:** "prototipo no funcional de media fidelidad", "propuesta de interfaz",
  "representación visual de la propuesta de diseño", "maqueta". **Prohibidos:** "el sistema
  desarrollado", "la implementación", "la plataforma", "el software", "capturas de la aplicación".

## 6. Orden de ejecución completo

| Paso | Qué hacer | Quién | Estado |
|---|---|---|---|
| 1 | Los 5 arreglos de estructura (§2 arriba) | Dueño del proyecto, en Word | Pendiente |
| 2 | Decidir la regla de intervalos (ya decidido: multiplicativa) | Dueño del proyecto | ✅ Hecho |
| 3 | Figma: reemplazar nombres/correos en DOC-V04 y DOC-V05 | IA — ✅ hecho 2026-09-14 (también encontrado y corregido en DOC-V06, no previsto originalmente; ver `S06c_PropuestaInterfaz_Catalogo.md` §1) | ✅ Hecho |
| 4 | Entregable 01 — matriz de trazabilidad (columnas 6-7 en blanco) | IA | ✅ Producido |
| 5 | Entregable 02 — modelo pedagógico | IA | ✅ Producido |
| 6 | Entregable 03 — arquitectura funcional; al terminar, volver a la matriz y llenar columna 7 | IA | ✅ Producido |
| 7 | Entregable 04 — catálogo de interfaz, flujo de navegación, trazabilidad | IA | ✅ Producido |
| 8 | Documentar en la página "Prototipo" el recorrido pedagógico relevante; exportar las 4 capturas | IA — ✅ hecho 2026-09-14 (recorrido en "🎓 Recorrido de investigación — STIRE"; capturas en `docs/investigacion/figuras/`) | ✅ Producido — ver nota de resolución nativa vs. 2× manual en `S06c_PropuestaInterfaz_Catalogo.md` §5 |
| 9 | Generar los gráficos de los 4 entregables, uno a la vez | IA | ✅ Producidos (01-03; el 04 usa capturas reales, no un gráfico generado) |
| 10 | Insertar todo en el informe, actualizar índices, verificar cada cifra contra su fuente | Dueño del proyecto | Pendiente |

**El paso 10 no es un trámite.** Todo lo que produzca una IA a partir de estos entregables debe
contrastarse contra la fuente original antes de entrar al informe definitivo — cada porcentaje
contra `SESIÓN 2.docx`, cada afirmación sobre plataformas contra la ficha comparativa de sesión 3,
cada referencia contra `MATRIZ_ARTICULOS_AMPLIADA.md`. Los marcadores `[CITA PENDIENTE]` y `[DATO
PENDIENTE]` deben buscarse y resolverse uno por uno antes de entregar.

## 6.2 Gráficos de los entregables 01-03, producidos en Figma (2026-09-14)

En una página nueva del mismo archivo de Figma, **"📊 Gráficos del informe"**, se construyeron los
cuatro gráficos especificados en el Producto 3 de los entregables 01, 02 y 03 (el 04 no tiene un
"Producto 3": sus figuras son capturas de pantallas reales, ya cubiertas en su propio documento):

1. **Gráfico 1 — Familias de características** (S05a): tres contenedores (Adaptación,
   Acompañamiento, Consolidación) con las dos CAR-0X de cada familia, sin flechas entre ellos, como
   pedía la especificación (nivel único de jerarquía, sin relación secuencial).
2. **Gráfico 2 — El ciclo de las tres etapas** (S05b, Gráfico A): tres etapas con flechas de avance
   en línea continua rotuladas con su criterio de salida, y dos flechas de retorno en línea
   discontinua ("dominio insuficiente en el repaso", "concepto olvidado de forma sustancial") — el
   trazo, no solo el color, distingue avance de retorno, como exige la restricción de legibilidad
   en escala de grises.
3. **Gráfico 3 — Progresión de intervalos de repaso** (S05b, Gráfico B): gráfico de líneas real
   (no una tabla disfrazada) con los valores exactos de la tabla del apartado 4 — bajo (factor
   1.3), medio (factor 1.8), alto (factor 2.5) — cada serie con un trazo distinto (sólido,
   discontinuo, punteado) además del color. Muestra visualmente lo que la especificación pedía que
   el lector concluyera en cinco segundos: las tres series parten juntas y se separan de forma
   creciente, con el nivel alto llegando primero al tope de 60 días.
4. **Gráfico 4 — Componentes y flujo** (S06b, Gráfico A): los cuatro componentes más la interfaz de
   usuario como quinto elemento, con las flechas exactamente rotuladas según la especificación
   ("registro de interacción", "decisión pedagógica", "actualización de estado" / "historial de
   dominio" entre Procesamiento y Seguimiento, y el ciclo Interfaz↔Entrada/Generación) — sin ningún
   icono de infraestructura, cumpliendo el límite funcional-no-técnico.

5. **Gráfico B — Diagrama de secuencia de un intento de ejercicio** (S06b, Gráfico B, opcional —
   producido 2026-09-14 a pedido explícito del dueño del proyecto): seis participantes en orden
   (Estudiante, Interfaz, Entrada de información, Procesamiento y adaptación, Seguimiento del
   aprendizaje, Generación de respuestas) con líneas de vida y los mensajes numerados exactamente
   como los especificó el entregable — el paso 6 original ("Generación de respuestas → Interfaz →
   Estudiante") se dibujó como dos mensajes consecutivos (6 y 7), notación estándar para un
   mensaje que pasa por un intermediario. **Sigue pendiente solo la decisión** (no la
   construcción) de si este gráfico entra al cuerpo del informe o queda como evidencia del
   entregable — recomendación registrada: dejarlo fuera, porque el Gráfico A ya cubre el flujo
   principal.

**Incorporados a los Google Docs — resuelto 2026-09-14.** Los cuatro gráficos ya no viven solo
como archivo de imagen: se embebieron directamente en el Google Doc de su entregable
correspondiente (Gráfico 1 → Doc del entregable 01; Gráficos A y B de S05b → Doc del entregable
02; Gráfico A de S06b → Doc del entregable 03) — ver los enlaces actualizados en §7. Cada Doc se
republicó (mismo procedimiento de siempre: el conector no permite editar un Doc ya creado) e
incluye ahora la imagen junto a su pie de figura en el lugar donde el texto la anuncia.

**Exportación — resuelta 2026-09-14.** Los cuatro gráficos, más las cuatro figuras seleccionadas
del entregable 04, ya se capturaron como PNG y quedaron guardados en `docs/investigacion/figuras/`
(ver tabla completa en `S06c_PropuestaInterfaz_Catalogo.md` §5). Son el render nativo de Figma vía
la API del conector (1x real, no un multiplicador de exportación) — nítido para insertar en Word a
tamaño de página normal; si al maquetar una figura concreta se ve borrosa a su tamaño final, ese es
el único caso en que valdría repetir la exportación manual a 2× desde la interfaz de Figma
(`Exportar → PNG, 2x`) sobre ese marco puntual.

| Archivo | Contenido |
|---|---|
| `S05a_grafico1_familias.png` | Gráfico 1 — familias de características |
| `S05b_grafico2_ciclo.png` | Gráfico 2 — ciclo de las tres etapas |
| `S05b_grafico3_progresion.png` | Gráfico 3 — progresión de intervalos de repaso |
| `S06b_grafico4_componentes.png` | Gráfico 4 — componentes y flujo |
| `S06b_grafico5_secuencia.png` | Gráfico B (opcional) — diagrama de secuencia de un intento de ejercicio |
| `S06c_fig1_EST-V02_trazado.png` | Figura 1 del entregable 04 — trazado paso a paso |
| `S06c_fig2_EST-V04_tutorIA.png` | Figura 2 del entregable 04 — Tutor IA |
| `S06c_fig3_EST-V05_repasos.png` | Figura 3 del entregable 04 — Repasos |
| `S06c_fig4_DOC-V04_rendimiento.png` | Figura 4 del entregable 04 — Rendimiento del Grupo (con la corrección de privacidad ya aplicada) |

## 6.1 Página de documentación en Figma (construida 2026-09-14, no es un entregable numerado)

En la página **"🔗 Prototipo"** del archivo de Figma (antes vacía) se construyó una página de
documentación — nombrada sin referencia a "entregables" internos, para que sea legible por
cualquiera que abra el archivo sin contexto previo. Contiene, en este orden, sin tocar ninguna
pantalla original:

1. **Recorrido pedagógico** (Inicio → Lección → Trazado → Ejercicio → Tutor IA, más la entrada de
   Repasos), con cajas que referencian el nodo real de cada pantalla, su CAR-0X y su etapa del
   modelo (S05b).
2. **Rutas de retorno**, documentando que el modelo no es lineal (retorno del modal del Tutor IA a
   Ejercicio, y de un ítem de Repasos a Ejercicio).
3. **Nota de alcance**, dejando explícito que existen 139 interacciones de clic más en el archivo
   (43 en Estudiante, 96 en Docente) que no se muestran ahí por no corresponder a una etapa o
   característica específica — para que quien mire la página no piense que eso es "todo" lo
   interactivo que hay.
4. **Galería de características**, con **copias reescaladas de 5 pantallas reales** (Inicio,
   Ejercicio, Tutor IA, Repasos, Mi Progreso — los originales no se tocaron), cada una etiquetada
   con su CAR-0X y una justificación de una línea. Cubre las 6 características (Inicio materializa
   CAR-01 y CAR-06 a la vez).

**Sobre MODESEC (`docs/modesec/`):** se investigó si las competencias de Fase I de MODESEC
(`fase1/2.4_SISTEMA_COMPETENCIAS.md`) podían unirse a las características CAR-0X. **No son el
mismo eje** — esas competencias son del plan de curso oficial de la asignatura de Diseño y
Desarrollo de Software (`FDOC-088`), y describen lo que debe dominar el equipo que **construye**
STIRE-Soft (HTML5/CSS/JS, creación de OVA/REDA), no lo que necesita el estudiante de Fundamentos de
Algoritmia que es la población de esta investigación. No se mezclan en el informe.

Sí se confirmó una coincidencia real y aprovechable: `docs/modesec/ventanas/3.3.1_FICHAS_VENTANAS.md`
justifica sus propias decisiones de pantalla con **la misma bibliografía** ya verificada en
`MATRIZ_ARTICULOS_AMPLIADA.md` (VanLehn 2011, Koedinger y Aleven 2007, Hattie y Timperley 2007,
Sorva 2013) — dos procesos de diseño independientes (el curso de software y esta investigación)
llegaron a las mismas decisiones con la misma literatura. Se decidió no forzar esa mención en el
cuerpo del informe por ahora (para no arriesgar el deslinde de alcance con contenido de otro curso
que sí referencia endpoints reales y estado de implementación); queda registrada aquí como hallazgo
disponible si se decide usarla más adelante, con cuidado de no nombrar "MODESEC" ni citar ningún
endpoint en el cuerpo del informe.

Los PNG de `docs/modesec/assets/png/` (recreaciones en SVG de las mismas pantallas) **no se usaron**:
son una reconstrucción hecha antes de tener acceso en vivo a Figma. Ahora que sí hay acceso real,
las capturas del archivo de Figma son la fuente más fiel.

**Sobre citar el archivo de Figma en el informe:** las reglas de redacción (`CONTEXTO_STIRE.md`
§6) prohíben hipervínculos en el cuerpo del texto. La forma correcta en APA 7.ª ed. es una entrada
en el capítulo de Referencias — por ejemplo: `STIRE (2026). STIRE Soft — Sistema Visual [Archivo de
diseño]. Figma. https://www.figma.com/design/1MjKiDrjU65ezO3ztO0v4m/STIRE-Soft-%E2%80%94-Sistema-Visual?m=auto&t=sehRLC79tLkTXYx3-1` — citada en el cuerpo como
"(ver Figura N, elaborada en el archivo de diseño del proyecto)", sin el enlace inline. El enlace
completo también puede ir en el Anexo que reúna el catálogo completo de pantallas (ya previsto para
el entregable 04).

---

## 7. Documentos legibles (Google Docs) y cómo insertarlos en el informe

Los borradores en Markdown de este repositorio son la fuente de trabajo, pero no son legibles
"normalmente" para pegar en un documento de Word. Por eso, cada entregable producido también se
sube como Google Doc real (con tablas y encabezados de verdad) a la misma carpeta de Drive que
`Análisis y diseño actual.docx`:

- **Entregable 01** (actualizado 2026-09-14, matriz completa con 7 columnas + Gráfico 1 embebido):
  https://docs.google.com/document/d/1nOpceXZHsO-xFxJOapTU-9B78Hd3Qh5kW17AjCGwe9E/edit
- **Entregable 02** (actualizado 2026-09-14, Gráficos A y B embebidos, texto ampliado a ≈1010 palabras):
  https://docs.google.com/document/d/1kcyjU9BjkEoLBaKZehBn86fHM9fVgFVAko8bMUhqtfc/edit
- **Entregable 03** (actualizado 2026-09-14, Gráficos A y B embebidos, texto ampliado a ≈870
  palabras): https://docs.google.com/document/d/1Wu56sMScdB67JzVSd6Y89p55c3ABXRIsktD7w-adsUU/edit
- **Entregable 04** (actualizado 2026-09-14, trazabilidad EST-V03 ↔ Ejercicio 1 verificada y
  resuelta):
  https://docs.google.com/document/d/1aTuyUiuH56t0SuH97NL9OTSOrioprdp1QUihlt24pjU/edit

**Nota técnica:** el conector de Drive disponible no permite editar el contenido de un Google Doc
ya creado — solo leerlo o crear uno nuevo. Por eso, cada vez que una actualización posterior
cambia un entregable ya publicado (como ocurrió con el 01 al completarse su columna 7), el
documento viejo se mueve a la papelera y se publica uno nuevo con el mismo título; el enlace
cambia y se actualiza en este archivo y en el `.md` correspondiente. Usa siempre el enlace más
reciente listado aquí, no uno guardado de una respuesta anterior.

**Por qué no los inserté directamente en `Análisis y diseño actual.docx`:** el conector de Drive
disponible solo permite leer ese archivo como texto plano o reemplazarlo completo — no puede
insertar contenido en un punto exacto del documento ni tocar sus estilos de encabezado/TOC sin
arriesgar el resto del formato (ver §2 arriba). La inserción manual, punto por punto, es más
segura.

**Qué copiar de cada documento y dónde pegarlo (usando Ctrl+F en el informe para ubicar el ancla):**

| De dónde (Google Doc) | Qué copiar | Dónde pegarlo en `Análisis y diseño actual.docx` |
|---|---|---|
| Entregable 01, "Producto 2 → Párrafo de presentación" | El párrafo completo | Al final del §5.4.1 actual, después de "...que servirán como base para la construcción del modelo pedagógico y de la arquitectura funcional presentada en los apartados siguientes." (última frase del 5.4.1 nuevo/vigente) |
| Entregable 01, "Producto 1 → tabla" | La tabla completa (7 columnas) | Inmediatamente después del párrafo anterior, dentro de §5.4.1 |
| Entregable 01, "Producto 2 → Párrafo de cierre" | El párrafo completo | Inmediatamente después de la tabla |
| Entregable 01, "Producto 3" | Solo como referencia para producir el gráfico más adelante (paso 9 del orden de ejecución) — el texto de la especificación **no** se pega en el informe | — |
| Entregable 02, "Producto 2 → texto completo" | Todo el texto (ya ampliado a ≈1010 palabras) | **Reemplaza** el contenido actual del §5.4.2 vigente (el que empieza "5.4.2 Modelo pedagógico preliminar propuesto" en el documento real, sin encabezado — aplicar el arreglo 2 de §2 al pegar) |
| Entregable 02, "Producto 1, apartado 3 → tabla de las tres etapas" | La tabla | Dentro del nuevo §5.4.2, donde el texto mencione las tres etapas con su criterio de salida |
| Entregable 02, "Producto 1, apartado 4 → tabla de progresión" | La tabla de 4 columnas × 6 filas | Dentro del nuevo §5.4.2, donde el texto anuncie "la tabla de progresión... presentadas a continuación" |
| Entregable 02, "Producto 3" | Solo como especificación para el gráfico (paso 9) — no se pega como texto | — |
| Entregable 03, "Producto 2 → texto completo" | Todo el texto (ya ampliado a ≈870 palabras) | **Reemplaza** el contenido actual del §5.4.3 vigente ("5.4.3 Arquitectura funcional preliminar propuesta" en el documento real) |
| Entregable 03, "Producto 1, apartados 3 y 4 → tablas de entradas y salidas" | Ambas tablas | Dentro del nuevo §5.4.3 |
| Entregable 03, "Producto 1, apartado 7 → tabla de correspondencia" | La tabla característica → componente | Dentro del nuevo §5.4.3, o al final del §5.4.1 (elegir un solo lugar y remitir al otro, como indica el propio entregable) |
| Entregable 03, "Producto 3" | Solo como especificación para los gráficos (paso 9) — no se pega como texto | — |
| Entregable 04, "Producto 1, apartado 2 → tabla de fichas" | La tabla de las 12 vistas | En un nuevo §5.4.4, o al anexo si se decide no llevar la tabla completa al cuerpo (ver pendiente de ese entregable) |
| Entregable 04, "Producto 2 → texto completo" | Todo el texto | Nuevo §5.4.4, después de crear el encabezado (no existe hoy) |
| Entregable 04, "Producto 2 → pies de figura y párrafo de trazabilidad" | Los 4 pies de figura y el párrafo EST-V03 ↔ Ejercicio 1 (trazabilidad ya verificada contra `Sesion2 recurso ejercicios.docx`) | Junto a cada figura insertada, y al final del nuevo §5.4.4 respectivamente — resolver antes solo los marcadores `[N]` (numeración de figuras) |

**Hallazgo adicional, sin auditar a fondo (fuera del alcance de esta sesión):** el capítulo 7
"Referencias" de `Análisis y diseño actual.docx` usa una bibliografía completamente distinta de
`MATRIZ_ARTICULOS_AMPLIADA.md` (Rodríguez et al. 2023, Vargas 2024, Bailera et al. 2022,
Carreño-Ruiz y Cedeño 2023, Estévez et al. 2024, González-González et al. 2023, UPTC 2024, además
de Creswell y Poth 2018, Hevner et al. 2004 y Peffers et al. 2007) — ninguna de esas 10 referencias
se ha verificado todavía contra Crossref/ERIC/OpenLibrary con el mismo criterio que sí se aplicó a
`MATRIZ_ARTICULOS_AMPLIADA.md`. Dado el historial ya documentado de citas fabricadas en este mismo
proyecto (`INFORME_SANEAMIENTO_BIBLIOGRAFICO.md`), esto merecería una verificación en una sesión
aparte antes de la sustentación — no se hizo aquí por no ser lo pedido en esta sesión.

**Referencias nuevas a agregar al capítulo 7** (formato APA 7.ª ed., orden alfabético — todas ya
verificadas contra Crossref, ver `MATRIZ_ARTICULOS_AMPLIADA.md`):

```
Becker, B. A. et al. (2019). Compiler error messages considered unhelpful. Proc. ITiCSE-WGR '19, 177-210. https://doi.org/10.1145/3344429.3372508

Bloom, B. S. (1968). Learning for mastery. Evaluation Comment, 1(2). https://eric.ed.gov/?id=ED053419

Bloom, B. S. (1984). The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring. Educational Researcher, 13(6), 4-16. https://doi.org/10.3102/0013189X013006004

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354-380. https://doi.org/10.1037/0033-2909.132.3.354

Hattie, J., & Timperley, H. (2007). The power of feedback. Review of Educational Research, 77(1), 81-112. https://doi.org/10.3102/003465430298487

Koedinger, K. R., & Aleven, V. (2007). Exploring the assistance dilemma in experiments with cognitive tutors. Educational Psychology Review, 19(3), 239-264. https://doi.org/10.1007/s10648-007-9049-0

Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. Psychological Science, 17(3), 249-255. https://doi.org/10.1111/j.1467-9280.2006.01693.x

Sorva, J. (2013). Notional machines and introductory programming education. ACM Transactions on Computing Education, 13(2), 1-31. https://doi.org/10.1145/2483710.2483713

VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. Educational Psychologist, 46(4), 197-221. https://doi.org/10.1080/00461520.2011.611369

Verbert, K., Duval, E., Klerkx, J., Govaerts, S., & Santos, J. L. (2013). Learning analytics dashboard applications. American Behavioral Scientist, 57(10), 1500-1509. https://doi.org/10.1177/0002764213479363

Woźniak, P., & Gorzelańczyk, E. (1994). Optimization of repetition spacing in the practice of learning. Acta Neurobiologiae Experimentalis, 54(1), 59-62. https://doi.org/10.55782/ane-1994-1003

Zimmerman, B. J. (2002). Becoming a self-regulated learner: An overview. Theory Into Practice, 41(2), 64-70. https://doi.org/10.1207/s15430421tip4102_2
```

Solo agregar las que efectivamente queden citadas en el texto final tras pegar (regla APA: toda
referencia listada debe citarse en el cuerpo, y viceversa).

## 8. Fuente de esta guía

Asesoría metodológica externa recibida como artefacto el 14 de septiembre de 2026 (rev. 2), a
partir de la versión del informe del 13 de septiembre, los instrumentos de las sesiones 4-6, la
ficha comparativa de sesión 3, el análisis del test diagnóstico y la lectura directa del archivo
de Figma. Segunda revisión: el inventario del Figma fue rehecho tras verificar el archivo por
consulta programática (la primera versión de la guía reportaba 2 páginas y 18 marcos porque el
listado automático de páginas del conector solo devolvía una de las siete existentes).
