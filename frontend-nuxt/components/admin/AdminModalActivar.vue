<template>
  <!-- Desactivar o reactivar una cuenta (T3), diciendo qué pasa con las sesiones abiertas. -->
  <AdminDialogo id-titulo="toggle-active-title" :titulo="desactivar ? 'Desactivar usuario' : 'Reactivar usuario'" subtitulo="Control de acceso a la plataforma"
    :clase-icono="desactivar ? 'bg-semantico-falla/15 text-semantico-falla' : 'bg-semantico-pasa/10 text-semantico-pasa'"
    :devolver-foco="`acciones-btn-${usuario.id}`" :ocupado="ocupado" @cerrar="emit('cerrar')">
    <template #icono><component :is="desactivar ? UserX : UserCheck" :size="18" aria-hidden="true" /></template>
    <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil text-xs space-y-2">
      <p class="text-base-texto-primario">
        <span class="font-semibold">{{ usuario.fullName || 'Usuario' }}</span>
        <span class="text-slate-600 block font-mono text-[11px]">{{ usuario.email }}</span>
      </p>
      <p class="font-medium" :class="desactivar ? 'text-semantico-falla' : 'text-semantico-pasa'">
        {{ desactivar
          ? 'El usuario no podrá iniciar sesión en la plataforma y cualquier sesión abierta se cerrará de inmediato.'
          : 'El usuario podrá volver a iniciar sesión y acceder a sus actividades con normalidad.' }}
      </p>
    </div>
    <div v-if="error" role="alert" class="p-2.5 rounded-lg bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla">{{ error }}</div>
    <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-borde-sutil">
      <button data-foco-inicial type="button" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50" @click="emit('cerrar')">Cancelar</button>
      <button type="button" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md text-base-blanco text-xs font-bold disabled:opacity-50 flex items-center gap-2 hover:opacity-90"
        :class="desactivar ? 'bg-semantico-falla' : 'bg-semantico-pasa'" @click="confirmar">
        <Loader2 v-if="ocupado" :size="14" class="animate-spin" aria-hidden="true" />
        <span>{{ ocupado ? 'Procesando…' : desactivar ? 'Desactivar cuenta' : 'Reactivar cuenta' }}</span>
      </button>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Loader2, UserCheck, UserX } from 'lucide-vue-next'
import type { UsuarioAdmin } from '~/utils/adminUsuarios'
import { useGestionUsuariosDeLaPagina } from '~/composables/useGestionUsuarios'

const props = defineProps<{ usuario: UsuarioAdmin }>()
const emit = defineEmits<{ cerrar: [] }>()
const gestion = useGestionUsuariosDeLaPagina()
// Se decide al abrir: si la cuenta está activa, la ventana es para desactivarla.
const desactivar = computed(() => props.usuario.isActive !== false)
const ocupado = ref(false)
const error = ref('')

async function confirmar() {
  ocupado.value = true
  error.value = ''
  const fallo = await gestion.cambiarActivo(props.usuario)
  ocupado.value = false
  if (fallo) error.value = fallo
  else emit('cerrar')
}
</script>
