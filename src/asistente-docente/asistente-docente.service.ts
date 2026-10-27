import { HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TutorCredentialService } from '../tutor/tutor-credential.service';
import { OrdenDeModelos } from '../tutor/orden-modelos';
import { Borrador, ContextoAsistente, ESQUEMAS, TipoBorrador, construirPrompt, validarBorrador } from './asistente-prompts';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
/** Un borrador es más largo que una respuesta del Tutor: más tiempo de espera. */
const TIEMPO_MAXIMO_MS = 45000;
const ordenDeModelos = new OrdenDeModelos();

/**
 * El Asistente del docente (docs/PLAN_ASISTENTE_DOCENTE.md §4): propone borradores de estructura, lección y ejercicios
 * con la clave gratuita de Google AI Studio del propio docente (la misma tabla cifrada que usa el Tutor). Nunca guarda ni
 * publica nada: el panel muestra el borrador y el docente decide si lo aplica.
 */
@Injectable()
export class AsistenteDocenteService {
  private readonly logger = new Logger(AsistenteDocenteService.name);
  private readonly modelo: string;

  constructor(
    private readonly credenciales: TutorCredentialService,
    configService: ConfigService,
  ) {
    this.modelo = configService.get<string>('GEMINI_MODEL', 'gemini-flash-latest');
  }

  estadoClave(docenteId: number) { return this.credenciales.getStatus(docenteId); }
  guardarClave(docenteId: number, clave: string) { return this.credenciales.save(docenteId, clave); }
  borrarClave(docenteId: number) { return this.credenciales.remove(docenteId); }

  async generar(docenteId: number, tipo: TipoBorrador, contexto: ContextoAsistente, pedido = ''): Promise<Borrador> {
    const clave = await this.credenciales.getDecryptedKey(docenteId);
    if (!clave) {
      throw new HttpException('Para usar el Asistente necesitas tu clave gratuita de Google AI Studio.', HttpStatus.PRECONDITION_REQUIRED);
    }
    const cuerpo = {
      contents: [{ role: 'user', parts: [{ text: construirPrompt(tipo, contexto, pedido) }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: ESQUEMAS[tipo], temperature: 0.6 },
    };
    // Una respuesta que no cumple el esquema se pide de nuevo una vez; si vuelve a fallar, se explica.
    for (let intento = 0; intento < 2; intento++) {
      const texto = await this.pedir(clave, cuerpo);
      let datos: unknown = null;
      try { datos = JSON.parse(texto); } catch { /* se reintenta */ }
      const borrador = validarBorrador(tipo, datos);
      if (borrador) return borrador;
      this.logger.warn(`Asistente: borrador «${tipo}» inválido (intento ${intento + 1}).`);
    }
    throw new UnprocessableEntityException('El Asistente no logró un borrador válido. Pídelo otra vez o con otras palabras.');
  }

  /** Prueba los modelos en orden hasta que uno responda (mismo criterio que el Tutor: src/tutor/orden-modelos.ts). */
  private async pedir(clave: string, cuerpo: object): Promise<string> {
    const candidatos = [...new Set([this.modelo, 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'].map((m) => m.replace(/^models\//, '')))];
    let cuota = false;
    for (const modelo of ordenDeModelos.orden(candidatos)) {
      let res: Response;
      try {
        res = await fetch(`${GEMINI_BASE_URL}/${modelo}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
          body: JSON.stringify(cuerpo),
          signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
        });
      } catch {
        ordenDeModelos.fallo(modelo);
        continue;
      }
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> } | null;
        const texto = (data?.candidates?.[0]?.content?.parts ?? []).map((p) => p?.text ?? '').join('').trim();
        if (texto) { ordenDeModelos.respondio(modelo); return texto; }
        continue;
      }
      const error = await res.text().catch(() => '');
      if (res.status === 401 || res.status === 403 || (res.status === 400 && /API_KEY_INVALID|API key not valid/i.test(error))) {
        throw new UnprocessableEntityException('Tu clave de Google AI Studio no es válida o fue revocada. Configura una nueva.');
      }
      if (res.status === 429) cuota = true;
      if (res.status >= 500) ordenDeModelos.fallo(modelo);
    }
    if (cuota) throw new HttpException('Alcanzaste el límite gratuito de tu clave por ahora. Espera un momento e inténtalo de nuevo.', HttpStatus.TOO_MANY_REQUESTS);
    throw new ServiceUnavailableException('El Asistente no está disponible en este momento. Inténtalo de nuevo en un minuto.');
  }
}
