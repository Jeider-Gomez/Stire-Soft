<template>
  <!-- Restablecer la contraseña (T3) en dos pasos: escribirla o generarla, y mostrarla UNA SOLA VEZ para copiarla.
       Mientras se muestra, el fondo no cierra la ventana (se perdería sin copiarla); al cerrar se borra del estado. -->
  <AdminDialogo id-titulo="reset-pwd-title" titulo="Restablecer contraseña" subtitulo="Generar nueva clave de acceso para el usuario"
    :devolver-foco="`acciones-btn-${usuario.id}`" :ocupado="ocupado" :cierra-con-fondo="!claveAsignada" @cerrar="cerrar">
    <template #icono><KeyRound :size="18" aria-hidden="true" /></template>
    <div class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil text-xs">
      <p class="font-semibold text-base-texto-primario">{{ usuario.fullName || 'Usuario' }}</p>
      <p class="text-slate-600 font-mono text-[11px]">{{ usuario.email }}</p>
    </div>

    <template v-if="!claveAsignada">
      <div v-if="error" role="alert" class="p-2.5 rounded-lg bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla">{{ error }}</div>
      <form class="space-y-3 text-xs" @submit.prevent="guardar">
        <div>
          <div class="flex items-center justify-between mb-1">
            <label for="reset-pwd-input" class="font-semibold text-base-texto-primario">Nueva contraseña <span class="text-semantico-falla">*</span></label>
            <button type="button" class="min-h-[44px] sm:min-h-0 text-[11px] text-acento-ambar-fuerte hover:underline font-medium" @click="nueva = generarClaveSegura()">Generar aleatoria</button>
          </div>
          <div class="relative">
            <input id="reset-pwd-input" v-model="nueva" data-foco-inicial :type="verClave ? 'text' : 'password'" required placeholder="Escribe o pulsa Generar aleatoria…"
              class="w-full min-h-[44px] px-3 py-1.5 pr-8 rounded-md border border-base-borde-fuerte bg-base-blanco text-base-texto-primario outline-none focus:ring-1 focus:ring-acento-ambar-fuerte font-mono text-xs" />
            <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600" :aria-label="verClave ? 'Ocultar contraseña' : 'Ver contraseña'" :title="verClave ? 'Ocultar contraseña' : 'Ver contraseña'" @click="verClave = !verClave">
              <EyeOff v-if="verClave" :size="14" aria-hidden="true" />
              <Eye v-else :size="14" aria-hidden="true" />
            </button>
          </div>
          <p class="text-[11px] text-slate-600 mt-1">Mínimo 6 caracteres con mayúscula, minúscula y número o símbolo.</p>
        </div>
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-base-borde-sutil">
          <button type="button" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50" @click="cerrar">Cancelar</button>
          <button type="submit" :disabled="ocupado || !nueva" class="min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar disabled:opacity-50 flex items-center gap-2">
            <Loader2 v-if="ocupado" :size="14" class="animate-spin" aria-hidden="true" />
            <span>{{ ocupado ? 'Guardando…' : 'Restablecer contraseña' }}</span>
          </button>
        </div>
      </form>
    </template>

    <template v-else>
      <div role="status" class="p-3 rounded-lg bg-semantico-pasa/10 border border-semantico-pasa/30 text-xs text-semantico-pasa font-semibold flex items-center gap-1.5">
        <Check :size="14" aria-hidden="true" /> Contraseña restablecida. Cópiala antes de cerrar.
      </div>
      <div class="space-y-2 text-xs">
        <p class="text-base-texto-primario font-medium">Contraseña temporal asignada:</p>
        <div class="flex items-center gap-2">
          <label for="reset-pwd-generada" class="sr-only">Contraseña temporal</label>
          <input
            id="reset-pwd-generada"
            :value="claveAsignada"
            readonly
            class="flex-1 min-w-0 p-2.5 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-mono text-sm text-base-texto-primario font-bold tracking-wider"
            @focus="($event.target as HTMLInputElement).select()"
            @click="($event.target as HTMLInputElement).select()" />
          <button type="button" class="min-h-[44px] px-3 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold hover:bg-acento-ambar flex items-center gap-1.5 text-xs" @click="copiar">
            <Check v-if="copiada" :size="14" aria-hidden="true" />
            <Copy v-else :size="14" aria-hidden="true" />
            <span>{{ copiada ? 'Copiada' : 'Copiar' }}</span>
          </button>
        </div>
        <div class="p-3 rounded-lg bg-acento-ambar/10 border border-acento-ambar/30 text-xs text-base-texto-primario space-y-1">
          <p class="font-bold text-acento-ambar-fuerte flex items-center gap-1"><TriangleAlert :size="14" aria-hidden="true" /> Información importante:</p>
          <p>Entrégasela por un canal seguro; la persona debe cambiarla en Mi perfil.</p>
          <p class="text-slate-700 text-[11px]">Por seguridad, esta contraseña no se volverá a mostrar tras cerrar esta ventana.</p>
        </div>
      </div>
      <div class="flex justify-end pt-3 border-t border-base-borde-sutil">
        <button ref="botonCerrar" type="button" class="min-h-[44px] px-4 rounded-md bg-base-bg-secundario border border-base-borde-fuerte text-xs font-bold text-base-texto-primario hover:bg-base-borde-sutil" @click="cerrar">
          Entendido y cerrar
        </button>
      </div>
    </template>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Check, Copy, Eye, EyeOff, KeyRound, Loader2, TriangleAlert } from 'lucide-vue-next'
import { generarClaveSegura, type UsuarioAdmin } from '~/utils/adminUsuarios'
import { useGestionUsuariosDeLaPagina } from '~/composables/useGestionUsuarios'

const props = defineProps<{ usuario: UsuarioAdmin }>()
const emit = defineEmits<{ cerrar: [] }>()
const gestion = useGestionUsuariosDeLaPagina()
const nueva = ref('')
const claveAsignada = ref('')
const verClave = ref(false)
const ocupado = ref(false)
const error = ref('')
const copiada = ref(false)
const botonCerrar = ref<HTMLButtonElement | null>(null)

async function guardar() {
  if (!nueva.value) return
  ocupado.value = true
  error.value = ''
  const fallo = await gestion.restablecerClave(props.usuario, nueva.value)
  ocupado.value = false
  if (fallo) { error.value = fallo; return }
  claveAsignada.value = nueva.value
  nueva.value = ''
  nextTick(() => botonCerrar.value?.focus())
}

/** Al cerrar, la contraseña se borra del estado (§24.1 Regla 1 / T3). */
function cerrar() {
  nueva.value = ''
  claveAsignada.value = ''
  emit('cerrar')
}

async function copiar() {
  if (!claveAsignada.value) return
  try {
    await navigator.clipboard.writeText(claveAsignada.value)
    copiada.value = true
    setTimeout(() => { copiada.value = false }, 2500)
  } catch {
    // Sin permiso de portapapeles (http, navegador viejo): se deja seleccionada para copiar con Ctrl+C.
    const campo = document.getElementById('reset-pwd-generada') as HTMLInputElement | null
    campo?.focus()
    campo?.select()
  }
}
</script>
