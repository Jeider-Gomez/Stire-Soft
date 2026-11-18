import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'

// v3: las pestañas de Mi progreso, en la dirección (?ver=logros), para volver a la misma y para enlazarla.
export const PESTANAS_PROGRESO = [
  { id: 'dominio', texto: 'Dominio' },
  { id: 'competencias', texto: 'Competencias' },
  { id: 'logros', texto: 'Logros' },
  { id: 'estudio', texto: 'Cómo estudio' },
] as const
export type PestanaProgreso = (typeof PESTANAS_PROGRESO)[number]['id']

/** Las pestañas visibles, la elegida y cómo moverse entre ellas. «Competencias» solo si el docente las activó (P39). */
export function usePestanasProgreso() {
  const authStore = useAuthStore()
  const studentStore = useStudentStore()
  const competencias = useCompetencias()
  const route = useRoute()
  const router = useRouter()

  const conCompetencias = ref(false)
  watch(() => [authStore.user?.id, studentStore.currentClassId] as const, async ([id, clase]) => {
    if (!id || !clase) { conCompetencias.value = false; return }
    const datos = await competencias.delEstudiante(id, clase).catch(() => null)
    conCompetencias.value = datos?.modo === 'informar' || datos?.modo === 'recomendar'
  }, { immediate: true })

  const visibles = computed(() => PESTANAS_PROGRESO.filter((p) => p.id !== 'competencias' || conCompetencias.value))
  const pestana = computed<PestanaProgreso>(() =>
    (visibles.value.some((p) => p.id === route.query.ver) ? route.query.ver as PestanaProgreso : 'dominio'))
  const elegir = (id: PestanaProgreso) => router.replace({ query: { ...route.query, ver: id === 'dominio' ? undefined : id } })

  /** Flechas izquierda y derecha entre pestañas (patrón de pestañas de WAI-ARIA). */
  function moverConFlechas(e: KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const lista = visibles.value
    const i = lista.findIndex((p) => p.id === pestana.value)
    const sig = lista[(i + (e.key === 'ArrowRight' ? 1 : lista.length - 1)) % lista.length].id
    elegir(sig)
    nextTick(() => document.getElementById(`pestana-${sig}`)?.focus())
  }

  return { visibles, pestana, elegir, moverConFlechas }
}
