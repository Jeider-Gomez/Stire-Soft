import { ref } from 'vue'
import {
  EVENTO_CONTENIDO_CAMBIO, configOpcionMultiple, configProgramacion, enlaceContenido, enlaceEjercicio, pasosDeEstructura, resumenAnonimoClase, tituloDeEjercicio,
  type BorradorAsistente, type TipoBorrador,
} from '~/utils/asistenteDocente'

/** Un paso de lo que el Asistente va creando; hecho, lleva el enlace a lo creado para abrirlo y editarlo. */
export interface PasoAsistente { texto: string; estado: 'pendiente' | 'haciendo' | 'hecho' | 'error'; enlace?: string }
export interface LeccionDestino { id: number; titulo: string; modulo?: string; tema?: string }

/**
 * El Asistente del docente: pide borradores al servidor (POST /asistente/borrador) y, si el docente los aplica, los crea
 * con las rutas de siempre, todo en borrador (oculto), paso a paso a la vista. Al terminar lleva al docente a Contenido
 * del curso, donde ve lo creado. Estado compartido: el panel se abre desde el encabezado o con Ctrl+.
 */
export function useAsistente() {
  const api = useApi()
  const route = useRoute()
  const { messageOf } = useApiErrorMessage()
  const abierto = useState('asistente-abierto', () => false)
  const tieneClave = useState<boolean | null>('asistente-clave', () => null)
  const borrador = useState<BorradorAsistente | null>('asistente-borrador', () => null)
  const pasos = useState<PasoAsistente[]>('asistente-pasos', () => [])
  const pensando = ref(false)
  const aplicando = ref(false)
  const error = ref<string | null>(null)

  async function revisarClave() {
    try { tieneClave.value = (await api.get<{ hasKey: boolean }>('/asistente/api-key')).hasKey } catch { tieneClave.value = false }
  }
  async function guardarClave(apiKey: string): Promise<string | null> {
    try {
      await api.put('/asistente/api-key', { apiKey })
      tieneClave.value = true
      return null
    } catch (e) { return messageOf(e, 'No se pudo guardar la clave.') }
  }

  async function pedir(tipo: TipoBorrador, contexto: Record<string, unknown>, pedido: string) {
    pensando.value = true
    error.value = null
    borrador.value = null
    pasos.value = []
    try {
      borrador.value = (await api.post<{ borrador: BorradorAsistente }>('/asistente/borrador', { tipo, contexto, pedido: pedido.trim() || undefined })).borrador
    } catch (e) {
      error.value = messageOf(e, 'El Asistente no pudo responder. Inténtalo de nuevo.')
      if (/clave/i.test(error.value)) tieneClave.value = false
    } finally {
      pensando.value = false
    }
  }

  /** Marca un paso y deja ver el avance. */
  function avanzar(i: number, estado: PasoAsistente['estado'], enlace?: string) {
    pasos.value = pasos.value.map((p, j) => (j === i ? { ...p, estado, ...(enlace ? { enlace } : {}) } : p))
  }

  /** Crea lo del borrador. Todo queda oculto/en borrador: el docente lo revisa y lo publica cuando quiera. */
  async function aplicar(classId: number, leccion: LeccionDestino | null): Promise<boolean> {
    const b = borrador.value
    if (!b) return false
    aplicando.value = true
    error.value = null
    try {
      if (b.tipo === 'estructura') {
        pasos.value = pasosDeEstructura(b).map((texto) => ({ texto, estado: 'pendiente' }))
        let i = 0
        for (const [om, m] of b.modulos.entries()) {
          avanzar(i, 'haciendo')
          const mod = await api.post<{ id: number }>('/sections', { classId, title: m.titulo, description: m.descripcion || undefined, order: 100 + om })
          avanzar(i++, 'hecho', `/docente/contenidos?classId=${classId}&modulo=${mod.id}`)
          for (const [ot, t] of m.temas.entries()) {
            avanzar(i, 'haciendo')
            const tema = await api.post<{ id: number }>('/topic', { sectionId: mod.id, title: t.titulo, order: ot })
            avanzar(i++, 'hecho', `/docente/contenidos?classId=${classId}&tema=${tema.id}`)
            for (const [ol, l] of t.lecciones.entries()) {
              avanzar(i, 'haciendo')
              const nueva = await api.post<{ id: number }>('/learning-unit', { topicId: tema.id, title: l.titulo, description: l.objetivo || undefined, difficulty: l.dificultad, order: ol })
              avanzar(i++, 'hecho', enlaceContenido(classId, nueva.id))
            }
          }
        }
      } else if (b.tipo === 'analisis') {
        return true
      } else if (b.tipo === 'alternativa') {
        if (!leccion) throw new Error('Elige la lección de la explicación alternativa.')
        pasos.value = [{ texto: `Explicación alternativa en «${leccion.titulo}»`, estado: 'haciendo' }]
        // Oculta, como todo lo del Asistente: el docente la revisa y decide cuándo se muestra.
        await api.post('/content', { learningUnitId: leccion.id, title: b.titulo, type: 'markdown', body: b.explicacion, order: 50, isVisible: false, cuando: b.cuando })
        avanzar(0, 'hecho', enlaceContenido(classId, leccion.id, 'leccion'))
      } else if (b.tipo === 'programacion') {
        if (!leccion) throw new Error('Elige la lección donde van los ejercicios.')
        const tipos = await api.get<Array<{ id: number; code: string }> | { data?: Array<{ id: number; code: string }> }>('/activity-types')
        const lista = Array.isArray(tipos) ? tipos : (tipos?.data ?? [])
        const practica = lista.find((t) => t.code === 'AUTO-EVAL') ?? lista[0]
        if (!practica) throw new Error('No hay tipos de actividad cargados en STIRE.')
        pasos.value = b.ejercicios.map((e) => ({ texto: e.titulo, estado: 'pendiente' }))
        for (const [n, e] of b.ejercicios.entries()) {
          avanzar(n, 'haciendo')
          // Cinco intentos, como los ejercicios de programar de los cursos (BT-41).
          const act = await api.post<{ id: number }>('/activities', {
            learningUnitId: leccion.id, activityTypeId: practica.id, title: e.titulo, description: e.enunciado,
            difficulty: e.dificultad, totalPoints: 10, attemptsAllowed: 5, passingScore: 60, isRequired: true, adaptiveWeight: 0.4,
          })
          try {
            await api.post('/activity-questions', { activityId: act.id, type: 'coding', question: e.enunciado, points: 10, order: 0, config: configProgramacion(e) })
          } catch (err) {
            await api.del(`/activities/${act.id}`).catch(() => undefined)
            throw err
          }
          avanzar(n, 'hecho', enlaceEjercicio(classId, leccion.id, act.id))
        }
      } else if (b.tipo === 'leccion') {
        if (!leccion) throw new Error('Elige la lección donde va la explicación.')
        pasos.value = [{ texto: `Explicación en «${leccion.titulo}»`, estado: 'haciendo' }]
        await api.post('/content', { learningUnitId: leccion.id, title: b.titulo, type: 'markdown', body: b.explicacion, order: 0, isVisible: false })
        avanzar(0, 'hecho', enlaceContenido(classId, leccion.id, 'leccion'))
      } else {
        if (!leccion) throw new Error('Elige la lección donde van los ejercicios.')
        const tipos = await api.get<Array<{ id: number; code: string }> | { data?: Array<{ id: number; code: string }> }>('/activity-types')
        const lista = Array.isArray(tipos) ? tipos : (tipos?.data ?? [])
        const practica = lista.find((t) => t.code === 'AUTO-EVAL') ?? lista[0]
        if (!practica) throw new Error('No hay tipos de actividad cargados en STIRE.')
        pasos.value = b.ejercicios.map((e, n) => ({ texto: tituloDeEjercicio(e.enunciado, n + 1), estado: 'pendiente' }))
        for (const [n, e] of b.ejercicios.entries()) {
          avanzar(n, 'haciendo')
          const act = await api.post<{ id: number }>('/activities', {
            learningUnitId: leccion.id, activityTypeId: practica.id, title: tituloDeEjercicio(e.enunciado, n + 1), description: e.enunciado,
            difficulty: e.dificultad, totalPoints: 10, attemptsAllowed: 1, passingScore: 60, isRequired: true, adaptiveWeight: 0.4,
          })
          try {
            await api.post('/activity-questions', { activityId: act.id, type: 'mcq', question: e.enunciado, points: 10, order: 0, config: configOpcionMultiple(e) })
          } catch (err) {
            await api.del(`/activities/${act.id}`).catch(() => undefined)
            throw err
          }
          avanzar(n, 'hecho', enlaceEjercicio(classId, leccion.id, act.id))
        }
      }
      window.dispatchEvent(new CustomEvent(EVENTO_CONTENIDO_CAMBIO))
      borrador.value = null
      // Lo lleva a ver lo creado: la estructura en el mapa del curso; la explicación o los ejercicios, en su lección.
      if (b.tipo === 'estructura') { if (!route.path.startsWith('/docente/contenidos')) await navigateTo(enlaceContenido(classId)) }
      else if (leccion) await navigateTo(enlaceContenido(classId, leccion.id, b.tipo === 'ejercicios' || b.tipo === 'programacion' ? 'actividades' : 'leccion'))
      return true
    } catch (e) {
      const i = pasos.value.findIndex((p) => p.estado === 'haciendo')
      if (i >= 0) avanzar(i, 'error')
      error.value = e instanceof Error && !('statusCode' in e) ? e.message : messageOf(e, 'No se pudo crear todo. Lo que quedó hecho está en Contenido del curso.')
      return false
    } finally {
      aplicando.value = false
    }
  }

  function descartar() { borrador.value = null; pasos.value = [] }

  /** Las lecciones de una clase, con su módulo y tema, para elegir dónde va la explicación o los ejercicios. */
  async function leccionesDeClase(classId: number): Promise<Array<LeccionDestino & { modulo: string; tema: string }>> {
    const modulos = await api.get<Array<{ id: number; title: string }>>(`/sections/class/${classId}`).catch(() => [])
    const porModulo = await Promise.all((Array.isArray(modulos) ? modulos : []).map(async (m) => {
      const temas = await api.get<Array<{ title: string; learningUnits?: Array<{ id: number; title: string }> }>>(`/topic/section/${m.id}`).catch(() => [])
      return (Array.isArray(temas) ? temas : []).flatMap((t) => (t.learningUnits ?? []).map((u) => ({ id: u.id, titulo: u.title, modulo: m.title, tema: t.title })))
    }))
    return porModulo.flat()
  }

  /**
   * El resumen anónimo de la clase para «Analizar mi clase» (utils/asistenteDocente.ts): quién está bloqueado o falla
   * estando seguro, por lección, y los errores de concepto de la semana. Solo cifras y nombres de lecciones y errores.
   */
  async function resumenDeClase(classId: number): Promise<string> {
    type Fila = { studentId: number; unitTitle: string }
    const [mapa, errores, clase] = await Promise.all([
      api.get<{ bloqueados?: Fila[]; segurosQueFallan?: Fila[] }>(`/analytics/class/${classId}/heatmap`).catch(() => null),
      api.get<{ concepto?: Array<{ nombre: string; detalle?: string; estudiantes: unknown[] }> }>(`/analytics/class/${classId}/errores-semana`).catch(() => null),
      api.get<{ enrollmentCount?: number }>(`/class/${classId}`).catch(() => null),
    ])
    return resumenAnonimoClase({ estudiantes: clase?.enrollmentCount, bloqueados: mapa?.bloqueados, segurosQueFallan: mapa?.segurosQueFallan, errores: errores?.concepto })
  }

  /** El texto que ya tiene una lección: base para mejorar la explicación o para los ejercicios. */
  async function textoDeLeccion(unitId: number): Promise<string | undefined> {
    const contenidos = await api.get<Array<{ type: string; body?: string }>>(`/content/unit/${unitId}/all`).catch(() => [])
    return (Array.isArray(contenidos) ? contenidos : []).filter((c) => c.type === 'markdown' && c.body).map((c) => c.body).join('\n\n').slice(0, 7000) || undefined
  }

  return { abierto, tieneClave, borrador, pasos, pensando, aplicando, error, revisarClave, guardarClave, pedir, aplicar, descartar, leccionesDeClase, textoDeLeccion, resumenDeClase }
}
