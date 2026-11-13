<template>
  <!-- v3 (Fase C; cuadros «Entrar» y «Entrar-celular» del lienzo). Conserva lo aprendido (docs/v3/LECCIONES_QUE_NO_SE_PIERDEN.md):
       error bajo cada campo, el servidor no dice cuál dato falló, ojo y Bloq Mayús, la vuelta del QR y «Solo mirar» sutil. -->
  <AuthMarcoEntrar :mascota="{ campo: campoEnFoco, verClave, error: !!errorMessage, listo: accesoConcedido, pestana }">
    <div>
      <h1 class="m-0 font-poppins font-bold text-[24px] sm:text-[28px]">Entrar<span class="sm:hidden"> a STIRE</span></h1>
      <p class="mt-1 mb-0 text-[15px] text-base-texto-secundario">Qué bueno verte de nuevo.</p>
    </div>

    <!-- Entrando (cuadro «Entrar-estados»): la mascota con sus ecos en lugar de una ruedita. -->
    <AuthAbriendo v-if="accesoConcedido" />

    <!-- Llegó con el QR o el código de una clase: se ve a qué clase se va a unir mientras entra. -->
    <p v-if="codigoDeVuelta" class="m-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold aviso-clase">
      <QrCode :size="18" aria-hidden="true" class="shrink-0" />
      <span>Al entrar te unes a la clase <span class="font-mono">{{ codigoDeVuelta }}</span>.</span>
    </p>

    <div role="tablist" aria-label="Forma de entrar" class="flex gap-1 p-1 rounded-xl pestanas-entrar">
      <button v-for="p in PESTANAS" :id="`pestana-${p.id}`" :key="p.id" role="tab" type="button"
        :aria-selected="pestana === p.id" :aria-controls="`panel-${p.id}`" :tabindex="pestana === p.id ? 0 : -1"
        class="flex-1 min-h-[44px] rounded-[9px] text-sm font-bold transition-colors"
        :class="pestana === p.id ? 'pestana-activa' : 'text-base-texto-secundario hover:text-base-texto-primario'"
        @click="pestana = p.id" @keydown.left.prevent="cambiarPestana" @keydown.right.prevent="cambiarPestana">
        {{ p.texto }}
      </button>
    </div>

    <!-- Tengo un código: se guarda como el QR (volver a /estudiante/clases) y STIRE une la clase al entrar o crear la cuenta. -->
    <form v-if="pestana === 'codigo'" id="panel-codigo" role="tabpanel" aria-labelledby="pestana-codigo" novalidate
      class="flex flex-col gap-4" @submit.prevent="usarCodigo">
      <div class="flex flex-col gap-1.5">
        <label for="codigo-clase" class="text-[15px] font-semibold">Código de la clase</label>
        <input id="codigo-clase" ref="codigoRef" v-model="codigo" type="text" autocapitalize="characters" autocomplete="off"
          spellcheck="false" placeholder="Ej.: ALGO-203413" class="campo-entrar font-mono uppercase tracking-wider"
          :aria-invalid="!!faltaCodigo || undefined" :aria-describedby="faltaCodigo ? 'codigo-falta' : 'codigo-ayuda'"
          @input="codigo = codigoMientrasEscribe(codigo); faltaCodigo = ''" />
        <p v-if="faltaCodigo" id="codigo-falta" class="m-0 text-xs font-semibold text-semantico-falla">{{ faltaCodigo }}</p>
        <p v-else id="codigo-ayuda" class="m-0 text-xs text-base-texto-secundario">Te lo da tu docente. Tiene esta forma: ALGO-203413.</p>
      </div>
      <button type="submit" class="boton-entrar">Unirme a la clase</button>
      <p class="m-0 -mt-1 text-center text-xs text-base-texto-secundario">Si no tienes cuenta, la creas en el siguiente paso.</p>
    </form>

    <template v-else>
      <!-- Error del servidor: no dice si falló el correo o la contraseña. -->
      <Transition name="aviso">
        <div v-if="errorMessage" id="login-error" role="alert" class="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold aviso-error">
          <AlertCircle :size="18" class="shrink-0 mt-px" aria-hidden="true" />
          <span>{{ errorMessage }}<template v-if="noCoinciden"> Revisa las mayúsculas o
            <NuxtLink to="/auth/forgot-password" class="underline">crea una contraseña nueva</NuxtLink>.</template></span>
        </div>
      </Transition>

      <form novalidate @submit.prevent="handleLogin" id="panel-cuenta" role="tabpanel" aria-labelledby="pestana-cuenta" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-[15px] font-semibold">Correo</label>
          <input
            id="email"
            ref="emailRef"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            :aria-invalid="!!(errorMessage || faltan.email) || undefined"
            :aria-describedby="faltan.email ? 'email-falta' : errorMessage ? 'login-error' : undefined"
            placeholder="tu.correo@ejemplo.com"
            class="campo-entrar"
            :class="{ 'campo-con-error': errorMessage || faltan.email }"
            @focus="campoEnFoco = 'email'"
            @blur="campoEnFoco = null"
            @input="faltan.email = undefined" />
          <p v-if="faltan.email" id="email-falta" class="m-0 text-xs font-semibold text-semantico-falla">{{ faltan.email }}</p>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-[15px] font-semibold">Contraseña</label>
          <div class="relative">
            <input
              id="password"
              ref="passwordRef"
              v-model="password"
              :aria-invalid="!!(errorMessage || faltan.password) || undefined"
              :aria-describedby="faltan.password ? 'clave-falta' : errorMessage ? 'login-error' : undefined"
              :type="verClave ? 'text' : 'password'"
              required
              autocomplete="current-password"
              class="campo-entrar pr-12"
              :class="{ 'campo-con-error': errorMessage || faltan.password }"
              @focus="campoEnFoco = 'password'"
              @blur="campoEnFoco = null; bloqMayus = false"
              @keydown="detectarBloqMayus"
              @keyup="detectarBloqMayus"
              @input="faltan.password = undefined" />
            <button
              type="button"
              @click="verClave = !verClave"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-lg text-base-texto-secundario hover:text-base-texto-primario"
              :aria-label="verClave ? 'Ocultar la contraseña' : 'Mostrar la contraseña'" :title="verClave ? 'Ocultar la contraseña' : 'Mostrar la contraseña'"
              :aria-pressed="verClave">
              <EyeOff v-if="verClave" :size="18" aria-hidden="true" />
              <Eye v-else :size="18" aria-hidden="true" />
            </button>
          </div>
          <p v-if="faltan.password" id="clave-falta" class="m-0 text-xs font-semibold text-semantico-falla">{{ faltan.password }}</p>
          <Transition name="aviso">
            <p v-if="bloqMayus" class="m-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold aviso-mayus">
              <AlertTriangle :size="14" aria-hidden="true" /> Bloq Mayús está activado
            </p>
          </Transition>
        </div>

        <div class="flex justify-end">
          <NuxtLink to="/auth/forgot-password" class="py-1 text-sm font-semibold underline">¿Olvidaste tu contraseña?</NuxtLink>
        </div>

        <button type="submit" :disabled="isLoading || accesoConcedido" class="boton-entrar relative overflow-hidden disabled:cursor-wait">
          <span class="brillo-barrido" aria-hidden="true" />
          <template v-if="accesoConcedido">
            <CheckCircle2 :size="18" aria-hidden="true" /> <span>¡Listo!</span>
          </template>
          <template v-else-if="isLoading">
            <span class="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
            <span>Entrando…</span>
          </template>
          <span v-else>Entrar</span>
        </button>
      </form>

      <!-- Demostración (NUXT_PUBLIC_DEMO_MODE=true): una línea sutil; entra de verdad con cuentas sembradas (stores/auth.ts). -->
      <div v-if="demoModeEnabled" class="flex items-center justify-center flex-wrap gap-1.5" title="Explora STIRE con datos de ejemplo, sin crear cuenta">
        <span class="text-xs text-base-texto-secundario mr-0.5">Solo mirar:</span>
        <button v-for="demo in accesosDemo" :key="demo.rol" type="button" class="chip-demo" :class="demo.tono" :disabled="isLoading"
          @click="quickDemoLogin(demo.rol)">{{ demo.titulo }}</button>
      </div>
    </template>

    <div class="flex items-center gap-3 text-[13px] font-semibold text-base-texto-secundario">
      <span class="flex-1 h-px bg-base-borde-sutil" aria-hidden="true" />¿Primera vez?<span class="flex-1 h-px bg-base-borde-sutil" aria-hidden="true" />
    </div>
    <div class="grid grid-cols-2 gap-2.5">
      <button v-if="pestana === 'cuenta'" type="button" class="boton-secundario" @click="pestana = 'codigo'">Tengo un código</button>
      <button v-else type="button" class="boton-secundario" @click="pestana = 'cuenta'">Ya tengo cuenta</button>
      <NuxtLink :to="{ path: '/auth/register', query: route.query }" class="boton-secundario">Crear cuenta</NuxtLink>
    </div>
  </AuthMarcoEntrar>
</template>

<script setup lang="ts">
import { faltantesDelIngreso } from '~/utils/registro'
import { AlertCircle, AlertTriangle, CheckCircle2, Eye, EyeOff, QrCode } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { codigoDeLaVuelta, codigoMientrasEscribe, normalizarCodigo, rutaDeVuelta } from '~/utils/codigoClase'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const demoModeEnabled = config.public.demoMode
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const faltan = ref<Partial<Record<'email' | 'password', string>>>({})
const emailRef = ref<HTMLInputElement | null>(null)
const passwordRef = ref<HTMLInputElement | null>(null)

// ─── Pestañas: «Tengo un código» y «Ya tengo cuenta» (esta, la de siempre, abierta) ───
const PESTANAS = [
  { id: 'codigo', texto: 'Tengo un código' },
  { id: 'cuenta', texto: 'Ya tengo cuenta' },
] as const
const pestana = ref<'codigo' | 'cuenta'>(route.query.forma === 'codigo' ? 'codigo' : 'cuenta') // «Unirme a una clase» abre el código
function cambiarPestana() {
  pestana.value = pestana.value === 'cuenta' ? 'codigo' : 'cuenta'
  nextTick(() => document.getElementById(`pestana-${pestana.value}`)?.focus())
}

const codigo = ref('')
const faltaCodigo = ref('')
const codigoRef = ref<HTMLInputElement | null>(null)
/** El código de la clase que trae «volver» (el QR o «Tengo un código»), para mostrarlo mientras entra. */
const codigoDeVuelta = computed(() => codigoDeLaVuelta(route.query.volver))
/** Guarda el código como lo guarda el QR y pasa a entrar; «Crear cuenta» lo lleva consigo. */
async function usarCodigo() {
  const limpio = normalizarCodigo(codigo.value)
  if (!limpio) {
    faltaCodigo.value = 'Escribe el código de tu clase, por ejemplo ALGO-203413.'
    codigoRef.value?.focus()
    return
  }
  await router.replace({ query: { ...route.query, volver: `/estudiante/clases?codigo=${encodeURIComponent(limpio)}` } })
  pestana.value = 'cuenta'
}

// En computador el cursor queda listo en el correo; en el celular no, para no abrir el teclado encima de la página.
onMounted(() => {
  if (window.matchMedia?.('(pointer: fine)').matches) emailRef.value?.focus()
})
watch(pestana, (p) => nextTick(() => (p === 'codigo' ? codigoRef : emailRef).value?.focus()))

// Solo presentación: foco, ver la clave, Bloq Mayús y confirmación antes de entrar.
const campoEnFoco = ref<'email' | 'password' | null>(null)
const verClave = ref(false)
const bloqMayus = ref(false)
const accesoConcedido = ref(false)

function detectarBloqMayus(evento: KeyboardEvent) {
  bloqMayus.value = evento.getModifierState?.('CapsLock') ?? false
}

const accesosDemo = [
  { rol: 'estudiante' as const, titulo: 'Estudiante', tono: 'chip-menta' },
  { rol: 'docente' as const, titulo: 'Docente', tono: 'chip-sol' },
  { rol: 'administrador' as const, titulo: 'Administrador', tono: 'chip-cielo' },
]

function rutaDelRol(role: string | null | undefined) {
  if (role === 'docente') return '/docente'
  if (role === 'administrador') return '/admin'
  return '/estudiante'
}

/** Muestra «Abriendo tu inicio…» un instante antes de entrar (con «reducir movimiento» entra de inmediato). */
async function entrar(ruta: string) {
  accesoConcedido.value = true
  const sinMovimiento = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!sinMovimiento) await new Promise((r) => setTimeout(r, 700))
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

/** No dice cuál de los dos falló (seguridad), pero sí qué hacer: revisar las mayúsculas o crear una contraseña nueva. */
const noCoinciden = ref(false)
function mensajeDeError(error: string | undefined): string {
  const texto = error || 'No se pudo iniciar sesión.'
  noCoinciden.value = /incorrect/i.test(texto)
  return noCoinciden.value ? 'El correo o la contraseña no coinciden.' : texto
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

<!-- Estilos en assets/css/entrar-v3.css (también para el registro). -->
