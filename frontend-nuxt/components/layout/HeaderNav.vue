<template>
  <!-- ===== HEADER INSTITUCIONAL STIRE ===== -->
  <header
    class="h-16 bg-base-blanco/80 glass-header border-b border-base-borde-sutil flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm"
  >
    <!-- ── IZQUIERDA: Isotipo + Logotipo + Contexto Institucional ── -->
    <div class="flex items-center gap-3 min-w-0">
      <!-- Botón colapsar sidebar (mobile) -->
      <button
        @click="$emit('toggle-sidebar')"
        class="p-2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors duration-150 flex-shrink-0 md:hidden"
        aria-label="Abrir menú lateral"
        title="Menú"
      >
        <Menu :size="18" aria-hidden="true" />
      </button>
      <!-- Logo: en computador va arriba de la barra lateral (SidebarNav.vue, 26/10); aquí solo en el celular, donde el
           menú es un cajón. En computador queda el lugar (institución, programa) como texto. -->
      <NuxtLink :to="homeRoute" class="md:hidden flex items-center flex-shrink-0 min-h-[44px]" aria-label="Ir al inicio">
        <LayoutLogo con-nombre />
      </NuxtLink>
      <!-- Buscar una lección (Ctrl+K), como la barra de búsqueda de Cursor: a la izquierda, donde se mira primero. -->
      <button v-if="authStore.currentRole === 'estudiante'" type="button"
        class="hidden md:inline-flex items-center gap-2 w-56 lg:w-64 min-h-[36px] px-3 rounded-lg border border-base-borde-sutil text-xs text-base-texto-secundario hover:border-base-borde-fuerte"
        @click="irALeccion = true">
        <Search :size="14" aria-hidden="true" /><span class="flex-1 text-left">Buscar una lección</span>
        <kbd class="text-[10px] border border-base-borde-sutil rounded px-1">Ctrl K</kbd>
      </button>

      <!-- Separador + Contexto de clase (solo estudiante) -->
      <div
        v-if="authStore.currentRole === 'estudiante' && studentStore.currentClassName"
        class="hidden lg:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 min-w-0"
      >
        <GraduationCap :size="13" class="text-slate-500 flex-shrink-0" />
        <span class="text-xs text-slate-600 font-medium truncate max-w-[220px]">
          {{ studentStore.currentClassLabel }}
        </span>
        <span class="text-slate-500">•</span>
        <span class="text-xs text-slate-500 truncate max-w-[260px]" :title="studentStore.currentTeacher">
          {{ (studentStore.currentAsignatura && lugarDeAsignatura(studentStore.currentAsignatura)) || studentStore.currentTeacher }}
        </span>
      </div>

      <!-- Contexto institucional del docente: sale de las asignaturas de sus clases (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md).
           Si ninguna la tiene, no se muestra nada: nunca un programa inventado. -->
      <div
        v-else-if="authStore.currentRole === 'docente' && contexto.texto.value"
        class="hidden lg:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200 text-xs text-slate-500"
      >
        <span>{{ contexto.texto.value }}</span>
      </div>
    </div>

    <!-- ── DERECHA: Badge de rol + Avatar + Salir ── -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- El Tutor se abre con el lanzador flotante de abajo a la derecha, igual en todas las pantallas
           (components/tutor/LanzadorTutor.vue; recomendación de José, «reubicar el acceso al Tutor»). -->
      <!-- El rol y el lugar pasaron al menú de la cuenta (27/10): la barra queda para lo que se usa. -->

      <!-- Menú de ayuda: el recorrido de esta pantalla, su tarea del manual, el manual y las sugerencias
           (components/layout/MenuAyuda.vue; S10-J04). -->
      <LayoutMenuAyuda />

      <!-- Apariencia y lectura a un clic desde cualquier pantalla (components/layout/BotonApariencia.vue) -->
      <LayoutBotonApariencia />

      <!-- Sugerencias: un problema, algo confuso o una idea (docs/calidad/PRUEBA_DOS_SEMANAS.md) -->
      <LayoutBotonSugerencias />

      <!-- Notificaciones -->
      <!-- Asistente STIRE (solo docente): propone estructura, lecciones y ejercicios según la pantalla (Ctrl+.) -->
      <button v-if="authStore.currentRole === 'docente'" id="abrir-asistente" type="button"
        class="hidden sm:inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full border border-base-borde-sutil text-xs font-semibold text-stire-blue hover:bg-stire-blue/5"
        :aria-expanded="asistenteAbierto" aria-controls="panel-asistente" title="Asistente STIRE (Ctrl+.)" @click="asistenteAbierto = !asistenteAbierto">
        <Sparkles :size="14" aria-hidden="true" /> Asistente
      </button>
      <LayoutNotificationBell />

      <!-- Separador -->
      <div class="w-px h-6 bg-slate-200 mx-1" />

      <!-- Avatar + menú usuario -->
      <div class="relative" ref="avatarMenuRef">
        <button
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2 p-1 min-h-[44px] rounded-xl hover:bg-slate-100 transition-colors duration-150 group"
          :aria-expanded="showUserMenu"
        >
          <!-- Sin aria-label: el nombre contiene lo que se ve, el primer nombre (WCAG 2.5.3, control por voz). -->
          <AvatarUsuario :nombre="authStore.user?.fullName" :foto-id="authStore.user?.fotoId" decorativo
            class="shadow-sm group-hover:shadow-md transition-shadow" />
          <span class="sr-only">Menú de la cuenta: </span>
          <span class="sr-only md:not-sr-only md:block text-xs font-medium text-slate-700 max-w-[120px] truncate">
            {{ primerNombre }}
          </span><span v-if="restoDelNombre" class="sr-only"> {{ restoDelNombre }}</span>
        </button>

        <!-- Dropdown de usuario -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="showUserMenu"
            class="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50"
          >
            <!-- Info usuario -->
            <div class="px-4 py-3 border-b border-slate-100">
              <p class="text-xs font-semibold text-slate-800">{{ authStore.user?.fullName }}</p>
              <p class="text-[11px] text-slate-500 mt-0.5">{{ authStore.user?.email }}</p>
              <p class="mt-2 flex flex-wrap items-center gap-1.5">
                <span :class="roleBadgeClass" class="inline-flex items-center">{{ roleLabel }}</span>
                <span class="text-[10px] text-slate-500 truncate">{{ subtitulo }}</span>
              </p>
            </div>

            <!-- Enlace Mi perfil -->
            <NuxtLink
              :to="`${homeRoute}/perfil`"
              @click="showUserMenu = false"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700
                     hover:bg-slate-50 transition-colors duration-150 font-medium"
            >
              <UserCircle :size="14" />
              <span>Mi perfil</span>
            </NuxtLink>

            <!-- Apariencia y lectura: tema oscuro, contraste y tamaño del texto (components/perfil/AparienciaLectura.vue) -->
            <NuxtLink
              :to="`${homeRoute}/perfil#apariencia`"
              @click="showUserMenu = false"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700
                     hover:bg-slate-50 transition-colors duration-150 font-medium"
            >
              <Contrast :size="14" />
              <span>Apariencia y lectura</span>
            </NuxtLink>

            <!-- Opción cerrar sesión -->
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-stire-danger
                     hover:bg-stire-danger/5 transition-colors duration-150 font-medium"
            >
              <LogOut :size="14" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, LogOut, GraduationCap, UserCircle, Contrast, Search, Sparkles } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { institucionCorta, lugarDeAsignatura, programaCorto } from '~/utils/contextoAcademico'

defineEmits(['toggle-sidebar'])
const asistenteAbierto = useState('asistente-abierto', () => false)
const irALeccion = useState('ir-a-leccion', () => false)

const authStore = useAuthStore()
const primerNombre = computed(() => authStore.user?.fullName?.split(' ')[0] || 'usuario')
const restoDelNombre = computed(() => authStore.user?.fullName?.split(' ').slice(1).join(' ') || '')
const studentStore = useStudentStore()
const contexto = useContextoDocente()
watch(() => authStore.currentRole, (rol) => { if (rol === 'docente') contexto.cargar() }, { immediate: true })

// Debajo del logo: la institución y el programa de la clase activa (estudiante) o de las clases (docente); si no hay datos,
// lo que STIRE es.
const subtitulo = computed(() => {
  if (authStore.currentRole === 'estudiante' && studentStore.currentAsignatura) {
    const a = studentStore.currentAsignatura
    return [institucionCorta(a.institution), a.program ? programaCorto(a.program.name) : ''].filter(Boolean).join(' · ') ||
      (a.programId || a.institutionId ? 'Sistema tutor inteligente' : 'Curso libre')
  }
  if (authStore.currentRole === 'docente' && contexto.texto.value) return contexto.texto.value
  return 'Sistema tutor inteligente'
})

const showUserMenu = ref(false)
const avatarMenuRef = ref<HTMLElement | null>(null)

// Cerrar el dropdown al hacer click fuera
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
function handleClickOutside(event: MouseEvent) {
  if (avatarMenuRef.value && !avatarMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

const homeRoute = computed(() => {
  switch (authStore.currentRole) {
    case 'docente': return '/docente'
    case 'administrador': return '/admin'
    default: return '/estudiante'
  }
})

const roleLabel = computed(() => {
  switch (authStore.currentRole) {
    case 'estudiante': return 'Estudiante'
    case 'docente': return 'Docente'
    case 'administrador': return 'Admin'
    default: return 'Usuario'
  }
})

const roleBadgeClass = computed(() => {
  switch (authStore.currentRole) {
    case 'docente':
      return 'badge-docente'
    case 'administrador':
      return 'badge-admin'
    default:
      return 'badge-estudiante !text-teal-800'
  }
})

function handleLogout() {
  showUserMenu.value = false
  authStore.logout()
  navigateTo('/auth/login')
}
</script>
