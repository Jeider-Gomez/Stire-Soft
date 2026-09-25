import { JSDOM } from 'jsdom';
import {
  HtmlCssCheck,
  HtmlCssConfig,
  HtmlCssRule,
} from '../../activity-questions/interfaces/question-configs.interface';

// Fase 25 (ADR 13): calificación de HTML y CSS POR REGLAS, en el servidor.
//
// SEGURIDAD — nunca se ejecuta nada del estudiante:
//   · `new JSDOM(html)` SIN `runScripts` (por defecto los <script> y los atributos `on…` no corren) y SIN `resources`
//     (no carga hojas de estilo, imágenes ni iframes: no hay red). Verificado en html-css.checker.spec.ts.
//   · No hay expresiones regulares escritas por el docente (evita ReDoS): los textos se comparan con `includes`/`===`.
//   · Tope de tamaño de la entrada y de elementos revisados por regla.
//
// LÍMITES DE LO QUE SE PUEDE COMPROBAR (ADR 13): jsdom aplica la cascada (especificidad, orden, herencia) de las hojas
// de estilo del documento, pero NO evalúa `@media`, ni calcula posiciones ni tamaños renderizados. Eso queda como
// criterio del docente.

export const HTML_CSS_MAX_CHARS = 50_000;
const MAX_ELEMENTS_PER_RULE = 500;

export interface RuleOutcome {
  id: string;
  passed: boolean;
  /** Motivo corto y sin datos de reglas ocultas; solo se muestra al estudiante para reglas públicas. */
  detail?: string;
}

export interface HtmlCssRunResult {
  results: Array<{ id: string; label: string; passed: boolean; detail?: string }>;
  allPassed: boolean;
  passedWeight: number;
  totalWeight: number;
}

interface CheckOutcome {
  passed: boolean;
  detail?: string;
}

function createDom(html: string, css: string): JSDOM {
  const dom = new JSDOM(html);
  if (css) {
    const style = dom.window.document.createElement('style');
    style.textContent = css;
    dom.window.document.head.appendChild(style);
  }
  return dom;
}

/** Devuelve un texto de error si la entrada supera el tope, o null si está dentro del límite. */
export function inputSizeError(html: unknown, css: unknown): string | null {
  if (typeof html !== 'string' || typeof css !== 'string') return 'El HTML y el CSS deben ser texto.';
  if (html.length > HTML_CSS_MAX_CHARS || css.length > HTML_CSS_MAX_CHARS) {
    return `El HTML y el CSS no pueden superar los ${HTML_CSS_MAX_CHARS} caracteres cada uno.`;
  }
  return null;
}

/** ¿`selector` es un selector CSS válido para el motor de jsdom? (lo usa el validador al crear la pregunta) */
export function isValidSelector(selector: string): boolean {
  const dom = new JSDOM('');
  try {
    dom.window.document.querySelectorAll(selector);
    return true;
  } catch {
    return false;
  } finally {
    dom.window.close();
  }
}

function elementsOf(doc: Document, selector: string): Element[] {
  return Array.from(doc.querySelectorAll(selector)).slice(0, MAX_ELEMENTS_PER_RULE);
}

function normalizeText(text: string, caseSensitive: boolean): string {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return caseSensitive ? collapsed : collapsed.toLowerCase();
}

/**
 * Lleva un valor CSS a su forma canónica por el MISMO camino que el valor calculado del elemento: se asigna a un elemento
 * de un documento aparte (el del estudiante no se toca) y se lee con getComputedStyle. Así `#F00`, `red` y `rgb(255,0,0)`
 * quedan iguales, y `0 auto` y `0px auto` también. (Leer `style.getPropertyValue` no basta: deja `red` como `red` mientras
 * que el valor calculado es `rgb(255, 0, 0)`.)
 */
function canonicalCssValue(probeDom: JSDOM, property: string, raw: string): string {
  const doc = probeDom.window.document;
  const probe = doc.createElement('div');
  probe.style.setProperty(property, raw);
  doc.body.appendChild(probe);
  try {
    const computed = probeDom.window.getComputedStyle(probe).getPropertyValue(property);
    return (computed || raw).trim().toLowerCase().replace(/\s+/g, ' ').replace(/\s*!important$/, '');
  } finally {
    probe.remove();
  }
}

const NON_LABELLED_INPUT_TYPES = new Set(['hidden', 'submit', 'button', 'reset', 'image']);

function hasAccessibleLabel(doc: Document, control: Element): boolean {
  if ((control.getAttribute('aria-label') ?? '').trim()) return true;
  if ((control.getAttribute('aria-labelledby') ?? '').trim()) return true;
  if (control.closest('label')) return true;
  const id = control.getAttribute('id');
  if (!id) return false;
  return Array.from(doc.querySelectorAll('label')).some((label) => label.getAttribute('for') === id);
}

function runA11y(check: 'img_alt' | 'form_labels' | 'html_lang' | 'document_title' | 'single_h1', doc: Document): CheckOutcome {
  switch (check) {
    case 'img_alt': {
      const missing = Array.from(doc.querySelectorAll('img')).filter((img) => !img.hasAttribute('alt')).length;
      return missing === 0 ? { passed: true } : { passed: false, detail: 'Hay imágenes sin el atributo alt.' };
    }
    case 'form_labels': {
      const controls = Array.from(doc.querySelectorAll('input, select, textarea')).filter(
        (el) => !(el.tagName === 'INPUT' && NON_LABELLED_INPUT_TYPES.has((el.getAttribute('type') ?? 'text').toLowerCase())),
      );
      const unlabelled = controls.filter((el) => !hasAccessibleLabel(doc, el)).length;
      return unlabelled === 0 ? { passed: true } : { passed: false, detail: 'Hay campos de formulario sin etiqueta.' };
    }
    case 'html_lang':
      return (doc.documentElement.getAttribute('lang') ?? '').trim()
        ? { passed: true }
        : { passed: false, detail: 'La etiqueta html no declara el idioma (lang).' };
    case 'document_title':
      return (doc.querySelector('head > title')?.textContent ?? '').trim()
        ? { passed: true }
        : { passed: false, detail: 'El documento no tiene un título (title) con texto.' };
    case 'single_h1': {
      const count = doc.querySelectorAll('h1').length;
      return count === 1 ? { passed: true } : { passed: false, detail: `Se esperaba un solo h1 y hay ${count}.` };
    }
  }
}

interface CheckContext {
  dom: JSDOM;
  /** Documento aparte, creado la primera vez que hace falta (solo las reglas css_property lo usan). */
  probe: () => JSDOM;
}

function runCheck(check: HtmlCssCheck, ctx: CheckContext): CheckOutcome {
  const { dom } = ctx;
  const doc = dom.window.document;

  switch (check.kind) {
    case 'element_exists': {
      const found = elementsOf(doc, check.selector).length;
      const min = check.min ?? 1;
      if (found >= min) return { passed: true };
      return { passed: false, detail: found === 0 ? 'No se encontró ningún elemento.' : `Se encontraron ${found} y se esperaban al menos ${min}.` };
    }

    case 'element_count': {
      const found = elementsOf(doc, check.selector).length;
      const okEquals = check.equals === undefined || found === check.equals;
      const okMin = check.min === undefined || found >= check.min;
      const okMax = check.max === undefined || found <= check.max;
      return okEquals && okMin && okMax ? { passed: true } : { passed: false, detail: `Se encontraron ${found} elemento(s).` };
    }

    case 'text': {
      const elements = elementsOf(doc, check.selector);
      if (elements.length === 0) return { passed: false, detail: 'No se encontró ningún elemento.' };
      const caseSensitive = check.caseSensitive === true;
      const wanted = normalizeText(check.value, caseSensitive);
      const ok = elements.some((el) => {
        const actual = normalizeText(el.textContent ?? '', caseSensitive);
        return check.mode === 'equals' ? actual === wanted : actual.includes(wanted);
      });
      return ok ? { passed: true } : { passed: false, detail: 'El texto no coincide.' };
    }

    case 'attribute': {
      const elements = elementsOf(doc, check.selector);
      if (elements.length === 0) return { passed: false, detail: 'No se encontró ningún elemento.' };
      const ok = elements.some((el) => {
        if (check.mode === 'exists') return el.hasAttribute(check.name);
        const actual = el.getAttribute(check.name);
        if (actual === null) return false;
        const wanted = check.value ?? '';
        return check.mode === 'equals' ? actual.trim() === wanted.trim() : actual.includes(wanted);
      });
      return ok ? { passed: true } : { passed: false, detail: 'El atributo no está o no tiene el valor esperado.' };
    }

    case 'css_property': {
      const elements = elementsOf(doc, check.selector);
      if (elements.length === 0) return { passed: false, detail: 'No se encontró ningún elemento.' };
      const accepted = new Set(check.oneOf.map((value) => canonicalCssValue(ctx.probe(), check.property, value)));
      let lastSeen = '';
      for (const el of elements) {
        const computed = dom.window.getComputedStyle(el).getPropertyValue(check.property).trim().toLowerCase().replace(/\s+/g, ' ');
        lastSeen = computed;
        if (accepted.has(computed)) return { passed: true };
      }
      return { passed: false, detail: lastSeen ? `La propiedad vale «${lastSeen}».` : 'La propiedad no está definida.' };
    }

    case 'a11y':
      return runA11y(check.check, doc);
  }
}

/** Evalúa todas las reglas contra el HTML/CSS. Una regla que falla al evaluarse cuenta como no cumplida. */
export function evaluateRules(html: string, css: string, rules: HtmlCssRule[]): RuleOutcome[] {
  const dom = createDom(html, css);
  let probeDom: JSDOM | null = null;
  const ctx: CheckContext = {
    dom,
    probe: () => {
      probeDom = probeDom ?? new JSDOM('');
      return probeDom;
    },
  };
  try {
    return rules.map((rule) => {
      try {
        return { id: rule.id, ...runCheck(rule.check, ctx) };
      } catch {
        return { id: rule.id, passed: false, detail: 'No se pudo evaluar esta regla.' };
      }
    });
  } finally {
    dom.window.close();
    if (probeDom) (probeDom as JSDOM).window.close();
  }
}

/** «Probar» sin gastar intento: solo las reglas PÚBLICAS (las ocultas no se revelan ni se cuentan aquí). */
export function runPublicHtmlCssRules(html: string, css: string, config: HtmlCssConfig): HtmlCssRunResult {
  const publicRules = config.rules.filter((rule) => rule.isPublic);
  const outcomes = evaluateRules(html, css, publicRules);
  const results = publicRules.map((rule, index) => ({
    id: rule.id,
    label: rule.label,
    passed: outcomes[index].passed,
    ...(outcomes[index].detail ? { detail: outcomes[index].detail } : {}),
  }));
  return {
    results,
    allPassed: results.every((r) => r.passed),
    passedWeight: publicRules.reduce((sum, rule, i) => sum + (outcomes[i].passed ? rule.weight : 0), 0),
    totalWeight: publicRules.reduce((sum, rule) => sum + rule.weight, 0),
  };
}
