<template>
  <!-- Biblioteca (prototipo del panel v2): los cursos que otros docentes compartieron. Se revisan por dentro antes de
       usarlos y se copian a una clase nueva; nunca se enlazan (utils/biblioteca.ts). Opcional, como todo lo del docente. -->
  <div class="max-w-7xl mx-auto space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-poppins font-bold text-base-texto-primario tracking-tight">Biblioteca</h1>
      <p class="text-sm text-base-texto-secundario max-w-2xl">
        Cursos que otros docentes compartieron. Revísalos por dentro antes de usarlos: se copian a tu clase nueva, nunca se
        enlazan, y sus estudiantes, entregas y notas no se comparten.
      </p>
    </header>

    <div class="flex flex-wrap gap-2.5">
      <label class="relative flex-1 min-w-[14rem]">
        <span class="sr-only">Buscar en la biblioteca</span>
        <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-texto-secundario" aria-hidden="true" />
        <input id="buscar-biblioteca" v-model="texto" type="search" placeholder="Buscar por tema, enfoque o docente" class="input-stire pl-9 min-h-[44px]" />
      </label>
      <select id="biblioteca-asignatura" v-model="asignaturaId" aria-label="Asignatura" class="input-stire min-h-[44px] w-auto">
        <option :value="null">Todas las asignaturas</option>
        <option v-for="a in asignaturas" :key="a.id" :value="a.id">{{ a.nombre }}</option>
      </select>
      <select id="biblioteca-orden" v-model="orden" aria-label="Ordenar" class="input-stire min-h-[44px] w-auto">
        <option v-for="o in ORDENES_BIBLIOTECA" :key="o.valor" :value="o.valor">{{ o.texto }}</option>
      </select>
    </div>

    <p v-if="cargando" class="p-10 text-center text-sm text-base-texto-secundario bg-base-blanco rounded-2xl border border-base-borde-sutil">Cargando la biblioteca…</p>
    <div v-else-if="plantillas.length === 0" class="p-10 text-center bg-base-blanco rounded-2xl border border-dashed border-base-borde-fuerte space-y-2">
      <p class="font-semibold text-base-texto-primario">Todavía nadie ha compartido un curso contigo</p>
      <p class="text-sm text-base-texto-secundario">Cuando un docente de tu asignatura, programa o institución comparta el contenido de su clase, aparecerá aquí. Tú también puedes compartir el tuyo en «Ajustes de la clase».</p>
    </div>
    <p v-else-if="visibles.length === 0" class="p-6 text-center text-sm text-base-texto-secundario bg-base-blanco rounded-2xl border border-base-borde-sutil">
      No hay cursos con «{{ texto }}». Prueba con otra palabra o quita el filtro.
    </p>

    <ul v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <li v-for="p in visibles" :key="p.classId" class="flex flex-col gap-3 p-5 rounded-2xl bg-base-blanco border border-base-borde-sutil">
        <div class="flex flex-wrap gap-1.5 text-[11px] font-semibold">
          <span v-if="p.asignatura" class="px-2 py-0.5 rounded-full bg-stire-blue/10 text-stire-blue">{{ p.asignatura.nombre }}</span>
          <span v-if="p.cercania === 0" class="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">De tu asignatura</span>
        </div>
        <div>
          <h2 class="text-base font-poppins font-bold text-base-texto-primario leading-snug">{{ p.enfoque || p.nombre }}</h2>
          <p class="text-xs text-base-texto-secundario mt-0.5">{{ p.docente }}</p>
        </div>
        <ul class="text-xs text-base-texto-secundario space-y-0.5">
          <li v-for="s in senalesDePlantilla(p)" :key="s">{{ s }}</li>
        </ul>

        <!-- Revisar por dentro: los módulos que trae, antes de decidir. -->
        <div v-if="abierta === p.classId" class="rounded-xl bg-base-bg-secundario/60 p-3 text-xs space-y-1.5" aria-live="polite">
          <p v-if="modulos[p.classId] === undefined" class="text-base-texto-secundario">Cargando sus módulos…</p>
          <p v-else-if="modulos[p.classId] === null" class="text-semantico-falla">No se pudieron cargar sus módulos. Inténtalo de nuevo.</p>
          <template v-else>
            <p class="font-semibold text-base-texto-primario">Lo que trae</p>
            <ol class="list-decimal pl-5 space-y-0.5 text-base-texto-primario">
              <li v-for="m in modulos[p.classId]" :key="m.id">{{ m.title }}</li>
            </ol>
            <p class="text-base-texto-secundario">Se copia en borrador: lo revisas y publicas cuando quieras. Luego puedes cambiar lo que quieras.</p>
          </template>
        </div>

        <div class="mt-auto flex flex-wrap gap-2 pt-1">
          <NuxtLink :to="enlaceUsarPlantilla(p.classId)" class="btn-stire-primary min-h-[44px]">Usar en una clase nueva</NuxtLink>
          <button type="button" class="btn-stire-secondary min-h-[44px]" :aria-expanded="abierta === p.classId" @click="revisar(p.classId)">
            {{ abierta === p.classId ? 'Ocultar' : 'Revisar por dentro' }}
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Search } from 'lucide-vue-next'
import { useClasesDocente } from '~/composables/useClasesDocente'
import { senalesDePlantilla } from '~/utils/plantillas'
import { ORDENES_BIBLIOTECA, asignaturasDeLaBiblioteca, enlaceUsarPlantilla, filtrarBiblioteca, type OrdenBiblioteca } from '~/utils/biblioteca'

definePageMeta({ layout: 'teacher' })

const estado = useClasesDocente()
const { plantillas } = estado
const cargando = ref(true)
const texto = ref('')
const asignaturaId = ref<number | null>(null)
const orden = ref<OrdenBiblioteca>('cercania')
const abierta = ref<number | null>(null)
/** undefined = cargando; null = falló; lista = sus módulos. */
const modulos = reactive<Record<number, Array<{ id: number; title: string }> | null | undefined>>({})

const asignaturas = computed(() => asignaturasDeLaBiblioteca(plantillas.value))
const visibles = computed(() => filtrarBiblioteca(plantillas.value, { texto: texto.value, asignaturaId: asignaturaId.value, orden: orden.value }))

async function revisar(classId: number) {
  if (abierta.value === classId) { abierta.value = null; return }
  abierta.value = classId
  if (!modulos[classId]) {
    modulos[classId] = undefined
    modulos[classId] = await estado.modulosDePlantilla(classId)
  }
}

onMounted(async () => {
  await estado.cargarPlantillas()
  cargando.value = false
})
</script>
