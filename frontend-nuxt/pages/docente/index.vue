<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera DOC-V01 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Panel Docente • DOC-V01
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Mis Clases y Grupos Asignados
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Universidad de Córdoba • Sistema de Tutoría Inteligente STIRE
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors shadow-sm self-start sm:self-auto cursor-pointer flex items-center gap-1.5">
        <span>+</span>
        <span>Crear Nueva Clase</span>
      </button>
    </header>

    <!-- Notificación de éxito temporal -->
    <div v-if="successMessage" class="p-3 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-lg text-xs flex items-center justify-between">
      <span>✔ {{ successMessage }}</span>
      <button @click="successMessage = null" class="text-[11px] underline">Cerrar</button>
    </div>

    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <span class="inline-block animate-spin mr-2">⏳</span> Cargando tus clases académicas...
    </div>

    <div v-else-if="classes.length === 0" class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-2">
      <p class="font-bold text-base-texto-primario">No tienes clases creadas aún.</p>
      <p class="text-base-texto-secundario">Crea una nueva clase para generar un código que tus estudiantes usarán al registrarse.</p>
      <button
        @click="openCreateModal"
        class="mt-2 px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors inline-block">
        + Crear mi primera clase
      </button>
    </div>

    <!-- Lista de Clases a Cargo -->
    <section v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="cls in classes"
        :key="cls.id"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4 hover:border-acento-ambar-fuerte transition-colors">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[11px] font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-acento-ambar/15 text-acento-ambar-fuerte border border-acento-ambar/30">
                {{ cls.code }}
              </span>
              <button
                @click="copyCode(cls.code)"
                class="text-[10px] text-base-texto-secundario hover:text-acento-ambar-fuerte underline cursor-pointer">
                {{ copiedCode === cls.code ? '¡Copiado! ✔' : 'Copiar código' }}
              </button>
            </div>
            <h2 class="text-sm font-bold text-base-texto-primario mt-0.5">
              {{ cls.name }}
            </h2>
            <p v-if="cls.description" class="text-xs text-base-texto-secundario mt-1 line-clamp-2">
              {{ cls.description }}
            </p>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa flex-shrink-0">
            Activo
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center p-3 bg-base-bg-secundario rounded-lg text-xs">
          <div>
            <span class="text-base-texto-secundario text-[10px] block">Código de Ingreso</span>
            <span class="font-mono font-bold text-acento-ambar-fuerte text-xs">{{ cls.code }}</span>
          </div>
          <div>
            <span class="text-base-texto-secundario text-[10px] block">Estado</span>
            <span class="font-bold text-semantico-pasa">{{ cls.isActive ? 'Habilitada' : 'Inactiva' }}</span>
          </div>
          <div>
            <span class="text-base-texto-secundario text-[10px] block">Matrícula</span>
            <span class="font-bold text-base-texto-primario">{{ cls.requiresApproval ? 'Con Aprobación' : 'Directa' }}</span>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="flex items-center justify-between pt-2 border-t border-base-borde-sutil text-xs">
          <span class="text-base-texto-secundario text-[11px]">
            Comparte el código con tus alumnos
          </span>

          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/docente/clase/${cls.id}`"
              class="borde-afordancia px-3 py-1.5 rounded-md font-semibold text-base-texto-primario hover:bg-base-bg-secundario text-xs flex items-center gap-1">
              <span>👥</span>
              <span>Matrícula</span>
            </NuxtLink>

            <NuxtLink
              :to="`/docente/rendimiento?classId=${cls.id}`"
              class="borde-afordancia px-3 py-1.5 rounded-md font-semibold text-acento-ambar-fuerte hover:bg-acento-ambar/10 text-xs flex items-center gap-1">
              <span>📊</span>
              <span>Rendimiento</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Sección plegable: Tutor IA de esta clase (§20.1) -->
        <details class="border-t border-base-borde-sutil pt-3">
          <summary class="text-[11px] font-semibold text-base-texto-secundario cursor-pointer hover:text-base-texto-primario select-none flex items-center gap-1.5">
            <span aria-hidden="true">🤖</span> Tutor IA de esta clase
          </summary>
          <div class="mt-3">
            <DocenteTutorSettingsPanel scope-type="class" :scope-id="cls.id" />
          </div>
        </details>
      </div>
    </section>


    <!-- Modal Formulario: Crear Nueva Clase (FE-02) -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-base-texto-primario/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 max-w-md w-full shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil">
          <h3 class="text-sm font-bold text-base-texto-primario flex items-center gap-2">
            <span>🏫</span>
            <span>Crear Nueva Clase Académica</span>
          </h3>
          <button
            @click="isModalOpen = false"
            class="text-base-texto-secundario hover:text-base-texto-primario text-sm font-bold">
            ✕
          </button>
        </div>

        <form @submit.prevent="submitCreateClass" class="space-y-4 text-xs">
          <div>
            <label for="new-class-name" class="block font-semibold text-base-texto-primario mb-1">
              Nombre de la Asignatura / Clase *
            </label>
            <input
              id="new-class-name"
              v-model="newClass.name"
              type="text"
              required
              placeholder="Ej: Algoritmos y Lógica de Programación"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="new-class-code" class="font-semibold text-base-texto-primario">
                Código de Clase Único *
              </label>
              <button
                type="button"
                @click="generateRandomCode"
                class="text-[11px] text-acento-ambar-fuerte hover:underline focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded">
                Generar código sugerido
              </button>
            </div>
            <input
              id="new-class-code"
              v-model="newClass.code"
              type="text"
              required
              placeholder="Ej: ALGO-2026-1"
              class="w-full px-3 py-2 font-mono uppercase rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
            <p class="text-[10px] text-base-texto-secundario mt-0.5">
              Los estudiantes ingresarán este código al matricularse.
            </p>
          </div>

          <div>
            <label for="new-class-desc" class="block font-semibold text-base-texto-primario mb-1">
              Descripción o Competencias
            </label>
            <textarea
              id="new-class-desc"
              v-model="newClass.description"
              rows="2"
              placeholder="Objetivos de aprendizaje del curso..."
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none resize-none focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
          </div>

          <div class="p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil flex items-center justify-between">
            <div>
              <span class="font-semibold text-base-texto-primario block">Requiere Aprobación</span>
              <span class="text-[11px] text-base-texto-secundario">El docente debe aceptar manualmente cada ingreso.</span>
            </div>
            <input
              type="checkbox"
              v-model="newClass.requiresApproval"
              class="accent-acento-ambar-fuerte w-4 h-4 cursor-pointer" />
          </div>

          <div v-if="errorMessage" class="p-2 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded text-xs">
            {{ errorMessage }}
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-borde-sutil">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-3 py-1.5 rounded-md borde-afordancia text-base-texto-primario font-semibold text-xs hover:bg-base-bg-secundario">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-1">
              <span v-if="isSubmitting" class="animate-spin">⚙️</span>
              <span>{{ isSubmitting ? 'Guardando...' : 'Crear Clase' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'teacher'
})

interface TeacherClass {
  id: number
  code: string
  name: string
  description?: string
  isActive: boolean
  requiresApproval?: boolean
}

const api = useApi()
const classes = ref<TeacherClass[]>([])
const isLoading = ref(false)
const copiedCode = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Estado del modal de creación (FE-02)
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const newClass = reactive({
  name: '',
  code: '',
  description: '',
  requiresApproval: false
})

function openCreateModal() {
  newClass.name = ''
  newClass.description = ''
  newClass.requiresApproval = false
  generateRandomCode()
  errorMessage.value = null
  isModalOpen.value = true
}

function generateRandomCode() {
  const randNum = Math.floor(100 + Math.random() * 900)
  newClass.code = `ALGO-WEB-${randNum}`
}

async function submitCreateClass() {
  if (!newClass.name.trim() || !newClass.code.trim()) {
    errorMessage.value = 'El nombre y el código de la clase son obligatorios.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const res = await api.post<TeacherClass>('/class', {
      name: newClass.name.trim(),
      code: newClass.code.trim().toUpperCase(),
      description: newClass.description.trim() || undefined,
      requiresApproval: newClass.requiresApproval
    })

    if (res && res.id) {
      isModalOpen.value = false
      successMessage.value = `Clase "${res.name}" creada exitosamente con código ${res.code}.`
      await fetchClasses()
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Error al crear la clase'
    errorMessage.value = Array.isArray(msg) ? msg.join(', ') : msg
  } finally {
    isSubmitting.value = false
  }
}

async function fetchClasses() {
  isLoading.value = true
  try {
    const res = await api.get<TeacherClass[]>('/class/my-classes')
    if (Array.isArray(res)) {
      classes.value = res
    }
  } catch (err: any) {
    console.error('[STIRE Docente] Error al cargar clases:', err)
  } finally {
    isLoading.value = false
  }
}

function copyCode(code: string) {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(code)
    copiedCode.value = code
    setTimeout(() => {
      if (copiedCode.value === code) copiedCode.value = null
    }, 2500)
  }
}

onMounted(() => {
  fetchClasses()
})
</script>
