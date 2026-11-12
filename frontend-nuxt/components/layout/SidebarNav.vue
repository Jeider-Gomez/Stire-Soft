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
      <!-- v3 (Fase B; cuadro Navegacion-estudiante): cada sección con su color, en el orden del diseño. «Aprender» es el
           plan del curso de abajo; Mi asistencia y Mensajes son lo que el diseño junta en «Mi clase» (rosa) hasta que
           esa pantalla exista (Fase D). -->
      <nav v-if="authStore.currentRole === 'estudiante'" class="menu-v3 text-sm">
        <NuxtLink to="/estudiante" class="item-menu tono-menta" :class="{ activo: route.path === '/estudiante' }">
          <span class="icono-menu"><House :size="18" aria-hidden="true" /></span>
          <span>Inicio</span>
        </NuxtLink>

        <!-- La cuenta = repasos que tocan HOY (vencidos o críticos); los de mañana no son urgentes. -->
        <NuxtLink to="/estudiante/repasos" data-recorrido="repasos" class="item-menu tono-sol" :class="{ activo: route.path === '/estudiante/repasos' }">
          <span class="icono-menu"><Repeat :size="18" aria-hidden="true" /></span>
          <span>Repasos</span>
          <span
            v-if="studentStore.reviewsDueToday.length > 0"
            class="cuenta-menu"
            :aria-label="`${studentStore.reviewsDueToday.length} para hoy`">
            {{ studentStore.reviewsDueToday.length }}
          </span>
        </NuxtLink>

        <!-- Proyectos (docs/DISENO_PROYECTOS.md): solo si está disponible para esta cuenta (fase de prueba) -->
        <NuxtLink v-if="proyectosDisponible" to="/estudiante/proyectos" class="item-menu tono-cian" :class="{ activo: route.path.startsWith('/estudiante/proyectos') }">
          <span class="icono-menu"><FolderCode :size="18" aria-hidden="true" /></span>
          <span>Mis proyectos</span>
        </NuxtLink>

        <!-- Asistencia con QR (src/asistencia): el código que el estudiante le muestra al docente -->
        <NuxtLink to="/estudiante/asistencia" class="item-menu tono-rosa" :class="{ activo: route.path === '/estudiante/asistencia' }">
          <span class="icono-menu"><QrCode :size="18" aria-hidden="true" /></span>
          <span>Mi asistencia</span>
        </NuxtLink>

        <NuxtLink to="/estudiante/mensajes" class="item-menu tono-rosa" :class="{ activo: route.path === '/estudiante/mensajes' }">
          <span class="icono-menu"><Mail :size="18" aria-hidden="true" /></span>
          <span>Mensajes</span>
        </NuxtLink>

        <NuxtLink to="/estudiante/progreso" class="item-menu tono-lila" :class="{ activo: route.path === '/estudiante/progreso' }">
          <span class="icono-menu"><TrendingUp :size="18" aria-hidden="true" /></span>
          <span>Mi progreso</span>
        </NuxtLink>

        <!-- Plan del curso al final (Jeider, 26/10: «al abrir el plan abarca mucho espacio y quedan lejos las demás
             cosas»): Inicio, Repasos, Progreso, Asistencia y Mensajes quedan juntos arriba y el plan, que es largo, debajo.
             Para saltar de lección sin bajar está «Ir a una lección» (Ctrl+K). components/layout/PlanDelCurso.vue. -->
        <LayoutPlanDelCurso data-recorrido="plan" />
      </nav>

      <!-- 👨‍🏫 NAVEGACIÓN DOCENTE (DOC-V01..V06) -->
      <!-- v3 (Fase B; cuadro D3-Clase): «Mis clases» arriba; debajo, la clase elegida con sus secciones
           (ClasesDelMenu.vue); Mensajes y Biblioteca, que no son de una clase, al final. -->
      <nav v-else-if="authStore.currentRole === 'docente'" class="menu-v3 text-sm">
        <NuxtLink to="/docente" class="item-menu tono-menta" :class="{ activo: route.path === '/docente' }">
          <span class="icono-menu"><House :size="18" aria-hidden="true" /></span>
          <span>Mis clases</span>
        </NuxtLink>

        <LayoutClasesDelMenu v-if="authStore.currentRole === 'docente'" />

        <p class="titulo-seccion">General</p>
        <NuxtLink to="/docente/mensajes" class="item-menu tono-lila" :class="{ activo: route.path === '/docente/mensajes' }">
          <span class="icono-menu"><Mail :size="18" aria-hidden="true" /></span>
          <span>Mensajes</span>
        </NuxtLink>

        <!-- Biblioteca: cursos que otros docentes compartieron, para copiarlos a una clase nueva (pages/docente/biblioteca.vue) -->
        <NuxtLink to="/docente/biblioteca" class="item-menu tono-cielo" :class="{ activo: route.path === '/docente/biblioteca' }">
          <span class="icono-menu"><Library :size="18" aria-hidden="true" /></span>
          <span>Biblioteca</span>
        </NuxtLink>
      </nav>

      <!-- ⚙️ NAVEGACIÓN ADMINISTRADOR (v3, Fase B; cuadro A-Usuarios del lienzo): por secciones, cada entrada con su
           color. Clases, Contenido compartido, IA y proveedores y Datos para investigación entran con sus pantallas
           (Fase F); hasta entonces no se muestran. -->
      <nav v-else data-recorrido="menu-admin" class="menu-v3 text-sm">
        <p class="titulo-rol">Administración</p>

        <p class="titulo-seccion">Personas</p>
        <NuxtLink to="/admin" class="item-menu tono-menta" :class="{ activo: enAdmin('/admin', '/admin/usuarios') }" :aria-current="enAdmin('/admin', '/admin/usuarios') ? 'page' : undefined">
          <span class="icono-menu"><Users :size="18" aria-hidden="true" /></span>
          <span>Usuarios y roles</span>
        </NuxtLink>

        <p class="titulo-seccion">Académico</p>
        <NuxtLink to="/admin/catalogo" class="item-menu tono-cielo" :class="{ activo: enAdmin('/admin/catalogo') }">
          <span class="icono-menu"><Library :size="18" aria-hidden="true" /></span>
          <span>Catálogo académico</span>
        </NuxtLink>

        <p class="titulo-seccion">Opiniones</p>
        <NuxtLink to="/admin/sugerencias" class="item-menu tono-lila" :class="{ activo: enAdmin('/admin/sugerencias') }">
          <span class="icono-menu"><MessageSquare :size="18" aria-hidden="true" /></span>
          <span>Sugerencias</span>
        </NuxtLink>
        <NuxtLink to="/admin/usabilidad" class="item-menu tono-menta" :class="{ activo: enAdmin('/admin/usabilidad') }">
          <span class="icono-menu"><Target :size="18" aria-hidden="true" /></span>
          <span>Encuesta de usabilidad</span>
        </NuxtLink>

        <p class="titulo-seccion">Sistema</p>
        <NuxtLink to="/admin/dashboard" class="item-menu tono-cielo" :class="{ activo: enAdmin('/admin/dashboard') }">
          <span class="icono-menu"><Activity :size="18" aria-hidden="true" /></span>
          <span>Estado del sistema</span>
        </NuxtLink>
        <NuxtLink to="/admin/sistema" class="item-menu tono-sol" :class="{ activo: enAdmin('/admin/sistema') }">
          <span class="icono-menu"><Settings :size="18" aria-hidden="true" /></span>
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
import { Activity, BookOpen, Library, FolderCode, House, Mail, MessageSquare, PanelLeftClose, PanelLeftOpen, QrCode, Repeat, Settings, Target, TrendingUp, Users } from 'lucide-vue-next'
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

/** Entrada del administrador activa: su ruta exacta (las del admin no tienen subpáginas). */
const enAdmin = (...rutas: string[]) => rutas.includes(route.path)
</script>

<style scoped>
/* El menú v3 (item-menu, icono-menu, tono-*) está en assets/css/menu-v3.css. */

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
  .menu-colapsado a span:not(.icono-menu),
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
