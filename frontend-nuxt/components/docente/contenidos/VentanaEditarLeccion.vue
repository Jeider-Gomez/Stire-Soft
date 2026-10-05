<template>
  <!-- Editar una lección: título, descripción, nivel, posición y, plegado, cómo ayuda el Tutor en ella (§20.1). -->
  <AdminDialogo id-titulo="editar-leccion-titulo" titulo="Editar la lección" :subtitulo="leccion.title" :ocupado="guardando" @cerrar="emit('cerrar')">
    <template #icono><Pencil :size="18" aria-hidden="true" /></template>
    <form class="space-y-4 text-xs" novalidate @submit.prevent="guardar">
      <div>
        <label for="unit-title" class="block font-semibold text-base-texto-primario mb-1">Título</label>
        <input id="unit-title" v-model="f.title" data-foco-inicial type="text" required maxlength="200"
          :aria-invalid="!!error" :aria-describedby="error ? 'editar-leccion-error' : undefined"
          class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
      </div>
      <div>
        <label for="unit-desc" class="block font-semibold text-base-texto-primario mb-1">Descripción <span class="font-normal text-slate-600">(la ve el estudiante bajo el título)</span></label>
        <textarea id="unit-desc" v-model="f.description" v-crece rows="3"
          class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario" />
      </div>
      <div class="flex flex-wrap gap-4">
        <div>
          <label for="unit-difficulty" class="block font-semibold text-base-texto-primario mb-1">Nivel</label>
          <select id="unit-difficulty" v-model="f.difficulty"
            class="min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none text-base-texto-primario">
            <option value="basico">Básico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
        <div>
          <label for="unit-order" class="block font-semibold text-base-texto-primario mb-1">Posición en el tema</label>
          <input id="unit-order" v-model.number="f.order" type="number" min="0"
            class="w-32 min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none text-base-texto-primario" />
        </div>
      </div>
      <details class="border-t border-base-borde-sutil pt-3">
        <summary class="min-h-[44px] inline-flex items-center text-[11px] font-semibold text-slate-700 cursor-pointer hover:text-base-texto-primario select-none">Cómo ayuda el Tutor en esta lección</summary>
        <div class="mt-3"><DocenteTutorSettingsPanel scope-type="unit" :scope-id="leccion.id" /></div>
      </details>
      <p v-if="error" id="editar-leccion-error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>
      <div class="flex items-center justify-end gap-2 pt-1">
        <button type="button" class="min-h-[44px] px-4 rounded-md borde-afordancia font-semibold" :disabled="guardando" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" :disabled="guardando" class="min-h-[44px] px-5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold hover:bg-acento-ambar disabled:opacity-50 inline-flex items-center gap-2">
          <Loader2 v-if="guardando" :size="14" class="animate-spin" aria-hidden="true" />
          {{ guardando ? 'Guardando…' : 'Guardar lección' }}
        </button>
      </div>
    </form>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { inject, reactive, ref } from 'vue'
import { Loader2, Pencil } from 'lucide-vue-next'
import { CLAVE_CONTENIDOS } from '~/composables/useContenidosCurso'
import type { LeccionDelArbol } from '~/utils/contenidosCurso'

const props = defineProps<{ leccion: LeccionDelArbol }>()
const emit = defineEmits<{ cerrar: [] }>()
const estado = inject(CLAVE_CONTENIDOS)
if (!estado) throw new Error('VentanaEditarLeccion necesita useContenidosCurso() con provide(CLAVE_CONTENIDOS).')

const f = reactive({ title: props.leccion.title, description: props.leccion.description ?? '', difficulty: props.leccion.difficulty || 'basico', order: props.leccion.order })
const guardando = ref(false)
const error = ref<string | null>(null)

async function guardar() {
  guardando.value = true
  error.value = await estado!.guardarLeccion(props.leccion.id, f)
  guardando.value = false
  if (!error.value) emit('cerrar')
}
</script>
