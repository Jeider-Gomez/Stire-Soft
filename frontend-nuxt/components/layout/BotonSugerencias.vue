<template>
  <!-- «Sugerencias» desde cualquier pantalla (docs/calidad/PRUEBA_DOS_SEMANAS.md): quien prueba deja lo que encontró
       donde lo encontró, y la app anota sola la pantalla, el dispositivo y la clase. El dueño pidió «sugerencias» en vez
       de «reportar», que suena negativo (01/10). En el código y la API siguen llamándose «reportes». -->
  <div>
    <button
      type="button"
      class="flex items-center gap-1.5 px-2 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors text-xs font-semibold min-h-[40px]"
      aria-label="Enviar una sugerencia o contar un problema"
      @click="abrir"
    >
      <MessageSquarePlus :size="18" aria-hidden="true" />
      <span class="hidden lg:inline">Sugerencias</span>
    </button>

    <Teleport to="body">
      <div v-if="abierto" class="fixed inset-0 z-50 bg-base-texto-primario/40 flex items-center justify-center p-4" @click.self="cerrar">
        <div role="dialog" aria-modal="true" aria-labelledby="reportar-titulo" class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-4 text-xs">
          <div class="flex items-center justify-between gap-3">
            <h2 id="reportar-titulo" class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
              <MessageSquarePlus :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> {{ viendoMios ? 'Mis sugerencias' : 'Sugerencias' }}
            </h2>
            <button type="button" class="p-1 text-base-texto-secundario hover:text-base-texto-primario" aria-label="Cerrar" @click="cerrar">
              <X :size="16" aria-hidden="true" />
            </button>
          </div>

          <template v-if="!viendoMios">
            <p v-if="enviado" role="status" class="rounded-md bg-semantico-pasa/10 text-semantico-pasa p-3 font-semibold">
              ¡Gracias! Quedó guardado con la pantalla donde estabas. Con esto mejoramos STIRE.
            </p>
            <form v-else class="space-y-4" @submit.prevent="enviar">
              <fieldset>
                <legend class="font-semibold text-base-texto-primario mb-1.5">¿Qué es?</legend>
                <div class="flex flex-wrap gap-2">
                  <label v-for="(texto, valor) in TIPOS" :key="valor" class="flex items-center gap-1.5 px-3 py-2 rounded-md border cursor-pointer" :class="f.tipo === valor ? 'border-acento-ambar-fuerte bg-acento-ambar/10' : 'border-base-borde-fuerte'">
                    <input v-model="f.tipo" type="radio" name="reporte-tipo" :value="valor" class="sr-only" /> {{ texto }}
                  </label>
                </div>
              </fieldset>
              <fieldset v-if="f.tipo !== 'idea'">
                <legend class="font-semibold text-base-texto-primario mb-1.5">¿Qué tanto te afectó?</legend>
                <div class="flex flex-wrap gap-2">
                  <label v-for="(texto, valor) in GRAVEDADES" :key="valor" class="flex items-center gap-1.5 px-3 py-2 rounded-md border cursor-pointer" :class="f.gravedad === Number(valor) ? 'border-acento-ambar-fuerte bg-acento-ambar/10' : 'border-base-borde-fuerte'">
                    <input v-model.number="f.gravedad" type="radio" name="reporte-gravedad" :value="Number(valor)" class="sr-only" /> {{ texto }}
                  </label>
                </div>
              </fieldset>
              <div>
                <label for="reporte-texto" class="block font-semibold text-base-texto-primario mb-1">{{ f.tipo === 'idea' ? '¿Qué se te ocurre?' : '¿Qué pasó? ¿Qué esperabas que pasara?' }}</label>
                <textarea id="reporte-texto" v-model="f.texto" rows="4" maxlength="2000" required class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte bg-base-blanco resize-y" />
              </div>
              <p class="text-[11px] text-base-texto-secundario">Se guarda la pantalla donde estás (<span class="font-mono">{{ route.fullPath }}</span>) y el tamaño de tu pantalla.</p>
              <p v-if="error" role="alert" class="text-semantico-falla">{{ error }}</p>
              <div class="flex flex-wrap items-center gap-3">
                <button type="submit" :disabled="enviando || f.texto.trim().length < 5" class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold disabled:opacity-40">
                  {{ enviando ? 'Enviando…' : 'Enviar' }}
                </button>
              </div>
            </form>
            <button type="button" class="text-acento-ambar-fuerte font-semibold hover:underline" @click="verMios">Ver lo que he enviado</button>
          </template>

          <template v-else>
            <p v-if="cargandoMios" role="status" class="text-base-texto-secundario">Cargando…</p>
            <p v-else-if="mios.length === 0" class="text-base-texto-secundario">Todavía no has enviado nada.</p>
            <ul v-else class="space-y-2">
              <li v-for="r in mios" :key="r.id" class="rounded-md border border-base-borde-sutil p-2.5 space-y-1">
                <p class="flex flex-wrap items-center gap-2">
                  <span class="font-semibold">{{ TIPOS[r.tipo] }}</span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" :class="r.estado === 'resuelto' ? 'bg-semantico-pasa/10 text-semantico-pasa' : 'bg-base-bg-secundario text-base-texto-secundario'">{{ ESTADOS[r.estado] }}</span>
                  <span class="text-base-texto-secundario">{{ fechaCorta(r.createdAt) }}{{ r.clase ? ` · ${r.clase}` : '' }}</span>
                </p>
                <p class="text-base-texto-primario whitespace-pre-line">{{ r.texto }}</p>
                <p v-if="r.nota" class="text-semantico-info">Respuesta: {{ r.nota }}</p>
              </li>
            </ul>
            <button type="button" class="text-acento-ambar-fuerte font-semibold hover:underline" @click="viendoMios = false">Enviar otra</button>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { MessageSquarePlus, X } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { fechaCorta } from '~/utils/entregas'
import { claseDeLaRuta } from '~/utils/pestanasClase'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'

type Tipo = 'problema' | 'confuso' | 'idea'
type Estado = 'nuevo' | 'visto' | 'resuelto' | 'descartado'

const TIPOS: Record<Tipo, string> = { problema: 'Un problema', confuso: 'Algo confuso', idea: 'Una idea' }
const GRAVEDADES: Record<string, string> = { 1: 'Un detalle', 2: 'Me confundió', 3: 'No me dejó seguir' }
const ESTADOS: Record<Estado, string> = { nuevo: 'Recibido', visto: 'Visto', resuelto: 'Resuelto', descartado: 'No se hará' }

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const abierto = ref(false)
const enviando = ref(false)
const enviado = ref(false)
const error = ref<string | null>(null)
const f = reactive<{ tipo: Tipo; gravedad: number; texto: string }>({ tipo: 'problema', gravedad: 2, texto: '' })
const viendoMios = ref(false)
const cargandoMios = ref(false)
const mios = ref<Array<{ id: number; tipo: Tipo; estado: Estado; texto: string; clase: string; nota: string | null; createdAt: string }>>([])

const authStore = useAuthStore()
const studentStore = useStudentStore()
/** La clase en la que está: la elegida por el estudiante o la de la pantalla del docente. */
function claseActual(): number | undefined {
  const id = authStore.currentRole === 'estudiante' ? studentStore.currentClassId : claseDeLaRuta(route.path, route.query)
  return id ?? undefined
}

function abrir() {
  abierto.value = true
  enviado.value = false
  viendoMios.value = false
  error.value = null
  f.tipo = 'problema'
  f.gravedad = 2
  f.texto = ''
}
function cerrar() {
  abierto.value = false
}

async function enviar() {
  enviando.value = true
  error.value = null
  try {
    await api.post('/reportes', {
      tipo: f.tipo,
      gravedad: f.tipo === 'idea' ? undefined : f.gravedad,
      texto: f.texto,
      ruta: route.fullPath,
      classId: claseActual(),
      dispositivo: `${window.innerWidth}×${window.innerHeight} · ${navigator.userAgent}`,
    })
    enviado.value = true
  } catch (err) {
    error.value = messageOf(err, 'No se pudo enviar. Inténtalo de nuevo.')
  } finally {
    enviando.value = false
  }
}

async function verMios() {
  viendoMios.value = true
  cargandoMios.value = true
  try {
    mios.value = await api.get('/reportes/mios')
  } catch {
    mios.value = []
  } finally {
    cargandoMios.value = false
  }
}

useEscapeToClose(() => abierto.value, cerrar)
</script>
