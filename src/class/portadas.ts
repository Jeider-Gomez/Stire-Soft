/**
 * Colores de portada que puede tener una clase (los mismos de frontend-nuxt/utils/pestanasClase.ts, COLORES_CLASE). Son
 * oscuros a propósito: sobre ellos va texto blanco y todos pasan 4,5:1 (WCAG AA). Se elige uno de la lista: un color
 * libre podría dejar ilegible el nombre de la clase.
 */
export const PORTADAS_CLASE = ['#0B3D91', '#0F766E', '#7B2FBF', '#B45309', '#334155', '#BE185D'] as const;
export type PortadaClase = (typeof PORTADAS_CLASE)[number];
