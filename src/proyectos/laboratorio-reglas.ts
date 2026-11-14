/**
 * Reglas del Laboratorio (v3, Fase D, paso 6; cuadros «E-Laboratorio» y «E-Laboratorio-Proyecto»): los proyectos que cada
 * estudiante decide mostrar a su clase o a toda la universidad. Se publica una copia (si después cambia el proyecto, lo
 * publicado no cambia hasta que lo vuelva a publicar). No cuenta para la nota; el docente de la clase puede ocultar algo.
 */
import type { ArchivoProyecto, TipoProyecto } from './proyecto-reglas';

export const ALCANCES_LABORATORIO = ['clase', 'universidad'] as const;
export type AlcanceLaboratorio = (typeof ALCANCES_LABORATORIO)[number];

export const LIMITES_LABORATORIO = {
  largoDescripcion: 300,
  largoComentario: 500,
  largoMotivo: 300,
  /** Con tantos reportes de personas distintas, la publicación se oculta sola hasta que el docente la revise. */
  reportesParaOcultar: 3,
  porPagina: 60,
  lineasDeExtracto: 6,
} as const;

export class LaboratorioInvalidoError extends Error {}

export function esAlcance(valor: unknown): valor is AlcanceLaboratorio {
  return typeof valor === 'string' && (ALCANCES_LABORATORIO as readonly string[]).includes(valor);
}

function textoAcotado(valor: unknown, largo: number, vacio: string | null, nombre: string): string {
  const limpio = typeof valor === 'string' ? valor.trim() : '';
  if (!limpio) {
    if (vacio !== null) throw new LaboratorioInvalidoError(vacio);
    return '';
  }
  if (limpio.length > largo) throw new LaboratorioInvalidoError(`${nombre} admite como máximo ${largo} caracteres.`);
  return limpio;
}

/** Lo que el autor cuenta de su proyecto (opcional). */
export const validarDescripcion = (v: unknown) => textoAcotado(v, LIMITES_LABORATORIO.largoDescripcion, null, 'La descripción');
/** Un mensaje para el autor: no puede ir vacío. */
export const validarComentario = (v: unknown) => textoAcotado(v, LIMITES_LABORATORIO.largoComentario, 'Escribe tu mensaje antes de enviarlo.', 'El mensaje');
/** Por qué se reporta (opcional). */
export const validarMotivo = (v: unknown) => textoAcotado(v, LIMITES_LABORATORIO.largoMotivo, null, 'El motivo');

/** «Laura Martínez» → «Laura M.»: en el Laboratorio basta el nombre y la inicial del apellido. */
export function nombreCorto(completo: string | null | undefined): string {
  const partes = (completo ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'Alguien';
  if (partes.length === 1) return partes[0];
  // Con cuatro palabras (dos nombres y dos apellidos), el apellido es la tercera.
  const apellido = partes.length >= 4 ? partes[2] : partes[1];
  return `${partes[0]} ${apellido.charAt(0).toUpperCase()}.`;
}

export function iniciales(completo: string | null | undefined): string {
  const partes = (completo ?? '').trim().split(/\s+/).filter(Boolean);
  const apellido = partes.length >= 4 ? partes[2] : partes[1];
  return ((partes[0]?.charAt(0) ?? '?') + (apellido?.charAt(0) ?? '')).toUpperCase();
}

/**
 * Unas líneas para la tarjeta de la lista, sin cargar todo el proyecto: el principio del programa (JavaScript y
 * pseudocódigo) o el título de la página (web). Un diagrama no trae texto: la tarjeta lo dibuja con su ícono.
 */
export function extractoDe(tipo: TipoProyecto, archivos: ArchivoProyecto[]): string | null {
  const principal = (ext: string) => archivos.find((a) => a.nombre.endsWith(`.${ext}`))?.contenido ?? '';
  if (tipo === 'web') {
    const html = principal('html');
    const titulo = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '';
    const limpio = titulo.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return limpio ? limpio.slice(0, 80) : null;
  }
  if (tipo === 'diagrama') return null;
  const codigo = principal(tipo === 'pseudocodigo' ? 'psc' : 'js');
  const lineas = codigo.split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim() !== '');
  return lineas.length ? lineas.slice(0, LIMITES_LABORATORIO.lineasDeExtracto).map((l) => l.slice(0, 60)).join('\n') : null;
}

/** El título de la copia que alguien hace para sí: «Copia de …», dentro del largo permitido. */
export function tituloDeCopia(titulo: string, largo = 100): string {
  return `Copia de ${titulo}`.slice(0, largo);
}

/**
 * ¿Quién ve una publicación? Su autor siempre; el docente de su clase y un administrador, también si está oculta; los
 * demás, si no está oculta y es de una de sus clases o se mostró a toda la universidad.
 */
export function puedeVer(p: { autorId: number; classId: number; alcance: AlcanceLaboratorio; oculta: boolean }, quien: { id: number; esAdmin: boolean; clasesQueEnsena: number[]; clasesDondeEstudia: number[] }): boolean {
  if (p.autorId === quien.id || quien.esAdmin || quien.clasesQueEnsena.includes(p.classId)) return true;
  if (p.oculta) return false;
  return p.alcance === 'universidad' || quien.clasesDondeEstudia.includes(p.classId);
}
