<template>
  <!-- El texto de una lección con sus imágenes, recursos y ejemplos en vivo en el lugar donde el docente los puso
       (utils/contenidoLeccion.ts). Lo usan la lección del estudiante y la vista previa del editor. -->
  <div class="space-y-3">
    <template v-for="(s, i) in segmentos" :key="i">
      <div v-if="s.tipo === 'texto'" class="prose prose-xs max-w-none" v-html="formatMarkdown(s.markdown, { escapeHtml: borrador })" />
      <LessonResource v-else-if="s.tipo === 'imagen'" type="image" :title="s.alt" :metadata="{ url: s.url, alt: s.alt, caption: s.pie }" />
      <template v-else-if="s.tipo === 'recurso'">
        <LessonResource v-if="insertados?.[s.url]" type="embed" :title="s.titulo" :metadata="insertados[s.url]" />
        <!-- En el editor, un enlace recién escrito todavía no tiene vista previa: se muestra como enlace. -->
        <p v-else class="text-[11px] text-base-texto-secundario rounded-lg border border-dashed border-base-borde-fuerte p-3">
          {{ s.titulo || 'Recurso' }}: se verá aquí al guardar la lección.
        </p>
      </template>
      <EjemploEnVivo v-else-if="s.tipo === 'vivo'" :codigo="s.codigo" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatMarkdown } from '~/utils/formatMarkdown'
import { partirContenido, type Insertados } from '~/utils/contenidoLeccion'

const props = withDefaults(defineProps<{ texto: string; insertados?: Insertados | null; borrador?: boolean }>(), {
  insertados: null,
  // En la vista previa del editor el texto aún no pasó por el saneado del servidor: se escapa (formatMarkdown).
  borrador: false,
})
const segmentos = computed(() => partirContenido(props.texto))
</script>
