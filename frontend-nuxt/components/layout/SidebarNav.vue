<template>
  <aside ref="menuRef" class="w-sidebar flex-shrink-0 bg-base-blanco border-r border-base-borde-sutil min-h-[calc(100vh-4rem)] md:min-h-0 p-4 flex flex-col transition-[width] duration-200" :class="{ 'menu-colapsado md:w-16 md:px-2': colapsado }">
    <!-- Ocultar el menú en computador para ganar espacio (recomendación de José, 02/10). Queda solo con íconos y se
         recuerda en este navegador. En celular el menú ya es un cajón que se abre con la hamburguesa.
         Arriba (pedido de Jeider, 02/10) y solo un ícono que no estorba (03/10), como en Platzi, ChatGPT o Claude
         (P-UI-03). Toda la barra queda fija al bajar, así que el ícono siempre está a mano. -->
    <button
      id="boton-menu"
      type="button"
      class="boton-menu hidden md:flex self-end -mt-1 -mr-1 mb-2 w-9 h-9 items-center justify-center rounded-lg text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario"
      :aria-expanded="!colapsado"
      :title="colapsado ? 'Mostrar el menú' : 'Ocultar el menú'"
      @click="alternarMenu">
      <PanelLeftOpen v-if="colapsado" :size="18" aria-hidden="true" class="shrink-0" />
      <PanelLeftClose v-else :size="18" aria-hidden="true" class="shrink-0" />
      <span class="sr-only">{{ colapsado ? 'Mostrar el menú' : 'Ocultar el menú' }}</span>
    </button>
    <!-- Navegación según Rol Activo -->
    <div class="space-y-4">
      <!-- 🎓 NAVEGACIÓN ESTUDIANTE (6 Ítems Persistentes - Insumo 15 §5) -->
      <nav v-if="authStore.currentRole === 'estudiante'" class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Navegación</p>

        <!-- 1. Inicio (EST-V01) -->
        <NuxtLink
          to="/estudiante"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="isCurrentRoute('/estudiante') && route.path === '/estudiante' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <House :size="18" aria-hidden="true" class="shrink-0" />
          <span>Inicio</span>
        </NuxtLink>

        <!-- 5. Repasos (EST-V05) -->
        <NuxtLink
          to="/estudiante/repasos"
          class="flex items-center justify-between px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/repasos' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <div class="flex items-center gap-2.5">
            <Repeat :size="18" aria-hidden="true" class="shrink-0" />
            <span>Repasos</span>
          </div>
          <!-- Insignia roja = repasos que tocan HOY (vencidos o críticos); los de mañana no son urgentes. -->
          <span
            v-if="studentStore.reviewsDueToday.length > 0"
            class="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-semantico-falla text-base-blanco"
            :aria-label="`${studentStore.reviewsDueToday.length} para hoy`">
            {{ studentStore.reviewsDueToday.length }}
          </span>
        </NuxtLink>

        <!-- 6. Mi progreso (EST-V06) -->
        <NuxtLink
          to="/estudiante/progreso"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/progreso' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <TrendingUp :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mi progreso</span>
        </NuxtLink>

        <!-- Asistencia con QR (src/asistencia): el código que el estudiante le muestra al docente -->
        <NuxtLink
          to="/estudiante/asistencia"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/asistencia' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <QrCode :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mi asistencia</span>
        </NuxtLink>

        <!-- Proyectos (docs/DISENO_PROYECTOS.md): solo si está disponible para esta cuenta (fase de prueba) -->
        <NuxtLink
          v-if="proyectosDisponible"
          to="/estudiante/proyectos"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path.startsWith('/estudiante/proyectos') ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <FolderCode :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mis proyectos</span>
        </NuxtLink>

        <!-- 7. Mensajes -->
        <NuxtLink
          to="/estudiante/mensajes"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/mensajes' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Mail :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mensajes</span>
        </NuxtLink>
        <!-- Plan del curso, debajo de la navegación (components/layout/PlanDelCurso.vue). -->
        <LayoutPlanDelCurso />
      </nav>

      <!-- 👨‍🏫 NAVEGACIÓN DOCENTE (DOC-V01..V06) -->
      <nav v-else-if="authStore.currentRole === 'docente'" class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Gestión docente</p>

        <NuxtLink
          to="/docente"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Users :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mis clases</span>
        </NuxtLink>

        <!-- Cada clase con sus iniciales; abre su «Hoy» (ClasesDelMenu.vue). -->
        <LayoutClasesDelMenu v-if="authStore.currentRole === 'docente'" />

        <NuxtLink
          to="/docente/mensajes"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente/mensajes' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Mail :size="18" aria-hidden="true" class="shrink-0" />
          <span>Mensajes</span>
        </NuxtLink>
      </nav>

      <!-- ⚙️ NAVEGACIÓN ADMINISTRADOR (ADM-V01..V03) -->
      <nav v-else class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Administración</p>

        <NuxtLink
          to="/admin/dashboard"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/dashboard' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Activity :size="18" aria-hidden="true" class="shrink-0" />
          <span>Estado del sistema</span>
        </NuxtLink>

        <NuxtLink
          to="/admin"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin' || route.path === '/admin/usuarios' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <ShieldCheck :size="18" aria-hidden="true" class="shrink-0" />
          <span>Usuarios y roles</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/sugerencias"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/sugerencias' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <MessageSquarePlus :size="18" aria-hidden="true" class="shrink-0" />
          <span>Sugerencias</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/catalogo"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/catalogo' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Library :size="18" aria-hidden="true" class="shrink-0" />
          <span>Catálogo académico</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/usabilidad"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/usabilidad' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <ClipboardList :size="18" aria-hidden="true" class="shrink-0" />
          <span>Encuesta de usabilidad</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/sistema"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/sistema' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Settings :size="18" aria-hidden="true" class="shrink-0" />
          <span>Registros y mantenimiento</span>
        </NuxtLink>
      </nav>
    </div>

  </aside>
</template>

<script setup lang="ts">
import { Activity, ClipboardList, Library, FolderCode, House, Mail, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, QrCode, Repeat, Settings, ShieldCheck, TrendingUp, Users } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const route = useRoute()

// ─── Menú colapsado (solo computador) ───
const CLAVE_MENU = 'stire-menu-colapsado'
const colapsado = useState('menu-colapsado', () => false)
const menuRef = ref<HTMLElement | null>(null)
onMounted(() => {
  try { colapsado.value = localStorage.getItem(CLAVE_MENU) === '1' } catch { /* sin almacenamiento */ }
})
function alternarMenu() {
  colapsado.value = !colapsado.value
  try { localStorage.setItem(CLAVE_MENU, colapsado.value ? '1' : '0') } catch { /* se usa sin recordar */ }
}
// Con solo íconos, cada enlace muestra su nombre al pasar el mouse (el lector de pantalla ya lo lee del texto oculto).
watch([colapsado, () => route.path], () => nextTick(() => {
  for (const a of menuRef.value?.querySelectorAll<HTMLAnchorElement>('a') ?? []) {
    if (colapsado.value) a.title = a.title || (a.textContent ?? '').replace(/\s+/g, ' ').trim()
  }
}), { immediate: true })

// Proyectos está en prueba: el menú solo lo muestra si el servidor dice que esta cuenta puede usarlo.
const proyectosDisponible = ref(false)
onMounted(async () => {
  if (authStore.currentRole !== 'estudiante') return
  try {
    proyectosDisponible.value = (await useApi().get<{ disponible: boolean }>('/proyectos/estado')).disponible
  } catch {
    proyectosDisponible.value = false
  }
})

function isCurrentRoute(path: string) {
  return route.path.startsWith(path)
}
</script>

<style scoped>
/* Solo íconos: el texto queda para el lector de pantalla y los títulos de sección se ocultan. */
@media (min-width: 768px) {
  .menu-colapsado .ocultar-colapsado,
  .menu-colapsado nav > p,
  .menu-colapsado nav > div > p {
    display: none;
  }
  .menu-colapsado .boton-menu {
    align-self: center;
    margin-right: 0;
  }
  .menu-colapsado a,
  .menu-colapsado button {
    justify-content: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .menu-colapsado a span,
  .menu-colapsado button span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}
</style>
