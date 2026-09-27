<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <h4 class="text-[11px] font-bold uppercase tracking-wider text-base-texto-secundario">
        Ejercicios <span v-if="!loading">({{ activities.length }})</span>
      </h4>
      <NuxtLink
        :to="`/docente/ejercicios/crear?classId=${classId}&unitId=${unitId}`"
        class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-acento-ambar-fuerte text-base-blanco hover:bg-acento-ambar transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
        <Plus :size="14" aria-hidden="true" /> Ejercicio
      </NuxtLink>
    </div>

    <p v-if="loading" class="text-[11px] text-base-texto-secundario animate-pulse">Cargando ejercicios…</p>
    <p v-else-if="loadError" role="alert" class="text-[11px] text-semantico-falla">{{ loadError }}</p>
    <p v-else-if="activities.length === 0" class="text-[11px] text-base-texto-secundario italic">
      Todavía no hay ejercicios. Empieza por uno sencillo: una pregunta de opción múltiple sobre la lección.
    </p>

    <ul v-else class="divide-y divide-base-borde-sutil rounded-lg border border-base-borde-sutil bg-base-blanco">
      <li v-for="act in visibleActivities" :key="act.id" class="flex items-center justify-between gap-3 px-3 py-2 text-xs">
        <div class="min-w-0">
          <p class="font-semibold text-base-texto-primario truncate">{{ act.title }}</p>
          <p class="text-[10px] text-base-texto-secundario">
            {{ act.activityType?.name || 'Práctica' }} · {{ difficultyLabel(act.difficulty) }} · {{ act.totalPoints }} pts
          </p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :class="act.status === 'published' ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
            {{ act.status === 'published' ? 'Visible' : 'Borrador' }}
          </span>
          <button
            v-if="act.status === 'draft'"
            @click="publish(act)"
            class="px-2 py-0.5 rounded text-[11px] font-semibold border border-semantico-pasa/40 text-semantico-pasa hover:bg-semantico-pasa/10 focus:outline-none focus:ring-2 focus:ring-semantico-pasa"
            :aria-label="`Publicar ${act.title}`">
            Publicar
          </button>
          <button
            @click="openEdit(act)"
            class="p-1 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
            :aria-label="`Editar ${act.title}`" title="Editar">
            <Pencil :size="14" aria-hidden="true" />
          </button>
          <button
            @click="askArchive(act)"
            class="p-1 rounded text-base-texto-secundario hover:text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none focus:ring-2 focus:ring-semantico-falla"
            :aria-label="`Archivar ${act.title}`" title="Archivar">
            <Archive :size="14" aria-hidden="true" />
          </button>
        </div>
      </li>
    </ul>
    <p v-if="feedback" role="status" class="text-[11px] text-semantico-pasa">{{ feedback }}</p>

    <!-- Editar datos del ejercicio -->
    <Teleport to="body">
      <div
        v-if="edit.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true" aria-labelledby="edit-exercise-title"
        @click.self="edit.open = false">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <form @submit.prevent="saveEdit" class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4 text-xs">
          <h2 id="edit-exercise-title" class="text-sm font-bold text-base-texto-primario">Editar ejercicio</h2>
          <div>
            <label for="edit-ex-title" class="block font-semibold text-base-texto-primario mb-1">Título</label>
            <input id="edit-ex-title" ref="editTitleRef" v-model="edit.form.title" type="text" required
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="edit-ex-difficulty" class="block font-semibold text-base-texto-primario mb-1">Dificultad</label>
              <select id="edit-ex-difficulty" v-model="edit.form.difficulty" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte">
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <label for="edit-ex-points" class="block font-semibold text-base-texto-primario mb-1">Puntos</label>
              <input id="edit-ex-points" v-model.number="edit.form.totalPoints" type="number" min="5" max="100" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte" />
            </div>
          </div>
          <div>
            <label for="edit-ex-type" class="block font-semibold text-base-texto-primario mb-1">Tipo de actividad</label>
            <select id="edit-ex-type" v-model="edit.form.activityTypeId" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte">
              <option v-for="t in activityTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <p class="text-[10px] text-base-texto-secundario mt-1">Un taller o un parcial cuentan más en el dominio del estudiante que una práctica.</p>
          </div>
          <details class="border-t border-base-borde-sutil pt-3">
            <summary class="text-[11px] font-semibold text-base-texto-secundario cursor-pointer select-none">Tutor IA en este ejercicio</summary>
            <div class="mt-3"><DocenteTutorSettingsPanel scope-type="activity" :scope-id="edit.id!" /></div>
          </details>
          <p v-if="edit.error" role="alert" class="text-semantico-falla text-[11px]">{{ edit.error }}</p>
          <div class="flex justify-end gap-2">
            <button type="button" @click="edit.open = false" class="px-4 py-2 rounded-md borde-afordancia font-semibold">Cancelar</button>
            <button type="submit" :disabled="edit.saving" class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold disabled:opacity-50">
              {{ edit.saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>

    <!-- Confirmar archivo -->
    <Teleport to="body">
      <div
        v-if="archive.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true" aria-labelledby="archive-exercise-title"
        @click.self="archive.open = false">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-sm p-6 space-y-4 text-xs">
          <h2 id="archive-exercise-title" class="text-sm font-bold text-base-texto-primario">¿Archivar «{{ archive.activity?.title }}»?</h2>
          <p class="text-base-texto-secundario">Los estudiantes dejarán de verlo. Sus entregas anteriores se conservan.</p>
          <p v-if="archive.error" role="alert" class="text-semantico-falla text-[11px]">{{ archive.error }}</p>
          <div class="flex justify-end gap-2">
            <button @click="archive.open = false" class="px-4 py-2 rounded-md borde-afordancia font-semibold">Cancelar</button>
            <button @click="confirmArchive" :disabled="archive.saving" class="px-5 py-2 rounded-md bg-semantico-falla text-base-blanco font-bold disabled:opacity-50">
              {{ archive.saving ? 'Archivando…' : 'Archivar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus, Pencil, Archive } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

const props = defineProps<{ unitId: number; classId: number }>()
const emit = defineEmits<{ (e: 'count', n: number): void }>()

interface ActivityTypeOption { id: number; name: string; baseWeight: number }
interface ActivityItem {
  id: number
  title: string
  difficulty: string
  totalPoints: number
  status: 'draft' | 'published' | 'archived'
  activityTypeId?: number
  activityType?: { id: number; name: string; baseWeight: number }
}

const api = useApi()
const { messageOf } = useApiErrorMessage()

const activities = ref<ActivityItem[]>([])
const activityTypes = ref<ActivityTypeOption[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const feedback = ref<string | null>(null)

const visibleActivities = computed(() => activities.value.filter((a) => a.status !== 'archived'))

function difficultyLabel(d: string) {
  return d === 'intermedio' ? 'Intermedio' : d === 'avanzado' ? 'Avanzado' : 'Básico'
}

async function load() {
  loading.value = true
  loadError.value = null
  try {
    const [res, types] = await Promise.all([
      api.get<{ data?: ActivityItem[] } | ActivityItem[]>(`/activities?learningUnitId=${props.unitId}&limit=50`),
      activityTypes.value.length ? Promise.resolve(activityTypes.value) : api.get<ActivityTypeOption[] | { data?: ActivityTypeOption[] }>('/activity-types')
    ])
    activities.value = Array.isArray(res) ? res : (res?.data ?? [])
    activityTypes.value = Array.isArray(types) ? types : (types?.data ?? [])
    emit('count', visibleActivities.value.length)
  } catch (err) {
    loadError.value = messageOf(err, 'No se pudieron cargar los ejercicios.')
  } finally {
    loading.value = false
  }
}

async function publish(act: ActivityItem) {
  try {
    await api.patch(`/activities/${act.id}/publish`)
    act.status = 'published'
    feedback.value = `«${act.title}» ya es visible para los estudiantes.`
  } catch (err) {
    loadError.value = messageOf(err, 'No se pudo publicar el ejercicio.')
  }
}

// ─── Editar ───────────────────────────────────────────────────────────────────
const editTitleRef = ref<HTMLInputElement | null>(null)
const edit = reactive({
  open: false,
  id: null as number | null,
  form: { title: '', difficulty: 'basico', totalPoints: 20, activityTypeId: null as number | null },
  saving: false,
  error: null as string | null
})

function openEdit(act: ActivityItem) {
  edit.id = act.id
  edit.form = {
    title: act.title,
    difficulty: act.difficulty || 'basico',
    totalPoints: act.totalPoints,
    activityTypeId: act.activityTypeId ?? act.activityType?.id ?? activityTypes.value[0]?.id ?? null
  }
  edit.error = null
  edit.open = true
  nextTick(() => editTitleRef.value?.focus())
}

async function saveEdit() {
  if (!edit.form.title.trim()) { edit.error = 'El título es obligatorio.'; return }
  edit.saving = true
  edit.error = null
  try {
    await api.patch(`/activities/${edit.id}`, {
      title: edit.form.title.trim(),
      difficulty: edit.form.difficulty,
      totalPoints: edit.form.totalPoints,
      activityTypeId: edit.form.activityTypeId
    })
    const act = activities.value.find((a) => a.id === edit.id)
    if (act) {
      act.title = edit.form.title.trim()
      act.difficulty = edit.form.difficulty
      act.totalPoints = edit.form.totalPoints
      const t = activityTypes.value.find((x) => x.id === edit.form.activityTypeId)
      if (t) { act.activityTypeId = t.id; act.activityType = t }
    }
    feedback.value = 'Cambios guardados.'
    edit.open = false
  } catch (err) {
    edit.error = messageOf(err, 'No se pudieron guardar los cambios.')
  } finally {
    edit.saving = false
  }
}

// ─── Archivar ─────────────────────────────────────────────────────────────────
const archive = reactive({ open: false, activity: null as ActivityItem | null, saving: false, error: null as string | null })

function askArchive(act: ActivityItem) {
  archive.activity = act
  archive.error = null
  archive.open = true
}

async function confirmArchive() {
  if (!archive.activity) return
  archive.saving = true
  try {
    await api.patch(`/activities/${archive.activity.id}/archive`)
    archive.activity.status = 'archived'
    feedback.value = `«${archive.activity.title}» archivado.`
    emit('count', visibleActivities.value.length)
    archive.open = false
  } catch (err) {
    archive.error = messageOf(err, 'No se pudo archivar el ejercicio.')
  } finally {
    archive.saving = false
  }
}

useEscapeToClose(() => edit.open, () => { edit.open = false })
useEscapeToClose(() => archive.open, () => { archive.open = false })

onMounted(load)
defineExpose({ reload: load })
</script>
