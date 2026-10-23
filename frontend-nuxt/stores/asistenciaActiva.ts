import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { accionesAsistencia } from '~/composables/useAsistenciaClase'
import { idsQueLlegaron, llegadasRecientes, llegadosNoVistos, type EstadoAsistencia, type ResultadoEscaneo } from '~/utils/asistencia'

/**
 * Asistencia activa (23/10, pedido del dueño): el docente deja abierta la toma de asistencia y sigue usando STIRE. Un
 * panel flotante (components/docente/AsistenciaFlotante.vue) muestra cuántos llegaron y quiénes, deja escanear sin la
 * ventana que tapa la pantalla y marcar a mano. Se recuerda en esta pestaña (sessionStorage) por si recarga.
 */

export interface EstudianteEnSesion { id: number; nombre: string; email: string; fotoId: string | null; estado: EstadoAsistencia | null; metodo: 'qr' | 'manual' | null; hora: string | null; alerta: string | null }
export interface DetalleSesion { sesion: { id: number; classId: number; fecha: string; tema: string | null; abierta: boolean }; clase: string; estudiantes: EstudianteEnSesion[] }

const CLAVE = 'stire.asistenciaActiva'
/** Cada cuánto se vuelve a pedir la lista: alguien pudo marcar desde otro celular (un auxiliar escaneando). */
export const REFRESCO_ASISTENCIA_MS = 15000

export const useAsistenciaActivaStore = defineStore('asistenciaActiva', () => {
  const api = useApi()
  const activa = ref<{ classId: number; sesionId: number } | null>(null)
  const detalle = ref<DetalleSesion | null>(null)
  const ultimo = ref<ResultadoEscaneo | null>(null)
  const procesando = ref(false)
  const error = ref<string | null>(null)
  /** Quienes ya había visto el docente: los «nuevos» del panel plegado son los demás. Se pone al día al abrirlo. */
  const vistos = ref<number[]>([])
  let temporizador: ReturnType<typeof setInterval> | null = null

  const acciones = () => (activa.value ? accionesAsistencia(api, activa.value.classId) : null)
  const recientes = computed(() => llegadasRecientes(detalle.value?.estudiantes ?? []))
  const nuevos = computed(() => llegadosNoVistos(detalle.value?.estudiantes ?? [], vistos.value))
  const conteo = computed(() => {
    const lista = detalle.value?.estudiantes ?? []
    return { llegaron: lista.filter((e) => e.estado === 'presente' || e.estado === 'tarde').length, total: lista.length }
  })

  function guardar() {
    try {
      if (activa.value) sessionStorage.setItem(CLAVE, JSON.stringify(activa.value))
      else sessionStorage.removeItem(CLAVE)
    } catch { /* sin almacenamiento: dura hasta recargar */ }
  }

  async function refrescar() {
    const a = acciones()
    if (!a || !activa.value) return
    try {
      detalle.value = await a.detalle<DetalleSesion>(activa.value.sesionId)
      error.value = null
      // Si la cerraron (aquí, en la página o en otro dispositivo), el panel se va solo.
      if (!detalle.value.sesion.abierta) desactivar()
    } catch (e) {
      // Borraron la sesión: no hay nada que seguir mostrando.
      if ((e as { statusCode?: number })?.statusCode === 404) desactivar()
      else error.value = 'No se pudo actualizar la asistencia. Se reintenta sola.'
    }
  }

  function iniciarRefresco() {
    if (temporizador) clearInterval(temporizador)
    temporizador = setInterval(() => { if (document.visibilityState === 'visible') refrescar() }, REFRESCO_ASISTENCIA_MS)
  }

  async function activar(classId: number, sesionId: number) {
    activa.value = { classId, sesionId }
    guardar()
    await refrescar()
    ponerAlDia()
    iniciarRefresco()
  }

  function desactivar() {
    activa.value = null
    detalle.value = null
    ultimo.value = null
    if (temporizador) clearInterval(temporizador)
    temporizador = null
    guardar()
  }

  /** Al entrar al layout del docente: si en esta pestaña había una asistencia activa, vuelve. */
  async function recuperar() {
    if (activa.value) return
    try {
      const v = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null')
      if (v && Number.isInteger(v.classId) && Number.isInteger(v.sesionId)) {
        activa.value = { classId: v.classId, sesionId: v.sesionId }
        await refrescar()
        ponerAlDia()
        if (activa.value) iniciarRefresco()
      }
    } catch { /* nada guardado o dañado: sin asistencia activa */ }
  }

  async function marcar(studentId: number, estado: EstadoAsistencia | null) {
    const a = acciones()
    if (!a || !activa.value) return
    try {
      await a.marcar(activa.value.sesionId, studentId, estado)
      await refrescar()
    } catch {
      error.value = 'No se pudo guardar la marca.'
    }
  }

  async function escanear(codigo: string) {
    const a = acciones()
    if (!a || !activa.value || procesando.value) return
    procesando.value = true
    try {
      const r = await a.escanear<{ estudiante: { nombre: string; fotoId: string | null }; yaEstaba: boolean; alerta: string | null }>(activa.value.sesionId, codigo)
      ultimo.value = { ok: true, nombre: r.estudiante.nombre, fotoId: r.estudiante.fotoId, yaEstaba: r.yaEstaba, alerta: r.alerta }
      if (navigator.vibrate) navigator.vibrate(r.alerta ? [80, 60, 80] : 60)
      await refrescar()
    } catch {
      ultimo.value = { ok: false, mensaje: 'No se pudo marcar con ese código.' }
    } finally {
      procesando.value = false
    }
  }

  /** Cerrar la asistencia: quien no marcó queda ausente (lo hace el servidor) y el panel se va. */
  async function cerrarAsistencia() {
    const a = acciones()
    if (!a || !activa.value) return
    try {
      await a.actualizar(activa.value.sesionId, { abierta: false })
      desactivar()
    } catch {
      error.value = 'No se pudo cerrar la asistencia.'
    }
  }

  function ponerAlDia() { vistos.value = idsQueLlegaron(detalle.value?.estudiantes ?? []) }

  return { activa, detalle, ultimo, procesando, error, recientes, nuevos, conteo, activar, desactivar, recuperar, refrescar, marcar, escanear, cerrarAsistencia, ponerAlDia }
})
