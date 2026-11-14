<template>
  <!-- Mi progreso v3 (Fase D, paso 4; cuadros «E-Progreso», «E-Progreso-Reflexion», «E-Progreso-Oscuro» y «E-Cel-Progreso»): cómo
       va, qué ya domina y cómo estudia, en tres pestañas. Nada se compara con los compañeros. «Competencias» (cuadro
       «E-Progreso-Competencias») espera al servidor: hoy no hay puntos por competencia (docs/v3/BITACORA.md, P-15). -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <header>
      <h1 class="m-0 font-poppins font-bold text-[26px] sm:text-[30px] text-base-texto-primario">Mi progreso</h1>
      <p class="m-0 mt-1 text-[15px] text-base-texto-secundario">Cómo vas, qué ya dominas y cómo estudias. Nada se compara con tus compañeros.</p>
      <div class="mt-3 flex gap-1 border-b border-base-borde-sutil overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Partes de mi progreso">
        <button v-for="p in PESTANAS" :id="`pestana-${p.id}`" :key="p.id" type="button" role="tab" class="pestana-progreso" :aria-selected="pestana === p.id"
          :aria-controls="`panel-${p.id}`" :tabindex="pestana === p.id ? 0 : -1" @click="elegir(p.id)" @keydown="moverConFlechas">{{ p.texto }}</button>
      </div>
    </header>

    <!-- DOMINIO -->
    <div v-if="pestana === 'dominio'" id="panel-dominio" role="tabpanel" aria-labelledby="pestana-dominio" class="space-y-[18px]">
      <section data-recorrido="avance" class="heroe-inicio grid gap-5 items-center lg:grid-cols-[auto_1fr_auto]" aria-labelledby="titulo-portada-progreso">
        <div class="anillo-progreso flex items-center gap-4 rounded-[20px] p-4 sm:p-5">
          <svg width="120" height="120" viewBox="0 0 120 120" role="img" :aria-label="`${resumen.terminadas} de ${resumen.total} lecciones terminadas`">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--c-base-bg-secundario))" stroke-width="14" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#ffc94d" stroke-width="14" :stroke-dasharray="arcos.empezadas.trazo" :stroke-dashoffset="arcos.empezadas.inicio" transform="rotate(-90 60 60)" class="arco-progreso" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="#00c2a8" stroke-width="14" :stroke-dasharray="arcos.terminadas.trazo" transform="rotate(-90 60 60)" class="arco-progreso" />
            <text x="60" y="62" text-anchor="middle" class="font-poppins font-bold" font-size="30" fill="currentColor">{{ resumen.terminadas }}</text>
            <text x="60" y="82" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75">de {{ resumen.total }}</text>
          </svg>
          <ul class="m-0 p-0 list-none space-y-1 text-[13px]">
            <li class="flex items-center gap-2"><span class="w-3 h-3 rounded bg-[#00c2a8]" /><strong class="min-w-[18px]">{{ resumen.terminadas }}</strong> Terminadas</li>
            <li class="flex items-center gap-2"><span class="w-3 h-3 rounded bg-[#ffc94d]" /><strong class="min-w-[18px]">{{ resumen.empezadas }}</strong> Empezadas</li>
            <li class="flex items-center gap-2"><span class="w-3 h-3 rounded bg-base-bg-secundario border border-base-borde-fuerte" /><strong class="min-w-[18px]">{{ resumen.sinEmpezar }}</strong> Sin empezar</li>
          </ul>
        </div>
        <div class="min-w-0">
          <h2 id="titulo-portada-progreso" class="m-0 font-poppins font-bold text-[22px] sm:text-[26px] leading-tight">{{ portada.titulo }}</h2>
          <p v-if="portada.sigue" class="m-0 mt-1.5 text-base">Sigue con «{{ portada.sigue }}».</p>
          <div class="mt-3 flex flex-wrap gap-2 text-[13px]">
            <span class="chip-progreso"><strong>{{ studentStore.hasLoaded ? `${studentStore.avanceCurso.dominadas} de ${studentStore.avanceCurso.total}` : '—' }}</strong> lecciones <Termino palabra="Dominio">dominadas</Termino></span>
            <span class="chip-progreso"><strong>{{ resumen.porcentaje }} %</strong> del curso</span>
            <span class="chip-progreso"><strong>{{ studentStore.hasLoaded ? studentStore.reviewsDueToday.length : '—' }}</strong> repasos para hoy</span>
          </div>
        </div>
        <div class="flex lg:flex-col items-center lg:items-end gap-3">
          <NuxtLink v-if="studentStore.hasLoaded && studentStore.reviewsDueToday.length" to="/estudiante/repasos" class="boton-heroe boton-principal inline-flex min-h-[44px]">
            Repasar ahora <ChevronRight :size="17" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink v-else-if="portada.sigueId" :to="`/estudiante/unidad/${portada.sigueId}`" class="boton-heroe boton-principal inline-flex">
            Seguir aprendiendo <ChevronRight :size="17" aria-hidden="true" />
          </NuxtLink>
          <span class="hidden lg:block" aria-hidden="true"><TutorMascota expresion="contento" :tamano="72" /></span>
        </div>
      </section>

      <div class="grid gap-[18px] items-start lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="space-y-[18px] min-w-0">
          <EstudianteProgresoMapaCurso data-recorrido="mapa" />
          <!-- Dominio por lección, con acceso a reforzar cada una -->
          <section data-recorrido="lecciones" class="tarjeta-inicio space-y-4" style="--acento: 255 201 77; --acento2: 0 194 168">
            <div class="flex items-center justify-between border-b border-base-borde-sutil pb-3">
              <div>
                <h2 class="text-sm font-bold text-base-texto-primario">
                  Cómo vas en cada lección
                </h2>
                <p class="text-[11px] text-base-texto-secundario">
                  Dominada desde 85 %. Las dominadas vuelven a repasarse para no olvidarlas.
                </p>
              </div>

            </div>

            <div class="pt-1">
              <p v-if="studentStore.analytics.masteryByUnit.length === 0" class="text-xs text-base-texto-secundario italic">
                Todavía no has practicado ninguna lección. Empieza por la primera desde el
                <NuxtLink to="/estudiante" class="underline">inicio</NuxtLink>: aquí verás cómo avanzas.
              </p>
              <ul class="divide-y divide-base-borde-sutil">
                <li v-for="item in studentStore.analytics.masteryByUnit" :key="item.unitId" class="py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div class="min-w-0 sm:w-1/2">
                    <NuxtLink :to="`/estudiante/unidad/${item.unitId}`" class="inline-flex items-center min-h-[44px] sm:min-h-0 text-xs font-bold text-base-texto-primario hover:underline">{{ item.unitTitle }}</NuxtLink>
                    <p class="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span class="px-1.5 py-0.5 rounded font-bold" :class="claseEstado(item.mastery)">{{ getMasteryLevelName(item.mastery) }}</span>
                      <span v-if="debeRepasar(item)" class="inline-flex items-center gap-1 font-semibold text-acento-ambar-fuerte">
                        <RotateCcw :size="10" aria-hidden="true" /> {{ textoRepaso(item.mastery) }}
                      </span>
                    </p>
                  </div>
                  <div class="flex items-center gap-3 flex-1">
                    <div class="flex-1 h-2 bg-base-bg-secundario rounded-full overflow-hidden" role="img" :aria-label="`${item.mastery} % de dominio`">
                      <div class="h-full rounded-full" :class="colorBarra(item.mastery)" :style="{ width: `${item.mastery}%` }"></div>
                    </div>
                    <span class="w-10 text-right text-[11px] font-bold text-base-texto-primario">{{ item.mastery }} %</span>
                    <!-- Una acción solo donde hace falta: repasar lo que se olvida o seguir lo que no está dominado. -->
                    <NuxtLink v-if="debeRepasar(item) || item.mastery < 85" :to="`/estudiante/unidad/${item.unitId}`"
                      class="borde-afordancia px-2.5 py-1 rounded text-[11px] font-semibold bg-base-blanco text-acento-ambar-fuerte hover:bg-acento-ambar/10 whitespace-nowrap min-h-[44px] inline-flex items-center">
                      {{ debeRepasar(item) ? 'Repasar' : 'Practicar' }}
                    </NuxtLink>
                    <span v-else class="w-[4.5rem]" aria-hidden="true"></span>
                  </div>
                </li>
              </ul>
              <!-- MOD-01 (Jeider 17/10): también lo que falta, sin llenar la pantalla: plegado, por módulo. -->
              <details v-if="sinEmpezar.length" class="mt-3 pt-3 border-t border-base-borde-sutil text-xs">
                <summary class="min-h-[44px] flex items-center cursor-pointer font-semibold text-base-texto-primario">
                  Te faltan por empezar {{ totalSinEmpezar }} {{ totalSinEmpezar === 1 ? 'lección' : 'lecciones' }} de este curso
                </summary>
                <div v-for="g in sinEmpezar" :key="g.id" class="mt-2">
                  <p class="font-bold text-base-texto-secundario inline-flex items-center gap-1.5">
                    <Lock v-if="studentStore.estadoModulo(g.id)?.abierto === false" :size="12" aria-label="Módulo cerrado" /> {{ g.titulo }}
                  </p>
                  <ul class="mt-1 space-y-0.5">
                    <li v-for="l in g.lecciones" :key="l.id">
                      <NuxtLink :to="`/estudiante/unidad/${l.id}`" class="inline-flex items-center min-h-[36px] text-slate-700 hover:text-acento-ambar-fuerte hover:underline">{{ l.title }}</NuxtLink>
                    </li>
                  </ul>
                </div>
              </details>
            </div>
          </section>

          <!-- Cómo funciona STIRE y cómo avanzar más rápido (pedido del dueño, 04/10); incluye la calibración (META-02) -->
          <EstudianteComoAvanzas />
        </div>
        <aside class="space-y-[18px]" aria-label="Tu semana, tus notas y tus logros">
          <EstudianteInicioTuSemana :datos="logros" />
          <!-- Su nota y de dónde sale, si el docente la hizo visible (§6) -->
          <MiNota :class-id="studentStore.currentClassId" />
          <!-- Logros: solo el resumen; la lista completa está en la pestaña «Logros» (utils/logros.ts; BT-29). -->
          <EstudianteResumenLogros />
        </aside>
      </div>
    </div>

    <!-- LOGROS: todas las medallas, en su pestaña (antes, en la misma vista, tapaban el dominio). -->
    <div v-else-if="pestana === 'logros'" id="panel-logros" role="tabpanel" aria-labelledby="pestana-logros">
      <EstudianteMisLogros v-if="pestana === 'logros'" en-pestana />
    </div>

    <!-- CÓMO ESTUDIO (cuadro «E-Progreso-Reflexion»): una pregunta para pensar, el perfil y cuándo practica. -->
    <div v-else id="panel-estudio" role="tabpanel" aria-labelledby="pestana-estudio" class="space-y-[18px]">
      <EstudianteProgresoReflexion />
      <!-- Perfil de aprendizaje (MOD-02): errores que se repiten y cómo estudia -->
      <EstudiantePerfilAprendizaje v-if="authStore.user?.id" :student-id="authStore.user.id" data-recorrido="perfil" />
      <!-- Racha y semana a la vista; el resto de estadísticas, plegado (BT-21) -->
      <EstadisticasEstudiante :student-id="authStore.user?.id" :class-id="studentStore.currentClassId" />
      <!-- Historial reciente, plegado: es para consultar, no lo primero que se mira (Mi progreso medía 3416 px en el
           celular; crítica de diseño del 05/10). -->
      <details class="group tarjeta-inicio !p-0">
        <summary class="list-none cursor-pointer min-h-[44px] px-6 py-4 flex items-center gap-2 text-sm font-bold text-base-texto-primario">
          <ChevronDown :size="16" class="transition-transform group-open:rotate-180" aria-hidden="true" />
          Tus últimos ejercicios
          <span class="ml-auto text-[11px] font-normal text-base-texto-secundario">{{ studentStore.analytics.recentSubmissions.length }}</span>
        </summary>
        <div class="px-6 pb-6 space-y-3">

        <p v-if="studentStore.analytics.recentSubmissions.length === 0" class="text-xs text-base-texto-secundario italic py-2">
          Todavía no has entregado ejercicios.
        </p>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-base-bg-secundario text-slate-600 border-b border-base-borde-sutil">
              <tr>
                <th class="p-2.5 font-semibold">Ejercicio</th>
                <th class="p-2.5 font-semibold hidden sm:table-cell">Fecha</th>
                <th class="p-2.5 font-semibold">Puntaje</th>
                <th class="p-2.5 font-semibold">Resultado</th>
                <th class="p-2.5 font-semibold">Tu <Termino palabra="Dominio">dominio</Termino></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-base-borde-sutil">
              <tr v-for="sub in studentStore.analytics.recentSubmissions" :key="sub.id">
                <td class="p-2.5 font-medium text-base-texto-primario">{{ sub.activityTitle }}</td>
                <td class="p-2.5 text-base-texto-secundario hidden sm:table-cell">{{ new Date(sub.createdAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) }}</td>
                <td
                  class="p-2.5 font-bold"
                  :class="sub.passed === true ? 'text-semantico-pasa' : sub.passed === false ? 'text-semantico-falla' : 'text-base-texto-secundario'">
                  <template v-if="sub.status === 'graded'">{{ sub.score }} / {{ sub.maxScore ?? '—' }}</template>
                  <template v-else>—</template>
                </td>
                <td class="p-2.5">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap"
                    :class="sub.passed === true ? 'bg-semantico-pasa/10 text-semantico-pasa' : sub.passed === false ? 'bg-semantico-falla/15 text-semantico-falla' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
                    {{ resultLabel(sub) }}
                  </span>
                </td>
                <!-- Cuánto movió esta entrega el dominio de su lección (07/10, pedido de Jeider). -->
                <td class="p-2.5 whitespace-nowrap">
                  <template v-if="cambioDeDominio(sub)">
                    <span class="font-bold" :class="cambioDeDominio(sub)!.diferencia > 0 ? 'text-semantico-pasa' : cambioDeDominio(sub)!.diferencia < 0 ? 'text-semantico-falla' : 'text-base-texto-secundario'">{{ cambioDeDominio(sub)!.corto }}</span>
                    <span class="text-base-texto-secundario"> → {{ sub.dominioDespues }} %</span>
                  </template>
                  <span v-else class="text-base-texto-secundario">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </details>

    </div>
  </div>
</template>

<script setup lang="ts">
import { nombreDelEstado, textoRepaso, tocaRepasar } from '~/utils/progresoLeccion'
import { cambioCorto } from '~/utils/resultadoEntrega'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ChevronDown, ChevronRight, Lock, RotateCcw } from 'lucide-vue-next'
import { arcosAnillo, portadaProgreso, resumenCurso } from '~/utils/progresoV3'
import { useInicioEstudiante } from '~/composables/useInicioEstudiante'
import type { RespuestaLogros } from '~/utils/logros'
import { sinEmpezarPorModulo } from '~/utils/planLateral'
import { useStudentStore } from '~/stores/student'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()
const authStore = useAuthStore()

// Urgencia del repaso de cada lección; «Toca repasarla» se decide con el dominio (utils/progresoLeccion.ts).
const sinEmpezar = computed(() => sinEmpezarPorModulo(studentStore.modules))
const totalSinEmpezar = computed(() => sinEmpezar.value.reduce((n, g) => n + g.lecciones.length, 0))
const urgenciaPorLeccion = computed(() => new Map(studentStore.reviews.map((r) => [r.learningUnitId, r.urgency])))
const debeRepasar = (item: { unitId: number; mastery: number }) => tocaRepasar(item.mastery, urgenciaPorLeccion.value.get(item.unitId))

onMounted(() => {
  studentStore.fetchStudentData()
})

// v3: las pestañas, en la dirección (?ver=logros), para volver a la misma y para enlazarla.
const PESTANAS = [{ id: 'dominio', texto: 'Dominio' }, { id: 'logros', texto: 'Logros' }, { id: 'estudio', texto: 'Cómo estudio' }] as const
type Pestana = (typeof PESTANAS)[number]['id']
const route = useRoute()
const router = useRouter()
const pestana = computed<Pestana>(() => (PESTANAS.some((p) => p.id === route.query.ver) ? route.query.ver as Pestana : 'dominio'))
const elegir = (id: Pestana) => router.replace({ query: { ...route.query, ver: id === 'dominio' ? undefined : id } })
/** Flechas izquierda y derecha entre pestañas (patrón de pestañas de WAI-ARIA). */
function moverConFlechas(e: KeyboardEvent) {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
  const i = PESTANAS.findIndex((p) => p.id === pestana.value)
  const sig = PESTANAS[(i + (e.key === 'ArrowRight' ? 1 : PESTANAS.length - 1)) % PESTANAS.length].id
  elegir(sig)
  nextTick(() => document.getElementById(`pestana-${sig}`)?.focus())
}

const resumen = computed(() => resumenCurso(studentStore.modules))
const arcos = computed(() => arcosAnillo(resumen.value))
const portada = computed(() => portadaProgreso(studentStore.modules))
// «Tu semana» usa los días de estudio que vienen con los logros (como el inicio).
const inicio = useInicioEstudiante()
const logros = ref<RespuestaLogros | null>(null)
watch(() => authStore.user?.id, async (id) => {
  if (!id) return
  try { logros.value = await inicio.logros(id) } catch { logros.value = null }
}, { immediate: true })

const cambioDeDominio = (sub: { dominioAntes?: number | null; dominioDespues?: number | null }) => cambioCorto(sub.dominioAntes, sub.dominioDespues)

function resultLabel(sub: { status: string; passed: boolean | null }) {
  if (sub.status !== 'graded') return 'En curso'
  if (sub.passed === true) return 'Aprobado'
  if (sub.passed === false) return 'No aprobado'
  return 'Calificado'
}

// Mismos cortes que el servidor (learning-progress.service.ts: <20 explorado, <60 en práctica, <85 comprensión
// parcial, si no dominado). Antes esta pantalla usaba 70 y 40 y podía nombrar distinto el estado de una unidad.
/** El color sale del mismo estado que el nombre (antes usaba otros cortes y un 70 % salía verde y «En práctica»). */
function claseEstado(m: number) {
  if (m >= 85) return 'bg-semantico-pasa/10 text-semantico-pasa'
  if (m >= 20) return 'bg-acento-ambar-fuerte/15 text-acento-ambar-fuerte'
  return 'bg-base-bg-secundario text-slate-600'
}
const colorBarra = (m: number) => (m >= 85 ? 'bg-semantico-pasa' : m >= 20 ? 'bg-acento-ambar-fuerte' : 'bg-base-borde-fuerte')

const getMasteryLevelName = nombreDelEstado
</script>


<style scoped>
.pestana-progreso { min-height: 44px; padding: 0 12px; margin-bottom: -1px; font-size: 14px; font-weight: 700; color: rgb(var(--c-base-texto-secundario)); border-bottom: 3px solid transparent; white-space: nowrap; transition: color 0.15s ease, border-color 0.15s ease; }
.pestana-progreso:hover { color: rgb(var(--c-base-texto-primario)); }
.pestana-progreso[aria-selected="true"] { color: rgb(var(--c-base-texto-primario)); border-color: rgb(var(--c-base-texto-primario)); }
.anillo-progreso { background: rgba(255, 255, 255, 0.85); color: #14213d; }
:root[data-tema="oscuro"] .anillo-progreso { background: rgba(255, 255, 255, 0.1); color: #e8f6ff; }
.arco-progreso { transition: stroke-dasharray 0.8s cubic-bezier(0.23, 1, 0.32, 1); }
.chip-progreso { padding: 6px 12px; border-radius: 10px; background: var(--heroe-pista); }
@media (prefers-reduced-motion: reduce) { .arco-progreso { transition: none; } }
</style>
