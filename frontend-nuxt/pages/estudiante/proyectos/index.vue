<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm">
      <h1 class="text-xl font-bold text-base-texto-primario tracking-tight flex items-center gap-2">
        <FolderCode :size="22" class="text-acento-ambar-fuerte" aria-hidden="true" /> Mis proyectos
      </h1>
      <p class="text-xs text-base-texto-secundario mt-1">
        Tu espacio para programar lo que quieras. Tus proyectos son tuyos: solo tú los ves. Se ejecutan en tu navegador.
      </p>
    </header>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando tus proyectos…
    </p>
    <p v-else-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

    <section v-else-if="estado && !estado.disponible" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-xs text-base-texto-secundario space-y-1">
      <p class="font-semibold text-base-texto-primario">Proyectos está en prueba</p>
      <p>Por ahora solo está disponible en algunas clases. Pronto lo tendrás.</p>
    </section>

    <template v-else-if="estado">
      <!-- Crear -->
      <form novalidate @submit.prevent="crearProyecto" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-3 text-xs">
        <h2 class="text-sm font-bold text-base-texto-primario">Nuevo proyecto</h2>
        <div class="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div class="flex-1">
            <label for="proyecto-titulo" class="block font-semibold text-base-texto-primario mb-1">Nombre</label>
            <input id="proyecto-titulo" v-model="nuevo.titulo" type="text" maxlength="100" placeholder="Mi calculadora"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>
          <fieldset class="flex flex-wrap gap-x-4 gap-y-2">
            <legend class="sr-only">Tipo de proyecto</legend>
            <label v-for="valor in TIPOS_QUE_SE_CREAN" :key="valor" class="flex items-center gap-1.5 cursor-pointer min-h-[44px] sm:min-h-0">
              <input v-model="nuevo.tipo" type="radio" :value="valor" name="tipo-proyecto" class="accent-acento-ambar-fuerte" /> {{ TIPO_PROYECTO[valor] }}
            </label>
          </fieldset>
          <button type="submit" :disabled="creando || proyectos.length >= estado.limites.proyectosPorUsuario"
            class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold disabled:opacity-50 inline-flex items-center gap-1.5">
            <Plus :size="14" aria-hidden="true" /> Crear
          </button>
        </div>
        <p v-if="errorCrear" role="alert" class="text-semantico-falla text-[11px]">{{ errorCrear }}</p>
        <p class="text-[11px] text-base-texto-secundario">
          Tienes {{ proyectos.length }} de {{ estado.limites.proyectosPorUsuario }} proyectos. Cada uno admite
          {{ estado.limites.archivosPorProyecto }} archivos y 200 KB de código.
        </p>
      </form>

      <!-- Lista -->
      <section aria-labelledby="lista-proyectos" class="space-y-2">
        <h2 id="lista-proyectos" class="sr-only">Tus proyectos</h2>
        <p v-if="proyectos.length === 0" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-center">
          Todavía no tienes proyectos. Crea el primero arriba.
        </p>
        <ul v-else class="space-y-2">
          <li v-for="p in proyectos" :key="p.id"
            class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <NuxtLink :to="`/estudiante/proyectos/${p.id}`" class="min-w-0 group">
              <span class="font-bold text-sm text-base-texto-primario group-hover:underline flex items-center gap-1.5">
                <Globe v-if="p.tipo === 'web'" :size="14" aria-hidden="true" /><ListOrdered v-else-if="p.tipo === 'pseudocodigo'" :size="14" aria-hidden="true" /><Workflow v-else-if="p.tipo === 'diagrama'" :size="14" aria-hidden="true" /><Braces v-else :size="14" aria-hidden="true" />
                {{ p.titulo }}
              </span>
              <span class="text-[11px] text-base-texto-secundario">
                {{ TIPO_PROYECTO[p.tipo] }} · {{ kb(p.bytes) }} · editado {{ fecha(p.updatedAt) }}
              </span>
            </NuxtLink>
            <div class="flex items-center gap-2 shrink-0">
              <NuxtLink :to="`/estudiante/proyectos/${p.id}`" class="px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-semibold">Abrir</NuxtLink>
              <button v-if="porBorrar !== p.id" type="button" @click="porBorrar = p.id"
                class="p-1.5 rounded text-base-texto-secundario hover:text-semantico-falla hover:bg-semantico-falla/10"
                :aria-label="`Borrar ${p.titulo}`" title="Borrar">
                <Trash2 :size="15" aria-hidden="true" />
              </button>
              <span v-else class="flex items-center gap-1.5" role="group" :aria-label="`Confirmar borrar ${p.titulo}`">
                <span class="text-semantico-falla font-semibold">¿Borrar? No se puede deshacer.</span>
                <button type="button" @click="borrar(p.id)" class="px-2 py-1 rounded bg-semantico-falla text-base-blanco font-bold">Borrar</button>
                <button type="button" @click="porBorrar = null" class="px-2 py-1 rounded borde-afordancia">No</button>
              </span>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Braces, FolderCode, Globe, ListOrdered, Loader2, Plus, Trash2, Workflow } from 'lucide-vue-next'
import { TIPO_PROYECTO, TIPOS_QUE_SE_CREAN, type TipoProyecto } from '~/utils/proyectoNavegador'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'student' })

interface Estado { disponible: boolean; limites: { proyectosPorUsuario: number; archivosPorProyecto: number; bytesPorProyecto: number } }
interface Resumen { id: number; titulo: string; tipo: TipoProyecto; bytes: number; updatedAt: string }

const api = useApi()
const { messageOf } = useApiErrorMessage()
const estado = ref<Estado | null>(null)
const proyectos = ref<Resumen[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)
const nuevo = reactive({ titulo: '', tipo: 'web' as TipoProyecto })
const creando = ref(false)
const errorCrear = ref<string | null>(null)
const porBorrar = ref<number | null>(null)

const kb = (bytes: number) => (bytes < 1024 ? 'menos de 1 KB' : `${Math.round(bytes / 1024)} KB`)
const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

onMounted(async () => {
  try {
    estado.value = await api.get<Estado>('/proyectos/estado')
    if (estado.value.disponible) proyectos.value = await api.get<Resumen[]>('/proyectos')
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar tus proyectos.')
  } finally {
    cargando.value = false
  }
})

async function crearProyecto() {
  errorCrear.value = null
  if (!nuevo.titulo.trim()) { errorCrear.value = 'Ponle un nombre al proyecto.'; return }
  creando.value = true
  try {
    const creado = await api.post<{ id: number }>('/proyectos', { titulo: nuevo.titulo.trim(), tipo: nuevo.tipo })
    await navigateTo(`/estudiante/proyectos/${creado.id}`)
  } catch (err) {
    errorCrear.value = messageOf(err, 'No se pudo crear el proyecto.')
  } finally {
    creando.value = false
  }
}

async function borrar(id: number) {
  try {
    await api.del(`/proyectos/${id}`)
    proyectos.value = proyectos.value.filter((p) => p.id !== id)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo borrar el proyecto.')
  } finally {
    porBorrar.value = null
  }
}
</script>
