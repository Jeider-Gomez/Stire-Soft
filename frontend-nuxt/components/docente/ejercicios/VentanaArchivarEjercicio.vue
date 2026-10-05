<template>
  <!-- Confirmar antes de archivar un ejercicio. El foco empieza en «Cancelar» (lo seguro) y, si se cancela, vuelve a su
       botón «Archivar»; si se archiva, el panel lo lleva al título «Ejercicios» porque el botón ya no existe. -->
  <Teleport to="body">
    <AdminDialogo id-titulo="archive-exercise-title" titulo="¿Archivar este ejercicio?" :subtitulo="ejercicio.title" id-descripcion="archive-exercise-desc"
      clase-icono="bg-semantico-falla/10 text-semantico-falla" :devolver-foco="`archivar-ejercicio-${ejercicio.id}`" :ocupado="archivando" @cerrar="emit('cerrar')">
      <template #icono><Archive :size="18" aria-hidden="true" /></template>
      <p id="archive-exercise-desc" class="text-xs text-slate-700">Los estudiantes dejarán de verlo. Sus entregas anteriores se conservan.</p>
      <p v-if="error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>
      <div class="flex justify-end gap-2">
        <button type="button" data-foco-inicial class="btn-stire-secondary min-h-[44px]" :disabled="archivando" @click="emit('cerrar')">Cancelar</button>
        <button type="button" :disabled="archivando" class="min-h-[44px] px-5 py-2 rounded-lg bg-semantico-falla text-white text-xs font-bold disabled:opacity-50" @click="confirmar">
          {{ archivando ? 'Archivando…' : 'Sí, archivar' }}
        </button>
      </div>
    </AdminDialogo>
  </Teleport>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { Archive } from 'lucide-vue-next'
import { CLAVE_EJERCICIOS_UNIDAD } from '~/composables/useEjerciciosUnidad'
import type { EjercicioDeLaLeccion } from '~/utils/ejerciciosUnidad'

const props = defineProps<{ ejercicio: EjercicioDeLaLeccion }>()
const emit = defineEmits<{ cerrar: []; archivado: [] }>()
const estado = inject(CLAVE_EJERCICIOS_UNIDAD)
if (!estado) throw new Error('VentanaArchivarEjercicio necesita useEjerciciosUnidad() con provide(CLAVE_EJERCICIOS_UNIDAD).')

const archivando = ref(false)
const error = ref<string | null>(null)

async function confirmar() {
  archivando.value = true
  error.value = await estado!.archivar(props.ejercicio)
  archivando.value = false
  if (!error.value) emit('archivado')
}
</script>
