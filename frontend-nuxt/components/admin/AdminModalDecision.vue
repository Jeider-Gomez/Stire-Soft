<template>
  <!-- Aprobar o rechazar una solicitud para ser docente (§23 T4), con una nota opcional. -->
  <AdminDialogo id-titulo="decision-modal-title" id-descripcion="decision-modal-desc"
    :titulo="aprobar ? 'Aprobar solicitud de docente' : 'Rechazar solicitud de docente'" subtitulo="Resolución de solicitud de acceso"
    :clase-icono="aprobar ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-semantico-falla/15 text-semantico-falla'"
    :devolver-foco="`${decision}-btn-${solicitud.id}`" :ocupado="ocupado" @cerrar="emit('cerrar')">
    <template #icono><component :is="aprobar ? Check : X" :size="18" aria-hidden="true" /></template>
    <div id="decision-modal-desc" class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil text-xs space-y-1">
      <p class="font-medium text-base-texto-primario">Solicitante: {{ solicitud.user?.fullName || solicitud.user?.email }}</p>
      <p v-if="solicitud.reason" class="text-slate-600 italic">Motivo indicado: «{{ solicitud.reason }}»</p>
      <p class="text-[11px] pt-1 font-semibold" :class="aprobar ? 'text-semantico-pasa' : 'text-semantico-falla'">
        {{ aprobar ? 'El usuario se convertirá en docente y podrá crear y administrar clases.' : 'La solicitud será rechazada y el usuario conservará su rol de estudiante.' }}
      </p>
    </div>
    <div class="space-y-1 text-xs">
      <div class="flex items-center justify-between">
        <label for="decision-note" class="font-semibold text-base-texto-primario">Nota de revisión <span class="text-[10px] font-normal text-slate-600">(opcional)</span></label>
        <span class="text-[10px] text-slate-600 font-mono">{{ nota.length }}/300</span>
      </div>
      <textarea id="decision-note" v-model="nota" v-crece maxlength="300" rows="2" placeholder="Ej.: aprobado conforme a la asignación académica del semestre"
        class="w-full px-3 py-1.5 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none resize-none" />
    </div>
    <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-borde-sutil">
      <button data-foco-inicial type="button" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50" @click="emit('cerrar')">
        Cancelar
      </button>
      <button type="button" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md text-base-blanco text-xs font-bold disabled:opacity-50 flex items-center gap-2 hover:opacity-90"
        :class="aprobar ? 'bg-semantico-pasa' : 'bg-semantico-falla'" @click="confirmar">
        <Loader2 v-if="ocupado" :size="14" class="animate-spin" aria-hidden="true" />
        <span>{{ ocupado ? 'Procesando…' : aprobar ? 'Aprobar solicitud' : 'Rechazar solicitud' }}</span>
      </button>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Loader2, X } from 'lucide-vue-next'
import type { SolicitudRol } from '~/utils/adminUsuarios'
import { useGestionUsuariosDeLaPagina } from '~/composables/useGestionUsuarios'

const props = defineProps<{ solicitud: SolicitudRol; decision: 'approve' | 'reject' }>()
const emit = defineEmits<{ cerrar: [] }>()
const gestion = useGestionUsuariosDeLaPagina()
const aprobar = computed(() => props.decision === 'approve')
const nota = ref('')
const ocupado = ref(false)

async function confirmar() {
  ocupado.value = true
  await gestion.decidirSolicitud(props.solicitud, props.decision, nota.value)
  ocupado.value = false
  emit('cerrar')
}
</script>
