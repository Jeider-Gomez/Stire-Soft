import { ConsoleLogger } from '@nestjs/common';
import { LogBuffer, LogLevel, logBuffer } from './log-buffer';

/**
 * Logger de Nest que sigue escribiendo en la consola igual que siempre y, además, deja cada
 * evento en un buffer en memoria para el panel de administración.
 */
export class BufferedLogger extends ConsoleLogger {
  constructor(private readonly buffer: LogBuffer = logBuffer) {
    super();
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    super.log(message, ...optionalParams);
    this.capture('log', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    super.warn(message, ...optionalParams);
    this.capture('warn', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    super.error(message, ...optionalParams);
    this.capture('error', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    super.fatal(message, ...optionalParams);
    this.capture('fatal', message, optionalParams);
  }

  private capture(level: LogLevel, message: unknown, optionalParams: unknown[]): void {
    // Nest pasa el contexto (nombre de la clase) como último argumento de tipo string. En
    // `error(mensaje, stack)` ese último puede ser el stack: un contexto real es corto y sin
    // saltos de línea.
    const last = optionalParams[optionalParams.length - 1];
    const isContext = typeof last === 'string' && last.length <= 80 && !last.includes('\n');
    const context = isContext ? (last as string) : (this.context ?? null);
    this.buffer.push(level, message, context);
  }
}
