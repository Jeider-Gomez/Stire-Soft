<template>
  <!-- «Tu misión» (v3, Fase D, paso 3; cuadro «E-Ejercicio» v9): lo que pide el profe, y en programar, lo que recibe y lo
       que muestra el programa con el ejemplo, en dos cajas, para entenderlo antes de escribir una línea
       (utils/caminoEjercicio.ts: sale del ejemplo del docente; no se inventa nada). -->
  <section class="space-y-3" aria-labelledby="mision-titulo">
    <div class="flex flex-wrap items-center gap-2">
      <span class="pastilla-inicio pastilla-gris">{{ tipo }}</span>
      <span v-if="nivel" class="pastilla-inicio pastilla-cielo">{{ nombreNivel }}</span>
    </div>
    <h2 id="mision-titulo" class="sr-only">Tu misión</h2>
    <div class="prose prose-sm max-w-none text-base-texto-primario text-[15px] leading-relaxed" v-html="formatMarkdown(enunciado)"></div>

    <template v-if="mision">
      <div class="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <div class="caja-mision caja-recibe">
          <p class="m-0 text-xs font-bold">Recibes</p>
          <p v-if="mision.entra.length" class="m-0 font-codigo text-sm whitespace-pre-wrap break-words">{{ mision.entra.slice(0, 5).join('\n') }}</p>
          <p v-else class="m-0 text-sm">Nada: no lee datos</p>
        </div>
        <ArrowRight :size="16" class="self-center text-base-texto-secundario" aria-hidden="true" />
        <div class="caja-mision caja-muestra">
          <p class="m-0 text-xs font-bold">Muestras</p>
          <p class="m-0 font-codigo text-sm whitespace-pre-wrap break-words">{{ mision.sale.slice(0, 5).join('\n') }}</p>
        </div>
      </div>
      <!-- Si el profe ya escribió su ejemplo en el enunciado, la frase no lo repite. -->
      <p v-if="!/ejemplo/i.test(enunciado)" class="m-0 text-[13px] text-base-texto-secundario">{{ mision.frase }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { formatMarkdown } from '~/utils/formatMarkdown'
import { misionDelEjemplo } from '~/utils/caminoEjercicio'

const props = defineProps<{
  enunciado: string
  tipo: string
  nivel?: string
  ejemplo?: { input: string; expectedOutput: string } | null
}>()
const mision = computed(() => misionDelEjemplo(props.ejemplo))
const NIVELES: Record<string, string> = { basico: 'Básico', 'básico': 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }
const nombreNivel = computed(() => NIVELES[(props.nivel ?? '').toLowerCase()] ?? props.nivel)
</script>

<style scoped>
.caja-mision { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-radius: 12px; min-width: 0; }
.caja-recibe { background: rgb(var(--c-sec-cielo-fondo)); }
.caja-muestra { background: rgb(var(--c-sec-menta-fondo)); }
.pastilla-cielo { background: rgb(var(--c-sec-cielo-fondo)); color: rgb(var(--c-sec-cielo-icono)); }
</style>
