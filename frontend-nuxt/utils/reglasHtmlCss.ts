/**
 * Reglas de un ejercicio HTML/CSS (el editor del docente): crear una regla vacía, limpiar sus campos al cambiar de tipo,
 * convertirla a la `check` que califica el backend y al revés, y validar todo el ejercicio. Lógica pura, con prueba
 * (src/content-rendering/__tests__/reglas-html-css.frontend.spec.ts); antes vivía dentro de HtmlCssExerciseBuilder.vue
 * (645 líneas, PAT-04).
 */
import { asNumber, asRecord, asRecordList, asText, type ConfigRecord } from './exerciseConfig'

export type RuleKind = 'element_exists' | 'element_count' | 'text' | 'attribute' | 'css_property' | 'a11y'
export type A11yCheck = 'img_alt' | 'form_labels' | 'html_lang' | 'document_title' | 'single_h1'

export interface RuleItem {
  _key: string
  id: string
  label: string
  hint: string
  isPublic: boolean
  weight: number
  kind: RuleKind
  selector: string
  min: number | undefined
  equals: number | undefined
  max: number | undefined
  mode: 'contains' | 'equals'
  value: string
  caseSensitive: boolean
  name: string
  attrMode: 'exists' | 'equals' | 'contains'
  attrValue: string
  property: string
  oneOfRaw: string
  a11yCheck: A11yCheck
}

export interface EjercicioHtmlCss {
  starterHtml: string
  starterCss: string
  modelHtml: string
  modelCss: string
  rules: RuleItem[]
}

export const MAX_REGLAS = 30
const TIPOS: RuleKind[] = ['element_exists', 'element_count', 'text', 'attribute', 'css_property', 'a11y']
const A11Y: A11yCheck[] = ['img_alt', 'form_labels', 'html_lang', 'document_title', 'single_h1']

let contadorClaves = 0
const nuevaClave = () => `r${++contadorClaves}`

export function defaultRule(): RuleItem {
  return {
    _key: nuevaClave(),
    id: '',
    label: '',
    hint: '',
    isPublic: true,
    weight: 10,
    kind: 'element_exists',
    selector: '',
    min: undefined,
    equals: undefined,
    max: undefined,
    mode: 'contains',
    value: '',
    caseSensitive: false,
    name: '',
    attrMode: 'exists',
    attrValue: '',
    property: '',
    oneOfRaw: '',
    a11yCheck: 'img_alt',
  }
}

/** Al cambiar el tipo de comprobación se vacían los campos del tipo anterior (la identidad de la regla se conserva). */
export function limpiarSegunTipo(rule: RuleItem): void {
  rule.selector = ''
  rule.min = undefined
  rule.equals = undefined
  rule.max = undefined
  rule.mode = 'contains'
  rule.value = ''
  rule.caseSensitive = false
  rule.name = ''
  rule.attrMode = 'exists'
  rule.attrValue = ''
  rule.property = ''
  rule.oneOfRaw = ''
  rule.a11yCheck = 'img_alt'
}

const valoresAceptados = (raw: string) => raw.split(',').map((s) => s.trim()).filter(Boolean)

/** La `check` que guarda y califica el backend. */
export function buildCheck(rule: RuleItem): Record<string, unknown> {
  switch (rule.kind) {
    case 'element_exists': {
      const obj: Record<string, unknown> = { kind: 'element_exists', selector: rule.selector }
      const m = Number(rule.min)
      if (rule.min !== undefined && !isNaN(m)) obj.min = m
      return obj
    }
    case 'element_count': {
      const obj: Record<string, unknown> = { kind: 'element_count', selector: rule.selector }
      const eq = Number(rule.equals)
      const mn = Number(rule.min)
      const mx = Number(rule.max)
      if (rule.equals !== undefined && !isNaN(eq)) obj.equals = eq
      if (rule.min !== undefined && !isNaN(mn)) obj.min = mn
      if (rule.max !== undefined && !isNaN(mx)) obj.max = mx
      return obj
    }
    case 'text': {
      const obj: Record<string, unknown> = { kind: 'text', selector: rule.selector, mode: rule.mode, value: rule.value }
      if (rule.caseSensitive) obj.caseSensitive = true
      return obj
    }
    case 'attribute': {
      const obj: Record<string, unknown> = { kind: 'attribute', selector: rule.selector, name: rule.name, mode: rule.attrMode }
      if (rule.attrMode !== 'exists' && rule.attrValue.trim()) obj.value = rule.attrValue.trim()
      return obj
    }
    case 'css_property':
      return { kind: 'css_property', selector: rule.selector, property: rule.property, oneOf: valoresAceptados(rule.oneOfRaw) }
    case 'a11y':
      return { kind: 'a11y', check: rule.a11yCheck }
    default:
      return { kind: rule.kind }
  }
}

/** Inversa de buildCheck: rellena una regla del editor a partir de la regla guardada. */
export function ruleFromSaved(saved: ConfigRecord): RuleItem {
  const rule = defaultRule()
  rule.id = asText(saved.id)
  rule.label = asText(saved.label)
  rule.hint = asText(saved.hint)
  rule.isPublic = saved.isPublic !== false
  rule.weight = asNumber(saved.weight) ?? 10
  const check = asRecord(saved.check)
  const kind = asText(check.kind)
  if (!TIPOS.includes(kind as RuleKind)) return rule
  rule.kind = kind as RuleKind
  rule.selector = asText(check.selector)
  rule.min = asNumber(check.min)
  rule.equals = asNumber(check.equals)
  rule.max = asNumber(check.max)
  if (kind === 'text') {
    rule.mode = check.mode === 'equals' ? 'equals' : 'contains'
    rule.value = asText(check.value)
    rule.caseSensitive = check.caseSensitive === true
  }
  if (kind === 'attribute') {
    rule.name = asText(check.name)
    rule.attrMode = check.mode === 'equals' || check.mode === 'contains' ? check.mode : 'exists'
    rule.attrValue = asText(check.value)
  }
  if (kind === 'css_property') {
    rule.property = asText(check.property)
    rule.oneOfRaw = Array.isArray(check.oneOf) ? check.oneOf.map((v) => asText(v)).join(', ') : ''
  }
  if (kind === 'a11y') {
    const comprobacion = asText(check.check)
    if (A11Y.includes(comprobacion as A11yCheck)) rule.a11yCheck = comprobacion as A11yCheck
  }
  return rule
}

/** Inversa de validarEjercicio: el ejercicio del editor a partir del config guardado (`rules` puede venir vacía). */
export function ejercicioDesdeConfig(config: unknown): EjercicioHtmlCss {
  const c = asRecord(config)
  const modelo = asRecord(c.modelSolution)
  const cargadas = asRecordList(c.rules).map(ruleFromSaved)
  return {
    starterHtml: asText(c.starterHtml),
    starterCss: asText(c.starterCss),
    modelHtml: asText(modelo.html),
    modelCss: asText(modelo.css),
    rules: cargadas,
  }
}

/** Valida el ejercicio y, si está bien, arma el config que se guarda. Los mensajes dicen qué regla falla. */
export function validarEjercicio(e: EjercicioHtmlCss): { valid: boolean; error?: string; config?: unknown } {
  if (!e.modelHtml.trim()) return { valid: false, error: 'La solución modelo (HTML) es obligatoria.' }
  if (e.rules.length === 0) return { valid: false, error: 'Debes agregar al menos una regla.' }
  if (e.rules.length > MAX_REGLAS) return { valid: false, error: 'Solo se permiten hasta 30 reglas.' }
  if (!e.rules.some((r) => r.isPublic)) return { valid: false, error: 'Al menos una regla debe ser publica (visible al estudiante).' }

  const ids = new Set<string>()
  for (let i = 0; i < e.rules.length; i++) {
    const rule = e.rules[i]!
    const num = i + 1

    if (!rule.id.trim()) return { valid: false, error: `Regla ${num}: el ID no puede estar vacio.` }
    if (!/^[a-z0-9_-]{1,40}$/.test(rule.id.trim())) {
      return { valid: false, error: `Regla ${num}: el ID solo puede tener letras minusculas, digitos, guion o guion_bajo (max 40).` }
    }
    if (ids.has(rule.id.trim())) return { valid: false, error: `Regla ${num}: ID duplicado «${rule.id}».` }
    ids.add(rule.id.trim())

    if (!rule.label.trim()) return { valid: false, error: `Regla ${num}: la etiqueta no puede estar vacia.` }

    const w = Number(rule.weight)
    if (!Number.isInteger(w) || w < 1 || w > 100) {
      return { valid: false, error: `Regla ${num}: el peso debe ser un entero entre 1 y 100.` }
    }

    if (rule.kind !== 'a11y' && !rule.selector.trim()) {
      return { valid: false, error: `Regla ${num}: el selector CSS no puede estar vacio.` }
    }
    if (rule.kind === 'text' && !rule.value.trim()) {
      return { valid: false, error: `Regla ${num}: el valor del texto no puede estar vacio.` }
    }
    if (rule.kind === 'attribute') {
      if (!rule.name.trim()) return { valid: false, error: `Regla ${num}: el nombre del atributo no puede estar vacio.` }
      if (rule.attrMode !== 'exists' && !rule.attrValue.trim()) {
        return { valid: false, error: `Regla ${num}: debes especificar el valor del atributo para el modo «${rule.attrMode}».` }
      }
    }
    if (rule.kind === 'css_property') {
      if (!rule.property.trim()) return { valid: false, error: `Regla ${num}: el nombre de la propiedad CSS no puede estar vacio.` }
      if (!valoresAceptados(rule.oneOfRaw).length) {
        return { valid: false, error: `Regla ${num}: especifica al menos un valor aceptado.` }
      }
    }
  }

  const builtRules = e.rules.map((rule) => {
    const r: Record<string, unknown> = {
      id: rule.id.trim(),
      label: rule.label.trim(),
      isPublic: rule.isPublic,
      weight: Number(rule.weight),
      check: buildCheck(rule),
    }
    if (rule.hint.trim()) r.hint = rule.hint.trim()
    return r
  })

  return {
    valid: true,
    config: {
      starterHtml: e.starterHtml,
      starterCss: e.starterCss,
      rules: builtRules,
      modelSolution: { html: e.modelHtml, css: e.modelCss },
    },
  }
}
