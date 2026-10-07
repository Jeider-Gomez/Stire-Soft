<template>
  <!-- Lo que dicen los estudiantes de cada lección (UI-04): «¿Te sirvió esta explicación?», sin nombres. Primero las que
       vale la pena revisar (3 votos o más y más «No» que «Sí»). -->
  <!-- Siempre visible (07/10): antes no aparecía hasta el primer voto y el docente no sabía que existía. -->
  <section v-if="cargado" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3" aria-labelledby="valoraciones-titulo">
    <div>
      <h2 id="valoraciones-titulo" class="text-sm font-bold text-base-texto-primario">¿Les sirvieron las explicaciones?</h2>
      <p class="text-xs text-slate-600">
        Al final de cada lección tus estudiantes responden «¿Te sirvió esta explicación?» y, si no, qué no quedó claro. Aquí lo ves por
        lección, sin sus nombres; primero las que vale la pena revisar.
      </p>
    </div>
    <p v-if="!filas.length" class="text-xs text-base-texto-primario bg-base-bg-secundario rounded-md p-3">
      Todavía nadie ha respondido. Cuando tus estudiantes terminen una lección, aquí verás cuántos dijeron que les sirvió.
    </p>
    <p v-else class="text-xs text-base-texto-primario">
      <span class="font-semibold">{{ totalVotos }} {{ totalVotos === 1 ? 'respuesta' : 'respuestas' }}</span> en {{ filas.length }} {{ filas.length === 1 ? 'lección' : 'lecciones' }}
      <span v-if="porRevisar"> · <span class="font-semibold text-red-700">{{ porRevisar }} para revisar</span></span>
    </p>
    <ul v-if="filas.length" class="divide-y divide-base-borde-sutil">
      <li v-for="f in filas" :key="f.learningUnitId" class="py-3 space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-base-texto-primario flex-1 min-w-[10rem]">{{ f.titulo }}</span>
          <span v-if="f.revisar" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Revisar la explicación</span>
          <span class="text-[11px] text-slate-600">
            <ThumbsUp :size="12" class="inline -mt-0.5" aria-hidden="true" /> {{ f.si }} ·
            <ThumbsDown :size="12" class="inline -mt-0.5" aria-hidden="true" /> {{ f.no }}
            <span v-if="f.porcentajeUtil !== null"> · {{ f.porcentajeUtil }} % le sirvió</span>
          </span>
          <NuxtLink :to="`/docente/contenidos?classId=${classId}&unitId=${f.learningUnitId}`" class="inline-flex items-center min-h-[44px] sm:min-h-0 text-[11px] font-semibold text-acento-ambar-fuerte hover:underline">Editar la lección</NuxtLink>
        </div>
        <ul v-if="f.comentarios.length" class="pl-3 border-l-2 border-base-borde-sutil space-y-1">
          <li v-for="(c, i) in f.comentarios" :key="i" class="text-[11px] text-slate-700">«{{ c }}»</li>
        </ul>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ThumbsDown, ThumbsUp } from 'lucide-vue-next'

interface Fila { learningUnitId: number; titulo: string; si: number; no: number; porcentajeUtil: number | null; comentarios: string[]; revisar: boolean }

const props = defineProps<{ classId: number }>()
const api = useApi()
const filas = ref<Fila[]>([])
const cargado = ref(false)
const totalVotos = computed(() => filas.value.reduce((n, f) => n + f.si + f.no, 0))
const porRevisar = computed(() => filas.value.filter((f) => f.revisar).length)

onMounted(async () => {
  try { filas.value = await api.get<Fila[]>(`/valoraciones/clase/${props.classId}`) } catch { filas.value = [] }
  cargado.value = true
})
</script>
