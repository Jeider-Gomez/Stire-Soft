<template>
  <!-- Guía paso a paso para conseguir la clave gratuita de Google AI Studio, dentro de STIRE (ítem 7). La usan el Tutor
       del estudiante y el Asistente del docente; el formulario para pegarla lo pone cada uno debajo. -->
  <div class="space-y-3">
    <ol class="space-y-2.5">
      <li v-for="(p, i) in PASOS" :key="i" class="flex gap-2.5">
        <span class="shrink-0 w-6 h-6 rounded-full bg-acento-ambar/15 text-acento-ambar-fuerte text-[11px] font-bold flex items-center justify-center" aria-hidden="true">{{ i + 1 }}</span>
        <div class="min-w-0 text-xs text-base-texto-primario leading-relaxed">
          <p class="font-semibold">{{ p.titulo }}</p>
          <p class="text-[11px] text-base-texto-secundario">{{ p.detalle }}</p>
          <a v-if="i === 0" :href="ENLACE_AI_STUDIO" target="_blank" rel="noopener noreferrer"
            class="mt-1.5 min-h-[36px] inline-flex items-center gap-1.5 px-3 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-[11px] hover:bg-acento-ambar">
            <ExternalLink :size="13" aria-hidden="true" /> Abrir Google AI Studio <span class="sr-only">(se abre en otra pestaña)</span>
          </a>
        </div>
      </li>
    </ol>
    <p class="text-[11px] text-base-texto-secundario">Es gratis y no pide tarjeta. Tiene un límite por minuto y por día: si lo alcanzas, te avisamos.</p>
    <details class="text-[11px] rounded border border-base-borde-sutil px-2 py-1.5">
      <summary class="cursor-pointer min-h-[32px] flex items-center gap-1 font-semibold text-base-texto-primario">
        <CircleHelp :size="13" aria-hidden="true" /> ¿Algo no salió?
      </summary>
      <ul class="mt-1.5 space-y-1.5 text-base-texto-primario">
        <li v-for="(a, i) in AYUDAS" :key="i"><strong>{{ a.problema }}</strong> {{ a.solucion }}</li>
      </ul>
    </details>
  </div>
</template>

<script setup lang="ts">
import { CircleHelp, ExternalLink } from 'lucide-vue-next'
import { ENLACE_AI_STUDIO } from '~/utils/claveGoogle'

const PASOS = [
  { titulo: 'Abre Google AI Studio', detalle: 'Se abre en otra pestaña; esta queda aquí esperándote.' },
  { titulo: 'Entra con tu cuenta de Google', detalle: 'La primera vez Google te pide aceptar sus condiciones. Hay que tener 18 años o más.' },
  { titulo: 'Toca «Create API key» (Crear clave de API)', detalle: 'Si te pregunta por un proyecto, elige «Create API key in new project».' },
  { titulo: 'Copia la clave', detalle: 'Usa el botón de copiar de Google. Empieza por «AIza» y tiene unos 39 caracteres.' },
  { titulo: 'Vuelve aquí, pégala y toca «Guardar»', detalle: 'STIRE la comprueba con Google y la guarda cifrada: nadie más la ve.' },
] as const

const AYUDAS = [
  { problema: 'No me deja entrar con el correo de la universidad.', solucion: 'Algunas universidades bloquean AI Studio: usa una cuenta de Google personal.' },
  { problema: 'No veo «Create API key».', solucion: 'Busca «Get API key» en el menú de la izquierda, o abre el enlace de arriba otra vez.' },
  { problema: 'Dice que la clave no es válida.', solucion: 'Cópiala completa otra vez; si la borraste en Google, crea una nueva.' },
  { problema: 'Dice que alcancé el límite.', solucion: 'Es el límite gratuito del día o del minuto: espera un momento y vuelve a intentar.' },
] as const
</script>
