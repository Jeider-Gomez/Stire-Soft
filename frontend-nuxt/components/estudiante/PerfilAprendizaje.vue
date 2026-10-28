<template>
  <!-- Perfil de aprendizaje (MOD-02, Caro 2015; revisión de Pedro 16/10). Lo ven el estudiante en «Mi progreso» y su docente
       en la ficha. Con datos reales: el temario dominado, los errores de concepto que se repiten (aparte de los descuidos
       de escritura), cómo recorre el curso (Global/Secuencial) y qué formatos elige (Visual/Verbal). Describe, no
       encasilla: todos los formatos siguen disponibles (BT-42). -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 shadow-sm space-y-4" aria-labelledby="perfil-titulo">
    <div>
      <h2 id="perfil-titulo" class="text-sm font-bold text-base-texto-primario inline-flex items-center gap-1.5">
        <UserRoundSearch :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> {{ docente ? 'Perfil de aprendizaje' : 'Mi perfil de aprendizaje' }}
      </h2>
      <p class="text-[11px] text-base-texto-secundario">Sale de {{ docente ? 'lo que hace' : 'lo que haces' }} en STIRE. No cambia lo que {{ docente ? 've' : 'ves' }}: todos los formatos siguen disponibles.</p>
    </div>

    <MensajeError v-if="error" class="text-xs">{{ error }}</MensajeError>
    <p v-else-if="!perfil" class="text-xs text-base-texto-secundario">Cargando…</p>
    <template v-else>
      <!-- El temario: dominado en verde, en proceso en ámbar y pendiente en gris (modelo overlay). -->
      <div class="space-y-1.5">
        <p class="text-xs font-semibold text-base-texto-primario">{{ partes.dominado }} % del temario dominado</p>
        <div class="flex h-2.5 rounded-full overflow-hidden bg-base-bg-secundario" role="img"
          :aria-label="`${perfil.dominio.dominadas} lecciones dominadas, ${perfil.dominio.enProceso} en proceso y ${perfil.dominio.sinEmpezar} sin empezar, de ${perfil.dominio.total}`">
          <div class="bg-semantico-pasa" :style="{ width: `${partes.dominado}%` }" />
          <div class="bg-acento-ambar-fuerte" :style="{ width: `${partes.proceso}%` }" />
        </div>
        <p class="text-[11px] text-base-texto-secundario">{{ perfil.dominio.dominadas }} dominadas · {{ perfil.dominio.enProceso }} en proceso · {{ perfil.dominio.sinEmpezar }} sin empezar</p>
      </div>

      <!-- Errores de concepto que se repiten, separados de los descuidos de escritura. -->
      <div class="space-y-1.5">
        <p class="text-xs font-semibold text-base-texto-primario">Errores que se repiten</p>
        <ul v-if="perfil.errores.seRepiten.length" class="space-y-1.5">
          <li v-for="e in perfil.errores.seRepiten" :key="e.tipo" class="flex items-start gap-2 p-2.5 rounded-lg border border-acento-ambar-fuerte/30 bg-acento-ambar/5 text-xs text-base-texto-primario">
            <TriangleAlert :size="14" class="shrink-0 mt-0.5 text-acento-ambar-fuerte" aria-hidden="true" />
            <span>{{ e.explicacion }} <span class="text-base-texto-secundario">({{ e.veces }} ejercicios)</span></span>
          </li>
        </ul>
        <p v-else class="text-xs text-base-texto-secundario">Ningún error de concepto se repite por ahora.</p>
        <p class="text-[11px] text-base-texto-secundario">
          Descuidos de escritura (paréntesis, mayúsculas, espacios): {{ perfil.errores.descuidos }} {{ perfil.errores.descuidos === 1 ? 'ejercicio' : 'ejercicios' }}. Se corrigen revisando con calma; no son falta de comprensión.
        </p>
      </div>

      <!-- Cómo estudia: las dimensiones del criterio, dichas con lo que hace. -->
      <div class="space-y-1 text-xs text-base-texto-primario">
        <p class="font-semibold">{{ docente ? 'Cómo estudia' : 'Cómo estudias' }}</p>
        <p class="flex items-start gap-1.5"><Eye :size="13" class="shrink-0 mt-0.5 text-acento-ambar-fuerte" aria-hidden="true" /> {{ fraseFormatos(perfil.formatos, !docente) ?? 'Visual o verbal: todavía no hay datos (se ve al usar el diagrama, el paso a paso o «Escuchar»).' }}</p>
        <p class="flex items-start gap-1.5"><Route :size="13" class="shrink-0 mt-0.5 text-acento-ambar-fuerte" aria-hidden="true" /> {{ fraseOrden(perfil.orden, !docente) ?? 'Secuencial o global: todavía no hay datos (se ve después de empezar 4 lecciones).' }}</p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { Eye, Route, TriangleAlert, UserRoundSearch } from 'lucide-vue-next'
import { useRendimiento } from '~/composables/useRendimiento'
import { fraseFormatos, fraseOrden, partesDominio, type PerfilAprendizaje } from '~/utils/perfilAprendizaje'

const props = defineProps<{ studentId: number; docente?: boolean }>()
const datos = useRendimiento()
const { messageOf } = useApiErrorMessage()
const perfil = ref<PerfilAprendizaje | null>(null)
const error = ref<string | null>(null)
const partes = computed(() => partesDominio(perfil.value?.dominio ?? { dominadas: 0, enProceso: 0, sinEmpezar: 0, total: 0 }))

watch(() => props.studentId, async (id) => {
  if (!id) return
  error.value = null
  try {
    perfil.value = await datos.perfil<PerfilAprendizaje>(id)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar el perfil de aprendizaje.')
  }
}, { immediate: true })
</script>
