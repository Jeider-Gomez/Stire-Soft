<template>
  <!-- «Dónde enseño» / «Qué estudio» (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md, fase 3). Opcional. Al docente le sirve
       desde el primer día: ve las plantillas de su programa y su facultad, y la barra superior dice dónde enseña aunque
       aún no tenga clases. Un docente puede tener varios programas, en varias instituciones. -->
  <section class="max-w-xl mx-auto bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4" aria-labelledby="vinculos-titulo">
    <div>
      <h2 id="vinculos-titulo" class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
        <Landmark :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> {{ esDocente ? 'Dónde enseño' : 'Qué estudio' }}
      </h2>
      <p class="text-[11px] text-base-texto-secundario mt-1">
        {{ esDocente
          ? 'Opcional. Con tu programa ves desde el primer día las plantillas que comparten sus docentes, y STIRE muestra dónde enseñas.'
          : 'Opcional. Tu programa y semestre ayudan a tus docentes a conocer el grupo.' }}
      </p>
    </div>

    <p v-if="cargando" role="status" class="text-xs text-base-texto-secundario">Cargando…</p>
    <ul v-else-if="vinculos.length" class="divide-y divide-base-borde-sutil">
      <li v-for="v in vinculos" :key="v.id" class="flex items-center justify-between gap-3 py-2">
        <span class="text-xs min-w-0">
          <span class="font-semibold text-base-texto-primario">{{ v.program.name }}</span>
          <span class="block text-[11px] text-base-texto-secundario">
            {{ [institucionCorta(v.institution), v.program.facultad, v.currentSemester ? periodoDelPlan(v.currentSemester, v.program.tipo) : ''].filter(Boolean).join(' · ') }}
          </span>
        </span>
        <button type="button" class="shrink-0 min-h-[44px] px-3 text-xs font-semibold text-semantico-falla hover:underline" :aria-label="`Quitar ${v.program.name}`" @click="quitar(v)">Quitar</button>
      </li>
    </ul>
    <p v-else class="text-xs text-base-texto-secundario">Todavía no has agregado ninguno.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <label class="text-xs font-semibold text-base-texto-primario">Institución
        <select v-model="institucionId" class="input-stire mt-1 min-h-[44px]">
          <option :value="null" disabled>Elige una</option>
          <option v-for="i in instituciones" :key="i.id" :value="i.id">{{ i.name }}</option>
        </select>
      </label>
      <label class="text-xs font-semibold text-base-texto-primario">Programa o nivel
        <select v-model="programaId" :disabled="!institucionId" class="input-stire mt-1 min-h-[44px]">
          <option :value="null" disabled>Elige uno</option>
          <option v-for="p in programas" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </label>
      <label v-if="!esDocente && programa" class="text-xs font-semibold text-base-texto-primario">{{ programa.tipo === 'grado' ? 'Grado' : 'Semestre' }}
        <select v-model="semestre" class="input-stire mt-1 min-h-[44px]">
          <option :value="null">Prefiero no decirlo</option>
          <option v-for="n in programa.maxSemesters ?? 10" :key="n" :value="n">{{ periodoDelPlan(n, programa.tipo) }}</option>
        </select>
      </label>
    </div>
    <p v-if="esDocente && institucionId && !programas.length" class="text-[11px] text-base-texto-secundario">
      Esta institución aún no tiene programas en STIRE. Agrégalo al crear una clase, en «Asignatura» → «Agregar».
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <button type="button" :disabled="!programaId || guardando" class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-base-blanco disabled:opacity-50" @click="agregar">
        {{ guardando ? 'Guardando…' : 'Agregar' }}
      </button>
      <p v-if="aviso" role="status" class="text-xs" :class="aviso.error ? 'text-semantico-falla' : 'text-semantico-pasa'">{{ aviso.texto }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Landmark } from 'lucide-vue-next'
import { institucionCorta, periodoDelPlan, type InstitucionInfo, type ProgramaInfo } from '~/utils/contextoAcademico'
import { useAuthStore } from '~/stores/auth'

interface Vinculo { id: number; currentSemester: number | null; program: ProgramaInfo & { maxSemesters: number }; institution: InstitucionInfo | null }

const api = useApi()
const { messageOf } = useApiErrorMessage()
const authStore = useAuthStore()
const esDocente = computed(() => authStore.currentRole !== 'estudiante')

const vinculos = ref<Vinculo[]>([])
const instituciones = ref<Array<InstitucionInfo & { programs?: ProgramaInfo[] }>>([])
const institucionId = ref<number | null>(null)
const programaId = ref<number | null>(null)
const semestre = ref<number | null>(null)
const cargando = ref(true)
const guardando = ref(false)
const aviso = ref<{ texto: string; error: boolean } | null>(null)

const programas = computed(() => instituciones.value.find((i) => i.id === institucionId.value)?.programs ?? [])
const programa = computed(() => programas.value.find((p) => p.id === programaId.value))
watch(institucionId, () => { programaId.value = null; semestre.value = null })

async function cargar() {
  cargando.value = true
  try {
    const [v, i] = await Promise.all([
      api.get<Vinculo[]>('/users/me/affiliations'),
      api.get<Array<InstitucionInfo & { programs?: ProgramaInfo[] }>>('/institutions'),
    ])
    vinculos.value = v
    instituciones.value = i
    if (i.length === 1 && institucionId.value === null) institucionId.value = i[0].id
  } catch (e) {
    aviso.value = { texto: messageOf(e, 'No se pudieron cargar tus programas.'), error: true }
  }
  cargando.value = false
}

async function agregar() {
  if (!programaId.value) return
  guardando.value = true
  aviso.value = null
  try {
    await api.post('/users/me/affiliations', {
      programId: programaId.value,
      roleType: esDocente.value ? 'docente' : 'estudiante',
      currentSemester: semestre.value ?? undefined,
    })
    aviso.value = { texto: 'Guardado.', error: false }
    programaId.value = null
    await cargar()
    if (esDocente.value) void useContextoDocente().recargar()
  } catch (e) {
    aviso.value = { texto: messageOf(e, 'No se pudo guardar.'), error: true }
  } finally {
    guardando.value = false
  }
}

async function quitar(v: Vinculo) {
  aviso.value = null
  try {
    await api.del(`/users/me/affiliations/${v.id}`)
    vinculos.value = vinculos.value.filter((x) => x.id !== v.id)
    if (esDocente.value) void useContextoDocente().recargar()
  } catch (e) {
    aviso.value = { texto: messageOf(e, 'No se pudo quitar.'), error: true }
  }
}

onMounted(cargar)
</script>
