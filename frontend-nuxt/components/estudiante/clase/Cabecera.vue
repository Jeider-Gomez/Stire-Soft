<template>
  <!-- La cabecera de «Mi clase» (v3, Fase D, paso 5; cuadros «E-Clase-*»): la clase en que está, su profe y las cinco pestañas.
       Cada pestaña es su propia pantalla (se puede enlazar y volver con «Atrás»); la actual va marcada. Las sesiones no tienen
       horario fijo en STIRE (las abre el profe al tomar asistencia), así que no se inventa una «próxima sesión». -->
  <div class="space-y-3.5">
    <section class="heroe-inicio flex items-center gap-4" aria-labelledby="titulo-mi-clase">
      <span class="sigla-clase flex-none" aria-hidden="true">{{ sigla }}</span>
      <div class="min-w-0">
        <p class="m-0 text-[13px] font-bold uppercase opacity-80">Mi clase</p>
        <h1 id="titulo-mi-clase" class="m-0 font-poppins font-bold text-[20px] sm:text-[26px] leading-tight truncate">{{ studentStore.currentClassName || 'Tu clase' }}</h1>
        <p v-if="studentStore.currentTeacher" class="m-0 mt-0.5 text-[15px]">Prof. {{ studentStore.currentTeacher }}</p>
      </div>
      <NuxtLink to="/estudiante/clases" class="boton-heroe boton-otro hidden sm:inline-flex ml-auto">Cambiar de clase</NuxtLink>
    </section>

    <nav aria-label="Partes de mi clase" class="flex gap-1 border-b border-base-borde-sutil overflow-x-auto [scrollbar-width:none]">
      <NuxtLink v-for="p in PESTANAS" :key="p.ruta" :to="p.ruta" class="pestana-clase" :aria-current="actual === p.ruta ? 'page' : undefined">
        {{ p.texto }}
        <span v-if="cuenta(p.ruta)" class="insignia-clase" :aria-label="`${cuenta(p.ruta)} sin ver`">{{ cuenta(p.ruta) }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'
import { siglasDeClases } from '~/utils/contextoAcademico'
import { ordenarRefuerzos, PESTANAS_CLASE, pestanaDeRuta } from '~/utils/miClase'
import { useInicioEstudiante } from '~/composables/useInicioEstudiante'

const studentStore = useStudentStore()
const route = useRoute()
const PESTANAS = PESTANAS_CLASE
const actual = computed(() => pestanaDeRuta(route.path))
const sigla = computed(() => {
  const id = studentStore.currentClassId ?? 0
  return siglasDeClases([{ id, name: studentStore.currentClassName }])[id] ?? ''
})
// Lo pendiente de cada pestaña: refuerzos y retos sin terminar de esta clase y mensajes sin leer. Si falla, sin insignia.
const inicio = useInicioEstudiante()
const refuerzos = ref(0)
const mensajes = ref(0)
onMounted(() => {
  inicio.refuerzos().then((l) => { refuerzos.value = ordenarRefuerzos(l.filter((r) => r.classId === studentStore.currentClassId)).pendientes.length }).catch(() => undefined)
  inicio.mensajesSinLeer().then((n) => { mensajes.value = n }).catch(() => undefined)
})
function cuenta(ruta: string): number {
  if (ruta === '/estudiante/clase/refuerzos') return refuerzos.value
  if (ruta === '/estudiante/mensajes') return mensajes.value
  return 0
}
</script>

<style scoped>
.sigla-clase { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: rgb(var(--c-base-blanco)); color: rgb(var(--c-base-texto-primario)); font-family: Poppins, sans-serif; font-size: 22px; font-weight: 700; }
.pestana-clase { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 12px; margin-bottom: -1px; font-size: 14px; font-weight: 700; white-space: nowrap; color: rgb(var(--c-base-texto-secundario)); border-bottom: 3px solid transparent; transition: color 0.15s ease, border-color 0.15s ease; }
.pestana-clase:hover { color: rgb(var(--c-base-texto-primario)); }
.pestana-clase[aria-current="page"] { color: rgb(var(--c-base-texto-primario)); border-color: rgb(var(--c-base-texto-primario)); }
.insignia-clase { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: #ffc94d; color: #14213d; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
</style>
