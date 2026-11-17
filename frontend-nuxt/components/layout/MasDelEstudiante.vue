<!-- P-8 (17/11): en el celular, lo del menú del estudiante que no está en la barra de abajo (LayoutBarraInferior), dentro
     del menú de la cuenta (HeaderNav.vue). Con la asistencia abierta, «Abierta» junto a Mi asistencia (P-2). -->
<template>
  <nav aria-label="Más secciones" class="md:hidden border-b border-slate-100 py-1">
    <NuxtLink v-for="e in entradas" :key="e.to" :to="e.to" @click="$emit('elegir')"
      class="w-full flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] text-sm text-slate-700 hover:bg-slate-50 font-medium"
      :aria-current="route.path === e.to ? 'page' : undefined">
      <component :is="e.icono" :size="16" aria-hidden="true" />
      <span>{{ e.texto }}</span>
      <span v-if="e.to === '/estudiante/asistencia' && asistenciaAbierta" class="cuenta-menu ml-auto">Abierta<span class="sr-only">: el profe está tomando asistencia</span></span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { ArrowLeftRight, FolderCode, GraduationCap, QrCode, Trophy } from 'lucide-vue-next'

defineEmits(['elegir'])
const route = useRoute()
// «Mis proyectos» solo si el servidor lo dejó ver (lo pregunta SidebarNav.vue y lo comparte en este estado).
const proyectosDisponible = useState('proyectos-disponible', () => false)
const { asistenciaAbierta } = useAvisosDelMenu()
const entradas = computed(() => [
  { to: '/estudiante/clase', texto: 'Mi clase', icono: GraduationCap },
  { to: '/estudiante/asistencia', texto: 'Mi asistencia', icono: QrCode },
  ...(proyectosDisponible.value ? [{ to: '/estudiante/proyectos', texto: 'Mis proyectos', icono: FolderCode }] : []),
  { to: '/estudiante/logros', texto: 'Mis logros', icono: Trophy },
  { to: '/estudiante/clases', texto: 'Cambiar de clase', icono: ArrowLeftRight },
])
</script>
