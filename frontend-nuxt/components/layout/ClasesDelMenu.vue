<!-- Las clases del docente en el menú lateral (salió de SidebarNav.vue el 07/10). La clase como lugar
     (utils/pestanasClase.ts): la clase activa despliega aquí sus secciones (Hoy, Contenido, Estudiantes…), que antes
     eran pestañas horizontales (rediseño del docente, 23/10). Cada una lleva sus iniciales («FA», «PA»; «FA1», «FA2» si se repiten): con el menú plegado
     todas tenían el mismo ícono y no se sabía cuál era cuál (Jeider, 07/10). -->
<template>
  <div v-if="clases.length" class="pt-2 pb-1">
    <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1" :class="{ 'md:hidden': colapsado }">Tus clases</p>
    <div v-for="c in clases" :key="c.id">
      <NuxtLink
        :to="enlacePestana(seccionActual ?? 'hoy', c.id)"
        :title="c.code ? `${c.name} · ${c.code}` : c.name"
        :aria-current="activa === c.id && !seccionActual ? 'page' : undefined"
        class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
        :class="[activa === c.id ? 'text-base-texto-primario font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario', colapsado ? 'md:justify-center md:px-2' : '']">
        <span aria-hidden="true" class="shrink-0 inline-flex items-center justify-center min-w-[26px] h-[26px] px-1 rounded-md border border-base-borde-fuerte text-[10px] font-bold font-mono text-base-texto-primario" :class="activa === c.id ? 'bg-semantico-info/10' : 'bg-base-bg-secundario'">{{ siglas[c.id] }}</span>
        <!-- Dos grupos de la misma materia se cortan igual: el código los distingue. Plegado, el nombre queda para el
             lector de pantalla. -->
        <span class="min-w-0" :class="{ 'md:sr-only': colapsado }">
          <span class="block truncate">{{ c.name }}</span>
          <span v-if="c.code" class="block truncate font-mono text-[10px] font-normal text-slate-600">{{ c.code }}</span>
        </span>
      </NuxtLink>
      <!-- Las secciones de la clase activa, debajo de ella (como las carpetas de Notas): reemplazan las pestañas
           horizontales de la pantalla. Plegado el menú, no caben y se omiten. -->
      <ul v-if="activa === c.id" :class="{ 'md:hidden': colapsado }" :aria-label="`Secciones de ${c.name}`" class="ml-5 mt-0.5 mb-1.5 pl-3 border-l border-base-borde-sutil space-y-0.5">
        <li v-for="p in PESTANAS_CLASE" :key="p.id">
          <NuxtLink
            :to="enlacePestana(p.id, c.id)"
            :aria-current="p.id === seccionActual ? 'page' : undefined"
            class="flex items-center gap-2 min-h-[36px] px-2.5 rounded-md text-[13px] transition-colors"
            :class="p.id === seccionActual ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
            <component :is="ICONOS[p.id]" :size="15" aria-hidden="true" class="shrink-0" />
            <span>{{ p.texto }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, CalendarCheck, ClipboardCheck, GraduationCap, Inbox, LifeBuoy, Settings, Users } from 'lucide-vue-next'
import { PESTANAS_CLASE, claseDeLaRuta, enlacePestana, pestanaDeLaRuta } from '~/utils/pestanasClase'
import { siglasDeClases } from '~/utils/contextoAcademico'

const route = useRoute()
const colapsado = useState('menu-colapsado', () => false)
const { misClases } = useMisClases()

const clases = ref<Array<{ id: number; name: string; code?: string }>>([])
const activa = computed(() => claseDeLaRuta(route.path, route.query))
/** La sección de la clase en la que está el docente: al cambiar de clase se queda en esa misma sección. */
const seccionActual = computed(() => (activa.value ? pestanaDeLaRuta(route.path) : null))
const ICONOS = { hoy: CalendarCheck, contenido: BookOpen, estudiantes: Users, asistencia: ClipboardCheck, entregas: Inbox, refuerzos: LifeBuoy, notas: GraduationCap, ajustes: Settings }
const siglas = computed(() => siglasDeClases(clases.value))

onMounted(async () => {
  try {
    clases.value = await misClases()
  } catch {
    clases.value = []
  }
})
</script>
