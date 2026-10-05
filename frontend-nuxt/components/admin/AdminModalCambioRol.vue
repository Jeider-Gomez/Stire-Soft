<template>
  <!-- Confirmar un cambio de rol (§23 T2), diciendo en una frase qué podrá hacer la persona con el rol nuevo. -->
  <AdminDialogo id-titulo="role-modal-title" id-descripcion="role-modal-desc" titulo="Confirmar cambio de rol"
    subtitulo="Actualización de permisos institucionales" :devolver-foco="`acciones-btn-${usuario.id}`" :ocupado="ocupado" @cerrar="emit('cerrar')">
    <template #icono><User :size="16" aria-hidden="true" /></template>
    <div id="role-modal-desc" class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil text-xs">
      <p class="text-base-texto-primario font-medium">{{ explicacionCambioRol(usuario, rol) }}</p>
    </div>
    <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-borde-sutil">
      <button data-foco-inicial type="button" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50" @click="emit('cerrar')">
        Cancelar
      </button>
      <button type="button" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar disabled:opacity-50 flex items-center gap-2" @click="confirmar">
        <Loader2 v-if="ocupado" :size="14" class="animate-spin" aria-hidden="true" />
        <span>{{ ocupado ? 'Cambiando rol…' : 'Confirmar cambio' }}</span>
      </button>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Loader2, User } from 'lucide-vue-next'
import { explicacionCambioRol, type Rol, type UsuarioAdmin } from '~/utils/adminUsuarios'
import { useGestionUsuariosDeLaPagina } from '~/composables/useGestionUsuarios'

const props = defineProps<{ usuario: UsuarioAdmin; rol: Rol }>()
const emit = defineEmits<{ cerrar: [] }>()
const gestion = useGestionUsuariosDeLaPagina()
const ocupado = ref(false)

async function confirmar() {
  ocupado.value = true
  await gestion.cambiarRol(props.usuario, props.rol)
  ocupado.value = false
  emit('cerrar')
}
</script>
