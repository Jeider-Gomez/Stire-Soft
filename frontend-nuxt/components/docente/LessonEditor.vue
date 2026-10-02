<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[60] bg-base-bg-secundario flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-editor-heading">
      <!-- Barra superior -->
      <header class="flex items-center justify-between gap-3 px-5 py-3 bg-base-blanco border-b border-base-borde-sutil">
        <div class="min-w-0">
          <p class="text-[11px] text-base-texto-secundario truncate">{{ unitTitle }}</p>
          <h2 id="lesson-editor-heading" class="text-sm font-bold text-base-texto-primario">
            {{ isEditing ? 'Editar lección' : 'Nueva lección' }}
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <p v-if="error" role="alert" class="text-[11px] text-semantico-falla max-w-xs">{{ error }}</p>
          <button type="button" @click="$emit('cancel')"
            class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario">
            Cancelar
          </button>
          <button type="button" :disabled="saving" @click="save"
            class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
            {{ saving ? 'Guardando…' : 'Guardar lección' }}
          </button>
        </div>
      </header>

      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2">
        <!-- Escritura -->
        <section class="flex flex-col min-h-0 p-5 gap-3 bg-base-blanco lg:border-r border-base-borde-sutil">
          <label for="lesson-title-input" class="sr-only">Título de la lección</label>
          <input
            id="lesson-title-input"
            ref="titleRef"
            v-model="title"
            type="text"
            placeholder="Título de la lección (ej.: ¿Qué es una variable?)"
            class="w-full text-lg font-bold text-base-texto-primario px-1 py-1 border-0 border-b border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none" />

          <div class="flex flex-wrap items-center gap-1" role="toolbar" aria-label="Formato del texto">
            <button v-for="t in TOOLS" :key="t.label" type="button" @click="apply(t.action)"
              class="p-1.5 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
              :title="t.label" :aria-label="t.label">
              <component :is="t.icon" :size="16" aria-hidden="true" />
            </button>
            <span class="mx-1 h-5 w-px bg-base-borde-sutil" aria-hidden="true"></span>
            <button type="button" @click="insertTemplate"
              class="px-2 py-1 rounded text-[11px] font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
              Usar plantilla de lección
            </button>
          </div>

          <!-- Imágenes, recursos y ejemplos en vivo DENTRO del texto, donde está el cursor. -->
          <div class="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Insertar en el texto">
            <span class="text-[11px] text-base-texto-secundario mr-1">Insertar aquí:</span>
            <button type="button" @click="abrirPanel('imagen')" :aria-expanded="panel === 'imagen'"
              class="px-2.5 py-1.5 rounded-md borde-afordancia text-[11px] font-semibold inline-flex items-center gap-1 hover:bg-base-bg-secundario">
              <ImagePlus :size="13" aria-hidden="true" /> Imagen
            </button>
            <button type="button" @click="abrirPanel('recurso')" :aria-expanded="panel === 'recurso'"
              class="px-2.5 py-1.5 rounded-md borde-afordancia text-[11px] font-semibold inline-flex items-center gap-1 hover:bg-base-bg-secundario">
              <Clapperboard :size="13" aria-hidden="true" /> Video o recurso
            </button>
            <button type="button" @click="insertarVivo"
              class="px-2.5 py-1.5 rounded-md borde-afordancia text-[11px] font-semibold inline-flex items-center gap-1 hover:bg-base-bg-secundario">
              <MonitorPlay :size="13" aria-hidden="true" /> Ejemplo en vivo (HTML, CSS y JS)
            </button>
          </div>

          <form v-if="panel === 'imagen'" @submit.prevent="insertarImagen" class="rounded-lg border border-base-borde-sutil bg-base-bg-secundario p-3 space-y-2 text-xs" aria-label="Insertar una imagen">
            <fieldset class="flex flex-wrap gap-x-4 gap-y-1">
              <legend class="sr-only">De dónde sale la imagen</legend>
              <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="img.origen" type="radio" value="subir" class="accent-acento-ambar-fuerte" /> Subir desde mi equipo</label>
              <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="img.origen" type="radio" value="enlace" class="accent-acento-ambar-fuerte" /> Enlace de la web</label>
            </fieldset>
            <input v-if="img.origen === 'subir'" type="file" accept="image/png,image/jpeg,image/gif,image/webp" aria-label="Imagen de tu equipo (hasta 1 MB)" @change="elegirImagen" class="block text-[11px]" />
            <input v-else v-model="img.url" type="url" placeholder="https://…/imagen.png" aria-label="Dirección de la imagen"
              class="w-full px-2 py-1.5 rounded border border-base-borde-fuerte bg-base-blanco" />
            <input v-model="img.alt" type="text" maxlength="300" placeholder="Qué muestra la imagen (para quien no puede verla)" aria-label="Descripción de la imagen"
              class="w-full px-2 py-1.5 rounded border border-base-borde-fuerte bg-base-blanco" />
            <input v-model="img.pie" type="text" maxlength="300" placeholder="Pie de la imagen (opcional)" aria-label="Pie de la imagen"
              class="w-full px-2 py-1.5 rounded border border-base-borde-fuerte bg-base-blanco" />
            <p v-if="panelError" role="alert" class="text-semantico-falla">{{ panelError }}</p>
            <div class="flex justify-end gap-2">
              <button type="button" @click="panel = null" class="px-3 py-1.5 rounded-md borde-afordancia font-semibold">Cancelar</button>
              <button type="submit" :disabled="insertando" class="px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold disabled:opacity-50">{{ insertando ? 'Subiendo…' : 'Insertar imagen' }}</button>
            </div>
          </form>

          <form v-if="panel === 'recurso'" @submit.prevent="insertarRecurso" class="rounded-lg border border-base-borde-sutil bg-base-bg-secundario p-3 space-y-2 text-xs" aria-label="Insertar un video o recurso">
            <input v-model="rec.titulo" type="text" maxlength="200" placeholder="Título (ej.: Video: qué es una variable)" aria-label="Título del recurso"
              class="w-full px-2 py-1.5 rounded border border-base-borde-fuerte bg-base-blanco" />
            <input v-model="rec.url" type="text" placeholder="Enlace de YouTube, Genially, Canva, Google Drive, Scratch, PhET…" aria-label="Enlace o código para insertar"
              class="w-full px-2 py-1.5 rounded border border-base-borde-fuerte bg-base-blanco" />
            <p v-if="panelError" role="alert" class="text-semantico-falla">{{ panelError }}</p>
            <div class="flex justify-end gap-2">
              <button type="button" @click="panel = null" class="px-3 py-1.5 rounded-md borde-afordancia font-semibold">Cancelar</button>
              <button type="submit" :disabled="insertando" class="px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold disabled:opacity-50">{{ insertando ? 'Revisando…' : 'Insertar' }}</button>
            </div>
          </form>

          <label for="lesson-body-input" class="sr-only">Contenido de la lección</label>
          <textarea
            id="lesson-body-input"
            ref="bodyRef"
            v-model="body"
            @keydown="onKeydown"
            placeholder="Explica la idea con tus palabras, pon un ejemplo en un bloque de código y cierra con algo para que el estudiante pruebe."
            class="flex-1 min-h-[16rem] w-full resize-none rounded-lg border border-base-borde-sutil p-3 font-mono text-[13px] leading-relaxed text-base-texto-primario focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
          <p class="text-[10px] text-base-texto-secundario">
            Atajos: Ctrl+B negrita · Ctrl+I cursiva · Ctrl+E código · Tab sangría en los bloques de código.
          </p>
        </section>

        <!-- Vista previa en vivo -->
        <section class="min-h-0 overflow-y-auto p-6" aria-label="Vista previa de la lección">
          <p class="text-[10px] font-bold uppercase tracking-wider text-base-texto-secundario mb-3">Así la verá el estudiante</p>
          <article class="max-w-2xl bg-base-blanco rounded-xl border border-base-borde-sutil p-6 space-y-3">
            <h3 class="text-base font-bold text-base-texto-primario">{{ title || 'Título de la lección' }}</h3>
            <ContenidoLeccion v-if="body.trim()" :texto="body" :insertados="insertados" borrador class="text-sm text-base-texto-primario" />
            <p v-else class="text-xs text-base-texto-secundario italic">La vista previa aparece mientras escribes.</p>
          </article>
        </section>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Heading2, Bold, Italic, Code, SquareCode, List, ListOrdered, ImagePlus, Clapperboard, MonitorPlay } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'
import { EJEMPLO_EN_VIVO, marcaDeImagen, marcaDeRecurso, type Insertados } from '~/utils/contenidoLeccion'

const props = defineProps<{
  unitTitle: string
  isEditing: boolean
  initialTitle: string
  initialBody: string
  initialInsertados?: Insertados | null
  saving: boolean
  error: string | null
}>()
const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'save', payload: { title: string; body: string }): void
}>()

type Action = 'h2' | 'bold' | 'italic' | 'code' | 'block' | 'list' | 'olist'
const TOOLS: Array<{ label: string; icon: unknown; action: Action }> = [
  { label: 'Subtítulo', icon: Heading2, action: 'h2' },
  { label: 'Negrita (Ctrl+B)', icon: Bold, action: 'bold' },
  { label: 'Cursiva (Ctrl+I)', icon: Italic, action: 'italic' },
  { label: 'Código en línea (Ctrl+E)', icon: Code, action: 'code' },
  { label: 'Bloque de código', icon: SquareCode, action: 'block' },
  { label: 'Lista', icon: List, action: 'list' },
  { label: 'Lista numerada', icon: ListOrdered, action: 'olist' }
]

// Estructura de una lección que funciona con principiantes: idea, ejemplo, error típico y algo para probar.
const TEMPLATE = `## La idea

Explica el concepto en dos o tres frases, con un ejemplo de la vida diaria.

## Un ejemplo

\`\`\`javascript
let edad = 18;
console.log(edad);
\`\`\`

Qué hace cada línea:

- \`let edad = 18;\` guarda el número 18 con el nombre \`edad\`.
- \`console.log(edad);\` lo muestra en pantalla.

## Error común

Qué suele salir mal la primera vez y cómo darse cuenta.

## Pruébalo

Una pregunta corta para que el estudiante piense antes de pasar a los ejercicios.
`

const title = ref(props.initialTitle)
const body = ref(props.initialBody)
const titleRef = ref<HTMLInputElement | null>(null)
const bodyRef = ref<HTMLTextAreaElement | null>(null)

// ─── Insertar en el texto (utils/contenidoLeccion.ts) ───
const api = useApi()
const { messageOf } = useApiErrorMessage()
// Cómo se ve cada recurso: lo que ya guardó el servidor más lo que se insertó ahora (vista previa del servidor).
const insertados = ref<Insertados>({ ...(props.initialInsertados ?? {}) })
const panel = ref<'imagen' | 'recurso' | null>(null)
const panelError = ref<string | null>(null)
const insertando = ref(false)
const img = reactive({ origen: 'subir' as 'subir' | 'enlace', archivo: null as File | null, url: '', alt: '', pie: '' })
const rec = reactive({ titulo: '', url: '' })

/** Al abrir un panel se recuerda dónde estaba el cursor: ahí va lo que se inserte. */
let cursor = 0
function abrirPanel(cual: 'imagen' | 'recurso') {
  panelError.value = null
  if (panel.value !== cual) cursor = bodyRef.value?.selectionStart ?? body.value.length
  panel.value = panel.value === cual ? null : cual
}

/** Pone un bloque en su propia línea, separado del texto de antes y de después. */
function insertarBloque(bloque: string) {
  const antes = body.value.slice(0, cursor)
  const despues = body.value.slice(cursor)
  const sep1 = antes === '' || antes.endsWith('\n\n') ? '' : antes.endsWith('\n') ? '\n' : '\n\n'
  const sep2 = despues.startsWith('\n') ? '\n' : '\n\n'
  body.value = antes + sep1 + bloque + sep2 + despues
  const fin = (antes + sep1 + bloque).length
  panel.value = null
  nextTick(() => { bodyRef.value?.focus(); bodyRef.value?.setSelectionRange(fin, fin) })
}

function elegirImagen(evento: Event) {
  const f = (evento.target as HTMLInputElement).files?.[0] ?? null
  panelError.value = f && f.size > 1024 * 1024 ? 'La imagen pesa más de 1 MB. Redúcela o usa un enlace de la web.' : null
  img.archivo = panelError.value ? null : f
}

async function insertarImagen() {
  panelError.value = null
  if (!img.alt.trim()) { panelError.value = 'Describe la imagen: la lee quien no puede verla.'; return }
  insertando.value = true
  try {
    let url = img.url.trim()
    if (img.origen === 'subir') {
      if (!img.archivo) { panelError.value = 'Elige una imagen de tu equipo.'; return }
      const datos = new FormData()
      datos.append('archivo', img.archivo)
      url = (await api.post<{ path: string }>('/media/images', datos)).path
    }
    if (!/^(https:\/\/|\/media\/)/.test(url)) { panelError.value = 'Pega la dirección completa de la imagen (empieza por https://).'; return }
    insertarBloque(marcaDeImagen(img.alt, url, img.pie))
    Object.assign(img, { archivo: null, url: '', alt: '', pie: '' })
  } catch (err) {
    panelError.value = messageOf(err, 'No se pudo subir la imagen.')
  } finally {
    insertando.value = false
  }
}

async function insertarRecurso() {
  panelError.value = null
  if (!rec.url.trim()) { panelError.value = 'Pega el enlace del video o del recurso.'; return }
  insertando.value = true
  try {
    // El servidor revisa el enlace con las mismas reglas que al guardar y dice cómo se insertará.
    const r = await api.post<{ url: string; proveedor: string; embedUrl: string | null }>('/content/recursos/vista-previa', { url: rec.url.trim() })
    insertados.value[r.url] = { url: r.url, provider: r.proveedor, embedUrl: r.embedUrl }
    insertarBloque(marcaDeRecurso(rec.titulo || 'Recurso', r.url))
    Object.assign(rec, { titulo: '', url: '' })
  } catch (err) {
    panelError.value = messageOf(err, 'No se pudo revisar ese enlace.')
  } finally {
    insertando.value = false
  }
}

function insertarVivo() {
  cursor = bodyRef.value?.selectionStart ?? body.value.length
  insertarBloque(EJEMPLO_EN_VIVO)
}

function replaceSelection(transform: (selected: string) => { text: string; cursorStart: number; cursorEnd: number }) {
  const el = bodyRef.value
  if (!el) return
  const { selectionStart: s, selectionEnd: e } = el
  const selected = body.value.slice(s, e)
  const out = transform(selected)
  body.value = body.value.slice(0, s) + out.text + body.value.slice(e)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(s + out.cursorStart, s + out.cursorEnd)
  })
}

function wrap(before: string, after: string, placeholder: string) {
  replaceSelection((sel) => {
    const inner = sel || placeholder
    return { text: before + inner + after, cursorStart: before.length, cursorEnd: before.length + inner.length }
  })
}

function prefixLines(prefix: (i: number) => string, placeholder: string) {
  replaceSelection((sel) => {
    const lines = (sel || placeholder).split('\n')
    const text = lines.map((l, i) => prefix(i) + l).join('\n')
    return { text, cursorStart: 0, cursorEnd: text.length }
  })
}

function apply(action: Action) {
  switch (action) {
    case 'h2': return prefixLines(() => '## ', 'Subtítulo')
    case 'bold': return wrap('**', '**', 'texto importante')
    case 'italic': return wrap('*', '*', 'texto')
    case 'code': return wrap('`', '`', 'codigo')
    case 'block': return wrap('\n```javascript\n', '\n```\n', '// tu ejemplo aquí')
    case 'list': return prefixLines(() => '- ', 'elemento')
    case 'olist': return prefixLines((i) => `${i + 1}. `, 'paso')
  }
}

function onKeydown(ev: KeyboardEvent) {
  if ((ev.ctrlKey || ev.metaKey) && ['b', 'i', 'e'].includes(ev.key.toLowerCase())) {
    ev.preventDefault()
    apply(({ b: 'bold', i: 'italic', e: 'code' } as const)[ev.key.toLowerCase() as 'b' | 'i' | 'e'])
    return
  }
  // Tab escribe una sangría (para los bloques de código) en lugar de salir del cuadro. Shift+Tab sigue saliendo.
  if (ev.key === 'Tab' && !ev.shiftKey) {
    ev.preventDefault()
    replaceSelection(() => ({ text: '  ', cursorStart: 2, cursorEnd: 2 }))
  }
}

function insertTemplate() {
  body.value = body.value.trim() ? `${body.value.trimEnd()}\n\n${TEMPLATE}` : TEMPLATE
  nextTick(() => bodyRef.value?.focus())
}

function save() {
  emit('save', { title: title.value.trim(), body: body.value.trim() })
}

onMounted(() => nextTick(() => (props.initialTitle ? bodyRef.value : titleRef.value)?.focus()))
</script>
