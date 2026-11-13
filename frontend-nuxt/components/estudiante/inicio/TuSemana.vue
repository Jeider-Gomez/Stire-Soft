<!-- «Tu semana · sin rachas» (v3, Fase D; cuadro «E-Inicio»): los días que estudió de lunes a domingo y cuántos faltan
     para la Constancia (3 días, no seguidos: utils/tuSemana.ts). Un día sin estudiar no se marca como fallo. Debajo, el
     logro nuevo o el más cercano. -->
<template>
  <section class="tarjeta-inicio" style="--acento: var(--c-sec-sol); --acento2: var(--c-sec-rosa)" aria-labelledby="titulo-tu-semana">
    <div class="flex items-center gap-2.5 mb-3">
      <h2 id="titulo-tu-semana" class="titulo-tarjeta">Tu semana</h2>
      <span class="pastilla-inicio pastilla-gris">Sin rachas</span>
    </div>

    <p class="m-0 text-[15px] leading-relaxed">
      <template v-if="resumen.estudiados">Estudiaste <strong>{{ resumen.estudiados }} {{ resumen.estudiados === 1 ? 'día' : 'días' }}</strong>. </template>
      {{ resumen.texto }}
    </p>
    <div class="flex gap-1.5 mt-2 mb-3" role="img" :aria-label="lectura">
      <span v-for="d in dias" :key="d.fecha" class="flex-1 flex flex-col items-center gap-1.5">
        <span class="dia-semana" :class="d.estado === 'hecho' ? 'dia-hecho' : d.estado === 'hoy' ? 'dia-hoy' : 'dia-otro'">
          <Check v-if="d.estado === 'hecho'" :size="16" aria-hidden="true" />
        </span>
        <span class="text-xs" :class="d.estado === 'hoy' ? 'font-bold' : 'font-medium text-base-texto-secundario'">{{ d.letra }}</span>
      </span>
    </div>

    <NuxtLink v-if="logro" to="/estudiante/logros" class="medalla-inicio flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-[14px]">
      <Award :size="20" class="shrink-0" aria-hidden="true" />
      <span class="flex-1 min-w-0 text-sm">
        <strong class="block">{{ logro.nuevo ? 'Logro nuevo' : 'Tu próximo logro' }}: {{ logro.titulo }}</strong>
        <span class="block text-[13px] opacity-90">{{ logro.detalle }}</span>
      </span>
      <ChevronRight :size="18" class="shrink-0" aria-hidden="true" />
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import { Award, Check, ChevronRight } from 'lucide-vue-next'
import { diasDeEstaSemana, resumenDeLaSemana, textoDeLaSemana } from '~/utils/tuSemana'
import { textoProgreso, type RespuestaLogros } from '~/utils/logros'

const props = defineProps<{ datos: RespuestaLogros | null }>()

const dias = computed(() => diasDeEstaSemana(props.datos?.semana ?? []))
const resumen = computed(() => textoDeLaSemana(dias.value))
const lectura = computed(() => resumenDeLaSemana(dias.value))

/** El logro recién ganado (se celebra una vez) o, si no hay, la meta más cercana. Sin logros en la clase, nada. */
const logro = computed(() => {
  const d = props.datos
  if (!d?.activos) return null
  const nuevo = d.logros.find((l) => d.nuevos.includes(l.clave))
  if (nuevo) return { nuevo: true, titulo: nuevo.titulo, detalle: nuevo.descripcion }
  if (d.siguiente) return { nuevo: false, titulo: d.siguiente.titulo, detalle: `Llevas ${textoProgreso(d.siguiente)}` }
  return null
})
</script>

<style scoped>
.medalla-inicio { background: rgb(var(--c-sec-sol-fondo)); color: #7a4b00; transition: filter 0.15s ease; }
.medalla-inicio:hover { filter: brightness(0.97); }
:root[data-tema='oscuro'] .medalla-inicio { color: rgb(var(--c-sec-sol-icono)); }
</style>
