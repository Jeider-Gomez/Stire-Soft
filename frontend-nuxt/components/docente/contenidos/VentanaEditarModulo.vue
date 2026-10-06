<template>
  <!-- Editar un módulo: título, descripción y orden. Base común de ventanas (foco, Tab atrapado, Escape). -->
  <AdminDialogo
    id-titulo="editar-modulo-titulo"
    titulo="Editar módulo"
    :subtitulo="modulo.title"
    :devolver-foco="`mas-seccion-${modulo.id}`"
    :ocupado="guardando"
    @cerrar="emit('cerrar')"
  >
    <template #icono><Folder :size="18" aria-hidden="true" /></template>
    <form class="space-y-4 text-xs" novalidate @submit.prevent="guardar">
      <div>
        <label for="modulo-title" class="block font-semibold text-base-texto-primario mb-1">Título</label>
        <input
          id="modulo-title"
          v-model="f.title"
          data-foco-inicial
          type="text"
          required
          maxlength="200"
          :aria-invalid="!!error"
          :aria-describedby="error ? 'editar-modulo-error' : undefined"
          class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario"
        />
      </div>
      <div>
        <label for="modulo-desc" class="block font-semibold text-base-texto-primario mb-1">
          Descripción <span class="font-normal text-slate-600">(opcional)</span>
        </label>
        <textarea
          id="modulo-desc"
          v-model="f.description"
          v-crece
          rows="3"
          class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"
        />
      </div>
      <div>
        <label for="modulo-order" class="block font-semibold text-base-texto-primario mb-1">Posición del módulo</label>
        <input
          id="modulo-order"
          v-model.number="f.order"
          type="number"
          min="0"
          class="w-32 min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario"
        />
      </div>
      <p v-if="error" id="editar-modulo-error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>
      <div class="flex items-center justify-end gap-2 pt-1">
        <button type="button" class="min-h-[44px] px-4 rounded-md borde-afordancia font-semibold" :disabled="guardando" @click="emit('cerrar')">
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="guardando"
          class="min-h-[44px] px-5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold hover:bg-acento-ambar disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Loader2 v-if="guardando" :size="14" class="animate-spin" aria-hidden="true" />
          {{ guardando ? 'Guardando…' : 'Guardar módulo' }}
        </button>
      </div>
    </form>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { inject, reactive, ref } from 'vue'
import { Folder, Loader2 } from 'lucide-vue-next'
import { CLAVE_CONTENIDOS } from '~/composables/useContenidosCurso'
import type { ModuloDelArbol } from '~/utils/contenidosCurso'

const props = defineProps<{ modulo: ModuloDelArbol }>()
const emit = defineEmits<{ cerrar: [] }>()
const estado = inject(CLAVE_CONTENIDOS)
if (!estado) throw new Error('VentanaEditarModulo necesita useContenidosCurso() con provide(CLAVE_CONTENIDOS).')

const f = reactive({
  title: props.modulo.title,
  description: props.modulo.description ?? '',
  order: props.modulo.order,
})
const guardando = ref(false)
const error = ref<string | null>(null)

async function guardar() {
  guardando.value = true
  error.value = await estado!.guardarModulo(props.modulo.id, f)
  guardando.value = false
  if (!error.value) emit('cerrar')
}
</script>
