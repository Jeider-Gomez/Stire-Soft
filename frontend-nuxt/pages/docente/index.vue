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
              Panel docente
            </span>
          </div>
          <h1 class="text-2xl font-poppins font-bold text-slate-800 tracking-tight">
            Mis clases
          </h1>
          <p class="text-xs text-slate-500 mt-1">
            Universidad de Córdoba · Sistema de Tutoría Inteligente
            <span class="text-stire-blue font-semibold">STIRE</span>
          </p>
        </div>

        <button
          id="abrir-crear-clase"
          @click="openCreateModal"
          class="btn-stire-primary self-start sm:self-auto min-h-[44px]"
        >
          <Plus :size="15" />
          Crear nueva clase
        </button>
      </div>
    </header>

    <!-- Encuesta de usabilidad SUS (UX-08): solo si lleva unos días usando STIRE y no la ha respondido -->
    <InvitacionEncuesta ruta="/docente/encuesta" />

    <!-- ═══════════════════════════════════════════════════════
         BARRA DE MÉTRICAS (4 TARJETAS)
    ═══════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- 1. Total de estudiantes -->
      <Transition appear enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div class="metric-card">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2 rounded-xl bg-stire-blue/10">
              <Users :size="18" class="text-stire-blue" />
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stire-success/15 text-emerald-700 flex items-center gap-1">
              <span class="pulse-dot" />
              Activos
            </span>
          </div>
          <p class="text-2xl font-poppins font-bold text-slate-800">{{ totalStudents }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Total de estudiantes</p>
          <p class="text-[11px] text-slate-500 mt-1">En {{ classes.length }} grupo{{ classes.length !== 1 ? 's' : '' }} habilitado{{ classes.length !== 1 ? 's' : '' }}</p>
        </div>
      </Transition>

      <!-- 2. Dominio promedio -->
      <Transition appear enter-active-class="transition duration-300 ease-out delay-75"
        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <div class="metric-card">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2 rounded-xl bg-stire-teal/10">
              <TrendingUp :size="18" class="text-teal-700" />
            </div>
          </div>
          <p class="text-2xl font-poppins font-bold text-slate-800">{{ porcentaje(avgMastery) }}</p>
          <!-- Micro barra de progreso -->
          <div class="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-stire-teal transition-all duration-700"
              :style="{ width: `${avgMastery}%` }"
            />
          </div>
          <p class="text-xs text-slate-500 mt-1.5">Dominio promedio</p>
        </div>
      </Transition>

      <!-- 3. Mensajes sin leer (dato real; antes era un "92 % adopción del Tutor" inventado) -->
      <Transition appear enter-active-class="transition duration-300 ease-out delay-150"
        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <NuxtLink to="/docente/mensajes" class="metric-card block hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2 rounded-xl bg-stire-purple/10">
              <Mail :size="18" class="text-stire-purple" />
            </div>
          </div>
          <p class="text-2xl font-poppins font-bold text-stire-purple">{{ unreadMessages ?? '—' }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Mensajes sin leer</p>
          <p class="text-[11px] text-slate-500 mt-1">De tus estudiantes</p>
        </NuxtLink>
      </Transition>

      <!-- 4. Alumnos en rezago -->
      <Transition appear enter-active-class="transition duration-300 ease-out delay-200"
        enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
        <!-- En ámbar solo cuando hay alguien en rezago: una tarjeta en alarma con «0» enseña a ignorar las alarmas. -->
        <div class="metric-card" :class="atRiskCount > 0 ? 'ring-2 ring-stire-warning/60' : ''">
          <div class="flex items-start justify-between mb-3">
            <div class="p-2 rounded-xl bg-stire-warning/10">
              <AlertTriangle :size="18" class="text-amber-700" />
            </div>
            <button
              v-if="atRiskCount > 0"
              class="text-[11px] font-bold px-2 py-0.5 min-h-[44px] rounded-full bg-stire-warning/15 text-amber-800
                     hover:bg-stire-warning/25 transition-colors whitespace-nowrap"
              title="Ver quiénes están en rezago"
              @click="navigateTo('/docente/rendimiento')"
            >
              Ver quiénes →
            </button>
          </div>
          <p class="text-2xl font-poppins font-bold" :class="atRiskCount > 0 ? 'text-amber-700' : 'text-slate-800'">{{ atRiskCount }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Alumnos en rezago</p>
          <p class="text-[11px] text-slate-500 mt-1">Dominio &lt; 50 %</p>
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
        class="p-3.5 bg-stire-success/10 border border-stire-success/30 text-emerald-700 rounded-xl text-xs flex items-center justify-between gap-3"
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
      class="p-14 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200"
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
        <p class="text-sm text-slate-500 mt-1">Crea tu primera clase y comparte el código con tus estudiantes.</p>
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
        <Search :size="12" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" aria-hidden="true" />
      </div>
      <p class="text-xs text-slate-500 whitespace-nowrap">
        Mostrando {{ filteredClasses.length }} de {{ classes.length }} clase{{ classes.length !== 1 ? 's' : '' }}
      </p>
    </div>
    <!-- Filtro por programa: solo si enseña en más de uno -->
    <div v-if="!isLoading && programasDelDocente.length > 1" role="group" aria-label="Filtrar por programa" class="flex flex-wrap gap-2 text-xs">
      <button v-for="p in [{ id: null, nombre: 'Todos los programas' }, ...programasDelDocente]" :key="p.id ?? 'todos'" type="button"
        class="min-h-[44px] px-3 rounded-full border"
        :class="programaFiltro === p.id ? 'border-acento-ambar-fuerte bg-acento-ambar/10 font-semibold' : 'border-base-borde-fuerte'"
        :aria-pressed="programaFiltro === p.id" @click="programaFiltro = p.id">
        {{ p.nombre }}
      </button>
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
                  class="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 min-h-[44px] rounded-lg
                         border border-slate-200 text-slate-500 hover:border-stire-teal/50
                         hover:text-teal-700 hover:bg-stire-teal/5
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
                    <Check v-if="copiedCode === cls.code" :size="12" class="text-emerald-700" key="check" />
                    <Copy v-else :size="12" key="copy" />
                  </Transition>
                  <span>{{ copiedCode === cls.code ? 'Copiado' : 'Copiar' }}</span>
                </button>

                <!-- QR proyector -->
                <button
                  @click="openQrModal(cls)"
                  class="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 min-h-[44px] rounded-lg
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
              <p v-if="cls.asignatura || cls.grupo || cls.periodo" class="text-xs text-slate-600 mt-0.5">
                <template v-if="cls.asignatura">{{ cls.asignatura.nombre }} · {{ lugarDeAsignatura(cls.asignatura) }}</template>
                <template v-if="cls.grupo || cls.periodo">{{ cls.asignatura ? ' · ' : '' }}{{ [cls.grupo, cls.periodo].filter(Boolean).join(' · ') }}</template>
              </p>
              <p v-if="cls.description" class="text-xs text-slate-500 mt-1 line-clamp-2">
                {{ cls.description }}
              </p>
            </div>

            <!-- Badge Activo -->
            <span class="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full
                         bg-stire-success/10 text-emerald-700 text-[11px] font-bold border border-stire-success/25">
              <span class="pulse-dot" />
              Activo
            </span>
          </div>

          <!-- Cómo entran los estudiantes (el código ya está arriba, con Copiar y QR) -->
          <p class="text-xs text-slate-500 mb-5">
            Matrícula {{ cls.requiresApproval ? 'con aprobación: apruebas a cada estudiante en «Matrícula».' : 'directa: entra quien tenga el código.' }}
          </p>

          <!-- ─── ZONA DE ACCIONES (espaciosa) ─── -->
          <div class="flex flex-wrap gap-2.5 pt-4 border-t border-slate-100">

            <!-- Matrícula -->
            <NuxtLink
              :to="`/docente/clase/${cls.id}/ajustes`"
              class="btn-stire-secondary min-h-[44px]"
            >
              <Users :size="14" />
              <!-- Antes «Matrícula 4»: no se sabía si el 4 era un número o una acción. -->
              <span>{{ cls.enrollmentCount ? `${cls.enrollmentCount} ${cls.enrollmentCount === 1 ? 'estudiante' : 'estudiantes'}` : 'Estudiantes' }}</span>
            </NuxtLink>

            <!-- Rendimiento -->
            <NuxtLink
              :to="`/docente/rendimiento?classId=${cls.id}`"
              class="btn-stire-secondary min-h-[44px]"
            >
              <TrendingUp :size="14" />
              <span>Dominio del grupo</span>
              <span
                v-if="cls.avgMastery !== undefined"
                class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                :class="cls.avgMastery >= 70 ? 'bg-stire-success/10 text-emerald-700' : 'bg-stire-warning/10 text-amber-700'"
              >
                {{ porcentaje(cls.avgMastery) }}
              </span>
            </NuxtLink>

            <!-- Contenidos -->
            <NuxtLink
              :to="`/docente/contenidos?classId=${cls.id}`"
              class="btn-stire-secondary min-h-[44px]"
            >
              <BookOpen :size="14" />
              <span>Contenidos</span>
            </NuxtLink>

            <!-- Spacer -->
            <div class="flex-1" />

            <!-- La clase como lugar: «Hoy», con las pestañas de la clase (utils/pestanasClase.ts) -->
            <NuxtLink
              :to="`/docente/clase/${cls.id}`"
              class="btn-stire-teal !bg-teal-700 hover:!bg-teal-800 min-h-[44px]"
            >
              <UserCheck :size="14" />
              <span>Ver hoy en la clase</span>
            </NuxtLink>
          </div>
        </div>
      </TransitionGroup>
      <!-- Periodos anteriores, plegados: no estorban, pero siguen a un clic -->
      <button v-if="organizacion.anteriores > 0" type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" :aria-expanded="verAnteriores" @click="verAnteriores = true">
        Ver {{ organizacion.anteriores === 1 ? 'la clase' : `las ${organizacion.anteriores} clases` }} de periodos anteriores
      </button>
      <button v-else-if="verAnteriores" type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" :aria-expanded="true" @click="verAnteriores = false">
        Ocultar periodos anteriores
      </button>
    </section>

    <!-- Ventanas: crear una clase y mostrar su QR (components/docente/), sobre la base de ventanas común. -->
    <DocenteVentanaCrearClase v-if="creando" @cerrar="creando = false" @creada="alCrear" />
    <DocenteVentanaQrClase v-if="qr" :codigo="qr.codigo" :nombre="qr.nombre" @cerrar="qr = null" />

  </div>
</template>

<script setup lang="ts">
// Inicio del docente: sus clases organizadas por periodo y programa, las cifras de todas y el acceso a cada una. Los datos
// y la API están en composables/useClasesDocente.ts; crear una clase y el QR, en sus ventanas (PAT-01 y PAT-04; antes
// 826 líneas con las dos ventanas dentro).
import { computed, onMounted, provide, ref } from 'vue'
import { porcentaje } from '~/utils/porcentaje'
import { lugarDeAsignatura } from '~/utils/contextoAcademico'
import { organizarClases, programasDeLasClases } from '~/utils/organizarClases'
import { AlertTriangle, BookOpen, Check, Copy, Mail, Plus, QrCode, Search, TrendingUp, UserCheck, Users } from 'lucide-vue-next'
import { CLAVE_CLASES_DOCENTE, useClasesDocente, type ClaseDelDocente } from '~/composables/useClasesDocente'

definePageMeta({ layout: 'teacher' })

const estado = useClasesDocente()
provide(CLAVE_CLASES_DOCENTE, estado)
const { clases: classes, cargando: isLoading, noLeidos: unreadMessages, totalEstudiantes: totalStudents, dominioPromedio: avgMastery, enRezago: atRiskCount } = estado

const successMessage = ref<string | null>(null)
const copiedCode = ref<string | null>(null)
const searchQuery = ref('')

// Cuando pasan los semestres (utils/organizarClases.ts): el periodo vigente a la vista, los anteriores plegados y un
// filtro por programa solo si enseña en más de uno. Al buscar, se busca en todo.
const programaFiltro = ref<number | null>(null)
const verAnteriores = ref(false)
const programasDelDocente = computed(() => programasDeLasClases(classes.value))
const organizacion = computed(() => organizarClases(classes.value, { texto: searchQuery.value, programaId: programaFiltro.value, verAnteriores: verAnteriores.value }))
const filteredClasses = computed(() => organizacion.value.visibles)

// Ventanas
const creando = ref(false)
const qr = ref<{ codigo: string; nombre: string } | null>(null)
const openCreateModal = () => { creando.value = true }
const openQrModal = (cls: ClaseDelDocente) => { qr.value = { codigo: cls.code, nombre: cls.name } }
function alCrear(aviso: string) {
  creando.value = false
  successMessage.value = aviso
  setTimeout(() => { if (successMessage.value === aviso) successMessage.value = null }, aviso.includes('no se pudo copiar') ? 10000 : 5000)
}

function copyCode(code: string) {
  if (!navigator?.clipboard) return
  void navigator.clipboard.writeText(code)
  copiedCode.value = code
  setTimeout(() => { if (copiedCode.value === code) copiedCode.value = null }, 2500)
}

onMounted(() => {
  void estado.cargarPlantillas()
  void estado.cargarClases()
  void estado.cargarNoLeidos()
})
</script>
