import { contextoDeVinculos, contextoDocente, type ClaseConAsignatura, type VinculoInfo } from '~/utils/contextoAcademico'

/**
 * Lo que la barra superior dice del docente, sacado de sus clases (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md):
 * «Unicórdoba · Lic. en Informática», «Unicórdoba · 2 programas», «2 instituciones»… Si ninguna clase tiene asignatura,
 * de sus vínculos («Dónde enseño», fase 3); si tampoco hay, nada. Se carga una vez por sesión; `recargar()` tras crear o
 * editar una clase o un vínculo. `programaPrincipal` sugiere asignaturas al crear la primera clase.
 */
export function useContextoDocente() {
  const texto = useState<string | null>('contexto-docente', () => null)
  const programaPrincipal = useState<number | null>('contexto-docente-programa', () => null)
  const cargado = useState<boolean>('contexto-docente-cargado', () => false)
  const api = useApi()

  async function recargar() {
    try {
      const [clases, vinculos] = await Promise.all([
        api.get<ClaseConAsignatura[]>('/class/my-classes'),
        api.get<VinculoInfo[]>('/users/me/affiliations').catch(() => [] as VinculoInfo[]),
      ])
      texto.value = contextoDocente(clases) ?? contextoDeVinculos(vinculos)
      programaPrincipal.value = vinculos[0]?.program.id ?? null
    } catch {
      texto.value = null
    }
    cargado.value = true
  }

  function cargar() {
    if (!cargado.value) void recargar()
  }

  return { texto, programaPrincipal, cargar, recargar }
}
