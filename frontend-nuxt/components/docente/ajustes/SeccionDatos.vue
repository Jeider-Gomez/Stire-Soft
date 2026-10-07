<template>
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
        Nombre <span class="text-semantico-falla">*</span>
      </label>
      <input
        id="class-name"
        v-model="editForm.name"
        type="text"
        maxlength="120"
        placeholder="Nombre de la clase"
        class="w-full min-h-[44px] px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors"
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
        class="w-full min-h-[44px] px-3 py-2 text-sm rounded-md border border-base-borde-sutil bg-base-blanco focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30 outline-none transition-colors resize-none"
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
          class="min-h-[44px] px-3 py-2 rounded-md text-xs font-bold bg-base-bg-secundario border border-base-borde-fuerte hover:bg-acento-ambar/20 text-base-texto-primario transition-colors flex-shrink-0 flex items-center gap-1"
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
        class="min-h-[44px] px-4 py-2 rounded-md text-xs font-bold bg-acento-ambar text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-acento-ambar-fuerte"
      >
        {{ isSavingData ? 'Guardando...' : 'Guardar cambios' }}
      </button>
      <transition name="fade">
        <span v-if="saveSuccess" role="status" class="text-xs text-semantico-pasa font-semibold">Cambios guardados.</span>
      </transition>
      <span v-if="saveError" role="alert" class="text-xs text-semantico-falla font-semibold">{{ saveError }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import type { AsignaturaInfo } from '~/utils/contextoAcademico'
import type { ClassInfo, EstadoAjustesClase } from '~/composables/useAjustesClase'

/** «Datos de la clase» de Ajustes: nombre, descripción, asignatura, grupo, periodo y el código para copiar. */
const props = defineProps<{ ajustes: EstadoAjustesClase }>()
const { classInfo } = props.ajustes
const { messageOf } = useApiErrorMessage()

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

// El formulario se llena una sola vez, cuando llegan los datos de la clase (y después de guardar): si se llenara con cada
// cambio de `classInfo`, guardar los logros o el avance borraría lo que el docente estaba escribiendo aquí.
const lleno = ref(false)
watch(classInfo, (c) => {
  if (c && !lleno.value) { llenarFormulario(c); lleno.value = true }
}, { immediate: true })

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

    const updated = await props.ajustes.guardarDatos(body)
    llenarFormulario(updated)
    if ('asignaturaId' in body) void useContextoDocente().recargar()

    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: unknown) {
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
    const el = document.getElementById('class-code-display') as HTMLInputElement | null
    el?.select()
    document.execCommand('copy')
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 2000)
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
