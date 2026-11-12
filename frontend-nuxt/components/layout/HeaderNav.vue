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
      <!-- v3 (Fase B; barra() y barraD() del prototipo): «Dónde estás» a la izquierda, con los nombres del menú
           (utils/migas.ts). La clase del estudiante pasó a la tarjeta de arriba del menú (SidebarNav.vue). -->
      <nav v-if="migas.length" aria-label="Dónde estás" class="hidden md:flex items-center gap-1.5 min-w-0 text-sm text-base-texto-secundario whitespace-nowrap overflow-hidden">
        <template v-for="(m, i) in migas" :key="i">
          <span v-if="i < migas.length - 1" class="truncate">{{ m }}</span>
          <span v-if="i < migas.length - 1" aria-hidden="true">›</span>
          <strong v-else class="truncate font-semibold text-base-texto-primario" aria-current="page">{{ m }}</strong>
        </template>
      </nav>
    </div>

    <!-- ── DERECHA: Badge de rol + Avatar + Salir ── -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- El Tutor se abre con el lanzador flotante de abajo a la derecha (components/tutor/LanzadorTutor.vue). El rol y
           el lugar están en el menú de la cuenta (27/10). Orden del prototipo: Buscar (o el Asistente del docente),
           Apariencia, Avisos, Ayuda, Sugerencias y la cuenta. -->

      <!-- Buscar una lección (Ctrl+K), como la barra de búsqueda de Cursor -->
      <button v-if="authStore.currentRole === 'estudiante'" type="button"
        class="hidden md:inline-flex items-center gap-2 min-h-[40px] px-3 rounded-xl border border-base-borde-sutil text-sm text-base-texto-secundario hover:border-base-borde-fuerte"
        title="Buscar una lección (Ctrl+K)" @click="irALeccion = true">
        <Search :size="16" aria-hidden="true" /><span>Buscar</span>
        <kbd class="hidden lg:inline text-[11px] font-semibold">Ctrl K</kbd>
      </button>

      <!-- Asistente STIRE (solo docente): propone estructura, lecciones y ejercicios según la pantalla (Ctrl+.) -->
      <!-- v3 (Fase B, cuadro D3-Inicio): botón de sol suave con su atajo a la vista; lleno mientras el panel está abierto. -->
      <button v-if="authStore.currentRole === 'docente'" id="abrir-asistente" type="button"
        class="boton-asistente hidden sm:inline-flex items-center gap-2 min-h-[40px] px-3.5 rounded-xl text-[13px] font-bold"
        :class="{ abierto: asistenteAbierto }"
        :aria-expanded="asistenteAbierto" aria-controls="panel-asistente" title="Asistente STIRE (Ctrl+.)" @click="asistenteAbierto = !asistenteAbierto">
        <Sparkles :size="16" aria-hidden="true" /> Asistente
        <kbd class="hidden lg:inline text-[11px] font-semibold opacity-70">Ctrl .</kbd>
      </button>

      <!-- Apariencia y lectura a un clic desde cualquier pantalla (components/layout/BotonApariencia.vue). En el celular la
           barra lleva solo logo, avisos, ayuda y cuenta (cuadro E-Cel-Inicio): la apariencia queda en el menú de la cuenta. -->
      <LayoutBotonApariencia class="hidden md:block" />

      <!-- Avisos -->
      <LayoutNotificationBell />

      <!-- Menú de ayuda: el recorrido de esta pantalla, su tarea del manual, el manual y las sugerencias
           (components/layout/MenuAyuda.vue; S10-J04). -->
      <LayoutMenuAyuda :con-sugerencias="authStore.currentRole !== 'administrador'" />

      <!-- Sugerencias: un problema, algo confuso o una idea (docs/calidad/PRUEBA_DOS_SEMANAS.md). El administrador las lee
           (Opiniones › Sugerencias), no las envía: no lo ve, como en el cuadro A-Usuarios. En el celular el botón no se ve
           (barra E-Cel-Inicio: logo, avisos y cuenta) pero sigue montado: «Enviar una sugerencia» del menú de Ayuda abre
           su ventana con ?sugerencias=nueva. -->
      <LayoutBotonSugerencias v-if="authStore.currentRole !== 'administrador'" class="hidden md:block" />

      <!-- Separador -->
      <div class="hidden md:block w-px h-6 bg-slate-200 mx-1" />

      <!-- Avatar + menú usuario -->
      <div class="relative" ref="avatarMenuRef">
        <button title="Tu cuenta"
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
import { institucionCorta, programaCorto } from '~/utils/contextoAcademico'
import { migasDeRuta } from '~/utils/migas'

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

// «Dónde estás» (utils/migas.ts): para el docente, la clase elegida en el menú (ClasesDelMenu.vue) abre el camino.
const route = useRoute()
const claseDelDocente = useState<string | null>('clase-docente-nombre', () => null)
const migas = computed(() => migasDeRuta(route.path, authStore.currentRole, claseDelDocente.value))

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

<style scoped>
/* Asistente: sol suave (#FFF1C2) con tinta; abierto, el sol lleno. En oscuro, el fondo de sol de las secciones. */
.boton-asistente { background: rgb(var(--c-sec-sol-fondo)); color: rgb(var(--c-base-texto-primario)); transition: background-color .2s ease; }
.boton-asistente.abierto, .boton-asistente:hover { background: #ffc94d; color: #14213d; }
</style>
