<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-4">
      <div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight flex items-center gap-2">
          <FolderCode :size="22" class="text-acento-ambar-fuerte" aria-hidden="true" /> Proyectos de los estudiantes
        </h1>
        <p class="text-xs text-base-texto-secundario mt-1">
          Cada estudiante tiene su espacio para programar lo que quiera. Aquí ves solo lo que te envían: una copia que no cambia
          aunque sigan editando. Puedes ponerle nota, comentario o ambos.
        </p>
      </div>
      <div v-if="clases.length" class="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
        <label for="proyectos-clase" class="font-semibold text-base-texto-primario">Clase</label>
        <select id="proyectos-clase" v-model="claseId" @change="cargarEnvios"
          class="min-w-0 max-w-full w-full sm:w-auto bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-1.5 outline-none focus:border-acento-ambar-fuerte focus:ring-2 focus:ring-acento-ambar-fuerte/30">
          <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div v-if="datos" class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-base-bg-secundario rounded-lg border border-base-borde-sutil text-xs">
        <div>
          <p class="font-semibold text-base-texto-primario">Recibir proyectos en esta clase</p>
          <p class="text-[11px] text-base-texto-secundario mt-0.5">Si está apagado, los estudiantes no pueden enviarte proyectos (lo ya recibido se conserva).</p>
        </div>
        <button type="button" role="switch" :aria-checked="datos.aceptaProyectos" :disabled="cambiando" @click="alternarRecepcion"
          class="px-3 py-1.5 rounded-md font-bold shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50"
          :class="datos.aceptaProyectos ? 'bg-semantico-exito/15 text-semantico-exito' : 'bg-base-borde-sutil text-base-texto-secundario'">
          <Check v-if="datos.aceptaProyectos" :size="13" aria-hidden="true" />
          {{ datos.aceptaProyectos ? 'Recibiendo' : 'Apagado' }}
        </button>
      </div>
    </header>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando…
    </p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    <p v-if="!cargando && clases.length === 0" class="text-xs text-base-texto-secundario">Todavía no tienes clases.</p>

    <section v-if="datos" aria-labelledby="lista-envios" class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 id="lista-envios" class="text-sm font-bold text-base-texto-primario">Recibidos ({{ datos.envios.length }})</h2>
        <fieldset v-if="datos.envios.length" class="flex gap-3 text-xs">
          <legend class="sr-only">Mostrar</legend>
          <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="filtro" type="radio" value="pendientes" name="filtro-envios" class="accent-acento-ambar-fuerte" /> Sin revisar ({{ pendientes }})</label>
          <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="filtro" type="radio" value="todos" name="filtro-envios" class="accent-acento-ambar-fuerte" /> Todos</label>
        </fieldset>
      </div>
      <p v-if="datos.envios.length === 0" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-center">
        {{ datos.aceptaProyectos ? 'Aún no te han enviado proyectos en esta clase.' : 'Activa «Recibir proyectos» para que tus estudiantes puedan enviarte los suyos.' }}
      </p>
      <p v-else-if="visibles.length === 0" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-center">
        Ya revisaste todo lo recibido.
      </p>
      <ul v-else class="space-y-2">
        <li v-for="e in visibles" :key="e.id">
          <NuxtLink :to="`/docente/proyectos/${e.id}`"
            class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-acento-ambar-fuerte group">
            <span class="min-w-0">
              <span class="font-bold text-sm text-base-texto-primario group-hover:underline flex items-center gap-1.5">
                <Globe v-if="e.tipo === 'web'" :size="14" aria-hidden="true" /><Braces v-else :size="14" aria-hidden="true" />
                {{ e.titulo }} <span class="font-normal text-base-texto-secundario">· versión {{ e.version }}</span>
              </span>
              <span class="text-[11px] text-base-texto-secundario">{{ e.estudiante }} · enviado {{ fecha(e.createdAt) }}</span>
            </span>
            <span class="shrink-0 font-semibold" :class="e.revisadoAt ? 'text-semantico-exito' : 'text-acento-ambar-fuerte'">
              {{ e.revisadoAt ? (e.nota !== null ? `Nota ${e.nota.toFixed(1).replace('.', ',')}` : 'Comentado') : 'Sin revisar' }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Braces, Check, FolderCode, Globe, Loader2 } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'teacher' })

interface Clase { id: number; name: string }
interface Envio { id: number; titulo: string; tipo: 'web' | 'javascript'; version: number; estudiante: string; nota: number | null; revisadoAt: string | null; createdAt: string }
interface Datos { aceptaProyectos: boolean; envios: Envio[] }

const api = useApi()
const route = useRoute()
const { messageOf } = useApiErrorMessage()
const clases = ref<Clase[]>([])
const claseId = ref<number | null>(null)
const datos = ref<Datos | null>(null)
const cargando = ref(true)
const cambiando = ref(false)
const error = ref<string | null>(null)
const filtro = ref<'pendientes' | 'todos'>('pendientes')

const pendientes = computed(() => datos.value?.envios.filter((e) => !e.revisadoAt).length ?? 0)
const visibles = computed(() => (datos.value?.envios ?? []).filter((e) => filtro.value === 'todos' || !e.revisadoAt))
const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

async function cargarEnvios() {
  if (claseId.value === null) return
  cargando.value = true
  error.value = null
  try {
    datos.value = await api.get<Datos>(`/proyecto-envios/clase/${claseId.value}`)
    if (pendientes.value === 0) filtro.value = 'todos'
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar los proyectos recibidos.')
  } finally {
    cargando.value = false
  }
}

async function alternarRecepcion() {
  if (!datos.value || claseId.value === null) return
  cambiando.value = true
  error.value = null
  try {
    const clase = await api.patch<{ aceptaProyectos: boolean }>(`/class/${claseId.value}`, { aceptaProyectos: !datos.value.aceptaProyectos })
    datos.value.aceptaProyectos = clase.aceptaProyectos
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cambiar la recepción de proyectos.')
  } finally {
    cambiando.value = false
  }
}

onMounted(async () => {
  try {
    clases.value = await api.get<Clase[]>('/class/my-classes')
    const pedida = Number(route.query.clase)
    claseId.value = clases.value.find((c) => c.id === pedida)?.id ?? clases.value[0]?.id ?? null
    if (claseId.value !== null) await cargarEnvios()
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar tus clases.')
  } finally {
    cargando.value = false
  }
})
</script>
