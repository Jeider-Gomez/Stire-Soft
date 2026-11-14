<template>
  <!-- «Todo el curso» (cuadro «E-Progreso»): el módulo en que va, abierto, con sus temas en columnas y una tarjeta por lección
       (terminada, empezada con su % o sin empezar); los demás, recogidos, con una casilla por lección. Cada estado se dice con
       texto, no solo con el color. Cada tarjeta lleva a su lección. -->
  <section class="tarjeta-inicio" style="--acento: 0 194 168; --acento2: 92 203 255" aria-labelledby="titulo-todo-el-curso">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
      <h2 id="titulo-todo-el-curso" class="titulo-tarjeta">Todo el curso</h2>
      <ul class="flex flex-wrap gap-x-3.5 gap-y-1 m-0 p-0 list-none text-[13px] font-semibold" aria-label="Qué significa cada color">
        <li class="inline-flex items-center gap-1.5"><span class="punto-mapa bg-[#00c2a8]" />Terminada</li>
        <li class="inline-flex items-center gap-1.5"><span class="punto-mapa bg-[#ffc94d]" />Empezada</li>
        <li class="inline-flex items-center gap-1.5"><span class="punto-mapa border-2 border-dashed border-base-borde-fuerte" />Sin empezar</li>
      </ul>
    </div>

    <p v-if="!modulos.length" class="m-0 text-sm text-base-texto-secundario">Cuando tu profesor publique el curso, aquí verás cada lección y cómo vas en ella.</p>

    <div class="space-y-2.5">
      <details v-for="(m, mi) in modulos" :key="m.id" class="modulo-mapa group" :class="{ actual: m.id === actualId }" :open="m.id === actualId">
        <summary class="flex flex-wrap items-center gap-x-3 gap-y-1.5 cursor-pointer list-none min-h-[44px] px-3.5 py-2.5">
          <span class="flex-1 min-w-[200px]">
            <span class="block text-[15px] font-bold">Módulo {{ mi + 1 }} · {{ m.title }}</span>
            <span v-if="m.id !== actualId" class="mt-1 flex flex-wrap items-center gap-2 text-xs text-base-texto-secundario">
              <span class="flex gap-[3px]" aria-hidden="true"><span v-for="l in m.units" :key="l.id" class="casilla-mapa" :class="estadoTarjeta(l)" /></span>
              <template v-if="cerrado(m.id)"><Lock :size="12" aria-hidden="true" /> Se abre al dominar el módulo anterior. Tu profesor puede abrirlo antes.</template>
              <template v-else>{{ m.topics.length }} {{ m.topics.length === 1 ? 'tema' : 'temas' }} · empieza con «{{ m.units[0]?.title }}»</template>
            </span>
          </span>
          <span class="flex items-center gap-2.5 text-[13px] text-base-texto-secundario">
            {{ terminadas(m) }} de {{ m.units.length }}<template v-if="m.id === actualId"> terminadas</template>
            <span v-if="m.id === actualId" class="hidden sm:flex w-24 h-2 rounded-full overflow-hidden bg-base-bg-secundario" aria-hidden="true">
              <span class="bg-[#00c2a8]" :style="{ width: `${pct(terminadas(m), m)}%` }" /><span class="bg-[#ffc94d]" :style="{ width: `${pct(empezadas(m), m)}%` }" />
            </span>
            <ChevronDown :size="16" class="transition-transform group-open:rotate-180" aria-hidden="true" />
          </span>
        </summary>

        <div class="grid gap-3 px-3.5 pb-3.5" :style="{ gridTemplateColumns: `repeat(auto-fit, minmax(170px, 1fr))` }">
          <div v-for="(t, ti) in m.topics" :key="t.id" class="min-w-0 space-y-2">
            <p class="m-0 text-[11px] font-bold uppercase tracking-wide text-base-texto-secundario min-h-[30px]">Tema {{ ti + 1 }} · {{ t.title }}</p>
            <NuxtLink v-for="l in t.units" :key="l.id" :to="`/estudiante/unidad/${l.id}`" class="tarjeta-leccion-mapa" :class="estadoTarjeta(l)">
              <span class="block text-[11px] font-bold">{{ ROTULO[estadoTarjeta(l)] }}<template v-if="estadoTarjeta(l) === 'empezada'"> · {{ l.masteryPercentage }} %</template></span>
              <span class="block text-sm font-bold leading-snug">{{ l.title }}</span>
              <span class="block mt-2 h-1.5 rounded-full barra-mapa" aria-hidden="true"><span class="block h-full rounded-full" :style="{ width: `${estadoTarjeta(l) === 'terminada' ? 100 : l.masteryPercentage}%` }" /></span>
            </NuxtLink>
          </div>
        </div>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown, Lock } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { estadoTarjeta, moduloActual } from '~/utils/progresoV3'

const studentStore = useStudentStore()
const modulos = computed(() => studentStore.modules)
const actualId = computed(() => moduloActual(modulos.value)?.id ?? null)
const ROTULO = { terminada: '✓ Terminada', empezada: 'Empezada', 'sin-empezar': 'Sin empezar' } as const

type M = (typeof modulos.value)[number]
const terminadas = (m: M) => m.units.filter((l) => estadoTarjeta(l) === 'terminada').length
const empezadas = (m: M) => m.units.filter((l) => estadoTarjeta(l) === 'empezada').length
const pct = (n: number, m: M) => (m.units.length ? Math.round((n / m.units.length) * 100) : 0)
const cerrado = (id: number) => studentStore.estadoModulo(id)?.abierto === false
</script>

<style scoped>
.punto-mapa { width: 12px; height: 12px; border-radius: 4px; display: inline-block; }
.modulo-mapa { border: 1px solid rgb(var(--c-base-borde-sutil)); border-radius: 14px; background: rgb(var(--c-base-blanco)); }
.modulo-mapa.actual { border: 2px solid rgb(var(--c-base-texto-primario)); }
.modulo-mapa > summary::-webkit-details-marker { display: none; }
.casilla-mapa { width: 12px; height: 12px; border-radius: 3px; border: 1.5px solid rgb(var(--c-base-borde-fuerte)); }
.casilla-mapa.terminada { background: #00c2a8; border-color: #00c2a8; }
.casilla-mapa.empezada { background: #ffc94d; border-color: #ffc94d; }

.tarjeta-leccion-mapa { display: block; padding: 10px 12px; border-radius: 12px; color: rgb(var(--c-base-texto-primario)); transition: transform 0.18s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.18s ease; }
@media (hover: hover) { .tarjeta-leccion-mapa:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(20, 33, 61, 0.1); } }
.tarjeta-leccion-mapa.terminada { background: linear-gradient(135deg, #00c2a8, #5ccbff); color: #0b2b3f; }
.tarjeta-leccion-mapa.empezada { background: rgb(var(--c-sec-sol-fondo)); box-shadow: inset 0 0 0 1.5px #ffc94d; }
.tarjeta-leccion-mapa.sin-empezar { border: 1.5px dashed rgb(var(--c-base-borde-fuerte)); }
.barra-mapa { background: rgba(255, 255, 255, 0.55); }
.terminada .barra-mapa > span { background: rgba(255, 255, 255, 0.9); }
.empezada .barra-mapa { background: rgb(var(--c-base-blanco)); }
.empezada .barra-mapa > span { background: #e5a100; }
.sin-empezar .barra-mapa { background: rgb(var(--c-base-bg-secundario)); }
@media (prefers-reduced-motion: reduce) { .tarjeta-leccion-mapa { transition: none; } }
</style>
