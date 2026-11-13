<template>
  <!-- El plan del curso en «Aprender» (v3, Fase D; cuadro «E-Aprender»): a la izquierda los módulos con su avance; a la
       derecha los temas del elegido, plegables, con cada lección, su barra y su estado (ícono Y texto). «Repasar» solo en
       lo ya aprendido con el repaso vencido (MOD-02). El filtro viene de la página. -->
  <div class="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)] items-start">
    <div class="flex flex-col gap-2 min-w-0">
      <!-- En el celular, los módulos en una fila que se desliza (los temas quedan a la vista); desde lg, en columna. -->
      <nav aria-label="Módulos" class="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 lg:pb-0">
        <button v-for="(m, i) in studentStore.modules" :key="m.id" type="button" :aria-pressed="m.id === modulo"
          class="tarjeta-modulo text-left px-4 py-3.5 rounded-[14px] bg-base-blanco flex-none w-[230px] lg:w-auto" :class="{ elegido: m.id === modulo }" @click="emit('update:modulo', m.id)">
          <span class="flex items-center gap-1.5 text-xs font-bold uppercase text-base-texto-secundario">
            <Lock v-if="studentStore.estadoModulo(m.id)?.abierto === false" :size="12" aria-label="Cerrado" />
            Módulo {{ i + 1 }} · {{ contar(m.topics.length, 'tema') }}
          </span>
          <span class="block text-[15px] font-bold mt-0.5 mb-2 leading-snug">{{ sinNumero(m.title) }}</span>
          <span class="block h-1.5 rounded-full bg-base-borde-sutil overflow-hidden" aria-hidden="true">
            <span class="block h-full rounded-full barra-menta" :style="{ width: `${dominioDe(m.id)}%` }" />
          </span>
          <span class="block mt-1.5 text-xs text-base-texto-secundario">{{ dominioDe(m.id) }} % del módulo</span>
        </button>
      </nav>
      <section class="tarjeta-inicio !p-4 hidden lg:block" style="--acento: var(--c-sec-rosa); --acento2: var(--c-sec-lila)" aria-labelledby="como-se-arma">
        <h2 id="como-se-arma" class="m-0 mb-1 text-xs font-bold uppercase text-base-texto-secundario">Cómo se arma tu camino</h2>
        <p class="m-0 text-sm leading-relaxed">Tu docente decide el orden y qué se abre. STIRE te sugiere qué sigue según tu dominio y tus repasos, y siempre te dice por qué.</p>
      </section>
    </div>

    <div class="flex flex-col gap-3 min-w-0">
      <p v-if="!actual" class="m-0 p-8 text-center rounded-[18px] bg-base-blanco border border-base-borde-sutil text-sm text-base-texto-secundario">
        Tu docente todavía no ha publicado el contenido de este curso.
      </p>
      <p v-else-if="studentStore.estadoModulo(actual.id)?.requiere" class="m-0 p-5 rounded-[18px] bg-base-blanco border border-base-borde-sutil text-sm flex items-start gap-2.5">
        <Lock :size="18" class="shrink-0 mt-0.5" aria-hidden="true" />
        <span>Este módulo se abre con {{ studentStore.estadoModulo(actual.id)!.requiere!.umbral }} % de <Termino palabra="Dominio">dominio</Termino> en
          «{{ studentStore.estadoModulo(actual.id)!.requiere!.titulo }}». Vas en {{ studentStore.estadoModulo(actual.id)!.requiere!.dominio }} %: practica sus lecciones para abrirlo.</span>
      </p>
      <template v-else>
        <p v-if="!temas.length" class="m-0 p-6 text-center rounded-[18px] bg-base-blanco border border-base-borde-sutil text-sm text-base-texto-secundario">
          {{ filtro === 'repasar' ? 'Nada para repasar en este módulo por ahora.' : 'Ya dominas todas las lecciones de este módulo.' }}
        </p>
        <details v-for="tema in temas" :key="tema.id" class="tema-aprender group rounded-[16px] bg-base-blanco border border-base-borde-sutil overflow-hidden" :open="tema.abierto">
          <summary class="list-none cursor-pointer min-h-[52px] px-4 py-3 flex items-center gap-3">
            <span class="w-14 shrink-0 text-xs font-bold text-base-texto-secundario">TEMA {{ tema.n }}</span>
            <span class="flex-1 min-w-0 text-[15px] font-bold">{{ tema.titulo }}</span>
            <span class="pastilla-inicio" :class="PASTILLA[tema.estado]">{{ TEMA[tema.estado] }}</span>
            <ChevronDown :size="18" class="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <nav :aria-label="`Lecciones del tema ${tema.n}`"><ul class="m-0 px-2 pb-2 list-none">
            <li v-for="unit in tema.units" :key="unit.id">
              <NuxtLink :to="`/estudiante/unidad/${unit.id}`" class="fila-inicio !mx-0 !px-3 group/fila" :class="{ 'fila-actual': unit.id === studentStore.activeUnit?.id }">
                <span class="paso-camino !w-7 !h-7" :class="unit.status === 'dominado' ? 'paso-hecho' : unit.id === studentStore.activeUnit?.id ? 'paso-aqui !shadow-none' : unit.empezada ? 'paso-empezado !border-2' : 'paso-pendiente'" aria-hidden="true">
                  <Check v-if="unit.status === 'dominado'" :size="14" :stroke-width="3" />
                  <BookOpen v-else :size="13" />
                </span>
                <span class="flex-1 min-w-0">
                  <span class="group-hover/fila:underline">{{ unit.title }}</span><span class="sr-only">: {{ estadoLeccion(unit) }}</span>
                  <span v-if="unit.id === studentStore.activeUnit?.id" class="ml-1.5 text-[11px] font-bold texto-menta">Estás aquí</span>
                </span>
                <span v-if="debeRepasar(unit)" class="inline-flex items-center gap-1 text-[11px] font-semibold text-semantico-info shrink-0">
                  <RotateCcw :size="12" aria-hidden="true" /> Repasar
                </span>
                <span class="hidden md:block w-[110px] h-1.5 rounded-full bg-base-borde-sutil overflow-hidden shrink-0" aria-hidden="true">
                  <span class="block h-full rounded-full" :class="unit.status === 'dominado' ? 'barra-menta' : 'barra-sol'" :style="{ width: `${unit.masteryPercentage}%` }" />
                </span>
                <span class="w-10 text-right text-xs font-semibold text-base-texto-secundario shrink-0" aria-hidden="true">{{ unit.masteryPercentage }} %</span>
                <span class="hidden sm:inline pastilla-inicio" :class="PASTILLA[estadoCorto(unit)]" aria-hidden="true">{{ LECCION[estadoCorto(unit)] }}</span>
                <ChevronRight :size="16" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
              </NuxtLink>
            </li>
          </ul></nav>
        </details>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, Check, ChevronDown, ChevronRight, Lock, RotateCcw } from 'lucide-vue-next'
import { tocaRepasar } from '~/utils/progresoLeccion'
import { contar } from '~/utils/terminos'
import { useStudentStore } from '~/stores/student'
import type { LearningUnit } from '~/types'
import type { FiltroAprender } from '~/utils/contenidoCurso'

type Estado = 'hecho' | 'empezado' | 'nada'
const props = defineProps<{ modulo: number | null; filtro: FiltroAprender }>()
const emit = defineEmits<{ 'update:modulo': [id: number] }>()

const PASTILLA: Record<Estado, string> = { hecho: 'pastilla-menta', empezado: 'pastilla-sol', nada: 'pastilla-gris' }
const TEMA: Record<Estado, string> = { hecho: 'Dominado', empezado: 'Empezado', nada: 'Sin empezar' }
const LECCION: Record<Estado, string> = { hecho: 'Dominada', empezado: 'Empezada', nada: 'Sin empezar' }

const studentStore = useStudentStore()
const actual = computed(() => studentStore.modules.find((m) => m.id === props.modulo) ?? null)
const dominioDe = (id: number) => studentStore.estadoModulo(id)?.dominio ?? 0
/** «Unidad 1 · Introducción a la algoritmia» → «Introducción a la algoritmia»: el número ya va arriba. */
const sinNumero = (t: string) => t.split(/\s*[:·–]\s*|\s-\s/).slice(1).join(' · ') || t

// «Repasar» solo en lecciones ya aprendidas con el repaso vencido (utils/progresoLeccion.ts); en una lección sin
// dominio lo que toca es practicarla, no repasarla (revisión del 04/10, MOD-02).
const urgenciaPorLeccion = computed(() => new Map(studentStore.reviews.map((r) => [r.learningUnitId, r.urgency])))
const debeRepasar = (unit: { id: number; masteryPercentage: number }) => tocaRepasar(unit.masteryPercentage, urgenciaPorLeccion.value.get(unit.id))
const estadoCorto = (u: LearningUnit): Estado => (u.status === 'dominado' ? 'hecho' : u.empezada ? 'empezado' : 'nada')

/** Los temas del módulo elegido con el filtro; abierto el de la lección en curso o el primero sin terminar. */
const temas = computed(() => {
  const lista = (actual.value?.topics ?? []).map((t, i) => {
    const units = t.units.filter((u) => props.filtro === 'todas' || (props.filtro === 'faltan' ? u.status !== 'dominado' : debeRepasar(u)))
    const estados = t.units.map(estadoCorto)
    const estado: Estado = estados.every((e) => e === 'hecho') ? 'hecho' : estados.some((e) => e !== 'nada') ? 'empezado' : 'nada'
    return { id: t.id, n: i + 1, titulo: t.title, units, estado, abierto: props.filtro !== 'todas' || t.units.some((u) => u.id === studentStore.activeUnit?.id) }
  }).filter((t) => t.units.length)
  if (props.filtro === 'todas' && !lista.some((t) => t.abierto)) {
    const primero = lista.find((t) => t.estado !== 'hecho') ?? lista[0]
    if (primero) primero.abierto = true
  }
  return lista
})

function estadoLeccion(unit: LearningUnit) {
  if (unit.status === 'dominado') return `dominada, ${unit.masteryPercentage} %`
  if (unit.empezada) return `en práctica, ${unit.masteryPercentage} %`
  return 'sin empezar'
}
</script>

<style scoped>
.tarjeta-modulo { border: 1px solid rgb(var(--c-base-borde-sutil)); transition: border-color 0.15s ease, box-shadow 0.15s ease; }
.tarjeta-modulo:hover { border-color: rgb(var(--c-base-borde-fuerte)); }
.tarjeta-modulo.elegido { border: 2px solid rgb(var(--c-base-texto-primario)); }
.barra-menta { background: #00c2a8; }
.barra-sol { background: #ffc94d; }
.fila-actual { background: rgb(var(--c-sec-menta-fondo)); }
.texto-menta { color: rgb(var(--c-semantico-pasa)); }
:root[data-tema='oscuro'] .texto-menta { color: rgb(var(--c-sec-menta-icono)); }
</style>
