<template>
  <div class="w-full max-w-[470px] mx-auto">
    <!-- Tarjeta del prototipo de José: borde superior con la línea de la marca, sombra con los colores de la marca
         y entrada suave. -->
    <div class="tarjeta-auth relative rounded-3xl p-7 sm:p-9 bg-white/95 border border-slate-200/90 backdrop-blur-2xl overflow-hidden animar-entrada">
      <div class="absolute top-0 inset-x-0 h-[3px] linea-marca" aria-hidden="true" />

      <!-- En computador la marca va al lado del título, como en el registro: en un portátil (657 px de alto)
           «Regístrate aquí» quedaba debajo del borde de la pantalla. -->
      <div class="flex flex-col lg:flex-row items-center lg:gap-4 text-center lg:text-left mb-5">
        <LayoutMarcaST tamano="grande" :escudo="campoEnFoco === 'password'" class="mb-3.5 lg:mb-0 shrink-0" />
        <div>
          <h1 class="text-2xl font-bold tracking-tight font-poppins text-slate-900">Iniciar sesión</h1>
          <p class="text-sm mt-1 max-w-[340px] leading-relaxed text-slate-600">
            Ingresa a tu entorno de aprendizaje y tutoría inteligente
          </p>
        </div>
      </div>

      <!-- Error -->
      <Transition name="aviso">
        <div v-if="errorMessage" id="login-error" role="alert" class="mb-4 flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-sm border-2 bg-red-50 border-red-300 text-red-700 font-semibold">
          <AlertCircle :size="18" class="shrink-0 mt-px text-red-600" aria-hidden="true" />
          <span>{{ errorMessage }}</span>
        </div>
      </Transition>

      <form novalidate @submit.prevent="handleLogin" class="space-y-4">
        <!-- Correo -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between gap-2">
            <label for="email" class="block text-sm font-semibold text-slate-700">Correo</label>
            <Transition name="aviso">
              <span v-if="esCorreoUnicor" class="inline-flex items-center gap-1 text-[10px] font-bold text-[#00705f] bg-stire-teal/15 px-2 py-0.5 rounded-full">
                <Check :size="12" aria-hidden="true" /> Dominio Unicor
              </span>
            </Transition>
          </div>
          <div class="relative">
            <Mail :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              id="email"
              ref="emailRef"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              :aria-invalid="!!(errorMessage || faltan.email) || undefined"
              :aria-describedby="faltan.email ? 'email-falta' : errorMessage ? 'login-error' : undefined"
              placeholder="usuario@unicor.edu.co"
              @focus="campoEnFoco = 'email'"
              @blur="campoEnFoco = null"
              class="campo-auth pl-10 pr-10"
              :class="errorMessage || faltan.email ? '!border-red-400 !ring-1 !ring-red-300' : esCorreoUnicor ? 'border-stire-teal ring-1 ring-stire-teal/30' : ''"
              @input="faltan.email = undefined" />
            <CheckCircle2 v-if="esCorreoUnicor" :size="16" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-teal-700 pointer-events-none" aria-hidden="true" />
          </div>
          <p v-if="faltan.email" id="email-falta" class="text-xs font-semibold text-red-700">{{ faltan.email }}</p>
        </div>

        <!-- Contraseña -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-semibold text-slate-700">Contraseña</label>
            <NuxtLink to="/auth/forgot-password" class="py-1 text-sm font-medium text-stire-blue hover:underline">¿Olvidaste tu clave?</NuxtLink>
          </div>
          <div class="relative">
            <Lock :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              id="password"
              ref="passwordRef"
              v-model="password"
              :aria-invalid="!!(errorMessage || faltan.password) || undefined"
              :aria-describedby="faltan.password ? 'clave-falta' : errorMessage ? 'login-error' : undefined"
              :type="verClave ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              @focus="campoEnFoco = 'password'"
              @blur="campoEnFoco = null; bloqMayus = false"
              @keydown="detectarBloqMayus"
              @keyup="detectarBloqMayus"
              class="campo-auth pl-10 pr-11 focus:border-stire-purple focus:ring-stire-purple/20"
              :class="errorMessage || faltan.password ? '!border-red-400 !ring-1 !ring-red-300' : ''"
              @input="faltan.password = undefined" />
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
          <p v-if="faltan.password" id="clave-falta" class="text-xs font-semibold text-red-700">{{ faltan.password }}</p>
          <Transition name="aviso">
            <p v-if="bloqMayus" class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[11px] font-medium">
              <AlertTriangle :size="14" class="text-amber-600" aria-hidden="true" /> Bloq Mayús está activado
            </p>
          </Transition>
        </div>

        <!-- Botón principal: turquesa con texto azul noche (contraste AA) y barrido de luz -->
        <button
          type="submit"
          :disabled="isLoading || accesoConcedido"
          class="boton-acceso relative w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm font-poppins text-[#070e24] bg-stire-teal hover:bg-[#14e2c8] focus:outline-none focus-visible:ring-4 focus-visible:ring-stire-teal/40 shadow-lg shadow-stire-teal/20 transition-all flex items-center justify-center gap-2 overflow-hidden disabled:cursor-wait">
          <span class="brillo-barrido" aria-hidden="true" />
          <template v-if="accesoConcedido">
            <CheckCircle2 :size="18" aria-hidden="true" /> <span>¡Acceso concedido!</span>
          </template>
          <template v-else-if="isLoading">
            <span class="w-4 h-4 rounded-full border-2 border-[#070e24] border-t-transparent animate-spin" aria-hidden="true" />
            <span>Verificando credenciales…</span>
          </template>
          <template v-else>
            <span>Ingresar a la plataforma</span> <ArrowRight :size="16" aria-hidden="true" />
          </template>
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-600">
        ¿No tienes una cuenta aún?
        <NuxtLink :to="{ path: '/auth/register', query: route.query }" class="font-semibold text-stire-blue hover:text-stire-purple hover:underline transition-colors">
          Regístrate aquí
        </NuxtLink>
      </p>

      <!-- Acceso rápido de demostración: solo visible con NUXT_PUBLIC_DEMO_MODE=true.
           No es un atajo de autenticación falso -- hace login real contra el backend
           con cuentas institucionales sembradas (ver stores/auth.ts). -->
      <template v-if="demoModeEnabled">
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center" aria-hidden="true"><div class="w-full border-t border-slate-200" /></div>
          <p class="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span class="px-3 bg-white text-slate-500">O acceso rápido de demostración</span>
          </p>
        </div>

        <div class="grid grid-cols-3 gap-2.5">
          <button
            v-for="demo in accesosDemo"
            :key="demo.rol"
            @click="quickDemoLogin(demo.rol)"
            type="button"
            class="group p-3 rounded-2xl border bg-stire-canvas border-slate-200 text-center flex flex-col items-center shadow-sm hover:shadow-md transition-all duration-200"
            :class="demo.hover">
            <span class="w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition-all group-hover:scale-110 group-hover:text-white" :class="demo.icono" aria-hidden="true">
              <component :is="demo.componente" :size="16" />
            </span>
            <span class="text-xs font-bold font-poppins text-slate-800">{{ demo.titulo }}</span>
            <span class="text-[10px] mt-0.5 text-slate-500 truncate w-full">{{ demo.nombre }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { faltantesDelIngreso } from '~/utils/registro'
import { AlertCircle, AlertTriangle, ArrowRight, Check, CheckCircle2, Eye, EyeOff, GraduationCap, Lock, Mail, Settings, UserCheck } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { rutaDeVuelta } from '~/utils/codigoClase'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const demoModeEnabled = config.public.demoMode
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const faltan = ref<Partial<Record<'email' | 'password', string>>>({})
const emailRef = ref<HTMLInputElement | null>(null)
const passwordRef = ref<HTMLInputElement | null>(null)

// En computador el cursor queda listo en el correo; en el celular no, para no abrir el teclado encima de la página.
onMounted(() => {
  if (window.matchMedia?.('(pointer: fine)').matches) emailRef.value?.focus()
})

// Solo presentación (prototipo de José): foco, ver la clave, Bloq Mayús y confirmación antes de entrar.
const campoEnFoco = ref<'email' | 'password' | null>(null)
const verClave = ref(false)
const bloqMayus = ref(false)
const accesoConcedido = ref(false)
const esCorreoUnicor = computed(() => email.value.trim().toLowerCase().endsWith('@unicor.edu.co'))

function detectarBloqMayus(evento: KeyboardEvent) {
  bloqMayus.value = evento.getModifierState?.('CapsLock') ?? false
}

const accesosDemo = [
  { rol: 'estudiante' as const, titulo: 'Estudiante', nombre: 'Pedro Romero', componente: GraduationCap, icono: 'bg-stire-teal/15 text-[#00705f] group-hover:bg-[#00705f]', hover: 'hover:border-stire-teal hover:bg-stire-teal/10' },
  { rol: 'docente' as const, titulo: 'Docente', nombre: 'Prof. Toscano', componente: UserCheck, icono: 'bg-stire-purple/15 text-stire-purple group-hover:bg-stire-purple', hover: 'hover:border-stire-purple hover:bg-stire-purple/10' },
  { rol: 'administrador' as const, titulo: 'Admin', nombre: 'Gestión', componente: Settings, icono: 'bg-stire-blue/15 text-stire-blue group-hover:bg-stire-blue', hover: 'hover:border-stire-blue hover:bg-stire-blue/10' },
]

const route = useRoute()

function rutaDelRol(role: string | null | undefined) {
  if (role === 'docente') return '/docente'
  if (role === 'administrador') return '/admin'
  return '/estudiante'
}

/** Muestra «¡Acceso concedido!» un instante antes de entrar (con «reducir movimiento» entra de inmediato). */
async function entrar(ruta: string) {
  accesoConcedido.value = true
  const sinMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!sinMovimiento) await new Promise((r) => setTimeout(r, 450))
  navigateTo(ruta)
}

async function handleLogin() {
  errorMessage.value = ''
  // Validación campo a campo antes de ir al servidor: el error se ve bajo el campo y el cursor va a ese campo.
  faltan.value = faltantesDelIngreso(email.value, password.value)
  if (faltan.value.email || faltan.value.password) {
    await nextTick()
    ;(faltan.value.email ? emailRef : passwordRef).value?.focus()
    return
  }
  isLoading.value = true

  const result = await authStore.login(email.value, password.value)

  isLoading.value = false

  if (result.ok) {
    // Volver a donde iba (p. ej. el QR de una clase) o al inicio de su rol
    await entrar(rutaDeVuelta(route.query.volver) ?? rutaDelRol(authStore.currentRole))
  } else {
    errorMessage.value = mensajeDeError(result.error)
    // Tras un error, el cursor vuelve a la contraseña (lo más probable de corregir) con el texto seleccionado.
    await nextTick()
    passwordRef.value?.focus()
    passwordRef.value?.select()
  }
}

/** «Correo o contraseña incorrectos» solo no dice qué hacer: se agrega el siguiente paso. */
function mensajeDeError(error: string | undefined): string {
  const texto = error || 'No se pudo iniciar sesión.'
  if (/incorrect/i.test(texto)) return `${texto}. Revisa que el correo esté bien escrito y que Bloq Mayús esté apagado, o usa «¿Olvidaste tu clave?».`
  return texto
}

async function quickDemoLogin(role: 'estudiante' | 'docente' | 'administrador') {
  isLoading.value = true
  errorMessage.value = ''
  const result = await authStore.switchRoleForDemo(role)
  isLoading.value = false

  if (result.ok) {
    await entrar(rutaDelRol(role))
  } else {
    errorMessage.value = result.error || 'No se pudo iniciar la cuenta de demostración.'
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
