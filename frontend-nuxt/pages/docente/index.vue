<template>
  <div class="max-w-5xl mx-auto space-y-7">

    <!-- ═══════════════════════════════════════════════════════
         CABECERA DOC-V01
    ═══════════════════════════════════════════════════════ -->
    <header class="bg-white rounded-2xl border border-slate-200 px-7 py-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase
                         bg-stire-blue/10 text-stire-blue border border-stire-blue/20">
              Panel Docente · DOC-V01
            </span>
          </div>
          <h1 class="text-2xl font-poppins font-bold text-slate-800 tracking-tight">
            Mis Clases y Grupos Asignados
          </h1>
          <p class="text-xs text-slate-400 mt-1">
            Universidad de Córdoba · Sistema de Tutoría Inteligente
            <span class="text-stire-blue font-semibold">STIRE</span>
          </p>
        </div>

        <button
          @click="openCreateModal"
          class="btn-stire-primary self-start sm:self-auto"
        >
          <Plus :size="15" />
          Crear Nueva Clase
        </button>
      </div>
    </header>

    <!-- ═══════════════════════════════════════════════════════
         BARRA DE MÉTRICAS (4 TARJETAS)
    ═══════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- 1. Total Estudiantes -->
      <Transition appear enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div class="metric-card">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2 rounded-xl bg-stire-blue/10">
              <Users :size="18" class="text-stire-blue" />
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stire-success/15 text-stire-success flex items-center gap-1">
              <span class="pulse-dot" />
              Activos
            </span>
          </div>
          <p class="text-2xl font-poppins font-bold text-slate-800">{{ totalStudents }}</p>
          <p class="text-xs text-slate-400 mt-0.5">Total Estudiantes</p>
          <p class="text-[11px] text-slate-500 mt-1">En {{ classes.length }} grupo{{ classes.length !== 1 ? 's' : '' }} habilitado{{ classes.length !== 1 ? 's' : '' }}</p>
        </div>
      </Transition>

      <!-- 2. Dominio Promedio -->
      <Transition appear enter-active-class="transition duration-300 ease-out delay-75"
        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div class="metric-card">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2 rounded-xl bg-stire-teal/10">
              <TrendingUp :size="18" class="text-stire-teal-dark" />
            </div>
            <span class="text-[10px] font-bold text-stire-teal-dark">Dominio</span>
          </div>
          <p class="text-2xl font-poppins font-bold text-slate-800">{{ avgMastery }}%</p>
          <!-- Micro barra de progreso -->
          <div class="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-stire-teal transition-all duration-700"
              :style="{ width: `${avgMastery}%` }"
            />
          </div>
          <p class="text-xs text-slate-400 mt-1.5">Dominio Promedio</p>
        </div>
      </Transition>

      <!-- 3. Tutor IA Interacciones -->
      <Transition appear enter-active-class="transition duration-300 ease-out delay-150"
        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div class="metric-card">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2 rounded-xl bg-stire-purple/10">
              <Sparkles :size="18" class="text-stire-purple" />
            </div>
            <span class="text-[10px] font-bold text-stire-purple">IA</span>
          </div>
          <p class="text-2xl font-poppins font-bold text-stire-purple">92%</p>
          <p class="text-xs text-slate-400 mt-0.5">Tutor IA · Adopción</p>
          <p class="text-[11px] text-slate-500 mt-1">Dudas resueltas automáticamente</p>
        </div>
      </Transition>

      <!-- 4. Alumnos en Rezago -->
      <Transition appear enter-active-class="transition duration-300 ease-out delay-200"
        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div class="metric-card border-l-4 border-stire-warning">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2 rounded-xl bg-stire-warning/10">
              <AlertTriangle :size="18" class="text-stire-warning" />
            </div>
            <button
              class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stire-warning/15 text-stire-warning
                     hover:bg-stire-warning/25 transition-colors whitespace-nowrap"
              title="Enviar material de refuerzo"
            >
              Refuerzo →
            </button>
          </div>
          <p class="text-2xl font-poppins font-bold text-stire-warning">{{ atRiskCount }}</p>
          <p class="text-xs text-slate-400 mt-0.5">Alumnos en Rezago</p>
          <p class="text-[11px] text-slate-500 mt-1">Dominio &lt; 60 %</p>
        </div>
      </Transition>
    </div>

    <!-- Notificación de éxito -->
    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="successMessage"
        class="p-3.5 bg-stire-success/10 border border-stire-success/30 text-stire-success rounded-xl text-xs flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2">
          <Check :size="14" />
          <span>{{ successMessage }}</span>
        </div>
        <button @click="successMessage = null" class="text-[11px] underline opacity-70 hover:opacity-100">Cerrar</button>
      </div>
    </Transition>

    <!-- Cargando -->
    <div
      v-if="isLoading"
      class="p-14 text-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-200"
    >
      <div class="inline-block w-6 h-6 border-2 border-stire-blue border-t-transparent rounded-full animate-spin mb-3" />
      <p>Cargando tus clases académicas…</p>
    </div>

    <!-- Sin clases -->
    <div
      v-else-if="classes.length === 0"
      class="p-14 text-center bg-white rounded-2xl border border-slate-200 space-y-4"
    >
      <div class="w-16 h-16 rounded-2xl gradient-stire flex items-center justify-center mx-auto shadow-md">
        <BookOpen :size="28" class="text-white" />
      </div>
      <div>
        <p class="font-poppins font-bold text-slate-800">Aún no tienes clases creadas</p>
        <p class="text-sm text-slate-400 mt-1">Crea tu primera clase y comparte el código con tus estudiantes.</p>
      </div>
      <button @click="openCreateModal" class="btn-stire-primary mx-auto">
        <Plus :size="15" />
        Crear mi primera clase
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         BUSCADOR + CONTADOR
    ═══════════════════════════════════════════════════════ -->
    <div v-else class="flex items-center gap-3">
      <div class="relative flex-1 max-w-xs">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar clase por código o nombre…"
          class="input-stire pl-9"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
      </div>
      <p class="text-xs text-slate-400 whitespace-nowrap">
        Mostrando {{ filteredClasses.length }} de {{ classes.length }} clase{{ classes.length !== 1 ? 's' : '' }}
      </p>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         TARJETAS DE CLASES
    ═══════════════════════════════════════════════════════ -->
    <section v-if="!isLoading && classes.length > 0" class="space-y-5">
      <TransitionGroup
        tag="div"
        class="space-y-5"
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="cls in filteredClasses"
          :key="cls.id"
          class="class-card"
        >
          <!-- ─── Encabezado de la tarjeta ─── -->
          <div class="flex items-start justify-between gap-3 mb-5">
            <div class="flex-1 min-w-0">
              <!-- Código + Copiar -->
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg
                             bg-stire-blue/10 text-stire-blue border border-stire-blue/20 tracking-wider">
                  {{ cls.code }}
                </span>

                <!-- Botón copiar con animación -->
                <button
                  @click="copyCode(cls.code)"
                  class="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg
                         border border-slate-200 text-slate-500 hover:border-stire-teal/50
                         hover:text-stire-teal-dark hover:bg-stire-teal/5
                         active:scale-95 transition-all duration-150 whitespace-nowrap"
                  :title="`Copiar código ${cls.code}`"
                >
                  <Transition mode="out-in"
                    enter-active-class="transition duration-150 ease-out"
                    enter-from-class="opacity-0 scale-75"
                    enter-to-class="opacity-100 scale-100"
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-75"
                  >
                    <Check v-if="copiedCode === cls.code" :size="12" class="text-stire-success" key="check" />
                    <Copy v-else :size="12" key="copy" />
                  </Transition>
                  <span>{{ copiedCode === cls.code ? 'Copiado' : 'Copiar' }}</span>
                </button>

                <!-- QR proyector -->
                <button
                  @click="openQrModal(cls)"
                  class="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg
                         border border-slate-200 text-slate-500 hover:border-stire-purple/50
                         hover:text-stire-purple hover:bg-stire-purple/5
                         active:scale-95 transition-all duration-150 whitespace-nowrap"
                  title="Proyectar código QR"
                >
                  <QrCode :size="12" />
                  <span>QR</span>
                </button>
              </div>

              <!-- Nombre + descripción -->
              <h2 class="text-lg font-poppins font-bold text-slate-800 tracking-tight">
                {{ cls.name }}
              </h2>
              <p v-if="cls.description" class="text-xs text-slate-400 mt-1 line-clamp-2">
                {{ cls.description }}
              </p>
            </div>

            <!-- Badge Activo -->
            <span class="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                         bg-stire-success/10 text-stire-success text-[11px] font-bold border border-stire-success/25">
              <span class="pulse-dot" />
              Activo
            </span>
          </div>

          <!-- ─── Fila de datos de la clase ─── -->
          <div class="grid grid-cols-3 gap-3 p-4 bg-stire-canvas rounded-xl border border-slate-100 mb-5">
            <div class="text-center">
              <p class="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Código de Ingreso</p>
              <p class="text-sm font-mono font-bold text-stire-blue">{{ cls.code }}</p>
            </div>
            <div class="text-center border-x border-slate-200">
              <p class="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Estado</p>
              <p class="text-sm font-semibold flex items-center justify-center gap-1.5">
                <Check :size="13" class="text-stire-success" />
                <span class="text-stire-success">Habilitada</span>
              </p>
            </div>
            <div class="text-center">
              <p class="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Matrícula</p>
              <p class="text-sm font-semibold text-slate-700">
                {{ cls.requiresApproval ? 'Con aprobación' : 'Directa' }}
              </p>
            </div>
          </div>

          <!-- ─── ZONA DE ACCIONES (espaciosa) ─── -->
          <div class="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100">

            <!-- Matrícula -->
            <NuxtLink
              :to="`/docente/clase/${cls.id}`"
              class="btn-stire-secondary"
            >
              <Users :size="14" />
              <span>Matrícula</span>
              <span
                v-if="cls.enrollmentCount"
                class="ml-1 px-1.5 py-0.5 rounded-full bg-stire-blue/10 text-stire-blue text-[10px] font-bold"
              >
                {{ cls.enrollmentCount }}
              </span>
            </NuxtLink>

            <!-- Rendimiento -->
            <NuxtLink
              :to="`/docente/rendimiento?classId=${cls.id}`"
              class="btn-stire-secondary"
            >
              <TrendingUp :size="14" />
              <span>Rendimiento</span>
              <span
                v-if="cls.avgMastery !== undefined"
                class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                :class="cls.avgMastery >= 70 ? 'bg-stire-success/10 text-stire-success' : 'bg-stire-warning/10 text-stire-warning'"
              >
                {{ cls.avgMastery }}%
              </span>
            </NuxtLink>

            <!-- Contenidos -->
            <NuxtLink
              to="/docente/contenidos"
              class="btn-stire-secondary"
            >
              <BookOpen :size="14" />
              <span>Contenidos</span>
            </NuxtLink>

            <!-- Spacer -->
            <div class="flex-1" />

            <!-- Ver detalle -->
            <NuxtLink
              :to="`/docente/clase/${cls.id}`"
              class="btn-stire-teal"
            >
              <UserCheck :size="14" />
              <span>Gestionar</span>
            </NuxtLink>
          </div>
        </div>
      </TransitionGroup>
    </section>

    <!-- ═══════════════════════════════════════════════════════
         MODAL: CREAR NUEVA CLASE
    ═══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isModalOpen"
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          @click.self="isModalOpen = false"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="isModalOpen"
              class="bg-white rounded-2xl border border-slate-200 p-7 max-w-md w-full shadow-2xl space-y-5"
            >
              <!-- Header modal -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 gradient-stire rounded-xl flex items-center justify-center">
                    <BookOpen :size="18" class="text-white" />
                  </div>
                  <div>
                    <h3 class="font-poppins font-bold text-slate-800">Crear Nueva Clase</h3>
                    <p class="text-[11px] text-slate-400">Universidad de Córdoba</p>
                  </div>
                </div>
                <button
                  @click="isModalOpen = false"
                  class="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <!-- Form -->
              <form @submit.prevent="submitCreateClass" class="space-y-4">
                <!-- Nombre -->
                <div>
                  <label for="new-class-name" class="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nombre de la Asignatura *
                  </label>
                  <input
                    id="new-class-name"
                    v-model="newClass.name"
                    type="text"
                    required
                    placeholder="Ej: Algoritmos y Lógica de Programación"
                    class="input-stire"
                  />
                </div>

                <!-- Código -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label for="new-class-code" class="text-xs font-semibold text-slate-700">
                      Código Único de Clase *
                    </label>
                    <button
                      type="button"
                      @click="generateRandomCode"
                      class="text-[11px] text-stire-blue hover:underline font-medium transition-colors"
                    >
                      Generar sugerido
                    </button>
                  </div>
                  <input
                    id="new-class-code"
                    v-model="newClass.code"
                    type="text"
                    required
                    placeholder="Ej: ALGO-2026-1"
                    class="input-stire font-mono uppercase"
                  />
                  <p class="text-[11px] text-slate-400 mt-1">Los estudiantes usarán este código al matricularse.</p>
                </div>

                <!-- Descripción -->
                <div>
                  <label for="new-class-desc" class="block text-xs font-semibold text-slate-700 mb-1.5">
                    Descripción / Competencias
                  </label>
                  <textarea
                    id="new-class-desc"
                    v-model="newClass.description"
                    rows="2"
                    placeholder="Objetivos de aprendizaje del curso..."
                    class="input-stire resize-none"
                  />
                </div>

                <!-- Toggle aprobación -->
                <div class="p-4 bg-stire-canvas rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <p class="text-xs font-semibold text-slate-800">Requiere Aprobación</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">El docente aprueba manualmente cada ingreso.</p>
                  </div>
                  <input
                    type="checkbox"
                    v-model="newClass.requiresApproval"
                    class="w-4 h-4 rounded cursor-pointer accent-stire-blue"
                  />
                </div>

                <!-- Error -->
                <div
                  v-if="errorMessage"
                  class="p-3 bg-stire-danger/10 border border-stire-danger/25 text-stire-danger rounded-xl text-xs"
                >
                  {{ errorMessage }}
                </div>

                <!-- Acciones -->
                <div class="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    @click="isModalOpen = false"
                    class="btn-stire-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="btn-stire-primary disabled:opacity-50"
                  >
                    <span v-if="isSubmitting" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <Plus v-else :size="14" />
                    {{ isSubmitting ? 'Guardando…' : 'Crear Clase' }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══════════════════════════════════════════════════════
         MODAL: QR PROYECTOR
    ═══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="qrModal.open"
          class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          @click.self="qrModal.open = false"
        >
          <div class="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl space-y-6">
            <div>
              <h3 class="font-poppins font-bold text-xl text-slate-800">Código de Clase</h3>
              <p class="text-sm text-slate-400 mt-1">{{ qrModal.className }}</p>
            </div>
            <div class="flex items-center justify-center">
              <canvas ref="qrCanvas" class="rounded-2xl shadow-lg" />
            </div>
            <div class="p-4 bg-stire-canvas rounded-2xl">
              <p class="text-xs text-slate-400 mb-1">Código de acceso</p>
              <p class="text-3xl font-mono font-bold text-stire-blue tracking-widest">{{ qrModal.code }}</p>
            </div>
            <button
              @click="qrModal.open = false"
              class="btn-stire-secondary w-full justify-center"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import {
  Plus, Users, TrendingUp, BookOpen, AlertTriangle,
  Sparkles, Check, Copy, QrCode, UserCheck
} from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'teacher' })

interface TeacherClass {
  id: number
  code: string
  name: string
  description?: string
  isActive: boolean
  requiresApproval?: boolean
  enrollmentCount?: number
  avgMastery?: number
  atRiskCount?: number
}

const api = useApi()
const classes = ref<TeacherClass[]>([])
const isLoading = ref(false)
const copiedCode = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const searchQuery = ref('')

// Modal crear clase
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const newClass = reactive({
  name: '',
  code: '',
  description: '',
  requiresApproval: false
})

// Modal QR
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const qrModal = reactive({ open: false, code: '', className: '' })

// Métricas derivadas
const totalStudents = computed(() =>
  classes.value.reduce((acc, c) => acc + (c.enrollmentCount ?? 0), 0)
)
const avgMastery = computed(() => {
  const withMastery = classes.value.filter(c => c.avgMastery !== undefined)
  if (!withMastery.length) return 0
  return Math.round(withMastery.reduce((acc, c) => acc + (c.avgMastery ?? 0), 0) / withMastery.length)
})
const atRiskCount = computed(() =>
  classes.value.reduce((acc, c) => acc + (c.atRiskCount ?? 0), 0)
)

// Búsqueda
const filteredClasses = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return classes.value
  return classes.value.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  )
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
      successMessage.value = `Clase "${res.name}" creada con código ${res.code}.`
      setTimeout(() => { successMessage.value = null }, 4000)
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
    if (Array.isArray(res)) classes.value = res
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

async function openQrModal(cls: TeacherClass) {
  qrModal.code = cls.code
  qrModal.className = cls.name
  qrModal.open = true
  await nextTick()
  if (qrCanvas.value) {
    try {
      const QRCode = await import('qrcode')
      await QRCode.toCanvas(qrCanvas.value, cls.code, {
        width: 220,
        margin: 2,
        color: { dark: '#0B3D91', light: '#FFFFFF' }
      })
    } catch {
      // qrcode not available — silently ignore
    }
  }
}

onMounted(fetchClasses)
</script>
