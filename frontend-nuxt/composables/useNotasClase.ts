import { ref, type InjectionKey } from 'vue'
import { useAvisos } from '~/composables/useAvisos'
import { notaComa, type Esquema, type Libro } from '~/utils/calificaciones'

export interface EventoNota { id: number; nombre: string; antes: number | null; despues: number | null; motivo: string | null; createdAt: string }

/**
 * Datos y acciones de «Notas de la clase» (PAT-01: la vista no habla con la API). La página organiza; el formulario
 * del esquema y la tabla lo reciben con inject. Las acciones devuelven el mensaje de error, o null si salió bien.
 */
export function useNotasClase(classId: number) {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()
  const { avisar } = useAvisos()

  const clase = ref<{ id: number; name: string; code?: string } | null>(null)
  const libro = ref<Libro | null>(null)
  const cargando = ref(true)
  const error = ref<string | null>(null)
  /** El esquema que se está armando o cambiando: no se guarda hasta «Guardar». */
  const borrador = ref<Esquema | null>(null)
  const aprobatoriaTexto = ref('3,0')
  const editando = ref(false)

  const copiar = (e: Esquema): Esquema => JSON.parse(JSON.stringify(e)) as Esquema

  /** Llega un libro con su esquema (al cargar, guardar o quitar): el borrador vuelve a ser ese esquema. */
  function aplicar(l: Libro) {
    libro.value = l
    borrador.value = l.esquema ? copiar(l.esquema) : null
    aprobatoriaTexto.value = notaComa(l.esquema?.notaAprobatoria ?? 3)
    editando.value = false
  }

  /** Una forma de empezar: solo llena el formulario; nada se guarda hasta «Guardar». */
  function empezarCon(esquema: Esquema) {
    borrador.value = copiar(esquema)
    aprobatoriaTexto.value = notaComa(esquema.notaAprobatoria)
    editando.value = true
  }

  function descartar() {
    if (libro.value) aplicar(libro.value)
  }

  async function cargar() {
    cargando.value = true
    error.value = null
    try {
      const [c, l] = await Promise.all([
        api.get<{ id: number; name: string; code?: string }>(`/class/${classId}`),
        api.get<Libro>(`/calificaciones/clase/${classId}`),
      ])
      clase.value = c
      aplicar(l)
    } catch (err) {
      error.value = messageOf(err, 'No se pudieron cargar las notas.')
    } finally {
      cargando.value = false
    }
  }

  async function guardarEsquema(esquema: Esquema, notaAprobatoria: number): Promise<string | null> {
    try {
      aplicar(await api.put<Libro>(`/calificaciones/clase/${classId}/esquema`, { ...esquema, notaAprobatoria }))
      avisar({ tipo: 'exito', texto: 'Esquema de calificaciones guardado.' })
      return null
    } catch (err) {
      const msg = messageOf(err, 'No se pudo guardar.')
      avisar({ tipo: 'error', texto: msg })
      return msg
    }
  }

  async function dejarDeUsar(): Promise<string | null> {
    try {
      aplicar(await api.del<Libro>(`/calificaciones/clase/${classId}/esquema`))
      avisar({ tipo: 'info', texto: 'Se dejó de usar el esquema de calificaciones.' })
      return null
    } catch (err) {
      const msg = messageOf(err, 'No se pudo quitar.')
      avisar({ tipo: 'error', texto: msg })
      return msg
    }
  }

  /**
   * Una nota a mano (clave del componente) o la final ('final', con motivo; null la quita). Después se recalcula la
   * tabla; lo que el docente esté editando en el esquema no se toca.
   */
  async function ponerNota(studentId: number, cuerpo: { clave: string; nota: number | null; motivo?: string }): Promise<string | null> {
    try {
      await api.put(`/calificaciones/clase/${classId}/estudiante/${studentId}/nota`, cuerpo)
      libro.value = await api.get<Libro>(`/calificaciones/clase/${classId}`)
      avisar({ tipo: 'exito', texto: 'Nota guardada.' })
      return null
    } catch (err) {
      const msg = messageOf(err, cuerpo.clave === 'final' ? 'No se pudo guardar.' : 'No se guardó')
      avisar({ tipo: 'error', texto: msg })
      return msg
    }
  }

  async function historialDe(studentId: number): Promise<EventoNota[]> {
    try {
      return await api.get<EventoNota[]>(`/calificaciones/clase/${classId}/estudiante/${studentId}/historial`)
    } catch {
      return []
    }
  }

  return {
    classId, clase, libro, cargando, error, borrador, aprobatoriaTexto, editando,
    cargar, empezarCon, descartar, guardarEsquema, dejarDeUsar, ponerNota, historialDe,
  }
}

export type EstadoNotasClase = ReturnType<typeof useNotasClase>
export const CLAVE_NOTAS_CLASE: InjectionKey<EstadoNotasClase> = Symbol('notas-clase')
