<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <DocentePestanasClase :class-id="classId" activa="ajustes" :nombre="classInfo?.name" :codigo="classInfo?.code" />

    <!-- Quién está en la clase: primero las solicitudes, porque el estudiante no ve el curso hasta que lo aceptas. -->
    <section id="solicitudes" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3">
      <h1 class="text-sm font-bold text-base-texto-primario">Solicitudes para entrar</h1>
      <p v-if="pending.length === 0" class="text-xs text-base-texto-secundario">No hay solicitudes pendientes.</p>
      <div v-for="enrollment in pending" :key="enrollment.id" class="flex items-center justify-between gap-3 border-b border-base-borde-sutil py-3">
        <span class="text-xs min-w-0 truncate inline-flex items-center gap-2"><AvatarUsuario :nombre="enrollment.student?.fullName" :foto-id="enrollment.student?.fotoId" decorativo /><span class="truncate">{{ enrollment.student?.fullName || enrollment.student?.email || 'Estudiante' }}</span></span>
        <div class="flex gap-2 shrink-0">
          <button class="px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-exito hover:bg-semantico-exito/10" @click="change(enrollment.id, 'approve')">Aprobar</button>
          <button class="px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-error hover:bg-semantico-error/10" @click="change(enrollment.id, 'reject')">Rechazar</button>
        </div>
      </div>
    </section>

    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3">
      <h2 class="text-sm font-bold text-base-texto-primario">Estudiantes en la clase ({{ active.length }})</h2>
      <p v-if="active.length === 0" class="text-xs text-base-texto-secundario">Todavía no hay estudiantes. Comparte el código de la clase.</p>
      <div v-for="enrollment in active" :key="enrollment.id" class="flex items-center justify-between gap-3 border-b border-base-borde-sutil py-3">
        <span class="text-xs min-w-0 truncate inline-flex items-center gap-2"><AvatarUsuario :nombre="enrollment.student?.fullName" :foto-id="enrollment.student?.fotoId" decorativo /><span class="truncate">{{ enrollment.student?.fullName || enrollment.student?.email || 'Estudiante' }}</span></span>
        <button class="px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-error hover:bg-semantico-error/10 shrink-0" @click="change(enrollment.id, 'remove')">Remover</button>
      </div>
    </section>

    <!-- Cómo se entra a la clase -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <h2 class="text-sm font-bold text-base-texto-primario">Matrícula</h2>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil">
        <div>
          <p class="text-xs font-semibold text-base-texto-primario">Exigir aprobación para matricularse</p>
          <p class="text-[11px] text-base-texto-secundario mt-0.5">
            Si está activo, un estudiante que ingrese el código queda en «pendiente» hasta que lo apruebes aquí.
          </p>
        </div>
        <button
          @click="toggleRequiresApproval"
          :disabled="isSavingApproval"
          :aria-pressed="!!classInfo?.requiresApproval"
          class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex-shrink-0 self-start sm:self-auto inline-flex items-center gap-1"
          :class="classInfo?.requiresApproval
            ? 'bg-semantico-exito/15 text-semantico-exito'
            : 'bg-base-borde-sutil text-base-texto-secundario'"
        >
          <Check v-if="classInfo?.requiresApproval" :size="12" aria-hidden="true" />
          {{ classInfo?.requiresApproval ? 'Activado' : 'Desactivado' }}
        </button>
      </div>
    </section>

    <!-- Bloqueo suave por módulo (utils/bloqueoModulos.ts): opcional y configurable, como toda función del docente -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3" aria-labelledby="avance-titulo">
      <h2 id="avance-titulo" class="text-sm font-bold text-base-texto-primario">Avance entre módulos</h2>
      <form class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil" @submit.prevent="guardarAvance">
        <div class="space-y-1">
          <label for="dominio-avanzar" class="block text-xs font-semibold text-base-texto-primario">Dominio del módulo anterior para abrir el siguiente</label>
          <p id="dominio-avanzar-ayuda" class="text-[11px] text-slate-600 max-w-md">
            El estudiante ve cuánto le falta y lo que ya empezó nunca se le cierra. Con 0 % no hay bloqueo: puede abrir cualquier módulo.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <input id="dominio-avanzar" v-model.number="dominioAvanzar" type="number" inputmode="numeric" min="0" max="100" step="5" aria-describedby="dominio-avanzar-ayuda" class="w-20 min-h-[44px] px-2 rounded-md border border-base-borde-fuerte bg-base-blanco text-sm" />
          <span class="text-xs text-slate-600">%</span>
          <button type="submit" :disabled="guardandoAvance" class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-white disabled:opacity-40">
            {{ guardandoAvance ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
      <p v-if="avisoAvance" role="status" class="text-[11px] font-semibold" :class="avisoAvance.error ? 'text-red-700' : 'text-semantico-pasa'">{{ avisoAvance.texto }}</p>
    </section>

    <!-- Logros y medallas (docs/DISENO_LOGROS.md §6): activados por defecto; un interruptor y, si quiere, qué categorías.
         Los niveles (bronce, plata, oro) son fijos: el docente no tiene que pensar en números. -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3" aria-labelledby="logros-titulo">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="logros-titulo" class="text-sm font-bold text-base-texto-primario">Logros y medallas</h2>
          <p class="text-[11px] text-base-texto-secundario mt-0.5">
            Cada estudiante gana medallas por aprender: dominar lecciones y módulos, resolver avanzados, no rendirse,
            repasar. Son privadas y sin ranking. Ya vienen listas; no tienes que configurar nada.
          </p>
        </div>
        <button type="button" :disabled="guardandoLogros" :aria-pressed="logrosActivos"
          class="min-h-[44px] px-3 rounded-md text-xs font-bold flex-shrink-0 self-start sm:self-auto inline-flex items-center gap-1"
          :class="logrosActivos ? 'bg-semantico-exito/15 text-semantico-exito' : 'bg-base-borde-sutil text-base-texto-secundario'"
          @click="guardarLogros({ logrosActivos: !logrosActivos })">
          <Check v-if="logrosActivos" :size="12" aria-hidden="true" />
          {{ logrosActivos ? 'Activados' : 'Desactivados' }}
        </button>
      </div>
      <details v-if="logrosActivos" class="rounded-lg border border-base-borde-sutil">
        <summary class="min-h-[44px] flex items-center px-3 text-xs font-semibold text-base-texto-primario cursor-pointer">
          Elegir categorías <span class="ml-1 font-normal text-base-texto-secundario">({{ categoriasLogro.length === CATEGORIAS.length ? 'todas' : `${categoriasLogro.length} de ${CATEGORIAS.length}` }})</span>
        </summary>
        <div class="px-3 pb-3 space-y-1.5">
          <label v-for="c in CATEGORIAS" :key="c" class="flex items-start gap-2 min-h-[44px] py-1 text-xs cursor-pointer">
            <input type="checkbox" :checked="categoriasLogro.includes(c)" :disabled="guardandoLogros || (categoriasLogro.length === 1 && categoriasLogro.includes(c))" class="mt-0.5" @change="alternarCategoria(c)" />
            <span><span class="font-semibold text-base-texto-primario">{{ CATEGORIAS_LOGRO[c].nombre }}</span> <span class="text-base-texto-secundario">· {{ CATEGORIAS_LOGRO[c].sentido }}</span></span>
          </label>
          <p class="text-[11px] text-base-texto-secundario">Debe quedar al menos una. Para no usar logros, desactívalos arriba.</p>
        </div>
      </details>
      <p v-if="avisoLogros" role="status" class="text-xs" :class="avisoLogros.error ? 'text-semantico-error' : 'text-semantico-exito'">{{ avisoLogros.texto }}</p>
    </section>

    <!-- Compartir el contenido (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.3): con quién, y su enfoque en una línea -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3" aria-labelledby="compartir-titulo">
      <h2 id="compartir-titulo" class="text-sm font-bold text-base-texto-primario">Compartir el contenido</h2>
      <p class="text-[11px] text-base-texto-secundario">
        Otros docentes podrán copiar los módulos, explicaciones y ejercicios a sus propias clases. Reciben una copia: lo que
        cambien no toca tu clase, y tus estudiantes, entregas y notas nunca se comparten.
      </p>
      <div role="radiogroup" aria-labelledby="compartir-titulo" class="space-y-1.5">
        <label v-for="o in opcionesCompartir" :key="o.valor"
          class="flex items-start gap-2 min-h-[44px] rounded-lg border px-3 py-2"
          :class="o.motivoNoDisponible ? 'border-base-borde-sutil opacity-60 cursor-not-allowed' : alcanceElegido === o.valor ? 'border-acento-ambar-fuerte bg-acento-ambar/10 cursor-pointer' : 'border-base-borde-sutil hover:bg-base-bg-secundario cursor-pointer'">
          <input v-model="alcanceElegido" type="radio" name="alcance-plantilla" :value="o.valor" :disabled="!!o.motivoNoDisponible" class="mt-0.5" />
          <span class="text-xs">
            <span class="font-semibold text-base-texto-primario">{{ o.titulo }}</span>
            <span class="block text-[11px] text-base-texto-secundario">{{ o.motivoNoDisponible || o.ayuda }}</span>
          </span>
        </label>
      </div>
      <div v-if="alcanceElegido !== 'nadie'">
        <label for="enfoque-plantilla" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Enfoque <span class="text-base-texto-secundario font-normal">(una línea: cómo la diferencias de otras de la misma asignatura)</span>
        </label>
        <input id="enfoque-plantilla" v-model="enfoqueElegido" type="text" maxlength="160" placeholder="Con JavaScript, según el plan de clase · Solo pseudocódigo, sin programar"
          class="w-full min-h-[44px] px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none" />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" :disabled="isSavingPlantilla || !cambioCompartir"
          class="min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-base-blanco disabled:opacity-50"
          @click="guardarCompartir">
          {{ isSavingPlantilla ? 'Guardando…' : 'Guardar' }}
        </button>
        <p v-if="avisoCompartir" role="status" class="text-xs" :class="avisoCompartir.error ? 'text-semantico-error' : 'text-semantico-exito'">{{ avisoCompartir.texto }}</p>
      </div>
    </section>

    <!-- Datos de la clase -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <h2 class="text-sm font-bold text-base-texto-primario">Datos de la clase</h2>

      <!-- Asignatura, grupo y periodo (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): de aquí sale lo que dice la barra superior -->
      <div>
        <label for="class-asignatura" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Asignatura <span class="text-base-texto-secundario font-normal">(opcional)</span>
        </label>
        <DocenteSelectorAsignatura v-model="editForm.asignatura" input-id="class-asignatura" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="class-grupo" class="block text-xs font-semibold text-base-texto-primario mb-1">Grupo</label>
          <input id="class-grupo" v-model="editForm.grupo" type="text" maxlength="40" placeholder="Grupo 2"
            class="w-full min-h-[44px] px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors" />
        </div>
        <div>
          <label for="class-periodo" class="block text-xs font-semibold text-base-texto-primario mb-1">Periodo</label>
          <input id="class-periodo" v-model="editForm.periodo" type="text" maxlength="7" placeholder="2026-2"
            class="w-full min-h-[44px] px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors" />
        </div>
      </div>

      <div>
        <label for="class-name" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Nombre <span class="text-semantico-error">*</span>
        </label>
        <input
          id="class-name"
          v-model="editForm.name"
          type="text"
          maxlength="120"
          placeholder="Nombre de la clase"
          class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors"
        />
      </div>

      <div>
        <label for="class-description" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Descripción <span class="text-base-texto-secundario font-normal">(opcional)</span>
        </label>
        <textarea v-crece
          id="class-description"
          v-model="editForm.description"
          rows="3"
          placeholder="Breve descripción de la clase..."
          class="w-full px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors resize-none"
        />
      </div>

      <div>
        <label for="class-code-display" class="block text-xs font-semibold text-base-texto-primario mb-1">
          Código de ingreso <span class="text-base-texto-secundario font-normal">(solo lectura)</span>
        </label>
        <div class="flex items-center gap-2">
          <input
            id="class-code-display"
            :value="classInfo?.code || ''"
            type="text"
            readonly
            class="flex-1 min-w-0 px-3 py-2 text-sm font-mono rounded-md border border-base-borde-sutil bg-base-bg-secundario text-base-texto-primario outline-none cursor-not-allowed"
          />
          <button
            id="copy-class-code-btn"
            type="button"
            @click="copyCode"
            class="px-3 py-2 rounded-md text-xs font-bold bg-base-borde-sutil hover:bg-acento-ambar/20 text-base-texto-primario transition-colors flex-shrink-0 flex items-center gap-1"
          >
            <Check v-if="codeCopied" :size="12" aria-hidden="true" />
            <span>{{ codeCopied ? 'Copiado' : 'Copiar' }}</span>
          </button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          id="save-class-data-btn"
          type="button"
          :disabled="!hasChanges || isSavingData"
          @click="saveData"
          class="px-4 py-2 rounded-md text-xs font-bold bg-acento-ambar text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-acento-ambar-fuerte"
        >
          {{ isSavingData ? 'Guardando...' : 'Guardar cambios' }}
        </button>
        <transition name="fade">
          <span v-if="saveSuccess" role="status" class="text-xs text-semantico-exito font-semibold">Cambios guardados.</span>
        </transition>
        <span v-if="saveError" role="alert" class="text-xs text-semantico-error font-semibold">{{ saveError }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { AsignaturaInfo } from '~/utils/contextoAcademico'
import { opcionesDeAlcance, type AlcancePlantilla } from '~/utils/plantillas'
import { CATEGORIAS_LOGRO, categoriasElegidas, type CategoriaLogro } from '~/utils/logros'
import { Check } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'teacher' })

interface EnrollmentItem {
  id: string
  status: string
  student?: { fullName?: string; email?: string; fotoId?: string | null }
}

interface ClassInfo {
  id: number
  name: string
  code?: string
  description?: string
  requiresApproval?: boolean
  compartidaComoPlantilla?: boolean
  alcancePlantilla?: AlcancePlantilla
  enfoque?: string | null
  logrosActivos?: boolean
  categoriasLogro?: string | null
  dominioParaAvanzar?: number
  asignatura?: AsignaturaInfo | null
  grupo?: string | null
  periodo?: string | null
}

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const pending = ref<EnrollmentItem[]>([])
const active = ref<EnrollmentItem[]>([])
const classInfo = ref<ClassInfo | null>(null)
const isSavingApproval = ref(false)
const classId = Number(route.params.classId)

// Datos editables del formulario
const editForm = reactive({
  name: '',
  description: '',
  asignatura: null as AsignaturaInfo | null,
  grupo: '',
  periodo: ''
})

// Estado guardado (para comparar cambios)
const savedData = reactive({
  name: '',
  description: '',
  asignaturaId: null as number | null,
  grupo: '',
  periodo: ''
})

const isSavingData = ref(false)
const saveSuccess = ref(false)
const saveError = ref<string | null>(null)
const codeCopied = ref(false)

const hasChanges = computed(() => {
  return editForm.name.trim() !== savedData.name || editForm.description !== savedData.description ||
    (editForm.asignatura?.id ?? null) !== savedData.asignaturaId || editForm.grupo.trim() !== savedData.grupo || editForm.periodo.trim() !== savedData.periodo
})

async function load() {
  const [pendingItems, allItems, classData] = await Promise.all([
    api.get<EnrollmentItem[]>(`/enrollment/class/${classId}/pending`),
    api.get<EnrollmentItem[]>(`/enrollment/class/${classId}`),
    api.get<ClassInfo>(`/class/${classId}`)
  ])
  pending.value = pendingItems
  active.value = allItems.filter(item => item.status === 'active')
  classInfo.value = classData

  // Inicializar formulario con los datos actuales
  llenarFormulario(classData)
}

function llenarFormulario(c: ClassInfo | null) {
  editForm.name = c?.name || ''
  editForm.description = c?.description || ''
  editForm.asignatura = c?.asignatura ?? null
  editForm.grupo = c?.grupo ?? ''
  editForm.periodo = c?.periodo ?? ''
  savedData.name = editForm.name
  savedData.description = editForm.description
  savedData.asignaturaId = editForm.asignatura?.id ?? null
  savedData.grupo = editForm.grupo
  savedData.periodo = editForm.periodo
}

async function saveData() {
  if (!hasChanges.value) return
  if (!editForm.name.trim()) {
    saveError.value = 'El nombre de la clase no puede estar vacío.'
    return
  }

  isSavingData.value = true
  saveSuccess.value = false
  saveError.value = null

  try {
    // Solo enviar los campos que cambiaron (PATCH parcial)
    const body: Record<string, string | number | null> = {}
    if (editForm.name.trim() !== savedData.name) {
      body.name = editForm.name.trim()
    }
    if (editForm.description !== savedData.description) {
      body.description = editForm.description
    }
    if ((editForm.asignatura?.id ?? null) !== savedData.asignaturaId) body.asignaturaId = editForm.asignatura?.id ?? null
    if (editForm.grupo.trim() !== savedData.grupo) body.grupo = editForm.grupo.trim()
    if (editForm.periodo.trim() !== savedData.periodo) body.periodo = editForm.periodo.trim()

    const updated = await api.apiFetch<ClassInfo>(`/class/${classId}`, {
      method: 'PATCH',
      body
    })

    classInfo.value = updated
    llenarFormulario(updated)
    if ('asignaturaId' in body) void useContextoDocente().recargar() // la barra superior toma la asignatura

    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err) {
    saveError.value = messageOf(err, 'Error al guardar los cambios.')
  } finally {
    isSavingData.value = false
  }
}

async function copyCode() {
  if (!classInfo.value?.code) return
  try {
    await navigator.clipboard.writeText(classInfo.value.code)
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 2000)
  } catch {
    // fallback
    const el = document.getElementById('class-code-display') as HTMLInputElement | null
    el?.select()
    document.execCommand('copy')
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 2000)
  }
}

async function change(id: string, action: 'approve' | 'reject' | 'remove') {
  const method = action === 'remove' ? 'DELETE' : 'PATCH'
  const path = action === 'remove' ? `/enrollment/${id}` : `/enrollment/${id}/${action}`
  await api.apiFetch(path, { method })
  await load()
}

// Logros y medallas: activados por defecto; el docente solo los apaga o elige categorías (docs/DISENO_LOGROS.md §6).
const CATEGORIAS = Object.keys(CATEGORIAS_LOGRO) as CategoriaLogro[]
const logrosActivos = computed(() => classInfo.value?.logrosActivos ?? true)
const categoriasLogro = computed(() => categoriasElegidas(classInfo.value?.categoriasLogro))
const guardandoLogros = ref(false)
const avisoLogros = ref<{ texto: string; error: boolean } | null>(null)
async function guardarLogros(cambio: { logrosActivos?: boolean; categoriasLogro?: CategoriaLogro[] }) {
  guardandoLogros.value = true
  avisoLogros.value = null
  try {
    classInfo.value = await api.apiFetch<ClassInfo>(`/class/${classId}`, { method: 'PATCH', body: cambio })
    avisoLogros.value = { texto: cambio.logrosActivos === false ? 'Guardado: esta clase no usa logros.' : 'Guardado.', error: false }
  } catch (err) {
    avisoLogros.value = { texto: messageOf(err, 'No se pudo guardar.'), error: true }
  } finally {
    guardandoLogros.value = false
  }
}
function alternarCategoria(c: CategoriaLogro) {
  const actuales = categoriasLogro.value
  const nuevas = actuales.includes(c) ? actuales.filter((x) => x !== c) : [...actuales, c]
  if (nuevas.length) void guardarLogros({ categoriasLogro: nuevas })
}

// Con quién se comparte: las opciones dicen los nombres reales de su asignatura, programa, facultad e institución.
const isSavingPlantilla = ref(false)
const alcanceElegido = ref<AlcancePlantilla>('nadie')
const enfoqueElegido = ref('')
const avisoCompartir = ref<{ texto: string; error: boolean } | null>(null)
const opcionesCompartir = computed(() => opcionesDeAlcance(classInfo.value?.asignatura))
watch(classInfo, (c) => {
  alcanceElegido.value = c?.alcancePlantilla ?? (c?.compartidaComoPlantilla ? 'todos' : 'nadie')
  enfoqueElegido.value = c?.enfoque ?? ''
}, { immediate: true })
const cambioCompartir = computed(() => {
  const c = classInfo.value
  return !!c && (alcanceElegido.value !== (c.alcancePlantilla ?? 'nadie') || enfoqueElegido.value.trim() !== (c.enfoque ?? ''))
})
async function guardarCompartir() {
  if (!classInfo.value) return
  isSavingPlantilla.value = true
  avisoCompartir.value = null
  try {
    classInfo.value = await api.apiFetch<ClassInfo>(`/class/${classId}`, {
      method: 'PATCH',
      body: { alcancePlantilla: alcanceElegido.value, enfoque: enfoqueElegido.value.trim() || null }
    })
    const titulo = opcionesCompartir.value.find((o) => o.valor === alcanceElegido.value)?.titulo ?? ''
    avisoCompartir.value = { texto: alcanceElegido.value === 'nadie' ? 'Guardado: no se comparte.' : `Guardado: la ven ${titulo.charAt(0).toLowerCase()}${titulo.slice(1)}.`, error: false }
  } catch (err) {
    avisoCompartir.value = { texto: messageOf(err, 'No se pudo guardar.'), error: true }
  } finally {
    isSavingPlantilla.value = false
  }
}

const dominioAvanzar = ref(50)
const guardandoAvance = ref(false)
const avisoAvance = ref<{ texto: string; error: boolean } | null>(null)
watch(() => classInfo.value?.dominioParaAvanzar, (v) => { if (typeof v === 'number') dominioAvanzar.value = v }, { immediate: true })

async function guardarAvance() {
  const v = Math.round(Number(dominioAvanzar.value))
  if (!Number.isFinite(v) || v < 0 || v > 100) {
    avisoAvance.value = { texto: 'Escribe un número de 0 a 100.', error: true }
    return
  }
  guardandoAvance.value = true
  try {
    classInfo.value = await api.apiFetch<ClassInfo>(`/class/${classId}`, { method: 'PATCH', body: { dominioParaAvanzar: v } })
    avisoAvance.value = { texto: v === 0 ? 'Guardado: los módulos ya no se bloquean.' : `Guardado: el siguiente módulo se abre con ${v} %.`, error: false }
  } catch (e) {
    avisoAvance.value = { texto: messageOf(e, 'No se pudo guardar. Intenta de nuevo.'), error: true }
  } finally {
    guardandoAvance.value = false
  }
}

async function toggleRequiresApproval() {
  if (!classInfo.value) return
  isSavingApproval.value = true
  try {
    const updated = await api.apiFetch<ClassInfo>(`/class/${classId}`, {
      method: 'PATCH',
      body: { requiresApproval: !classInfo.value.requiresApproval }
    })
    classInfo.value = updated
  } finally {
    isSavingApproval.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
