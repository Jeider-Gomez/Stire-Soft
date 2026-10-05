<template>
  <div class="space-y-3 text-xs">
    <!-- Estado de error al leer el archivo JSON -->
    <div
      v-if="parseError"
      role="alert"
      class="p-6 bg-base-blanco rounded-xl border border-semantico-falla/30 text-center space-y-3"
    >
      <AlertCircle :size="32" class="text-semantico-falla mx-auto" aria-hidden="true" />
      <p class="font-bold text-base-texto-primario text-sm">{{ parseError }}</p>
      <p class="text-base-texto-secundario">El archivo del diagrama no se puede mostrar.</p>
      <button
        v-if="!soloLectura"
        type="button"
        @click="restablecerDiagrama"
        class="min-h-[44px] px-4 py-2 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
      >
        <RefreshCw :size="15" aria-hidden="true" />
        <span>Empezar de nuevo</span>
      </button>
    </div>

    <template v-else>
      <ProyectosDiagramaPaletaFiguras v-if="!soloLectura" :cantidad="diagrama.figuras.length" :limite="limiteFiguras" :hay-inicio="hayInicio" @agregar="agregarFigura" />

      <!-- Aviso de modo unión interactivo (para celular y teclado) -->
      <div
        v-if="modoUnion"
        role="status"
        class="p-2.5 bg-acento-ambar/15 border border-acento-ambar-fuerte/40 rounded-lg flex items-center justify-between gap-3 text-xs"
      >
        <div class="flex items-center gap-2">
          <Link2 :size="16" class="text-acento-ambar-fuerte shrink-0" aria-hidden="true" />
          <span>
            Toca o pulsa Enter en la figura de destino
            <strong v-if="modoUnion.salida === 'si'">(rama «Sí»)</strong>
            <strong v-else-if="modoUnion.salida === 'no'">(rama «No»)</strong>
          </span>
        </div>
        <button
          type="button"
          @click="cancelarModoUnion"
          class="min-h-[44px] sm:min-h-[32px] px-2.5 py-1 rounded bg-base-blanco border border-base-borde-fuerte hover:bg-base-bg-secundario font-semibold text-xs"
        >
          Cancelar
        </button>
      </div>

      <!-- Contenedor principal: Lienzo SVG y panel de edición -->
      <div class="flex flex-col lg:flex-row gap-3 items-start">
        <!-- Lienzo SVG con scroll propio -->
        <div
          ref="lienzoContenedorRef"
          class="relative w-full flex-1 bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-auto min-h-[22rem] max-h-[36rem]"
          tabindex="-1"
          @pointermove="onSvgPointerMove"
          @pointerup="onSvgPointerUp"
          @click.self="deseleccionarTodo"
        >
          <svg
            ref="svgRef"
            :width="dimensionesLienzo.ancho"
            :height="dimensionesLienzo.alto"
            class="block select-none font-sans"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <!-- Cuadrícula suave de 20px -->
              <pattern id="patron-rejilla" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" class="stroke-base-borde-sutil" stroke-width="0.8" opacity="0.6" />
              </pattern>

              <!-- Punta de flecha normal -->
              <marker
                id="punta-flecha"
                viewBox="0 0 10 8"
                refX="9"
                refY="4"
                markerWidth="8"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 4 L 0 8 z" class="fill-base-texto-secundario" />
              </marker>

              <!-- Punta de flecha seleccionada -->
              <marker
                id="punta-flecha-seleccionada"
                viewBox="0 0 10 8"
                refX="9"
                refY="4"
                markerWidth="8"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 4 L 0 8 z" class="fill-acento-ambar-fuerte" />
              </marker>
            </defs>

            <!-- Fondo con cuadrícula -->
            <rect
              x="0"
              y="0"
              :width="dimensionesLienzo.ancho"
              :height="dimensionesLienzo.alto"
              fill="url(#patron-rejilla)"
              @click="deseleccionarTodo"
            />

            <!-- Flechas entre figuras -->
            <g class="flechas-conexiones">
              <g
                v-for="fl in listaFlechas"
                :key="`${fl.origenId}-${fl.salida}-${fl.destinoId}`"
                class="cursor-pointer"
                @click.stop="seleccionarFlecha(fl.origenId, fl.salida)"
              >
                <!-- Línea invisible más ancha para facilitar clic/toque -->
                <path
                  :d="fl.ruta"
                  fill="none"
                  stroke="transparent"
                  stroke-width="18"
                />

                <!-- Línea visible de la flecha -->
                <path
                  :d="fl.ruta"
                  fill="none"
                  :class="esFlechaSeleccionada(fl) ? 'stroke-acento-ambar-fuerte' : 'stroke-base-texto-secundario'"
                  :stroke-width="esFlechaSeleccionada(fl) ? 3 : 2"
                  :marker-end="esFlechaSeleccionada(fl) ? 'url(#punta-flecha-seleccionada)' : 'url(#punta-flecha)'"
                />

                <!-- Etiqueta Sí / No sobre la línea para decisiones -->
                <g v-if="fl.etiqueta" :transform="`translate(${fl.etiquetaX}, ${fl.etiquetaY})`">
                  <rect
                    x="-12"
                    y="-10"
                    width="24"
                    height="18"
                    rx="4"
                    :class="['fill-base-blanco', esFlechaSeleccionada(fl) ? 'stroke-acento-ambar-fuerte' : 'stroke-base-borde-fuerte']"
                    stroke-width="1.2"
                  />
                  <text
                    x="0"
                    y="3"
                    text-anchor="middle"
                    class="text-[10px] font-bold"
                    :class="fl.etiqueta === 'Sí' ? 'fill-semantico-pasa' : 'fill-semantico-falla'"
                  >
                    {{ fl.etiqueta }}
                  </text>
                </g>
              </g>
            </g>

            <!-- Flecha temporal mientras se arrastra una conexión -->
            <g v-if="arrastrandoConexion">
              <line
                :x1="arrastrandoConexion.origenX"
                :y1="arrastrandoConexion.origenY"
                :x2="arrastrandoConexion.actualX"
                :y2="arrastrandoConexion.actualY"
                class="stroke-acento-ambar-fuerte"
                stroke-width="2.5"
                stroke-dasharray="4 4"
                marker-end="url(#punta-flecha-seleccionada)"
              />
            </g>

            <!-- Figuras -->
            <g
              v-for="fig in diagrama.figuras"
              :key="fig.id"
              :data-figura-id="fig.id"
              :transform="`translate(${fig.x}, ${fig.y})`"
              :tabindex="soloLectura ? -1 : 0"
              role="button"
              :style="soloLectura ? undefined : 'touch-action: none'"
              :aria-label="ariaLabelFigura(fig)"
              :class="[
                'outline-none focus:ring-2 focus:ring-acento-ambar-fuerte',
                soloLectura ? 'cursor-default' : 'cursor-move'
              ]"
              @pointerdown="onFiguraPointerDown(fig, $event)"
              @pointermove="onFiguraPointerMove(fig, $event)"
              @pointerup="onFiguraPointerUp(fig, $event)"
              @click.stop="onFiguraClick(fig)"
              @keydown.enter.prevent="iniciarEdicionTeclado(fig)"
              @keydown.delete.prevent="borrarFigura(fig)"
              @keydown.up.prevent="moverFiguraTeclado(fig, 0, -10)"
              @keydown.down.prevent="moverFiguraTeclado(fig, 0, 10)"
              @keydown.left.prevent="moverFiguraTeclado(fig, -10, 0)"
              @keydown.right.prevent="moverFiguraTeclado(fig, 10, 0)"
            >
              <!-- Geometría de la figura según su forma -->
              <!-- 1. Óvalo (Inicio / Fin) -->
              <rect
                v-if="TIPO_FIGURA[fig.tipo].forma === 'ovalo'"
                x="0"
                y="0"
                :width="geometriaFigura(fig).w"
                :height="geometriaFigura(fig).h"
                :rx="geometriaFigura(fig).h / 2"
                :ry="geometriaFigura(fig).h / 2"
                :stroke-width="anchoBordeFigura(fig)"
                :class="claseFigura(fig)"
              />

              <!-- 2. Paralelogramo (Entrada / Salida) -->
              <polygon
                v-else-if="TIPO_FIGURA[fig.tipo].forma === 'paralelogramo'"
                :points="puntosForma(fig)"
                :stroke-width="anchoBordeFigura(fig)"
                :class="claseFigura(fig)"
              />

              <!-- 3. Rectángulo (Proceso) -->
              <rect
                v-else-if="TIPO_FIGURA[fig.tipo].forma === 'rectangulo'"
                x="0"
                y="0"
                :width="geometriaFigura(fig).w"
                :height="geometriaFigura(fig).h"
                rx="6"
                ry="6"
                :stroke-width="anchoBordeFigura(fig)"
                :class="claseFigura(fig)"
              />

              <!-- 4. Rombo (Decisión) -->
              <polygon
                v-else-if="TIPO_FIGURA[fig.tipo].forma === 'rombo'"
                :points="puntosForma(fig)"
                :stroke-width="anchoBordeFigura(fig)"
                :class="claseFigura(fig)"
              />

              <!-- Texto dentro de la figura, partido en líneas -->
              <text
                :x="geometriaFigura(fig).w / 2"
                :y="posicionInicialTexto(fig)"
                text-anchor="middle"
                class="text-xs font-semibold fill-base-texto-primario pointer-events-none"
              >
                <tspan
                  v-for="(linea, idx) in lineasTexto(fig)"
                  :key="idx"
                  :x="geometriaFigura(fig).w / 2"
                  :dy="idx === 0 ? 0 : 16"
                >
                  {{ linea }}
                </tspan>
              </text>

              <!-- Icono de error si la figura no valida con traducirDiagrama -->
              <g
                v-if="tieneError(fig)"
                :transform="`translate(${geometriaFigura(fig).w - 14}, -8)`"
                class="pointer-events-none"
              >
                <circle r="9" class="fill-semantico-falla" />
                <!-- Icono de exclamación -->
                <path d="M 0 -4 L 0 1 M 0 3.5 L 0 5" class="stroke-base-blanco" stroke-width="2" stroke-linecap="round" />
              </g>

              <!-- Puntos de salida (puertos de conexión) si no es solo lectura -->
              <template v-if="!soloLectura">
                <!-- Puerto normal (todas menos decisión y fin) -->
                <g
                  v-if="fig.tipo !== 'decision' && fig.tipo !== 'fin'"
                  :transform="`translate(${geometriaFigura(fig).w / 2}, ${geometriaFigura(fig).h})`"
                  class="cursor-crosshair group"
                  style="touch-action: none"
                  @pointerdown.stop="onPuertoPointerDown(fig, 'siguiente', $event)"
                >
                  <circle r="12" fill="transparent" />
                  <circle
                    r="5"
                    stroke-width="2"
                    class="fill-base-blanco stroke-acento-ambar-fuerte group-hover:scale-125 transition-transform"
                  />
                </g>

                <!-- Puertos de decisión: Sí (abajo) y No (derecha) -->
                <template v-else-if="fig.tipo === 'decision'">
                  <!-- Puerto Sí (abajo) -->
                  <g
                    :transform="`translate(${geometriaFigura(fig).w / 2}, ${geometriaFigura(fig).h})`"
                    class="cursor-crosshair group"
                    style="touch-action: none"
                    @pointerdown.stop="onPuertoPointerDown(fig, 'si', $event)"
                  >
                    <circle r="12" fill="transparent" />
                    <circle
                      r="5"
                      stroke-width="2"
                      class="fill-base-blanco stroke-semantico-pasa group-hover:scale-125 transition-transform"
                    />
                    <text x="0" y="16" text-anchor="middle" class="text-[9px] font-bold fill-semantico-pasa">Sí</text>
                  </g>

                  <!-- Puerto No (derecha) -->
                  <g
                    :transform="`translate(${geometriaFigura(fig).w}, ${geometriaFigura(fig).h / 2})`"
                    class="cursor-crosshair group"
                    style="touch-action: none"
                    @pointerdown.stop="onPuertoPointerDown(fig, 'no', $event)"
                  >
                    <circle r="12" fill="transparent" />
                    <circle
                      r="5"
                      stroke-width="2"
                      class="fill-base-blanco stroke-semantico-falla group-hover:scale-125 transition-transform"
                    />
                    <text x="14" y="3" text-anchor="start" class="text-[9px] font-bold fill-semantico-falla">No</text>
                  </g>
                </template>
              </template>
            </g>
          </svg>
        </div>

        <!-- Panel de la figura o la flecha elegida (components/proyectos/diagrama/PanelEdicionDiagrama.vue) -->
        <ProyectosDiagramaPanelEdicionDiagrama
          v-if="!soloLectura && (figuraSeleccionada || flechaSeleccionadaData)"
          ref="panelRef"
          :figura="flechaSeleccionadaData ? null : figuraSeleccionada"
          :flecha="flechaSeleccionadaData"
          @cerrar="deseleccionarTodo"
          @texto="cambiarTexto"
          @unir="activarModoUnion"
          @quitar-salida="quitarSalida"
          @quitar-flecha="quitarFlechaSeleccionada"
          @borrar="figuraSeleccionada && borrarFigura(figuraSeleccionada)"
        />
      </div>

      <!-- Aviso en vivo de validación (traducirDiagrama) bajo el lienzo -->
      <div
        v-if="errorTraduccion && !soloLectura"
        role="alert"
        class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-xl text-xs flex items-center gap-2.5 shadow-sm"
      >
        <AlertTriangle :size="16" class="shrink-0 text-semantico-falla" aria-hidden="true" />
        <span class="font-medium leading-relaxed">{{ errorTraduccion.mensaje }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
// Editor de diagramas de flujo: el lienzo y lo que se hace en él (arrastrar, unir, teclado). La geometría está en
// utils/geometriaDiagrama.ts; la paleta y el panel de edición, en components/proyectos/diagrama/ (antes 1322 líneas).
import { AlertCircle, AlertTriangle, Link2, RefreshCw } from 'lucide-vue-next'
import {
  type Diagrama,
  type ErrorDiagrama,
  type Figura,
  LIMITES_DIAGRAMA,
  TIPO_FIGURA,
  type TipoFigura,
  diagramaInicial,
  leerDiagrama,
  traducirDiagrama
} from '~/utils/diagramaFlujo'
import {
  TEXTO_INICIAL, type Flecha, type Salida,
  dimensionesLienzo as medirLienzo, geometriaFigura, lineasTexto, listaDeFlechas, lugarLibre, nombreFigura, nuevoId,
  posicionInicialTexto, puntoDeSalida, puntosForma, quitarReferencias,
} from '~/utils/geometriaDiagrama'

const props = withDefaults(
  defineProps<{
    modelValue: string
    soloLectura?: boolean
  }>(),
  {
    soloLectura: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const limiteFiguras = LIMITES_DIAGRAMA.figuras

const diagrama = ref<Diagrama>(diagramaInicial())
const parseError = ref<string | null>(null)
const ultimoJsonEmitido = ref('')
const errorTraduccion = ref<ErrorDiagrama | null>(null)

const figuraSeleccionadaId = ref<string | null>(null)
const flechaSeleccionada = ref<{ origenId: string; salida: Salida } | null>(null)
const modoUnion = ref<{ origenId: string; salida: Salida } | null>(null)

const lienzoContenedorRef = ref<HTMLDivElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const panelRef = ref<{ enfocarTexto: () => void } | null>(null)

// Estado del arrastre de figuras
interface EstadoArrastre {
  id: string
  pointerId: number
  startClientX: number
  startClientY: number
  initX: number
  initY: number
  haMovido: boolean
}
const arrastreActual = ref<EstadoArrastre | null>(null)

// Estado del arrastre de conexiones interactivas
interface EstadoArrastreConexion {
  origenId: string
  salida: Salida
  origenX: number
  origenY: number
  actualX: number
  actualY: number
}
const arrastrandoConexion = ref<EstadoArrastreConexion | null>(null)

const hayInicio = computed(() => diagrama.value.figuras.some((f) => f.tipo === 'inicio'))

const figuraSeleccionada = computed(() => {
  if (!figuraSeleccionadaId.value) return null
  return diagrama.value.figuras.find((f) => f.id === figuraSeleccionadaId.value) ?? null
})

// Las figuras se nombran por lo que dicen («Proceso: x <- 1»), no por su identificador interno («Proceso (f3)»).
const flechaSeleccionadaData = computed(() => {
  if (!flechaSeleccionada.value) return null
  const origen = diagrama.value.figuras.find((f) => f.id === flechaSeleccionada.value!.origenId)
  if (!origen) return null
  const destinoId = origen[flechaSeleccionada.value.salida]
  if (!destinoId) return null
  const destino = diagrama.value.figuras.find((f) => f.id === destinoId)
  return {
    origen: nombreFigura(origen),
    destino: destino ? nombreFigura(destino) : destinoId,
    rama: flechaSeleccionada.value.salida === 'si' ? 'Sí' as const : flechaSeleccionada.value.salida === 'no' ? 'No' as const : null
  }
})

// El lienzo crece con el diagrama para desplazarse con su propia barra.
const dimensionesLienzo = computed(() => medirLienzo(diagrama.value.figuras))

// Declarado antes del watch inmediato de abajo: ese watch valida al cargar y usa este reloj durante el setup.
let timerValidacion: ReturnType<typeof setTimeout> | null = null

// Cargar modelValue inicial o cuando cambie externamente
watch(
  () => props.modelValue,
  (nuevo) => {
    cargarModelo(nuevo)
  },
  { immediate: true }
)

function cargarModelo(jsonStr: string) {
  if (jsonStr === ultimoJsonEmitido.value) return
  const res = leerDiagrama(jsonStr)
  if (res.ok) {
    parseError.value = null
    diagrama.value = res.diagrama
    ultimoJsonEmitido.value = jsonStr
    ejecutarValidacionEnVivo()
  } else {
    parseError.value = res.mensaje
  }
}

function emitirCambios() {
  const json = JSON.stringify(diagrama.value, null, 2)
  ultimoJsonEmitido.value = json
  emit('update:modelValue', json)
  ejecutarValidacionEnVivo()
}

function restablecerDiagrama() {
  const inicial = diagramaInicial()
  diagrama.value = inicial
  parseError.value = null
  figuraSeleccionadaId.value = null
  flechaSeleccionada.value = null
  modoUnion.value = null
  emitirCambios()
}

// ─── Validación en vivo con debounce de 400 ms ──────────────────────────────
function ejecutarValidacionEnVivo() {
  if (props.soloLectura) {
    errorTraduccion.value = null
    return
  }
  if (timerValidacion) clearTimeout(timerValidacion)
  timerValidacion = setTimeout(() => {
    const res = traducirDiagrama(diagrama.value)
    if (!res.ok) {
      errorTraduccion.value = res.error
    } else {
      errorTraduccion.value = null
    }
  }, 400)
}

// Esc cancela «Unir con…» (o quita la selección); Supr quita la flecha elegida. Las flechas no reciben foco, por eso se
// escucha en la ventana, sin tocar lo que se escribe en un campo de texto.
function onTeclaGlobal(e: KeyboardEvent) {
  if (props.soloLectura) return
  const t = e.target as HTMLElement | null
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
  if (e.key === 'Escape' && (modoUnion.value || flechaSeleccionada.value)) {
    deseleccionarTodo()
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && flechaSeleccionada.value) {
    e.preventDefault()
    quitarFlechaSeleccionada()
  }
}
onMounted(() => {
  window.addEventListener('keydown', onTeclaGlobal)
  // En un celular el lienzo es más angosto que el diagrama: se abre desplazado hasta la primera figura, no cortado.
  nextTick(() => {
    const c = lienzoContenedorRef.value
    if (!c || !diagrama.value.figuras.length || c.scrollWidth <= c.clientWidth) return
    c.scrollLeft = Math.max(0, Math.min(...diagrama.value.figuras.map((f) => f.x)) - 16)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onTeclaGlobal)
  if (timerValidacion) clearTimeout(timerValidacion)
})

// ─── Colores y estilos de figuras ───────────────────────────────────────────
function tieneError(fig: Figura): boolean {
  return errorTraduccion.value?.figuraId === fig.id
}

function esFiguraSeleccionada(fig: Figura): boolean {
  return figuraSeleccionadaId.value === fig.id
}

// Colores del tema (claro, oscuro, alto contraste), no hex fijos: con fondo #ffffff y texto del tema, en modo oscuro
// el texto quedaba blanco sobre blanco.
function claseFigura(fig: Figura): string[] {
  const fondo = esFiguraSeleccionada(fig) ? 'fill-acento-ambar/10' : 'fill-base-blanco'
  const borde = tieneError(fig) ? 'stroke-semantico-falla' : esFiguraSeleccionada(fig) ? 'stroke-acento-ambar-fuerte' : 'stroke-base-texto-secundario'
  return [fondo, borde, 'transition-colors']
}

function anchoBordeFigura(fig: Figura): number {
  if (tieneError(fig)) return 2.5
  if (esFiguraSeleccionada(fig)) return 2.2
  return 1.5
}

function ariaLabelFigura(fig: Figura): string {
  const errorInfo = tieneError(fig) ? `, con error: ${errorTraduccion.value?.mensaje}` : ''
  return `${TIPO_FIGURA[fig.tipo].nombre}: ${fig.texto || 'sin texto'}${errorInfo}`
}

// ─── Flechas de conexión ───────────────────────────────────────────────────
const listaFlechas = computed<Flecha[]>(() => listaDeFlechas(diagrama.value.figuras))

function esFlechaSeleccionada(fl: Flecha): boolean {
  if (!flechaSeleccionada.value) return false
  return flechaSeleccionada.value.origenId === fl.origenId && flechaSeleccionada.value.salida === fl.salida
}

function seleccionarFlecha(origenId: string, salida: Salida) {
  if (props.soloLectura) return
  figuraSeleccionadaId.value = null
  flechaSeleccionada.value = { origenId, salida }
}

function quitarFlechaSeleccionada() {
  if (!flechaSeleccionada.value) return
  const origen = diagrama.value.figuras.find((f) => f.id === flechaSeleccionada.value!.origenId)
  if (origen) {
    origen[flechaSeleccionada.value.salida] = null
    flechaSeleccionada.value = null
    emitirCambios()
  }
}

function cambiarTexto(texto: string) {
  if (!figuraSeleccionada.value) return
  figuraSeleccionada.value.texto = texto
  emitirCambios()
}

function quitarSalida(salida: Salida) {
  if (!figuraSeleccionada.value) return
  figuraSeleccionada.value[salida] = null
  emitirCambios()
}

// ─── Arrastre de figuras con Pointer Events y setPointerCapture ─────────────
function onFiguraPointerDown(fig: Figura, e: PointerEvent) {
  if (props.soloLectura) return
  if (modoUnion.value) {
    completarModoUnion(fig)
    return
  }

  seleccionarFigura(fig)

  const el = e.currentTarget as Element | null
  if (el && typeof el.setPointerCapture === 'function') {
    try {
      el.setPointerCapture(e.pointerId)
    } catch {}
  }

  arrastreActual.value = {
    id: fig.id,
    pointerId: e.pointerId,
    startClientX: e.clientX,
    startClientY: e.clientY,
    initX: fig.x,
    initY: fig.y,
    haMovido: false
  }
}

function onFiguraPointerMove(fig: Figura, e: PointerEvent) {
  if (!arrastreActual.value || arrastreActual.value.id !== fig.id) return
  const dx = e.clientX - arrastreActual.value.startClientX
  const dy = e.clientY - arrastreActual.value.startClientY

  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    arrastreActual.value.haMovido = true
  }

  fig.x = Math.max(10, Math.round((arrastreActual.value.initX + dx) / 10) * 10)
  fig.y = Math.max(10, Math.round((arrastreActual.value.initY + dy) / 10) * 10)
}

function onFiguraPointerUp(fig: Figura, e: PointerEvent) {
  if (!arrastreActual.value || arrastreActual.value.id !== fig.id) return
  const el = e.currentTarget as Element | null
  if (el && typeof el.releasePointerCapture === 'function') {
    try {
      el.releasePointerCapture(e.pointerId)
    } catch {}
  }
  if (arrastreActual.value.haMovido) {
    emitirCambios()
  }
  arrastreActual.value = null
}

function onFiguraClick(fig: Figura) {
  if (props.soloLectura) return
  if (modoUnion.value) {
    completarModoUnion(fig)
    return
  }
  seleccionarFigura(fig)
}

function seleccionarFigura(fig: Figura) {
  if (props.soloLectura) return
  flechaSeleccionada.value = null
  figuraSeleccionadaId.value = fig.id
}

function deseleccionarTodo() {
  figuraSeleccionadaId.value = null
  flechaSeleccionada.value = null
  modoUnion.value = null
}

function iniciarEdicionTeclado(fig: Figura) {
  seleccionarFigura(fig)
  nextTick(() => panelRef.value?.enfocarTexto())
}

function moverFiguraTeclado(fig: Figura, deltaX: number, deltaY: number) {
  if (props.soloLectura) return
  fig.x = Math.max(10, fig.x + deltaX)
  fig.y = Math.max(10, fig.y + deltaY)
  emitirCambios()
}

// ─── Conexiones por arrastre desde puertos ───────────────────────────────────
function onPuertoPointerDown(fig: Figura, salida: Salida, e: PointerEvent) {
  if (props.soloLectura) return
  const el = e.currentTarget as Element | null
  if (el && typeof el.setPointerCapture === 'function') {
    try {
      el.setPointerCapture(e.pointerId)
    } catch {}
  }

  const { x: origX, y: origY } = puntoDeSalida(fig, salida)

  arrastrandoConexion.value = {
    origenId: fig.id,
    salida,
    origenX: origX,
    origenY: origY,
    actualX: origX,
    actualY: origY
  }
}

function onSvgPointerMove(e: PointerEvent) {
  if (!arrastrandoConexion.value || !svgRef.value) return
  const rect = svgRef.value.getBoundingClientRect()
  arrastrandoConexion.value.actualX = e.clientX - rect.left
  arrastrandoConexion.value.actualY = e.clientY - rect.top
}

function onSvgPointerUp(e: PointerEvent) {
  if (!arrastrandoConexion.value) return
  const conn = arrastrandoConexion.value
  arrastrandoConexion.value = null

  // Detectar figura bajo el puntero
  const elem = document.elementFromPoint(e.clientX, e.clientY)
  const figElem = elem?.closest('[data-figura-id]')
  const targetId = figElem?.getAttribute('data-figura-id')

  if (targetId && targetId !== conn.origenId) {
    const origen = diagrama.value.figuras.find((f) => f.id === conn.origenId)
    if (origen) {
      origen[conn.salida] = targetId
      emitirCambios()
    }
  }
}

// ─── Modo Unión por botones (para celular y teclado) ─────────────────────────
function activarModoUnion(salida: Salida) {
  if (!figuraSeleccionada.value) return
  modoUnion.value = { origenId: figuraSeleccionada.value.id, salida }
}

function cancelarModoUnion() {
  modoUnion.value = null
}

function completarModoUnion(destino: Figura) {
  if (!modoUnion.value) return
  if (destino.id === modoUnion.value.origenId) return

  const origen = diagrama.value.figuras.find((f) => f.id === modoUnion.value!.origenId)
  if (origen) {
    origen[modoUnion.value.salida] = destino.id
    emitirCambios()
  }
  modoUnion.value = null
}

// ─── Agregar y borrar figuras ───────────────────────────────────────────────
function agregarFigura(tipo: TipoFigura) {
  if (props.soloLectura) return
  if (diagrama.value.figuras.length >= limiteFiguras) return
  const nueva: Figura = {
    id: nuevoId(tipo, diagrama.value.figuras),
    tipo,
    texto: TEXTO_INICIAL[tipo],
    ...lugarLibre(diagrama.value.figuras),
    siguiente: null,
    si: null,
    no: null
  }
  diagrama.value.figuras.push(nueva)
  seleccionarFigura(nueva)
  emitirCambios()
  // Inicio y Fin no tienen texto que escribir.
  if (tipo !== 'inicio' && tipo !== 'fin') nextTick(() => panelRef.value?.enfocarTexto())
}

function borrarFigura(fig: Figura) {
  if (props.soloLectura) return
  const idx = diagrama.value.figuras.findIndex((f) => f.id === fig.id)
  if (idx === -1) return
  diagrama.value.figuras.splice(idx, 1)
  quitarReferencias(diagrama.value.figuras, fig.id)
  if (figuraSeleccionadaId.value === fig.id) figuraSeleccionadaId.value = null
  emitirCambios()
}
</script>
