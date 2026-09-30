// Lectura defensiva del `config` guardado de un ejercicio: lo usan los editores del docente en `load(config)`.
// El `config` llega del servidor como JSON sin tipo; estas funciones devuelven un valor del tipo pedido o el de
// reserva, sin lanzar, para que un ejercicio raro no rompa el diálogo de edición.

export type ConfigRecord = Record<string, unknown>

export function asRecord(value: unknown): ConfigRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as ConfigRecord) : {}
}

export function asRecordList(value: unknown): ConfigRecord[] {
  return Array.isArray(value) ? value.map(asRecord) : []
}

export function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

/** Número entero al final de un identificador (`opt3` → 3, `b12` → 12); sirve para que los contadores sigan después. */
export function trailingNumber(id: string): number {
  const match = /(\d+)$/.exec(id)
  return match ? Number(match[1]) : 0
}

/** JSON con las claves ordenadas: dos `config` con los mismos datos dan el mismo texto aunque las claves lleguen en otro orden. */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_clave, v: unknown) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v as ConfigRecord).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : v,
  )
}
