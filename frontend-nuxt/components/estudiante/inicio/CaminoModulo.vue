<!-- «Tu camino en el módulo» (v3, Fase D; cuadro «E-Inicio»): las lecciones del módulo en el que va, como pasos sobre una
     línea que se llena hasta donde está. Cada paso dice su estado con ícono Y texto, nunca solo con el color. El plan
     completo del curso sigue en «Aprender». -->
<template>
  <section v-if="modulo && lecciones.length" class="tarjeta-camino" aria-labelledby="titulo-camino">
    <div class="flex items-center gap-3 mb-2">
      <h2 id="titulo-camino" class="m-0 flex-1 text-xs font-bold tracking-[0.06em] uppercase text-base-texto-secundario">
        <span v-if="!moduloId" class="sm:hidden">Sigue donde ibas</span><span :class="moduloId ? '' : 'hidden sm:inline'">Tu camino en {{ nombreModulo }}</span>
      </h2>
      <NuxtLink v-if="!moduloId" to="/estudiante/aprender" class="min-h-[44px] inline-flex items-center gap-1 text-sm font-semibold underline">
        Ver todo el curso <ChevronRight :size="15" aria-hidden="true" />
      </NuxtLink>
    </div>
    <!-- En el celular (cuadro «E-Cel-Inicio»): solo la lección en la que va, con su barra. -->
    <NuxtLink v-if="aqui" :to="`/estudiante/unidad/${aqui.id}`" class="sm:hidden block rounded-xl -mx-1 px-1 py-1">
      <span class="block font-poppins font-bold text-[17px] leading-snug">{{ aqui.titulo }}</span>
      <span class="block my-2 h-2 rounded-full bg-base-bg-secundario overflow-hidden" aria-hidden="true">
        <span class="block h-full rounded-full linea-llena" :style="{ width: `${aqui.dominio}%` }" />
      </span>
      <span class="block text-[13px] text-base-texto-secundario">{{ aqui.dominio }} % de dominio · {{ nombreModulo }}, lección {{ aqui.numero }} de {{ lecciones.length }}</span>
    </NuxtLink>
    <div class="overflow-x-auto -mx-2 px-2 pt-2 pb-1" :class="aqui ? 'hidden sm:block' : ''">
      <nav aria-label="Lecciones del módulo"><ol class="relative flex justify-between gap-2 m-0 p-0 list-none" :style="{ minWidth: `${lecciones.length * 112}px` }">
        <span class="absolute left-6 right-6 top-[22px] h-1 rounded-full bg-base-borde-sutil" aria-hidden="true" />
        <span class="linea-llena absolute left-6 top-[22px] h-1 rounded-full" :style="{ width: `calc((100% - 48px) * ${llenado})` }" aria-hidden="true" />
        <li v-for="u in lecciones" :key="u.id" class="relative w-[112px] flex-none">
          <NuxtLink :to="`/estudiante/unidad/${u.id}`" class="paso-enlace flex flex-col items-center gap-2 text-center rounded-xl pb-1">
            <span class="paso-camino" :class="CLASE[u.estado]">
              <Check v-if="u.estado === 'hecho'" :size="20" aria-hidden="true" />
              <BookOpen v-else :size="18" aria-hidden="true" />
            </span>
            <span class="text-xs leading-snug" :class="u.estado === 'aqui' ? 'font-bold' : 'font-medium'">{{ u.titulo }}</span>
            <span v-if="u.estado === 'aqui'" class="text-[11px] font-bold text-semantico-pasa etiqueta-aqui">Estás aquí</span>
            <span v-else class="sr-only">{{ TEXTO[u.estado] }}</span>
            <span v-if="u.estado === 'empezado'" class="text-[11px] font-semibold text-base-texto-secundario" aria-hidden="true">{{ u.dominio }} %</span>
          </NuxtLink>
        </li>
      </ol></nav>
    </div>
    <!-- El módulo siguiente con candado suave (utils/bloqueoModulos.ts): cuánto falta para abrirlo. -->
    <p v-if="studentStore.proximoModulo" class="m-0 mt-3 pt-3 border-t border-base-borde-sutil flex items-center gap-2 text-[13px] text-base-texto-secundario">
      <Lock :size="15" class="shrink-0" aria-hidden="true" />
      <span>«{{ corto(studentStore.proximoModulo.modulo.titulo) }}» se abre con {{ studentStore.proximoModulo.umbral }} % de
        <Termino palabra="Dominio">dominio</Termino> en «{{ corto(studentStore.proximoModulo.anterior.titulo) }}». Vas en {{ studentStore.proximoModulo.dominio }} %.</span>
    </p>
  </section>
</template>

<script setup lang="ts">
import { BookOpen, Check, ChevronRight, Lock } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'

type Estado = 'hecho' | 'aqui' | 'empezado' | 'pendiente'
const CLASE: Record<Estado, string> = { hecho: 'paso-hecho', aqui: 'paso-aqui', empezado: 'paso-empezado', pendiente: 'paso-pendiente' }
const TEXTO: Record<Estado, string> = { hecho: '(dominada)', aqui: '(estás aquí)', empezado: '(en práctica)', pendiente: '(sin empezar)' }

/** En «Aprender», el módulo elegido; en el Inicio (sin prop), el de la lección en curso. */
const props = defineProps<{ moduloId?: number | null }>()
const studentStore = useStudentStore()
/** El módulo de la lección en curso; sin ella, el primero que no está completo. */
const modulo = computed(() => {
  const activa = studentStore.activeUnit?.id
  const mods = studentStore.modules
  if (props.moduloId) return mods.find((m) => m.id === props.moduloId) ?? null
  return (activa ? mods.find((m) => m.units.some((u) => u.id === activa)) : null)
    ?? mods.find((m) => m.units.some((u) => u.status !== 'dominado')) ?? mods[0] ?? null
})
/** «Módulo 1: Fundamentos» o «Unidad 1 · Introducción» → «Módulo 1», «Unidad 1»: el título completo ya está en el plan. */
const corto = (titulo: string) => titulo.split(/\s*[:·–]\s*|\s-\s/)[0]!.trim()
const nombreModulo = computed(() => (modulo.value ? corto(modulo.value.title) : ''))

const lecciones = computed(() => (modulo.value?.units ?? []).map((u) => {
  const estado: Estado = u.id === studentStore.activeUnit?.id ? 'aqui' : u.status === 'dominado' ? 'hecho' : u.empezada ? 'empezado' : 'pendiente'
  return { id: u.id, titulo: u.title, estado, dominio: u.masteryPercentage }
}))
/** La lección en la que va, para el celular. */
const aqui = computed(() => {
  const i = lecciones.value.findIndex((u) => u.estado === 'aqui')
  return i >= 0 ? { ...lecciones.value[i]!, numero: i + 1 } : null
})
/** La línea se llena hasta la lección en la que va (o hasta la última dominada si no hay una en curso). */
const llenado = computed(() => {
  const n = lecciones.value.length
  if (n < 2) return 0
  const aqui = lecciones.value.findIndex((u) => u.estado === 'aqui')
  const ultima = aqui >= 0 ? aqui : lecciones.value.map((u) => u.estado).lastIndexOf('hecho')
  return Math.max(0, ultima) / (n - 1)
})
</script>

<style scoped>
.tarjeta-camino {
  padding: 18px 22px 14px;
  border-radius: 20px;
  background: rgb(var(--c-base-blanco));
  border: 1px solid rgb(var(--c-base-borde-sutil));
}
.paso-enlace:hover > span:nth-child(2) { text-decoration: underline; text-underline-offset: 3px; }
.linea-llena { background: #00c2a8; transition: width 0.9s cubic-bezier(0.23, 1, 0.32, 1); }
:root[data-tema='oscuro'] .etiqueta-aqui { color: rgb(var(--c-sec-menta-icono)); }
</style>
