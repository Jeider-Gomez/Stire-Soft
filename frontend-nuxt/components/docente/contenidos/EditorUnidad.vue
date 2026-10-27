<template>
  <!-- Una lección abierta a la derecha del árbol (prototipo del panel v2): su ruta, su nombre, su estado y tres pestañas,
       sin ventanas encima. «Lección» es la explicación que se edita aquí mismo; «Actividades», sus ejercicios; «Ajustes»,
       su nombre, dificultad y visibilidad. El Asistente puede escribir la explicación o los ejercicios de esta lección. -->
  <section :aria-labelledby="`editor-${leccion.id}`" class="space-y-4">
    <div class="space-y-1">
      <p class="text-[11px] text-base-texto-secundario">
        <button type="button" class="hover:underline" @click="$emit('volver')">Curso</button> ›
        <button type="button" class="hover:underline" @click="$emit('ir-grupo', 'modulo', ruta.moduloId)">{{ ruta.modulo }}</button> ›
        <button type="button" class="hover:underline" @click="$emit('ir-grupo', 'tema', ruta.temaId)">{{ ruta.tema }}</button>
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <!-- El nombre se cambia aquí mismo (como en el prototipo): se guarda al salir del campo o con Enter. -->
        <h2 :id="`editor-${leccion.id}`" class="sr-only">{{ leccion.title }}</h2>
        <label :for="`nombre-leccion-${leccion.id}`" class="sr-only">Nombre de la lección</label>
        <input :id="`nombre-leccion-${leccion.id}`" v-model="nombre" maxlength="200"
          class="min-w-0 flex-1 sm:flex-none sm:w-auto text-lg font-bold text-base-texto-primario bg-transparent rounded-md px-1 -mx-1 border border-transparent hover:border-base-borde-sutil focus:border-base-borde-fuerte focus:outline-none focus:ring-2 focus:ring-stire-blue/20"
          :size="Math.max(8, nombre.length)" @keydown.enter.prevent="($event.target as HTMLInputElement).blur()" @keydown.esc="nombre = leccion.title" @blur="renombrar" />
        <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2 py-0.5" :class="CLASE_ESTADO[estado]">
          <span class="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />{{ TEXTO_ESTADO[estado] }}
        </span>
        <button type="button" class="ml-auto inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-full border border-base-borde-sutil text-xs font-semibold text-stire-blue hover:bg-stire-blue/5"
          @click="asistenteAbierto = true">
          <Sparkles :size="13" aria-hidden="true" /> Pedírselo al Asistente
        </button>
      </div>
      <p v-if="faltas.length && estado !== 'oculta'" class="text-xs text-amber-800">Falta: {{ faltas.join(' y ') }}.</p>
    </div>

    <div role="tablist" aria-label="Partes de la lección" class="inline-flex p-0.5 rounded-full bg-base-bg-secundario border border-base-borde-sutil text-xs font-semibold">
      <button v-for="p in PESTANAS" :id="`pestana-${p.id}`" :key="p.id" type="button" role="tab" :aria-selected="pestana === p.id" :aria-controls="`panel-${p.id}`"
        class="min-h-[36px] px-4 rounded-full" :class="pestana === p.id ? 'bg-base-blanco text-base-texto-primario shadow-sm' : 'text-base-texto-secundario'" @click="$emit('update:pestana', p.id)">
        {{ p.texto }}
      </button>
    </div>

    <div v-show="pestana === 'leccion'" id="panel-leccion" role="tabpanel" aria-labelledby="pestana-leccion">
      <UnitLessonsModal :unit="{ id: leccion.id, title: leccion.title }" incrustado />
    </div>
    <div v-if="pestana === 'actividades'" id="panel-actividades" role="tabpanel" aria-labelledby="pestana-actividades" class="space-y-2">
      <p class="text-xs text-base-texto-secundario">Lo que está en borrador no lo ve el estudiante.</p>
      <DocenteUnitExercisesPanel :unit-id="leccion.id" :class-id="classId" @count="$emit('ejercicios', $event)" />
    </div>
    <div v-if="pestana === 'ajustes'" id="panel-ajustes" role="tabpanel" aria-labelledby="pestana-ajustes" class="space-y-3 text-sm">
      <dl class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1.5 text-xs">
        <dt class="text-base-texto-secundario">Dificultad</dt><dd class="text-base-texto-primario capitalize">{{ dificultad }}</dd>
        <dt class="text-base-texto-secundario">Visible</dt><dd class="text-base-texto-primario">{{ leccion.isActive === false ? 'No: está archivada' : 'Sí' }}</dd>
        <dt class="text-base-texto-secundario">Descripción</dt><dd class="text-base-texto-primario">{{ leccion.description || '—' }}</dd>
      </dl>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="btn-stire-secondary min-h-[40px]" @click="$emit('editar', leccion)"><Pencil :size="14" aria-hidden="true" /> Cambiar nombre y dificultad</button>
        <button v-if="leccion.isActive !== false" type="button" class="btn-stire-secondary min-h-[40px]" @click="$emit('archivar', leccion)"><Archive :size="14" aria-hidden="true" /> Ocultar (archivar)</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Archive, Pencil, Sparkles } from 'lucide-vue-next'
import UnitLessonsModal from '~/components/docente/UnitLessonsModal.vue'
import { TEXTO_ESTADO, estadoDeLeccion, faltasDeLeccion, type EstadoLeccion, type LeccionConConteos, type PestanaLeccion } from '~/utils/estadoCurso'
import type { LeccionDelArbol } from '~/utils/contenidosCurso'

type Leccion = LeccionDelArbol & LeccionConConteos
const props = defineProps<{ leccion: Leccion; ruta: { modulo: string; tema: string; moduloId: number; temaId: number }; classId: number; pestana: PestanaLeccion }>()
const emit = defineEmits<{
  volver: []; editar: [l: Leccion]; archivar: [l: Leccion]; ejercicios: [n: number]
  'ir-grupo': [nivel: 'modulo' | 'tema', id: number]; 'update:pestana': [p: PestanaLeccion]; renombrar: [titulo: string]
}>()

const PESTANAS: ReadonlyArray<{ id: PestanaLeccion; texto: string }> = [{ id: 'leccion', texto: 'Lección' }, { id: 'actividades', texto: 'Actividades' }, { id: 'ajustes', texto: 'Ajustes' }]
const nombre = ref(props.leccion.title)
watch(() => props.leccion.title, (t) => { nombre.value = t })
function renombrar() {
  const t = nombre.value.trim()
  if (!t) { nombre.value = props.leccion.title; return }
  if (t !== props.leccion.title) emit('renombrar', t)
}
const asistenteAbierto = useState('asistente-abierto', () => false)
const estado = computed(() => estadoDeLeccion(props.leccion))
const faltas = computed(() => faltasDeLeccion(props.leccion))
const dificultad = computed(() => ({ basico: 'básico', intermedio: 'intermedio', avanzado: 'avanzado' } as Record<string, string>)[props.leccion.difficulty ?? ''] ?? '—')
const CLASE_ESTADO: Record<EstadoLeccion, string> = {
  lista: 'bg-semantico-pasa/10 text-semantico-pasa',
  falta: 'bg-amber-50 text-amber-800',
  oculta: 'bg-base-bg-secundario text-base-texto-secundario',
}
</script>
