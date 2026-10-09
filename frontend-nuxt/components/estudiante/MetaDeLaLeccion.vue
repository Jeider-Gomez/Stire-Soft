<!-- Hacia dónde va el estudiante (09/10, Jeider: «no me dice el dominio recomendado para pasar a la siguiente lección, ni
     cuánto necesito para desbloquear el siguiente módulo»): la meta de la lección y, si el docente dejó el bloqueo suave,
     lo que pide el módulo para abrir el siguiente. Feed up de Hattie y Timperley (2007); BT-40. -->
<template>
  <div class="space-y-1 text-[11px] text-base-texto-primario">
    <p v-if="!soloModulo">
      <strong>Meta de la lección: {{ DOMINADO }} %</strong> (la línea de la barra). Puedes pasar a la siguiente cuando
      quieras; llegar a la meta es lo recomendado para avanzar con base.
    </p>
    <p v-if="meta" class="flex items-start gap-1.5">
      <Lock :size="13" class="shrink-0 mt-0.5 text-acento-ambar-fuerte" aria-hidden="true" />
      <span>
        El módulo «{{ corto(meta.siguiente) }}» se abre con <strong>{{ meta.umbral }} %</strong> de dominio promedio en
        «{{ corto(meta.modulo) }}». Vas en {{ meta.dominio }} %: te {{ meta.falta === 1 ? 'falta 1 punto' : `faltan ${meta.falta} puntos` }}.
        Cuenta cualquier lección del módulo.
      </span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { metaDelModulo } from '~/utils/bloqueoModulos'
import { DOMINADO } from '~/utils/terminos'

const props = defineProps<{ unitId: number; soloModulo?: boolean }>()
const studentStore = useStudentStore()
const meta = computed(() => metaDelModulo(studentStore.modules, studentStore.estadosModulos, props.unitId))
const corto = (t: string) => t.split(':')[0]
</script>
