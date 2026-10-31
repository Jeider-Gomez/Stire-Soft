import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TutorConversationsRepository } from './tutor-conversations.repository';
import { TutorContextService, VERSION_PROMPT_TUTOR } from './tutor-context.service';
import { TutorCredentialService } from './tutor-credential.service';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';
import { TutorRecommendationService, SuggestedActivity, DueReviewsSummary } from './tutor-recommendation.service';
import { LearningUnitService } from '../learning-unit/learning-unit.service';
import { LearningProgressService } from '../learning-progress/learning-progress.service';
import { GuidanceLevel, guidanceLevelForFailedAttempts } from './tutor-guidance';
import { TutorSettingsService } from './tutor-settings.service';
import { crearFiltroEnVivo, limitCodeBlocks } from './tutor-solution-guard';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../content/entities/content.entity';
import { ContentType } from '../common/enums/content-type.enum';
import { Activity } from '../activities/entities/activity.entity';

/** Cuánto de la lección se le da al Tutor: lo suficiente para hablar con las mismas palabras y ejemplos. */
export const MAX_LECCION_PARA_TUTOR = 3000;
/** Cuánto del enunciado del ejercicio se le da al Tutor (10/10: sin él felicitaba código que no resolvía el ejercicio). */
export const MAX_ENUNCIADO_PARA_TUTOR = 1500;
/** La lección cuando hay un ejercicio abierto: el enunciado es lo principal. */
export const MAX_LECCION_CON_EJERCICIO = 1500;

const PRACTICE_INTENT_PATTERN =
  /\b(quiero|puedo|deseo|dame|necesito|hazme|ponme)\b[^.!?]{0,40}\b(practicar|estudiar|ejercitar|un ejercicio|ejercicios|repasar)\b/i;

// Varias frases para el saludo proactivo -- server-side, sin costo de LLM -- para que no suene
// siempre exactamente igual (docs/00_VISION_FUNCIONAL.md, pausa técnica 2026-09-15).
const GREETING_PREFIXES = ['Oye,', 'Mira,', 'Antes de seguir,', 'Una cosa,'];
// El saludo según la hora vive en tutor-saludo.ts: también lo usa el prompt (tutor-context.service.ts).
import { saludoSegunHora, esSaludo } from './tutor-saludo';
import { modelosCandidatos, OrdenDeModelos } from './orden-modelos';
import { notaDeHuecos } from './tutor-huecos';
import { cuerpoTranscripcion, esWav, limpiarTranscripcion, MAX_BYTES_AUDIO } from './tutor-voz';
export { saludoSegunHora, esSaludo };

/** «Antes de seguir, Tienes…» → «Antes de seguir, tienes…». Una sigla al inicio («HTML …») se deja igual. */
export function trasComa(texto: string): string {
  return /^\p{Lu}\p{Ll}/u.test(texto) ? texto[0].toLowerCase() + texto.slice(1) : texto;
}

const SUGGESTION_CLOSERS = ['¿Le damos con', '¿Practicamos', '¿Te animas con', '¿Vamos con'];

/**
 * Cierre del saludo: dice qué hacer. José (HALLAZGOS.md, 02/10) notó que el saludo dejaba la duda de si había que
 * escribir ya o esperar otra instrucción.
 */
export const CIERRE_CON_SUGERENCIA = 'Toca la tarjeta de abajo para ir al ejercicio, o escríbeme tu duda cuando quieras.';
export const CIERRE_SIN_SUGERENCIA = 'Escríbeme tu duda abajo: puede ser sobre un ejercicio, tu código o un tema de la lección.';

/**
 * Saludo cuando no hay un ejercicio que sugerir. Antes decía siempre «Vas al día con tus repasos y tu dominio está en
 * buen nivel en todas tus unidades», también con repasos vencidos (si ya hizo todas las actividades de esa lección no
 * hay «siguiente actividad» que sugerir) y con un estudiante que no ha empezado nada (03/10, la franja del Tutor decía
 * «6 repasos vencidos» justo encima). Solo afirma lo que sabe.
 */
export function saludoSinSugerencia(
  saludo: string,
  repasos: { overdueCount: number; oldest: { learningUnitTitle?: string | null } | null },
): string {
  if (repasos.overdueCount > 0) {
    const n = repasos.overdueCount;
    const cuales = n === 1 ? 'un repaso pendiente' : `${n} repasos pendientes`;
    const titulo = repasos.oldest?.learningUnitTitle;
    const masAtrasado = titulo ? (n === 1 ? `: "${titulo}"` : `; el más atrasado es "${titulo}"`) : '';
    return `${saludo} Tienes ${cuales}${masAtrasado}. Lo encuentras en «Repasos», en el menú. ${CIERRE_SIN_SUGERENCIA}`;
  }
  return `${saludo} Vas al día con tus repasos. ${CIERRE_SIN_SUGERENCIA}`;
}

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_TIMEOUT_MS = 15000;
/** Con la respuesta por partes: tope de la respuesta completa una vez que empezó a llegar. */
const GEMINI_TIMEOUT_EN_VIVO_MS = 60000;

/** El texto de una línea del SSE de Gemini («data: {…}»); vacío si la línea no trae texto. */
export function textoDeEventoGemini(linea: string): string {
  const l = linea.trim();
  if (!l.startsWith('data:')) return '';
  try {
    const datos = JSON.parse(l.slice(5).trim()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> };
    return (datos?.candidates?.[0]?.content?.parts ?? []).map((p) => (typeof p?.text === 'string' ? p.text : '')).join('');
  } catch {
    return '';
  }
}
/** Compartido por todas las preguntas: si un modelo de Google está caído, lo está para todos (orden-modelos.ts). */
const ordenDeModelos = new OrdenDeModelos();
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
  /** Título del refuerzo que incluye esta actividad: el Tutor da ayuda ampliada. null si no hay. */
  refuerzo: string | null;
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
    @InjectRepository(Content) private readonly contenidos: Repository<Content>,
    @InjectRepository(Activity) private readonly actividades: Repository<Activity>,
  ) {
    this.geminiModel = this.configService.get<string>('GEMINI_MODEL', 'gemini-flash-latest');
  }

  async sendMessage(user: User, message: string, context?: any): Promise<TutorReply> {
    const p = await this.prepararMensaje(user, message, context);
    const rawReply = await this.callGemini(p.apiKey, p.systemPrompt, p.history, message + notaDeHuecos(context));
    return this.cerrarMensaje(user.id, message, context, p, rawReply);
  }

  /**
   * Igual que sendMessage, pero la respuesta llega por partes (ítem 2 de la evaluación heurística): `alEscribir` recibe
   * cada trozo ya pasado por la barrera contra dar la solución (un bloque de código se retiene hasta revisarlo). El texto
   * definitivo, el que se guarda, es el que devuelve al final.
   */
  async sendMessageEnVivo(user: User, message: string, context: any, alEscribir: (texto: string) => void): Promise<TutorReply> {
    const p = await this.prepararMensaje(user, message, context);
    const filtro = p.conBarrera ? crearFiltroEnVivo(this.opcionesDeBarrera(context, message)) : null;
    const rawReply = await this.pedirAGeminiEnVivo(p.apiKey, this.cuerpoDelChat(p.systemPrompt, p.history, message + notaDeHuecos(context)), (trozo) => {
      const visible = filtro ? filtro.agregar(trozo) : trozo;
      if (visible) alEscribir(visible);
    });
    const resto = filtro?.terminar();
    if (resto) alEscribir(resto);
    return this.cerrarMensaje(user.id, message, context, p, rawReply);
  }

  /** Todo lo que va antes de hablar con Gemini: permisos, clave, contexto, nivel de ayuda, prompt e historial. */
  private async prepararMensaje(user: User, message: string, context?: any) {
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

    const enunciado = unit ? await this.enunciadoDelEjercicio(context?.activityId, unit.id) : {};
    const promptContext = {
      ...this.sanitizeContext(context, unit),
      // Con un ejercicio abierto la lección es apoyo: va más corta, así el Tutor lee menos y responde antes (10/10).
      ...(unit ? await this.leccionDeLaUnidad(unit.id, enunciado.activityDescription ? MAX_LECCION_CON_EJERCICIO : MAX_LECCION_PARA_TUTOR) : {}),
      ...enunciado,
    };

    // En un refuerzo la ayuda empieza un nivel más arriba; el tope del docente sigue mandando.
    const refuerzo = await this.settingsService.refuerzoConLaActividad(studentId, context?.activityId);
    const guidanceLevel = this.capLevel(await this.resolveGuidanceLevel(studentId, context?.activityId, refuerzo !== null), settings.maxGuideLevel);
    const systemPrompt = await this.contextService.buildSystemPrompt(studentId, promptContext, guidanceLevel, settings.style, refuerzo);
    // El historial se lee ANTES de guardar el mensaje nuevo: si no, el LLM lo recibe dos veces.
    const history = await this.convRepo.getRecentContext(studentId, HISTORY_WINDOW);
    // Dentro de una actividad o de un proyecto propio, un bloque de código largo se sustituye por un aviso.
    const enProyecto = typeof context?.proyectoTitulo === 'string' && context.proyectoTitulo.trim() !== '';
    return { unit, apiKey, systemPrompt, history, guidanceLevel, conBarrera: guidanceLevel !== null || enProyecto };
  }

  private opcionesDeBarrera(context: any, message: string) {
    return {
      studentCode: typeof context?.currentCode === 'string' ? context.currentCode : undefined,
      studentMessage: message,
      markup: context?.codeLanguage === 'html' || context?.codeLanguage === 'css',
    };
  }

  /** Lo que va después: la barrera sobre el texto completo, guardar la conversación y la tarjeta de práctica. */
  private async cerrarMensaje(
    studentId: number,
    message: string,
    context: any,
    p: { unit: { id: number; title: string } | null; guidanceLevel: GuidanceLevel | null; conBarrera: boolean },
    rawReply: string,
  ): Promise<TutorReply> {
    // Barrera en código contra dar la solución o escribir el proyecto (ver tutor-solution-guard.ts).
    let replyText = rawReply;
    if (p.conBarrera) {
      const guarded = limitCodeBlocks(rawReply, this.opcionesDeBarrera(context, message));
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
    const suggestedActivity = PRACTICE_INTENT_PATTERN.test(message) ? await this.resolveExplicitSuggestion(studentId, p.unit) : null;

    return { message: sanitizedAiResponse, suggestedActivity, guidanceLevel: p.guidanceLevel };
  }

  /**
   * Estado del Tutor para el estudiante, lo que la interfaz pide al abrir el chat (no escribe nada,
   * a diferencia del saludo): nivel de ayuda de la actividad, si el docente lo tiene activo, el tope,
   * los repasos vencidos y el enlace al contenido de la unidad de la actividad.
   */
  async getGuidance(user: User, activityId?: number): Promise<TutorGuidanceState> {
    const settings = await this.settingsService.resolveForStudent(user, { activityId });
    const refuerzo = settings.enabled ? await this.settingsService.refuerzoConLaActividad(user.id, activityId) : null;
    const level = this.capLevel(await this.resolveGuidanceLevel(user.id, activityId, refuerzo !== null), settings.maxGuideLevel);
    const base = { guidanceLevel: level, tutorEnabled: settings.enabled, maxGuideLevel: settings.maxGuideLevel, refuerzo };
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

  private async resolveGuidanceLevel(studentId: number, rawActivityId: unknown, ampliada = false): Promise<GuidanceLevel | null> {
    const activityId = Number(rawActivityId);
    if (!Number.isInteger(activityId) || activityId <= 0) return null;
    const failedAttempts = await this.learningProgressService.countFailedAttempts(studentId, activityId);
    return guidanceLevelForFailedAttempts(failedAttempts, ampliada);
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

  /**
   * La lección de la unidad (texto Markdown visible, en orden), para que el Tutor sepa qué está leyendo o qué estudió el
   * estudiante. La busca el servidor con la unidad ya autorizada: nunca se usa un texto de lección que mande el cliente.
   */
  private async leccionDeLaUnidad(unitId: number, maximo = MAX_LECCION_PARA_TUTOR): Promise<{ lessonTitle?: string; lessonText?: string }> {
    const bloques = await this.contenidos.find({
      where: { learningUnitId: unitId, isVisible: true, type: ContentType.MARKDOWN },
      order: { order: 'ASC' },
      take: 5,
    });
    const texto = bloques.map((b) => b.body ?? '').join('\n\n').trim();
    if (!texto) return {};
    return {
      lessonTitle: bloques[0]?.title,
      lessonText: texto.length > maximo ? `${texto.slice(0, maximo)}\n[…]` : texto,
    };
  }

  /**
   * El enunciado del ejercicio abierto, para que el Tutor revise el código contra lo que se pide (10/10, Jeider: dijo
   * «¡Exacto!» a un programa que leía `lineas[3]` y nunca iba a funcionar). Lo busca el servidor y solo dentro de la
   * unidad ya autorizada: un id de otra unidad no trae nada.
   */
  private async enunciadoDelEjercicio(activityId: unknown, unitId: number): Promise<{ activityDescription?: string }> {
    const id = Number(activityId);
    if (!Number.isInteger(id) || id <= 0) return {};
    const actividad = await this.actividades.findOne({ where: { id, learningUnitId: unitId }, select: { id: true, description: true } });
    const texto = actividad?.description?.trim();
    if (!texto) return {};
    return { activityDescription: texto.length > MAX_ENUNCIADO_PARA_TUTOR ? `${texto.slice(0, MAX_ENUNCIADO_PARA_TUTOR)}\n[…]` : texto };
  }

  private sanitizeContext(context: any, unit: { id: number; title: string } | null): any {
    if (!context || typeof context !== 'object') return context;
    const rest = { ...context };
    delete rest.learningUnitId;
    delete rest.unitTitle;
    // La lección y el enunciado los pone el servidor (leccionDeLaUnidad, enunciadoDelEjercicio), no el navegador.
    delete rest.lessonTitle;
    delete rest.lessonText;
    delete rest.activityDescription;
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
  async getProactiveGreeting(studentId: number): Promise<TutorReply & { reemplazaAnterior: boolean }> {
    const suggestedActivity = await this.recommendationService.suggestAmbient(studentId);
    const variant = new Date().getDate() % GREETING_PREFIXES.length;
    const timeOfDayGreeting = saludoSegunHora();

    const message = suggestedActivity
      ? `${timeOfDayGreeting} ${GREETING_PREFIXES[variant]} ${trasComa(suggestedActivity.reasonMessage)} ${SUGGESTION_CLOSERS[variant]} "${suggestedActivity.activityTitle}"? ${CIERRE_CON_SUGERENCIA}`
      : saludoSinSugerencia(timeOfDayGreeting, await this.recommendationService.summarizeDueReviews(studentId));

    // Si lo último de la conversación ya es un saludo (abrió el Tutor, no escribió nada y volvió a entrar), se cambia
    // por el nuevo en vez de sumar otro: el historial mostraba tres saludos seguidos (02/10).
    const [ultimo] = await this.convRepo.getRecentContext(studentId, 1);
    const reemplazaAnterior = !!ultimo && ultimo.role === 'assistant' && esSaludo(ultimo.content);
    if (reemplazaAnterior) await this.convRepo.delete({ id: ultimo.id });
    await this.convRepo.save({ studentId, role: 'assistant', content: message });

    return { message, suggestedActivity, guidanceLevel: null, reemplazaAnterior };
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
    return this.pedirAGemini(apiKey, this.cuerpoDelChat(systemPrompt, history, userMessage));
  }

  private cuerpoDelChat(systemPrompt: string, history: Array<{ role: string; content: string }>, userMessage: string) {
    return {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: this.toGeminiContents(history, userMessage),
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    };
  }

  /**
   * Convierte en texto lo que el estudiante le dijo al Tutor (tutor-voz.ts). Usa su misma clave gratuita: sin clave no hay
   * Tutor, y por tanto tampoco voz.
   */
  async transcribir(user: User, audio: Buffer | undefined): Promise<string> {
    if (!audio || audio.length === 0) throw new BadRequestException('No llegó el audio. Graba de nuevo.');
    if (audio.length > MAX_BYTES_AUDIO) throw new PayloadTooLargeException('El audio es muy largo: graba hasta un minuto.');
    if (!esWav(audio)) throw new UnsupportedMediaTypeException('El audio debe llegar en WAV.');
    const apiKey = await this.credentialService.getDecryptedKey(user.id);
    if (!apiKey) {
      throw new HttpException(
        'Para usar el Tutor necesitas configurar tu clave gratuita de Google AI Studio.',
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }
    const texto = limpiarTranscripcion(await this.pedirAGemini(apiKey, cuerpoTranscripcion(audio), true));
    if (!texto) throw new UnprocessableEntityException('No se entendió el audio. Habla un poco más cerca del micrófono.');
    return texto;
  }

  /** Prueba los modelos en orden (orden-modelos.ts) hasta que uno responda. `vacioEsRespuesta`: un audio sin voz da texto vacío. */
  private async pedirAGemini(apiKey: string, body: object, vacioEsRespuesta = false): Promise<string> {
    const candidateModels = modelosCandidatos(this.geminiModel);

    let sawQuota = false;
    for (const model of ordenDeModelos.orden(candidateModels)) {
      let res: Awaited<ReturnType<typeof fetch>>;
      const inicio = Date.now();
      try {
        res = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        });
      } catch (err: any) {
        ordenDeModelos.fallo(model);
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
        if (text || vacioEsRespuesta) {
          // Cuánto tarda cada respuesta (10/10, «el tutor se demora»): para medir antes de cambiar el modelo o el pensamiento.
          this.logger.log(`Tutor: ${model} respondió en ${Date.now() - inicio} ms (prompt ${VERSION_PROMPT_TUTOR}).`);
          ordenDeModelos.respondio(model);
          return text;
        }
        this.logger.warn(`Modelo ${model} respondió sin texto (finishReason: ${data?.candidates?.[0]?.finishReason ?? 'desconocido'}).`);
        continue;
      }

      if (await this.revisarFallo(res, model)) sawQuota = true;
    }
    this.sinModeloDisponible(sawQuota);
  }

  /** Un modelo respondió con error: clave inválida (se lanza), cuota (devuelve true) u otro (se prueba el siguiente). */
  private async revisarFallo(res: Awaited<ReturnType<typeof fetch>>, model: string): Promise<boolean> {
    const errText = await res.text().catch(() => '');
    if (res.status === 401 || res.status === 403 || (res.status === 400 && /API_KEY_INVALID|API key not valid/i.test(errText))) {
      this.logger.warn(`Google rechazó la clave de un estudiante (${res.status}).`);
      throw new UnprocessableEntityException(
        'Tu clave de Google AI Studio no es válida o fue revocada. Configura una nueva para seguir usando el Tutor.',
      );
    }
    if (res.status >= 500) ordenDeModelos.fallo(model);
    this.logger.warn(`Modelo ${model} devolvió ${res.status}. Probando siguiente modelo.`);
    return res.status === 429;
  }

  private sinModeloDisponible(sawQuota: boolean): never {
    if (sawQuota) {
      throw new HttpException(
        'Alcanzaste el límite gratuito de tu clave de Google AI Studio por ahora. Espera un momento e inténtalo de nuevo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    throw new ServiceUnavailableException('El tutor no está disponible en este momento. Inténtalo de nuevo en un minuto.');
  }

  /**
   * Como pedirAGemini, pero con la respuesta por partes (streamGenerateContent con SSE). Se cambia de modelo solo antes
   * del primer trozo: si un modelo no empieza a responder en GEMINI_TIMEOUT_MS, se prueba el siguiente; una vez que
   * escribió, un corte se informa como error (no se puede empezar de nuevo con otro). Devuelve el texto completo.
   */
  private async pedirAGeminiEnVivo(apiKey: string, body: object, alRecibir: (texto: string) => void): Promise<string> {
    const candidateModels = modelosCandidatos(this.geminiModel);
    let sawQuota = false;
    for (const model of ordenDeModelos.orden(candidateModels)) {
      const inicio = Date.now();
      const control = new AbortController();
      let reloj = setTimeout(() => control.abort(), GEMINI_TIMEOUT_MS);
      let res: Awaited<ReturnType<typeof fetch>>;
      try {
        res = await fetch(`${GEMINI_BASE_URL}/${model}:streamGenerateContent?alt=sse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(body),
          signal: control.signal,
        });
      } catch (err: any) {
        clearTimeout(reloj);
        ordenDeModelos.fallo(model);
        this.logger.warn(`Fallo de red o timeout con ${model} (${err?.name ?? 'error'}). Probando siguiente modelo.`);
        continue;
      }
      if (!res.ok || !res.body) {
        clearTimeout(reloj);
        if (await this.revisarFallo(res, model)) sawQuota = true;
        continue;
      }

      let texto = '';
      let primerTrozoMs = 0;
      let resto = '';
      const decoder = new TextDecoder();
      const reader = res.body.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          resto += decoder.decode(value, { stream: true });
          const lineas = resto.split('\n');
          resto = lineas.pop() ?? '';
          for (const trozo of lineas.map(textoDeEventoGemini)) {
            if (!trozo) continue;
            if (!texto) {
              primerTrozoMs = Date.now() - inicio;
              // Empezó a responder: desde aquí manda el tope de la respuesta completa, no el de arrancar.
              clearTimeout(reloj);
              reloj = setTimeout(() => control.abort(), GEMINI_TIMEOUT_EN_VIVO_MS);
            }
            texto += trozo;
            alRecibir(trozo);
          }
        }
        const ultimo = textoDeEventoGemini(resto);
        if (ultimo) { texto += ultimo; alRecibir(ultimo); }
      } catch (err: any) {
        clearTimeout(reloj);
        if (texto) {
          this.logger.warn(`${model} se cortó a mitad de la respuesta (${err?.name ?? 'error'}).`);
          throw new ServiceUnavailableException('El Tutor se interrumpió. Inténtalo de nuevo.');
        }
        ordenDeModelos.fallo(model);
        this.logger.warn(`${model} no empezó a responder (${err?.name ?? 'error'}). Probando siguiente modelo.`);
        continue;
      }
      clearTimeout(reloj);
      if (texto.trim()) {
        this.logger.log(`Tutor en vivo: ${model} respondió en ${Date.now() - inicio} ms (primer trozo a los ${primerTrozoMs} ms; prompt ${VERSION_PROMPT_TUTOR}).`);
        ordenDeModelos.respondio(model);
        return texto.trim();
      }
      this.logger.warn(`Modelo ${model} respondió sin texto.`);
    }
    this.sinModeloDisponible(sawQuota);
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
