import { GuidanceLevel, MAX_GUIDANCE_LEVEL } from './tutor-guidance';

/** Ámbitos en los que el docente puede configurar el Tutor; el más específico manda. */
export const TUTOR_SETTING_SCOPES = ['class', 'unit', 'activity'] as const;
export type TutorSettingScope = (typeof TUTOR_SETTING_SCOPES)[number];

/** Estilos acotados (sin texto libre: no abren una vía de inyección de prompt). */
export const TUTOR_STYLES = ['equilibrado', 'motivador', 'tecnico', 'breve'] as const;
export type TutorStyle = (typeof TUTOR_STYLES)[number];

export interface EffectiveTutorSettings {
  enabled: boolean;
  maxGuideLevel: GuidanceLevel;
  style: TutorStyle;
}

/** Configuración propia de un ámbito; `null` significa "hereda del ámbito superior". */
export interface OwnTutorSettings {
  enabled: boolean | null;
  maxGuideLevel: GuidanceLevel | null;
  style: TutorStyle | null;
}

export const DEFAULT_TUTOR_SETTINGS: EffectiveTutorSettings = {
  enabled: true,
  maxGuideLevel: MAX_GUIDANCE_LEVEL,
  style: 'equilibrado',
};

const STYLE_INSTRUCTIONS: Record<TutorStyle, string | null> = {
  equilibrado: null,
  motivador: 'ESTILO (definido por el docente): sé especialmente cercano y motivador; reconoce el esfuerzo antes de guiar.',
  tecnico: 'ESTILO (definido por el docente): sé técnico y preciso; usa la terminología correcta de programación.',
  breve: 'ESTILO (definido por el docente): responde en 60 palabras o menos, directo al punto.',
};

export function styleInstruction(style: TutorStyle): string | null {
  return STYLE_INSTRUCTIONS[style];
}

/** Combina de lo más específico a lo más general: el primer valor no nulo gana. */
export function mergeSettings(chain: OwnTutorSettings[]): EffectiveTutorSettings {
  const pick = <K extends keyof OwnTutorSettings>(key: K): NonNullable<OwnTutorSettings[K]> | undefined =>
    chain.map(s => s[key]).find(v => v !== null && v !== undefined) as NonNullable<OwnTutorSettings[K]> | undefined;
  return {
    enabled: pick('enabled') ?? DEFAULT_TUTOR_SETTINGS.enabled,
    maxGuideLevel: pick('maxGuideLevel') ?? DEFAULT_TUTOR_SETTINGS.maxGuideLevel,
    style: pick('style') ?? DEFAULT_TUTOR_SETTINGS.style,
  };
}
