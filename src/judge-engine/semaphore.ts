// Tope de ejecuciones simultáneas del sandbox. Sin él, una avalancha (p. ej. 40
// estudiantes pulsando «Probar código» a la vez) lanzaba decenas de procesos de
// ~170 MB cada uno. Las que no caben esperan en cola (FIFO); el límite de tiempo
// de cada ejecución solo empieza a contar cuando le toca correr.
export class Semaphore {
  private available: number;
  private readonly waiters: Array<() => void> = [];

  constructor(max: number) {
    this.available = Math.max(1, Math.floor(max));
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.available > 0) {
      this.available--;
    } else {
      await new Promise<void>((resolve) => this.waiters.push(resolve));
    }
    try {
      return await task();
    } finally {
      const next = this.waiters.shift();
      if (next) next();
      else this.available++;
    }
  }
}
