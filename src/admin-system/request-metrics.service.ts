import { Injectable } from '@nestjs/common';

interface RequestSample {
  at: number;
  ms: number;
  status: number;
}

export interface RequestMetricsSnapshot {
  sampled: number;
  windowSeconds: number | null;
  p50Ms: number | null;
  p95Ms: number | null;
  serverErrorRatePct: number | null;
}

/**
 * Latencia real de las últimas `capacity` peticiones HTTP atendidas por este proceso. En memoria
 * y sin persistencia: alimenta el panel de administración; no reemplaza a una herramienta de
 * observabilidad (APM) si el proyecto llega a necesitarla.
 */
@Injectable()
export class RequestMetricsService {
  private readonly samples: RequestSample[] = [];
  private readonly capacity = 500;

  record(ms: number, status: number, at = Date.now()): void {
    this.samples.push({ at, ms, status });
    if (this.samples.length > this.capacity) this.samples.shift();
  }

  snapshot(now = Date.now()): RequestMetricsSnapshot {
    if (this.samples.length === 0) {
      return { sampled: 0, windowSeconds: null, p50Ms: null, p95Ms: null, serverErrorRatePct: null };
    }
    const sorted = this.samples.map((s) => s.ms).sort((a, b) => a - b);
    const errors = this.samples.filter((s) => s.status >= 500).length;
    return {
      sampled: this.samples.length,
      windowSeconds: Math.round((now - this.samples[0].at) / 1000),
      p50Ms: this.percentile(sorted, 0.5),
      p95Ms: this.percentile(sorted, 0.95),
      serverErrorRatePct: Math.round((errors / this.samples.length) * 1000) / 10,
    };
  }

  // Percentil por rango más cercano: con pocas muestras devuelve un valor que sí ocurrió.
  private percentile(sortedAsc: number[], p: number): number {
    const index = Math.min(sortedAsc.length - 1, Math.ceil(p * sortedAsc.length) - 1);
    return Math.round(sortedAsc[Math.max(0, index)] * 10) / 10;
  }
}
