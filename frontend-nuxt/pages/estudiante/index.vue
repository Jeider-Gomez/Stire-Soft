<template>
  <!-- Inicio del estudiante v3 (Fase D, paso 1; cuadros «E-Inicio», «E-Inicio-Oscuro» y «E-Cel-Inicio»): el siguiente paso
       con la mascota, el camino del módulo y tres tarjetas (de tu clase, te lo dejó el profe, tu semana sin rachas). El
       plan completo del curso está en «Aprender» (menú y barra del celular). Las piezas: components/estudiante/inicio/. -->
  <div class="flex flex-col gap-[18px]">
    <AvisoSolicitudRol :solicitud="myRoleRequest" @cerrar-sesion="authStore.logout()" />

    <!-- Sin clase: lo único que se puede hacer es unirse a una. -->
    <section v-if="!studentStore.isSyncing && studentStore.enrolledClasses.length === 0" class="heroe-inicio grid gap-5 sm:grid-cols-[120px_1fr] items-center">
      <span class="hidden sm:block" aria-hidden="true"><TutorMascota expresion="contento" :tamano="104" forma="completa" /></span>
      <div>
        <h1 class="m-0 font-poppins font-bold text-[24px] sm:text-[30px] leading-tight">¡Bienvenido a STIRE!</h1>
        <p class="mt-2 mb-4 text-[15px] sm:text-base font-medium leading-relaxed max-w-xl">
          Todavía no estás en ninguna clase. Escribe el código que te dio tu docente y empiezas con la primera lección.
        </p>
        <NuxtLink to="/estudiante/clases" class="boton-heroe boton-principal inline-flex">
          <KeyRound :size="16" aria-hidden="true" /> Unirme con el código de mi clase
        </NuxtLink>
      </div>
    </section>

    <template v-else>
      <EstudianteInicioSiguientePaso :ejercicio-id="recommendedExerciseId" :razon="recommendedReason" :mensaje="recommendedReasonMessage" />
      <EstudianteInicioCaminoModulo />

      <div class="grid gap-[18px] grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <EstudianteInicioDeTuClase :entregas="entregas" :mensajes="mensajes" />
        <EstudianteInicioTeLoDejoElProfe :refuerzos="refuerzos" />
        <EstudianteInicioTuSemana :datos="logros" />
      </div>

      <!-- Encuesta de usabilidad SUS (UX-08): solo si lleva unos días usando STIRE y no la ha respondido -->
      <InvitacionEncuesta ruta="/estudiante/encuesta" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { KeyRound } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { useAuthStore } from '~/stores/auth'
import { useInicioEstudiante, type EntregaInicioEstudiante, type RefuerzoInicioEstudiante, type SolicitudRolEstudiante } from '~/composables/useInicioEstudiante'
import type { EstadoEntrega } from '~/utils/entregas'
import type { RespuestaLogros } from '~/utils/logros'

definePageMeta({
  layout: 'student'
})

const studentStore = useStudentStore()
const authStore = useAuthStore()
const inicio = useInicioEstudiante()

// Estado de solicitud de rol docente del estudiante (§23 T4); si falla, el inicio sigue igual.
const myRoleRequest = ref<SolicitudRolEstudiante | null>(null)
const mensajes = ref(0)
const logros = ref<RespuestaLogros | null>(null)

onMounted(async () => {
  studentStore.fetchStudentData()
  inicio.solicitudRol().then((r) => { if (r?.request) myRoleRequest.value = r.request }).catch(() => undefined)
  inicio.mensajesSinLeer().then((n) => { mensajes.value = n }).catch(() => undefined)
  try {
    refuerzosTodos.value = await inicio.refuerzos()
  } catch {
    // Sin refuerzos o servidor sin esta función todavía: la tarjeta lo dice.
  }
})

// Logros y días de la semana (servidor: src/analytics). El logro nuevo se celebra una vez: después ya está visto.
watch(() => authStore.user?.id, async (id) => {
  if (!id) return
  try {
    logros.value = await inicio.logros(id)
    if (logros.value.nuevos.length) void inicio.marcarLogrosVistos().catch(() => undefined)
  } catch {
    logros.value = null
  }
}, { immediate: true })

// Ejercicio recomendado para «Tu siguiente paso»: el mismo motor de dominio (GET .../next-activity) que la lección.
const recommendedExerciseId = ref<number | null>(null)
const recommendedReason = ref<string | null>(null)
const recommendedReasonMessage = ref<string | null>(null)
watch(
  () => studentStore.activeUnit?.id,
  async (unitId) => {
    recommendedExerciseId.value = null
    recommendedReason.value = null
    recommendedReasonMessage.value = null
    const studentId = authStore.user?.id
    if (!unitId || !studentId) return
    try {
      const rec = await inicio.actividadRecomendada(studentId, unitId)
      recommendedExerciseId.value = rec?.activityId ?? null
      recommendedReason.value = rec?.reason ?? null
      recommendedReasonMessage.value = rec?.reasonMessage ?? null
    } catch (error: unknown) {
      console.warn('[STIRE Student] No se pudo cargar la actividad recomendada real, usando heurístico local:', error)
      recommendedExerciseId.value = studentStore.activeUnit?.exerciseActivityId ?? null
    }
  },
  { immediate: true }
)

// Refuerzos y retos sin terminar de la clase activa.
const refuerzosTodos = ref<RefuerzoInicioEstudiante[]>([])
const refuerzos = computed(() => refuerzosTodos.value.filter((r) => r.classId === studentStore.currentClassId && r.pasosHechos < r.totalPasos))

// Entregas de la clase activa: primero las que faltan por entregar, luego las que tienen revisión nueva.
const entregas = ref<EntregaInicioEstudiante[]>([])
const ORDEN_ESTADO: Record<EstadoEntrega, number> = { sin_entregar: 0, revisada: 1, por_revisar: 2 }
watch(
  () => studentStore.currentClassId,
  async (classId) => {
    entregas.value = []
    if (!classId) return
    try {
      const lista = await inicio.entregas(classId)
      entregas.value = [...lista].sort((a, b) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado])
    } catch {
      // Sin entregas o servidor sin esta función todavía: la tarjeta lo dice.
    }
  },
  { immediate: true },
)
</script>
