<template>
  <!-- De dónde copiar el contenido de una clase nueva (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3). Para no abrumar:
       primero las plantillas de la asignatura que va a dictar (hasta 3, con lo que dice si sirven), el resto agrupado por
       asignatura detrás de «Ver más plantillas», y sus propias clases aparte. Un grupo de radios: una sola elección. -->
  <fieldset class="space-y-2">
    <legend class="block text-xs font-semibold text-slate-700 mb-1.5">Contenido de la clase</legend>

    <label :class="claseOpcion(modelValue === null)">
      <input type="radio" :name="nombre" :checked="modelValue === null" class="sr-only" @change="emit('update:modelValue', null)" />
      <span class="text-xs font-semibold text-base-texto-primario">Empezar vacía</span>
      <span class="text-[11px] text-base-texto-secundario">Creas los módulos y lecciones tú.</span>
    </label>

    <template v-if="recomendadas.length">
      <p class="pt-1 text-[11px] font-bold uppercase tracking-wide text-base-texto-secundario">
        {{ asignaturaNombre ? `Recomendadas para ${asignaturaNombre}` : 'Plantillas de otros docentes' }}
      </p>
      <label v-for="p in recomendadas" :key="p.classId" :class="claseOpcion(modelValue === p.classId)">
        <input type="radio" :name="nombre" :checked="modelValue === p.classId" class="sr-only" @change="emit('update:modelValue', p.classId)" />
        <span class="flex items-start justify-between gap-2">
          <span class="text-xs font-semibold text-base-texto-primario">{{ p.enfoque || p.nombre }}</span>
          <span v-if="p.cercania === 0" class="shrink-0 text-[10px] font-bold text-semantico-exito">Misma asignatura</span>
        </span>
        <span class="text-[11px] text-base-texto-secundario">{{ p.docente }}<template v-if="p.asignatura && p.cercania !== 0"> · {{ p.asignatura.nombre }}</template></span>
        <span class="text-[11px] text-base-texto-secundario">{{ senalesDePlantilla(p).join(' · ') }}</span>
      </label>
    </template>

    <button v-if="resto.length && !verMas" type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" @click="verMas = true">
      Ver más plantillas ({{ resto.length }})
    </button>
    <div v-if="verMas && resto.length" class="space-y-3">
      <div v-for="g in agruparPorAsignatura(resto)" :key="g.clave" class="space-y-1.5">
        <p class="text-[11px] font-bold text-base-texto-primario">{{ g.titulo }} <span class="font-normal text-base-texto-secundario">· {{ cuantosEnfoques(g) }}<template v-if="g.subtitulo"> · {{ g.subtitulo }}</template></span></p>
        <label v-for="p in g.plantillas" :key="p.classId" :class="claseOpcion(modelValue === p.classId)">
          <input type="radio" :name="nombre" :checked="modelValue === p.classId" class="sr-only" @change="emit('update:modelValue', p.classId)" />
          <span class="text-xs font-semibold text-base-texto-primario">{{ p.enfoque || p.nombre }} <span class="font-normal text-base-texto-secundario">· {{ p.docente }}</span></span>
          <span class="text-[11px] text-base-texto-secundario">{{ senalesDePlantilla(p).join(' · ') }}</span>
        </label>
      </div>
    </div>

    <template v-if="misClases.length">
      <p class="pt-1 text-[11px] font-bold uppercase tracking-wide text-base-texto-secundario">De mis clases</p>
      <label v-for="c in misClases" :key="`m${c.id}`" :class="claseOpcion(modelValue === c.id)">
        <input type="radio" :name="nombre" :checked="modelValue === c.id" class="sr-only" @change="emit('update:modelValue', c.id)" />
        <span class="text-xs font-semibold text-base-texto-primario">{{ c.name }}</span>
      </label>
    </template>

    <p class="text-[11px] text-slate-500">Se copian explicaciones y ejercicios en borrador; nunca estudiantes ni notas.</p>
  </fieldset>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { agruparPorAsignatura, cuantosEnfoques, senalesDePlantilla, type Plantilla } from '~/utils/plantillas'

const props = defineProps<{
  modelValue: number | null
  plantillas: Plantilla[]
  misClases: Array<{ id: number; name: string }>
  asignaturaNombre?: string | null
}>()
const emit = defineEmits<{ 'update:modelValue': [number | null] }>()
const nombre = `plantilla-${useId()}`
const verMas = ref(false)
const claseOpcion = (elegida: boolean) => [
  'flex flex-col gap-0.5 min-h-[44px] cursor-pointer rounded-lg border px-3 py-2 transition-colors focus-within:ring-2 focus-within:ring-acento-ambar-fuerte/40',
  elegida ? 'border-acento-ambar-fuerte bg-acento-ambar/10' : 'border-base-borde-sutil hover:bg-base-bg-secundario',
]

// Recomendadas: las de la misma asignatura o muy cercanas (mismo programa y semestre), hasta 3. Sin asignatura elegida,
// las 3 primeras del orden del servidor (copias, utilidad, actualidad).
const recomendadas = computed(() => {
  const cercanas = props.plantillas.filter((p) => p.cercania <= 1)
  return (cercanas.length ? cercanas : props.plantillas).slice(0, 3)
})
const resto = computed(() => props.plantillas.filter((p) => !recomendadas.value.includes(p)))
// Si la elegida deja de estar (cambió la asignatura), se vuelve a «Empezar vacía».
watch(() => props.plantillas, (lista) => {
  if (props.modelValue !== null && !lista.some((p) => p.classId === props.modelValue) && !props.misClases.some((c) => c.id === props.modelValue)) {
    emit('update:modelValue', null)
  }
})
</script>

