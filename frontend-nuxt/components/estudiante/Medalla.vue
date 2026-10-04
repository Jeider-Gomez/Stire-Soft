<template>
  <!-- Una medalla: el ícono de su categoría y el color de su nivel (bronce, plata, oro; los módulos, verde azulado).
       Sin obtener se ve gris: se sabe qué hay que hacer para ganarla (como en Khan Academy y Duolingo). -->
  <span
    class="relative inline-flex shrink-0 items-center justify-center rounded-full border-2"
    :class="[tam, obtenida ? colores : 'border-slate-300 bg-slate-100 text-slate-500']"
    role="img"
    :aria-label="`${titulo}${nivel ? `, ${NOMBRE_NIVEL[nivel].toLowerCase()}` : ''}${obtenida ? '' : ', sin obtener'}`">
    <component :is="icono" :size="grande ? 22 : 16" aria-hidden="true" />
    <Lock v-if="!obtenida" :size="10" class="absolute -bottom-0.5 -right-0.5 rounded-full bg-base-blanco text-slate-500" aria-hidden="true" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Brain, CalendarCheck, GraduationCap, Lock, Mountain, Sprout, Zap } from 'lucide-vue-next'
import { NOMBRE_NIVEL, type CategoriaLogro, type NivelLogro } from '~/utils/logros'

const props = defineProps<{ categoria: CategoriaLogro; nivel: NivelLogro | null; obtenida: boolean; titulo: string; grande?: boolean }>()

const ICONOS = { constancia: CalendarCheck, practica: Zap, dominio: GraduationCap, desafio: Mountain, persistencia: Sprout, memoria: Brain }
const icono = computed(() => ICONOS[props.categoria])
const tam = computed(() => (props.grande ? 'h-12 w-12' : 'h-9 w-9'))
const colores = computed(() => {
  if (props.nivel === 'oro') return 'border-yellow-500 bg-yellow-50 text-yellow-700'
  if (props.nivel === 'plata') return 'border-slate-400 bg-slate-50 text-slate-600'
  if (props.nivel === 'bronce') return 'border-amber-700 bg-amber-50 text-amber-800'
  return 'border-teal-600 bg-teal-50 text-teal-700'
})
</script>
