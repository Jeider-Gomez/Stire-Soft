<template>
  <div class="w-full max-w-[490px] mx-auto">
    <!-- Tarjeta del prototipo de José (misma que el inicio de sesión) -->
    <div class="tarjeta-auth relative rounded-3xl p-7 sm:p-9 bg-white/95 border border-slate-200/90 backdrop-blur-2xl overflow-hidden animar-entrada">
      <div class="absolute top-0 inset-x-0 h-[3px] linea-marca" aria-hidden="true" />

      <div class="flex flex-col items-center text-center mb-5">
        <LayoutMarcaST tamano="grande" :escudo="campoEnFoco === 'password'" class="mb-3.5" />
        <h1 class="text-2xl font-bold tracking-tight font-poppins text-slate-900">Crear Cuenta</h1>
        <p class="text-xs mt-1 max-w-[360px] leading-relaxed text-slate-500">
          Regístrate para acceder al entorno de aprendizaje y tutoría inteligente de STIRE
        </p>
      </div>

      <!-- Error -->
      <Transition name="aviso">
        <div v-if="errorMessage" role="alert" class="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs border bg-red-50 border-red-200 text-red-700">
          <AlertCircle :size="16" class="shrink-0 text-red-500" aria-hidden="true" />
          <span>{{ errorMessage }}</span>
        </div>
      </Transition>

      <!-- Aviso de solicitud de rol docente pendiente (§23 T3) -->
      <div v-if="roleRequestSuccessNotice" role="status" class="mb-4 p-3 rounded-xl bg-stire-blue/10 border border-stire-blue/30 text-xs text-stire-blue space-y-2">
        <div class="flex items-start gap-2">
          <ClipboardCheck :size="16" class="shrink-0" aria-hidden="true" />
          <p>{{ roleRequestSuccessNotice }}</p>
        </div>
        <button
          type="button"
          @click="navigateTo('/estudiante')"
          class="w-full py-1.5 px-3 rounded-lg bg-stire-blue text-white font-semibold text-xs hover:bg-stire-blue-dark transition-colors">
          Ir al Inicio del Estudiante →
        </button>
      </div>

      <!-- Aviso no bloqueante de clave no guardada (§19.1) -->
      <div v-if="tutorKeyWarning" role="status" class="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 flex items-start gap-2">
        <AlertTriangle :size="16" class="shrink-0 text-amber-600" aria-hidden="true" />
        <span>{{ tutorKeyWarning }}</span>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div class="space-y-1.5">
          <label for="fullName" class="block text-xs font-semibold text-slate-700">Nombre Completo</label>
          <div class="relative">
            <User :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input id="fullName" v-model="fullName" type="text" required autocomplete="name" placeholder="Ej: Pedro Romero Mendoza" class="campo-auth pl-10 pr-3.5" />
          </div>
        </div>

        <!-- Tipo de cuenta (§23 T3): radios reales, con la forma de las tarjetas del prototipo -->
        <fieldset class="space-y-1.5">
          <legend class="text-xs font-semibold text-slate-700 mb-1.5">Tipo de Cuenta</legend>
          <div class="grid grid-cols-2 gap-2">
            <label
              class="py-2 px-3 rounded-xl text-xs border flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-stire-teal/40"
              :class="selectedRole === 'estudiante'
                ? 'bg-stire-teal/15 border-stire-teal text-[#00705f] font-semibold ring-2 ring-stire-teal/20'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'">
              <input type="radio" name="accountType" value="estudiante" v-model="selectedRole" class="sr-only" />
              <GraduationCap :size="14" aria-hidden="true" /> Estudiante
            </label>
            <label
              class="py-2 px-3 rounded-xl text-xs border flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-stire-purple/40"
              :class="selectedRole === 'docente'
                ? 'bg-stire-purple/15 border-stire-purple text-stire-purple font-semibold ring-2 ring-stire-purple/20'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'">
              <input type="radio" name="accountType" value="docente" v-model="selectedRole" class="sr-only" />
              <BookOpen :size="14" aria-hidden="true" /> Docente
            </label>
          </div>
        </fieldset>

        <div class="space-y-1.5">
          <label for="email" class="block text-xs font-semibold text-slate-700">Correo Electrónico</label>
          <div class="relative">
            <Mail :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input id="email" v-model="email" type="email" required autocomplete="email" placeholder="usuario@ejemplo.com" class="campo-auth pl-10 pr-3.5" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="password" class="block text-xs font-semibold text-slate-700">Contraseña</label>
          <div class="relative">
            <Lock :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              id="password"
              v-model="password"
              :type="verClave ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="••••••••"
              aria-describedby="reglas-clave"
              @focus="campoEnFoco = 'password'"
              @blur="campoEnFoco = null; bloqMayus = false"
              @keydown="detectarBloqMayus"
              @keyup="detectarBloqMayus"
              class="campo-auth pl-10 pr-11 focus:border-stire-purple focus:ring-stire-purple/20" />
            <button
              type="button"
              @click="verClave = !verClave"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              :aria-label="verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :aria-pressed="verClave">
              <EyeOff v-if="verClave" :size="16" aria-hidden="true" />
              <Eye v-else :size="16" aria-hidden="true" />
            </button>
          </div>
          <Transition name="aviso">
            <p v-if="bloqMayus" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[11px] font-medium">
              <AlertTriangle :size="14" class="text-amber-600" aria-hidden="true" /> Bloq Mayús está activado
            </p>
          </Transition>
          <!-- Medidor de fuerza con los tres colores de la marca y la lista de lo que pide el servidor -->
          <div v-if="password.length > 0" class="pt-1 space-y-1.5" aria-hidden="true">
            <div class="flex gap-1.5 h-1">
              <span v-for="(color, i) in coloresFuerza" :key="i" class="flex-1 rounded-full transition-all duration-300" :class="i < barrasLlenas ? color : 'bg-slate-200'" />
            </div>
          </div>
          <ul id="reglas-clave" class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <li v-for="regla in reglasClave" :key="regla.texto" class="flex items-center gap-1" :class="regla.cumple ? 'text-[#00705f] font-semibold' : 'text-slate-500'">
              <Check v-if="regla.cumple" :size="11" aria-hidden="true" />
              <span v-else class="w-[11px] text-center" aria-hidden="true">·</span>
              {{ regla.texto }}<span class="sr-only">{{ regla.cumple ? ' (cumplido)' : ' (pendiente)' }}</span>
            </li>
          </ul>
        </div>

        <div class="space-y-1.5">
          <label for="confirmPassword" class="block text-xs font-semibold text-slate-700">Confirmar Contraseña</label>
          <div class="relative">
            <Lock :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="verClave ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="••••••••"
              class="campo-auth pl-10 pr-10"
              :class="confirmPassword && confirmPassword === password ? 'border-stire-teal ring-1 ring-stire-teal/30' : ''" />
            <CheckCircle2 v-if="confirmPassword && confirmPassword === password" :size="16" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-stire-teal pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        <!-- Bloque de solicitud de rol docente (§23 T3) -->
        <div v-if="selectedRole === 'docente'" class="p-3 rounded-xl bg-stire-purple/5 border border-stire-purple/25 space-y-2 text-xs">
          <p class="flex items-start gap-1.5 text-[11px] text-stire-purple font-medium">
            <Info :size="14" class="shrink-0 mt-px" aria-hidden="true" />
            Tu cuenta se crea como estudiante. Un administrador revisará tu solicitud y, si la aprueba, podrás iniciar sesión como docente.
          </p>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="teacherReason" class="text-[11px] font-semibold text-slate-700">
                ¿Qué materia o dependencia? <span class="text-[10px] font-normal text-slate-500">(Opcional)</span>
              </label>
              <span class="text-[10px] text-slate-500 font-mono">{{ teacherReason.length }}/300</span>
            </div>
            <textarea
              id="teacherReason"
              v-model="teacherReason"
              maxlength="300"
              rows="2"
              placeholder="Ej: Docente de Algoritmia y Programación Web"
              class="campo-auth px-3 py-1.5 text-xs resize-none"></textarea>
          </div>
        </div>

        <div v-if="selectedRole === 'estudiante'" class="space-y-1.5">
          <label for="classCode" class="block text-xs font-semibold text-slate-700">
            Código de Clase <span class="text-[10px] font-normal text-slate-500">(Opcional)</span>
          </label>
          <div class="relative">
            <KeyRound :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input id="classCode" v-model="classCode" type="text" placeholder="Ej: WEB-ALGO-T01" class="campo-auth pl-10 pr-3.5 uppercase tracking-wider font-mono" />
          </div>
          <p class="text-[10px] text-slate-500">
            Si tu docente te suministró un código de clase, ingrésalo para matricularte de inmediato.
          </p>
        </div>

        <!-- Clave de Google AI Studio (opcional, §19.1) -->
        <div class="border border-slate-200 rounded-xl p-3 space-y-2 bg-stire-canvas/60">
          <div class="flex items-center justify-between gap-2">
            <span class="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Bot :size="14" class="text-stire-purple" aria-hidden="true" />
              Clave de Google AI Studio
              <span class="text-[10px] font-normal text-slate-500">(para usar el Tutor)</span>
            </span>
            <button
              type="button"
              @click="skipApiKey = !skipApiKey"
              class="text-[10px] text-slate-500 underline hover:text-stire-blue transition-colors shrink-0"
            >
              {{ skipApiKey ? 'Configurar ahora' : 'Omitir por ahora' }}
            </button>
          </div>

          <template v-if="!skipApiKey">
            <p class="text-[10px] text-slate-500">
              El Tutor usa tu cuenta gratuita de Google — sin costo para ti ni para el proyecto.
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" class="text-stire-blue underline ml-1">Conseguir clave gratuita ↗</a>
            </p>
            <div>
              <label for="apiKey" class="block text-[11px] font-semibold text-slate-700 mb-1">Tu clave de Google AI Studio</label>
              <div class="relative">
                <input
                  id="apiKey"
                  v-model="apiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  autocomplete="off"
                  placeholder="AIzaSy…"
                  class="campo-auth pl-3.5 pr-11 text-xs font-mono" />
                <button
                  type="button"
                  @click="showApiKey = !showApiKey"
                  :aria-label="showApiKey ? 'Ocultar clave' : 'Mostrar clave'"
                  :aria-pressed="showApiKey"
                  class="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700">
                  <EyeOff v-if="showApiKey" :size="16" aria-hidden="true" />
                  <Eye v-else :size="16" aria-hidden="true" />
                </button>
              </div>
            </div>
            <!-- Aviso de privacidad §19.3 -->
            <p class="flex items-start gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck :size="13" class="shrink-0 text-stire-blue mt-px" aria-hidden="true" />
              <span>
                Tu clave se guarda cifrada y solo sirve para hablar con el Tutor; nadie del equipo puede verla.
                Las preguntas que le haces al Tutor se envían a Google usando <strong>tu</strong> cuenta.
                En la capa gratuita, Google puede usar ese contenido para mejorar sus productos: no escribas
                datos personales ni contraseñas en el chat.
              </span>
            </p>
          </template>

          <p v-if="skipApiKey" class="text-[10px] text-slate-500 italic">
            Podrás configurarla en cualquier momento desde el Tutor.
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="boton-acceso relative w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm font-poppins text-[#070e24] bg-stire-teal hover:bg-[#14e2c8] focus:outline-none focus-visible:ring-4 focus-visible:ring-stire-teal/40 shadow-lg shadow-stire-teal/20 transition-all flex items-center justify-center gap-2 overflow-hidden disabled:cursor-wait">
          <span class="brillo-barrido" aria-hidden="true" />
          <template v-if="isLoading">
            <span class="w-4 h-4 rounded-full border-2 border-[#070e24] border-t-transparent animate-spin" aria-hidden="true" />
            <span>Registrando cuenta…</span>
          </template>
          <template v-else>
            <span>Completar Registro</span> <ArrowRight :size="16" aria-hidden="true" />
          </template>
        </button>
      </form>

      <p class="mt-5 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
        ¿Ya tienes una cuenta registrada?
        <NuxtLink :to="{ path: '/auth/login', query: route.query }" class="font-semibold text-stire-blue hover:text-stire-purple hover:underline transition-colors">
          Inicia sesión aquí
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, AlertTriangle, ArrowRight, BookOpen, Bot, Check, CheckCircle2, ClipboardCheck, Eye, EyeOff, GraduationCap, Info, KeyRound, Lock, Mail, ShieldCheck, User } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import { rutaDeVuelta } from '~/utils/codigoClase'

const route = useRoute()

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

// Solo presentación (prototipo de José): foco, ver la clave, Bloq Mayús y medidor de fuerza.
const campoEnFoco = ref<'password' | null>(null)
const verClave = ref(false)
const bloqMayus = ref(false)

function detectarBloqMayus(evento: KeyboardEvent) {
  bloqMayus.value = evento.getModifierState?.('CapsLock') ?? false
}

// Lo mismo que exige el servidor (src/common/validators/password-complexity.ts): 6 o más caracteres, una mayúscula,
// una minúscula y un número o un símbolo.
const reglasClave = computed(() => [
  { texto: '6 o más caracteres', cumple: password.value.length >= 6 },
  { texto: 'Una mayúscula', cumple: /[A-Z]/.test(password.value) },
  { texto: 'Una minúscula', cumple: /[a-z]/.test(password.value) },
  { texto: 'Un número o un símbolo', cumple: /[\d\W]/.test(password.value) },
])
const reglasCumplidas = computed(() => reglasClave.value.filter((r) => r.cumple).length)
const coloresFuerza = ['bg-stire-purple', 'bg-stire-blue', 'bg-stire-teal']
const barrasLlenas = computed(() => Math.round((reglasCumplidas.value / reglasClave.value.length) * coloresFuerza.length))

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

    navigateTo(rutaDeVuelta(route.query.volver) ?? '/estudiante')
  } else {
    errorMessage.value = result.error || 'Error al procesar el registro.'
  }
}
</script>

<style scoped>
.tarjeta-auth {
  box-shadow: 0 24px 48px -12px rgba(11, 61, 145, 0.1), 0 12px 24px -8px rgba(123, 47, 191, 0.07), 0 0 0 1px rgba(11, 61, 145, 0.05);
}
.campo-auth {
  @apply w-full py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 transition-all
         focus:outline-none focus:border-stire-blue focus:ring-2 focus:ring-stire-blue/15;
}
.boton-acceso:not(:disabled):hover {
  transform: scale(1.01);
}
.boton-acceso:not(:disabled):active {
  transform: scale(0.98);
}
.aviso-enter-active,
.aviso-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
