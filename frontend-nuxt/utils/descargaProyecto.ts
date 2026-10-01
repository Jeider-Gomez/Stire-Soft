// Descargar un proyecto (o una versión enviada) como .zip con sus archivos, o como un solo .html si es una página web.
import { crearZip } from './zip'
import { documentoWeb, type ArchivoProyecto } from './proyectoNavegador'

/** «Mi Calculadora (v2)» → «Mi-Calculadora-v2»: sin tildes ni caracteres que den problemas en un nombre de archivo. */
export function nombreDeArchivo(titulo: string): string {
  return titulo.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'proyecto'
}

function descargar(nombre: string, datos: BlobPart, tipo: string) {
  const url = URL.createObjectURL(new Blob([datos], { type: tipo }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function descargarZip(titulo: string, archivos: ArchivoProyecto[]) {
  descargar(`${nombreDeArchivo(titulo)}.zip`, crearZip(archivos), 'application/zip')
}

export function descargarHtml(titulo: string, archivos: ArchivoProyecto[]) {
  descargar(`${nombreDeArchivo(titulo)}.html`, documentoWeb(archivos, false), 'text/html')
}
