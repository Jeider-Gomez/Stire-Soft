import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService } from './tutor-context.service';
import { TutorCredentialService } from './tutor-credential.service';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';
import { TutorRecommendationService, SuggestedActivity, DueReviewsSummary } from './tutor-recommendation.service';
import { LearningUnitService } from '../learning-unit/learning-unit.service';
import { LearningProgressService } from '../learning-progress/learning-progress.service';
import { GuidanceLevel, guidanceLevelForFailedAttempts } from './tutor-guidance';
import { TutorSettingsService } from './tutor-settings.service';
import { limitCodeBlocks } from './tutor-solution-guard';
import { User } from '../user/entities/user.entity';

const PRACTICE_INTENT_PATTERN =
  /\b(quiero|puedo|deseo|dame|necesito|hazme|ponme)\b[^.!?]{0,40}\b(practicar|estudiar|ejercitar|un ejercicio|ejercicios|repasar)\b/i;

// Varias frases para el saludo proactivo -- server-side, sin costo de LLM -- para que no suene
// siempre exactamente igual (docs/00_VISION_FUNCIONAL.md, pausa técnica 2026-09-15).
const GREETING_PREFIXES = ['Oye,', 'Mira,', 'Antes de seguir,', 'Una cosa,'];
const SUGGESTION_CLOSERS = ['¿Le damos con', '¿Practicamos', '¿Te animas con', '¿Vamos con'];

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_TIMEOUT_MS = 15000;
const HISTORY_WINDOW = 6;

export const HISTORY_DEFAULT_LIMIT = 20;
export const HISTORY_MAX_LIMIT = 50;

export interface TutorReply {
  message: string;
  suggestedActivity: SuggestedActivity | null;
  /** Nivel de ayuda con el que se respondió (null si el estudiante no está en una actividad). */
  guidanceLevel: GuidanceLevel | null;
}

/** Unidad a la que el estudiante puede volver desde el chat ("Ir al contenido"). */
export interface ContentLink {
  learningUnitId: number;
  title: string;
}

export interface TutorGuidanceState {
  guidanceLevel: GuidanceLevel | null;
  tutorEnabled: boolean;
  maxGuideLevel: GuidanceLevel;
  /** Repasos vencidos del estudiante; null si el Tutor está desactivado para él. */
  dueReviews: DueReviewsSummary | null;
  /** Contenido de la unidad de la actividad actual; null fuera de una actividad o si no puede leerla. */
  contentLink: ContentLink | null;
}

export interface TutorHistoryMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

type GeminiRole = 'user' | 'model';
interface GeminiContent {
  role: GeminiRole;
  parts: Array<{ text: string }>;
}

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);
  private readonly geminiModel: string;

  constructor(
    private readonly convRepo: TutorConversationsRepository,
    private readonly contextService: TutorContextService,
    private readonly configService: ConfigService,
    private readonly contentRenderingService: ContentRenderingService,
    private readonly recommendationService: TutorRecommendationService,
    private readonly credentialService: TutorCredentialService,
    private readonly learningUnitService: LearningUnitService,
    private readonly learningProgressService: LearningProgressService,
    private readonly settingsService: TutorSettingsService,
  ) {
    this.geminiModel = this.configService.get<string>('GEMINI_MODEL', 'gemini-flash-latest');
  }

  async sendMessage(user: User, message: string, context?: any): Promise<TutorReply> {
    const studentId = user.id;
    const unit = await this.resolveAccessibleUnit(user, context);

    // El docente manda: si desactivó el Tutor para esta clase, unidad o actividad, no se gasta ni la
    // cuota del estudiante ni se le pide la clave.
    const settings = await this.settingsService.resolveForStudent(user, { activityId: context?.activityId, unitId: unit?.id });
    if (!settings.enabled) {
      throw new ForbiddenException('Tu docente desactivó el Tutor en esta parte del curso.');
    }

    // Sin clave propia del estudiante no hay Tutor (cada estudiante usa su capa gratuita de Google
    // AI Studio). Se comprueba antes de tocar el historial para que un intento sin clave no lo ensucie.
    const apiKey = await this.credentialService.getDecryptedKey(studentId);
    if (!apiKey) {
      throw new HttpException(
        'Para usar el Tutor necesitas configurar tu clave gratuita de Google AI Studio.',
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }

    const practiceIntent = PRACTICE_INTENT_PATTERN.test(message);
    const promptContext = this.sanitizeContext(context, unit);

    const guidanceLevel = this.capLevel(await this.resolveGuidanceLevel(studentId, context?.activityId), settings.maxGuideLevel);
    const systemPrompt = await this.contextService.buildSystemPrompt(studentId, promptContext, guidanceLevel, settings.style);
    // El historial se lee ANTES de guardar el mensaje nuevo: si no, el LLM lo recibe dos veces.
    const history = await this.convRepo.getRecentContext(studentId, HISTORY_WINDOW);

    const rawReply = await this.callGemini(apiKey, systemPrompt, history, message);

    // Dentro de una actividad, un bloque de código largo se sustituye por un aviso (barrera en código
    // contra dar la solución completa; ver tutor-solution-guard.ts).
    let replyText = rawReply;
    if (guidanceLevel !== null) {
      const guarded = limitCodeBlocks(rawReply, {
        studentCode: typeof context?.currentCode === 'string' ? context.currentCode : undefined,
        studentMessage: message,
        markup: context?.codeLanguage === 'html' || context?.codeLanguage === 'css',
      });
      replyText = guarded.text;
      if (guarded.redactedBlocks > 0) {
        this.logger.warn(`Se omitieron ${guarded.redactedBlocks} bloque(s) de código largo en la respuesta del Tutor (barrera anti-solución).`);
      }
    }

    // ADR 07, perfil PLAIN: texto de estudiante y salida del LLM se guardan saneados. Ambos se
    // guardan solo tras una respuesta exitosa, así "Reintentar" tras un fallo no deja mensajes huérfanos.
    const sanitizedAiResponse = this.contentRenderingService.escapePlainText(replyText);
    await this.convRepo.save({
      studentId,
      role: 'user',
      content: this.contentRenderingService.escapePlainText(message),
    });
    await this.convRepo.save({ studentId, role: 'assistant', content: sanitizedAiResponse });

    // Solo se adjunta una tarjeta de ejercicio cuando el estudiante lo pidió explícitamente --
    // el "¿ya entendiste, practicamos?" es pregunta natural del propio LLM (tutor-context.service.ts
    // regla 6), no un marcador oculto: menos tokens por llamada y sin saturar cada respuesta.
    const suggestedActivity = practiceIntent ? await this.resolveExplicitSuggestion(studentId, unit) : null;

    return { message: sanitizedAiResponse, suggestedActivity, guidanceLevel };
  }

  /**
   * Estado del Tutor para el estudiante, lo que la interfaz pide al abrir el chat (no escribe nada,
   * a diferencia del saludo): nivel de ayuda de la actividad, si el docente lo tiene activo, el tope,
   * los repasos vencidos y el enlace al contenido de la unidad de la actividad.
   */
  async getGuidance(user: User, activityId?: number): Promise<TutorGuidanceState> {
    const settings = await this.settingsService.resolveForStudent(user, { activityId });
    const level = this.capLevel(await this.resolveGuidanceLevel(user.id, activityId), settings.maxGuideLevel);
    const base = { guidanceLevel: level, tutorEnabled: settings.enabled, maxGuideLevel: settings.maxGuideLevel };
    if (!settings.enabled) return { ...base, dueReviews: null, contentLink: null };

    const [dueReviews, contentLink] = await Promise.all([
      this.recommendationService.summarizeDueReviews(user.id),
      this.resolveContentLink(user, activityId),
    ]);
    return { ...base, dueReviews, contentLink };
  }

  private async resolveContentLink(user: User, activityId: unknown): Promise<ContentLink | null> {
    const unitId = await this.settingsService.findAccessibleUnitId(user, activityId);
    if (!unitId) return null;
    const unit = await this.resolveAccessibleUnit(user, { learningUnitId: unitId });
    return unit ? { learningUnitId: unit.id, title: unit.title } : null;
  }

  private capLevel(level: GuidanceLevel | null, max: GuidanceLevel): GuidanceLevel | null {
    return level === null ? null : (Math.min(level, max) as GuidanceLevel);
  }

  private async resolveGuidanceLevel(studentId: number, rawActivityId: unknown): Promise<GuidanceLevel | null> {
    const activityId = Number(rawActivityId);
    if (!Number.isInteger(activityId) || activityId <= 0) return null;
    const failedAttempts = await this.learningProgressService.countFailedAttempts(studentId, activityId);
    return guidanceLevelForFailedAttempts(failedAttempts);
  }

  async getHistory(studentId: number, limit?: number): Promise<TutorHistoryMessage[]> {
    const safeLimit = Math.min(Math.max(Math.trunc(limit ?? HISTORY_DEFAULT_LIMIT) || HISTORY_DEFAULT_LIMIT, 1), HISTORY_MAX_LIMIT);
    const rows = await this.convRepo.getHistory(studentId, safeLimit);
    return rows.map(row => ({
      id: row.id,
      role: row.role === 'assistant' ? 'assistant' : 'user',
      content: row.content,
      createdAt: row.createdAt,
    }));
  }

  /**
   * `learningUnitId` viene del cliente: solo se usa si el estudiante realmente puede leer esa unidad
   * (misma regla que `GET /learning-unit/:id`). Si no, se ignora en silencio — el chat no falla.
   */
  private async resolveAccessibleUnit(user: User, context: any): Promise<{ id: number; title: string } | null> {
    const id = Number(context?.learningUnitId);
    if (!Number.isInteger(id) || id <= 0) return null;
    try {
      const unit = await this.learningUnitService.findOne(id, user);
      return { id: unit.id, title: unit.title };
    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof NotFoundException) return null;
      throw err;
    }
  }

  private sanitizeContext(context: any, unit: { id: number; title: string } | null): any {
    if (!context || typeof context !== 'object') return context;
    const rest = { ...context };
    delete rest.learningUnitId;
    delete rest.unitTitle;
    return unit ? { ...rest, learningUnitId: unit.id, unitTitle: unit.title } : rest;
  }

  private async resolveExplicitSuggestion(
    studentId: number,
    unit: { id: number; title: string } | null,
  ): Promise<SuggestedActivity | null> {
    if (unit) {
      const reasonMessage = `Aquí tienes el siguiente ejercicio de "${unit.title}".`;
      return this.recommendationService.suggestForUnit(studentId, unit.id, 'contexto_actual', reasonMessage);
    }
    return this.recommendationService.suggestAmbient(studentId);
  }

  /**
   * Mensaje de apertura cuando el estudiante abre el Tutor -- no espera a que él hable primero.
   * Es plantilla (no generado por el LLM, para no gastar una llamada extra y ser 100% fiel a
   * datos reales: fecha de repaso, % de mastery), pero con variedad de frases para no sonar
   * siempre igual -- varía por día, no por request, así que dentro del mismo día es consistente.
   */
  async getProactiveGreeting(studentId: number): Promise<TutorReply> {
    const suggestedActivity = await this.recommendationService.suggestAmbient(studentId);
    const variant = new Date().getDate() % GREETING_PREFIXES.length;
    const timeOfDayGreeting = this.timeOfDayGreeting();

    const message = suggestedActivity
      ? `${timeOfDayGreeting} ${GREETING_PREFIXES[variant]} ${suggestedActivity.reasonMessage} ${SUGGESTION_CLOSERS[variant]} "${suggestedActivity.activityTitle}"?`
      : `${timeOfDayGreeting} Vas al día con tus repasos y tu dominio está en buen nivel en todas tus unidades. ¿En qué quieres que te ayude hoy?`;

    await this.convRepo.save({ studentId, role: 'assistant', content: message });

    return { message, suggestedActivity, guidanceLevel: null };
  }

  private timeOfDayGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 19) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  }

  /**
   * Llama a Google Gemini con la clave del propio estudiante (cabecera `x-goog-api-key`, nunca en la
   * URL). Prueba varios modelos candidatos y traduce el fallo a un código HTTP con sentido:
   * 422 clave inválida/revocada, 429 cuota gratuita agotada, 503 servicio no disponible.
   */
  private async callGemini(
    apiKey: string,
    systemPrompt: string,
    history: Array<{ role: string; content: string }>,
    userMessage: string,
  ): Promise<string> {
    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: this.toGeminiContents(history, userMessage),
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    };

    const candidateModels = Array.from(
      new Set([this.geminiModel, 'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'].map(m => m.replace(/^models\//, ''))),
    );

    let sawQuota = false;
    for (const model of candidateModels) {
      let res: Awaited<ReturnType<typeof fetch>>;
      try {
        res = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        });
      } catch (err: any) {
        this.logger.warn(`Fallo de red o timeout con ${model} (${err?.name ?? 'error'}). Probando siguiente modelo.`);
        continue;
      }

      if (res.ok) {
        const data: any = await res.json().catch(() => null);
        const text = (data?.candidates?.[0]?.content?.parts ?? [])
          .map((p: any) => p?.text)
          .filter(Boolean)
          .join('')
          .trim();
        if (text) return text;
        this.logger.warn(`Modelo ${model} respondió sin texto (finishReason: ${data?.candidates?.[0]?.finishReason ?? 'desconocido'}).`);
        continue;
      }

      const errText = await res.text().catch(() => '');
      if (res.status === 401 || res.status === 403 || (res.status === 400 && /API_KEY_INVALID|API key not valid/i.test(errText))) {
        this.logger.warn(`Google rechazó la clave de un estudiante (${res.status}).`);
        throw new UnprocessableEntityException(
          'Tu clave de Google AI Studio no es válida o fue revocada. Configura una nueva para seguir usando el Tutor.',
        );
      }
      if (res.status === 429) sawQuota = true;
      this.logger.warn(`Modelo ${model} devolvió ${res.status}. Probando siguiente modelo.`);
    }

    if (sawQuota) {
      throw new HttpException(
        'Alcanzaste el límite gratuito de tu clave de Google AI Studio por ahora. Espera un momento e inténtalo de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    throw new ServiceUnavailableException('El tutor no está disponible en este momento. Inténtalo de nuevo en un minuto.');
  }

  /** Gemini exige turnos que empiecen por el usuario y alternen: se descartan los `system`, los turnos iniciales del modelo y se fusionan los consecutivos. */
  private toGeminiContents(history: Array<{ role: string; content: string }>, userMessage: string): GeminiContent[] {
    const turns: GeminiContent[] = [];
    const push = (role: GeminiRole, text: string) => {
      const last = turns[turns.length - 1];
      if (last && last.role === role) last.parts[0].text += `\n\n${text}`;
      else turns.push({ role, parts: [{ text }] });
    };
    for (const msg of history) {
      if (msg.role === 'system') continue;
      const role: GeminiRole = msg.role === 'assistant' ? 'model' : 'user';
      if (turns.length === 0 && role === 'model') continue;
      push(role, msg.content);
    }
    push('user', userMessage);
    return turns;
  }
}
