<template>
  <div
    v-if="solicitud"
    id="aviso-rol-docente"
    role="status"
    class="p-4 rounded-xl border-2 border-l-8 flex items-start justify-between gap-3 shadow-sm"
    :class="{
      'bg-semantico-falla/10 border-semantico-falla text-semantico-falla': solicitud.status !== 'approved',
      'bg-semantico-pasa/10 border-semantico-pasa text-semantico-pasa': solicitud.status === 'approved'
    }">
    <div class="flex items-start gap-3">
      <ShieldAlert v-if="solicitud.status === 'pending'" :size="22" class="shrink-0" aria-hidden="true" />
      <BadgeCheck v-else-if="solicitud.status === 'approved'" :size="22" class="shrink-0" aria-hidden="true" />
      <AlertTriangle v-else :size="22" class="shrink-0" aria-hidden="true" />

      <div v-if="solicitud.status === 'pending'" class="space-y-0.5">
        <p class="text-sm font-bold">El administrador todav&#237;a no ha cambiado tu rol a docente</p>
        <p class="text-xs font-medium text-base-texto-primario">
          Por ahora entras como estudiante. Cuando aprueben tu solicitud, cierra sesi&#243;n y vuelve a entrar para ver el panel docente.
          Si te urge, av&#237;sale al administrador.
        </p>
      </div>
      <div v-else-if="solicitud.status === 'approved'" class="space-y-0.5">
        <p class="text-sm font-bold">Ya eres docente</p>
        <p class="text-xs font-medium text-base-texto-primario">Cierra sesi&#243;n y vuelve a entrar para usar el panel docente.</p>
      </div>
      <div v-else class="space-y-0.5">
        <p class="text-sm font-bold">Tu solicitud para ser docente fue rechazada</p>
        <p v-if="solicitud.reviewNote" class="text-xs font-medium text-base-texto-primario">&#171;{{ solicitud.reviewNote }}&#187;</p>
      </div>
    </div>

    <button
      v-if="solicitud.status === 'approved'"
      type="button"
      @click="$emit('cerrar-sesion')"
      class="shrink-0 px-3 py-1.5 rounded-lg bg-semantico-pasa text-white text-xs font-bold hover:opacity-90">
      Cerrar sesi&#243;n
    </button>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, BadgeCheck, ShieldAlert } from 'lucide-vue-next'
import type { SolicitudRolEstudiante } from '~/composables/useInicioEstudiante'

defineProps<{ solicitud: SolicitudRolEstudiante | null }>()
defineEmits<{ 'cerrar-sesion': [] }>()
</script>
