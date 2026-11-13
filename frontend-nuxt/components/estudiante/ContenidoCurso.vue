<template>
  <!-- «Contenido del curso» (v3, Fase D, paso 2; cuadros «E-Leccion» y «E-Leccion-Cerrado» del lienzo): al estudiar, el
       menú queda en íconos y este panel muestra el curso entero al lado de la lección, para moverse sin salir de ella.
       Solo en computador (lg); en el celular lo hace la barra de abajo de la lección (NavegacionLeccion.vue). Se recoge
       para leer a pantalla completa y se vuelve a abrir con «Contenido», arriba de la lección (SaltosLeccion.vue). -->
  <aside v-if="abierto" aria-label="Contenido del curso"
    class="hidden lg:flex flex-col w-[300px] flex-none sticky top-0 h-screen overflow-y-auto bg-base-blanco border-r border-base-borde-sutil">
    <div class="flex items-center gap-2 pt-3.5 pb-2.5 pl-[18px] pr-3.5">
      <h2 class="m-0 flex-1 text-xs font-bold tracking-[0.06em] uppercase text-base-texto-secundario">Contenido del curso</h2>
      <button type="button" class="w-[34px] h-[34px] rounded-[10px] border border-base-borde-sutil inline-flex items-center justify-center hover:bg-base-bg-secundario"
        aria-label="Recoger el contenido" title="Recoger" @click="alternar">
        <PanelLeftClose :size="16" aria-hidden="true" />
      </button>
    </div>

    <template v-if="actual">
      <!-- El módulo en el que está, con su avance. -->
      <div class="mx-3.5 mb-3 px-3.5 py-3 rounded-[14px] bg-base-bg-primario">
        <p class="m-0 mb-0.5 text-sm font-bold">{{ actual.titulo }}</p>
        <p class="m-0 mb-2 text-xs text-base-texto-secundario">{{ actual.dominadas }} de {{ contar(actual.total, 'leccion') }} · {{ actual.dominio }} %</p>
        <span class="block h-1.5 rounded-full bg-base-borde-sutil overflow-hidden" aria-hidden="true">
          <span class="block h-full rounded-full barra-menta" :style="{ width: `${actual.dominio}%` }" />
        </span>
      </div>
      <nav aria-label="Lecciones del módulo" class="flex flex-col gap-0.5 px-2.5">
        <template v-for="(tema, t) in actual.temas" :key="tema.id">
          <p class="mt-2.5 mb-1 mx-2 text-xs font-bold uppercase text-base-texto-secundario">Tema {{ t + 1 }} · {{ tema.titulo }}</p>
          <EstudianteFilaContenido v-for="l in tema.lecciones" :key="l.id" :leccion="l" />
        </template>
      </nav>
    </template>

    <!-- Los demás módulos, plegados; uno cerrado dice qué lo abre. -->
    <div class="flex flex-col gap-1.5 px-2.5 pt-2 pb-6">
      <div v-for="m in otros" :key="m.id">
        <button type="button" class="w-full flex items-center gap-2 min-h-[44px] mt-1.5 px-2.5 py-2 rounded-[11px] border border-base-borde-sutil text-left text-[13px] font-bold hover:bg-base-bg-secundario"
          :aria-expanded="desplegado === m.id" :aria-controls="`contenido-modulo-${m.id}`" @click="desplegado = desplegado === m.id ? null : m.id">
          <Lock v-if="!m.abierto" :size="13" class="shrink-0 text-base-texto-secundario" aria-label="Cerrado" />
          <span class="flex-1">{{ m.titulo }}</span>
          <span class="text-[11px] font-semibold text-base-texto-secundario">{{ m.dominadas }}/{{ m.total }}</span>
          <ChevronDown :size="15" class="shrink-0 transition-transform" :class="{ 'rotate-180': desplegado === m.id }" aria-hidden="true" />
        </button>
        <div v-if="desplegado === m.id" :id="`contenido-modulo-${m.id}`" class="pt-1">
          <p v-if="m.requiere" class="m-0 mx-2 my-1.5 text-xs text-base-texto-secundario leading-snug">{{ m.requiere }}</p>
          <template v-else>
            <template v-for="(tema, t) in m.temas" :key="tema.id">
              <p class="mt-2 mb-1 mx-2 text-[11px] font-bold uppercase text-base-texto-secundario">Tema {{ t + 1 }} · {{ tema.titulo }}</p>
              <EstudianteFilaContenido v-for="l in tema.lecciones" :key="l.id" :leccion="l" />
            </template>
          </template>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ChevronDown, Lock, PanelLeftClose } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { contenidoDelCurso } from '~/utils/contenidoCurso'
import { contar } from '~/utils/terminos'

const route = useRoute()
const studentStore = useStudentStore()
const { abierto, alternar } = useContenidoCurso()

const unitId = computed(() => Number(route.params.id))
const modulos = computed(() => contenidoDelCurso(studentStore.modules, studentStore.estadosModulos, unitId.value))
const actual = computed(() => modulos.value.find((m) => m.temas.some((t) => t.lecciones.some((l) => l.estado === 'aqui'))) ?? null)
const otros = computed(() => modulos.value.filter((m) => m.id !== actual.value?.id))
const desplegado = ref<number | null>(null)
watch(unitId, () => { desplegado.value = null })
</script>

<style scoped>
.barra-menta { background: #00c2a8; transition: width 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
</style>
