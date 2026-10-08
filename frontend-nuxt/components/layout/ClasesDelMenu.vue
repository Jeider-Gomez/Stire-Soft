<!-- Las clases del docente en el menú lateral (salió de SidebarNav.vue el 07/10). La clase como lugar
     (utils/pestanasClase.ts): cada clase abre su «Hoy», y adentro están sus pestañas (Contenido, Estudiantes, Entregas,
     Refuerzos, Ajustes). Cada una lleva sus iniciales («FA», «PA»; «FA1», «FA2» si se repiten): con el menú plegado
     todas tenían el mismo ícono y no se sabía cuál era cuál (Jeider, 07/10). -->
<template>
  <div v-if="clases.length" class="pt-2 pb-1">
    <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 py-1" :class="{ 'md:hidden': colapsado }">Tus clases</p>
    <NuxtLink
      v-for="c in clases"
      :key="c.id"
      :to="`/docente/clase/${c.id}`"
      :title="c.code ? `${c.name} · ${c.code}` : c.name"
      class="flex items-center gap-2.5 min-h-[44px] px-3 py-2 rounded-md transition-colors"
      :class="[activa === c.id ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario', colapsado ? 'md:justify-center md:px-2' : '']">
      <span aria-hidden="true" class="shrink-0 inline-flex items-center justify-center min-w-[26px] h-[26px] px-1 rounded-md border border-base-borde-fuerte bg-base-bg-secundario text-[10px] font-bold font-mono text-base-texto-primario">{{ siglas[c.id] }}</span>
      <!-- Dos grupos de la misma materia se cortan igual: el código los distingue. Plegado, el nombre queda para el
           lector de pantalla. -->
      <span class="min-w-0" :class="{ 'md:sr-only': colapsado }">
        <span class="block truncate">{{ c.name }}</span>
        <span v-if="c.code" class="block truncate font-mono text-[10px] font-normal text-slate-600">{{ c.code }}</span>
      </span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { claseDeLaRuta } from '~/utils/pestanasClase'
import { siglasDeClases } from '~/utils/contextoAcademico'

const route = useRoute()
const colapsado = useState('menu-colapsado', () => false)
const { misClases } = useMisClases()

const clases = ref<Array<{ id: number; name: string; code?: string }>>([])
const activa = computed(() => claseDeLaRuta(route.path, route.query))
const siglas = computed(() => siglasDeClases(clases.value))

onMounted(async () => {
  try {
    clases.value = await misClases()
  } catch {
    clases.value = []
  }
})
</script>
