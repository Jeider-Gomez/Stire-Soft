<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <DocentePestanasClase :class-id="classId" activa="hoy" :nombre="clase?.name" :codigo="clase?.code" />

    <!-- v3 (Fase E, paso 2; cuadro «D3-Clase»): el título con la clase y, a la derecha, lo que se hace al empezar la sesión. -->
    <header data-recorrido="hoy" class="cabecera-docente">
      <div class="min-w-0">
        <h1 class="titulo-docente">Resumen de tu clase</h1>
        <p class="detalle-docente">
          {{ clase?.name ? `${clase.name} · ` : '' }}{{ totalEstudiantes === null ? '' : `${totalEstudiantes} ${totalEstudiantes === 1 ? 'estudiante' : 'estudiantes'} · ` }}lo que conviene
          atender, en orden: primero quien necesita ayuda, luego lo que espera tu comentario y al final quien está listo para más.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <NuxtLink :to="enlacePestana('asistencia', classId)" class="borde-afordancia inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-semibold"><ClipboardCheck :size="16" aria-hidden="true" /> Tomar asistencia</NuxtLink>
        <NuxtLink :to="enlacePestana('contenido', classId)" class="boton-tinta inline-flex">Ir al contenido <ChevronRight :size="16" aria-hidden="true" /></NuxtLink>
      </div>
    </header>
    <!-- Esta semana frente a la anterior (estilo «Class Snapshot»), en tarjetas como las cifras del cuadro. -->
    <dl v-if="semana" class="cifras-docente lg:!grid-cols-3" aria-label="Esta semana">
      <div class="cifra-docente">
        <dt>Practicaron esta semana</dt>
        <dd>{{ semana.estaSemana.estudiantesActivos }} de {{ semana.total }}<small>la semana pasada {{ semana.semanaAnterior.estudiantesActivos }}</small></dd>
      </div>
      <div class="cifra-docente">
        <dt>Ejercicios entregados</dt>
        <dd>{{ semana.estaSemana.ejercicios }}<small>la semana pasada {{ semana.semanaAnterior.ejercicios }}</small></dd>
      </div>
      <div class="cifra-docente">
        <dt>Aprobados</dt>
        <dd>{{ semana.estaSemana.aprobados }}<small>la semana pasada {{ semana.semanaAnterior.aprobados }}</small></dd>
      </div>
    </dl>

    <!-- En pantallas anchas, dos columnas: lo que hay que hacer hoy y, al lado, cómo va la semana. -->
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr),380px] items-start">
    <div class="min-w-0 space-y-4">
    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Revisando la clase…
    </p>
    <p v-if="!cargando && fuentesCaidas.length" role="alert" class="text-xs text-semantico-falla">
      No se pudo cargar: {{ fuentesCaidas.join(', ') }}. Lo demás está al día.
    </p>

    <section v-if="!cargando && pendientes.length === 0" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-8 text-center space-y-2">
      <CheckCircle2 :size="28" class="mx-auto text-semantico-pasa" aria-hidden="true" />
      <h2 class="text-sm font-bold text-base-texto-primario">Todo al día</h2>
      <p class="text-xs text-base-texto-secundario">
        Nadie necesita ayuda y no hay entregas por revisar. Puedes preparar lo que sigue en
        <NuxtLink :to="enlacePestana('contenido', classId)" class="underline">Contenido</NuxtLink> o mirar el mapa en
        <NuxtLink :to="enlacePestana('estudiantes', classId)" class="underline">Estudiantes</NuxtLink>.
      </p>
    </section>

    <h2 v-if="!cargando && pendientes.length" class="m-0 font-poppins font-bold text-[19px]">Necesitan algo <span class="block text-[14px] font-normal font-sans text-base-texto-secundario">Cada uno con su porqué y lo que puedes hacer. Tú decides.</span></h2>
    <ol v-if="!cargando && pendientes.length" id="bloqueados" class="space-y-3 scroll-mt-24" aria-label="Lo que necesita tu atención">
      <li v-for="p in pendientes" :key="p.clave" class="bg-base-blanco rounded-2xl border border-base-borde-sutil p-4 sm:p-5 flex gap-3">
        <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="ESTILO[p.tipo].fondo">
          <component :is="ESTILO[p.tipo].icono" :size="18" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1 space-y-2">
          <div>
            <h3 class="m-0 text-[15px] font-bold text-base-texto-primario">{{ p.titulo }}</h3>
            <p class="m-0 text-[14px] text-base-texto-secundario mt-0.5">{{ p.detalle }}</p>
          </div>

          <ul v-if="p.personas.length" class="flex flex-wrap gap-1.5 text-[11px]" :aria-label="`Estudiantes: ${p.titulo}`">
            <li v-for="persona in p.personas.slice(0, MAX_PERSONAS)" :key="persona.id">
              <NuxtLink :to="`/docente/estudiante/${persona.id}?clase=${classId}`"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-base-bg-secundario text-base-texto-primario hover:underline">
                {{ persona.nombre }}<span v-if="persona.nota" class="text-base-texto-secundario">· {{ persona.nota }}</span>
              </NuxtLink>
            </li>
            <li v-if="p.personas.length > MAX_PERSONAS" class="px-2 py-1 text-base-texto-secundario">y {{ p.personas.length - MAX_PERSONAS }} más</li>
          </ul>

          <!-- Las solicitudes se resuelven aquí mismo, sin cambiar de pantalla. -->
          <ul v-if="p.tipo === 'solicitudes'" class="divide-y divide-base-borde-sutil text-xs">
            <li v-for="s in solicitudes" :key="s.id" class="flex items-center justify-between gap-3 py-2">
              <span class="min-w-0 truncate inline-flex items-center gap-2"><AvatarUsuario :nombre="s.student?.fullName" :foto-id="s.student?.fotoId" decorativo /><span class="truncate">{{ s.student?.fullName || s.student?.email || 'Estudiante' }}</span></span>
              <span class="flex gap-2 shrink-0">
                <button type="button" class="px-3 py-1.5 rounded-md font-semibold text-semantico-pasa hover:bg-semantico-pasa/10" @click="resolverSolicitud(s.id, 'approve')">Aprobar</button>
                <button type="button" class="px-3 py-1.5 rounded-md font-semibold text-semantico-falla hover:bg-semantico-falla/10" @click="resolverSolicitud(s.id, 'reject')">Rechazar</button>
              </span>
            </li>
          </ul>

          <div v-else class="flex flex-wrap gap-2 pt-1">
            <NuxtLink v-for="(a, i) in p.acciones" :key="a.to + a.texto" :to="a.to"
              class="min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-md text-xs inline-flex items-center gap-1.5"
              :class="i === 0 ? 'bg-acento-ambar-fuerte text-base-blanco font-bold' : 'borde-afordancia font-semibold text-base-texto-primario'">
              {{ a.texto }}
            </NuxtLink>
          </div>
        </div>
      </li>
    </ol>
    </div>

    <div class="min-w-0 space-y-6 xl:sticky xl:top-20">
      <DocenteErroresSemana id="errores" class="scroll-mt-24" :class-id="classId" />
      <DocenteValoracionesClase :class-id="classId" />
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue'
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardCheck, Clock, Inbox, Loader2, Moon, Rocket, Undo2, UserPlus } from 'lucide-vue-next'
import { useResumenClase } from '~/composables/useResumenClase'
import { enlacePestana } from '~/utils/pestanasClase'
import { pendientesDeHoy, type EntregaHoy, type MapaHoy, type RefuerzoHoy, type SemanaHoy, type TipoPendiente } from '~/utils/hoyClase'

definePageMeta({ layout: 'teacher' })

interface Solicitud { id: string; student?: { fullName?: string; email?: string; fotoId?: string | null } }

const route = useRoute()
const classId = Number(route.params.classId)
const accionesResumen = useResumenClase(classId)
const MAX_PERSONAS = 8

const ESTILO: Record<TipoPendiente, { icono: Component; fondo: string }> = {
  solicitudes: { icono: UserPlus, fondo: 'bg-semantico-info/10 text-semantico-info' },
  bloqueados: { icono: AlertTriangle, fondo: 'bg-semantico-falla/10 text-semantico-falla' },
  revisar: { icono: Inbox, fondo: 'bg-acento-ambar/15 text-acento-ambar-fuerte' },
  salto_fallido: { icono: Undo2, fondo: 'bg-semantico-falla/10 text-semantico-falla' },
  refuerzo_quieto: { icono: Clock, fondo: 'bg-acento-ambar/15 text-acento-ambar-fuerte' },
  sin_actividad: { icono: Moon, fondo: 'bg-base-bg-secundario text-slate-600' },
  entrega_cierra: { icono: Clock, fondo: 'bg-semantico-info/10 text-semantico-info' },
  listos: { icono: Rocket, fondo: 'bg-semantico-pasa/10 text-semantico-pasa' },
}

const clase = ref<{ id: number; name: string; code?: string } | null>(null)
const solicitudes = ref<Solicitud[]>([])
const entregas = ref<EntregaHoy[] | null>(null)
const mapa = ref<(MapaHoy & { estudiantes: unknown[] }) | null>(null)
const refuerzos = ref<RefuerzoHoy[] | null>(null)
const semana = ref<SemanaHoy | null>(null)
const solicitudesCargadas = ref(false)
const cargando = ref(true)

const pendientes = computed(() => pendientesDeHoy({
  classId,
  solicitudes: solicitudesCargadas.value ? solicitudes.value.length : null,
  entregas: entregas.value,
  mapa: mapa.value,
  refuerzos: refuerzos.value,
  semana: semana.value,
  ahora: new Date(),
}))
const totalEstudiantes = computed(() => mapa.value?.estudiantes.length ?? null)
const fuentesCaidas = computed(() => [
  !solicitudesCargadas.value && 'solicitudes',
  entregas.value === null && 'entregas',
  mapa.value === null && 'quién necesita ayuda',
  refuerzos.value === null && 'refuerzos',
].filter((x): x is string => typeof x === 'string'))

// Cada fuente por separado: si una falla, «Hoy» muestra lo demás y dice cuál faltó.
const valor = <T,>(r: PromiseSettledResult<T>): T | null => (r.status === 'fulfilled' ? r.value : null)

async function cargar() {
  cargando.value = true
  const [c, s, e, m, r, w] = await Promise.allSettled([
    accionesResumen.clase<{ id: number; name: string; code?: string }>(),
    accionesResumen.solicitudes<Solicitud[]>(),
    accionesResumen.entregas<EntregaHoy[]>(),
    accionesResumen.mapa<MapaHoy & { estudiantes: unknown[] }>(),
    accionesResumen.refuerzos<RefuerzoHoy[]>(),
    accionesResumen.semana<SemanaHoy>(),
  ])
  clase.value = valor(c)
  solicitudes.value = valor(s) ?? []
  solicitudesCargadas.value = s.status === 'fulfilled'
  entregas.value = valor(e)
  mapa.value = valor(m)
  refuerzos.value = valor(r)
  semana.value = valor(w)
  cargando.value = false
}

async function resolverSolicitud(id: string, accion: 'approve' | 'reject') {
  await accionesResumen.resolverSolicitud(id, accion)
  solicitudes.value = solicitudes.value.filter((s) => s.id !== id)
}

onMounted(cargar)
</script>
