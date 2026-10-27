<template>
  <!-- Cuándo ve el estudiante esta explicación (explicaciones alternativas, 27/10): se cambia aquí mismo y se guarda. -->
  <label class="inline-flex items-center gap-1.5 text-[11px] text-base-texto-secundario">
    <span>La ve:</span>
    <select :value="actual" :disabled="guardando" class="min-h-[30px] rounded-md border border-base-borde-sutil bg-base-blanco px-1.5 text-[11px] font-semibold"
      :class="actual === 'siempre' ? 'text-base-texto-primario' : 'text-stire-blue'" :title="ayuda" :aria-label="`Cuándo la ve el estudiante: ${titulo}`" @change="cambiar">
      <option v-for="c in CUANDO_EXPLICACION" :key="c.valor" :value="c.valor">{{ c.texto }}</option>
    </select>
    <span v-if="error" role="alert" class="text-semantico-falla">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CUANDO_EXPLICACION, type CuandoExplicacion } from '~/utils/explicacionesAlternativas'
import { useCuandoExplicacion } from '~/composables/useCuandoExplicacion'

const props = defineProps<{ id: number; titulo: string; cuando?: string | null }>()
const emit = defineEmits<{ cambiado: [cuando: CuandoExplicacion] }>()
const { guardar } = useCuandoExplicacion()
const actual = ref<CuandoExplicacion>((props.cuando as CuandoExplicacion) || 'siempre')
watch(() => props.cuando, (c) => { actual.value = (c as CuandoExplicacion) || 'siempre' })
const ayuda = computed(() => CUANDO_EXPLICACION.find((c) => c.valor === actual.value)?.ayuda)
const guardando = ref(false)
const error = ref<string | null>(null)
async function cambiar(e: Event) {
  const nuevo = (e.target as HTMLSelectElement).value as CuandoExplicacion
  const antes = actual.value
  actual.value = nuevo
  guardando.value = true
  error.value = await guardar(props.id, nuevo)
  guardando.value = false
  if (error.value) actual.value = antes
  else emit('cambiado', nuevo)
}
</script>
