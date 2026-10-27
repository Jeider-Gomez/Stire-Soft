<template>
  <!-- «Mis clases» en lista (prototipo del panel v2): para quien tiene muchas clases y quiere compararlas de un vistazo. -->
  <div class="overflow-x-auto rounded-2xl border border-base-borde-sutil bg-base-blanco">
    <table class="w-full text-sm">
      <thead class="text-left text-[11px] uppercase tracking-wide text-base-texto-secundario">
        <tr class="border-b border-base-borde-sutil">
          <th class="px-4 py-2.5 font-semibold">Clase</th>
          <th class="px-3 py-2.5 font-semibold">Estudiantes</th>
          <th class="px-3 py-2.5 font-semibold">Dominio</th>
          <th class="px-3 py-2.5 font-semibold">Necesitan apoyo</th>
          <th class="px-3 py-2.5 font-semibold">Código</th>
          <th class="px-3 py-2.5"><span class="sr-only">Abrir</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in clases" :key="c.id" class="border-b border-base-borde-sutil last:border-0 hover:bg-base-bg-secundario/50">
          <td class="px-4 py-2.5">
            <div class="flex items-center gap-2.5 min-w-0">
              <span aria-hidden="true" class="shrink-0 w-7 h-7 rounded-md grid place-items-center text-[9px] font-bold font-mono text-white" :style="{ backgroundColor: colores[c.id] }">{{ siglas[c.id] }}</span>
              <span class="min-w-0"><b class="block truncate text-base-texto-primario">{{ c.name }}</b>
                <span v-if="c.grupo || c.periodo" class="block text-xs text-base-texto-secundario">{{ [c.grupo, c.periodo].filter(Boolean).join(' · ') }}</span></span>
            </div>
          </td>
          <td class="px-3 py-2.5 tabular-nums">{{ c.enrollmentCount ?? 0 }}</td>
          <td class="px-3 py-2.5 tabular-nums">{{ c.avgMastery !== undefined && c.enrollmentCount ? porcentaje(c.avgMastery) : '—' }}</td>
          <td class="px-3 py-2.5 tabular-nums" :class="c.atRiskCount ? 'text-amber-800 font-semibold' : 'text-base-texto-secundario'">{{ c.atRiskCount ?? 0 }}</td>
          <td class="px-3 py-2.5"><span class="font-mono text-xs font-bold text-stire-blue">{{ c.code }}</span></td>
          <td class="px-3 py-2.5 text-right">
            <NuxtLink :to="`/docente/clase/${c.id}`" class="inline-flex items-center min-h-[44px] px-3 rounded-lg text-xs font-semibold text-teal-800 hover:bg-teal-50 whitespace-nowrap">Entrar</NuxtLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { porcentaje } from '~/utils/porcentaje'
import type { ClaseDelDocente } from '~/composables/useClasesDocente'

defineProps<{ clases: ClaseDelDocente[]; colores: Record<number, string>; siglas: Record<number, string> }>()
</script>
