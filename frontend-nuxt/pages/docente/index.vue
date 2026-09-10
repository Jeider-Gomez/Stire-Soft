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
        class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors shadow-sm self-start sm:self-auto">
        + Crear Nueva Clase
      </button>
    </header>

    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <span class="inline-block animate-spin mr-2">⏳</span> Cargando tus clases académicas...
    </div>

    <div v-else-if="classes.length === 0" class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-2">
      <p class="font-bold text-base-texto-primario">No tienes clases creadas aún.</p>
      <p class="text-base-texto-secundario">Crea una nueva clase para generar un código que tus estudiantes usarán al registrarse.</p>
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
            <span class="text-base-texto-secundario text-[10px] block">Tipo</span>
            <span class="font-bold text-base-texto-primario">Semestral</span>
          </div>
        </div>

        <!-- Acciones Rápidas -->
        <div class="flex items-center justify-between pt-2 border-t border-base-borde-sutil text-xs">
          <span class="text-base-texto-secundario text-[11px]">
            Comparte el código con tus alumnos
          </span>

          <button
            @click="copyCode(cls.code)"
            class="borde-afordancia px-3 py-1.5 rounded-md font-semibold text-base-texto-primario hover:bg-base-bg-secundario text-xs flex items-center gap-1">
            <span>📋</span>
            <span>{{ copiedCode === cls.code ? 'Copiado' : 'Copiar Código' }}</span>
          </button>
        </div>
      </div>
    </section>
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
}

const api = useApi()
const classes = ref<TeacherClass[]>([])
const isLoading = ref(false)
const copiedCode = ref<string | null>(null)

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
