<template>
  <!-- Crear un módulo, un tema o una lección: una sola ventana sobre la base común (foco inicial, Tab atrapado, Escape).
       Antes eran tres ventanas casi iguales hechas a mano en CurriculumBuilderModals.vue, sin Tab atrapado. -->
  <AdminDialogo
    :id-titulo="`crear-${nivel}-titulo`"
    :titulo="TEXTOS[nivel].titulo"
    :subtitulo="TEXTOS[nivel].subtitulo"
    :id-descripcion="`crear-${nivel}-desc`"
    clase-icono="bg-acento-ambar/15 text-acento-ambar-fuerte"
    :ocupado="guardando"
    @cerrar="$emit('cerrar')"
  >
    <template #icono><Plus :size="18" aria-hidden="true" /></template>

    <form :id="`crear-${nivel}-desc`" class="space-y-4 text-xs" @submit.prevent="crear">
      <div>
        <label :for="`crear-${nivel}-titulo-campo`" class="block font-semibold text-base-texto-primario mb-1">
          {{ TEXTOS[nivel].etiqueta }} *
        </label>
        <input
          :id="`crear-${nivel}-titulo-campo`"
          v-model="titulo"
          data-foco-inicial
          type="text"
          required
          maxlength="200"
          :placeholder="TEXTOS[nivel].ejemplo"
          class="w-full min-h-[44px] px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
      </div>

      <div>
        <label :for="`crear-${nivel}-descripcion`" class="block font-semibold text-base-texto-primario mb-1">Descripción (opcional)</label>
        <textarea v-crece
          :id="`crear-${nivel}-descripcion`"
          v-model="descripcion"
          rows="3"
          :placeholder="TEXTOS[nivel].ejemploDescripcion"
          class="w-full min-h-[44px] px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario" />
      </div>

      <div v-if="nivel === 'leccion'">
        <label for="crear-leccion-dificultad" class="block font-semibold text-base-texto-primario mb-1">Nivel de dificultad</label>
        <select id="crear-leccion-dificultad" v-model="dificultad"
          class="w-full min-h-[44px] px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario">
          <option value="basico">Básico</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
      </div>

      <div v-if="nivel === 'modulo'" class="p-3 bg-base-bg-secundario rounded-md border border-base-borde-sutil text-[11px] text-slate-600">
        El módulo se creará como <strong class="text-base-texto-primario">Borrador</strong>. Los estudiantes no lo verán hasta que lo publiques.
      </div>

      <p v-if="error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>

      <div class="flex items-center justify-end gap-3 pt-1">
        <button type="button" class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario" :disabled="guardando" @click="$emit('cerrar')">
          Cancelar
        </button>
        <button type="submit" :disabled="guardando"
          class="min-h-[44px] px-5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 inline-flex items-center gap-2">
          <Loader2 v-if="guardando" :size="14" class="animate-spin" aria-hidden="true" />
          {{ guardando ? 'Creando…' : TEXTOS[nivel].boton }}
        </button>
      </div>
    </form>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { Loader2, Plus } from 'lucide-vue-next'
import type { LeccionDelArbol, ModuloDelArbol, TemaDelArbol } from '~/utils/contenidosCurso'

type Nivel = 'modulo' | 'tema' | 'leccion'
const props = defineProps<{
  nivel: Nivel
  /** Dónde se crea: la clase (módulo), el módulo (tema) o el tema (lección). */
  padreId: number
  orden: number
}>()
const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'creado', creado: ModuloDelArbol | TemaDelArbol | LeccionDelArbol): void
}>()

const TEXTOS: Record<Nivel, { titulo: string; subtitulo: string; etiqueta: string; ejemplo: string; ejemploDescripcion: string; boton: string; error: string; vacio: string; aviso: string }> = {
  modulo: { titulo: 'Nuevo módulo curricular', subtitulo: 'Agrupa temas del curso', etiqueta: 'Título del módulo', ejemplo: 'Ej. Módulo 1: Fundamentos de programación', ejemploDescripcion: 'Breve resumen de las competencias que cubre este módulo...', boton: 'Crear módulo', error: 'Error al crear el módulo.', vacio: 'El título del módulo es obligatorio.', aviso: 'Módulo «%s» creado.' },
  tema: { titulo: 'Nuevo tema curricular', subtitulo: 'Agrupa lecciones del módulo', etiqueta: 'Título del tema', ejemplo: 'Ej. Variables, tipos y operadores', ejemploDescripcion: 'Descripción del tema temático...', boton: 'Crear tema', error: 'No se pudo crear el tema.', vacio: 'Ponle un título al tema.', aviso: 'Tema «%s» creado.' },
  leccion: { titulo: 'Nueva lección', subtitulo: 'Explicación y ejercicios del tema', etiqueta: 'Título de la lección', ejemplo: 'Ej. Declaración de variables let y const', ejemploDescripcion: 'Qué aprende el estudiante en esta lección…', boton: 'Crear lección', error: 'No se pudo crear la lección.', vacio: 'Ponle un título a la lección.', aviso: 'Lección «%s» creada.' },
}

const acciones = useContenidosAcciones()
const { messageOf } = useApiErrorMessage()
const { avisar } = useAvisos()

const titulo = ref('')
const descripcion = ref('')
const dificultad = ref<'basico' | 'intermedio' | 'avanzado'>('basico')
const guardando = ref(false)
const error = ref<string | null>(null)

async function crear() {
  const t = titulo.value.trim()
  if (!t) { error.value = TEXTOS[props.nivel].vacio; return }
  guardando.value = true
  error.value = null
  try {
    const datos = { title: t, description: descripcion.value.trim() || undefined, order: props.orden }
    const creado = props.nivel === 'modulo'
      ? await acciones.crearModulo(props.padreId, datos)
      : props.nivel === 'tema'
        ? await acciones.crearTema(props.padreId, datos)
        : await acciones.crearLeccion(props.padreId, { ...datos, difficulty: dificultad.value })
    emit('creado', creado)
    avisar({ tipo: 'exito', texto: TEXTOS[props.nivel].aviso.replace('%s', t) })
    emit('cerrar')
  } catch (err: unknown) {
    error.value = messageOf(err, TEXTOS[props.nivel].error)
  } finally {
    guardando.value = false
  }
}
</script>
