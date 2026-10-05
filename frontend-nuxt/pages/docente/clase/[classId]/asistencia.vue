<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <DocentePestanasClase :class-id="classId" activa="asistencia" :nombre="clase?.name" :codigo="clase?.code" />

    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Asistencia</h1>
        <p class="text-xs text-base-texto-secundario mt-1 max-w-2xl">
          Opcional. Cada estudiante abre <strong>Mi asistencia</strong> en su celular y tú escaneas su código, que cambia
          cada 20 segundos: ves su nombre y su foto para comparar, y si un mismo celular marca a dos cuentas te avisa.
          También puedes marcar o corregir a mano.
        </p>
      </div>
      <div class="flex flex-wrap gap-2 shrink-0 self-start">
        <button type="button" :disabled="creando" class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-40" @click="tomarHoy">
          <Loader2 v-if="creando" :size="14" class="animate-spin" aria-hidden="true" /><ClipboardCheck v-else :size="14" aria-hidden="true" />
          Tomar asistencia de hoy
        </button>
        <button v-if="sesiones.length" type="button" class="px-3 py-2 rounded-md borde-afordancia font-semibold text-xs inline-flex items-center gap-1.5" @click="descargarCsv">
          <Download :size="14" aria-hidden="true" /> Planilla (CSV)
        </button>
      </div>
    </header>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario"><Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando…</p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

    <!-- ─── La sesión abierta en pantalla ─── -->
    <section v-if="detalle" class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm p-5 space-y-4" aria-labelledby="sesion-titulo">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 id="sesion-titulo" class="text-sm font-bold text-base-texto-primario flex items-center gap-2 flex-wrap">
            {{ fechaSesion(detalle.sesion.fecha) }}
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="detalle.sesion.abierta ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-base-bg-secundario text-slate-600'">
              {{ detalle.sesion.abierta ? 'Abierta' : 'Cerrada' }}
            </span>
          </h2>
          <label class="mt-1 flex items-center gap-2 text-xs text-base-texto-secundario">
            <span class="shrink-0">Tema</span>
            <input v-model="tema" type="text" maxlength="120" placeholder="Opcional, p. ej. «Ciclos»" class="w-full sm:w-64 px-2 py-1 rounded border border-base-borde-fuerte text-base-texto-primario" @change="guardarTema" />
          </label>
        </div>
        <div class="flex flex-wrap gap-2">
          <button v-if="detalle.sesion.abierta" type="button" class="px-3 py-2 rounded-md bg-semantico-info text-base-blanco font-bold text-xs inline-flex items-center gap-1.5" @click="abrirEscaner">
            <ScanLine :size="14" aria-hidden="true" /> Escanear códigos
          </button>
          <button type="button" :disabled="presentes.length === 0" class="px-3 py-2 rounded-md borde-afordancia font-semibold text-xs inline-flex items-center gap-1.5 disabled:opacity-40" @click="sortear">
            <Shuffle :size="14" aria-hidden="true" /> Llamar a 3 al azar
          </button>
          <button type="button" class="px-3 py-2 rounded-md borde-afordancia font-semibold text-xs inline-flex items-center gap-1.5" @click="alternarAbierta">
            <Lock v-if="detalle.sesion.abierta" :size="14" aria-hidden="true" /><LockOpen v-else :size="14" aria-hidden="true" />
            {{ detalle.sesion.abierta ? 'Cerrar asistencia' : 'Reabrir' }}
          </button>
          <button type="button" class="px-3 py-2 rounded-md text-semantico-falla font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-semantico-falla/10" @click="borrarSesion">
            <Trash2 :size="14" aria-hidden="true" /> Borrar sesión
          </button>
        </div>
      </div>

      <p class="text-xs text-base-texto-secundario">
        <strong class="text-base-texto-primario">{{ conteo.presente + conteo.tarde }}</strong> presentes · {{ conteo.tarde }} tarde · {{ conteo.excusa }} con excusa ·
        {{ detalle.sesion.abierta ? `${conteo.sinMarcar} sin marcar` : `${conteo.ausente} ausentes` }}
        <span v-if="!detalle.sesion.abierta" class="block mt-0.5">Al cerrar, quien no marcó queda ausente. Puedes corregir a mano.</span>
      </p>

      <div v-if="sorteados.length" class="rounded-lg border border-semantico-info/40 bg-semantico-info/5 p-3 text-xs space-y-1" aria-live="polite">
        <p class="font-semibold text-base-texto-primario">Pregunta en voz alta por: {{ sorteados.map((e) => e.nombre).join(', ') }}</p>
        <p class="text-base-texto-secundario">Si alguno no está en el salón, márcalo ausente: alguien marcó por él.</p>
      </div>

      <p v-if="errorMarca" role="alert" class="text-xs text-semantico-falla">{{ errorMarca }}</p>
      <p v-if="!detalle.estudiantes.length" class="text-xs text-base-texto-secundario">Esta clase aún no tiene estudiantes.</p>
      <ul v-else class="divide-y divide-base-borde-sutil">
        <li v-for="e in detalle.estudiantes" :key="e.id" class="py-2 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <AvatarUsuario :nombre="e.nombre" :foto-id="e.fotoId" tamano="w-9 h-9 text-xs" decorativo />
            <div class="min-w-0">
              <p class="text-sm font-semibold text-base-texto-primario truncate">{{ e.nombre }}</p>
              <p class="text-[11px] text-base-texto-secundario truncate">
                {{ textoEstado(e.estado) }}<template v-if="e.metodo"> · {{ e.metodo === 'qr' ? 'con QR' : 'a mano' }}</template><template v-if="e.hora"> · {{ hora(e.hora) }}</template>
              </p>
              <p v-if="e.alerta" class="text-[11px] font-semibold text-acento-ambar-fuerte flex items-center gap-1"><TriangleAlert :size="12" aria-hidden="true" /> {{ e.alerta }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-1" role="group" :aria-label="`Asistencia de ${e.nombre}`">
            <button v-for="opcion in ESTADOS" :key="opcion.id" type="button" :aria-pressed="e.estado === opcion.id" :disabled="marcando === e.id"
              class="px-2.5 min-h-[36px] rounded-md border text-[11px] font-semibold transition-colors disabled:opacity-50"
              :class="e.estado === opcion.id ? opcion.clase : 'border-base-borde-fuerte text-base-texto-secundario hover:text-base-texto-primario'"
              @click="marcar(e.id, e.estado === opcion.id ? null : opcion.id)">
              {{ opcion.texto }}
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- ─── Sesiones anteriores ─── -->
    <section v-if="sesiones.length" class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm p-5 space-y-2" aria-labelledby="sesiones-titulo">
      <h2 id="sesiones-titulo" class="text-sm font-bold text-base-texto-primario">Sesiones</h2>
      <ul class="divide-y divide-base-borde-sutil text-xs">
        <li v-for="s in sesiones" :key="s.id">
          <button type="button" class="w-full text-left py-2 flex items-center justify-between gap-2 hover:bg-base-bg-secundario rounded px-2" :aria-current="detalle?.sesion.id === s.id ? 'true' : undefined" @click="abrirSesion(s.id)">
            <span class="min-w-0 truncate" :class="detalle?.sesion.id === s.id ? 'font-bold text-acento-ambar-fuerte' : 'text-base-texto-primario'">
              {{ fechaSesion(s.fecha) }}<span v-if="s.tema" class="text-base-texto-secundario"> · {{ s.tema }}</span>
            </span>
            <span class="shrink-0 text-base-texto-secundario">{{ s.presentes + s.tarde }} de {{ s.total }}{{ s.abierta ? ' · abierta' : '' }}</span>
          </button>
        </li>
      </ul>
    </section>
    <p v-else-if="!cargando && !error" class="text-xs text-base-texto-secundario">Aún no has tomado asistencia en esta clase.</p>

    <AsistenciaEscanerAsistencia v-if="escaneando && detalle" :ultimo="ultimo" :procesando="procesando" :marcados="detalle.estudiantes.filter((e) => e.estado).length" :total="detalle.estudiantes.length" @codigo="escanear" @cerrar="escaneando = false" />
  </div>
</template>

<script setup lang="ts">
import { ClipboardCheck, Download, Loader2, Lock, LockOpen, ScanLine, Shuffle, Trash2, TriangleAlert } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import {
  ESTADOS, csvAsistencia, elegirAlAzar, fechaSesion, textoEstado,
  type EstadoAsistencia, type ResultadoEscaneo, type ResumenAsistencia,
} from '~/utils/asistencia'
const { confirmar } = useConfirmar()

definePageMeta({ layout: 'teacher' })

interface Sesion { id: number; classId: number; fecha: string; tema: string | null; abierta: boolean }
interface SesionConConteo extends Sesion { total: number; presentes: number; tarde: number; excusa: number; ausentes: number; sinMarcar: number }
interface EstudianteEnSesion { id: number; nombre: string; email: string; fotoId: string | null; estado: EstadoAsistencia | null; metodo: 'qr' | 'manual' | null; hora: string | null; alerta: string | null }
interface Detalle { sesion: Sesion; clase: string; estudiantes: EstudianteEnSesion[] }

const route = useRoute()
const router = useRouter()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const classId = Number(route.params.classId)

const clase = ref<{ id: number; name: string; code?: string } | null>(null)
const sesiones = ref<SesionConConteo[]>([])
const detalle = ref<Detalle | null>(null)
const tema = ref('')
const cargando = ref(true)
const creando = ref(false)
const error = ref<string | null>(null)
const errorMarca = ref<string | null>(null)
const marcando = ref<number | null>(null)
const escaneando = ref(false)
const procesando = ref(false)
const ultimo = ref<ResultadoEscaneo | null>(null)
const sorteados = ref<EstudianteEnSesion[]>([])

const presentes = computed(() => detalle.value?.estudiantes.filter((e) => e.estado === 'presente' || e.estado === 'tarde') ?? [])
const conteo = computed(() => {
  const lista = detalle.value?.estudiantes ?? []
  const n = (e: EstadoAsistencia | null) => lista.filter((x) => x.estado === e).length
  return { presente: n('presente'), tarde: n('tarde'), excusa: n('excusa'), ausente: n('ausente'), sinMarcar: n(null) }
})
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })

async function cargarSesiones() {
  sesiones.value = await api.get<SesionConConteo[]>(`/asistencia/clase/${classId}/sesiones`)
}

async function abrirSesion(id: number) {
  errorMarca.value = null
  sorteados.value = []
  try {
    detalle.value = await api.get<Detalle>(`/asistencia/sesiones/${id}`)
    tema.value = detalle.value.sesion.tema ?? ''
    if (Number(route.query.sesion) !== id) router.replace({ query: { ...route.query, sesion: String(id) } })
  } catch (err) {
    error.value = messageOf(err, 'No se pudo abrir la sesión.')
  }
}

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    const [c] = await Promise.all([api.get<{ id: number; name: string; code?: string }>(`/class/${classId}`), cargarSesiones()])
    clase.value = c
    // La de la dirección (al recargar) o la abierta más reciente.
    const pedida = Number(route.query.sesion)
    const elegida = sesiones.value.find((s) => s.id === pedida) ?? sesiones.value.find((s) => s.abierta)
    if (elegida) await abrirSesion(elegida.id)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar la asistencia.')
  } finally {
    cargando.value = false
  }
}

async function tomarHoy() {
  creando.value = true
  error.value = null
  try {
    const s = await api.post<Sesion>(`/asistencia/clase/${classId}/sesiones`, {})
    await cargarSesiones()
    await abrirSesion(s.id)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo empezar la asistencia.')
  } finally {
    creando.value = false
  }
}

async function refrescar() {
  if (!detalle.value) return
  await Promise.all([abrirSesion(detalle.value.sesion.id), cargarSesiones()])
}

async function marcar(userId: number, estado: EstadoAsistencia | null) {
  if (!detalle.value) return
  marcando.value = userId
  errorMarca.value = null
  try {
    await api.put(`/asistencia/sesiones/${detalle.value.sesion.id}/estudiantes/${userId}`, { estado })
    await refrescar()
  } catch (err) {
    errorMarca.value = messageOf(err, 'No se pudo guardar la marca.')
  } finally {
    marcando.value = null
  }
}

function abrirEscaner() {
  ultimo.value = null
  escaneando.value = true
}

async function escanear(codigo: string) {
  if (!detalle.value || procesando.value) return
  procesando.value = true
  try {
    const r = await api.post<{ estudiante: { nombre: string; fotoId: string | null }; yaEstaba: boolean; alerta: string | null }>(
      `/asistencia/sesiones/${detalle.value.sesion.id}/escanear`, { codigo },
    )
    ultimo.value = { ok: true, nombre: r.estudiante.nombre, fotoId: r.estudiante.fotoId, yaEstaba: r.yaEstaba, alerta: r.alerta }
    if (navigator.vibrate) navigator.vibrate(r.alerta ? [80, 60, 80] : 60)
    await refrescar()
  } catch (err) {
    ultimo.value = { ok: false, mensaje: messageOf(err, 'No se pudo marcar con ese código.') }
  } finally {
    procesando.value = false
  }
}

function sortear() {
  sorteados.value = elegirAlAzar(presentes.value, 3)
}

async function actualizar(datos: { abierta?: boolean; tema?: string }) {
  if (!detalle.value) return
  try {
    await api.patch(`/asistencia/sesiones/${detalle.value.sesion.id}`, datos)
    await refrescar()
  } catch (err) {
    errorMarca.value = messageOf(err, 'No se pudo guardar el cambio.')
  }
}

const alternarAbierta = () => actualizar({ abierta: !detalle.value?.sesion.abierta })
const guardarTema = () => actualizar({ tema: tema.value })

async function borrarSesion() {
  if (!detalle.value) return
  if (!(await confirmar({ titulo: `¿Borrar la asistencia del ${fechaSesion(detalle.value.sesion.fecha)}?`, mensaje: 'Se pierden las marcas de esa sesión y no se pueden recuperar.', accion: 'Borrar la asistencia', peligro: true }))) return
  try {
    await api.del(`/asistencia/sesiones/${detalle.value.sesion.id}`)
    detalle.value = null
    router.replace({ query: { ...route.query, sesion: undefined } })
    await cargarSesiones()
  } catch (err) {
    errorMarca.value = messageOf(err, 'No se pudo borrar la sesión.')
  }
}

async function descargarCsv() {
  try {
    const resumen = await api.get<ResumenAsistencia>(`/asistencia/clase/${classId}/resumen`)
    const url = URL.createObjectURL(new Blob([csvAsistencia(resumen)], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `asistencia-${(clase.value?.code ?? 'clase').toLowerCase()}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo descargar la planilla.')
  }
}

onMounted(cargar)
</script>
