<template>
  <!-- Una lección abierta a la derecha del árbol (prototipo del panel v2): su ruta, su nombre, su estado y tres pestañas,
       sin ventanas encima. «Lección» es la explicación que se edita aquí mismo; «Actividades», sus ejercicios; «Ajustes»,
       su nombre, dificultad y visibilidad. El Asistente puede escribir la explicación o los ejercicios de esta lección. -->
  <section :aria-labelledby="`editor-${leccion.id}`" class="space-y-4">
    <div class="space-y-1">
      <p class="text-[11px] text-base-texto-secundario">
        <button type="button" class="hover:underline" @click="$emit('volver')">Curso</button> › {{ ruta.modulo }} › {{ ruta.tema }}
      </p>
      <div class="flex flex-wrap items-center gap-2">
        <h2 :id="`editor-${leccion.id}`" class="text-lg font-bold text-base-texto-primario">{{ leccion.title }}</h2>
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
        class="min-h-[36px] px-4 rounded-full" :class="pestana === p.id ? 'bg-base-blanco text-base-texto-primario shadow-sm' : 'text-base-texto-secundario'" @click="pestana = p.id">
        {{ p.texto }}
      </button>
    </div>

    <div v-show="pestana === 'leccion'" id="panel-leccion" role="tabpanel" aria-labelledby="pestana-leccion">
      <UnitLessonsModal :unit="{ id: leccion.id, title: leccion.title }" incrustado />
    </div>
    <div v-if="pestana === 'actividades'" id="panel-actividades" role="tabpanel" aria-labelledby="pestana-actividades" class="space-y-2">
      <p class="text-xs text-base-texto-secundario">La práctica se corrige sola y cuenta para el dominio. Lo que está en borrador no lo ve el estudiante.</p>
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
import { computed, ref } from 'vue'
import { Archive, Pencil, Sparkles } from 'lucide-vue-next'
import UnitLessonsModal from '~/components/docente/UnitLessonsModal.vue'
import { TEXTO_ESTADO, estadoDeLeccion, faltasDeLeccion, type EstadoLeccion, type LeccionConConteos } from '~/utils/estadoCurso'
import type { LeccionDelArbol } from '~/utils/contenidosCurso'

type Leccion = LeccionDelArbol & LeccionConConteos
const props = defineProps<{ leccion: Leccion; ruta: { modulo: string; tema: string }; classId: number }>()
defineEmits<{ volver: []; editar: [l: Leccion]; archivar: [l: Leccion]; ejercicios: [n: number] }>()

const PESTANAS = [{ id: 'leccion', texto: 'Lección' }, { id: 'actividades', texto: 'Actividades' }, { id: 'ajustes', texto: 'Ajustes' }] as const
const pestana = ref<(typeof PESTANAS)[number]['id']>('leccion')
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
