/**
 * Catálogo de tipos de actividad del sistema. Lo usan la migración que lo crea en cualquier instalación
 * (`SeedActivityTypeCatalog1789800000000`) y el seed de demostración, para que no se desincronicen.
 * `baseWeight` pondera la actividad en la maestría del estudiante.
 */
export const ACTIVITY_TYPE_CATALOG = [
  { code: 'AUTO-EVAL', name: 'Práctica Formativa', autoGradable: true, baseWeight: 1.0 },
  { code: 'TALLER', name: 'Taller de Código', autoGradable: true, baseWeight: 1.5 },
  { code: 'PARCIAL', name: 'Parcial / Evaluación', autoGradable: true, baseWeight: 3.0 },
] as const;
