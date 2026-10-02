<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm">
      <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Mi asistencia</h1>
      <p class="text-xs text-base-texto-secundario mt-0.5">
        Cuando tu docente tome asistencia, muéstrale este código desde tu celular. Cambia cada 20 segundos, así que una
        foto del código no sirve para marcar a otra persona.
      </p>
    </header>

    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col items-center gap-3 text-center" aria-labelledby="mi-codigo-titulo">
      <h2 id="mi-codigo-titulo" class="sr-only">Mi código de asistencia</h2>
      <div class="flex items-center gap-3">
        <AvatarUsuario :nombre="authStore.user?.fullName" :foto-id="authStore.user?.fotoId" tamano="w-12 h-12 text-base" decorativo />
        <p class="text-base font-bold text-base-texto-primario">{{ authStore.user?.fullName }}</p>
      </div>
      <div class="relative bg-white p-3 rounded-xl border border-base-borde-sutil">
        <canvas ref="qrCanvas" aria-label="Tu código QR de asistencia" role="img" class="block w-64 h-64 max-w-full" />
        <div v-if="cargandoCodigo && !hayCodigo" class="absolute inset-0 flex items-center justify-center" role="status">
          <Loader2 :size="20" class="animate-spin text-base-texto-secundario" aria-hidden="true" />
          <span class="sr-only">Generando tu código…</span>
        </div>
      </div>
      <div class="w-64 max-w-full h-1.5 rounded-full bg-base-bg-secundario overflow-hidden" aria-hidden="true">
        <div class="h-full bg-stire-teal transition-[width] duration-1000 ease-linear" :style="{ width: `${restante}%` }" />
      </div>
      <p v-if="errorCodigo" role="alert" class="text-xs text-semantico-falla">{{ errorCodigo }}</p>
      <p v-else class="text-[11px] text-base-texto-secundario">Sube el brillo de la pantalla si al docente le cuesta leerlo.</p>
    </section>

    <section class="space-y-3" aria-labelledby="historial-titulo">
      <h2 id="historial-titulo" class="text-sm font-bold text-base-texto-primario">Asistencia por clase</h2>
      <p v-if="cargando" role="status" class="text-xs text-base-texto-secundario">Cargando…</p>
      <p v-else-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
      <p v-else-if="!clases.length" class="text-xs text-base-texto-secundario">Aún no estás en ninguna clase.</p>
      <article v-for="c in clases" :key="c.classId" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-4 shadow-sm space-y-2">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-sm font-bold text-base-texto-primario truncate">{{ c.clase }}</h3>
          <span class="text-xs font-bold shrink-0" :class="c.porcentaje === null ? 'text-base-texto-secundario' : c.porcentaje >= 80 ? 'text-semantico-pasa' : 'text-semantico-falla'">
            {{ c.porcentaje === null ? 'Sin registros' : `${c.porcentaje} % de asistencia` }}
          </span>
        </div>
        <p v-if="!c.sesiones.length" class="text-xs text-base-texto-secundario">Tu docente aún no ha tomado asistencia en esta clase.</p>
        <ul v-else class="divide-y divide-base-borde-sutil text-xs">
          <li v-for="s in c.sesiones" :key="s.id" class="flex items-center justify-between gap-2 py-1.5">
            <span class="text-base-texto-primario min-w-0 truncate">{{ fechaSesion(s.fecha) }}<span v-if="s.tema" class="text-base-texto-secundario"> · {{ s.tema }}</span></span>
            <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold shrink-0" :class="claseEstado(s.estado)">{{ textoEstado(s.estado) }}</span>
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import { ESTADOS, fechaSesion, idDeDispositivo, textoEstado, type EstadoAsistencia } from '~/utils/asistencia'

definePageMeta({ layout: 'student' })

interface ClaseAsistencia {
  classId: number
  clase: string
  porcentaje: number | null
  sesiones: Array<{ id: number; fecha: string; tema: string | null; estado: EstadoAsistencia | null }>
}

const authStore = useAuthStore()
const api = useApi()
const { messageOf } = useApiErrorMessage()

const qrCanvas = ref<HTMLCanvasElement | null>(null)
const hayCodigo = ref(false)
const cargandoCodigo = ref(true)
const errorCodigo = ref<string | null>(null)
const restante = ref(100)
const clases = ref<ClaseAsistencia[]>([])
const cargando = ref(true)
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
    const r = await api.get<{ codigo: string; venceEnMs: number; ventanaMs: number }>(`/asistencia/mi-codigo?dispositivo=${idDeDispositivo()}`)
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
    clases.value = await api.get<ClaseAsistencia[]>('/asistencia/mia')
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar tu asistencia.')
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  renovarCodigo()
  cargarHistorial()
  reloj = setInterval(() => { restante.value = Math.max(0, Math.min(100, ((vence - Date.now()) / ventana) * 100)) }, 1000)
})

onBeforeUnmount(() => {
  activo = false
  if (temporizador) clearTimeout(temporizador)
  if (reloj) clearInterval(reloj)
})
</script>
