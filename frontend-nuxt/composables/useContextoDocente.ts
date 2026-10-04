import { contextoDocente, type ClaseConAsignatura } from '~/utils/contextoAcademico'

/**
 * Lo que la barra superior dice del docente, sacado de sus clases (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md):
 * «Unicórdoba · Lic. en Informática», «Unicórdoba · 2 programas», «2 instituciones»… o nada si ninguna clase tiene
 * asignatura. Se carga una vez por sesión; `recargar()` tras crear o editar una clase.
 */
export function useContextoDocente() {
  const texto = useState<string | null>('contexto-docente', () => null)
  const cargado = useState<boolean>('contexto-docente-cargado', () => false)
  const api = useApi()

  async function recargar() {
    try {
      texto.value = contextoDocente(await api.get<ClaseConAsignatura[]>('/class/my-classes'))
    } catch {
      texto.value = null
    }
    cargado.value = true
  }

  function cargar() {
    if (!cargado.value) void recargar()
  }

  return { texto, cargar, recargar }
}
