import { computed, ref } from 'vue'
import type { useContenidosCurso } from '~/composables/useContenidosCurso'
import type { ModuloDelArbol, TemaDelArbol } from '~/utils/contenidosCurso'

/**
 * El módulo o el tema abierto a la derecha del árbol en Contenido del curso (components/docente/contenidos/PanelGrupo.vue):
 * qué se muestra, cómo se guarda y a qué ventana de la página lleva cada botón.
 */
export function useGrupoDelCurso(
  estado: ReturnType<typeof useContenidosCurso>,
  acciones: {
    alAbrir: () => void
    nuevoTema: (m: ModuloDelArbol) => void
    nuevaLeccion: (m: ModuloDelArbol, t: TemaDelArbol) => void
    archivarModulo: (m: ModuloDelArbol) => void
    archivarTema: (t: TemaDelArbol) => void
  },
) {
  const grupoAbierto = ref<{ nivel: 'modulo' | 'tema'; id: number } | null>(null)
  function abrirGrupo(nivel: 'modulo' | 'tema', id: number) {
    acciones.alAbrir()
    grupoAbierto.value = { nivel, id }
  }

  function moduloYTema(): { m?: ModuloDelArbol; t?: TemaDelArbol } {
    const g = grupoAbierto.value
    if (!g) return {}
    const m = estado.modulos.value.find((x) => (g.nivel === 'modulo' ? x.id === g.id : x.topics?.some((t) => t.id === g.id)))
    return { m, t: g.nivel === 'tema' ? m?.topics?.find((x) => x.id === g.id) : undefined }
  }

  const grupoEnPanel = computed(() => {
    const { m, t } = moduloYTema()
    if (t && m) {
      return { nivel: 'tema' as const, grupo: t, modulo: m.title, lecciones: t.learningUnits ?? [],
        guardar: (d: { title: string; description: string }) => estado.guardarTema(t.id, { ...d, order: t.order }) }
    }
    if (m && grupoAbierto.value?.nivel === 'modulo') {
      return { nivel: 'modulo' as const, grupo: m, publicado: m.isPublished, lecciones: (m.topics ?? []).flatMap((x) => x.learningUnits ?? []),
        guardar: (d: { title: string; description: string }) => estado.guardarModulo(m.id, d) }
    }
    return null
  })

  function agregarEnGrupo() {
    const { m, t } = moduloYTema()
    if (m && t) acciones.nuevaLeccion(m, t)
    else if (m) acciones.nuevoTema(m)
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

  return { grupoAbierto, grupoEnPanel, abrirGrupo, agregarEnGrupo, publicarGrupo, archivarGrupo }
}
