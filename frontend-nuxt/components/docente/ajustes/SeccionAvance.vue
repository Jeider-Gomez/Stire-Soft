<template>
  <!-- Bloqueo suave por módulo (utils/bloqueoModulos.ts): opcional y configurable, como toda función del docente -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3" aria-labelledby="avance-titulo">
    <h2 id="avance-titulo" class="text-sm font-bold text-base-texto-primario">Avance entre módulos</h2>
    <form class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil" @submit.prevent="guardarAvance">
      <div class="space-y-1">
        <label for="dominio-avanzar" class="block text-xs font-semibold text-base-texto-primario">Dominio del módulo anterior para abrir el siguiente</label>
        <p id="dominio-avanzar-ayuda" class="text-[11px] text-slate-600 max-w-md">
          El estudiante ve cuánto le falta y lo que ya empezó nunca se le cierra. Con 0 % no hay bloqueo: puede abrir cualquier módulo.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <input id="dominio-avanzar" v-model.number="dominioAvanzar" type="number" inputmode="numeric" min="0" max="100" step="5" aria-describedby="dominio-avanzar-ayuda" class="w-20 min-h-[44px] px-2 rounded-md border border-base-borde-fuerte bg-base-blanco text-sm" />
        <span class="text-xs text-slate-600">%</span>
        <button type="submit" :disabled="guardandoAvance" class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-white disabled:opacity-40">
          {{ guardandoAvance ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </form>
    <p v-if="avisoAvance" role="status" class="text-[11px] font-semibold" :class="avisoAvance.error ? 'text-red-700' : 'text-semantico-pasa'">{{ avisoAvance.texto }}</p>

    <!-- Reglas del dominio (09/10, docs/DISENO_DOMINIO.md): el docente decide; STIRE solo garantiza que ninguna lección quede sin salida. -->
    <form class="space-y-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil" @submit.prevent="guardarReglas" aria-labelledby="reglas-dominio-titulo">
      <p id="reglas-dominio-titulo" class="text-xs font-semibold text-base-texto-primario">Cómo sube el dominio en tu clase</p>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="space-y-0.5">
          <label for="horas-reabrir" class="block text-xs text-base-texto-primario">Si un estudiante usa los intentos de un ejercicio, se le reabre uno a las</label>
          <p id="horas-reabrir-ayuda" class="text-[11px] text-slate-600 max-w-md">De 1 a 168 horas (una semana). Nunca se cierra para siempre: así toda lección puede llegar al 100 %. Los intentos de cada ejercicio los sigues fijando tú.</p>
        </div>
        <div class="flex items-center gap-2">
          <input id="horas-reabrir" v-model.number="horas" type="number" inputmode="numeric" min="1" max="168" aria-describedby="horas-reabrir-ayuda" class="w-20 min-h-[44px] px-2 rounded-md border border-base-borde-fuerte bg-base-blanco text-sm" />
          <span class="text-xs text-slate-600">horas</span>
        </div>
      </div>
      <label class="flex items-start gap-2 text-xs text-base-texto-primario cursor-pointer">
        <input v-model="niveles" type="checkbox" class="mt-0.5 w-4 h-4 accent-acento-ambar-fuerte" aria-describedby="niveles-ayuda" />
        <span>
          Los niveles altos pesan más en el dominio (intermedio 1,5 y avanzado 2)
          <span id="niveles-ayuda" class="block text-[11px] text-slate-600">El peso de cada ejercicio (práctica, examen…) se elige al crearlo; esto suma el nivel. El dominio de cada estudiante se ajusta en su próxima entrega de cada lección.</span>
        </span>
      </label>
      <button type="submit" :disabled="guardandoReglas" class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-white disabled:opacity-40">
        {{ guardandoReglas ? 'Guardando…' : 'Guardar' }}
      </button>
      <p v-if="avisoReglas" role="status" class="text-[11px] font-semibold" :class="avisoReglas.error ? 'text-red-700' : 'text-semantico-pasa'">{{ avisoReglas.texto }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { EstadoAjustesClase } from '~/composables/useAjustesClase'

/** «Avance entre módulos» de Ajustes de la clase (PAT-04: una sección, un componente). */
const props = defineProps<{ ajustes: EstadoAjustesClase }>()
const { classInfo } = props.ajustes
const { messageOf } = useApiErrorMessage()

const dominioAvanzar = ref(50)
const guardandoAvance = ref(false)
const avisoAvance = ref<{ texto: string; error: boolean } | null>(null)
watch(() => classInfo.value?.dominioParaAvanzar, (v) => { if (typeof v === 'number') dominioAvanzar.value = v }, { immediate: true })

const horas = ref(24)
const niveles = ref(false)
const guardandoReglas = ref(false)
const avisoReglas = ref<{ texto: string; error: boolean } | null>(null)
watch(() => classInfo.value?.horasParaReabrir, (v) => { if (typeof v === 'number') horas.value = v }, { immediate: true })
watch(() => classInfo.value?.nivelesPesanDistinto, (v) => { if (typeof v === 'boolean') niveles.value = v }, { immediate: true })

async function guardarReglas() {
  const h = Math.round(Number(horas.value))
  if (!Number.isFinite(h) || h < 1 || h > 168) {
    avisoReglas.value = { texto: 'Escribe un número de 1 a 168 horas.', error: true }
    return
  }
  guardandoReglas.value = true
  try {
    await props.ajustes.guardarReglasDominio({ horasParaReabrir: h, nivelesPesanDistinto: niveles.value })
    avisoReglas.value = { texto: `Guardado: un intento se reabre a las ${h} ${h === 1 ? 'hora' : 'horas'}${niveles.value ? ' y los niveles altos pesan más' : ''}.`, error: false }
  } catch (e: unknown) {
    avisoReglas.value = { texto: messageOf(e, 'No se pudo guardar. Intenta de nuevo.'), error: true }
  } finally {
    guardandoReglas.value = false
  }
}

async function guardarAvance() {
  const v = Math.round(Number(dominioAvanzar.value))
  if (!Number.isFinite(v) || v < 0 || v > 100) {
    avisoAvance.value = { texto: 'Escribe un número de 0 a 100.', error: true }
    return
  }
  guardandoAvance.value = true
  try {
    await props.ajustes.guardarAvance(v)
    avisoAvance.value = { texto: v === 0 ? 'Guardado: los módulos ya no se bloquean.' : `Guardado: el siguiente módulo se abre con ${v} %.`, error: false }
  } catch (e: unknown) {
    avisoAvance.value = { texto: messageOf(e, 'No se pudo guardar. Intenta de nuevo.'), error: true }
  } finally {
    guardandoAvance.value = false
  }
}
</script>
