// Un libro de Excel (.xlsx) de verdad, hecho en el navegador y sin dependencias (07/10, Jeider: «que el CSV tenga
// experiencia de usuario: un excelente Excel»). Un CSV se abre en Excel con las tildes rotas según la configuración
// regional, sin anchos, sin filtros y con las fechas como texto. Este libro trae encabezado fijo, filtros, anchos,
// texto ajustado, fechas de verdad y colores por estado. El .xlsx es un ZIP de archivos XML (Office Open XML,
// ECMA-376); aquí se guarda sin comprimir, que Excel, LibreOffice y Google Sheets abren igual.

export type EstiloCelda =
  | 'texto' | 'fecha' | 'numero' | 'encabezado' | 'titulo' | 'nota'
  | 'nuevo' | 'visto' | 'resuelto' | 'descartado' | 'grave'

export interface Celda { v: string | number | Date | null; estilo?: EstiloCelda }
export interface Columna { titulo: string; ancho: number }
export interface Hoja {
  nombre: string
  columnas?: Columna[]
  filas: Celda[][]
  /** Fija la primera fila (el encabezado) al desplazarse y le pone filtros. */
  conEncabezado?: boolean
}

// Índice de cada estilo en <cellXfs> de styles.xml (el orden importa).
const ESTILOS: Record<EstiloCelda, number> = {
  texto: 1, encabezado: 2, fecha: 3, numero: 4, titulo: 5, nota: 6, nuevo: 7, visto: 8, resuelto: 9, descartado: 10, grave: 11,
}

/** Texto seguro para XML: escapa y quita los caracteres de control que Excel rechaza («el archivo está dañado»). */
function xml(t: string): string {
  return t
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** «A», «B», … «Z», «AA»: la letra de la columna `i` (desde 0). */
export function letraColumna(i: number): string {
  let s = ''
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

/** Fecha de Excel: días desde el 30/12/1899, con la hora local como fracción (Excel no tiene zona horaria). */
export function fechaExcel(d: Date): number {
  return (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()) - Date.UTC(1899, 11, 30)) / 86400000
}

function celdaXml(c: Celda, ref: string): string {
  const s = ESTILOS[c.estilo ?? (c.v instanceof Date ? 'fecha' : typeof c.v === 'number' ? 'numero' : 'texto')]
  if (c.v === null || c.v === '') return `<c r="${ref}" s="${s}"/>`
  if (c.v instanceof Date) return `<c r="${ref}" s="${s}"><v>${fechaExcel(c.v)}</v></c>`
  if (typeof c.v === 'number') return `<c r="${ref}" s="${s}"><v>${c.v}</v></c>`
  // Una celda de Excel admite hasta 32 767 caracteres.
  return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${xml(c.v.slice(0, 32767))}</t></is></c>`
}

function hojaXml(h: Hoja): string {
  const ultima = letraColumna(Math.max(0, ...h.filas.map((f) => f.length - 1)))
  const cols = h.columnas?.length
    ? `<cols>${h.columnas.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.ancho}" customWidth="1"/>`).join('')}</cols>`
    : ''
  const filas = h.filas
    .map((f, r) => `<row r="${r + 1}">${f.map((c, i) => celdaXml(c, `${letraColumna(i)}${r + 1}`)).join('')}</row>`)
    .join('')
  const vista = h.conEncabezado
    ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
    : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
  const filtro = h.conEncabezado && h.filas.length > 1 ? `<autoFilter ref="A1:${ultima}${h.filas.length}"/>` : ''
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    `${vista}<sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${filas}</sheetData>${filtro}</worksheet>`
}

const ESTILOS_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy hh:mm"/></numFmts>' +
  '<fonts count="5">' +
  '<font><sz val="11"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><b/><sz val="14"/><color rgb="FF0B3D91"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><i/><sz val="10"/><color rgb="FF475569"/><name val="Calibri"/><family val="2"/></font>' +
  '<font><b/><sz val="11"/><color rgb="FF9F1239"/><name val="Calibri"/><family val="2"/></font>' +
  '</fonts>' +
  '<fills count="8">' +
  '<fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FF0B3D91"/><bgColor indexed="64"/></patternFill></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/><bgColor indexed="64"/></patternFill></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFDBEAFE"/><bgColor indexed="64"/></patternFill></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/><bgColor indexed="64"/></patternFill></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFFFE4E6"/><bgColor indexed="64"/></patternFill></fill>' +
  '</fills>' +
  '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>' +
  '<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right>' +
  '<top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="12">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  // 1 texto
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>' +
  // 2 encabezado
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>' +
  // 3 fecha
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>' +
  // 4 número
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf>' +
  // 5 título
  '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
  // 6 nota
  '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment wrapText="1"/></xf>' +
  // 7 nuevo · 8 visto · 9 resuelto · 10 descartado
  '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>' +
  '<xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>' +
  '<xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>' +
  '<xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>' +
  // 11 grave
  '<xf numFmtId="0" fontId="4" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>' +
  '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'

/** Nombre de hoja válido para Excel: sin []:*?/\ y hasta 31 caracteres. */
const nombreHoja = (n: string) => n.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31) || 'Hoja'

// ── ZIP sin compresión (método 0) ─────────────────────────────────────────────────────────────────────────────────
const TABLA_CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
export function crc32(datos: Uint8Array): number {
  let c = 0xffffffff
  for (const b of datos) c = TABLA_CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function zip(archivos: Array<{ nombre: string; datos: Uint8Array }>): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder()
  const partes: Uint8Array[] = []
  const central: Uint8Array[] = []
  let desplazamiento = 0
  for (const a of archivos) {
    const nombre = enc.encode(a.nombre)
    const crc = crc32(a.datos)
    const local = new DataView(new ArrayBuffer(30))
    local.setUint32(0, 0x04034b50, true)
    local.setUint16(4, 20, true)
    local.setUint16(6, 0x0800, true) // nombres en UTF-8
    local.setUint16(8, 0, true) // sin compresión
    local.setUint16(10, 0, true)
    local.setUint16(12, 0x21, true) // 01/01/1980
    local.setUint32(14, crc, true)
    local.setUint32(18, a.datos.length, true)
    local.setUint32(22, a.datos.length, true)
    local.setUint16(26, nombre.length, true)
    local.setUint16(28, 0, true)
    partes.push(new Uint8Array(local.buffer), nombre, a.datos)

    const cd = new DataView(new ArrayBuffer(46))
    cd.setUint32(0, 0x02014b50, true)
    cd.setUint16(4, 20, true)
    cd.setUint16(6, 20, true)
    cd.setUint16(8, 0x0800, true)
    cd.setUint16(10, 0, true)
    cd.setUint16(12, 0, true)
    cd.setUint16(14, 0x21, true)
    cd.setUint32(16, crc, true)
    cd.setUint32(20, a.datos.length, true)
    cd.setUint32(24, a.datos.length, true)
    cd.setUint16(28, nombre.length, true)
    cd.setUint32(42, desplazamiento, true)
    central.push(new Uint8Array(cd.buffer), nombre)
    desplazamiento += 30 + nombre.length + a.datos.length
  }
  const tamCentral = central.reduce((n, p) => n + p.length, 0)
  const fin = new DataView(new ArrayBuffer(22))
  fin.setUint32(0, 0x06054b50, true)
  fin.setUint16(8, archivos.length, true)
  fin.setUint16(10, archivos.length, true)
  fin.setUint32(12, tamCentral, true)
  fin.setUint32(16, desplazamiento, true)
  const todo = [...partes, ...central, new Uint8Array(fin.buffer)]
  const out = new Uint8Array(todo.reduce((n, p) => n + p.length, 0))
  let i = 0
  for (const p of todo) { out.set(p, i); i += p.length }
  return out
}

/** El libro completo, listo para descargar como `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. */
export function crearLibroExcel(hojas: Hoja[]): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder()
  const archivo = (nombre: string, texto: string) => ({ nombre, datos: enc.encode(texto) })
  const tipos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    hojas.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
    '</Types>'
  const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    '</Relationships>'
  const libro = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
    hojas.map((h, i) => `<sheet name="${xml(nombreHoja(h.nombre))}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('') +
    '</sheets>' +
    // Los filtros de cada hoja con encabezado (Excel los pide también como nombre definido).
    (hojas.some((h) => h.conEncabezado && h.filas.length > 1)
      ? `<definedNames>${hojas.map((h, i) => (h.conEncabezado && h.filas.length > 1
        ? `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xml(nombreHoja(h.nombre)).replace(/'/g, "''")}'!$A$1:$${letraColumna(Math.max(0, ...h.filas.map((f) => f.length - 1)))}$${h.filas.length}</definedName>`
        : '')).join('')}</definedNames>`
      : '') +
    '</workbook>'
  const relsLibro = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    hojas.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
    `<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    '</Relationships>'
  return zip([
    archivo('[Content_Types].xml', tipos),
    archivo('_rels/.rels', rels),
    archivo('xl/workbook.xml', libro),
    archivo('xl/_rels/workbook.xml.rels', relsLibro),
    archivo('xl/styles.xml', ESTILOS_XML),
    ...hojas.map((h, i) => archivo(`xl/worksheets/sheet${i + 1}.xml`, hojaXml(h))),
  ])
}

/** Descarga el libro con un nombre de archivo. */
export function descargarExcel(hojas: Hoja[], nombreArchivo: string) {
  const bytes = crearLibroExcel(hojas)
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
