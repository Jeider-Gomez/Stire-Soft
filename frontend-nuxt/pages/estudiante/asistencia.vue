<template>
  <!-- «Mi clase» › Asistencia (v3, Fase D, paso 5; cuadros «E-Clase-Asistencia» y «E-Cel-Asistencia»): a la izquierda el código
       que cambia cada 20 segundos (src/asistencia); a la derecha, cómo va en esta clase y sus sesiones. Las demás clases,
       recogidas. Ausente no va en rojo de error: se dice con texto, y se puede pedir que el profe la cambie a excusa. -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <EstudianteClaseCabecera />

    <div class="grid gap-[18px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start">
      <section class="tarjeta-inicio flex flex-col items-center gap-3 text-center" style="--acento: 0 194 168; --acento2: 92 203 255" aria-labelledby="mi-codigo-titulo">
        <h2 id="mi-codigo-titulo" class="titulo-tarjeta self-stretch text-left">Mi código de asistencia</h2>
        <div class="flex items-center gap-3">
          <AvatarUsuario :nombre="authStore.user?.fullName" :foto-id="authStore.user?.fotoId" tamano="w-10 h-10 text-sm" decorativo />
          <p class="m-0 text-base font-bold text-base-texto-primario">{{ authStore.user?.fullName }}</p>
        </div>
        <div class="relative bg-white p-3 rounded-2xl border border-base-borde-sutil">
          <canvas ref="qrCanvas" aria-label="Tu código QR de asistencia" role="img" class="block w-64 h-64 max-w-full" />
          <div v-if="cargandoCodigo && !hayCodigo" class="absolute inset-0 flex items-center justify-center" role="status">
            <Loader2 :size="20" class="animate-spin text-base-texto-secundario" aria-hidden="true" />
            <span class="sr-only">Generando tu código…</span>
          </div>
        </div>
        <!-- Cuánto le queda al código (hallazgo de José, 09/10: la barra de 6 px no se notaba). Ahora es más gruesa, con
             borde, y dice los segundos en palabras; los últimos 5 s cambia a ámbar. No se anuncia cada segundo al lector
             de pantalla: solo el texto, que se lee al llegar a él. -->
        <div class="w-64 max-w-full space-y-1">
          <div class="h-3 rounded-full bg-base-bg-secundario border border-base-borde-fuerte overflow-hidden" aria-hidden="true">
            <div class="h-full rounded-full transition-[width] duration-1000 ease-linear" :class="segundos <= 5 ? 'bg-acento-ambar-fuerte' : 'bg-stire-teal'" :style="{ width: `${restante}%` }" />
          </div>
          <p v-if="hayCodigo" class="flex items-center justify-center gap-1.5 text-xs font-semibold text-base-texto-primario tabular-nums">
            <RefreshCw :size="13" aria-hidden="true" /> {{ textoCuentaQr(segundos) }}
          </p>
        </div>
        <MensajeError v-if="errorCodigo" class="text-xs">{{ errorCodigo }}</MensajeError>
        <p class="m-0 text-[15px] leading-relaxed">Muéstrale la pantalla al profe: <strong>su cámara lo lee</strong> y quedas marcado. No tienes que escribir nada.</p>
        <p v-if="!errorCodigo" class="m-0 text-[13px] text-base-texto-secundario">Sube el brillo si a la cámara le cuesta leerlo.</p>
        <p class="m-0 text-[13px] text-base-texto-secundario"><strong>Por qué:</strong> el código cambia cada 20 segundos y va con tu celular: una foto no le sirve a otra persona.</p>
      </section>

      <section class="space-y-[18px]" aria-labelledby="historial-titulo">
        <h2 id="historial-titulo" class="sr-only">Asistencia por clase</h2>
        <p v-if="cargando" role="status" class="text-sm text-base-texto-secundario">Cargando…</p>
        <MensajeError v-else-if="error" class="text-xs" :reintentar="cargarHistorial">{{ error }}</MensajeError>
        <p v-else-if="!clases.length" class="text-sm text-base-texto-secundario">Aún no estás en ninguna clase.</p>
        <template v-else>
          <article v-for="(c, i) in clasesOrdenadas" v-show="i === 0 || verOtras" :key="c.classId" class="tarjeta-inicio space-y-3" style="--acento: 255 201 77; --acento2: 209 47 58">
            <div class="flex items-center justify-between gap-2">
              <h3 class="titulo-tarjeta !text-[17px] min-w-0 truncate">
                <span v-if="c.classId === studentStore.currentClassId" class="mr-1.5 pastilla-inicio pastilla-sol align-middle">Clase actual</span>{{ c.clase }}
              </h3>
              <span class="text-[13px] font-bold shrink-0">{{ c.porcentaje === null ? 'Sin registros' : `${c.porcentaje} % de asistencia` }}</span>
            </div>
            <ul v-if="c.sesiones.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2 m-0 p-0 list-none" aria-label="Cuántas veces de cada una">
              <li v-for="e in ESTADOS" :key="e.id" class="rounded-xl px-3 py-2 border" :class="e.clase">
                <strong class="block font-poppins text-[22px] leading-none">{{ c.sesiones.filter((s) => s.estado === e.id).length }}</strong>
                <span class="text-[13px] font-semibold">{{ e.texto }}</span>
              </li>
            </ul>
            <p v-if="!c.sesiones.length" class="m-0 text-sm text-base-texto-secundario">Tu docente aún no ha tomado asistencia en esta clase.</p>
            <ul v-else class="m-0 p-0 list-none divide-y divide-base-borde-sutil text-sm">
              <li v-for="s in c.sesiones" :key="s.id" class="flex items-center justify-between gap-2 py-2">
                <span class="text-base-texto-primario min-w-0 truncate">{{ fechaSesion(s.fecha) }}<span v-if="s.tema" class="text-base-texto-secundario"> · {{ s.tema }}</span></span>
                <span class="px-2.5 py-0.5 rounded-full border text-xs font-bold shrink-0" :class="claseEstado(s.estado)">{{ textoEstado(s.estado) }}</span>
              </li>
            </ul>
            <p v-if="i === 0" class="m-0 text-[13px] text-base-texto-secundario">
              ¿Faltaste por algo justificado? <NuxtLink to="/estudiante/mensajes" class="font-bold underline">Escríbele al profe</NuxtLink> y él la cambia a excusa.
            </p>
          </article>
          <button v-if="clasesOrdenadas.length > 1" type="button" class="min-h-[44px] text-sm font-semibold underline" :aria-expanded="verOtras" @click="verOtras = !verOtras">
            {{ verOtras ? 'Ocultar mis otras clases' : `Ver mis otras clases (${clasesOrdenadas.length - 1})` }}
          </button>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2, RefreshCw } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { useAsistenciaEstudiante } from '~/composables/useAsistenciaEstudiante'
import { ESTADOS, claseActualPrimero, fechaSesion, idDeDispositivo, textoCuentaQr, textoEstado, type EstadoAsistencia } from '~/utils/asistencia'
import type { ClaseAsistenciaEstudiante as ClaseAsistencia } from '~/composables/useAsistenciaEstudiante'

definePageMeta({ layout: 'student' })

const authStore = useAuthStore()
const servicioAsistencia = useAsistenciaEstudiante()
const { messageOf } = useApiErrorMessage()

const qrCanvas = ref<HTMLCanvasElement | null>(null)
const hayCodigo = ref(false)
const cargandoCodigo = ref(true)
const errorCodigo = ref<string | null>(null)
const restante = ref(100)
const segundos = ref(20)
const clases = ref<ClaseAsistencia[]>([])
const studentStore = useStudentStore()
const clasesOrdenadas = computed(() => claseActualPrimero(clases.value, studentStore.currentClassId))
const cargando = ref(true)
/** Las demás clases, recogidas: la cabecera es de la clase actual. */
const verOtras = ref(false)
const error = ref<string | null>(null)

let temporizador: ReturnType<typeof setTimeout> | null = null
let reloj: ReturnType<typeof setInterval> | null = null
let vence = 0
let ventana = 20_000
let activo = true

const claseEstado = (e: EstadoAsistencia | null) => ESTADOS.find((x) => x.id === e)?.clase ?? 'border-base-borde-fuerte text-base-texto-secundario'

async function renovarCodigo() {
  if (!activo) return
  cargandoCodigo.value = true
  try {
    const r = await servicioAsistencia.codigo(idDeDispositivo())
    const QRCode = await import('qrcode')
    if (qrCanvas.value) await QRCode.toCanvas(qrCanvas.value, r.codigo, { width: 256, margin: 1, errorCorrectionLevel: 'M' })
    hayCodigo.value = true
    errorCodigo.value = null
    ventana = r.ventanaMs
    vence = Date.now() + r.venceEnMs
    // Se pide el siguiente justo al cambiar la ventana (el anterior sigue valiendo 20 s más, por si hay retraso).
    temporizador = setTimeout(renovarCodigo, r.venceEnMs + 300)
  } catch (err) {
    errorCodigo.value = messageOf(err, 'No se pudo generar tu código. Reintentando…')
    temporizador = setTimeout(renovarCodigo, 5000)
  } finally {
    cargandoCodigo.value = false
  }
}

async function cargarHistorial() {
  try {
    clases.value = await servicioAsistencia.historial()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar tu asistencia.')
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  renovarCodigo()
  cargarHistorial()
  reloj = setInterval(() => {
    const falta = Math.max(0, vence - Date.now())
    restante.value = Math.min(100, (falta / ventana) * 100)
    segundos.value = Math.ceil(falta / 1000)
  }, 1000)
})

onBeforeUnmount(() => {
  activo = false
  if (temporizador) clearTimeout(temporizador)
  if (reloj) clearInterval(reloj)
})
</script>
