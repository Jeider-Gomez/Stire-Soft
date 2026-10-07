<template>
  <!-- Compartir el contenido (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3): con quién, y su enfoque en una línea -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3" aria-labelledby="compartir-titulo">
    <h2 id="compartir-titulo" class="text-sm font-bold text-base-texto-primario">Compartir el contenido</h2>
    <p class="text-[11px] text-base-texto-secundario">
      Otros docentes podrán copiar los módulos, explicaciones y ejercicios a sus propias clases. Reciben una copia: lo que
      cambien no toca tu clase, y tus estudiantes, entregas y notas nunca se comparten.
    </p>
    <div role="radiogroup" aria-labelledby="compartir-titulo" class="space-y-1.5">
      <label v-for="o in opcionesCompartir" :key="o.valor"
        class="flex items-start gap-2 min-h-[44px] rounded-lg border px-3 py-2"
        :class="o.motivoNoDisponible ? 'border-base-borde-sutil opacity-60 cursor-not-allowed' : alcanceElegido === o.valor ? 'border-acento-ambar-fuerte bg-acento-ambar/10 cursor-pointer' : 'border-base-borde-sutil hover:bg-base-bg-secundario cursor-pointer'">
        <input v-model="alcanceElegido" type="radio" name="alcance-plantilla" :value="o.valor" :disabled="!!o.motivoNoDisponible" class="mt-0.5" />
        <span class="text-xs">
          <span class="font-semibold text-base-texto-primario">{{ o.titulo }}</span>
          <span class="block text-[11px] text-slate-600">{{ o.motivoNoDisponible || o.ayuda }}</span>
        </span>
      </label>
    </div>
    <div v-if="alcanceElegido !== 'nadie'">
      <label for="enfoque-plantilla" class="block text-xs font-semibold text-base-texto-primario mb-1">
        Enfoque <span class="text-base-texto-secundario font-normal">(una línea: cómo la diferencias de otras de la misma asignatura)</span>
      </label>
      <input id="enfoque-plantilla" v-model="enfoqueElegido" type="text" maxlength="160" placeholder="Con JavaScript, según el plan de clase · Solo pseudocódigo, sin programar"
        class="w-full min-h-[44px] px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none" />
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <button type="button" :disabled="isSavingPlantilla || !cambioCompartir"
        class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-base-blanco disabled:opacity-50"
        @click="guardarCompartir">
        {{ isSavingPlantilla ? 'Guardando…' : 'Guardar' }}
      </button>
      <p v-if="avisoCompartir" role="status" class="text-xs" :class="avisoCompartir.error ? 'text-semantico-falla' : 'text-semantico-pasa'">{{ avisoCompartir.texto }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { opcionesDeAlcance, type AlcancePlantilla } from '~/utils/plantillas'
import type { EstadoAjustesClase } from '~/composables/useAjustesClase'

/** «Compartir el contenido» de Ajustes de la clase: las opciones dicen los nombres reales de su asignatura, programa, etc. */
const props = defineProps<{ ajustes: EstadoAjustesClase }>()
const { classInfo } = props.ajustes
const { messageOf } = useApiErrorMessage()

const isSavingPlantilla = ref(false)
const alcanceElegido = ref<AlcancePlantilla>('nadie')
const enfoqueElegido = ref('')
const avisoCompartir = ref<{ texto: string; error: boolean } | null>(null)
const opcionesCompartir = computed(() => opcionesDeAlcance(classInfo.value?.asignatura))
watch(classInfo, (c) => {
  alcanceElegido.value = c?.alcancePlantilla ?? (c?.compartidaComoPlantilla ? 'todos' : 'nadie')
  enfoqueElegido.value = c?.enfoque ?? ''
}, { immediate: true })
const cambioCompartir = computed(() => {
  const c = classInfo.value
  return !!c && (alcanceElegido.value !== (c.alcancePlantilla ?? 'nadie') || enfoqueElegido.value.trim() !== (c.enfoque ?? ''))
})

async function guardarCompartir() {
  if (!classInfo.value) return
  isSavingPlantilla.value = true
  avisoCompartir.value = null
  try {
    const titulo = opcionesCompartir.value.find((o) => o.valor === alcanceElegido.value)?.titulo ?? ''
    await props.ajustes.guardarCompartir({ alcancePlantilla: alcanceElegido.value, enfoque: enfoqueElegido.value.trim() || null }, titulo)
    avisoCompartir.value = { texto: alcanceElegido.value === 'nadie' ? 'Guardado: no se comparte.' : `Guardado: la ven ${titulo.charAt(0).toLowerCase()}${titulo.slice(1)}.`, error: false }
  } catch (err: unknown) {
    avisoCompartir.value = { texto: messageOf(err, 'No se pudo guardar.'), error: true }
  } finally {
    isSavingPlantilla.value = false
  }
}
</script>
