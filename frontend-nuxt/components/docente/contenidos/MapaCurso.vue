<template>
  <!-- Mapa del curso (prototipo del panel v2): las cifras de un vistazo, «Para completar» con lo que le falta a cada lección
       (un toque y se abre) y el avance de cada módulo. Es lo que se ve al tocar el nombre del curso en el árbol. -->
  <section aria-labelledby="mapa-titulo" class="space-y-5">
    <div>
      <h2 id="mapa-titulo" class="text-lg font-bold text-base-texto-primario">Mapa del curso</h2>
      <p class="text-xs text-base-texto-secundario">Qué tiene el curso y qué le falta. Toca una lección para abrirla.</p>
    </div>

    <dl class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div v-for="c in cifras" :key="c.etiqueta" class="rounded-xl border border-base-borde-sutil bg-base-blanco px-3 py-2.5">
        <dt class="text-[11px] text-base-texto-secundario">{{ c.etiqueta }}</dt>
        <dd class="text-xl font-bold tabular-nums" :class="c.tono">{{ c.valor }}</dd>
      </div>
    </dl>

    <div>
      <h3 class="text-sm font-semibold text-base-texto-primario mb-1.5">Para completar</h3>
      <ul v-if="resumen.paraCompletar.length" class="divide-y divide-base-borde-sutil rounded-xl border border-base-borde-sutil bg-base-blanco">
        <li v-for="p in resumen.paraCompletar" :key="p.id">
          <button type="button" class="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-base-bg-secundario/60" @click="$emit('elegir', p.id)">
            <span class="w-2 h-2 rounded-full shrink-0 bg-amber-600" aria-hidden="true" />
            <span class="flex-1 min-w-0">
              <span class="block text-sm text-base-texto-primario truncate">{{ p.titulo }}</span>
              <span class="block text-[11px] text-base-texto-secundario truncate">{{ p.modulo }} · {{ p.falta }}</span>
            </span>
            <ChevronRight :size="15" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
          </button>
        </li>
      </ul>
      <p v-else class="text-sm text-base-texto-secundario rounded-xl border border-dashed border-base-borde-fuerte px-3.5 py-3">
        Todas las lecciones visibles tienen su explicación y su práctica publicadas.
      </p>
    </div>

    <div>
      <h3 class="text-sm font-semibold text-base-texto-primario mb-1.5">Módulos</h3>
      <ul class="grid gap-2 sm:grid-cols-2">
        <li v-for="m in resumen.porModulo" :key="m.id" class="rounded-xl border border-base-borde-sutil bg-base-blanco px-3.5 py-2.5 space-y-1.5">
          <p class="flex items-center gap-2 text-sm font-semibold text-base-texto-primario"><span class="truncate">{{ m.titulo }}</span>
            <span v-if="!m.publicado" class="shrink-0 text-[10px] font-semibold text-base-texto-secundario border border-base-borde-sutil rounded px-1">Sin publicar</span></p>
          <div class="h-1.5 rounded-full bg-base-bg-secundario overflow-hidden"><div class="h-full rounded-full bg-semantico-pasa" :style="{ width: `${m.lecciones ? (100 * m.listas) / m.lecciones : 0}%` }" /></div>
          <p class="text-[11px] text-base-texto-secundario">{{ m.listas }} de {{ m.lecciones }} lecciones listas</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { resumenCurso, type ModuloConConteos } from '~/utils/estadoCurso'

const props = defineProps<{ modulos: ModuloConConteos[] }>()
defineEmits<{ elegir: [id: number] }>()
const resumen = computed(() => resumenCurso(props.modulos))
const cifras = computed(() => [
  { etiqueta: 'Lecciones', valor: resumen.value.unidades, tono: 'text-base-texto-primario' },
  { etiqueta: 'Actividades', valor: resumen.value.actividades, tono: 'text-base-texto-primario' },
  { etiqueta: 'Les falta algo', valor: resumen.value.conPendientes, tono: resumen.value.conPendientes ? 'text-amber-700' : 'text-base-texto-primario' },
  { etiqueta: 'Ocultas', valor: resumen.value.ocultas, tono: 'text-base-texto-secundario' },
])
</script>
