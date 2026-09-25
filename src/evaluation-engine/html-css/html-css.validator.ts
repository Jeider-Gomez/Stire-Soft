import { HtmlCssRule } from '../../activity-questions/interfaces/question-configs.interface';
import { evaluateRules, HTML_CSS_MAX_CHARS, isValidSelector } from './html-css.checker';

// Validación de la `config` de una pregunta `html_css` al CREARLA (Fase 25). Devuelve la lista de motivos de rechazo
// (vacía si es válida); el servicio la convierte en un 400 con el motivo en `error`, que el frontend muestra con
// `messageOf`. Además de la forma, comprueba dos cosas que solo se descubren ejecutando:
//   1. que cada selector sea válido para el motor de jsdom;
//   2. que la SOLUCIÓN MODELO cumpla el 100 % de las reglas: así una regla imposible o mal escrita se detecta al
//      crear el ejercicio y no cuando un estudiante ya lo está resolviendo.

const MAX_RULES = 30;
const MAX_ERRORS_REPORTED = 5;
const RULE_ID = /^[a-z0-9_-]{1,40}$/;
const ATTRIBUTE_NAME = /^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/;
const CSS_PROPERTY = /^[a-z-]{1,60}$/;
const A11Y_CHECKS = ['img_alt', 'form_labels', 'html_lang', 'document_title', 'single_h1'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

/** Errores de la parte «check» de una regla (`where` = «la regla "titulo"»). */
function checkErrors(check: unknown, where: string): string[] {
  if (!isRecord(check)) return [`${where}: falta el criterio (check).`];
  const errors: string[] = [];
  const kind = check['kind'];

  if (kind === 'a11y') {
    if (typeof check['check'] !== 'string' || !A11Y_CHECKS.includes(check['check'])) {
      errors.push(`${where}: la comprobación de accesibilidad debe ser una de ${A11Y_CHECKS.join(', ')}.`);
    }
    return errors;
  }

  if (!['element_exists', 'element_count', 'text', 'attribute', 'css_property'].includes(String(kind))) {
    return [`${where}: tipo de regla desconocido («${String(kind)}»).`];
  }

  const selector = check['selector'];
  if (!isText(selector, 200)) {
    errors.push(`${where}: el selector es obligatorio (máximo 200 caracteres).`);
  } else if (!isValidSelector(selector)) {
    errors.push(`${where}: el selector «${selector}» no es válido.`);
  }

  if (kind === 'element_exists' && check['min'] !== undefined && !isInt(check['min'], 1, 1000)) {
    errors.push(`${where}: «min» debe ser un entero entre 1 y 1000.`);
  }

  if (kind === 'element_count') {
    const { equals, min, max } = check;
    if (equals === undefined && min === undefined && max === undefined) {
      errors.push(`${where}: indica «equals», «min» o «max».`);
    }
    for (const [name, value] of [['equals', equals], ['min', min], ['max', max]] as const) {
      if (value !== undefined && !isInt(value, 0, 1000)) errors.push(`${where}: «${name}» debe ser un entero entre 0 y 1000.`);
    }
    if (isInt(min, 0, 1000) && isInt(max, 0, 1000) && min > max) errors.push(`${where}: «min» no puede ser mayor que «max».`);
  }

  if (kind === 'text') {
    if (check['mode'] !== 'contains' && check['mode'] !== 'equals') errors.push(`${where}: «mode» debe ser contains o equals.`);
    if (!isText(check['value'], 300)) errors.push(`${where}: el texto esperado es obligatorio (máximo 300 caracteres).`);
    if (check['caseSensitive'] !== undefined && typeof check['caseSensitive'] !== 'boolean') errors.push(`${where}: «caseSensitive» debe ser verdadero o falso.`);
  }

  if (kind === 'attribute') {
    const name = check['name'];
    if (typeof name !== 'string' || !ATTRIBUTE_NAME.test(name) || name.length > 60) errors.push(`${where}: el nombre del atributo no es válido.`);
    const mode = check['mode'];
    if (mode !== 'exists' && mode !== 'equals' && mode !== 'contains') {
      errors.push(`${where}: «mode» debe ser exists, equals o contains.`);
    } else if (mode !== 'exists' && !isText(check['value'], 300)) {
      errors.push(`${where}: el valor esperado del atributo es obligatorio (máximo 300 caracteres).`);
    }
  }

  if (kind === 'css_property') {
    const property = check['property'];
    if (typeof property !== 'string' || !CSS_PROPERTY.test(property)) errors.push(`${where}: la propiedad CSS debe escribirse en minúsculas y con guiones (por ejemplo «background-color»).`);
    const oneOf = check['oneOf'];
    if (!Array.isArray(oneOf) || oneOf.length < 1 || oneOf.length > 10 || !oneOf.every((v) => isText(v, 100))) {
      errors.push(`${where}: «oneOf» debe tener de 1 a 10 valores aceptados (máximo 100 caracteres cada uno).`);
    }
  }

  return errors;
}

export function validateHtmlCssConfig(config: unknown): string[] {
  if (!isRecord(config)) return ['La configuración de una pregunta html_css debe ser un objeto.'];
  const errors: string[] = [];

  for (const field of ['starterHtml', 'starterCss'] as const) {
    const value = config[field];
    if (typeof value !== 'string') errors.push(`«${field}» es obligatorio (puede estar vacío).`);
    else if (value.length > HTML_CSS_MAX_CHARS) errors.push(`«${field}» no puede superar los ${HTML_CSS_MAX_CHARS} caracteres.`);
  }

  const model = config['modelSolution'];
  let modelHtml = '';
  let modelCss = '';
  if (!isRecord(model) || typeof model['html'] !== 'string' || typeof model['css'] !== 'string' || !model['html'].trim()) {
    errors.push('La solución modelo (modelSolution.html y modelSolution.css) es obligatoria y su HTML no puede estar vacío.');
  } else if (model['html'].length > HTML_CSS_MAX_CHARS || model['css'].length > HTML_CSS_MAX_CHARS) {
    errors.push(`La solución modelo no puede superar los ${HTML_CSS_MAX_CHARS} caracteres en el HTML ni en el CSS.`);
  } else {
    modelHtml = model['html'];
    modelCss = model['css'];
  }

  const rawRules = config['rules'];
  if (!Array.isArray(rawRules) || rawRules.length < 1 || rawRules.length > MAX_RULES) {
    errors.push(`Debe haber entre 1 y ${MAX_RULES} reglas.`);
    return errors.slice(0, MAX_ERRORS_REPORTED);
  }

  const seen = new Set<string>();
  const valid: HtmlCssRule[] = [];
  rawRules.forEach((raw: unknown, index: number) => {
    if (!isRecord(raw)) {
      errors.push(`La regla ${index + 1} no es un objeto.`);
      return;
    }
    const where = `La regla "${typeof raw['id'] === 'string' ? raw['id'] : index + 1}"`;
    const before = errors.length;

    if (typeof raw['id'] !== 'string' || !RULE_ID.test(raw['id'])) errors.push(`${where}: el id debe usar letras minúsculas, números, guion o guion bajo (1 a 40).`);
    else if (seen.has(raw['id'])) errors.push(`${where}: el id está repetido.`);
    else seen.add(raw['id']);

    if (!isText(raw['label'], 160)) errors.push(`${where}: la etiqueta es obligatoria (máximo 160 caracteres).`);
    if (raw['hint'] !== undefined && (typeof raw['hint'] !== 'string' || raw['hint'].length > 240)) errors.push(`${where}: la pista no puede superar los 240 caracteres.`);
    if (typeof raw['isPublic'] !== 'boolean') errors.push(`${where}: «isPublic» debe ser verdadero o falso.`);
    if (!isInt(raw['weight'], 1, 100)) errors.push(`${where}: el peso debe ser un entero entre 1 y 100.`);
    errors.push(...checkErrors(raw['check'], where));

    // Forma ya comprobada campo por campo arriba (no hay tipo intermedio para un JSON de entrada).
    if (errors.length === before) valid.push(raw as unknown as HtmlCssRule);
  });

  if (!rawRules.some((r: unknown) => isRecord(r) && r['isPublic'] === true)) {
    errors.push('Debe haber al menos una regla pública (isPublic: true), para que el estudiante sepa qué se espera.');
  }

  // La solución modelo se ejecuta contra las reglas SOLO si todo lo anterior es válido.
  if (errors.length === 0 && valid.length === rawRules.length) {
    const outcomes = evaluateRules(modelHtml, modelCss, valid);
    outcomes.forEach((outcome, i) => {
      if (!outcome.passed) errors.push(`La solución modelo no cumple la regla "${valid[i].id}"${outcome.detail ? `: ${outcome.detail}` : '.'}`);
    });
  }

  return errors.slice(0, MAX_ERRORS_REPORTED);
}

