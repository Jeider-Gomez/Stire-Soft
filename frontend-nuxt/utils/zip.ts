// Un .zip sin compresión («stored»), sin dependencias: basta para descargar los archivos de texto de un proyecto
// (hasta 200 KB). Formato: APPNOTE.TXT de PKWARE — cabecera local por archivo, directorio central y fin de directorio.

let tablaCrc: Uint32Array | null = null

export function crc32(datos: Uint8Array): number {
  if (!tablaCrc) {
    tablaCrc = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      tablaCrc[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (const byte of datos) crc = tablaCrc[(crc ^ byte) & 0xff]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

export function crearZip(archivos: Array<{ nombre: string; contenido: string }>): Uint8Array {
  const utf8 = new TextEncoder()
  const locales: Uint8Array[] = []
  const centrales: Uint8Array[] = []
  let desplazamiento = 0

  for (const archivo of archivos) {
    const nombre = utf8.encode(archivo.nombre)
    const datos = utf8.encode(archivo.contenido)
    const crc = crc32(datos)

    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true) // firma de cabecera local
    local.setUint16(4, 20, true) // versión necesaria
    local.setUint16(6, 0x0800, true) // nombres en UTF-8
    local.setUint16(8, 0, true) // sin compresión
    local.setUint32(14, crc, true)
    local.setUint32(18, datos.length, true)
    local.setUint32(22, datos.length, true)
    local.setUint16(26, nombre.length, true)
    locales.push(new Uint8Array(local.buffer), nombre, datos)

    const central = new DataView(new ArrayBuffer(46))
    central.setUint32(0, 0x02014b50, true) // firma del directorio central
    central.setUint16(4, 20, true)
    central.setUint16(6, 20, true)
    central.setUint16(8, 0x0800, true)
    central.setUint16(10, 0, true)
    central.setUint32(16, crc, true)
    central.setUint32(20, datos.length, true)
    central.setUint32(24, datos.length, true)
    central.setUint16(28, nombre.length, true)
    central.setUint32(42, desplazamiento, true)
    centrales.push(new Uint8Array(central.buffer), nombre)

    desplazamiento += 30 + nombre.length + datos.length
  }

  const tamCentral = centrales.reduce((t, b) => t + b.length, 0)
  const fin = new DataView(new ArrayBuffer(22))
  fin.setUint32(0, 0x06054b50, true) // fin del directorio central
  fin.setUint16(8, archivos.length, true)
  fin.setUint16(10, archivos.length, true)
  fin.setUint32(12, tamCentral, true)
  fin.setUint32(16, desplazamiento, true)

  const partes = [...locales, ...centrales, new Uint8Array(fin.buffer)]
  const salida = new Uint8Array(partes.reduce((t, b) => t + b.length, 0))
  let i = 0
  for (const parte of partes) {
    salida.set(parte, i)
    i += parte.length
  }
  return salida
}
