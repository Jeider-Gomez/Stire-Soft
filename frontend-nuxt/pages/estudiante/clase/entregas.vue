<template>
  <!-- «Mi clase» › Entregas (v3, Fase D, paso 5; cuadro «E-Clase-Entregas»): las entregas de la clase, primero las que faltan.
       Cada fila lleva a la entrega (pages/estudiante/entregas/[id].vue). -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <EstudianteClaseCabecera />

    <section class="tarjeta-inicio" style="--acento: 92 203 255; --acento2: 124 58 237" aria-labelledby="titulo-entregas">
      <h2 id="titulo-entregas" class="titulo-tarjeta mb-2">Entregas</h2>
      <p v-if="cargando" role="status" class="m-0 text-sm text-base-texto-secundario">Cargando…</p>
      <MensajeError v-else-if="error" class="text-sm" :reintentar="cargar">{{ error }}</MensajeError>
      <p v-else-if="!entregas.length" class="m-0 py-2 text-[15px] text-base-texto-secundario leading-relaxed">
        Tu profe todavía no ha dejado entregas en esta clase. Cuando deje una, aparece aquí con su fecha de cierre.
      </p>
      <ul v-else class="m-0 p-0 list-none">
        <li v-for="e in ordenadas" :key="e.id" class="border-t border-base-borde-sutil first:border-t-0">
          <NuxtLink :to="`/estudiante/entregas/${e.id}`" class="fila-entrega flex items-center gap-3 min-h-[56px] py-2.5 px-1.5 rounded-xl">
            <span class="flex-1 min-w-0">
              <span class="block text-[15px] font-bold truncate">{{ e.titulo }}</span>
              <span class="block text-[13px] text-base-texto-secundario">{{ fila(e).detalle }}</span>
            </span>
            <span class="pastilla-inicio" :class="`pastilla-${fila(e).tono}`">{{ fila(e).pastilla }}</span>
            <ChevronRight :size="17" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { useInicioEstudiante, type EntregaInicioEstudiante } from '~/composables/useInicioEstudiante'
import { calificacionTexto } from '~/utils/entregas'
import { filaEntrega } from '~/utils/miClase'

definePageMeta({ layout: 'student' })

const studentStore = useStudentStore()
const inicio = useInicioEstudiante()
const { messageOf } = useApiErrorMessage()
const entregas = ref<EntregaInicioEstudiante[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)

const ORDEN = { sin_entregar: 0, por_revisar: 1, revisada: 2 } as const
const ordenadas = computed(() => [...entregas.value].sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado]))
const fila = (e: EntregaInicioEstudiante) => filaEntrega(e, calificacionTexto(e.ultima) || null)

async function cargar() {
  error.value = null
  cargando.value = true
  try {
    const id = studentStore.currentClassId
    entregas.value = id ? await inicio.entregas(id) : []
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar las entregas.')
  } finally {
    cargando.value = false
  }
}
watch(() => studentStore.currentClassId, cargar)
onMounted(() => {
  if (!studentStore.hasLoaded) studentStore.fetchStudentData()
  cargar()
})
</script>

<style scoped>
.fila-entrega { transition: background-color 0.15s ease; }
.fila-entrega:hover { background: rgb(var(--c-base-bg-secundario)); }
</style>
