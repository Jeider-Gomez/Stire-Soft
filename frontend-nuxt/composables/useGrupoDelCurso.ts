import { computed, type Ref } from 'vue'
import type { useContenidosCurso } from '~/composables/useContenidosCurso'
import type { ModuloDelArbol, TemaDelArbol } from '~/utils/contenidosCurso'
import { TEXTO_ESTADO, conteoDeLecciones, estadoDeLeccion, faltasDeLeccion, type EstadoLeccion } from '~/utils/estadoCurso'

const PUNTO: Record<EstadoLeccion, string> = { lista: 'bg-semantico-pasa', falta: 'bg-amber-600', oculta: 'bg-base-borde-fuerte' }

/**
 * El módulo o el tema abierto a la derecha del árbol en Contenido del curso (components/docente/contenidos/PanelGrupo.vue):
 * qué se muestra, cómo se guarda y qué hace cada botón. Cuál está abierto lo dice la dirección (useNavegacionContenido.ts).
 */
export function useGrupoDelCurso(
  estado: ReturnType<typeof useContenidosCurso>,
  grupoAbierto: Ref<{ nivel: 'modulo' | 'tema'; id: number } | null>,
  acciones: {
    /** «Agregar» crea el tema o la lección al instante (useOrganizarCurso.ts) y lo abre. */
    nuevoTema: (moduloId: number) => void
    nuevaLeccion: (temaId: number) => void
    archivarModulo: (m: ModuloDelArbol) => void
    archivarTema: (t: TemaDelArbol) => void
  },
) {

  function moduloYTema(): { m?: ModuloDelArbol; t?: TemaDelArbol } {
    const g = grupoAbierto.value
    if (!g) return {}
    const m = estado.modulos.value.find((x) => (g.nivel === 'modulo' ? x.id === g.id : x.topics?.some((t) => t.id === g.id)))
    return { m, t: g.nivel === 'tema' ? m?.topics?.find((x) => x.id === g.id) : undefined }
  }

  const grupoEnPanel = computed(() => {
    const { m, t } = moduloYTema()
    if (t && m) {
      const hijos = (t.learningUnits ?? []).map((l) => {
        const e = estadoDeLeccion(l)
        return { id: l.id, title: l.title, punto: PUNTO[e], detalle: e === 'falta' ? `Falta: ${faltasDeLeccion(l).join(' y ')}` : TEXTO_ESTADO[e] }
      })
      return { nivel: 'tema' as const, grupo: t, modulo: m.title, lecciones: t.learningUnits ?? [], hijos,
        guardar: (d: { title: string; description: string }) => estado.guardarTema(t.id, { ...d, order: t.order }) }
    }
    if (m && grupoAbierto.value?.nivel === 'modulo') {
      const hijos = (m.topics ?? []).map((x) => {
        const c = conteoDeLecciones(x.learningUnits ?? [])
        return { id: x.id, title: x.title, punto: c.falta ? PUNTO.falta : c.total ? PUNTO.lista : PUNTO.oculta,
          detalle: c.total ? `${c.lista} de ${c.total} lecciones listas` : 'Sin lecciones todavía' }
      })
      return { nivel: 'modulo' as const, grupo: m, publicado: m.isPublished, lecciones: (m.topics ?? []).flatMap((x) => x.learningUnits ?? []), hijos,
        guardar: (d: { title: string; description: string }) => estado.guardarModulo(m.id, d) }
    }
    return null
  })

  function agregarEnGrupo() {
    const { m, t } = moduloYTema()
    if (m && t) acciones.nuevaLeccion(t.id)
    else if (m) acciones.nuevoTema(m.id)
  }
  function publicarGrupo() {
    const { m } = moduloYTema()
    if (m) void estado.alternarPublicacion(m)
  }
  function archivarGrupo() {
    const { m, t } = moduloYTema()
    if (t) acciones.archivarTema(t)
    else if (m) acciones.archivarModulo(m)
  }

  return { grupoEnPanel, agregarEnGrupo, publicarGrupo, archivarGrupo }
}
