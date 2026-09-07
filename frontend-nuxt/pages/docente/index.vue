<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera DOC-V01 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Panel Docente • DOC-V01
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Mis Clases y Grupos Asignados
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Período Académico 2026-2 • Universidad de Córdoba
        </p>
      </div>

      <button
        class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors shadow-sm self-start sm:self-auto">
        + Crear Nueva Clase
      </button>
    </header>

    <!-- Lista de Clases a Cargo -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="cls in classes"
        :key="cls.id"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4 hover:border-acento-ambar-fuerte transition-colors">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="text-[10px] font-bold text-acento-ambar-fuerte uppercase tracking-wider block">
              Código: {{ cls.code }}
            </span>
            <h2 class="text-sm font-bold text-base-texto-primario mt-0.5">
              {{ cls.name }}
            </h2>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa">
            Activo
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center p-3 bg-base-bg-secundario rounded-lg text-xs">
          <div>
            <span class="text-base-texto-secundario text-[10px] block">Estudiantes</span>
            <span class="font-bold text-base-texto-primario">{{ cls.studentsCount }}</span>
          </div>
          <div>
            <span class="text-base-texto-secundario text-[10px] block">Dominio Prom.</span>
            <span class="font-bold text-semantico-pasa">{{ cls.avgMastery }}%</span>
          </div>
          <div>
            <span class="text-base-texto-secundario text-[10px] block">En Riesgo</span>
            <span class="font-bold text-semantico-falla">{{ cls.atRiskCount }}</span>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="flex items-center justify-between pt-2 border-t border-base-borde-sutil text-xs">
          <span class="text-base-texto-secundario text-[11px]">
            Horario: {{ cls.schedule }}
          </span>

          <button class="borde-afordancia px-3 py-1.5 rounded-md font-semibold text-base-texto-primario hover:bg-base-bg-secundario text-xs">
            Ver Cohorte
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'teacher'
})

const classes = ref([
  {
    id: 1,
    code: 'ALG-101-G1',
    name: 'Algoritmia y Programación I — Grupo 01',
    studentsCount: 28,
    avgMastery: 74.2,
    atRiskCount: 2,
    schedule: 'Lun / Mié 08:00 - 10:00'
  },
  {
    id: 2,
    code: 'EST-202-G2',
    name: 'Estructuras de Datos I — Grupo 02',
    studentsCount: 22,
    avgMastery: 68.5,
    atRiskCount: 4,
    schedule: 'Mar / Jue 14:00 - 16:00'
  }
])
</script>
