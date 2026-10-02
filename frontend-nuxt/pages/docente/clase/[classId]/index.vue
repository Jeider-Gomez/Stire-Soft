<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <DocentePestanasClase :class-id="classId" activa="hoy" :nombre="clase?.name" :codigo="clase?.code" />

    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm">
      <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Hoy en tu clase</h1>
      <p class="text-xs text-base-texto-secundario mt-1">
        Lo que conviene atender, en orden: primero quien no puede avanzar, luego lo que espera tu comentario y al final quien
        está listo para más.{{ totalEstudiantes === null ? '' : ` ${totalEstudiantes} ${totalEstudiantes === 1 ? 'estudiante' : 'estudiantes'} en la clase.` }}
      </p>
      <!-- Resumen de la semana (estilo «Class Snapshot»): esta semana frente a la anterior. -->
      <dl v-if="semana" class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs" aria-label="Esta semana">
        <div class="rounded-lg bg-base-bg-secundario px-3 py-2">
          <dt class="text-[11px] text-base-texto-secundario">Practicaron esta semana</dt>
          <dd class="font-bold text-base-texto-primario">{{ semana.estaSemana.estudiantesActivos }} de {{ semana.total }} <span class="font-normal text-base-texto-secundario">· la anterior {{ semana.semanaAnterior.estudiantesActivos }}</span></dd>
        </div>
        <div class="rounded-lg bg-base-bg-secundario px-3 py-2">
          <dt class="text-[11px] text-base-texto-secundario">Ejercicios entregados</dt>
          <dd class="font-bold text-base-texto-primario">{{ semana.estaSemana.ejercicios }} <span class="font-normal text-base-texto-secundario">· la anterior {{ semana.semanaAnterior.ejercicios }}</span></dd>
        </div>
        <div class="rounded-lg bg-base-bg-secundario px-3 py-2">
          <dt class="text-[11px] text-base-texto-secundario">Aprobados</dt>
          <dd class="font-bold text-base-texto-primario">{{ semana.estaSemana.aprobados }} <span class="font-normal text-base-texto-secundario">· la anterior {{ semana.semanaAnterior.aprobados }}</span></dd>
        </div>
      </dl>
    </header>

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
        Nadie está bloqueado y no hay entregas por revisar. Puedes preparar lo que sigue en
        <NuxtLink :to="enlacePestana('contenido', classId)" class="underline">Contenido</NuxtLink> o mirar el mapa en
        <NuxtLink :to="enlacePestana('estudiantes', classId)" class="underline">Estudiantes</NuxtLink>.
      </p>
    </section>

    <ol v-if="!cargando && pendientes.length" class="space-y-3" aria-label="Pendientes de hoy">
      <li v-for="p in pendientes" :key="p.clave" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 sm:p-5 flex gap-3">
        <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" :class="ESTILO[p.tipo].fondo">
          <component :is="ESTILO[p.tipo].icono" :size="18" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1 space-y-2">
          <div>
            <h2 class="text-sm font-bold text-base-texto-primario">{{ p.titulo }}</h2>
            <p class="text-xs text-base-texto-secundario mt-0.5">{{ p.detalle }}</p>
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
                <button type="button" class="px-3 py-1.5 rounded-md font-semibold text-semantico-exito hover:bg-semantico-exito/10" @click="resolverSolicitud(s.id, 'approve')">Aprobar</button>
                <button type="button" class="px-3 py-1.5 rounded-md font-semibold text-semantico-error hover:bg-semantico-error/10" @click="resolverSolicitud(s.id, 'reject')">Rechazar</button>
              </span>
            </li>
          </ul>

          <div v-else class="flex flex-wrap gap-2 pt-1">
            <NuxtLink v-for="(a, i) in p.acciones" :key="a.to + a.texto" :to="a.to"
              class="px-3.5 py-2 rounded-md text-xs inline-flex items-center gap-1.5"
              :class="i === 0 ? 'bg-acento-ambar-fuerte text-base-blanco font-bold' : 'borde-afordancia font-semibold text-base-texto-primario'">
              {{ a.texto }}
            </NuxtLink>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Component } from 'vue'
import { AlertTriangle, CheckCircle2, Clock, Inbox, Loader2, Moon, Rocket, Undo2, UserPlus } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { enlacePestana } from '~/utils/pestanasClase'
import { pendientesDeHoy, type EntregaHoy, type MapaHoy, type RefuerzoHoy, type SemanaHoy, type TipoPendiente } from '~/utils/hoyClase'

definePageMeta({ layout: 'teacher' })

interface Solicitud { id: string; student?: { fullName?: string; email?: string; fotoId?: string | null } }

const route = useRoute()
const api = useApi()
const classId = Number(route.params.classId)
const MAX_PERSONAS = 8

const ESTILO: Record<TipoPendiente, { icono: Component; fondo: string }> = {
  solicitudes: { icono: UserPlus, fondo: 'bg-semantico-info/10 text-semantico-info' },
  bloqueados: { icono: AlertTriangle, fondo: 'bg-semantico-falla/10 text-semantico-falla' },
  revisar: { icono: Inbox, fondo: 'bg-acento-ambar/15 text-acento-ambar-fuerte' },
  salto_fallido: { icono: Undo2, fondo: 'bg-semantico-falla/10 text-semantico-falla' },
  refuerzo_quieto: { icono: Clock, fondo: 'bg-acento-ambar/15 text-acento-ambar-fuerte' },
  sin_actividad: { icono: Moon, fondo: 'bg-base-bg-secundario text-base-texto-secundario' },
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
  mapa.value === null && 'estudiantes bloqueados',
  refuerzos.value === null && 'refuerzos',
].filter((x): x is string => typeof x === 'string'))

// Cada fuente por separado: si una falla, «Hoy» muestra lo demás y dice cuál faltó.
const valor = <T,>(r: PromiseSettledResult<T>): T | null => (r.status === 'fulfilled' ? r.value : null)

async function cargar() {
  cargando.value = true
  const [c, s, e, m, r, w] = await Promise.allSettled([
    api.get<{ id: number; name: string; code?: string }>(`/class/${classId}`),
    api.get<Solicitud[]>(`/enrollment/class/${classId}/pending`),
    api.get<EntregaHoy[]>(`/entregas/clase/${classId}`),
    api.get<MapaHoy & { estudiantes: unknown[] }>(`/analytics/class/${classId}/heatmap`),
    api.get<RefuerzoHoy[]>(`/refuerzos/clase/${classId}`),
    api.get<SemanaHoy>(`/analytics/class/${classId}/semana`),
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
  await api.apiFetch(`/enrollment/${id}/${accion}`, { method: 'PATCH' })
  solicitudes.value = solicitudes.value.filter((s) => s.id !== id)
}

onMounted(cargar)
</script>
