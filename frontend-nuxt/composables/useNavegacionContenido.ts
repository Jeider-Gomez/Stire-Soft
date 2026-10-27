import { ref, watch, type Ref } from 'vue'
import { esPestana, type PestanaLeccion } from '~/utils/estadoCurso'

export type GrupoAbierto = { nivel: 'modulo' | 'tema'; id: number }

/**
 * Qué está abierto en «Contenido del curso» vive en la dirección de la página (27/10, como en el prototipo del panel v2):
 * `?unitId=12&pestana=actividades` abre esa lección en esa pestaña, `?modulo=3` o `?tema=8` abre ese módulo o tema.
 * Así cualquier otro panel (Inicio, el Asistente, las valoraciones de los estudiantes) lleva justo ahí con un enlace, y el
 * botón Atrás del navegador vuelve a lo anterior.
 */
export function useNavegacionContenido(claseId: Ref<number | null>) {
  const route = useRoute()
  const router = useRouter()
  const leccionAbierta = ref<number | null>(null)
  const grupoAbierto = ref<GrupoAbierto | null>(null)
  const pestana = ref<PestanaLeccion>('leccion')

  function leerRuta() {
    const q = route.query
    const unidad = Number(q.unitId) || null
    const modulo = Number(q.modulo) || null
    const tema = Number(q.tema) || null
    leccionAbierta.value = unidad
    pestana.value = esPestana(q.pestana) ? q.pestana : 'leccion'
    grupoAbierto.value = unidad ? null : tema ? { nivel: 'tema', id: tema } : modulo ? { nivel: 'modulo', id: modulo } : null
  }

  function consulta(extra: Record<string, string>): Record<string, string> {
    const clase = claseId.value ?? Number(route.query.classId)
    return { ...(clase ? { classId: String(clase) } : {}), ...extra }
  }
  function ir(extra: Record<string, string>, reemplazar = false) {
    const destino = { path: route.path, query: consulta(extra) }
    void (reemplazar ? router.replace(destino) : router.push(destino))
    if (!reemplazar && import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Abre una lección (en la pestaña pedida) o, con null, vuelve al mapa del curso. */
  function abrirLeccion(id: number | null, p?: PestanaLeccion) {
    if (id === null) return ir({})
    ir({ unitId: String(id), ...(p && p !== 'leccion' ? { pestana: p } : {}) })
  }
  function abrirGrupo(nivel: 'modulo' | 'tema', id: number) {
    ir({ [nivel]: String(id) })
  }
  /** Cambiar de pestaña no llena el historial: reemplaza la dirección. */
  function cambiarPestana(p: PestanaLeccion) {
    if (leccionAbierta.value) ir({ unitId: String(leccionAbierta.value), ...(p !== 'leccion' ? { pestana: p } : {}) }, true)
  }

  watch(() => route.fullPath, leerRuta, { immediate: true })

  return { leccionAbierta, grupoAbierto, pestana, abrirLeccion, abrirGrupo, cambiarPestana }
}

