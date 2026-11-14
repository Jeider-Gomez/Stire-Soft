<template>
  <!-- La portada del Inicio del docente (v3, Fase E, paso 1; cuadro «D3-Inicio»): la libreta del Asistente, el saludo,
       cuántas cosas hay por revisar en todas sus clases y lo más urgente, con «Ver quiénes» y «Nueva clase». Solo cifras
       reales (utils/inicioDocente.ts): si no hay nada, lo dice. -->
  <section class="heroe-inicio flex flex-wrap items-center gap-5" aria-labelledby="titulo-inicio-docente">
    <span class="libreta-portada hidden sm:flex" aria-hidden="true"><DocenteAsistenteLibreta :tamano="64" /></span>
    <div class="min-w-0 flex-1 basis-[280px]">
      <p class="m-0 text-[14px] font-semibold opacity-80">{{ saludo }}</p>
      <h1 id="titulo-inicio-docente" class="m-0 font-poppins font-bold text-[24px] sm:text-[30px] leading-tight">{{ titulo }}</h1>
      <p v-if="!cargando" class="m-0 mt-1 text-[15px]">{{ urgente }}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <NuxtLink v-if="primero" :to="primero.ir" class="boton-heroe boton-principal inline-flex items-center gap-1.5 whitespace-nowrap">{{ primero.tipo === 'mensajes' ? 'Ver los mensajes' : 'Ver quiénes' }} <ChevronRight :size="16" aria-hidden="true" /></NuxtLink>
      <button id="abrir-crear-clase" type="button" class="boton-heroe boton-otro inline-flex items-center gap-1.5 whitespace-nowrap" @click="emit('nueva-clase')"><Plus :size="16" aria-hidden="true" /> Nueva clase</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ChevronRight, Plus } from 'lucide-vue-next'
import { lineaUrgente, tituloPorRevisar, type PendienteInicio } from '~/utils/inicioDocente'

const props = defineProps<{ items: PendienteInicio[]; saludo: string; cargando: boolean; hayClases: boolean }>()
const emit = defineEmits<{ 'nueva-clase': [] }>()
const primero = computed(() => props.items[0] ?? null)
const titulo = computed(() => (props.cargando ? 'Cargando tus clases…' : props.hayClases ? tituloPorRevisar(props.items.length) : 'Empieza creando tu primera clase'))
const urgente = computed(() => (props.hayClases ? lineaUrgente(primero.value) : 'Comparte el código con tus estudiantes y aquí verás lo que necesitan.'))
</script>

<style scoped>
.libreta-portada { width: 92px; height: 92px; border-radius: 22px; align-items: center; justify-content: center; background: var(--heroe-pista); flex: none; }
</style>
