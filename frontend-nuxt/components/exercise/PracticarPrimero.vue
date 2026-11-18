<template>
  <!-- «Practica esto primero» (P36; profesor Toscano, 28/10: «si se bloquea, no darle la respuesta: remitirlo al concepto»).
       Tras dos intentos sin lograrlo, con las competencias en «Elegir ejercicios»: qué competencia le falta, la explicación
       que la enseña y un ejercicio más sencillo de esa competencia. Nunca la solución. -->
  <section v-if="datos?.competencia" class="text-left rounded-xl border border-acento-ambar-fuerte/30 bg-acento-ambar/5 p-3 space-y-2" aria-labelledby="practicar-primero-titulo">
    <h3 id="practicar-primero-titulo" class="m-0 text-sm font-bold text-base-texto-primario flex items-center gap-1.5">
      <Target :size="15" class="text-acento-ambar-fuerte" aria-hidden="true" /> Practica esto primero
    </h3>
    <p class="m-0 text-xs text-base-texto-primario">
      Este ejercicio usa <strong>«{{ datos.competencia.nombre }}»</strong> ({{ datos.competencia.ejemplo }}), y ahí vas
      {{ datos.competencia.estado === 'sin-evidencia' ? 'empezando' : NOMBRE_ESTADO[datos.competencia.estado].toLowerCase() }}.
      Afiánzala y vuelve: lo que escribiste queda guardado.
    </p>
    <div class="flex flex-col sm:flex-row gap-2">
      <NuxtLink v-if="datos.leccion" :to="`/estudiante/unidad/${datos.leccion.learningUnitId}#explicacion`" class="practicar-enlace borde-afordancia" @click="$emit('ir')">
        <BookOpen :size="14" aria-hidden="true" /> Repasar «{{ datos.leccion.titulo }}»
      </NuxtLink>
      <NuxtLink v-if="datos.ejercicio" :to="`/estudiante/evaluacion/${datos.ejercicio.activityId}`" class="practicar-enlace borde-afordancia" @click="$emit('ir')">
        <Dumbbell :size="14" aria-hidden="true" /> Uno más sencillo: «{{ datos.ejercicio.title }}»
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BookOpen, Dumbbell, Target } from 'lucide-vue-next'
import { NOMBRE_ESTADO, type PracticarPrimero } from '~/utils/competencias'

const props = defineProps<{ activityId: number }>()
defineEmits<{ ir: [] }>()

const competencias = useCompetencias()
const datos = ref<PracticarPrimero | null>(null)

// Solo con «Elegir ejercicios»; si la ruta falla (un servidor sin actualizar), no aparece y el resultado sigue igual.
onMounted(async () => {
  try {
    const r = await competencias.practicarPrimero(props.activityId)
    datos.value = r.modo === 'recomendar' ? r : null
  } catch {
    datos.value = null
  }
})
</script>

<style scoped>
.practicar-enlace {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 8px 12px;
  border-radius: 12px; font-size: 12px; font-weight: 600; text-align: center;
  background: rgb(var(--c-base-blanco)); color: rgb(var(--c-base-texto-primario));
}
</style>
