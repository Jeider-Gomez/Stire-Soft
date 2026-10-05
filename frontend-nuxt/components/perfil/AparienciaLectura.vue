<template>
  <!-- Apariencia y lectura (utils/apariencia.ts): tema claro, oscuro o el del dispositivo; alto contraste; tamaño del
       texto y espaciado. Cada cambio se ve al instante y se recuerda en este navegador, como en Canvas o GitHub. -->
  <section id="apariencia" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4 scroll-mt-20" aria-labelledby="apariencia-titulo">
    <div>
      <h2 id="apariencia-titulo" class="text-sm font-bold text-base-texto-primario inline-flex items-center gap-1.5">
        <Contrast :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> Apariencia y lectura
      </h2>
      <p class="text-[11px] text-base-texto-secundario">Se aplica al instante y se recuerda en este navegador.</p>
    </div>

    <fieldset class="space-y-2">
      <legend class="text-xs font-semibold text-base-texto-primario mb-1">Tema</legend>
      <div class="grid sm:grid-cols-3 gap-2">
        <label v-for="t in TEMAS" :key="t.valor" class="flex items-start gap-2 rounded-md border p-2.5 min-h-[44px] cursor-pointer text-xs"
          :class="a.tema === t.valor ? 'border-acento-ambar-fuerte bg-acento-ambar/5' : 'border-base-borde-sutil'">
          <input v-model="a.tema" type="radio" name="apariencia-tema" :value="t.valor" class="mt-0.5 accent-acento-ambar-fuerte" />
          <span><span class="font-semibold text-base-texto-primario">{{ t.texto }}</span>
            <span class="block text-[11px] text-slate-600">{{ t.ayuda }}</span></span>
        </label>
      </div>
    </fieldset>

    <fieldset class="space-y-2">
      <legend class="text-xs font-semibold text-base-texto-primario mb-1">Tamaño del texto</legend>
      <div class="flex flex-wrap gap-2">
        <label v-for="t in TAMANOS_TEXTO" :key="t.valor" class="cursor-pointer">
          <input v-model="a.texto" type="radio" name="apariencia-texto" :value="t.valor" class="peer sr-only" />
          <span class="inline-flex items-center min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario peer-checked:bg-acento-ambar-fuerte peer-checked:text-base-blanco peer-checked:border-acento-ambar-fuerte peer-focus-visible:ring-2 peer-focus-visible:ring-acento-ambar-fuerte/40">{{ t.texto }}</span>
        </label>
      </div>
    </fieldset>

    <div class="space-y-2 text-xs">
      <label class="flex items-start gap-2 min-h-[44px] cursor-pointer">
        <input v-model="a.altoContraste" type="checkbox" class="mt-0.5 accent-acento-ambar-fuerte" />
        <span><span class="font-semibold text-base-texto-primario">Alto contraste</span>
          <span class="block text-[11px] text-base-texto-secundario">Textos secundarios y bordes más marcados.</span></span>
      </label>
      <label class="flex items-start gap-2 min-h-[44px] cursor-pointer">
        <input v-model="a.espaciado" type="checkbox" class="mt-0.5 accent-acento-ambar-fuerte" />
        <span><span class="font-semibold text-base-texto-primario">Más espacio entre líneas y letras</span>
          <span class="block text-[11px] text-base-texto-secundario">Ayuda a no perder el renglón al leer.</span></span>
      </label>
    </div>

    <button v-if="cambiada" type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" @click="restablecer">
      Volver a la apariencia de siempre
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Contrast } from 'lucide-vue-next'
import { APARIENCIA_POR_DEFECTO, aplicarApariencia, CLAVE_APARIENCIA, leerApariencia, TAMANOS_TEXTO, TEMAS } from '~/utils/apariencia'

function leerGuardado(): string | null {
  try { return localStorage.getItem(CLAVE_APARIENCIA) } catch { return null }
}

const a = reactive(leerApariencia(leerGuardado()))
const cambiada = computed(() => JSON.stringify({ ...a }) !== JSON.stringify(APARIENCIA_POR_DEFECTO))

watch(a, () => {
  aplicarApariencia({ ...a })
  try { localStorage.setItem(CLAVE_APARIENCIA, JSON.stringify({ ...a })) } catch { /* sin almacenamiento: no se recuerda */ }
})

function restablecer() {
  Object.assign(a, APARIENCIA_POR_DEFECTO)
}
</script>
