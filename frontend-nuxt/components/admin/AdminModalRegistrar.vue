<template>
  <!-- Registrar a alguien desde el panel (T3): nombre, correo, contraseña inicial (o una generada) y rol. -->
  <AdminDialogo id-titulo="register-modal-title" titulo="Registrar nuevo usuario" subtitulo="Creación administrativa de cuenta en la plataforma"
    devolver-foco="open-register-user-btn" :ocupado="ocupado" @cerrar="emit('cerrar')">
    <template #icono><UserPlus :size="18" aria-hidden="true" /></template>
    <div v-if="error" role="alert" class="p-2.5 rounded-lg bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla">{{ error }}</div>
    <form class="space-y-3 text-xs" @submit.prevent="registrar">
      <div>
        <label for="reg-fullname" class="block font-semibold text-base-texto-primario mb-1">Nombre completo <span class="text-semantico-falla">*</span></label>
        <input id="reg-fullname" v-model="form.fullName" data-foco-inicial type="text" required placeholder="Ej. Laura Gómez" :class="CAMPO" />
      </div>
      <div>
        <label for="reg-email" class="block font-semibold text-base-texto-primario mb-1">Correo electrónico <span class="text-semantico-falla">*</span></label>
        <input id="reg-email" v-model="form.email" type="email" required placeholder="correo@ejemplo.com" :class="CAMPO" />
      </div>
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="reg-pwd" class="font-semibold text-base-texto-primario">Contraseña inicial <span class="text-semantico-falla">*</span></label>
          <button type="button" class="min-h-[44px] sm:min-h-0 text-[11px] text-acento-ambar-fuerte hover:underline font-medium" @click="form.password = generarClaveSegura()">Generar aleatoria</button>
        </div>
        <div class="relative">
          <input id="reg-pwd" v-model="form.password" :type="verClave ? 'text' : 'password'" required placeholder="Mín. 6 car., mayúscula, minúscula y número/símbolo" :class="[CAMPO, 'pr-8']" />
          <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600" :aria-label="verClave ? 'Ocultar contraseña' : 'Ver contraseña'" :title="verClave ? 'Ocultar contraseña' : 'Ver contraseña'" @click="verClave = !verClave">
            <EyeOff v-if="verClave" :size="14" aria-hidden="true" />
            <Eye v-else :size="14" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div>
        <label for="reg-role" class="block font-semibold text-base-texto-primario mb-1">Rol inicial</label>
        <select id="reg-role" v-model="form.role" :class="CAMPO">
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <div class="flex items-center justify-end gap-2 pt-3 border-t border-base-borde-sutil">
        <button type="button" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" :disabled="ocupado" class="min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar disabled:opacity-50 flex items-center gap-2">
          <Loader2 v-if="ocupado" :size="14" class="animate-spin" aria-hidden="true" />
          <span>{{ ocupado ? 'Registrando…' : 'Registrar usuario' }}</span>
        </button>
      </div>
    </form>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-vue-next'
import { generarClaveSegura } from '~/utils/adminUsuarios'
import { useGestionUsuariosDeLaPagina } from '~/composables/useGestionUsuarios'

const emit = defineEmits<{ cerrar: [] }>()
const gestion = useGestionUsuariosDeLaPagina()
const CAMPO = 'w-full min-h-[44px] px-3 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco text-base-texto-primario outline-none focus:ring-1 focus:ring-acento-ambar-fuerte'
const form = reactive({ fullName: '', email: '', password: '', role: 'estudiante' })
const verClave = ref(false)
const ocupado = ref(false)
const error = ref('')

async function registrar() {
  if (!form.fullName.trim() || !form.email.trim() || !form.password) {
    error.value = 'Completa todos los campos obligatorios.'
    return
  }
  ocupado.value = true
  error.value = ''
  const fallo = await gestion.registrarUsuario(form)
  ocupado.value = false
  if (fallo) error.value = fallo
  else emit('cerrar')
}
</script>
