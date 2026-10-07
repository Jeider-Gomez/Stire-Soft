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
          <button class="px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-pasa hover:bg-semantico-pasa/10" @click="change(enrollment, 'approve')">Aprobar</button>
          <button class="min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-falla hover:bg-semantico-falla/10" @click="change(enrollment, 'reject')">Rechazar</button>
        </div>
      </div>
    </section>

    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-3">
      <h2 class="text-sm font-bold text-base-texto-primario">Estudiantes en la clase ({{ active.length }})</h2>
      <p v-if="active.length === 0" class="text-xs text-base-texto-secundario">Todavía no hay estudiantes. Comparte el código de la clase.</p>
      <div v-for="enrollment in active" :key="enrollment.id" class="flex items-center justify-between gap-3 border-b border-base-borde-sutil py-3">
        <span class="text-xs min-w-0 truncate inline-flex items-center gap-2"><AvatarUsuario :nombre="enrollment.student?.fullName" :foto-id="enrollment.student?.fotoId" decorativo /><span class="truncate">{{ enrollment.student?.fullName || enrollment.student?.email || 'Estudiante' }}</span></span>
        <button class="min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-md text-xs font-semibold text-semantico-falla hover:bg-semantico-falla/10 shrink-0 inline-flex items-center gap-1.5" @click="confirmarQuitarEstudiante(enrollment)" :aria-label="`Quitar de la clase a ${enrollment.student?.fullName || 'este estudiante'}`">
          <Trash2 :size="13" aria-hidden="true" />
          Quitar de la clase
        </button>
      </div>
    </section>

    <!-- Cómo se entra a la clase -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4">
      <h2 class="text-sm font-bold text-base-texto-primario">Matrícula</h2>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil">
        <div>
          <p class="text-xs font-semibold text-base-texto-primario">Exigir aprobación para matricularse</p>
          <p class="text-[11px] text-slate-600 mt-0.5">
            Si está activo, un estudiante que ingrese el código queda en «pendiente» hasta que lo apruebes aquí.
          </p>
        </div>
        <button
          @click="toggleRequiresApproval"
          :disabled="isSavingApproval"
          :aria-pressed="!!classInfo?.requiresApproval"
          class="min-h-[44px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex-shrink-0 self-start sm:self-auto inline-flex items-center gap-1"
          :class="classInfo?.requiresApproval
            ? 'bg-semantico-pasa/15 text-semantico-pasa'
            : 'bg-base-borde-sutil text-slate-700'"
        >
          <Check v-if="classInfo?.requiresApproval" :size="12" aria-hidden="true" />
          {{ classInfo?.requiresApproval ? 'Activado' : 'Desactivado' }}
        </button>
      </div>
    </section>

    <!-- Cada sección con su lógica (PAT-04: antes las ocho vivían en esta página, con 604 líneas) -->
    <DocenteAjustesSeccionAvance :ajustes="ajustes" />
    <DocenteAjustesSeccionLogros :ajustes="ajustes" />
    <DocenteAjustesSeccionCompartir :ajustes="ajustes" />
    <DocenteAjustesSeccionDatos :ajustes="ajustes" />
    <DocenteAjustesSeccionGestion :ajustes="ajustes" :class-id="classId" />

    <!-- Diálogo: Confirmar quitar estudiante -->
    <AdminDialogo
      v-if="estudianteAQuitar"
      id-titulo="quitar-estudiante-titulo"
      titulo="¿Quitar estudiante de la clase?"
      :subtitulo="estudianteAQuitar.student?.fullName || estudianteAQuitar.student?.email || 'Estudiante'"
      id-descripcion="quitar-estudiante-desc"
      clase-icono="bg-semantico-falla/10 text-semantico-falla"
      :ocupado="procesandoQuitar"
      @cerrar="estudianteAQuitar = null">
      <template #icono><Trash2 :size="18" aria-hidden="true" /></template>
      <p id="quitar-estudiante-desc" class="text-xs text-slate-700">
        El estudiante perderá el acceso a las actividades y contenidos de esta clase. Podrá solicitar matricularse nuevamente si le compartes el código de ingreso.
      </p>
      <p v-if="errorQuitarEstudiante" role="alert" class="text-semantico-falla text-[11px]">{{ errorQuitarEstudiante }}</p>
      <div class="flex items-center justify-end gap-2">
        <button type="button" data-foco-inicial class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" :disabled="procesandoQuitar" @click="estudianteAQuitar = null">Cancelar</button>
        <button type="button" :disabled="procesandoQuitar" class="min-h-[44px] px-5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2" @click="ejecutarQuitarEstudiante">
          <Loader2 v-if="procesandoQuitar" :size="14" class="animate-spin" aria-hidden="true" />
          {{ procesandoQuitar ? 'Quitando…' : 'Sí, quitar de la clase' }}
        </button>
      </div>
    </AdminDialogo>
  </div>
</template>

<script setup lang="ts">
import { Check, Loader2, Trash2 } from 'lucide-vue-next'
import { useAjustesClase, type EnrollmentItem } from '~/composables/useAjustesClase'

/**
 * Ajustes de la clase: organiza. Aquí quedan quién está en la clase y cómo se entra (comparten la ventana de «Quitar»);
 * avance, logros, compartir, datos y gestión son componentes en components/docente/ajustes/.
 */
definePageMeta({ layout: 'teacher' })

const route = useRoute()
const classId = Number(route.params.classId)
const { messageOf } = useApiErrorMessage()
const { avisar } = useAvisos()

const ajustes = useAjustesClase(classId)
const { pending, active, classInfo } = ajustes

const estudianteAQuitar = ref<EnrollmentItem | null>(null)
const procesandoQuitar = ref(false)
const errorQuitarEstudiante = ref<string | null>(null)
const isSavingApproval = ref(false)

// Los errores de aprobar o rechazar van en un aviso: antes se guardaban en el mensaje de «Datos de la clase», lejos del
// botón que falló.
async function change(enrollment: EnrollmentItem, action: 'approve' | 'reject') {
  try {
    await ajustes.cambiarMatricula(enrollment, action)
  } catch (err: unknown) {
    avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo procesar la solicitud.') })
  }
}

function confirmarQuitarEstudiante(enrollment: EnrollmentItem) {
  errorQuitarEstudiante.value = null
  estudianteAQuitar.value = enrollment
}

async function ejecutarQuitarEstudiante() {
  if (!estudianteAQuitar.value) return
  procesandoQuitar.value = true
  errorQuitarEstudiante.value = null
  try {
    await ajustes.quitarEstudiante(estudianteAQuitar.value)
    estudianteAQuitar.value = null
  } catch (err: unknown) {
    errorQuitarEstudiante.value = messageOf(err, 'No se pudo quitar al estudiante.')
  } finally {
    procesandoQuitar.value = false
  }
}

async function toggleRequiresApproval() {
  if (!classInfo.value) return
  isSavingApproval.value = true
  try {
    await ajustes.toggleRequiresApproval()
  } finally {
    isSavingApproval.value = false
  }
}

onMounted(() => { void ajustes.load() })
</script>
