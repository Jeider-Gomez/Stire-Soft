/**
 * Cliente mínimo de la API de STIRE para los scripts de cursos: inicia sesión como cualquier usuario y hace
 * las mismas peticiones que la aplicación web (mismas rutas, mismos cuerpos, mismo token).
 */
/** El servidor permite 100 peticiones por minuto por IP: se espacian para no pasarse. */
const PAUSA_MINIMA_MS = 650;
let ultimaPeticion = 0;

export class Api {
  private token = '';

  constructor(private readonly base: string) {}

  async login(email: string, password: string): Promise<{ id: number; role: string; fullName?: string }> {
    const res = await this.request<{ access_token: string; user: { id: number; role: string; fullName?: string } }>(
      'POST',
      '/auth/login',
      { email, password },
    );
    this.token = res.access_token;
    return res.user;
  }

  get<T>(ruta: string): Promise<T> {
    return this.request<T>('GET', ruta);
  }

  post<T>(ruta: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', ruta, body);
  }

  patch<T>(ruta: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', ruta, body);
  }

  private async request<T>(method: string, ruta: string, body?: unknown, reintentos = 8): Promise<T> {
    const espera = ultimaPeticion + PAUSA_MINIMA_MS - Date.now();
    if (espera > 0) await esperar(espera);
    ultimaPeticion = Date.now();
    let res: Response;
    try {
      res = await fetch(`${this.base}${ruta}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      // Corte de red momentáneo: se reintenta igual que un 429.
      if (reintentos <= 0) throw err;
      await esperar(10_000);
      return this.request<T>(method, ruta, body, reintentos - 1);
    }
    const text = await res.text();
    if (res.status === 429 && reintentos > 0) {
      await esperar(15_000);
      return this.request<T>(method, ruta, body, reintentos - 1);
    }
    if (!res.ok) throw new Error(`${method} ${ruta} → ${res.status}: ${text.slice(0, 400)}`);
    return (text ? JSON.parse(text) : null) as T;
  }
}

export function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    console.error(`Falta la variable de entorno ${nombre}.`);
    process.exit(1);
  }
  return valor;
}

export const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
