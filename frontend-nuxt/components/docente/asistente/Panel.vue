<template>
  <!-- Asistente STIRE para el docente (docs/PLAN_ASISTENTE_DOCENTE.md §4): un panel a la derecha que propone borradores de
       la estructura del curso, de la explicación de una lección o de ejercicios, según la pantalla donde está el docente.
       Propone; el docente decide. Al aplicar, muestra paso a paso lo que va creando (todo oculto, en borrador) y lo lleva
       a Contenido del curso para verlo. Se abre con «Asistente» en el encabezado o con Ctrl+. y se cierra con Esc. -->
  <Transition name="panel-asistente">
    <aside v-if="abierto" id="panel-asistente" role="complementary" aria-labelledby="asistente-titulo"
      class="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-base-blanco border-l border-base-borde-sutil shadow-2xl flex flex-col">
      <header class="flex items-center gap-3 px-4 h-16 border-b border-base-borde-sutil shrink-0">
        <TutorMascota :expresion="pensando ? 'pensando' : aplicando ? 'atento' : borrador ? 'contento' : 'normal'" :tamano="34" etiqueta="Asistente STIRE" />
        <div class="flex-1 min-w-0">
          <h2 id="asistente-titulo" class="text-sm font-bold text-base-texto-primario">Asistente STIRE <span class="ml-1 px-1.5 py-0.5 rounded bg-stire-blue/10 text-stire-blue text-[10px] font-semibold align-middle">IA</span></h2>
          <p class="text-[11px] text-base-texto-secundario truncate">Te propongo borradores; tú decides qué queda.</p>
        </div>
        <button type="button" class="w-9 h-9 rounded-lg grid place-items-center text-slate-500 hover:bg-base-bg-secundario" aria-label="Cerrar el Asistente" title="Cerrar (Esc)" @click="abierto = false">
          <X :size="18" aria-hidden="true" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Sin clave: el paso a paso para conseguirla (gratis) -->
        <DocenteAsistenteClave v-if="tieneClave === false" />

        <template v-else>
          <!-- La clase sobre la que trabaja -->
          <div>
            <label for="asistente-clase" class="block text-xs font-semibold text-base-texto-primario mb-1">Clase</label>
            <select id="asistente-clase" v-model="claseId" class="input-stire min-h-[40px] text-sm">
              <option :value="null" disabled>Elige una clase</option>
              <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- Qué hacer: las tres tareas; la de esta pantalla va primero -->
          <div role="radiogroup" aria-label="Qué quieres que prepare" class="grid gap-2">
            <button v-for="t in tareasOrdenadas" :key="t" type="button" role="radio" :aria-checked="tarea === t"
              class="tarea text-left rounded-xl border px-3.5 py-2.5" :class="tarea === t ? 'border-stire-blue bg-stire-blue/5' : 'border-base-borde-sutil hover:border-base-borde-fuerte'"
              @click="tarea = t">
              <span class="block text-sm font-semibold text-base-texto-primario">{{ TAREAS[t].titulo }}
                <span v-if="t === sugerida" class="ml-1 text-[10px] font-semibold text-stire-blue">para esta pantalla</span></span>
              <span class="block text-xs text-base-texto-secundario">{{ TAREAS[t].ayuda }}</span>
            </button>
          </div>

          <div v-if="TAREAS[tarea].necesitaLeccion">
            <label for="asistente-leccion" class="block text-xs font-semibold text-base-texto-primario mb-1">Lección</label>
            <select id="asistente-leccion" v-model="leccionId" class="input-stire min-h-[40px] text-sm" :disabled="!lecciones.length">
              <option :value="null" disabled>{{ lecciones.length ? 'Elige la lección' : 'Esta clase aún no tiene lecciones: empieza por la estructura' }}</option>
              <option v-for="l in lecciones" :key="l.id" :value="l.id">{{ l.modulo }} › {{ l.titulo }}</option>
            </select>
          </div>
          <div v-if="tarea !== 'leccion'">
            <label for="asistente-cantidad" class="block text-xs font-semibold text-base-texto-primario mb-1">{{ tarea === 'estructura' ? 'Módulos' : 'Ejercicios' }}</label>
            <input id="asistente-cantidad" v-model.number="cantidad" type="number" min="1" max="8" class="input-stire min-h-[40px] w-24 text-sm" />
          </div>
          <div>
            <label for="asistente-pedido" class="block text-xs font-semibold text-base-texto-primario mb-1">¿Algo en especial? <span class="font-normal text-base-texto-secundario">(opcional)</span></label>
            <textarea id="asistente-pedido" v-model="pedido" rows="2" maxlength="600" class="input-stire text-sm" placeholder="Por ejemplo: con ejemplos de la vida diaria, para quien nunca ha programado" />
          </div>
          <button type="button" class="btn-stire-primary w-full justify-center min-h-[44px]" :disabled="!puedePedir || pensando || aplicando" @click="generar">
            <Sparkles :size="15" aria-hidden="true" /> {{ pensando ? 'Preparando el borrador…' : TAREAS[tarea].boton }}
          </button>

          <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

          <!-- Pensando: un esqueleto, no un círculo que gira -->
          <div v-if="pensando" class="space-y-2" aria-hidden="true">
            <div v-for="n in 4" :key="n" class="esqueleto h-3 rounded bg-base-bg-secundario" :style="{ width: `${90 - n * 12}%` }" />
          </div>

          <!-- El borrador, para revisarlo antes de crear nada -->
          <DocenteAsistenteBorrador v-if="borrador && !pensando" :borrador="borrador" />

          <div v-if="borrador && !pensando" class="flex flex-wrap gap-2">
            <button type="button" class="btn-stire-primary min-h-[44px]" :disabled="aplicando || (TAREAS[borrador.tipo].necesitaLeccion && !leccionElegida)" @click="aplicarBorrador">
              <Check :size="15" aria-hidden="true" /> {{ aplicando ? 'Creando…' : 'Aplicar en la clase' }}
            </button>
            <button type="button" class="btn-stire-secondary min-h-[44px]" :disabled="aplicando" @click="generar">Otra versión</button>
            <button type="button" class="btn-stire-secondary min-h-[44px]" :disabled="aplicando" @click="descartar">Descartar</button>
          </div>

          <!-- Lo que va haciendo, paso a paso -->
          <ol v-if="pasos.length" class="space-y-1 text-xs" aria-live="polite" aria-label="Lo que el Asistente va creando">
            <li v-for="(p, i) in pasos" :key="i" class="flex items-center gap-2">
              <Check v-if="p.estado === 'hecho'" :size="14" class="text-semantico-pasa shrink-0" aria-hidden="true" />
              <Loader2 v-else-if="p.estado === 'haciendo'" :size="14" class="animate-spin text-stire-blue shrink-0" aria-hidden="true" />
              <X v-else-if="p.estado === 'error'" :size="14" class="text-semantico-falla shrink-0" aria-hidden="true" />
              <span v-else class="w-3.5 h-3.5 rounded-full border border-base-borde-fuerte shrink-0" aria-hidden="true" />
              <span :class="p.estado === 'pendiente' ? 'text-base-texto-secundario' : 'text-base-texto-primario'">{{ p.texto }}</span>
            </li>
          </ol>
          <p v-if="pasos.length && !aplicando && pasos.every((p) => p.estado === 'hecho')" class="text-xs text-semantico-pasa font-semibold">
            Listo. Quedó oculto en Contenido del curso: revísalo y publícalo cuando quieras.
          </p>
        </template>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Check, Loader2, Sparkles, X } from 'lucide-vue-next'
import { TAREAS, pantallaDeRuta, tareaSugerida, type TipoBorrador } from '~/utils/asistenteDocente'

const route = useRoute()
const { misClases } = useMisClases()
const { abierto, tieneClave, borrador, pasos, pensando, aplicando, error, revisarClave, pedir, aplicar, descartar, leccionesDeClase, textoDeLeccion } = useAsistente()

const contexto = computed(() => pantallaDeRuta(route.path, route.query))
const sugerida = computed(() => tareaSugerida(contexto.value.pantalla))
const tareasOrdenadas = computed(() => [sugerida.value, ...(['estructura', 'leccion', 'ejercicios'] as TipoBorrador[]).filter((t) => t !== sugerida.value)])
const tarea = ref<TipoBorrador>('estructura')
const pedido = ref('')
const cantidad = ref(3)
const clases = ref<Array<{ id: number; name: string; asignatura?: { nombre: string } | null }>>([])
const claseId = ref<number | null>(null)
const lecciones = ref<Array<{ id: number; titulo: string; modulo: string; tema: string }>>([])
const leccionId = ref<number | null>(null)
const leccionElegida = computed(() => lecciones.value.find((l) => l.id === leccionId.value) ?? null)
const puedePedir = computed(() => !!claseId.value && (!TAREAS[tarea.value].necesitaLeccion || !!leccionElegida.value))

/** Las lecciones de la clase, con su módulo y tema, para elegir dónde va la explicación o los ejercicios. */
async function cargarLecciones(id: number) {
  lecciones.value = []
  lecciones.value = await leccionesDeClase(id)
  if (contexto.value.unitId && lecciones.value.some((l) => l.id === contexto.value.unitId)) leccionId.value = contexto.value.unitId
}

watch(claseId, (id) => { leccionId.value = null; if (id) void cargarLecciones(id) })
watch(abierto, async (a) => {
  if (!a) return
  tarea.value = sugerida.value
  if (tieneClave.value === null) void revisarClave()
  if (!clases.value.length) clases.value = await misClases<typeof clases.value>().catch(() => [])
  claseId.value = contexto.value.classId ?? claseId.value ?? clases.value[0]?.id ?? null
}, { immediate: true })

async function generar() {
  if (!claseId.value) return
  const clase = clases.value.find((c) => c.id === claseId.value)
  const l = leccionElegida.value
  // Para la explicación y los ejercicios, el texto que ya tiene la lección le sirve de base.
  const textoActual = l && tarea.value !== 'estructura' ? await textoDeLeccion(l.id) : undefined
  await pedir(tarea.value, {
    asignatura: clase?.asignatura?.nombre, clase: clase?.name, modulo: l?.modulo, tema: l?.tema, leccion: l?.titulo,
    textoActual, cantidad: tarea.value === 'leccion' ? undefined : cantidad.value,
  }, pedido.value)
}

async function aplicarBorrador() {
  if (!claseId.value) return
  const ok = await aplicar(claseId.value, leccionElegida.value)
  if (ok && claseId.value) void cargarLecciones(claseId.value)
}

/** Ctrl+. abre y cierra el Asistente; Esc lo cierra. */
function teclas(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === '.') { e.preventDefault(); abierto.value = !abierto.value }
  else if (e.key === 'Escape' && abierto.value) abierto.value = false
}
onMounted(() => document.addEventListener('keydown', teclas))
onBeforeUnmount(() => document.removeEventListener('keydown', teclas))
</script>

<style scoped>
.tarea { transition: border-color 150ms ease, background-color 150ms ease; }
.esqueleto { animation: brillo 1.4s ease-in-out infinite; }
@keyframes brillo { 50% { opacity: 0.45; } }
.panel-asistente-enter-active { transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease; }
.panel-asistente-leave-active { transition: transform 180ms ease-in, opacity 150ms ease-in; }
.panel-asistente-enter-from, .panel-asistente-leave-to { transform: translateX(24px); opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .esqueleto { animation: none; }
  .panel-asistente-enter-from, .panel-asistente-leave-to { transform: none; }
}
</style>
