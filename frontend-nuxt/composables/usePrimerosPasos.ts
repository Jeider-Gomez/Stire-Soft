import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { useTutorStore } from '~/stores/tutor'
import { avancePrimerosPasos, clavePrimerosPasos, pasoDeRuta, type IdPrimerPaso } from '~/utils/primerosPasos'

interface Guardado { hechos: IdPrimerPaso[]; oculta: boolean }

/**
 * Estado de la lista de primeros pasos (utils/primerosPasos.ts). `seguir` va en los layouts del estudiante: marca cada
 * paso cuando la persona lo hace. La tarjeta (EstudiantePrimerosPasos) y el menú de ayuda leen y cambian el mismo estado.
 */
export function usePrimerosPasos() {
  const authStore = useAuthStore()
  const studentStore = useStudentStore()
  const estado = useState<Guardado>('primeros-pasos', () => ({ hechos: [], oculta: false }))
  // De quién es lo cargado: si entra otra persona en el mismo navegador, se carga lo suyo.
  const cargado = useState<string | null>('primeros-pasos-cargado', () => null)
  const clave = () => clavePrimerosPasos(authStore.user?.id)

  function cargar() {
    if (cargado.value === clave()) return
    cargado.value = clave()
    estado.value = { hechos: [], oculta: false }
    try {
      const g = JSON.parse(localStorage.getItem(clave()) ?? 'null') as Guardado | null
      if (g && Array.isArray(g.hechos)) estado.value = { hechos: g.hechos, oculta: !!g.oculta }
    } catch { /* sin almacenamiento: empieza de cero */ }
  }
  function guardar() {
    try { localStorage.setItem(clave(), JSON.stringify(estado.value)) } catch { /* solo se pierde el recuerdo */ }
  }

  function marcar(id: IdPrimerPaso | null) {
    if (!id || estado.value.hechos.includes(id)) return
    estado.value = { ...estado.value, hechos: [...estado.value.hechos, id] }
    guardar()
  }

  /** Lo hecho, contando la clase: estar en una ya cumple el primer paso. */
  const hechos = computed<IdPrimerPaso[]>(() =>
    studentStore.enrolledClasses.length > 0 && !estado.value.hechos.includes('clase') ? [...estado.value.hechos, 'clase'] : estado.value.hechos,
  )
  const avance = computed(() => avancePrimerosPasos(hechos.value))
  const visible = computed(() => !estado.value.oculta && !avance.value.terminado)

  function ocultar() {
    cargar()
    estado.value = { ...estado.value, oculta: true }
    guardar()
  }
  /** Desde el menú de ayuda: la lista vuelve a salir en el inicio. */
  function mostrar() {
    cargar()
    estado.value = { ...estado.value, oculta: false }
    guardar()
  }

  /** En los layouts del estudiante: marca la lección, el ejercicio y los repasos al entrar, y el Tutor al abrirlo. */
  function seguir() {
    const route = useRoute()
    const tutorStore = useTutorStore()
    onMounted(() => {
      cargar()
      watch(() => route.path, (r) => marcar(pasoDeRuta(r)), { immediate: true })
      watch(() => tutorStore.isOpen, (abierto) => { if (abierto) marcar('tutor') }, { immediate: true })
    })
  }

  return { hechos, avance, visible, ocultar, mostrar, seguir, cargar }
}
