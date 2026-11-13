import { onMounted } from 'vue'

const CLAVE_CONTENIDO = 'stire-contenido-curso'

/**
 * Si el panel «Contenido del curso» de la lección está abierto (cuadros «E-Leccion» y «E-Leccion-Cerrado»). Se recuerda
 * en este navegador: quien lo recoge para leer a pantalla completa lo encuentra así en la siguiente lección.
 */
export function useContenidoCurso() {
  const abierto = useState('contenido-curso-abierto', () => true)
  onMounted(() => {
    try { abierto.value = localStorage.getItem(CLAVE_CONTENIDO) !== '0' } catch { /* sin almacenamiento */ }
  })
  function alternar() {
    abierto.value = !abierto.value
    try { localStorage.setItem(CLAVE_CONTENIDO, abierto.value ? '1' : '0') } catch { /* se usa sin recordar */ }
  }
  return { abierto, alternar }
}
