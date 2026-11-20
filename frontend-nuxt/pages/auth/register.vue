<template>
  <!-- v3 (Fase C; cuadro «Entrar-estados» › «Crear cuenta»): el mismo marco que Entrar (AuthMarcoEntrar). Se conserva
       el registro en dos pasos (BT-27): el paso 1 es solo lo obligatorio y «Crear mi cuenta» se ve sin bajar; el paso 2
       es opcional, con botón aparte. Sin «confirmar contraseña»: el ojo para verla evita el mismo error. -->
  <AuthMarcoEntrar compacto :mascota="{ campo: campoEnFoco, verClave, error: !!errorMessage, listo: isLoading, pestana: 'cuenta' }">
    <div>
      <h1 class="m-0 font-poppins font-bold text-[24px] sm:text-[28px]">Crear cuenta</h1>
      <p class="mt-1 mb-0 text-xs font-bold tracking-[.06em] uppercase text-base-texto-secundario" aria-live="polite">
        {{ paso === 1 ? 'Paso 1 de 2 · Lo necesario' : selectedRole === 'estudiante' ? 'Paso 2 de 2 · Activa tu Tutor' : 'Paso 2 de 2 · Opcional' }}
      </p>
    </div>

    <!-- Llegó con el QR o el código de una clase: se ve a qué clase se va a unir mientras crea la cuenta. -->
    <p v-if="codigoDeVuelta" class="m-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold aviso-clase">
      <QrCode :size="18" aria-hidden="true" class="shrink-0" />
      <span>Al crear tu cuenta te unes a la clase <span class="font-mono">{{ codigoDeVuelta }}</span>.</span>
    </p>

    <Transition name="aviso">
      <div v-if="errorMessage" role="alert" class="flex items-start gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold aviso-error">
        <AlertCircle :size="18" class="shrink-0 mt-px" aria-hidden="true" />
        <span>{{ errorMessage }}</span>
      </div>
    </Transition>

    <!-- Aviso de solicitud de rol docente pendiente (§23 T3) -->
    <div v-if="roleRequestSuccessNotice" role="alert" class="p-3 rounded-xl bg-semantico-falla/10 border-2 border-l-8 border-semantico-falla text-xs text-semantico-falla space-y-2">
      <div class="flex items-start gap-2">
        <ShieldAlert :size="18" class="shrink-0" aria-hidden="true" />
        <div>
          <p class="m-0 text-sm font-bold">Todavía no eres docente</p>
          <p class="m-0 text-base-texto-primario">{{ roleRequestSuccessNotice }}</p>
        </div>
      </div>
      <button type="button" class="boton-entrar w-full" @click="navigateTo('/estudiante')">Ir al inicio del estudiante</button>
    </div>

    <!-- Aviso no bloqueante de clave no guardada (§19.1) -->
    <div v-if="tutorKeyWarning" role="status" class="flex items-start gap-2 p-3 rounded-xl text-xs aviso-mayus">
      <AlertTriangle :size="16" class="shrink-0" aria-hidden="true" />
      <span>{{ tutorKeyWarning }}</span>
    </div>

    <form ref="formRef" novalidate class="flex flex-col gap-3.5" @submit.prevent="handleRegister">
      <!-- PASO 1: lo obligatorio -->
      <div v-show="paso === 1" id="paso-obligatorio" class="flex flex-col gap-3.5">
        <!-- Tipo de cuenta primero: cambia lo que se pide después (§23 T3). Radios reales con forma de botón. -->
        <fieldset class="m-0 p-0 border-0">
          <legend class="mb-1.5 text-[15px] font-semibold">Voy a usar STIRE como</legend>
          <div class="grid grid-cols-2 gap-2">
            <label v-for="r in ROLES" :key="r.valor" class="opcion-rol" :class="{ elegida: selectedRole === r.valor }">
              <input v-model="selectedRole" type="radio" name="accountType" :value="r.valor" class="sr-only">
              {{ r.texto }}
            </label>
          </div>
        </fieldset>

        <!-- Docente: qué pasa con la solicitud. Rojo porque es importante (pedido de Jeider, 02/10). -->
        <p v-if="selectedRole === 'docente'" class="m-0 -mt-1 flex items-start gap-1.5 p-2.5 rounded-xl bg-semantico-falla/10 border border-semantico-falla/40 text-xs text-semantico-falla font-semibold">
          <ShieldAlert :size="14" class="shrink-0 mt-px" aria-hidden="true" />
          Entrarás como estudiante hasta que el administrador apruebe tu solicitud.
        </p>

        <!-- En computador, nombre y correo lado a lado: «Crear mi cuenta» se ve sin bajar en 1366×657 (BT-27). -->
        <div class="grid lg:grid-cols-2 gap-3.5 lg:gap-3 items-start">
          <div class="flex flex-col gap-1.5">
            <label for="fullName" class="text-[15px] font-semibold">Nombre y apellido</label>
            <input id="fullName" ref="nombreRef" v-model="fullName" type="text" required autocomplete="name" placeholder="Ej.: Laura Martínez"
              class="campo-entrar" :class="{ 'campo-con-error': faltan.fullName }" :aria-invalid="!!faltan.fullName || undefined"
              :aria-describedby="faltan.fullName ? 'nombre-falta' : undefined" />
            <p v-if="faltan.fullName" id="nombre-falta" class="m-0 text-xs font-semibold text-semantico-falla">{{ faltan.fullName }}</p>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="email" class="text-[15px] font-semibold">Correo</label>
            <input id="email" v-model="email" type="email" required autocomplete="email" placeholder="tu@correo.com"
              class="campo-entrar" :class="{ 'campo-con-error': faltan.email }" :aria-invalid="!!faltan.email || undefined"
              :aria-describedby="faltan.email ? 'correo-falta' : undefined" />
            <p v-if="faltan.email" id="correo-falta" class="m-0 text-xs font-semibold text-semantico-falla">{{ faltan.email }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-[15px] font-semibold">Contraseña</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="verClave ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Crea una contraseña"
              aria-describedby="reglas-clave"
              :aria-invalid="!!faltan.password || undefined"
              class="campo-entrar pr-12"
              :class="{ 'campo-con-error': faltan.password }"
              @focus="campoEnFoco = 'password'"
              @blur="campoEnFoco = null; bloqMayus = false"
              @keydown="detectarBloqMayus"
              @keyup="detectarBloqMayus" />
            <button
              type="button"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-lg text-base-texto-secundario hover:text-base-texto-primario"
              :aria-label="verClave ? 'Ocultar la contraseña' : 'Mostrar la contraseña'" :title="verClave ? 'Ocultar la contraseña' : 'Mostrar la contraseña'"
              :aria-pressed="verClave"
              @click="verClave = !verClave">
              <EyeOff v-if="verClave" :size="18" aria-hidden="true" />
              <Eye v-else :size="18" aria-hidden="true" />
            </button>
          </div>
          <Transition name="aviso">
            <p v-if="bloqMayus" class="m-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold aviso-mayus">
              <AlertTriangle :size="14" aria-hidden="true" /> Bloq Mayús está activado
            </p>
          </Transition>
          <!-- JEIDER-S08-12: barra de fuerza con color y texto, y las reglas del servidor siempre a la vista. -->
          <AuthFuerzaClave id="reglas-clave" :clave="password" :falta="!!faltan.password" />
        </div>
      </div>

      <!-- PASO 2: lo opcional. Nada de esto es necesario para entrar; todo se puede hacer después. -->
      <div v-show="paso === 2" id="paso-opcional" class="flex flex-col gap-4">
        <p class="m-0 text-sm text-base-texto-secundario">
          {{ selectedRole === 'docente'
            ? 'Ayuda al administrador a aprobar tu solicitud más rápido.'
            : 'El Tutor te explica cuando un ejercicio no sale. Necesita una clave gratuita de Google: ponla ahora, una sola vez, y no te interrumpe después en mitad de una lección.' }}
        </p>

        <div v-if="selectedRole === 'docente'" class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <label for="teacherReason" class="text-[15px] font-semibold">¿Qué materia o dependencia?</label>
            <span class="text-[11px] text-base-texto-secundario font-mono">{{ teacherReason.length }}/300</span>
          </div>
          <textarea id="teacherReason" v-model="teacherReason" v-crece maxlength="300" rows="2"
            placeholder="Ej.: Docente de Algoritmia y Programación Web" class="campo-entrar py-3 resize-none"></textarea>
        </div>


        <!-- Clave de Google AI Studio (§19.1): solo estudiantes, el Tutor es solo para ellos (src/tutor/tutor.controller.ts). -->
        <div v-if="selectedRole === 'estudiante'" class="caja-clave flex flex-col gap-2 p-3 rounded-xl">
          <label for="apiKey" class="flex items-center gap-1.5 text-[15px] font-semibold">
            <Bot :size="16" aria-hidden="true" />
            Clave de Google AI Studio
            <span class="text-xs font-normal text-base-texto-secundario">(para usar el Tutor)</span>
          </label>
          <p class="m-0 text-xs text-base-texto-secundario">
            Es gratis y no pide tarjeta. Sigue los pasos: Google se abre en otra pestaña y esta te espera con lo que ya escribiste.
          </p>
          <!-- La misma guía del Tutor, aquí donde se crea la cuenta: al volver de Google esta pestaña sigue con lo escrito. -->
          <details open class="guia-clave-registro rounded-lg border border-base-borde-sutil bg-base-blanco px-3">
            <summary class="cursor-pointer min-h-[44px] flex items-center gap-1.5 text-sm font-semibold text-base-texto-primario">¿Cómo consigo la clave? (5 pasos, unos 2 minutos)</summary>
            <div class="pb-3"><GuiaClaveGoogle video-abierto /></div>
          </details>
          <div class="relative">
            <input id="apiKey" v-model="apiKey" aria-describedby="clave-falta" style="font-size:16px" :type="showApiKey ? 'text' : 'password'" autocomplete="off" placeholder="AIzaSy…" class="campo-entrar pr-12 text-sm font-mono" />
            <button type="button" :aria-label="showApiKey ? 'Ocultar la clave' : 'Mostrar la clave'" :title="showApiKey ? 'Ocultar la clave' : 'Mostrar la clave'"
              :aria-pressed="showApiKey" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-lg text-base-texto-secundario hover:text-base-texto-primario"
              @click="showApiKey = !showApiKey">
              <EyeOff v-if="showApiKey" :size="18" aria-hidden="true" />
              <Eye v-else :size="18" aria-hidden="true" />
            </button>
          </div>
          <p v-if="avisoClave" id="clave-falta" role="alert" class="m-0 flex items-start gap-1.5 text-xs font-semibold text-semantico-falla"><AlertCircle :size="14" class="shrink-0 mt-px" aria-hidden="true" /><span>{{ avisoClave }}</span></p>
          <!-- Aviso de privacidad §19.3 -->
          <p class="m-0 flex items-start gap-1.5 text-[11px] text-base-texto-secundario">
            <ShieldCheck :size="14" class="shrink-0 mt-px" aria-hidden="true" />
            <span>
              Tu clave se guarda cifrada y solo sirve para hablar con el Tutor; nadie del equipo puede verla.
              Las preguntas que le haces al Tutor se envían a Google usando <strong>tu</strong> cuenta.
              En la capa gratuita, Google puede usar ese contenido para mejorar sus productos: no escribas
              datos personales ni contraseñas en el chat.
            </span>
          </p>
        </div>
        <div v-if="selectedRole === 'estudiante'" class="flex flex-col gap-1.5">
          <label for="classCode" class="text-[15px] font-semibold">Código de la clase <span class="text-xs font-normal text-base-texto-secundario">(opcional)</span></label>
          <input id="classCode" v-model="classCode" type="text" autocapitalize="characters" autocomplete="off" spellcheck="false"
            placeholder="Ej.: ALGO-203413" class="campo-entrar font-mono uppercase tracking-wider" aria-describedby="codigo-ayuda-registro"
            @input="alEscribirCodigo" />
          <p v-if="avisoCodigo" role="alert" class="m-0 flex items-start gap-1.5 text-xs font-semibold text-semantico-falla"><AlertCircle :size="14" class="shrink-0 mt-px" aria-hidden="true" /><span>{{ avisoCodigo }}</span></p>
          <p id="codigo-ayuda-registro" class="m-0 text-xs text-base-texto-secundario">Si tu docente te dio un código, escríbelo para entrar a su clase de una vez.</p>
        </div>
      </div>

      <!-- Público de 18 años o más: una sola casilla con edad, términos y fines investigativos (utils/legal.ts). -->
      <LegalCasillasAceptacion v-model:mayor-de-edad="confirmaMayorDeEdad" v-model:terminos="aceptaTerminos" v-model:investigacion="consienteInvestigacion" :falta="faltaAceptar" />

      <!-- Acciones: «Crear mi cuenta» siempre a la vista; lo opcional es un botón aparte. -->
      <button v-if="paso === 1 && selectedRole === 'estudiante'" type="button" class="boton-entrar gap-1.5" @click="irAOpcional">
        Siguiente: activa tu Tutor <ChevronRight :size="16" aria-hidden="true" />
      </button>
      <button v-else type="submit" :disabled="isLoading" class="boton-entrar relative overflow-hidden disabled:cursor-wait">
        <span class="brillo-barrido" aria-hidden="true" />
        <template v-if="isLoading">
          <span class="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
          <span>Creando tu cuenta…</span>
        </template>
        <span v-else>{{ selectedRole === 'estudiante' ? 'Crear mi cuenta con el Tutor activo' : 'Crear mi cuenta' }}</span>
      </button>
      <!-- Se puede seguir sin la clave, pero hay que confirmarlo: el Tutor es parte de cómo se aprende en STIRE. -->
      <button v-if="paso === 2 && selectedRole === 'estudiante'" type="button" class="min-h-[44px] text-sm font-semibold underline text-base-texto-secundario" :disabled="isLoading" @click="seguirSinClave">
        {{ confirmarSinClave ? 'Sí, crear la cuenta sin el Tutor por ahora' : 'Seguir sin el Tutor' }}
      </button>
      <p v-if="confirmarSinClave" role="status" class="m-0 -mt-2 text-xs text-center text-base-texto-secundario">Sin la clave, el Tutor no podrá ayudarte cuando un ejercicio no salga. La puedes poner luego desde el Tutor.</p>
      <button v-if="paso === 1 && selectedRole === 'docente'" id="ir-opcional" type="button" class="boton-secundario gap-1.5 text-[15px]" @click="irAOpcional">
        Paso 2, opcional: la materia que dictas
        <ChevronRight :size="16" aria-hidden="true" />
      </button>
      <button v-if="paso === 2" type="button" class="boton-secundario gap-1.5 text-[15px]" @click="paso = 1">
        <ArrowLeft :size="16" aria-hidden="true" /> Volver a mis datos
      </button>
    </form>

    <p class="m-0 pt-3 border-t border-base-borde-sutil text-center text-sm text-base-texto-secundario">
      ¿Ya tienes cuenta?
      <NuxtLink :to="{ path: '/auth/login', query: route.query }" class="font-semibold underline text-base-texto-primario">Entrar</NuxtLink>
    </p>
  </AuthMarcoEntrar>
</template>

<script setup lang="ts">
import { AlertCircle, AlertTriangle, ArrowLeft, Bot, ChevronRight, Eye, EyeOff, QrCode, ShieldAlert, ShieldCheck } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useCuentaPublica } from '~/composables/useCuentaPublica'
import { codigoDeLaVuelta, codigoMientrasEscribe, pareceClaveDeGoogle, rutaDeVuelta } from '~/utils/codigoClase'
import { faltantesDelRegistro, type Faltantes } from '~/utils/registro'
import { revisarFormatoClave } from '~/utils/claveGoogle'

const route = useRoute()

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const cuentaPublica = useCuentaPublica()
const fullName = ref('')
const email = ref('')
const password = ref('')
const classCode = ref('')
const selectedRole = ref<'estudiante' | 'docente'>(route.query.rol === 'docente' ? 'docente' : 'estudiante') // «Soy docente» de la página de inicio
const teacherReason = ref('')
const ROLES = [{ valor: 'estudiante', texto: 'Estudiante' }, { valor: 'docente', texto: 'Docente' }] as const
const codigoDeVuelta = computed(() => codigoDeLaVuelta(route.query.volver))
const apiKey = ref('')
const showApiKey = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const tutorKeyWarning = ref('')
const roleRequestSuccessNotice = ref('')
const confirmaMayorDeEdad = ref(false)
const aceptaTerminos = ref(false)
const consienteInvestigacion = ref(false)
const faltaAceptar = ref(false)

// Si pega la clave de Google en el código de la clase, se pasa sola al campo de la clave (prueba con usuarios, 11/2026).
const avisoCodigo = ref('')
function alEscribirCodigo() {
  if (pareceClaveDeGoogle(classCode.value)) {
    if (!apiKey.value.trim()) apiKey.value = classCode.value.trim()
    classCode.value = ''
    avisoCodigo.value = 'Eso era tu clave de Google: la pasamos al campo de la clave, arriba. Aquí va el código que te dio tu docente.'
    return
  }
  avisoCodigo.value = ''
  classCode.value = codigoMientrasEscribe(classCode.value)
}

// Pasos del registro y validación propia (el formulario usa novalidate: los mensajes del navegador no dicen qué regla
// de la contraseña falta y, con el paso 2 abierto, apuntaban a campos ocultos).
const paso = ref<1 | 2>(1)
const nombreRef = ref<HTMLInputElement | null>(null)
const faltan = ref<Faltantes>({})
const validar = () => (faltan.value = faltantesDelRegistro(fullName.value, email.value, password.value))
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

// Solo presentación: foco (la mascota no mira la contraseña), ver la clave, Bloq Mayús y medidor de fuerza.
const campoEnFoco = ref<'password' | null>(null)
const verClave = ref(false)
const bloqMayus = ref(false)

function detectarBloqMayus(evento: KeyboardEvent) {
  bloqMayus.value = evento.getModifierState?.('CapsLock') ?? false
}


// La clave del Tutor en el registro del estudiante (17/11, Pedro y Jeider): se pide en el paso 2; seguir sin ella se confirma.
let sinClaveConfirmado = false
const confirmarSinClave = ref(false)
const avisoClave = ref('')
watch(apiKey, () => { avisoClave.value = ''; confirmarSinClave.value = false })
function seguirSinClave() {
  if (!confirmarSinClave.value) { confirmarSinClave.value = true; return }
  apiKey.value = ''
  sinClaveConfirmado = true
  void handleRegister()
}

async function handleRegister() {
  if (Object.keys(validar()).length) { enfocarPrimerFaltante(); return }
  if (selectedRole.value === 'estudiante' && !sinClaveConfirmado) {
    if (paso.value === 1) { paso.value = 2; return }
    avisoClave.value = apiKey.value.trim() ? (revisarFormatoClave(apiKey.value) ?? '') : 'Pega aquí tu clave, o toca «Seguir sin el Tutor».'
    if (avisoClave.value) { nextTick(() => document.getElementById('apiKey')?.focus()); return }
  }
  faltaAceptar.value = !confirmaMayorDeEdad.value || !aceptaTerminos.value
  if (faltaAceptar.value) { document.getElementById('acepta-condiciones')?.focus(); return }

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
    selectedRole.value === 'docente' ? teacherReason.value : undefined,
    { confirmaMayorDeEdad: true, aceptaTerminos: true, consienteInvestigacion: consienteInvestigacion.value }
  )

  isLoading.value = false

  if (result.ok) {
    // Si el estudiante ingresó una clave, guardarla (no bloqueante — §19.1)
    if (selectedRole.value === 'estudiante' && apiKey.value.trim()) {
      try {
        await cuentaPublica.asociarClaveTutor(apiKey.value.trim())
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
/* Los campos, botones y avisos son los de Entrar (assets/css/entrar-v3.css). */
.opcion-rol {
  display: flex; align-items: center; justify-content: center; min-height: 46px; border-radius: 12px; cursor: pointer;
  border: 1px solid rgb(var(--c-base-borde-fuerte)); background: rgb(var(--c-base-blanco)); color: rgb(var(--c-base-texto-primario));
  font-size: 15px; font-weight: 600;
}
.opcion-rol.elegida { border: 2px solid rgb(var(--c-base-texto-primario)); font-weight: 700; }
.opcion-rol:focus-within { outline: 3px solid rgb(var(--c-sec-menta) / 0.45); outline-offset: 1px; }
.caja-clave { border: 1px solid rgb(var(--c-base-borde-sutil)); background: rgb(var(--c-base-bg-primario)); }
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
