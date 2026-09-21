export type LogLevel = 'error' | 'warn' | 'log' | 'debug' | 'verbose' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string | null;
  message: string;
}

const MAX_MESSAGE_LENGTH = 500;

// Cada patrón corresponde a un secreto que el sistema maneja de verdad: tokens de sesión,
// claves de Google AI Studio de los estudiantes y contraseñas. Si una excepción o un log
// de terceros los arrastra, no deben llegar a una pantalla de administración.
const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [oculto]'],
  [/eyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g, '[jwt oculto]'],
  [/AIza[0-9A-Za-z_-]{20,}/g, '[clave de Google oculta]'],
  [/\bAQ\.[0-9A-Za-z_.-]{20,}/g, '[clave de Google oculta]'],
  [/(x-goog-api-key["']?\s*[:=]\s*["']?)[^\s"',}]+/gi, '$1[oculto]'],
  [/(password|contrase(?:ñ|n)a|secret|token|api[_-]?key)(["']?\s*[:=]\s*["']?)[^\s"',}&]+/gi, '$1$2[oculto]'],
];

export function redactSecrets(text: string): string {
  return SECRET_PATTERNS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

/**
 * Registro de eventos reciente, en memoria y de tamaño fijo: los últimos `capacity` eventos del
 * proceso. No persiste (se pierde al reiniciar) a propósito: es una ventana de diagnóstico para
 * el administrador, no un sistema de auditoría; la retención real de logs la da la plataforma
 * donde se despliegue el backend.
 */
export class LogBuffer {
  private readonly entries: LogEntry[] = [];

  constructor(private readonly capacity = 500) {}

  push(level: LogLevel, message: unknown, context?: string | null): void {
    const text = typeof message === 'string' ? message : this.stringify(message);
    this.entries.push({
      timestamp: new Date().toISOString(),
      level,
      context: context ?? null,
      message: redactSecrets(text).slice(0, MAX_MESSAGE_LENGTH),
    });
    if (this.entries.length > this.capacity) this.entries.shift();
  }

  /** Más recientes primero; `levels` filtra por nivel. */
  recent(limit: number, levels?: LogLevel[]): LogEntry[] {
    const filtered = levels?.length ? this.entries.filter((e) => levels.includes(e.level)) : this.entries;
    return filtered.slice(-limit).reverse();
  }

  get size(): number {
    return this.entries.length;
  }

  clear(): void {
    this.entries.length = 0;
  }

  private stringify(value: unknown): string {
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    try {
      return JSON.stringify(value) ?? String(value);
    } catch {
      return String(value);
    }
  }
}

/** Instancia única del proceso: la escribe el logger y la lee el endpoint de administración. */
export const logBuffer = new LogBuffer();
