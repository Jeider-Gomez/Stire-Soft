<template>
  <div class="w-full max-w-md">
    <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-8 shadow-md">
      <!-- Encabezado COMP-V00 · Registro -->
      <div class="text-center mb-6">
        <div class="inline-flex w-12 h-12 rounded-xl bg-acento-ambar items-center justify-center text-base-blanco font-bold text-lg mb-3 shadow-sm">
          ST
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Crear Cuenta</h1>
        <p class="text-xs text-base-texto-secundario mt-1">
          Regístrate para acceder al entorno de aprendizaje y tutoría inteligente de STIRE
        </p>
      </div>

      <!-- Alerta de Error -->
      <div v-if="errorMessage" role="alert" class="mb-4 p-3 rounded-md bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla flex items-center gap-2">
        <span aria-hidden="true">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Aviso de solicitud de rol docente pendiente (§23 T3) -->
      <div v-if="roleRequestSuccessNotice" role="status" class="mb-4 p-3 rounded-md bg-semantico-info/15 border border-semantico-info/40 text-xs text-semantico-info space-y-2">
        <div class="flex items-start gap-2">
          <span aria-hidden="true">📋</span>
          <p>{{ roleRequestSuccessNotice }}</p>
        </div>
        <button
          type="button"
          @click="navigateTo('/estudiante')"
          class="w-full py-1.5 px-3 rounded bg-semantico-info text-base-blanco font-semibold text-xs hover:opacity-90 transition-opacity">
          Ir al Inicio del Estudiante →
        </button>
      </div>

      <!-- Aviso no bloqueante de clave no guardada (§19.1) -->
      <div v-if="tutorKeyWarning" role="status" class="mb-4 p-3 rounded-md bg-acento-ambar/10 border border-acento-ambar/30 text-xs text-acento-ambar-fuerte flex items-start gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>{{ tutorKeyWarning }}</span>
      </div>

      <!-- Formulario de Registro -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="fullName" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Nombre Completo
          </label>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            required
            placeholder="Ej: Pedro Romero Mendoza"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

        <div>
          <label for="email" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Correo Electrónico
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="usuario@ejemplo.com"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

        <div>
          <label for="password" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          <p class="text-[10px] text-base-texto-secundario mt-1">
            Mínimo 6 caracteres: al menos una mayúscula, minúscula, número y carácter especial.
          </p>
        </div>

        <div>
          <label for="confirmPassword" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Confirmar Contraseña
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
        </div>

        <!-- Selección de Perfil / Rol (§23 T3) -->
        <fieldset class="space-y-1.5">
          <legend class="text-xs font-semibold text-base-texto-primario mb-1">
            Tipo de Cuenta
          </legend>
          <div class="grid grid-cols-2 gap-3">
            <label
              class="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors"
              :class="selectedRole === 'estudiante'
                ? 'border-acento-ambar-fuerte bg-acento-ambar/5 font-semibold text-base-texto-primario'
                : 'border-base-borde-fuerte bg-base-blanco text-base-texto-secundario'">
              <input
                type="radio"
                name="accountType"
                value="estudiante"
                v-model="selectedRole"
                class="text-acento-ambar-fuerte focus:ring-acento-ambar-fuerte" />
              <span class="text-xs">Estudiante</span>
            </label>

            <label
              class="flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors"
              :class="selectedRole === 'docente'
                ? 'border-acento-ambar-fuerte bg-acento-ambar/5 font-semibold text-base-texto-primario'
                : 'border-base-borde-fuerte bg-base-blanco text-base-texto-secundario'">
              <input
                type="radio"
                name="accountType"
                value="docente"
                v-model="selectedRole"
                class="text-acento-ambar-fuerte focus:ring-acento-ambar-fuerte" />
              <span class="text-xs">Docente</span>
            </label>
          </div>
        </fieldset>

        <!-- Bloque de solicitud de rol docente (§23 T3) -->
        <div v-if="selectedRole === 'docente'" class="p-3 rounded-lg bg-semantico-info/10 border border-semantico-info/30 space-y-2 text-xs">
          <p class="text-[11px] text-semantico-info font-medium">
            ℹ️ Tu cuenta se crea como estudiante. Un administrador revisará tu solicitud y, si la aprueba, podrás iniciar sesión como docente.
          </p>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="teacherReason" class="text-[11px] font-semibold text-base-texto-primario">
                ¿Qué materia o dependencia? <span class="text-[10px] font-normal text-base-texto-secundario">(Opcional)</span>
              </label>
              <span class="text-[10px] text-base-texto-secundario font-mono">
                {{ teacherReason.length }}/300
              </span>
            </div>
            <textarea
              id="teacherReason"
              v-model="teacherReason"
              maxlength="300"
              rows="2"
              placeholder="Ej: Docente de Algoritmia y Programación Web"
              class="w-full px-3 py-1.5 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none resize-none"></textarea>
          </div>
        </div>

        <div v-if="selectedRole === 'estudiante'">
          <label for="classCode" class="block text-xs font-semibold text-base-texto-primario mb-1">
            Código de Clase <span class="text-[10px] font-normal text-base-texto-secundario">(Opcional)</span>
          </label>
          <input
            id="classCode"
            v-model="classCode"
            type="text"
            placeholder="Ej: WEB-ALGO-T01"
            class="w-full px-3 py-2 text-xs uppercase tracking-wider rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
          <p class="text-[10px] text-base-texto-secundario mt-1">
            Si tu docente te suministró un código de clase, ingrésalo para matricularte de inmediato.
          </p>
        </div>

        <!-- Clave de Google AI Studio (opcional, §19.1) -->
        <div class="border border-base-borde-sutil rounded-lg p-3 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-base-texto-primario">
              Clave de Google AI Studio
              <span class="text-[10px] font-normal text-base-texto-secundario ml-1">(para usar el Tutor)</span>
            </span>
            <button
              type="button"
              @click="skipApiKey = !skipApiKey"
              class="text-[10px] text-base-texto-secundario underline hover:text-acento-ambar-fuerte transition-colors"
            >
              {{ skipApiKey ? 'Configurar ahora' : 'Omitir por ahora' }}
            </button>
          </div>

          <template v-if="!skipApiKey">
            <p class="text-[10px] text-base-texto-secundario">
              El Tutor usa tu cuenta gratuita de Google — sin costo para ti ni para el proyecto.
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                class="text-acento-ambar-fuerte underline ml-1"
              >Conseguir clave gratuita ↗</a>
            </p>
            <div class="relative">
              <label for="apiKey" class="block text-[11px] font-semibold text-base-texto-primario mb-1">Tu clave de Google AI Studio</label>
              <input
                id="apiKey"
                v-model="apiKey"
                :type="showApiKey ? 'text' : 'password'"
                autocomplete="off"
                placeholder="AIzaSy…"
                class="w-full px-3 py-2 text-xs rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none pr-10" />
              <button
                type="button"
                @click="showApiKey = !showApiKey"
                :aria-label="showApiKey ? 'Ocultar clave' : 'Mostrar clave'"
                class="absolute right-2 bottom-2 text-base-texto-secundario hover:text-base-texto-primario text-[11px]"
              >{{ showApiKey ? '🙈' : '👁️' }}</button>
            </div>
            <!-- Aviso de privacidad §19.3 -->
            <p class="text-[10px] text-base-texto-secundario">
              🔒 Tu clave se guarda cifrada y solo sirve para hablar con el Tutor; nadie del equipo puede verla.
              Las preguntas que le haces al Tutor se envían a Google usando <strong>tu</strong> cuenta.
              En la capa gratuita, Google puede usar ese contenido para mejorar sus productos: no escribas
              datos personales ni contraseñas en el chat.
            </p>
          </template>

          <p v-if="skipApiKey" class="text-[10px] text-base-texto-secundario italic">
            Podrás configurarla en cualquier momento desde el Tutor.
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-2.5 px-4 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-2">
          <span v-if="isLoading">Registrando cuenta...</span>
          <span v-else>Completar Registro</span>
        </button>
      </form>

      <!-- Enlace hacia Login -->
      <div class="mt-6 pt-4 border-t border-base-borde-sutil text-center text-xs text-base-texto-secundario">
        <span>¿Ya tienes una cuenta registrada?</span>
        <NuxtLink to="/auth/login" class="ml-1 text-acento-ambar-fuerte font-semibold hover:underline">
          Inicia sesión aquí
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const api = useApi()
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const classCode = ref('')
const selectedRole = ref<'estudiante' | 'docente'>('estudiante')
const teacherReason = ref('')
const apiKey = ref('')
const skipApiKey = ref(true)
const showApiKey = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const tutorKeyWarning = ref('')
const roleRequestSuccessNotice = ref('')

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas ingresadas no coinciden.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  tutorKeyWarning.value = ''
  roleRequestSuccessNotice.value = ''

  // §23 T3: enviar requestedRole solo si eligió docente; nunca enviar campo role
  const result = await authStore.register(
    fullName.value,
    email.value,
    password.value,
    selectedRole.value === 'estudiante' ? classCode.value : undefined,
    selectedRole.value === 'docente' ? 'docente' : undefined,
    selectedRole.value === 'docente' ? teacherReason.value : undefined
  )

  isLoading.value = false

  if (result.ok) {
    // Si el estudiante ingresó una clave, guardarla (no bloqueante — §19.1)
    if (!skipApiKey.value && apiKey.value.trim()) {
      try {
        await api.put('/tutor/api-key', { apiKey: apiKey.value.trim() })
      } catch {
        // Error no bloqueante: el registro ya fue exitoso
        tutorKeyWarning.value = 'Tu cuenta se creó, pero no pude guardar tu clave: puedes configurarla luego desde el Tutor.'
        await new Promise((r) => setTimeout(r, 1500))
      }
    }

    if (result.roleRequest) {
      roleRequestSuccessNotice.value = 'Tu cuenta se creó con éxito como estudiante. Tu solicitud para ser docente quedó registrada como pendiente y un administrador la revisará. Redirigiendo a tu espacio de aprendizaje...'
      await new Promise((r) => setTimeout(r, 2500))
    }

    navigateTo('/estudiante')
  } else {
    errorMessage.value = result.error || 'Error al procesar el registro.'
  }
}
</script>
