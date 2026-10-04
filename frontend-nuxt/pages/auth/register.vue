<template>
  <div class="w-full max-w-[490px] lg:max-w-[760px] mx-auto">
    <!-- Tarjeta del prototipo de José (misma que el inicio de sesión) -->
    <div class="tarjeta-auth relative rounded-3xl p-5 sm:p-7 bg-white/95 border border-slate-200/90 backdrop-blur-2xl overflow-hidden animar-entrada">
      <div class="absolute top-0 inset-x-0 h-[3px] linea-marca" aria-hidden="true" />

      <!-- En computador la marca va al lado del título: el formulario cabe sin bajar en un portátil. -->
      <div class="flex flex-col lg:flex-row items-center lg:gap-4 text-center lg:text-left mb-4">
        <!-- En el celular la marca ya está en el encabezado: aquí se ocultaría espacio que necesita el formulario. -->
        <LayoutMarcaST tamano="grande" :escudo="campoEnFoco === 'password'" class="hidden lg:flex shrink-0" />
        <div>
          <h1 class="text-2xl font-bold tracking-tight font-poppins text-slate-900">Crear cuenta</h1>
          <p class="text-sm mt-1 max-w-[360px] lg:max-w-none leading-relaxed text-slate-600">
            Crea tu cuenta en menos de un minuto
          </p>
        </div>
      </div>

      <!-- Error -->
      <Transition name="aviso">
        <div v-if="errorMessage" role="alert" class="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs border bg-red-50 border-red-200 text-red-700">
          <AlertCircle :size="16" class="shrink-0 text-red-500" aria-hidden="true" />
          <span>{{ errorMessage }}</span>
        </div>
      </Transition>

      <!-- Aviso de solicitud de rol docente pendiente (§23 T3) -->
      <div v-if="roleRequestSuccessNotice" role="alert" class="mb-4 p-3 rounded-xl bg-semantico-falla/10 border-2 border-l-8 border-semantico-falla text-xs text-semantico-falla space-y-2">
        <div class="flex items-start gap-2">
          <ShieldAlert :size="18" class="shrink-0" aria-hidden="true" />
          <div>
            <p class="text-sm font-bold">Todavía no eres docente</p>
            <p class="text-base-texto-primario">{{ roleRequestSuccessNotice }}</p>
          </div>
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

      <!-- Registro en dos pasos (pedido de Jeider, 03/10): el paso 1 es solo lo obligatorio y cabe sin bajar; el paso 2 es
           opcional y se llega con un botón aparte. Sin «confirmar contraseña»: el ojo para ver la clave evita el error
           que ese campo intentaba evitar, con la mitad del trabajo. -->
      <ol class="flex items-center gap-2 mb-3 text-[11px] font-semibold" aria-label="Pasos del registro">
        <li class="flex items-center gap-1.5" :class="paso === 1 ? 'text-stire-blue' : 'text-slate-500'" :aria-current="paso === 1 ? 'step' : undefined">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="paso === 1 ? 'bg-stire-blue text-white' : 'bg-stire-teal/20 text-[#00705f]'">
            <Check v-if="paso === 2" :size="11" aria-hidden="true" /><template v-else>1</template>
          </span>
          Tu cuenta
        </li>
        <li class="flex-1 h-px bg-slate-200" aria-hidden="true" />
        <li class="flex items-center gap-1.5" :class="paso === 2 ? 'text-stire-blue' : 'text-slate-500'" :aria-current="paso === 2 ? 'step' : undefined">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="paso === 2 ? 'bg-stire-blue text-white' : 'bg-slate-100 text-slate-500'">2</span>
          Opcional
        </li>
      </ol>

      <form ref="formRef" @submit.prevent="handleRegister" novalidate>
        <!-- PASO 1: lo obligatorio -->
        <div v-show="paso === 1" id="paso-obligatorio" class="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-3 items-start">
          <!-- Tipo de cuenta primero: cambia lo que se pide después (§23 T3). Radios reales con forma de tarjeta. -->
          <fieldset class="lg:col-span-2">
            <legend class="text-sm font-semibold text-slate-700 mb-1.5">Soy</legend>
            <div class="grid grid-cols-2 gap-2">
              <label
                class="py-2 px-3 rounded-xl text-sm border flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-stire-teal/40"
                :class="selectedRole === 'estudiante'
                  ? 'bg-stire-teal/15 border-stire-teal text-[#00705f] font-semibold ring-2 ring-stire-teal/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'">
                <input type="radio" name="accountType" value="estudiante" v-model="selectedRole" class="sr-only" />
                <GraduationCap :size="16" aria-hidden="true" /> Estudiante
              </label>
              <label
                class="py-2 px-3 rounded-xl text-sm border flex items-center justify-center gap-1.5 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-stire-purple/40"
                :class="selectedRole === 'docente'
                  ? 'bg-stire-purple/15 border-stire-purple text-stire-purple font-semibold ring-2 ring-stire-purple/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'">
                <input type="radio" name="accountType" value="docente" v-model="selectedRole" class="sr-only" />
                <BookOpen :size="16" aria-hidden="true" /> Docente
              </label>
            </div>
          </fieldset>

          <!-- Docente: qué pasa con la solicitud. Rojo porque es importante (pedido de Jeider, 02/10). -->
          <p v-if="selectedRole === 'docente'" class="lg:col-span-2 -mt-1 flex items-start gap-1.5 p-2.5 rounded-xl bg-semantico-falla/10 border border-semantico-falla/40 text-[11px] text-semantico-falla font-semibold">
            <ShieldAlert :size="14" class="shrink-0 mt-px" aria-hidden="true" />
            Entrarás como estudiante hasta que el administrador apruebe tu solicitud.
          </p>

          <div class="space-y-1.5">
            <label for="fullName" class="block text-sm font-semibold text-slate-700">Nombre completo</label>
            <div class="relative">
              <User :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
              <input id="fullName" ref="nombreRef" v-model="fullName" type="text" required autocomplete="name" placeholder="Ej: Pedro Romero Mendoza" class="campo-auth pl-10 pr-3.5" :class="campoMal('fullName')" :aria-invalid="!!faltan.fullName || undefined" />
            </div>
            <p v-if="faltan.fullName" class="text-[11px] font-semibold text-red-700">{{ faltan.fullName }}</p>
          </div>

          <div class="space-y-1.5">
            <label for="email" class="block text-sm font-semibold text-slate-700">Correo</label>
            <div class="relative">
              <Mail :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
              <input id="email" v-model="email" type="email" required autocomplete="email" placeholder="usuario@unicor.edu.co" class="campo-auth pl-10 pr-3.5" :class="campoMal('email')" :aria-invalid="!!faltan.email || undefined" />
            </div>
            <p v-if="faltan.email" class="text-[11px] font-semibold text-red-700">{{ faltan.email }}</p>
          </div>

          <div class="space-y-1.5 lg:col-span-2">
            <label for="password" class="block text-sm font-semibold text-slate-700">Contraseña</label>
            <div class="relative">
              <Lock :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
              <input
                id="password"
                v-model="password"
                :type="verClave ? 'text' : 'password'"
                required
                autocomplete="new-password"
                placeholder="Crea una contraseña"
                aria-describedby="reglas-clave"
                :aria-invalid="!!faltan.password || undefined"
                @focus="campoEnFoco = 'password'"
                @blur="campoEnFoco = null; bloqMayus = false"
                @keydown="detectarBloqMayus"
                @keyup="detectarBloqMayus"
                class="campo-auth pl-10 pr-11 focus:border-stire-purple focus:ring-stire-purple/20"
                :class="campoMal('password')" />
              <button
                type="button"
                @click="verClave = !verClave"
                class="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
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
            <!-- Lo que exige el servidor, en una línea; cuando se cumple todo queda solo «Contraseña segura». -->
            <p v-if="claveCompleta" id="reglas-clave" class="flex items-center gap-1 text-[11px] font-semibold text-[#00705f]">
              <CheckCircle2 :size="13" aria-hidden="true" /> Contraseña segura
            </p>
            <ul v-else id="reglas-clave" class="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
              <li v-for="regla in reglasClave" :key="regla.texto" class="flex items-center gap-1" :class="regla.cumple ? 'text-[#00705f] font-semibold' : faltan.password ? 'text-red-700 font-semibold' : 'text-slate-500'">
                <Check v-if="regla.cumple" :size="11" aria-hidden="true" />
                <span v-else class="w-[11px] text-center" aria-hidden="true">·</span>
                {{ regla.texto }}<span class="sr-only">{{ regla.cumple ? ' (cumplido)' : ' (pendiente)' }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- PASO 2: lo opcional. Nada de esto es necesario para entrar; todo se puede hacer después. -->
        <div v-show="paso === 2" id="paso-opcional" class="space-y-4">
          <p class="text-xs text-slate-600 -mt-1">
            {{ selectedRole === 'docente'
              ? 'Ayuda al administrador a aprobar tu solicitud más rápido.'
              : 'Puedes dejarlo para después: el código de clase se ingresa en «Mis clases» y la clave, desde el Tutor.' }}
          </p>

          <div v-if="selectedRole === 'docente'">
            <div class="flex items-center justify-between mb-1">
              <label for="teacherReason" class="text-sm font-semibold text-slate-700">¿Qué materia o dependencia?</label>
              <span class="text-[10px] text-slate-500 font-mono">{{ teacherReason.length }}/300</span>
            </div>
            <textarea
              id="teacherReason"
              v-model="teacherReason"
              v-crece
              maxlength="300"
              rows="2"
              placeholder="Ej: Docente de Algoritmia y Programación Web"
              class="campo-auth px-3 py-1.5 text-sm resize-none"></textarea>
          </div>

          <div v-if="selectedRole === 'estudiante'" class="space-y-1.5">
            <label for="classCode" class="block text-sm font-semibold text-slate-700">Código de clase</label>
            <div class="relative">
              <KeyRound :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
              <input id="classCode" v-model="classCode" type="text" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="Ej.: ALGO-203413" @input="classCode = codigoMientrasEscribe(classCode)" class="campo-auth pl-10 pr-3.5 uppercase tracking-wider font-mono" />
            </div>
            <p class="text-[11px] text-slate-500">Si tu docente te dio un código, ingrésalo para entrar a su clase de una vez.</p>
          </div>

          <!-- Clave de Google AI Studio (§19.1): solo estudiantes, el Tutor es solo para ellos (src/tutor/tutor.controller.ts). -->
          <div v-if="selectedRole === 'estudiante'" class="border border-slate-200 rounded-xl p-3 space-y-2 bg-white">
            <label for="apiKey" class="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <Bot :size="15" class="text-stire-purple" aria-hidden="true" />
              Clave de Google AI Studio
              <span class="text-[11px] font-normal text-slate-500">(para usar el Tutor)</span>
            </label>
            <p class="text-[11px] text-slate-500">
              El Tutor usa tu cuenta gratuita de Google: sin costo para ti ni para el proyecto.
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" class="text-stire-blue underline ml-1">Conseguir clave gratuita ↗</a>
            </p>
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
                class="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-slate-700">
                <EyeOff v-if="showApiKey" :size="16" aria-hidden="true" />
                <Eye v-else :size="16" aria-hidden="true" />
              </button>
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
          </div>
        </div>

        <!-- Acciones: «Crear cuenta» siempre a la vista; lo opcional es un botón aparte. -->
        <div class="mt-4 space-y-1.5">
          <button
            type="submit"
            :disabled="isLoading"
            class="boton-acceso relative w-full py-3 px-4 rounded-xl font-bold text-sm font-poppins text-[#070e24] bg-stire-teal hover:bg-[#14e2c8] focus:outline-none focus-visible:ring-4 focus-visible:ring-stire-teal/40 shadow-lg shadow-stire-teal/20 transition-all flex items-center justify-center gap-2 overflow-hidden disabled:cursor-wait">
            <span class="brillo-barrido" aria-hidden="true" />
            <template v-if="isLoading">
              <span class="w-4 h-4 rounded-full border-2 border-[#070e24] border-t-transparent animate-spin" aria-hidden="true" />
              <span>Creando tu cuenta…</span>
            </template>
            <template v-else>
              <span>Crear cuenta</span> <ArrowRight :size="16" aria-hidden="true" />
            </template>
          </button>
          <button
            v-if="paso === 1"
            id="ir-opcional"
            type="button"
            class="w-full py-2 px-4 rounded-xl text-sm font-semibold text-stire-blue hover:bg-stire-blue/5 inline-flex items-center justify-center gap-1.5"
            @click="irAOpcional">
            <ListPlus :size="16" aria-hidden="true" />
            {{ selectedRole === 'docente' ? 'Agregar la materia que dictas (opcional)' : 'Agregar código de clase o clave del Tutor (opcional)' }}
          </button>
          <button
            v-else
            type="button"
            class="w-full py-2 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 inline-flex items-center justify-center gap-1.5"
            @click="paso = 1">
            <ArrowLeft :size="16" aria-hidden="true" /> Volver a mis datos
          </button>
        </div>
      </form>

      <p class="mt-3 pt-3 border-t border-slate-200 text-center text-sm text-slate-600">
        ¿Ya tienes una cuenta registrada?
        <NuxtLink :to="{ path: '/auth/login', query: route.query }" class="font-semibold text-stire-blue hover:text-stire-purple hover:underline transition-colors">
          Inicia sesión aquí
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Bot, Check, CheckCircle2, Eye, EyeOff, GraduationCap, KeyRound, ListPlus, Lock, Mail, ShieldAlert, ShieldCheck, User } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import { rutaDeVuelta, codigoMientrasEscribe } from '~/utils/codigoClase'
import { faltantesDelRegistro, type Faltantes } from '~/utils/registro'

const route = useRoute()

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const api = useApi()
const fullName = ref('')
const email = ref('')
const password = ref('')
const classCode = ref('')
const selectedRole = ref<'estudiante' | 'docente'>('estudiante')
const teacherReason = ref('')
const apiKey = ref('')
const showApiKey = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const tutorKeyWarning = ref('')
const roleRequestSuccessNotice = ref('')

// Pasos del registro y validación propia (el formulario usa novalidate: los mensajes del navegador no dicen qué regla
// de la contraseña falta y, con el paso 2 abierto, apuntaban a campos ocultos).
const paso = ref<1 | 2>(1)
const nombreRef = ref<HTMLInputElement | null>(null)
const faltan = ref<Faltantes>({})
const validar = () => (faltan.value = faltantesDelRegistro(fullName.value, email.value, password.value))
const campoMal = (campo: keyof Faltantes) => (faltan.value[campo] ? '!border-red-400 !ring-1 !ring-red-300' : '')
// Al corregir un campo marcado, su aviso se va solo.
watch([fullName, email, password], () => { if (Object.keys(faltan.value).length) validar() })

function irAOpcional() {
  if (Object.keys(validar()).length) { enfocarPrimerFaltante(); return }
  paso.value = 2
}

function enfocarPrimerFaltante() {
  paso.value = 1
  const primero = (['fullName', 'email', 'password'] as const).find((c) => faltan.value[c])
  if (primero) nextTick(() => document.getElementById(primero)?.focus())
}

// En computador el cursor queda listo en el nombre; en el celular no, para no abrir el teclado encima de la página.
onMounted(() => {
  if (window.matchMedia?.('(pointer: fine)').matches) nombreRef.value?.focus()
})

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
const claveCompleta = computed(() => reglasClave.value.every((r) => r.cumple))

async function handleRegister() {
  if (Object.keys(validar()).length) { enfocarPrimerFaltante(); return }

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
    if (selectedRole.value === 'estudiante' && apiKey.value.trim()) {
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
