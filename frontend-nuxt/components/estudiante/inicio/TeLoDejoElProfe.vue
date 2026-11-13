<!-- «Te lo dejó el profe» (v3, Fase D; cuadro «E-Inicio»): el refuerzo o reto sin terminar que preparó el docente, con
     sus pasos como barras y la fecha. Es lo que alguien preparó para el estudiante (§4.2): tiene su propio lugar. -->
<template>
  <section class="tarjeta-inicio" style="--acento: var(--c-sec-cielo); --acento2: var(--c-sec-sol)" aria-labelledby="titulo-te-lo-dejo">
    <div class="flex items-center gap-2.5 mb-3">
      <h2 id="titulo-te-lo-dejo" class="titulo-tarjeta">Te lo dejó el profe</h2>
      <span v-if="r" class="pastilla-inicio" :class="r.tipo === 'reto' ? 'pastilla-sol' : 'pastilla-menta'">{{ r.tipo === 'reto' ? 'Reto' : 'Refuerzo' }}</span>
    </div>

    <template v-if="r">
      <p class="m-0 mb-1 text-base font-bold">{{ r.titulo }}</p>
      <p v-if="r.mensaje" class="m-0 mb-3 text-sm text-base-texto-secundario leading-relaxed line-clamp-3">«{{ r.mensaje }}»</p>
      <div class="flex gap-1.5 mb-2" aria-hidden="true">
        <span v-for="i in r.totalPasos" :key="i" class="flex-1 h-2 rounded-full" :class="i <= r.pasosHechos ? 'barra-hecha' : 'bg-base-borde-sutil'" />
      </div>
      <p class="m-0 mb-3 text-[13px] text-base-texto-secundario">
        {{ r.pasosHechos }} de {{ r.totalPasos }} {{ r.totalPasos === 1 ? 'paso' : 'pasos' }}<template v-if="r.fechaLimite"> · hasta el {{ dia(r.fechaLimite) }}</template>
      </p>
      <NuxtLink :to="`/estudiante/refuerzos/${r.id}`" class="boton-tarjeta">{{ r.pasosHechos ? 'Seguir' : 'Empezar' }} {{ r.tipo === 'reto' ? 'el reto' : 'el refuerzo' }}</NuxtLink>
      <p v-if="otros > 0" class="m-0 mt-2 text-xs text-base-texto-secundario text-center">Cuando lo termines aparece {{ otros === 1 ? 'el otro' : `el siguiente de ${otros + 1}` }}.</p>
    </template>

    <p v-else class="m-0 py-2 text-sm text-base-texto-secundario leading-relaxed">
      Cuando tu docente te prepare un refuerzo o un reto, aparece aquí con sus pasos.
    </p>
  </section>
</template>

<script setup lang="ts">
import type { RefuerzoInicioEstudiante } from '~/composables/useInicioEstudiante'

const props = defineProps<{ refuerzos: RefuerzoInicioEstudiante[] }>()
/** El que vence primero; sin fecha, el primero de la lista. */
const ordenados = computed(() => [...props.refuerzos].sort((a, b) => (a.fechaLimite ?? '9999').localeCompare(b.fechaLimite ?? '9999')))
const r = computed(() => ordenados.value[0] ?? null)
const otros = computed(() => Math.max(0, props.refuerzos.length - 1))
const dia = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric' })
</script>

<style scoped>
.barra-hecha { background: #00c2a8; }
</style>
