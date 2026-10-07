<template>
  <!-- Apariencia y lectura (utils/apariencia.ts, composables/useApariencia.ts): tema claro, oscuro o el del dispositivo;
       alto contraste; tamaño del texto y espaciado. Cada cambio se ve al instante y se recuerda en este navegador.
       Está en el perfil y, sin salir de la pantalla, en el botón «Apariencia» de la cabecera (07/10): como el bloque de
       accesibilidad de Moodle, a un clic desde cualquier página. Cada tema muestra una vista previa, como GitHub. -->
  <component :is="compacto ? 'div' : 'section'" :id="compacto ? undefined : 'apariencia'"
    :class="compacto ? 'space-y-4' : 'bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4 scroll-mt-20'"
    :aria-labelledby="compacto ? undefined : 'apariencia-titulo'">
    <div v-if="!compacto">
      <h2 id="apariencia-titulo" class="text-sm font-bold text-base-texto-primario inline-flex items-center gap-1.5">
        <Contrast :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> Apariencia y lectura
      </h2>
      <p class="text-[11px] text-base-texto-secundario">Se aplica al instante y se recuerda en este navegador. También está en el botón «Apariencia» de arriba.</p>
    </div>

    <fieldset class="space-y-2">
      <legend class="text-xs font-semibold text-base-texto-primario mb-1">Tema</legend>
      <div class="grid sm:grid-cols-3 gap-2">
        <label v-for="t in TEMAS" :key="t.valor" class="flex flex-col gap-2 rounded-md border-2 p-2 cursor-pointer text-xs has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-acento-ambar-fuerte"
          :class="a.tema === t.valor ? 'border-acento-ambar-fuerte' : 'border-base-borde-sutil'">
          <!-- Vista previa: una tarjeta en miniatura con los colores del tema (decorativa) -->
          <span class="flex h-14 rounded overflow-hidden border border-base-borde-fuerte" aria-hidden="true">
            <span v-for="(m, i) in MUESTRAS[t.valor]" :key="i" class="flex-1 p-1.5 space-y-1" :style="{ background: m.fondo }">
              <span class="block h-1.5 w-3/4 rounded-sm" :style="{ background: m.texto }" />
              <span class="block h-1.5 w-1/2 rounded-sm opacity-70" :style="{ background: m.texto }" />
              <span class="block h-2.5 w-1/3 rounded-sm mt-1.5" :style="{ background: m.boton }" />
            </span>
          </span>
          <span class="flex items-start gap-2 min-h-[44px]">
            <input :checked="a.tema === t.valor" type="radio" :name="`${prefijo}-tema`" :value="t.valor" class="mt-0.5 accent-acento-ambar-fuerte"
              @change="cambiar({ tema: t.valor })" />
            <span><span class="font-semibold text-base-texto-primario">{{ t.texto }}</span>
              <span class="block text-[11px] text-base-texto-secundario">{{ t.ayuda }}</span></span>
          </span>
        </label>
      </div>
    </fieldset>

    <fieldset class="space-y-2">
      <legend class="text-xs font-semibold text-base-texto-primario mb-1">Tamaño del texto</legend>
      <div class="flex flex-wrap gap-2">
        <label v-for="t in TAMANOS_TEXTO" :key="t.valor" class="cursor-pointer">
          <input :checked="a.texto === t.valor" type="radio" :name="`${prefijo}-texto`" :value="t.valor" class="peer sr-only"
            @change="cambiar({ texto: t.valor })" />
          <span class="inline-flex items-center min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario peer-checked:bg-acento-ambar-fuerte peer-checked:text-base-blanco peer-checked:border-acento-ambar-fuerte peer-focus-visible:ring-2 peer-focus-visible:ring-acento-ambar-fuerte/40">{{ t.texto }}</span>
        </label>
      </div>
    </fieldset>

    <div class="space-y-2 text-xs">
      <label class="flex items-start gap-2 min-h-[44px] cursor-pointer">
        <input :checked="a.altoContraste" type="checkbox" class="mt-0.5 accent-acento-ambar-fuerte" @change="cambiar({ altoContraste: !a.altoContraste })" />
        <span><span class="font-semibold text-base-texto-primario">Alto contraste</span>
          <span class="block text-[11px] text-base-texto-secundario">Texto más negro (o más blanco en el tema oscuro), bordes marcados, enlaces subrayados y un contorno grueso en lo que tiene el foco.</span></span>
      </label>
      <label class="flex items-start gap-2 min-h-[44px] cursor-pointer">
        <input :checked="a.espaciado" type="checkbox" class="mt-0.5 accent-acento-ambar-fuerte" @change="cambiar({ espaciado: !a.espaciado })" />
        <span><span class="font-semibold text-base-texto-primario">Más espacio entre líneas y letras</span>
          <span class="block text-[11px] text-base-texto-secundario">Ayuda a no perder el renglón al leer.</span></span>
      </label>
    </div>

    <button v-if="cambiada" type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" @click="restablecer">
      Volver a la apariencia de siempre
    </button>
  </component>
</template>

<script setup lang="ts">
import { Contrast } from 'lucide-vue-next'
import { TAMANOS_TEXTO, TEMAS, type Tema } from '~/utils/apariencia'

// compacto: dentro de la ventana de la cabecera, que ya pone su propio título.
const props = withDefaults(defineProps<{ compacto?: boolean }>(), { compacto: false })
const prefijo = props.compacto ? 'apariencia-rapida' : 'apariencia'

const { apariencia, cambiada, cambiar, restablecer } = useApariencia()
const a = apariencia

// Colores de las vistas previas: los del tema claro y el oscuro (assets/css/temas.css). «Como mi dispositivo», mitad y mitad.
const CLARO = { fondo: '#F7F9FC', texto: '#1E293B', boton: '#0B3D91' }
const OSCURO = { fondo: '#0B1220', texto: '#E6ECF5', boton: '#93C5FD' }
const MUESTRAS: Record<Tema, Array<typeof CLARO>> = { claro: [CLARO], oscuro: [OSCURO], sistema: [CLARO, OSCURO] }
</script>
