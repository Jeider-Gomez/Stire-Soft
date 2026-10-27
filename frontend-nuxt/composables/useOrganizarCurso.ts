import { useAvisos } from '~/composables/useAvisos'
import type { EstadoContenidos } from '~/composables/useContenidosCurso'
import { mayorOrden, type LeccionDelArbol, type ModuloDelArbol, type TemaDelArbol } from '~/utils/contenidosCurso'
import { moverEnLista } from '~/utils/estadoCurso'

export type NivelOrden = 'modulo' | 'tema' | 'leccion'
const RUTA: Record<NivelOrden, string> = { modulo: '/sections', tema: '/topic', leccion: '/learning-unit' }

/**
 * Organizar «Contenido del curso» como en el prototipo del panel v2 (27/10): arrastrar o subir y bajar módulos, temas y
 * lecciones entre sus hermanos, y crear uno nuevo sin ventana (nace con un nombre provisional y se abre para nombrarlo).
 * El cambio se ve al instante; si el servidor falla, el árbol se vuelve a cargar tal como quedó guardado.
 */
export function useOrganizarCurso(estado: EstadoContenidos) {
  const api = useApi()
  const { messageOf } = useApiErrorMessage()
  const { avisar } = useAvisos()

  /** Los hermanos de un nivel: los módulos de la clase, los temas de un módulo o las lecciones de un tema. */
  function hermanos(nivel: NivelOrden, padreId: number | null): Array<ModuloDelArbol | TemaDelArbol | LeccionDelArbol> | null {
    const ms = estado.modulos.value
    if (nivel === 'modulo') return ms
    if (nivel === 'tema') return ms.find((m) => m.id === padreId)?.topics ?? null
    for (const m of ms) {
      const t = m.topics?.find((x) => x.id === padreId)
      if (t) return t.learningUnits ?? null
    }
    return null
  }

  function reemplazar(nivel: NivelOrden, padreId: number | null, lista: Array<ModuloDelArbol | TemaDelArbol | LeccionDelArbol>) {
    const ms = estado.modulos.value
    if (nivel === 'modulo') { estado.modulos.value = lista as ModuloDelArbol[]; return }
    if (nivel === 'tema') { const m = ms.find((x) => x.id === padreId); if (m) m.topics = lista as TemaDelArbol[]; return }
    for (const m of ms) {
      const t = m.topics?.find((x) => x.id === padreId)
      if (t) { t.learningUnits = lista as LeccionDelArbol[]; return }
    }
  }

  /** Mueve un elemento entre sus hermanos y guarda el orden nuevo de los que cambiaron. */
  async function mover(nivel: NivelOrden, padreId: number | null, desde: number, hasta: number) {
    const lista = hermanos(nivel, padreId)
    if (!lista) return
    const titulo = lista[desde]?.title
    const { lista: nueva, cambios } = moverEnLista(lista, desde, hasta)
    if (!cambios.length) return
    reemplazar(nivel, padreId, nueva)
    try {
      await Promise.all(cambios.map((c) => api.patch(`${RUTA[nivel]}/${c.id}`, { order: c.order })))
      avisar({ tipo: 'exito', texto: `«${titulo}» quedó en el lugar ${hasta + 1}.` })
    } catch (err) {
      avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo guardar el orden nuevo.') })
      await estado.cargarModulos()
    }
  }

  /** Crea un módulo, tema o lección con un nombre provisional, al final de sus hermanos; devuelve su id para abrirlo. */
  async function crearRapido(nivel: NivelOrden, padreId: number | null): Promise<number | null> {
    const lista = hermanos(nivel, padreId)
    if (!lista) return null
    const order = mayorOrden(lista) + 1
    try {
      if (nivel === 'modulo') {
        if (!estado.claseId.value) return null
        const m = await api.post<ModuloDelArbol>('/sections', { classId: estado.claseId.value, title: 'Nuevo módulo', order })
        estado.modulos.value.push({ ...m, isPublished: m.isPublished ?? false, topics: [] })
        return m.id
      }
      if (nivel === 'tema') {
        const t = await api.post<TemaDelArbol>('/topic', { sectionId: padreId, title: 'Nuevo tema', order })
        lista.push({ ...t, learningUnits: [] })
        return t.id
      }
      const l = await api.post<LeccionDelArbol>('/learning-unit', { topicId: padreId, title: 'Nueva lección', difficulty: 'basico', order })
      lista.push(Object.assign(l, { explicaciones: 0, explicacionesVisibles: 0, activities: [] }))
      return l.id
    } catch (err) {
      avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo crear.') })
      return null
    }
  }

  /** Duplica un tema con sus lecciones (la copia queda oculta y en borrador); devuelve el id de la copia para abrirla. */
  async function duplicarTema(temaId: number): Promise<number | null> {
    try {
      const r = await api.post<{ id: number; title: string }>(`/reuse/topics/${temaId}/duplicar`, {})
      await estado.cargarModulos()
      avisar({ tipo: 'exito', texto: `Listo: «${r.title}». Sus explicaciones quedaron ocultas y sus ejercicios en borrador.` })
      return r.id
    } catch (err) {
      avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo duplicar el tema.') })
      return null
    }
  }

  /** Mueve una lección a otro tema de la clase; queda al final de ese tema. */
  async function moverLeccion(leccionId: number, temaId: number): Promise<boolean> {
    try {
      await api.patch(`/learning-unit/${leccionId}/mover`, { topicId: temaId })
      await estado.cargarModulos()
      avisar({ tipo: 'exito', texto: 'La lección quedó al final del tema nuevo, con sus explicaciones y ejercicios.' })
      return true
    } catch (err) {
      avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo mover la lección.') })
      return false
    }
  }

  /** Deja un módulo siempre abierto (o vuelve a pedir el dominio del anterior). */
  async function alternarAbiertoSiempre(m: ModuloDelArbol) {
    const nuevo = !m.abiertoSiempre
    m.abiertoSiempre = nuevo
    try {
      await api.patch(`/sections/${m.id}`, { abiertoSiempre: nuevo })
      avisar({ tipo: 'exito', texto: nuevo ? `«${m.title}» queda siempre abierto.` : `«${m.title}» vuelve a abrirse con el dominio del módulo anterior.` })
    } catch (err) {
      m.abiertoSiempre = !nuevo
      avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo cambiar.') })
    }
  }

  return { mover, crearRapido, duplicarTema, moverLeccion, alternarAbiertoSiempre }
}
