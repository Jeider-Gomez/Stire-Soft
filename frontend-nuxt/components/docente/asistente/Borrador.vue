<template>
  <!-- El borrador del Asistente para revisarlo antes de crear nada: la estructura como árbol, la explicación como se leerá
       y los ejercicios con la correcta marcada. Con el porqué de la propuesta. -->
  <section class="rounded-xl border border-base-borde-sutil bg-base-bg-secundario/40 p-3.5 space-y-2.5" aria-label="Borrador del Asistente">
    <p class="text-xs font-semibold text-stire-blue">Borrador · {{ resumenBorrador(borrador) }}</p>

    <ol v-if="borrador.tipo === 'estructura'" class="space-y-2 text-sm">
      <li v-for="(m, i) in borrador.modulos" :key="i">
        <p class="font-semibold text-base-texto-primario">{{ i + 1 }}. {{ m.titulo }}</p>
        <ul class="mt-0.5 space-y-0.5 pl-4 text-xs">
          <li v-for="(t, j) in m.temas" :key="j">
            <span class="text-base-texto-primario">{{ t.titulo }}</span>
            <ul class="pl-3 text-base-texto-secundario">
              <li v-for="(l, k) in t.lecciones" :key="k">· {{ l.titulo }} <span class="opacity-80">— {{ l.objetivo }}</span></li>
            </ul>
          </li>
        </ul>
      </li>
    </ol>

    <div v-else-if="borrador.tipo === 'leccion'" class="space-y-1">
      <p class="text-sm font-semibold text-base-texto-primario">{{ borrador.titulo }}</p>
      <div class="prose prose-sm max-w-none text-base-texto-primario max-h-80 overflow-y-auto" v-html="html" />
    </div>

    <ol v-else class="space-y-3 text-sm">
      <li v-for="(e, i) in borrador.ejercicios" :key="i" class="space-y-1">
        <p class="text-base-texto-primario"><span class="font-semibold">{{ i + 1 }}.</span> {{ e.enunciado }}</p>
        <ul class="space-y-0.5 text-xs">
          <li v-for="(o, k) in e.opciones" :key="k" class="flex items-start gap-1.5" :class="k === e.correcta ? 'text-semantico-pasa font-semibold' : 'text-base-texto-secundario'">
            <Check v-if="k === e.correcta" :size="13" class="shrink-0 mt-0.5" aria-hidden="true" /><Circle v-else :size="13" class="shrink-0 mt-0.5" aria-hidden="true" /><span>{{ o }}<span v-if="k === e.correcta" class="sr-only"> (correcta)</span></span>
          </li>
        </ul>
      </li>
    </ol>

    <p v-if="borrador.porque" class="text-[11px] text-base-texto-secundario border-t border-base-borde-sutil pt-2"><strong>Por qué así:</strong> {{ borrador.porque }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Circle } from 'lucide-vue-next'
import { resumenBorrador, type BorradorAsistente } from '~/utils/asistenteDocente'

const props = defineProps<{ borrador: BorradorAsistente }>()
// La explicación se ve como la leerá el estudiante, con el mismo formateo seguro del Tutor.
const html = computed(() => (props.borrador.tipo === 'leccion' ? formatTutorMessage(props.borrador.explicacion) : ''))
</script>
