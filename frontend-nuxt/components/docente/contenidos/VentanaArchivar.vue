<template>
  <!-- B3 D2: VentanaArchivar única para módulo, tema y lección.
       Base común de ventanas (foco inicial en Cancelar, Tab atrapado, Escape). -->
  <AdminDialogo
    :id-titulo="`archivar-${nivel}-titulo`"
    :titulo="titulos[nivel]"
    :subtitulo="titulo"
    :devolver-foco="devolverFoco"
    :id-descripcion="`archivar-${nivel}-desc`"
    clase-icono="bg-semantico-falla/10 text-semantico-falla"
    :ocupado="archivando"
    @cerrar="emit('cerrar')"
  >
    <template #icono><Archive :size="18" aria-hidden="true" /></template>
    <p :id="`archivar-${nivel}-desc`" class="text-xs text-slate-700">
      {{ descripciones[nivel] }}
      No se borra nada: un docente o administrador puede recuperarlo cuando desee.
    </p>
    <p v-if="error" role="alert" class="text-semantico-falla text-[11px]">{{ error }}</p>
    <div class="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        data-foco-inicial
        class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold"
        :disabled="archivando"
        @click="emit('cerrar')"
      >
        Cancelar
      </button>
      <button
        type="button"
        :disabled="archivando"
        class="min-h-[44px] px-5 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
        @click="ejecutarArchivar"
      >
        <Loader2 v-if="archivando" :size="14" class="animate-spin" aria-hidden="true" />
        {{ archivando ? 'Archivando…' : botones[nivel] }}
      </button>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Archive, Loader2 } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { useApiErrorMessage } from '~/composables/useApiErrorMessage'
import { useAvisos } from '~/composables/useAvisos'

const props = defineProps<{
  nivel: 'modulo' | 'tema' | 'leccion'
  id: number
  titulo: string
  devolverFoco?: string
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'archivado'): void
}>()

const api = useApi()
const { messageOf } = useApiErrorMessage()
const { avisar } = useAvisos()

const titulos = {
  modulo: '¿Archivar este módulo?',
  tema: '¿Archivar este tema?',
  leccion: '¿Archivar esta lección?',
}

const descripciones = {
  modulo: 'Los estudiantes dejarán de ver este módulo y todo su contenido.',
  tema: 'Los estudiantes dejarán de ver este tema y sus lecciones.',
  leccion: 'Los estudiantes dejarán de ver esta lección y sus ejercicios.',
}

const botones = {
  modulo: 'Sí, archivar el módulo',
  tema: 'Sí, archivar el tema',
  leccion: 'Sí, archivar la lección',
}

const ruta = {
  modulo: '/sections',
  tema: '/topic',
  leccion: '/learning-unit',
}

const archivando = ref(false)
const error = ref<string | null>(null)

async function ejecutarArchivar() {
  archivando.value = true
  error.value = null
  try {
    await api.patch(`${ruta[props.nivel]}/${props.id}/archivar`, {})
    const etiquetas = { modulo: 'Módulo', tema: 'Tema', leccion: 'Lección' }
    avisar({ tipo: 'exito', texto: `${etiquetas[props.nivel]} «${props.titulo}» archivado.` })
    emit('archivado')
    emit('cerrar')
  } catch (err: unknown) {
    error.value = messageOf(err, `No se pudo archivar el ${props.nivel}.`)
  } finally {
    archivando.value = false
  }
}
</script>
