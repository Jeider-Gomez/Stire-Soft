<!-- Tu avance en el inicio (08/10, Jeider: «un porcentaje solo es estático; tengo que calcular yo cuánto avancé»).
     Dos tarjetas: el curso por estados de las lecciones, con color Y número (como la barra de Khan Academy o los mazos de
     Anki), y el dominio con cuánto subió hoy o esta semana (utils/avanceReciente.ts). -->
<template>
  <div class="contents">
    <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
      <p class="text-[11px] text-base-texto-secundario font-medium">Avance del curso</p>
      <p class="text-xl font-bold mt-1 text-base-texto-primario">
        <template v-if="studentStore.hasLoaded">{{ a.dominadas }} <span class="text-sm font-semibold text-base-texto-secundario">de {{ contar(a.total, 'leccion') }} dominadas</span></template>
        <template v-else>—</template>
      </p>
      <!-- La barra por estados; el número de cada uno está en la leyenda, así el color nunca es la única señal. -->
      <div class="mt-2 h-2 flex bg-base-bg-secundario rounded-full overflow-hidden" aria-hidden="true">
        <div v-for="t in tramos" :key="t.clave" :class="t.color" :style="{ width: `${t.ancho}%` }" />
      </div>
      <ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-base-texto-primario">
        <li v-for="t in tramos" :key="t.clave" class="inline-flex items-center gap-1">
          <span class="w-2 h-2 rounded-full" :class="t.color" aria-hidden="true" />{{ t.numero }} {{ t.nombre }}
        </li>
      </ul>
    </div>

    <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 shadow-sm">
      <p class="text-[11px] text-base-texto-secundario font-medium">Dominio en lo que has trabajado</p>
      <p class="text-xl font-bold mt-1" :class="a.dominioTrabajado >= DOMINADO ? 'text-semantico-pasa' : 'text-base-texto-primario'">
        {{ studentStore.hasLoaded && a.trabajadas ? `${a.dominioTrabajado} %` : '—' }}
        <span class="text-[11px] font-normal text-base-texto-secundario">{{ a.trabajadas ? `en ${contar(a.trabajadas, 'leccion')}` : '' }}</span>
      </p>
      <!-- Cuánto subió hoy o esta semana, con la flecha Y el signo (no solo el color). -->
      <div class="mt-1.5 rounded-md px-2 py-1.5 text-xs" :class="FONDO[texto.tono]">
        <p class="font-semibold inline-flex items-center gap-1">
          <TrendingUp v-if="texto.tono === 'sube'" :size="14" aria-hidden="true" />
          <TrendingDown v-else-if="texto.tono === 'baja'" :size="14" aria-hidden="true" />
          <Minus v-else :size="14" aria-hidden="true" />
          {{ texto.titulo }}
        </p>
        <p class="text-[11px] text-base-texto-primario">{{ texto.detalle }}</p>
        <ul v-if="avance && avance.resumen.lecciones.length" class="mt-1 space-y-0.5 text-[11px] text-base-texto-primario">
          <li v-for="l in avance.resumen.lecciones.slice(0, 3)" :key="l.learningUnitId" class="flex gap-2">
            <span class="truncate flex-1">{{ l.titulo }}</span>
            <span class="font-semibold tabular-nums">{{ l.puntos > 0 ? `+${l.puntos}` : l.puntos }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, TrendingDown, TrendingUp } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { contar, DOMINADO } from '~/utils/terminos'
import { avanceReciente, textoAvance } from '~/utils/avanceReciente'

const studentStore = useStudentStore()
const a = computed(() => studentStore.avanceCurso)

const tramos = computed(() => {
  const total = a.value.total || 1
  return [
    { clave: 'dominadas', nombre: a.value.dominadas === 1 ? 'dominada' : 'dominadas', numero: a.value.dominadas, color: 'bg-semantico-pasa' },
    { clave: 'practica', nombre: 'en práctica', numero: a.value.enPractica, color: 'bg-acento-ambar-fuerte' },
    { clave: 'sin', nombre: 'sin empezar', numero: a.value.sinEmpezar, color: 'bg-base-borde-fuerte' },
  ].map((t) => ({ ...t, ancho: Math.round((t.numero / total) * 100) }))
})

const unidades = computed(() => new Set(studentStore.modules.flatMap((m) => m.units.map((u) => u.id))))
const avance = computed(() => avanceReciente(studentStore.analytics.cambiosDominio ?? [], new Date(), unidades.value))
const texto = computed(() => textoAvance(avance.value))
const FONDO = {
  sube: 'bg-semantico-pasa/10 text-semantico-pasa',
  baja: 'bg-semantico-falla/10 text-semantico-falla',
  igual: 'bg-base-bg-secundario text-base-texto-primario',
  nada: 'bg-base-bg-secundario text-base-texto-primario',
} as const
</script>
