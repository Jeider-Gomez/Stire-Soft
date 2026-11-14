<template>
  <!-- Repasos v3 (Fase D, paso 4; cuadros «E-Repasos», «E-Repasos-Oculto», «E-Repasos-Oscuro» y «E-Cel-Repasos»). Sin rachas y
       sin rojo (crítica del 05/10 y P38): una acción principal (repasar los de hoy seguidos), la agenda en pestañas y cómo
       funcionan los repasos al lado. utils/repasosV3.ts. -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <section data-recorrido="repasos-hoy" class="heroe-inicio grid gap-4 lg:gap-6 items-center lg:grid-cols-[auto_1fr_auto]" aria-labelledby="titulo-repasos">
      <span class="hidden lg:block" aria-hidden="true"><TutorMascota expresion="contento" :tamano="110" forma="completa" /></span>
      <div class="min-w-0">
        <p class="m-0 mb-1.5 text-[13px] font-bold uppercase opacity-80">Repasos · sin rachas, a tu ritmo</p>
        <h1 id="titulo-repasos" class="m-0 mb-2 font-poppins font-bold text-[22px] sm:text-[30px] leading-tight">{{ portada.titulo }}</h1>
        <p class="globo-repasos hidden sm:block m-0 mb-3.5 max-w-[560px] text-base leading-normal">
          «<template v-if="portada.destacado">Empecemos por <strong>{{ portada.destacado }}</strong></template>{{ portada.frase }}»
        </p>
        <div v-if="lista.length" class="flex flex-wrap gap-2.5">
          <NuxtLink v-if="grupos.hoy.length" :to="enlace(grupos.hoy[0].learningUnitId)" class="boton-heroe boton-principal inline-flex w-full sm:w-auto" @click="empezarCola">
            {{ grupos.hoy.length === 1 ? 'Repasar el de hoy' : `Repasar los ${grupos.hoy.length} seguidos` }} <ChevronRight :size="17" aria-hidden="true" />
          </NuxtLink>
          <a href="#tus-repasos" class="boton-heroe boton-otro hidden sm:inline-flex" @click.prevent="elegirYo">Elegir yo</a>
        </div>
      </div>
      <ul v-if="lista.length" class="hidden sm:flex lg:flex-col gap-2 m-0 p-0 list-none lg:min-w-[180px]" aria-label="Tu agenda de repasos">
        <li v-for="c in CONTADORES" :key="c.grupo">
          <button type="button" class="contador-repasos w-full" :class="`contador-${c.grupo}`" @click="verPestana(c.grupo)">
            <strong class="font-poppins text-[22px] min-w-[30px] text-left">{{ grupos[c.grupo].length }}</strong>
            <span class="text-sm font-semibold">{{ c.texto }}</span>
          </button>
        </li>
      </ul>
    </section>

    <div v-if="lista.length" class="grid gap-[18px] items-start" :class="recogida ? 'lg:grid-cols-[minmax(0,1fr)_48px]' : 'lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]'">
      <section id="tus-repasos" class="tarjeta-inicio scroll-mt-4" style="--acento: 209 47 58; --acento2: 124 58 237" aria-labelledby="titulo-tus-repasos">
        <div class="flex items-center gap-2.5 mb-2.5">
          <h2 id="titulo-tus-repasos" class="titulo-tarjeta">Tus repasos</h2>
          <label class="buscar-repaso hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-base-borde-sutil text-[13px] text-base-texto-secundario">
            <Search :size="15" aria-hidden="true" />
            <span class="sr-only">Buscar un tema</span>
            <input v-model="busqueda" type="search" placeholder="Buscar un tema" class="w-32 bg-transparent outline-none text-base-texto-primario placeholder:text-base-texto-secundario">
          </label>
        </div>

        <div v-show="!busqueda" class="flex flex-wrap gap-1.5 mb-1.5" role="group" aria-label="Qué repasos ver">
          <button v-for="p in PESTANAS" :key="p.id" ref="pestanas" type="button" class="pestana-repasos" :aria-pressed="pestana === p.id" @click="pestana = p.id">
            <span class="hidden sm:inline">{{ p.texto }}</span><span class="sm:hidden">{{ p.corto }}</span><template v-if="p.id !== 'modulo'"> · {{ grupos[p.id].length }}</template>
          </button>
        </div>

        <!-- Buscando: todos los que coinciden. -->
        <ul v-if="busqueda" class="m-0 p-0 list-none">
          <EstudianteRepasosFilaRepaso v-for="r in encontrados" :key="r.id" v-bind="fila(r)" />
          <li v-if="!encontrados.length" class="py-3 px-1.5 border-t border-base-borde-sutil text-sm text-base-texto-secundario">Ningún tema se llama así.</li>
        </ul>

        <!-- Por módulo: cada módulo recogido, con cuántos tiene. -->
        <template v-else-if="pestana === 'modulo'">
          <details v-for="m in porModulo" :key="m.nombre" class="border-t border-base-borde-sutil">
            <summary class="resumen-grupo"><span class="flex-1 text-[15px] font-bold">{{ m.nombre }}</span><span class="pastilla-grupo">{{ m.items.length }}</span><ChevronDown :size="16" aria-hidden="true" /></summary>
            <ul class="m-0 p-0 list-none"><EstudianteRepasosFilaRepaso v-for="r in m.items" :key="r.id" v-bind="fila(r)" /></ul>
          </details>
        </template>

        <template v-else>
          <ul class="m-0 p-0 list-none">
            <EstudianteRepasosFilaRepaso v-for="r in grupos[pestana]" :key="r.id" v-bind="fila(r)" />
            <li v-if="!grupos[pestana].length" class="py-3 px-1.5 border-t border-base-borde-sutil text-sm text-base-texto-secundario">{{ VACIO[pestana] }}</li>
          </ul>
          <!-- En «Vencen hoy», lo que viene, recogido (cuadro: «Mañana» y «Resto de la semana»). -->
          <template v-if="pestana === 'hoy'">
            <details v-for="g in proximos" :key="g.nombre" class="border-t border-base-borde-sutil">
              <summary class="resumen-grupo">
                <span class="flex-1 text-[15px] font-bold">{{ g.nombre }}</span>
                <span class="hidden sm:inline text-[13px] text-base-texto-secundario">{{ resumenNombres(g.items.map((r) => r.conceptTitle)) }}</span>
                <span class="pastilla-grupo">{{ g.items.length }}</span><ChevronDown :size="16" aria-hidden="true" />
              </summary>
              <ul class="m-0 p-0 list-none"><EstudianteRepasosFilaRepaso v-for="r in g.items" :key="r.id" v-bind="fila(r)" /></ul>
            </details>
          </template>
        </template>

        <p class="m-0 mt-3 text-[13px] text-base-texto-secundario">
          Las casillas dicen qué tan firme está el recuerdo: cada repaso bien hecho suma una.
          <Termino palabra="Repetición espaciada">Repasar justo cuando empiezas a olvidar</Termino> hace que lo recuerdes por más tiempo.
        </p>
        <p v-if="hayDominadas" class="m-0 mt-1.5 text-[13px] text-base-texto-secundario">
          Las lecciones que ya dominaste <strong class="text-base-texto-primario">siguen dominadas</strong>: dejar pasar el repaso no te baja el dominio. El repaso es para que no se te olviden.
        </p>
      </section>

      <EstudianteRepasosAsiFuncionan />
    </div>

    <div v-else-if="studentStore.hasLoaded" class="tarjeta-inicio text-center space-y-3" style="--acento: 0 194 168; --acento2: 92 203 255">
      <span class="flex justify-center" aria-hidden="true"><TutorMascota expresion="acierto" :tamano="72" /></span>
      <h2 class="titulo-tarjeta">Estás al día con tus repasos</h2>
      <p class="m-0 text-sm text-base-texto-secundario max-w-md mx-auto">
        Lo que ya practicaste volverá aquí cuando toque repasarlo. Mientras tanto, sigue con la lección que tienes en curso.
      </p>
      <NuxtLink to="/estudiante" class="boton-practicar inline-flex min-h-[44px]">Ir a mi siguiente paso</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ChevronDown, ChevronRight, Search } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import type { SpacedReviewItem } from '~/types'
import { presentarRepaso } from '~/utils/repasos'
import { agruparRepasos, CLAVE_COLA, cuandoToca, firmeza, grupoDe, portadaRepasos, resumenNombres, type GrupoRepaso } from '~/utils/repasosV3'
import { ubicacionLeccion } from '~/utils/leccionV3'

definePageMeta({ layout: 'student' })

const studentStore = useStudentStore()
const lista = computed(() => studentStore.reviews)
const grupos = computed(() => agruparRepasos(lista.value))
const portada = computed(() => portadaRepasos(grupos.value))
const dominioPorLeccion = computed(() => new Map(studentStore.analytics.masteryByUnit.map((m) => [m.unitId, m.mastery])))
const hayDominadas = computed(() => lista.value.some((r) => (dominioPorLeccion.value.get(r.learningUnitId) ?? 0) >= 85))
const { plegado: recogida } = usePanelPlegable('stire.repasos.explicacionRecogida')

// En el celular, las pestañas con nombre corto (cuadro «E-Cel-Repasos»).
const CONTADORES: Array<{ grupo: GrupoRepaso; texto: string; corto: string }> = [
  { grupo: 'hoy', texto: 'Vencen hoy', corto: 'Hoy' }, { grupo: 'semana', texto: 'Esta semana', corto: 'Semana' }, { grupo: 'adelante', texto: 'Más adelante', corto: 'Después' },
]
const PESTANAS: Array<{ id: GrupoRepaso | 'modulo'; texto: string; corto: string }> = [...CONTADORES.map((c) => ({ id: c.grupo, texto: c.texto, corto: c.corto })), { id: 'modulo', texto: 'Por módulo', corto: 'Módulos' }]
const VACIO: Record<GrupoRepaso, string> = {
  hoy: 'Hoy no vence ninguno. Si quieres adelantar, mira los de la semana.',
  semana: 'Esta semana no vuelve ningún otro tema.',
  adelante: 'Nada más adelante por ahora.',
}
// Con algo para hoy se abre en «Vencen hoy»; si no, en lo que venga primero.
const elegida = ref<GrupoRepaso | 'modulo' | null>(null)
const pestana = computed<GrupoRepaso | 'modulo'>({
  get: () => elegida.value ?? (grupos.value.hoy.length ? 'hoy' : grupos.value.semana.length ? 'semana' : grupos.value.adelante.length ? 'adelante' : 'hoy'),
  set: (v) => { elegida.value = v },
})
const busqueda = ref('')

const lugar = (r: SpacedReviewItem) => { const u = ubicacionLeccion(studentStore.modules, r.learningUnitId); return u.tema ?? u.modulo }
function fila(r: SpacedReviewItem) {
  const dominada = presentarRepaso(r.urgency, r.urgencyLabel, dominioPorLeccion.value.get(r.learningUnitId)).dominada
  const hoy = grupoDe(r) === 'hoy'
  return { titulo: r.conceptTitle, lugar: lugar(r), llenas: firmeza(r.repeticiones), cuando: dominada && hoy ? 'Dominada ✓ · repaso corto' : cuandoToca(r.diasHasta, r.diaRepaso), hoy, dominada, learningUnitId: r.learningUnitId }
}
const proximos = computed(() => [
  { nombre: 'Mañana', items: grupos.value.semana.filter((r) => r.diasHasta === 1) },
  { nombre: 'Resto de la semana', items: grupos.value.semana.filter((r) => (r.diasHasta ?? 0) > 1) },
].filter((g) => g.items.length))
const porModulo = computed(() => {
  const m = new Map<string, SpacedReviewItem[]>()
  for (const r of [...grupos.value.hoy, ...grupos.value.semana, ...grupos.value.adelante]) {
    const nombre = ubicacionLeccion(studentStore.modules, r.learningUnitId).modulo ?? 'Otros temas'
    m.set(nombre, [...(m.get(nombre) ?? []), r])
  }
  return [...m].map(([nombre, items]) => ({ nombre, items }))
})
const encontrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase()
  return lista.value.filter((r) => `${r.conceptTitle} ${lugar(r) ?? ''}`.toLowerCase().includes(q))
})

const enlace = (id: number) => `/estudiante/unidad/${id}#ejercicios`
/** «Repasar los N seguidos»: la lección muestra «Repaso 1 de N» y lleva a la siguiente (components/estudiante/ColaRepasos.vue). */
function empezarCola() {
  const ids = [...new Set(grupos.value.hoy.map((r) => r.learningUnitId))]
  try { sessionStorage.setItem(CLAVE_COLA, JSON.stringify(ids)) } catch { /* sin almacenamiento: se repasa uno */ }
}
const pestanas = ref<HTMLButtonElement[]>([])
function verPestana(g: GrupoRepaso) {
  busqueda.value = ''
  pestana.value = g
  document.getElementById('tus-repasos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function elegirYo() {
  verPestana(pestana.value === 'modulo' ? 'hoy' : pestana.value)
  nextTick(() => pestanas.value[0]?.focus({ preventScroll: true }))
}

onMounted(() => {
  studentStore.fetchStudentData()
})
</script>

<style scoped>
.globo-repasos { padding: 10px 14px; border-radius: 14px 14px 14px 4px; background: var(--heroe-pista); }
.contador-repasos { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 14px; min-height: 44px; color: #14213d; transition: transform 0.15s ease; }
.contador-repasos:hover { transform: translateX(-2px); }
.contador-hoy { background: #ffc94d; }
.contador-semana { background: rgba(255, 255, 255, 0.85); }
.contador-adelante { background: rgba(255, 255, 255, 0.6); }
:root[data-tema="oscuro"] .contador-semana, :root[data-tema="oscuro"] .contador-adelante { background: rgba(255, 255, 255, 0.12); color: #e8f6ff; }
.pestana-repasos { min-height: 44px; padding: 0 12px; border-radius: 999px; font-size: 13px; font-weight: 700; background: rgb(var(--c-base-bg-secundario)); color: rgb(var(--c-base-texto-primario)); transition: background-color 0.15s ease; }
@media (min-width: 640px) { .pestana-repasos { min-height: 34px; } }
.pestana-repasos[aria-pressed="true"] { background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco)); }
.resumen-grupo { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 8px 6px; color: rgb(var(--c-base-texto-secundario)); }
.resumen-grupo::-webkit-details-marker { display: none; }
.resumen-grupo > span:first-child { color: rgb(var(--c-base-texto-primario)); }
details[open] > .resumen-grupo svg { transform: rotate(180deg); }
.pastilla-grupo { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; background: rgb(var(--c-base-bg-secundario)); color: rgb(var(--c-base-texto-primario)); }
.buscar-repaso:focus-within { border-color: #00c2a8; }
</style>
