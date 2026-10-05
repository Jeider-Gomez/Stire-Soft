<template>
  <!-- Elegir la asignatura de una clase (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md). Opcional. Se busca por nombre o código;
       si no está, se agrega aquí mismo: de un programa (carrera o grado), de una institución sin programa (electiva
       libre) o libre, sin institución. Crear lo que ya existe devuelve lo existente. -->
  <div class="space-y-2">
    <!-- Elegida -->
    <div v-if="modelValue" class="flex items-start justify-between gap-3 rounded-lg border border-base-borde-sutil bg-base-bg-secundario p-3">
      <div class="min-w-0">
        <p class="text-sm font-semibold text-base-texto-primario">{{ modelValue.nombre }}<span v-if="modelValue.codigo" class="font-normal text-slate-600"> · {{ modelValue.codigo }}</span></p>
        <p class="text-xs text-slate-600">{{ lugarDeAsignatura(modelValue) }}<template v-if="modelValue.institution && modelValue.program"> · {{ institucionCorta(modelValue.institution) }}</template></p>
      </div>
      <button type="button" class="shrink-0 min-h-[44px] px-3 text-xs font-semibold text-acento-ambar-fuerte hover:underline" @click="quitar">Cambiar asignatura</button>
    </div>

    <!-- Buscar -->
    <div v-else-if="!agregando" class="relative">
      <Search :size="15" class="absolute left-3 top-3.5 text-slate-600 pointer-events-none" aria-hidden="true" />
      <input
        :id="inputId"
        v-model="texto"
        type="text"
        role="combobox"
        autocomplete="off"
        :aria-expanded="abierta"
        :aria-controls="`${uid}-lista`"
        :aria-activedescendant="activa >= 0 ? `${uid}-op-${activa}` : undefined"
        :aria-describedby="`${uid}-ayuda`"
        placeholder="Busca por nombre o código: «Fundamentos», «203413»…"
        class="input-stire pl-9 min-h-[44px]"
        @focus="abierta = true"
        @keydown.down.prevent="mover(1)"
        @keydown.up.prevent="mover(-1)"
        @keydown.enter.prevent="elegirActiva"
        @keydown.escape="abierta = false"
        @blur="cerrarLuego" />
      <ul v-if="abierta && (resultados.length || texto.trim().length >= 3)" :id="`${uid}-lista`" role="listbox" class="absolute z-20 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-base-borde-sutil bg-base-blanco shadow-lg">
        <li
          v-for="(a, i) in resultados"
          :id="`${uid}-op-${i}`"
          :key="a.id"
          role="option"
          :aria-selected="activa === i"
          class="px-3 py-2.5 cursor-pointer min-h-[44px]"
          :class="activa === i ? 'bg-acento-ambar/10' : 'hover:bg-base-bg-secundario'"
          @mousedown.prevent="elegir(a)">
          <p class="text-sm text-base-texto-primario">{{ a.nombre }}<span v-if="a.codigo" class="text-slate-600"> · {{ a.codigo }}</span></p>
          <p class="text-[11px] text-slate-600">{{ lugarDeAsignatura(a) }}<span v-if="a.oficial" class="ml-1.5 inline-flex items-center gap-0.5 font-semibold text-semantico-pasa"><BadgeCheck :size="11" aria-hidden="true" /> Oficial</span></p>
        </li>
        <li
          v-if="texto.trim().length >= 3"
          :id="`${uid}-op-${resultados.length}`"
          role="option"
          :aria-selected="activa === resultados.length"
          class="px-3 py-2.5 cursor-pointer min-h-[44px] border-t border-base-borde-sutil text-sm font-semibold text-acento-ambar-fuerte inline-flex w-full items-center gap-2"
          :class="activa === resultados.length ? 'bg-acento-ambar/10' : 'hover:bg-base-bg-secundario'"
          @mousedown.prevent="empezarAgregar">
          <Plus :size="14" aria-hidden="true" /> Agregar «{{ texto.trim() }}»
        </li>
      </ul>
      <p :id="`${uid}-ayuda`" class="mt-1 text-[11px] text-slate-600">Opcional. Con la asignatura, la clase muestra su programa y semestre, y las plantillas se encuentran solas.</p>
    </div>

    <!-- Agregar -->
    <fieldset v-else class="rounded-lg border border-base-borde-sutil p-3 space-y-3">
      <legend class="px-1 text-xs font-bold text-base-texto-primario">Agregar una asignatura</legend>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <label class="sm:col-span-2 text-xs font-semibold text-base-texto-primario">Nombre
          <input v-model="nueva.nombre" type="text" maxlength="150" class="input-stire mt-1 min-h-[44px]" />
        </label>
        <label class="text-xs font-semibold text-base-texto-primario">Código <span class="font-normal text-slate-600">(opcional)</span>
          <input v-model="nueva.codigo" type="text" maxlength="30" placeholder="203413" class="input-stire mt-1 min-h-[44px]" />
        </label>
      </div>

      <div role="radiogroup" aria-label="Dónde va la asignatura" class="space-y-1.5">
        <label v-for="o in OPCIONES" :key="o.valor" class="flex items-start gap-2 text-xs cursor-pointer min-h-[44px] py-1">
          <input v-model="nueva.donde" type="radio" :value="o.valor" class="mt-0.5" />
          <span><span class="font-semibold text-base-texto-primario">{{ o.titulo }}</span><br /><span class="text-slate-600">{{ o.ayuda }}</span></span>
        </label>
      </div>

      <!-- Institución (programa o electiva) -->
      <div v-if="nueva.donde !== 'libre'" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label class="text-xs font-semibold text-base-texto-primario">Institución
          <select v-model="nueva.institutionId" class="input-stire mt-1 min-h-[44px]">
            <option :value="null" disabled>Elige una</option>
            <option v-for="i in instituciones" :key="i.id" :value="i.id">{{ i.name }}</option>
            <option :value="NUEVA">Otra institución…</option>
          </select>
        </label>
        <template v-if="nueva.institutionId === NUEVA">
          <label class="text-xs font-semibold text-base-texto-primario">Nombre de la institución
            <input v-model="nueva.institucionNombre" type="text" maxlength="150" placeholder="I. E. San José" class="input-stire mt-1 min-h-[44px]" />
          </label>
          <label class="text-xs font-semibold text-base-texto-primario">Tipo
            <select v-model="nueva.institucionTipo" class="input-stire mt-1 min-h-[44px]">
              <option value="universidad">Universidad</option>
              <option value="colegio">Colegio</option>
              <option value="otra">Otra</option>
            </select>
          </label>
        </template>
      </div>

      <!-- Programa y semestre -->
      <div v-if="nueva.donde === 'programa' && nueva.institutionId !== null" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label class="text-xs font-semibold text-base-texto-primario">Programa o nivel
          <select v-model="nueva.programId" class="input-stire mt-1 min-h-[44px]">
            <option :value="null" disabled>Elige uno</option>
            <option v-for="p in programasDeLaInstitucion" :key="p.id" :value="p.id">{{ p.name }}</option>
            <option :value="NUEVA">Otro programa o nivel…</option>
          </select>
        </label>
        <label v-if="nueva.programId !== null" class="text-xs font-semibold text-base-texto-primario">{{ tipoPrograma === 'grado' ? 'Grado' : 'Semestre' }} <span class="font-normal text-slate-600">(opcional)</span>
          <select v-model="nueva.periodoPlan" class="input-stire mt-1 min-h-[44px]">
            <option :value="null">Sin {{ tipoPrograma === 'grado' ? 'grado' : 'semestre' }} fijo</option>
            <option v-for="n in periodosDelPrograma" :key="n" :value="n">{{ periodoDelPlan(n, tipoPrograma) }}</option>
          </select>
        </label>
        <template v-if="nueva.programId === NUEVA">
          <label class="text-xs font-semibold text-base-texto-primario">Nombre del programa
            <input v-model="nueva.programaNombre" type="text" maxlength="150" placeholder="Licenciatura en Informática · Básica secundaria" class="input-stire mt-1 min-h-[44px]" />
          </label>
          <div class="grid grid-cols-2 gap-2">
            <label class="text-xs font-semibold text-base-texto-primario">Es
              <select v-model="nueva.programaTipo" class="input-stire mt-1 min-h-[44px]">
                <option value="carrera">Carrera</option>
                <option value="grado">Nivel escolar</option>
              </select>
            </label>
            <label class="text-xs font-semibold text-base-texto-primario">{{ nueva.programaTipo === 'grado' ? 'Grados' : 'Semestres' }}
              <input v-model.number="nueva.programaPeriodos" type="number" min="1" max="20" class="input-stire mt-1 min-h-[44px]" />
            </label>
          </div>
          <label class="sm:col-span-2 text-xs font-semibold text-base-texto-primario">Facultad <span class="font-normal text-slate-600">(opcional; un colegio no tiene)</span>
            <input v-model="nueva.programaFacultad" type="text" maxlength="150" class="input-stire mt-1 min-h-[44px]" />
          </label>
        </template>
      </div>

      <!-- «¿Es alguna de estas?» (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.2.1): evita la misma asignatura con dos nombres -->
      <div v-if="parecidas.length" role="alert" class="rounded-lg border border-acento-ambar/40 bg-acento-ambar/10 p-3 space-y-2">
        <p class="text-xs font-semibold text-base-texto-primario">¿Es alguna de estas? Ya existen con un nombre o código parecido:</p>
        <ul class="space-y-1.5">
          <li v-for="a in parecidas" :key="a.id" class="flex items-center justify-between gap-2 rounded-md bg-base-blanco px-3 py-1.5">
            <span class="min-w-0 text-xs">
              <span class="font-semibold text-base-texto-primario">{{ a.nombre }}</span><span v-if="a.codigo" class="text-slate-600"> · {{ a.codigo }}</span>
              <span class="block text-[11px] text-slate-600">{{ lugarDeAsignatura(a) }}<template v-if="a.oficial"> · oficial</template></span>
            </span>
            <button type="button" class="shrink-0 min-h-[44px] px-3 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-base-blanco" @click="usarParecida(a)" :aria-label="`Usar ${a.nombre}`">Usar esta asignatura</button>
          </li>
        </ul>
        <button type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" @click="agregarIgual">No, es otra: agregarla</button>
      </div>

      <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
      <div v-if="!parecidas.length" class="flex flex-wrap justify-end gap-2">
        <button type="button" class="min-h-[44px] px-4 rounded-md text-xs font-semibold borde-afordancia" @click="agregando = false">Cancelar</button>
        <button type="button" class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-base-blanco disabled:opacity-50" :disabled="guardando" @click="guardar">
          {{ guardando ? 'Agregando…' : 'Agregar y elegir' }}
        </button>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, useId, watch } from 'vue'
import { BadgeCheck, Plus, Search } from 'lucide-vue-next'
import { institucionCorta, lugarDeAsignatura, periodoDelPlan, type AsignaturaInfo, type InstitucionInfo, type ProgramaInfo } from '~/utils/contextoAcademico'

const props = defineProps<{ modelValue: AsignaturaInfo | null; inputId?: string; programaSugerido?: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [AsignaturaInfo | null] }>()

const api = useApi()
const { messageOf } = useApiErrorMessage()
const uid = useId()
const NUEVA = -1
const OPCIONES = [
  { valor: 'programa', titulo: 'De un programa', ayuda: 'Una carrera (por semestres) o un nivel de colegio (por grados).' },
  { valor: 'institucion', titulo: 'De una institución, sin programa', ayuda: 'Una electiva libre, un curso de extensión o de la facultad.' },
  { valor: 'libre', titulo: 'Curso libre', ayuda: 'Sin institución: un curso que dictas por tu cuenta.' },
] as const

const texto = ref('')
const resultados = ref<AsignaturaInfo[]>([])
const abierta = ref(false)
const activa = ref(-1)
const agregando = ref(false)
const guardando = ref(false)
const error = ref('')
const instituciones = ref<Array<InstitucionInfo & { programs?: ProgramaInfo[] }>>([])
const parecidas = ref<AsignaturaInfo[]>([])
const yaPregunto = ref(false)

const nueva = reactive({
  nombre: '', codigo: '', donde: 'programa' as 'programa' | 'institucion' | 'libre',
  institutionId: null as number | null, institucionNombre: '', institucionTipo: 'universidad' as 'universidad' | 'colegio' | 'otra',
  programId: null as number | null, programaNombre: '', programaTipo: 'carrera' as 'carrera' | 'grado', programaPeriodos: 10, programaFacultad: '',
  periodoPlan: null as number | null,
})

const programasDeLaInstitucion = computed(() => instituciones.value.find((i) => i.id === nueva.institutionId)?.programs ?? [])
const programaElegido = computed(() => programasDeLaInstitucion.value.find((p) => p.id === nueva.programId))
const tipoPrograma = computed(() => (nueva.programId === NUEVA ? nueva.programaTipo : programaElegido.value?.tipo ?? 'carrera'))
const periodosDelPrograma = computed(() => {
  const n = nueva.programId === NUEVA ? nueva.programaPeriodos : programaElegido.value?.maxSemesters ?? 10
  return Array.from({ length: Math.min(Math.max(Number(n) || 1, 1), 20) }, (_, i) => i + 1)
})
watch(() => nueva.institutionId, () => { nueva.programId = null; nueva.periodoPlan = null })
watch(() => nueva.programId, () => { nueva.periodoPlan = null })
// Si cambia lo que se va a agregar, se vuelve a preguntar por las parecidas.
watch(() => [nueva.nombre, nueva.codigo, nueva.donde, nueva.institutionId, nueva.programId], () => { parecidas.value = []; yaPregunto.value = false })

// Búsqueda con pausa: una consulta cuando deja de escribir, no una por tecla.
let espera: ReturnType<typeof setTimeout> | undefined
watch(texto, (t) => {
  clearTimeout(espera)
  activa.value = -1
  espera = setTimeout(() => buscar(t), 250)
})
async function buscar(t: string) {
  const q = t.trim()
  if (!q && !props.programaSugerido) { resultados.value = []; return }
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (props.programaSugerido) params.set('programId', String(props.programaSugerido))
  try { resultados.value = await api.get<AsignaturaInfo[]>(`/asignaturas?${params}`) } catch { resultados.value = [] }
}
buscar('')

function total() { return resultados.value.length + (texto.value.trim().length >= 3 ? 1 : 0) }
function mover(d: number) {
  abierta.value = true
  const n = total()
  if (n) activa.value = (activa.value + d + n) % n
}
function elegirActiva() {
  if (activa.value < 0) return
  if (activa.value < resultados.value.length) elegir(resultados.value[activa.value])
  else empezarAgregar()
}
function cerrarLuego() { setTimeout(() => { abierta.value = false }, 150) }
function elegir(a: AsignaturaInfo) {
  emit('update:modelValue', a)
  abierta.value = false
  texto.value = ''
}
function quitar() { emit('update:modelValue', null) }

async function empezarAgregar() {
  abierta.value = false
  agregando.value = true
  error.value = ''
  nueva.nombre = texto.value.trim()
  if (!instituciones.value.length) {
    try { instituciones.value = await api.get<Array<InstitucionInfo & { programs?: ProgramaInfo[] }>>('/institutions') } catch { instituciones.value = [] }
  }
  // Sugerencia: la institución y el programa del docente, si se conocen.
  const conPrograma = instituciones.value.find((i) => i.programs?.some((p) => p.id === props.programaSugerido))
  if (conPrograma) {
    nueva.institutionId = conPrograma.id
    await nextTick() // el cambio de institución borra el programa; se pone después
    nueva.programId = props.programaSugerido ?? null
  }
  else if (instituciones.value.length === 1) nueva.institutionId = instituciones.value[0].id
}

function usarParecida(a: AsignaturaInfo) {
  parecidas.value = []
  agregando.value = false
  elegir(a)
}
function agregarIgual() {
  parecidas.value = []
  void guardar()
}

async function guardar() {
  error.value = ''
  if (nueva.nombre.trim().length < 3) { error.value = 'Escribe el nombre completo de la asignatura.'; return }
  if (nueva.donde !== 'libre' && nueva.institutionId === null) { error.value = 'Elige la institución.'; return }
  if (nueva.donde === 'programa' && nueva.programId === null) { error.value = 'Elige el programa o nivel, o marca «De una institución, sin programa».'; return }
  // Antes de crear nada, ¿ya existe con otro nombre? Si hay parecidas se muestran y el docente decide.
  if (!yaPregunto.value) {
    yaPregunto.value = true
    const params = new URLSearchParams({ nombre: nueva.nombre })
    if (nueva.codigo.trim()) params.set('codigo', nueva.codigo.trim())
    if (nueva.donde === 'programa' && nueva.programId !== null && nueva.programId !== NUEVA) params.set('programId', String(nueva.programId))
    else if (nueva.donde !== 'libre' && nueva.institutionId !== null && nueva.institutionId !== NUEVA) params.set('institutionId', String(nueva.institutionId))
    try { parecidas.value = await api.get<AsignaturaInfo[]>(`/asignaturas/parecidas?${params}`) } catch { parecidas.value = [] }
    if (parecidas.value.length) return
  }
  guardando.value = true
  try {
    let institutionId: number | undefined
    let programId: number | undefined
    if (nueva.donde !== 'libre') {
      institutionId = nueva.institutionId === NUEVA
        ? (await api.post<InstitucionInfo>('/institutions', { name: nueva.institucionNombre, tipo: nueva.institucionTipo })).id
        : nueva.institutionId!
    }
    if (nueva.donde === 'programa') {
      programId = nueva.programId === NUEVA
        ? (await api.post<ProgramaInfo>('/programs', {
            name: nueva.programaNombre, institutionId, tipo: nueva.programaTipo,
            maxSemesters: Number(nueva.programaPeriodos), facultad: nueva.programaFacultad || undefined,
          })).id
        : nueva.programId!
    }
    const a = await api.post<AsignaturaInfo>('/asignaturas', {
      nombre: nueva.nombre, codigo: nueva.codigo || undefined, programId, institutionId: programId ? undefined : institutionId,
      periodoPlan: programId && nueva.periodoPlan ? nueva.periodoPlan : undefined,
    })
    instituciones.value = []
    agregando.value = false
    elegir(a)
  } catch (e) {
    error.value = messageOf(e, 'No se pudo agregar la asignatura.')
  } finally {
    guardando.value = false
  }
}
</script>
