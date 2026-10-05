<template>
  <!-- Confirmar antes de archivar un tema: dice qué pasa con lo que contiene, en palabras y sin términos técnicos. -->
  <AdminDialogo id-titulo="archivar-tema-titulo" titulo="¿Archivar este tema?" :subtitulo="tema.title" id-descripcion="archivar-tema-desc"
    clase-icono="bg-semantico-falla/10 text-semantico-falla" :ocupado="archivando" @cerrar="emit('cerrar')">
    <template #icono><Archive :size="18" aria-hidden="true" /></template>
    <p id="archivar-tema-desc" class="text-xs text-slate-700">
      {{ lecciones === 0 ? 'Los estudiantes dejarán de ver este tema.' : lecciones === 1 ? 'Los estudiantes dejarán de ver su lección y sus ejercicios.' : `Los estudiantes dejarán de ver sus ${lecciones} lecciones y sus ejercicios.` }}
      No se borra nada: un administrador puede recuperarlo.
    </p>
    <p v-if="error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>
    <div class="flex items-center justify-end gap-2">
      <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" :disabled="archivando" @click="emit('cerrar')">Cancelar</button>
      <button type="button" :disabled="archivando" class="min-h-[44px] px-5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2" @click="archivar">
        <Loader2 v-if="archivando" :size="14" class="animate-spin" aria-hidden="true" />
        {{ archivando ? 'Archivando…' : 'Sí, archivar el tema' }}
      </button>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { Archive, Loader2 } from 'lucide-vue-next'
import { CLAVE_CONTENIDOS } from '~/composables/useContenidosCurso'
import type { TemaDelArbol } from '~/utils/contenidosCurso'

const props = defineProps<{ tema: TemaDelArbol }>()
const emit = defineEmits<{ cerrar: [] }>()
const estado = inject(CLAVE_CONTENIDOS)
if (!estado) throw new Error('VentanaArchivarTema necesita useContenidosCurso() con provide(CLAVE_CONTENIDOS).')

const lecciones = computed(() => props.tema.learningUnits?.length ?? 0)
const archivando = ref(false)
const error = ref<string | null>(null)

async function archivar() {
  archivando.value = true
  error.value = await estado!.archivarTema(props.tema)
  archivando.value = false
  if (!error.value) emit('cerrar')
}
</script>
