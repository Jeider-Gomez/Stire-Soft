<template>
  <aside ref="menuRef" class="w-sidebar flex-shrink-0 bg-base-blanco border-r border-base-borde-sutil min-h-[calc(100vh-4rem)] md:min-h-0 p-4 flex flex-col transition-[width] duration-200" :class="{ 'menu-colapsado md:w-16 md:px-2': colapsado }">
    <!-- Arriba de la barra, en una fila de la misma altura que el encabezado: el logo y, a su derecha, el botón para
         plegar el menú (como Platzi, 26/10). Plegado, queda solo el botón. En el celular el menú es un cajón y el botón
         no hace falta. -->
    <div class="cabecera-menu h-16 -mt-4 -mx-4 px-4 mb-3 flex items-center justify-between gap-2 border-b border-base-borde-sutil">
      <!-- Logo pequeño y fijo; plegada la barra, queda solo la pantalla con gafas (Jeider, 26/10: «que su logo quede ahí»). -->
      <NuxtLink :to="inicio" class="logo-menu flex items-center min-h-[44px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stire-blue/40" aria-label="Ir al inicio">
        <LayoutLogo tamano="mini" con-nombre />
      </NuxtLink>
      <!-- Plegada (como Platzi): queda solo el logo, y al pasar el mouse o con el foco se vuelve el ícono para expandir. -->
      <button type="button" class="expandir-logo hidden w-11 h-11 items-center justify-center rounded-lg text-slate-600 hover:bg-base-bg-secundario"
        aria-label="Mostrar el menú" title="Mostrar el menú" @click="alternarMenu">
        <LayoutLogo class="logo-reposo" />
        <PanelLeftOpen :size="20" aria-hidden="true" class="icono-expandir" />
      </button>
      <button
        id="boton-menu"
        type="button"
        class="boton-menu hidden md:inline-flex w-9 h-9 items-center justify-center rounded-lg text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario flex-shrink-0"
        :aria-expanded="!colapsado"
        :title="colapsado ? 'Mostrar el menú' : 'Ocultar el menú'"
        @click="alternarMenu">
        <PanelLeftOpen v-if="colapsado" :size="20" aria-hidden="true" />
        <PanelLeftClose v-else :size="20" aria-hidden="true" />
        <span class="sr-only">{{ colapsado ? 'Mostrar el menú' : 'Ocultar el menú' }}</span>
      </button>
    </div>
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
          <House :size="20" aria-hidden="true" class="shrink-0" />
          <span>Inicio</span>
        </NuxtLink>

        <!-- 5. Repasos (EST-V05) -->
        <NuxtLink
          to="/estudiante/repasos"
          data-recorrido="repasos"
          class="flex items-center justify-between px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/repasos' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <div class="flex items-center gap-2.5">
            <Repeat :size="20" aria-hidden="true" class="shrink-0" />
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
          <TrendingUp :size="20" aria-hidden="true" class="shrink-0" />
          <span>Mi progreso</span>
        </NuxtLink>

        <!-- Asistencia con QR (src/asistencia): el código que el estudiante le muestra al docente -->
        <NuxtLink
          to="/estudiante/asistencia"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/asistencia' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <QrCode :size="20" aria-hidden="true" class="shrink-0" />
          <span>Mi asistencia</span>
        </NuxtLink>

        <!-- Proyectos (docs/DISENO_PROYECTOS.md): solo si está disponible para esta cuenta (fase de prueba) -->
        <NuxtLink
          v-if="proyectosDisponible"
          to="/estudiante/proyectos"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path.startsWith('/estudiante/proyectos') ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <FolderCode :size="20" aria-hidden="true" class="shrink-0" />
          <span>Mis proyectos</span>
        </NuxtLink>

        <!-- 7. Mensajes -->
        <NuxtLink
          to="/estudiante/mensajes"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/estudiante/mensajes' ? 'bg-acento-ambar/10 text-acento-ambar-fuerte font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Mail :size="20" aria-hidden="true" class="shrink-0" />
          <span>Mensajes</span>
        </NuxtLink>

        <!-- Plan del curso al final (Jeider, 26/10: «al abrir el plan abarca mucho espacio y quedan lejos las demás
             cosas»): Inicio, Repasos, Progreso, Asistencia y Mensajes quedan juntos arriba y el plan, que es largo, debajo.
             Para saltar de lección sin bajar está «Ir a una lección» (Ctrl+K). components/layout/PlanDelCurso.vue. -->
        <LayoutPlanDelCurso data-recorrido="plan" />
      </nav>

      <!-- 👨‍🏫 NAVEGACIÓN DOCENTE (DOC-V01..V06) -->
      <nav v-else-if="authStore.currentRole === 'docente'" class="space-y-1.5 text-sm font-medium">
        <!-- Rediseño v2 (24/10): arriba lo general (Inicio con todas las clases y Mensajes); debajo, la clase elegida con
             sus secciones (ClasesDelMenu.vue). -->
        <NuxtLink
          to="/docente"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <House :size="20" aria-hidden="true" class="shrink-0" />
          <span>Inicio</span>
        </NuxtLink>

        <NuxtLink
          to="/docente/mensajes"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente/mensajes' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Mail :size="20" aria-hidden="true" class="shrink-0" />
          <span>Mensajes</span>
        </NuxtLink>

        <!-- Biblioteca: cursos que otros docentes compartieron, para copiarlos a una clase nueva (pages/docente/biblioteca.vue) -->
        <NuxtLink
          to="/docente/biblioteca"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/docente/biblioteca' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Library :size="20" aria-hidden="true" class="shrink-0" />
          <span>Biblioteca</span>
        </NuxtLink>

        <LayoutClasesDelMenu v-if="authStore.currentRole === 'docente'" />
      </nav>

      <!-- ⚙️ NAVEGACIÓN ADMINISTRADOR (ADM-V01..V03) -->
      <nav v-else data-recorrido="menu-admin" class="space-y-1.5 text-sm font-medium">
        <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1">Administración</p>

        <NuxtLink
          to="/admin/dashboard"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/dashboard' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Activity :size="20" aria-hidden="true" class="shrink-0" />
          <span>Estado del sistema</span>
        </NuxtLink>

        <NuxtLink
          to="/admin"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin' || route.path === '/admin/usuarios' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <ShieldCheck :size="20" aria-hidden="true" class="shrink-0" />
          <span>Usuarios y roles</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/sugerencias"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/sugerencias' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <MessageSquarePlus :size="20" aria-hidden="true" class="shrink-0" />
          <span>Sugerencias</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/catalogo"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/catalogo' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Library :size="20" aria-hidden="true" class="shrink-0" />
          <span>Catálogo académico</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/usabilidad"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/usabilidad' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <ClipboardList :size="20" aria-hidden="true" class="shrink-0" />
          <span>Encuesta de usabilidad</span>
        </NuxtLink>

        <NuxtLink
          to="/admin/sistema"
          class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
          :class="route.path === '/admin/sistema' ? 'bg-semantico-pasa/10 text-semantico-pasa font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Settings :size="20" aria-hidden="true" class="shrink-0" />
          <span>Registros y mantenimiento</span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Ayuda para los tres roles, al final del menú: el manual de usuario (docs/PLAN_AYUDA_AL_USUARIO.md, frente C). -->
    <nav aria-label="Ayuda" class="mt-auto pt-3 border-t border-base-borde-sutil text-sm font-medium">
      <NuxtLink to="/ayuda" data-recorrido="ayuda" class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors text-base-texto-primario hover:bg-base-bg-secundario">
        <BookOpen :size="20" aria-hidden="true" class="shrink-0" />
        <span>Ayuda</span>
      </NuxtLink>
    </nav>

  </aside>
</template>

<script setup lang="ts">
import { Activity, BookOpen, ClipboardList, Library, FolderCode, House, Mail, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, QrCode, Repeat, Settings, ShieldCheck, TrendingUp } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'

const authStore = useAuthStore()
const studentStore = useStudentStore()
const route = useRoute()

// ─── Menú colapsado (solo computador) ───
const { colapsado, alternarMenu } = useMenuColapsado()
const inicio = computed(() => ({ docente: '/docente', admin: '/admin/dashboard' } as Record<string, string>)[authStore.currentRole] ?? '/estudiante')
const menuRef = ref<HTMLElement | null>(null)
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
  .menu-colapsado .logo-menu,
  .menu-colapsado .boton-menu { display: none; }
  .menu-colapsado .expandir-logo { display: inline-flex; }
  .expandir-logo .icono-expandir { display: none; }
  .expandir-logo:hover .logo-reposo,
  .expandir-logo:focus-visible .logo-reposo { display: none; }
  .expandir-logo:hover .icono-expandir,
  .expandir-logo:focus-visible .icono-expandir { display: block; }
  .menu-colapsado .cabecera-menu {
    justify-content: center;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .menu-colapsado a,
  .menu-colapsado button {
    justify-content: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .menu-colapsado a span,
  .menu-colapsado button:not(.expandir-logo) span {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}
</style>
