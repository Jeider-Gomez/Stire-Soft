<template>
  <div>
    <!-- Fondo oscuro solo en celular y tableta. En computador el Tutor es un panel al lado de la página: la lección
         sigue visible y se puede leer mientras se conversa (recomendación de José, 02/10). -->
    <Transition name="fade">
      <div
        v-if="tutorStore.isOpen && !pantallaAncha"
        @click="tutorStore.closeDrawer()"
        class="fixed inset-0 bg-base-texto-primario/30 backdrop-blur-[1px] z-40 transition-opacity"
        aria-hidden="true"
      ></div>
    </Transition>

    <!-- Drawer Lateral 400px (§18.3 — role dialog, aria-modal, trampa de foco) -->
    <Transition name="slide-right">
      <div
        v-if="tutorStore.isOpen"
        ref="drawerRef"
        :role="pantallaAncha ? 'complementary' : 'dialog'"
        :aria-modal="pantallaAncha ? undefined : 'true'"
        aria-label="Tutor IA"
        tabindex="-1"
        class="fixed top-0 right-0 h-full w-full max-w-drawer bg-base-blanco border-l border-base-borde-sutil shadow-2xl lg:shadow-lg z-50 flex flex-col justify-between focus:outline-none"
        :style="estiloAlTeclado"
        @keydown="handleKeydown"
      >
        <!-- Pliegue para recoger el panel (pedido de Jeider, 03/10: «un pliegue sutil para volver a recoger»). Pestaña
             pegada al borde izquierdo, a media altura, solo en computador, donde el panel convive con la página. -->
        <button
          v-if="pantallaAncha"
          id="pliegue-tutor"
          type="button"
          class="absolute top-1/2 -translate-y-1/2 -left-5 w-5 h-16 rounded-l-lg bg-base-blanco border border-r-0 border-base-borde-sutil shadow-md flex items-center justify-center text-slate-500 hover:text-stire-purple hover:w-6 hover:-left-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stire-purple/40 transition-all"
          aria-label="Recoger el Tutor"
          title="Recoger el Tutor (Esc)"
          @click="tutorStore.closeDrawer()"
        >
          <ChevronRight :size="16" aria-hidden="true" />
        </button>

        <!-- Header del Tutor IA -->
        <!-- Escribiendo en el celular (con el teclado abierto) todo se compacta: solo el nombre, la X y los mensajes. Con
             la cabecera completa y tres franjas quedaba una rendija para leer (Jeider, 12/10). -->
        <div class="flex items-center justify-between bg-gradient-to-r from-stire-blue via-[#0e48a8] to-stire-purple text-white select-none" :class="compacto ? 'px-3 py-1' : 'p-3 lg:p-4'">
          <div class="flex items-center gap-3">
            <div v-if="!compacto" class="relative" aria-hidden="true">
              <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Bot :size="24" :stroke-width="2.2" class="text-teal-300" />
              </div>
              <span v-if="tutorStore.tutorEnabled" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-stire-teal border-2 border-stire-blue rounded-full" />
            </div>
            <div>
              <h3 class="font-bold text-sm font-poppins tracking-tight">Tutor IA STIRE</h3>
              <p v-if="!compacto" class="text-[11px] text-slate-200">Te guía con preguntas y pistas; no te da la solución</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Enlace discreto "Mi clave" (§19.2 — solo cuando ya tiene clave) -->
            <button
              v-if="tutorStore.hasKey"
              @click="tutorStore.showKeyPanel = !tutorStore.showKeyPanel"
              class="inline-flex items-center gap-1 whitespace-nowrap px-2 py-1 rounded-lg text-[11px] text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              :aria-label="tutorStore.showKeyPanel ? 'Ocultar panel de clave' : 'Gestionar mi clave de Google AI Studio'"
            >
              <KeyRound :size="12" aria-hidden="true" /> Mi clave
            </button>

            <!-- Cerrar fácil (pedido de Jeider, 03/10), sin estorbar: la X sigue discreta pero con un área de 40 px
                 (antes ~28). También cierran el pliegue del borde, Escape y, en el celular, tocar el fondo. -->
            <button
              id="cerrar-tutor"
              ref="closeButtonRef"
              @click="tutorStore.closeDrawer()"
              class="w-10 h-10 flex items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
              aria-label="Cerrar Tutor"
              title="Cerrar (Esc)"
            >
              <X :size="20" aria-hidden="true" />
            </button>
          </div>
        </div>

        <!-- Indicador de Nivel de Guía real del backend (§18.4) — oculto si guidanceLevel es null. Es texto, no botones:
             con tres etiquetas con borde Jorge las tomó por botones que no hacían nada (QA-06, 02/10). -->
        <div
          v-if="tutorStore.guidanceLevel !== null && !compacto"
          class="px-4 py-1.5 bg-stire-teal/10 border-b border-stire-teal/25 flex items-center gap-2 text-[11px]"
          role="status"
          :aria-label="`Nivel de ayuda actual: ${tutorStore.guidanceLevel} de 3 — ${guidanceLevelLabel}`"
        >
          <span class="flex items-center gap-0.5" aria-hidden="true">
            <span
              v-for="n in 3"
              :key="n"
              class="w-1.5 h-1.5 rounded-full"
              :class="n <= tutorStore.guidanceLevel ? 'bg-acento-ambar-fuerte' : 'bg-base-borde-sutil'"
            />
          </span>
          <span class="text-base-texto-primario" aria-hidden="true">
            Nivel de ayuda: <strong class="font-semibold">{{ guidanceLevelLabel }}</strong>
            <span class="text-base-texto-secundario"> · sube si sigues fallando el ejercicio</span>
          </span>
        </div>
        <!-- En un refuerzo la ayuda empieza un nivel más arriba (docs/DISENO_INTERVENCION_DOCENTE.md §10.4): se le dice
             al estudiante por qué, para que no lo tome como que el Tutor «se rindió». -->
        <p
          v-if="tutorStore.guidanceLevel !== null && tutorStore.refuerzo && !compacto"
          class="px-4 py-1.5 bg-semantico-info/10 border-b border-semantico-info/20 text-[11px] text-base-texto-primario"
        >
          Ayuda ampliada: este ejercicio es parte de tu refuerzo «{{ tutorStore.refuerzo }}».
        </p>

        <!-- Indicador de Contexto Activo de Aprendizaje -->
        <div v-if="activeContextLabel && !compacto" class="px-4 py-2 bg-stire-canvas border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div class="flex items-center gap-1.5 truncate">
            <BookOpen :size="14" class="text-teal-700 shrink-0" aria-hidden="true" />
            <span class="truncate font-medium font-poppins text-stire-blue">{{ activeContextLabel }}</span>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Botón Ir al contenido de la unidad (§22 T1 — visible con clave y sin clave) -->
            <button
              v-if="tutorStore.tutorEnabled && tutorStore.contentLink"
              @click="navigateWithAutosaveCheck(`/estudiante/unidad/${tutorStore.contentLink.learningUnitId}`)"
              class="borde-afordancia px-2 py-0.5 rounded bg-base-blanco text-[10px] font-medium text-acento-ambar-fuerte hover:bg-acento-ambar/10 flex items-center gap-1 border border-acento-ambar/30"
              :aria-label="`Ir a la explicación de la lección: ${tutorStore.contentLink.title}`"
            >
              <BookOpen :size="12" aria-hidden="true" /> Ver la lección
            </button>
          </div>
        </div>

        <!-- Aviso de repasos vencidos (§22 T1 — fuera del v-else, visible con clave y sin clave). Una franja de una línea
             pegada al encabezado y que se puede descartar: como tarjeta flotante ocupaba ~80 px del chat y los mensajes
             parecían quedar debajo (pedido de Jeider, 03/10). El detalle del más atrasado va en el título. -->
        <div
          v-if="tutorStore.tutorEnabled && overdueNotice && !avisoRepasosDescartado && !compacto"
          id="aviso-repasos-tutor"
          class="px-4 py-1.5 bg-acento-ambar/10 border-b border-acento-ambar/30 text-[11px] text-base-texto-primario flex items-center gap-2 shrink-0"
          role="status"
          aria-live="polite"
          :title="overdueNotice"
        >
          <Clock :size="14" class="shrink-0 text-acento-ambar-fuerte" aria-hidden="true" />
          <p class="flex-1 min-w-0 truncate font-semibold">{{ avisoRepasosCorto }}<span class="sr-only"> {{ overdueNotice }}</span></p>
          <button
            @click="navigateWithAutosaveCheck('/estudiante/repasos')"
            class="shrink-0 font-bold text-acento-ambar-fuerte underline hover:no-underline"
          >
            Ir a repasar
          </button>
          <button
            type="button"
            class="shrink-0 p-1 rounded text-slate-700 hover:text-base-texto-primario hover:bg-acento-ambar/15"
            aria-label="Ocultar el aviso de repasos"
            @click="avisoRepasosDescartado = true"
          >
            <X :size="12" aria-hidden="true" />
          </button>
        </div>

        <!-- Panel de clave de API (§19.2) -->
        <div v-if="tutorStore.showKeyPanel" class="flex-1 overflow-y-auto">
          <TutorKeyPanel ref="keyPanelRef" />
        </div>

        <!-- Chat normal (cuando no se muestra el panel de clave) -->
        <template v-else>
          <!-- Aviso: Tutor desactivado por docente (§20.3) -->
          <div
            v-if="!tutorStore.tutorEnabled"
            class="mx-4 mt-4 p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil text-xs text-slate-600"
            role="status"
          >
            <Ban :size="14" class="inline -mt-0.5 mr-1" aria-hidden="true" />
            Tu docente desactivó el Tutor en esta parte del curso.
          </div>

          <!-- Mensajes del Chat (§18.2 — scroll automático) -->
          <TutorAvisoAcompanado />
          <div
            class="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-stire-canvas/70 to-base-blanco"
            ref="messagesContainer"
            aria-live="polite"
            aria-label="Mensajes del Tutor"
          >
            <div
              v-for="msg in tutorStore.messages"
              :key="msg.id"
              class="flex flex-col"
              :class="msg.sender === 'student' ? 'items-end' : 'items-start'"
            >
              <!-- Burbuja de mensaje (con el robot al lado cuando habla el Tutor) -->
              <div class="flex items-end gap-1.5 max-w-[88%] mensaje-entrada">
                <span v-if="msg.sender !== 'student'" class="w-6 h-6 mb-1 rounded-lg bg-stire-blue flex items-center justify-center shrink-0" aria-hidden="true">
                  <Bot :size="16" :stroke-width="2.2" class="text-teal-300" />
                </span>
                <!-- min-w-0: un bloque de código largo ya no ensancha la burbuja ni mueve el chat de lado (José, MOB-01). -->
                <div
                  class="min-w-0 break-words rounded-2xl p-3 text-xs leading-relaxed shadow-sm"
                  :class="msg.isError
                    ? 'bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-bl-none'
                    : msg.sender === 'student'
                      ? 'bg-stire-teal text-[#070e24] font-medium rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'"
                  :role="msg.isError ? 'alert' : undefined"
                >
                  <div class="prose prose-xs" v-html="formatTutorMessage(msg.text)"></div>
                </div>
              </div>

              <!-- Quién, cuándo y «Escuchar» en las respuestas del Tutor (UI-05). -->
              <TutorPieMensaje :de-estudiante="msg.sender === 'student'" :hora="msg.timestamp" :texto="msg.isError ? '' : msg.text" />

              <!-- Botón Reintentar (§18.1 — solo en errores que no sean 403) -->
              <button
                v-if="msg.isError && !msg.is403"
                @click="tutorStore.retryLastMessage()"
                :disabled="tutorStore.isThinking"
                class="borde-afordancia mt-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 transition-colors disabled:opacity-50"
              >
                <RotateCcw :size="12" class="inline -mt-0.5 mr-1" aria-hidden="true" />Reintentar
              </button>

              <!-- Sugerencia de ejercicio del banco -->
              <button
                v-if="msg.suggestedActivity"
                @click="tutorStore.goToSuggestedActivity(msg.suggestedActivity)"
                class="tarjeta-sugerencia group mt-1.5 max-w-[85%] w-full text-left pl-3 pr-2 py-2.5 rounded-xl bg-white border-2 border-stire-blue shadow-md hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stire-teal/50 transition-all flex items-center gap-3"
              >
                <!-- Se ve como botón, no como otro mensaje: borde fuerte, sombra y una acción explícita a la derecha
                     (hallazgo de José, HALLAZGOS.md, 02/10: «necesitan mayor contraste para distinguirse como botones»). -->
                <span class="flex-1 min-w-0">
                  <span class="flex items-center gap-1 text-[10px] font-bold text-stire-blue uppercase tracking-wide"><Target :size="12" aria-hidden="true" /> Practica esto</span>
                  <span class="block text-sm font-bold text-base-texto-primario mt-0.5">{{ msg.suggestedActivity.activityTitle }}</span>
                  <span class="block text-[11px] text-base-texto-secundario mt-0.5">{{ msg.suggestedActivity.learningUnitTitle }}</span>
                </span>
                <span class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stire-blue text-white text-xs font-bold group-hover:bg-stire-purple transition-colors">
                  Ir <ArrowRight :size="14" aria-hidden="true" />
                </span>
              </button>
            </div>

            <!-- Indicador de pensamiento IA (§18.6 — texto escalado) -->
            <div v-if="tutorStore.isThinking" class="flex items-center gap-2 text-xs text-slate-500 py-1" role="status">
              <span class="w-6 h-6 rounded-lg bg-stire-blue flex items-center justify-center shrink-0" aria-hidden="true">
                <Bot :size="14" class="text-teal-300 animate-pulse" />
              </span>
              <span class="flex items-center gap-1 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-stire-teal animate-bounce" aria-hidden="true" />
                <span class="w-1.5 h-1.5 rounded-full bg-stire-purple animate-bounce [animation-delay:0.2s]" aria-hidden="true" />
                <span class="w-1.5 h-1.5 rounded-full bg-stire-blue animate-bounce [animation-delay:0.4s]" aria-hidden="true" />
                <span class="text-[11px] text-slate-500 ml-1">{{ thinkingText }}</span>
              </span>
            </div>
          </div>

          <!-- Atajos y campo de pregunta. Los atajos se ven solos solo al empezar en un ejercicio; después, con el
               bombillo junto al campo (utils/atajosTutor.ts). -->
          <div class="relative p-3 border-t border-slate-200 bg-stire-canvas space-y-2">
            <div
              v-if="atajosVisibles"
              id="atajos-tutor"
              class="flex flex-wrap gap-1.5"
              :class="verAtajos && !atajosSolos ? 'absolute bottom-full left-3 right-3 mb-1 p-2 rounded-xl bg-white border border-slate-200 shadow-lg z-10' : ''"
              role="group"
              aria-label="Atajos para pedir ayuda al Tutor">
              <button
                v-for="a in atajos"
                :key="a.tipo"
                type="button"
                @click="usarAtajo(a.tipo)"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 hover:text-stire-blue hover:border-stire-teal/60 hover:bg-stire-teal/10 transition-colors shadow-sm disabled:opacity-40"
                :aria-label="a.etiqueta">
                <component :is="a.icono" :size="12" class="inline -mt-0.5" aria-hidden="true" /> {{ a.texto }}
              </button>
            </div>

            <!-- Input de Pregunta Libre (§18.6 — font-size ≥16px para evitar zoom iOS) -->
            <div class="flex items-center gap-2">
              <button
                v-if="!atajosSolos"
                id="boton-atajos"
                type="button"
                class="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-colors"
                :class="verAtajos ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-white border-slate-200 text-slate-500 hover:text-amber-600'"
                :aria-expanded="verAtajos"
                aria-controls="atajos-tutor"
                title="Atajos para pedir ayuda"
                aria-label="Atajos para pedir ayuda"
                @click="verAtajos = !verAtajos">
                <Lightbulb :size="18" aria-hidden="true" />
              </button>
              <input
                ref="inputRef"
                v-model="inputQuery"
                @keydown.enter="handleSend"
                @focus="escribiendo = true; scrollToBottom()"
                @blur="escribiendo = false"
                type="text"
                :disabled="tutorStore.isThinking || !tutorStore.tutorEnabled"
                placeholder="Haz una pregunta sobre tu lógica..."
                aria-label="Pregunta al Tutor IA"
                style="font-size: 16px;"
                class="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-stire-teal focus:ring-2 focus:ring-stire-teal/20 text-slate-800 placeholder:text-slate-500 outline-none transition-all disabled:opacity-50" />
              <TutorDictarPregunta :escrito="inputQuery" :desactivado="tutorStore.isThinking || !tutorStore.tutorEnabled" @texto="(t) => (inputQuery = t)" />
              <!-- mousedown.prevent: tocar Enviar no le quita el foco al campo; si no, el teclado se cerraba y el botón se
                   movía bajo el dedo antes de recibir el toque. -->
              <button
                @mousedown.prevent
                @click="handleSend"
                :disabled="!inputQuery.trim() || tutorStore.isThinking || !tutorStore.tutorEnabled"
                class="w-11 h-11 rounded-xl bg-stire-teal hover:bg-[#14e2c8] text-[#070e24] flex items-center justify-center shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Enviar pregunta" title="Enviar"
              >
                <Send :size="16" aria-hidden="true" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, Ban, BookOpen, Bot, ChevronRight, Clock, Compass, KeyRound, Lightbulb, RotateCcw, Search, Send, Target, X } from 'lucide-vue-next'
import { etiquetaDeContexto } from '~/utils/planLateral'
import { useTutorStore } from '~/stores/tutor'
import { useWorkspaceStore } from '~/stores/workspace'
import { atajosASimpleVista, atajosDisponibles, preguntasNuevas, type Atajo } from '~/utils/atajosTutor'
import { useStudentStore } from '~/stores/student'
import { formatTutorMessage } from '~/utils/formatTutorMessage'
import { avisoRepasosCorto as textoRepasosCorto, avisoRepasosLargo, nombreNivelAyuda, textoPensando } from '~/utils/textosTutor'

const { confirmar } = useConfirmar()
const tutorStore = useTutorStore()
const workspaceStore = useWorkspaceStore()
const studentStore = useStudentStore()

const pantallaAncha = usePantallaAncha()
const inputQuery = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const drawerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLElement | null>(null)
const closeButtonRef = ref<HTMLElement | null>(null)
const keyPanelRef = ref<HTMLElement | null>(null)

// ─── Atajos: solos al empezar un ejercicio; si no, detrás del bombillo ───────
const route = useRoute()
const verAtajos = ref(false)
const TEXTOS: Record<Atajo, { texto: string; etiqueta: string; icono: typeof Lightbulb }> = {
  conceptual: { texto: 'Pista conceptual', etiqueta: 'Pedir pista conceptual al Tutor', icono: Lightbulb },
  borde: { texto: 'Revisar caso borde', etiqueta: 'Preguntar sobre casos de borde', icono: Compass },
  parada: { texto: 'Por qué no sale lo esperado', etiqueta: 'Preguntar por qué el código no produce la salida esperada', icono: Search },
}
const atajos = computed(() =>
  atajosDisponibles(route.path, workspaceStore.currentExercise?.questionType).map((tipo) => ({ tipo, ...TEXTOS[tipo] })))
// Al cambiar de ejercicio vuelven a verse: cuentan solo las preguntas hechas desde que se entró a este.
const preguntasAlEntrar = ref(0)
watch(() => route.path, () => { preguntasAlEntrar.value = preguntasNuevas(tutorStore.messages) }, { immediate: true })
const atajosSolos = computed(() => atajosASimpleVista(route.path, tutorStore.messages, preguntasAlEntrar.value))
const atajosVisibles = computed(() => atajosSolos.value || verAtajos.value)
function usarAtajo(tipo: Atajo) {
  verAtajos.value = false
  tutorStore.requestQuickHint(tipo)
}

// ─── Contexto de aprendizaje activo ─────────────────────────────────────────
const activeContextLabel = computed(() => etiquetaDeContexto(route.path, workspaceStore.currentExercise, studentStore.modules, studentStore.activeUnit))

// ─── Aviso de repasos vencidos (§21.2 T4c) ──────────────────────────────────
// Descartado, no vuelve en esta sesión del navegador (useState entre páginas; sessionStorage si recarga).
const CLAVE_AVISO_REPASOS = 'stire-aviso-repasos-oculto'
const avisoRepasosDescartado = useState('tutor-aviso-repasos-descartado', () => false)
onMounted(() => {
  try { if (sessionStorage.getItem(CLAVE_AVISO_REPASOS) === '1') avisoRepasosDescartado.value = true } catch { /* sin almacenamiento */ }
})
watch(avisoRepasosDescartado, (oculto) => {
  try { if (oculto) sessionStorage.setItem(CLAVE_AVISO_REPASOS, '1') } catch { /* se usa sin recordar */ }
})
const avisoRepasosCorto = computed(() => textoRepasosCorto(tutorStore.dueReviews))
const overdueNotice = computed(() => avisoRepasosLargo(tutorStore.dueReviews))

// ─── Navegación segura con verificación de autoguardado (§21.2 T4c) ─────────
async function navigateWithAutosaveCheck(url: string) {
  if (workspaceStore.currentExercise?.activityId) {
    if (workspaceStore.hasUnsavedChanges) {
      const ok = await confirmar({ titulo: '¿Salir del ejercicio?', mensaje: 'Hay cambios en tu código que todavía no se guardaron. Si sales ahora, podrías perderlos.', accion: 'Salir de todas formas', cancelar: 'Quedarme', peligro: true })
      if (!ok) return
    }
  }
  tutorStore.closeDrawer()
  navigateTo(url)
}

const thinkingText = computed(() => textoPensando(tutorStore.thinkingSeconds))
const guidanceLevelLabel = computed(() => nombreNivelAyuda(tutorStore.guidanceLevel))

// ─── Scroll automático (§18.2) ───────────────────────────────────────────────
watch(() => [tutorStore.messages.length, tutorStore.isThinking], () => scrollToBottom())

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  })
}

// ─── El teclado del celular (hallazgo de José, 09/10) ────────────────────────
// El teclado achica solo lo visible, no la página: tapaba los últimos mensajes y el campo. El panel toma el alto de lo
// que se ve y el chat baja al último mensaje (composables/useAreaVisible.ts). En computador no cambia nada.
const estiloAlTeclado = useAreaVisible(pantallaAncha, () => { if (tutorStore.isOpen) scrollToBottom() })
const escribiendo = ref(false)
const compacto = computed(() => !pantallaAncha.value && escribiendo.value)

// ─── Foco al abrir / devolver foco al cerrar (§18.3 + §22 T2) ───────────────
// openerElement se guarda ANTES de nextTick: ahí document.activeElement aún es el botón que lo abrió.
let openerElement: HTMLElement | null = null

// El foco queda SIEMPRE dentro del panel. Al abrir, la clave aún no llegó: se enfoca el campo, y si llega sin clave ese
// campo se desmonta y el foco caería al <body>. Por eso se vuelve a llamar cuando cambia showKeyPanel.
function focusInsideDrawer() {
  nextTick(() => {
    const drawer = drawerRef.value
    if (!drawer) return
    if (drawer.contains(document.activeElement) && document.activeElement !== drawer) return
    const target = tutorStore.showKeyPanel
      ? (drawer.querySelector('#tutor-api-key') as HTMLElement | null)
      : inputRef.value
    ;(target ?? closeButtonRef.value ?? drawer).focus()
  })
}

watch(
  () => tutorStore.isOpen,
  (open) => {
    if (open) {
      openerElement = document.activeElement as HTMLElement | null
      focusInsideDrawer()
    } else {
      // Si se cerró porque se abrió otra cosa (las notificaciones, 09/10), el foco ya está allá y no se le quita. Si no,
      // vuelve al botón que lo abrió o, si ya no está en la página, al lanzador nuevo.
      const activo = document.activeElement
      if (activo && activo !== document.body && !drawerRef.value?.contains(activo)) return
      nextTick(() => {
        const destino = openerElement?.isConnected ? openerElement : document.getElementById('tutor-cabecera') ?? document.getElementById('tutor-barra') ?? document.getElementById('lanzador-tutor')
        destino?.focus()
      })
    }
  }
)

watch(
  () => tutorStore.showKeyPanel,
  () => {
    if (tutorStore.isOpen) focusInsideDrawer()
  }
)

// ─── Escape cierra el drawer (§18.3) ─────────────────────────────────────────
// En el documento y no en el panel: con el foco fuera del panel, un @keydown del panel nunca recibiría la tecla.
function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && tutorStore.isOpen) {
    tutorStore.closeDrawer()
  }
}

onMounted(() => document.addEventListener('keydown', handleDocumentKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', handleDocumentKeydown))

// Trampa de foco dentro del panel (Tab / Shift+Tab)
function handleKeydown(event: KeyboardEvent) {
  // En computador el panel convive con la página: Tab puede salir a la lección.
  if (event.key === 'Tab' && !pantallaAncha.value) {
    trapFocus(event)
  }
}

function trapFocus(event: KeyboardEvent) {
  if (!drawerRef.value) return
  const focusable = Array.from(
    drawerRef.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.closest('[aria-hidden="true"]'))

  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

// ─── Enviar mensaje ──────────────────────────────────────────────────────────
function handleSend() {
  if (!inputQuery.value.trim() || tutorStore.isThinking) return
  const text = inputQuery.value
  inputQuery.value = ''
  tutorStore.sendMessage(text)
}
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.25s ease-out;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
.mensaje-entrada {
  animation: mensaje-entrada 0.25s ease-out both;
}
@keyframes mensaje-entrada {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
