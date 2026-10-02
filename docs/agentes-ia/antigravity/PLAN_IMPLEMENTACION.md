---
estado:     completada — Fase 29 (2026-10-02)
verificado: 2026-10-02 contra src/ y frontend-nuxt/ reales
fuente:     normativo (insumo de arranque para Google Antigravity)
---

# Plan de implementación para Antigravity — Fase 29

**Este archivo solo dice qué hay que hacer.** Las Fases 1 a 28 están hechas y archivadas en
[`docs/_archivo/`](../../_archivo/). **No las leas para ejecutar esta fase.**

## 29. Fase 29 — el editor visual de diagramas de flujo

### 29.0 En una línea

El curso «Pensamiento algorítmico» enseña con diagramas de flujo (óvalo, paralelogramo, rectángulo, rombo). STIRE ya
**guarda y ejecuta** un diagrama (Claude Code lo dejó hecho: formato, validación, ejecución y backend). Falta lo
visual: **un editor donde el estudiante arrastra figuras, escribe dentro y las une con flechas**. Esta fase es ese
editor y conectarlo a Proyectos. **Solo `frontend-nuxt/`.**

### 29.1 Reglas

1. **No cambies el formato ni la lógica** de `frontend-nuxt/utils/diagramaFlujo.ts` (tipos, `leerDiagrama`,
   `traducirDiagrama`, `diagramaInicial`). El editor solo lee y escribe ese formato. Si crees que le falta algo, anótalo
   en el informe; no lo cambies.
2. **No edites `tailwind.config.ts` ni `assets/css/main.css`** (identidad visual). Usa las clases que ya existen.
3. **Iconos con `lucide-vue-next`**, nunca emojis.
4. **Sin dependencias nuevas** (nada de librerías de diagramas): SVG y eventos de puntero. Sin `any` ni `@ts-ignore`.
5. **Textos en español**, cortos y claros para alguien que empieza (es el curso «sin tanto código»).
6. **Accesible:** cada figura se puede elegir con el teclado (Tab), editar con Enter, mover con las flechas
   (10 px) y borrar con Supr. Botones de 44 px de alto como mínimo en celular. Nada se distingue solo por color.
7. **No inventes datos.** Si el archivo no se puede leer, se dice («El archivo del diagrama está dañado…», el mensaje
   que da `leerDiagrama`) y se ofrece «Empezar de nuevo» con `diagramaInicial()`; nunca se borra en silencio.
8. **Un commit por tarea**, en español, sin `--no-verify`. Rama `feat/fase-29`; se une a `main` con Pull Request.
9. **«Verificado» = probado en Chrome real** contra el backend (29.4). Antes de cada commit: `npx nuxi typecheck`
   (exit 0) y `npm run generate` (debe terminar sin error).

### 29.2 Contrato (ya existe; no lo cambies)

**Formato** — `frontend-nuxt/utils/diagramaFlujo.ts`:

```ts
export type TipoFigura = 'inicio' | 'fin' | 'entrada' | 'proceso' | 'decision' | 'salida'
export interface Figura {
  id: string            // /^[A-Za-z0-9_-]{1,40}$/, único en el diagrama
  tipo: TipoFigura
  texto: string         // hasta 200 caracteres; proceso: una instrucción por línea
  x: number; y: number  // posición en el lienzo, en px
  siguiente?: string | null   // flecha que sale (todas menos decision y fin)
  si?: string | null          // decision: flecha del «Sí»
  no?: string | null          // decision: flecha del «No»
}
export interface Diagrama { version: 1; figuras: Figura[] }
export const LIMITES_DIAGRAMA      // { figuras: 80, texto: 200, pasos: 100000 }
export const TIPO_FIGURA           // por tipo: { nombre, forma: 'ovalo'|'paralelogramo'|'rectangulo'|'rombo', ayuda }
export function diagramaInicial(): Diagrama          // Inicio → Entrada → Salida → Fin
export function leerDiagrama(json: string): { ok: true; diagrama: Diagrama } | { ok: false; mensaje: string }
export function traducirDiagrama(d: Diagrama): { ok: true; js: string } | { ok: false; error: { figura: number; figuraId: string | null; mensaje: string } }
```

`traducirDiagrama` ya **valida** todo lo que hay que avisar: falta Inicio o Fin, más de un Inicio, una flecha que
falta («A la Entrada 2 («nombre») le falta la flecha que sale.»), una instrucción que no se entiende. Devuelve el
`figuraId` para marcar la figura. Úsalo para avisar mientras el estudiante dibuja; no repitas esas reglas.

**Guardado** — un proyecto de tipo `'diagrama'` tiene **un archivo `diagrama.json`** con
`JSON.stringify(diagrama, null, 2)`. El backend lo acepta y lo valida (versión 1, hasta 80 figuras). El guardado
automático ya existe en `pages/estudiante/proyectos/[id].vue`: guarda `proyecto.archivos` al cambiar. Basta con
escribir el nuevo JSON en `archivos[i].contenido` del archivo `diagrama.json`.

**Ejecutar** — `components/proyectos/ResultadoProyecto.vue` ya ejecuta un diagrama (`tipo === 'diagrama'`): lee
`diagrama.json`, lo recorre figura por figura y muestra la salida o «Figura 3: …». No lo toques.

**Crear** — `utils/proyectoNavegador.ts` tiene `TIPOS_QUE_SE_CREAN` **sin** `'diagrama'`: mientras no haya editor, nadie
puede crear uno. Se agrega en T4.

### 29.3 Tareas

#### T1 — `components/proyectos/EditorDiagrama.vue`

Props: `modelValue: string` (el contenido de `diagrama.json`), `soloLectura?: boolean`. Emite
`update:modelValue` con el JSON nuevo. Internamente: `leerDiagrama(modelValue)` → estado → al cambiar,
`JSON.stringify(d, null, 2)`.

- **Lienzo SVG** con scroll propio (horizontal y vertical) y cuadrícula suave. Cada figura con su forma
  (`TIPO_FIGURA[tipo].forma`): óvalo, paralelogramo, rectángulo, rombo; el texto dentro, partido en líneas; tamaño
  que crece con el texto hasta un máximo razonable.
- **Paleta** arriba: un botón por tipo (con su forma en miniatura y su nombre). Al pulsarlo, la figura aparece en un
  lugar libre visible. «Inicio» solo se ofrece si no hay uno. Al llegar a 80 figuras, la paleta se desactiva y lo dice.
- **Mover**: arrastrar con mouse o dedo (`pointer events`, con `setPointerCapture`), y con las flechas del teclado.
- **Unir**: cada figura tiene un punto de salida (el rombo, dos: «Sí» y «No», con su texto). Se arrastra desde el
  punto hasta otra figura. También sin arrastrar: elegir la figura → botón «Unir con…» → tocar la de destino (así se
  puede en celular y con teclado). Una nueva flecha reemplaza la anterior de esa salida. Las flechas con punta y, en el
  rombo, la etiqueta «Sí» / «No» sobre la línea. Una flecha se quita eligiéndola y pulsando Supr o «Quitar flecha».
- **Editar el texto**: al elegir una figura se abre un panel (al lado en escritorio, debajo en celular) con su nombre,
  un campo de texto (varias líneas en «Proceso») y la ayuda `TIPO_FIGURA[tipo].ayuda`. Inicio y Fin no tienen texto.
- **Borrar** una figura: quita también las flechas que llegaban a ella.
- **Avisos en vivo**: tras cada cambio (con 400 ms de espera), `traducirDiagrama(d)`; si no está `ok`, mostrar el
  mensaje bajo el lienzo y marcar la figura `figuraId` con borde de error **e icono** (no solo color). Sin aviso
  cuando está bien.
- **`soloLectura`**: sin paleta, sin arrastrar, sin panel de edición; se puede hacer scroll y leer.
- **Ids nuevos**: `f1`, `f2`… el primero que no exista.

#### T2 — Conectarlo en `pages/estudiante/proyectos/[id].vue`

Cuando `proyecto.tipo === 'diagrama'`: en lugar de lo que hay dentro de la sección `<!-- Archivos y editor -->` (pestañas de archivos, «Agregar archivo» y `CodeEditor`),
`<ProyectosEditorDiagrama v-model="…contenido de diagrama.json…" />`. Sin «Agregar archivo». Si el archivo no se puede
leer: el mensaje de `leerDiagrama` y «Empezar de nuevo». El resultado (`ProyectosResultadoProyecto`) sigue igual, al
lado o debajo; «Ampliar» ya existe en él.

#### T3 — Verlo en la revisión del docente

En `pages/docente/entregas/revision/[envioId].vue`, si `envio.tipo === 'diagrama'`, mostrar
`<ProyectosEditorDiagrama :model-value="…" solo-lectura />` en lugar del `CodeEditor` de solo lectura.

#### T4 — Abrirlo a los estudiantes y a las entregas

- Agrega `'diagrama'` a `TIPOS_QUE_SE_CREAN` (`utils/proyectoNavegador.ts`). El icono ya está (`Workflow`).
- En `utils/entregas.ts`: `TipoEntrega` y `TIPO_ENTREGA` con `diagrama: 'Diagrama de flujo'`;
  `codigoInicialPorDefecto('diagrama')` → `[{ nombre: 'diagrama.json', contenido: JSON.stringify(diagramaInicial(), null, 2) }]`.
- En `components/docente/EntregaForm.vue`, el «Código inicial» de una entrega de diagrama usa `EditorDiagrama` en vez de
  `CodeEditor`.

#### T5 — Pruebas

`src/content-rendering/__tests__/editor-diagrama.frontend.spec.ts`, como los demás `*.frontend.spec.ts` (leen los
archivos reales de `frontend-nuxt`): que `[id].vue` y la revisión usan el editor para `'diagrama'`, que
`TIPOS_QUE_SE_CREAN` incluye `'diagrama'`, que el editor llama `traducirDiagrama` y respeta `soloLectura`, y que
`codigoInicialPorDefecto('diagrama')` devuelve un diagrama que `leerDiagrama` acepta.

### 29.4 Verificación (Chrome real, 1440 px y 375 px)

Con `luisa.rojas@example.com` / `Test123.` (estudiante) y `laura.martinez.docente@example.com` / `Test123.` (docente):

1. Crear un proyecto «Diagrama de flujo»: aparece Inicio → Entrada → Salida → Fin; «Ejecutar» con la entrada `Ana`
   escribe `Hola, Ana`.
2. Dibujar el algoritmo «Votar» del curso: Entrada `edad` → Decisión `edad >= 18` → Sí: Salida `"Puede votar"`, No:
   Salida `"Aún no"` → Fin. Con `20` escribe «Puede votar»; con `15`, «Aún no».
3. Quitar la flecha del «No»: aparece «A la Decisión … le falta la flecha del «No».» y la figura queda marcada.
4. Recargar la página: el diagrama sigue igual (se guardó).
5. A 375 px: se puede agregar, mover con el dedo, unir con «Unir con…» y editar el texto, sin scroll horizontal de la
   página (el lienzo sí tiene el suyo).
6. Solo con teclado: Tab hasta una figura, Enter edita, flechas mueven, Supr borra.
7. Entregarlo a una entrega de diagrama y abrirlo como docente: se ve en solo lectura y «Ejecutar» funciona.

### 29.5 Entrega

- `npm run build` y `npm test` en la raíz, y `npx nuxi typecheck` en `frontend-nuxt/`: todo en verde.
- Búsqueda final, debe dar **cero** resultados:
  `grep -rn "as any\|@ts-ignore" frontend-nuxt/components/proyectos/EditorDiagrama.vue`
- Informe en `docs/agentes-ia/antigravity/informes/INFORME_FASE_29.md` (plantilla `TEMPLATE_INFORME.md`), con las
  capturas de 29.4 y lo que no se pudo hacer.
