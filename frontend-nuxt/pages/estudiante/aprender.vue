<template>
  <!-- «Aprender» (v3, Fase D; cuadro «E-Aprender» del lienzo): el curso entero para elegir por dónde seguir. Arriba, los
       filtros y «Seguir donde ibas»; el camino del módulo elegido; y el plan (components/estudiante/PlanCurso.vue). -->
  <div class="flex flex-col gap-[18px]">
    <div class="flex flex-wrap items-end gap-3 sm:gap-4">
      <div class="flex-1 min-w-[240px]">
        <h1 class="m-0 font-poppins font-bold text-[26px] sm:text-[30px] leading-tight">{{ curso }}</h1>
        <p class="mt-1 mb-0 text-[15px] text-base-texto-secundario">Módulo → Tema → Lección. Entras a la que quieras.</p>
      </div>
      <div role="group" aria-label="Qué lecciones ver" class="flex gap-1.5">
        <button v-for="f in FILTROS" :key="f.clave" type="button" class="filtro-aprender" :aria-pressed="filtro === f.clave" @click="filtro = f.clave">
          {{ f.texto }}
        </button>
      </div>
      <NuxtLink v-if="studentStore.activeUnit" :to="`/estudiante/unidad/${studentStore.activeUnit.id}`" class="boton-tinta inline-flex">
        Seguir donde ibas <ChevronRight :size="17" aria-hidden="true" />
      </NuxtLink>
    </div>

    <p v-if="!studentStore.hasLoaded" class="m-0 text-sm text-base-texto-secundario" role="status">Cargando el plan del curso…</p>
    <template v-else>
      <EstudianteInicioCaminoModulo v-if="modulo" :modulo-id="modulo" />
      <EstudiantePlanCurso v-model:modulo="modulo" :filtro="filtro" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import type { FiltroAprender } from '~/utils/contenidoCurso'

definePageMeta({ layout: 'student' })

const FILTROS: Array<{ clave: FiltroAprender; texto: string }> = [
  { clave: 'todas', texto: 'Todas' },
  { clave: 'faltan', texto: 'Me faltan' },
  { clave: 'repasar', texto: 'Para repasar' },
]

const studentStore = useStudentStore()
const filtro = ref<FiltroAprender>('todas')
const curso = computed(() => studentStore.currentClassLabel || studentStore.currentClassName || 'Aprender')

/** El módulo elegido: al entrar, el de la lección en curso o el primero sin terminar. */
const modulo = ref<number | null>(null)
watch(() => [studentStore.modules.length, studentStore.activeUnit?.id], () => {
  if (modulo.value && studentStore.modules.some((m) => m.id === modulo.value)) return
  const activa = studentStore.activeUnit?.id
  const mods = studentStore.modules
  modulo.value = (activa ? mods.find((m) => m.units.some((u) => u.id === activa)) : null)?.id
    ?? mods.find((m) => m.units.some((u) => u.status !== 'dominado'))?.id ?? mods[0]?.id ?? null
}, { immediate: true })

onMounted(() => {
  if (!studentStore.hasLoaded) studentStore.fetchStudentData()
})
</script>
