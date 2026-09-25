<template>
  <div class="max-w-xl mx-auto space-y-6">

    <!-- Tarjeta: Datos del perfil -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <h2 class="text-sm font-bold text-base-texto-primario">Datos del perfil</h2>

      <!-- Nombre completo (editable) -->
      <div>
        <label for="perfil-fullname" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Nombre completo
        </label>
        <input
          id="perfil-fullname"
          v-model="nameForm.fullName"
          type="text"
          maxlength="120"
          placeholder="Tu nombre completo"
          class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors"
        />
      </div>

      <!-- Correo (solo lectura) -->
      <div>
        <label class="block text-xs font-semibold text-base-texto-primario mb-1">
          Correo electrónico <span class="text-base-texto-secundario font-normal">(no editable)</span>
        </label>
        <input
          :value="authStore.user?.email || ''"
          type="email"
          readonly
          class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-bg-secundario text-base-texto-secundario outline-none cursor-not-allowed"
        />
      </div>

      <!-- Rol (solo lectura) -->
      <div>
        <label class="block text-xs font-semibold text-base-texto-primario mb-1">
          Rol <span class="text-base-texto-secundario font-normal">(no editable)</span>
        </label>
        <input
          :value="roleLabel"
          type="text"
          readonly
          class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-bg-secundario text-base-texto-secundario outline-none cursor-not-allowed"
        />
      </div>

      <!-- Acciones -->
      <div class="flex items-center gap-3 pt-1">
        <button
          id="save-profile-name-btn"
          type="button"
          :disabled="!nameChanged || isSavingName"
          @click="saveName"
          class="px-4 py-2 rounded-md text-xs font-bold bg-acento-ambar text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-acento-ambar-fuerte"
        >
          {{ isSavingName ? 'Guardando...' : 'Guardar nombre' }}
        </button>
        <transition name="fade">
          <span v-if="nameSuccess" class="text-xs text-semantico-exito font-semibold">✔ Nombre actualizado.</span>
        </transition>
        <span v-if="nameError" class="text-xs text-semantico-error">{{ nameError }}</span>
      </div>
    </section>

    <!-- Tarjeta: Cambiar contraseña -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <h2 class="text-sm font-bold text-base-texto-primario">Cambiar contraseña</h2>

      <div>
        <label for="perfil-pwd-current" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Contraseña actual
        </label>
        <div class="relative">
          <input
            id="perfil-pwd-current"
            v-model="pwdForm.currentPassword"
            :type="showCurrentPwd ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Tu contraseña actual"
            class="w-full px-3 py-2 pr-10 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors"
          />
          <button
            type="button"
            @click="showCurrentPwd = !showCurrentPwd"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            :title="showCurrentPwd ? 'Ocultar contraseña' : 'Ver contraseña'"
          >
            <EyeOff v-if="showCurrentPwd" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>

      <div>
        <label for="perfil-pwd-new" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Nueva contraseña
        </label>
        <div class="relative">
          <input
            id="perfil-pwd-new"
            v-model="pwdForm.newPassword"
            :type="showNewPwd ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Mínimo 6 caracteres, mayúscula, minúscula y número o símbolo"
            class="w-full px-3 py-2 pr-10 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors"
          />
          <button
            type="button"
            @click="showNewPwd = !showNewPwd"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            :title="showNewPwd ? 'Ocultar contraseña' : 'Ver contraseña'"
          >
            <EyeOff v-if="showNewPwd" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>

      <div>
        <label for="perfil-pwd-confirm" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Confirmar nueva contraseña
        </label>
        <div class="relative">
          <input
            id="perfil-pwd-confirm"
            v-model="pwdForm.confirmPassword"
            :type="showConfirmPwd ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Repite la nueva contraseña"
            class="w-full px-3 py-2 pr-10 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors"
          />
          <button
            type="button"
            @click="showConfirmPwd = !showConfirmPwd"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            :title="showConfirmPwd ? 'Ocultar contraseña' : 'Ver contraseña'"
          >
            <EyeOff v-if="showConfirmPwd" :size="16" />
            <Eye v-else :size="16" />
          </button>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex items-center gap-3 pt-1">
        <button
          id="save-profile-pwd-btn"
          type="button"
          :disabled="isSavingPwd"
          @click="savePassword"
          class="px-4 py-2 rounded-md text-xs font-bold bg-acento-ambar text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-acento-ambar-fuerte"
        >
          {{ isSavingPwd ? 'Guardando...' : 'Cambiar contraseña' }}
        </button>
        <transition name="fade">
          <span v-if="pwdSuccess" class="text-xs text-semantico-exito font-semibold">✔ Contraseña actualizada exitosamente.</span>
        </transition>
        <span v-if="pwdError" class="text-xs text-semantico-error">{{ pwdError }}</span>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const authStore = useAuthStore()
const api = useApi()
const { messageOf } = useApiErrorMessage()

// Visibilidad de contraseñas
const showCurrentPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)

// --- Nombre ---
const nameForm = reactive({
  fullName: authStore.user?.fullName || ''
})

const isSavingName = ref(false)
const nameSuccess = ref(false)
const nameError = ref<string | null>(null)

const nameChanged = computed(() =>
  nameForm.fullName.trim() !== (authStore.user?.fullName || '')
)

const roleLabel = computed(() => {
  switch (authStore.currentRole) {
    case 'docente': return 'Docente'
    case 'administrador': return 'Administrador'
    default: return 'Estudiante'
  }
})

async function saveName() {
  if (!nameChanged.value) return
  if (!nameForm.fullName.trim()) {
    nameError.value = 'El nombre no puede estar vacío.'
    return
  }
  isSavingName.value = true
  nameSuccess.value = false
  nameError.value = null

  try {
    const updated = await api.apiFetch<{ fullName: string; email: string; role: string }>('/users/me', {
      method: 'PATCH',
      body: { fullName: nameForm.fullName.trim() }
    })
    // Actualizar el store reactivamente para que el header muestre el nuevo nombre sin recargar
    if (authStore.user) {
      authStore.user.fullName = updated.fullName
    }
    nameSuccess.value = true
    setTimeout(() => { nameSuccess.value = false }, 3000)
  } catch (err: any) {
    nameError.value = messageOf(err, 'Error al guardar el nombre.')
  } finally {
    isSavingName.value = false
  }
}

// --- Contraseña ---
const pwdForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isSavingPwd = ref(false)
const pwdSuccess = ref(false)
const pwdError = ref<string | null>(null)

async function savePassword() {
  pwdError.value = null
  pwdSuccess.value = false

  if (!pwdForm.currentPassword) {
    pwdError.value = 'Ingresa tu contraseña actual.'
    return
  }
  if (!pwdForm.newPassword) {
    pwdError.value = 'Ingresa la nueva contraseña.'
    return
  }
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    pwdError.value = 'Las contraseñas nuevas no coinciden.'
    return
  }

  isSavingPwd.value = true
  try {
    const res = await api.apiFetch<{ access_token?: string; token?: string }>('/users/me/password', {
      method: 'PATCH',
      body: {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      }
    })
    // Cambiar la clave cierra las demás sesiones (F24-10): el servidor entrega un token nuevo a esta para que no se quede fuera.
    const freshToken = res?.access_token || res?.token
    if (freshToken) authStore.token = freshToken
    pwdForm.currentPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    pwdSuccess.value = true
  } catch (err: any) {
    const msg = messageOf(err, 'Error al cambiar la contraseña.')
    pwdError.value = Array.isArray(msg) ? msg.join('. ') : msg
  } finally {
    isSavingPwd.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
