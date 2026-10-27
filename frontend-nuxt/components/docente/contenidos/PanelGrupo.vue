<template>
  <!-- Un módulo o un tema abierto a la derecha del árbol (prototipo del panel v2): su nombre y descripción se editan aquí
       mismo, sin ventana encima; debajo, cómo van sus lecciones y lo que se puede hacer con él. -->
  <section :aria-labelledby="`grupo-${nivel}-${grupo.id}`" class="space-y-5">
    <div class="space-y-1">
      <p class="text-[11px] text-base-texto-secundario">
        <button type="button" class="hover:underline" @click="$emit('volver')">Curso</button>
        <template v-if="modulo"> › {{ modulo }}</template>
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <h2 :id="`grupo-${nivel}-${grupo.id}`" class="text-lg font-bold text-base-texto-primario">
          <span class="sr-only">{{ nivel === 'modulo' ? 'Módulo' : 'Tema' }}: </span>{{ grupo.title }}
        </h2>
        <span v-if="nivel === 'modulo'" class="text-[11px] font-semibold rounded-full px-2 py-0.5"
          :class="publicado ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'border border-base-borde-sutil text-base-texto-secundario'">
          {{ publicado ? 'Publicado' : 'Sin publicar' }}
        </span>
      </div>
    </div>

    <form class="rounded-2xl border border-base-borde-sutil bg-base-blanco p-4 space-y-3 text-sm" novalidate @submit.prevent="guardar">
      <div>
        <label :for="`grupo-titulo-${grupo.id}`" class="block text-xs font-semibold text-base-texto-primario mb-1">Nombre</label>
        <input :id="`grupo-titulo-${grupo.id}`" v-model="f.title" type="text" maxlength="200" required
          class="w-full min-h-[40px] px-3 rounded-lg border border-base-borde-fuerte bg-base-blanco text-base-texto-primario focus:outline-none focus:ring-2 focus:ring-stire-blue/30" />
      </div>
      <div>
        <label :for="`grupo-desc-${grupo.id}`" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Descripción <span class="font-normal text-base-texto-secundario">(opcional; la ve el estudiante)</span>
        </label>
        <textarea :id="`grupo-desc-${grupo.id}`" v-model="f.description" rows="2"
          class="w-full px-3 py-2 rounded-lg border border-base-borde-fuerte bg-base-blanco text-base-texto-primario resize-y focus:outline-none focus:ring-2 focus:ring-stire-blue/30" />
      </div>
      <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
      <div class="flex items-center justify-end gap-2">
        <button v-if="cambiado" type="button" class="min-h-[36px] px-3 rounded-lg text-xs font-semibold text-base-texto-secundario hover:text-base-texto-primario" @click="deshacer">Deshacer</button>
        <button type="submit" :disabled="!cambiado || guardando" class="btn-stire-primary min-h-[36px] text-xs disabled:opacity-50">
          <Loader2 v-if="guardando" :size="13" class="animate-spin" aria-hidden="true" />{{ guardando ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>

    <!-- Lo que tiene, en orden (prototipo: «Temas, en orden» / «Lecciones, en orden»): se reordena aquí con las flechas o
         arrastrando, y un toque lo abre. -->
    <div class="space-y-2">
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 class="text-sm font-semibold text-base-texto-primario">{{ nivel === 'modulo' ? 'Temas, en orden' : 'Lecciones, en orden' }}</h3>
        <p class="text-[11px] text-base-texto-secundario">{{ conteo.lista }} de {{ conteo.total }} lecciones listas<template v-if="conteo.falta"> · a {{ conteo.falta }} les falta algo</template><template v-if="conteo.oculta"> · {{ conteo.oculta }} ocultas</template></p>
      </div>
      <TransitionGroup v-if="hijos.length" tag="ol" name="orden" class="divide-y divide-base-borde-sutil rounded-xl border border-base-borde-sutil bg-base-blanco">
        <li v-for="(h, i) in hijos" :key="h.id" draggable="true" class="flex items-center gap-1 pr-2"
          :class="{ 'opacity-40': tomado === i, 'cae-aqui': sobre === i && tomado !== null && tomado !== i }"
          @dragstart="tomado = i" @dragover.prevent="sobre = i" @drop.prevent="soltar(i)" @dragend="tomado = null; sobre = null">
          <GripVertical :size="14" class="shrink-0 ml-2 text-base-texto-secundario cursor-grab" aria-hidden="true" />
          <button type="button" class="flex-1 min-w-0 flex items-center gap-3 px-2 py-2.5 text-left rounded-lg hover:bg-base-bg-secundario/60" @click="$emit('abrir-hijo', h.id)">
            <span class="w-5 text-[11px] tabular-nums text-base-texto-secundario" aria-hidden="true">{{ i + 1 }}</span>
            <span class="w-2 h-2 rounded-full shrink-0" :class="h.punto" aria-hidden="true" />
            <span class="flex-1 min-w-0">
              <span class="block text-sm text-base-texto-primario truncate">{{ h.title }}</span>
              <span class="block text-[11px] text-base-texto-secundario truncate">{{ h.detalle }}</span>
            </span>
          </button>
          <button type="button" class="flecha" :disabled="i === 0" :aria-label="`Subir «${h.title}»`" title="Subir" @click="$emit('mover', i, i - 1)"><ArrowUp :size="14" aria-hidden="true" /></button>
          <button type="button" class="flecha" :disabled="i === hijos.length - 1" :aria-label="`Bajar «${h.title}»`" title="Bajar" @click="$emit('mover', i, i + 1)"><ArrowDown :size="14" aria-hidden="true" /></button>
        </li>
      </TransitionGroup>
      <p v-else class="text-sm text-base-texto-secundario rounded-xl border border-dashed border-base-borde-fuerte px-3.5 py-3">{{ nivel === 'modulo' ? 'Todavía no tiene temas.' : 'Todavía no tiene lecciones.' }}</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn-stire-secondary min-h-[40px] text-xs" @click="$emit('agregar')">
        <Plus :size="14" aria-hidden="true" /> {{ nivel === 'modulo' ? 'Agregar un tema' : 'Agregar una lección' }}
      </button>
      <button v-if="nivel === 'modulo'" type="button" class="btn-stire-secondary min-h-[40px] text-xs" @click="$emit('publicar')">
        <component :is="publicado ? EyeOff : Eye" :size="14" aria-hidden="true" /> {{ publicado ? 'Dejar de publicar' : 'Publicar para los estudiantes' }}
      </button>
      <button type="button" class="btn-stire-secondary min-h-[40px] text-xs" @click="$emit('archivar')">
        <Archive :size="14" aria-hidden="true" /> Ocultar (archivar)
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Archive, ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Loader2, Plus } from 'lucide-vue-next'
import { conteoDeLecciones, type LeccionConConteos } from '~/utils/estadoCurso'

const props = defineProps<{
  nivel: 'modulo' | 'tema'
  grupo: { id: number; title: string; description?: string }
  lecciones: LeccionConConteos[]
  /** Sus hijos en orden: los temas de un módulo o las lecciones de un tema (useGrupoDelCurso.ts los prepara). */
  hijos: Array<{ id: number; title: string; detalle: string; punto: string }>
  /** Para un tema, el nombre de su módulo (la ruta de arriba). */
  modulo?: string
  publicado?: boolean
  guardar: (d: { title: string; description: string }) => Promise<string | null>
}>()
const emit = defineEmits<{ volver: []; 'abrir-hijo': [id: number]; mover: [desde: number, hasta: number]; agregar: []; publicar: []; archivar: [] }>()

const conteo = computed(() => conteoDeLecciones(props.lecciones))
const tomado = ref<number | null>(null)
const sobre = ref<number | null>(null)
function soltar(i: number) {
  if (tomado.value !== null && tomado.value !== i) emit('mover', tomado.value, i)
  tomado.value = null
  sobre.value = null
}

const f = reactive({ title: '', description: '' })
const deshacer = () => Object.assign(f, { title: props.grupo.title, description: props.grupo.description ?? '' })
watch(() => [props.grupo.id, props.grupo.title, props.grupo.description], deshacer, { immediate: true })
const cambiado = computed(() => f.title.trim() !== props.grupo.title || f.description.trim() !== (props.grupo.description ?? ''))
const guardando = ref(false)
const error = ref<string | null>(null)
async function guardar() {
  guardando.value = true
  error.value = await props.guardar({ title: f.title, description: f.description })
  guardando.value = false
}
</script>

<style scoped>
.flecha { @apply w-8 h-8 shrink-0 grid place-items-center rounded-md text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-30 disabled:pointer-events-none; }
.cae-aqui { box-shadow: inset 0 2px 0 theme('colors.stire-blue'); }
.orden-move { transition: transform 0.22s cubic-bezier(0.2, 0, 0, 1); }
@media (prefers-reduced-motion: reduce) { .orden-move { transition: none; } }
</style>
