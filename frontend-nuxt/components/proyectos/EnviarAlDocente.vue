<template>
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-3 text-xs" aria-labelledby="enviar-titulo">
    <h2 id="enviar-titulo" class="text-sm font-bold text-base-texto-primario flex items-center gap-1.5">
      <Send :size="15" class="text-acento-ambar-fuerte" aria-hidden="true" /> Enviar al docente
    </h2>
    <p v-if="cargando" class="text-base-texto-secundario">Cargando…</p>
    <template v-else-if="datos">
      <p class="text-base-texto-secundario">
        El docente recibe una copia de cómo está tu proyecto ahora. Puedes seguir editándolo: lo que envías no cambia.
        Hasta {{ datos.versionesPorClase }} versiones por clase.
      </p>
      <p v-if="datos.destinos.length === 0" class="text-base-texto-secundario bg-base-bg-secundario rounded-md p-3">
        Ninguna de tus clases está recibiendo proyectos por ahora. Tu docente lo activa cuando quiera revisarlos.
      </p>
      <form v-else novalidate @submit.prevent="enviar" class="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div class="flex-1 min-w-0">
          <label for="enviar-clase" class="block font-semibold text-base-texto-primario mb-1">Clase</label>
          <select id="enviar-clase" v-model="claseElegida" class="w-full max-w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco">
            <option v-for="d in datos.destinos" :key="d.classId" :value="d.classId">{{ d.nombre }}</option>
          </select>
        </div>
        <button type="submit" :disabled="enviando || !puedeEnviar"
          class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
          <Loader2 v-if="enviando" :size="14" class="animate-spin" aria-hidden="true" /><Send v-else :size="14" aria-hidden="true" />
          Enviar
        </button>
      </form>
      <p v-if="!puedeEnviar && datos.destinos.length" class="text-[11px] text-base-texto-secundario">Espera a que se guarden tus cambios para enviar.</p>
      <p v-if="mensaje" role="status" class="text-semantico-exito font-semibold">{{ mensaje }}</p>
      <p v-if="error" role="alert" class="text-semantico-falla">{{ error }}</p>

      <div v-if="datos.envios.length" class="space-y-2">
        <h3 class="font-bold text-base-texto-primario">Lo que has enviado</h3>
        <ul class="space-y-2">
          <li v-for="e in datos.envios" :key="e.id" class="rounded-md border border-base-borde-sutil p-2.5 space-y-1">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="font-semibold text-base-texto-primario">{{ e.clase }} · versión {{ e.version }}</span>
              <span class="text-[11px] text-base-texto-secundario">{{ fecha(e.createdAt) }}</span>
            </div>
            <p v-if="!e.revisadoAt" class="text-[11px] text-base-texto-secundario">Sin revisar todavía.</p>
            <p v-if="e.nota !== null" class="text-base-texto-primario">Nota: <strong>{{ e.nota.toFixed(1).replace(".", ",") }}</strong> de 5,0</p>
            <p v-if="e.comentario" class="text-base-texto-primario whitespace-pre-wrap bg-base-bg-secundario rounded p-2">{{ e.comentario }}</p>
            <button type="button" @click="descargarVersion(e.id)" class="text-[11px] font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1">
              <Download :size="12" aria-hidden="true" /> Descargar esta versión (.zip)
            </button>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Download, Loader2, Send } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { descargarZip } from '~/utils/descargaProyecto'
import type { ArchivoProyecto } from '~/utils/proyectoNavegador'

const props = defineProps<{ proyectoId: number; puedeEnviar: boolean }>()

interface Envio { id: number; classId: number; clase: string; version: number; nota: number | null; comentario: string | null; revisadoAt: string | null; createdAt: string }
interface Datos { destinos: Array<{ classId: number; nombre: string }>; versionesPorClase: number; envios: Envio[] }

const api = useApi()
const { messageOf } = useApiErrorMessage()
const datos = ref<Datos | null>(null)
const cargando = ref(true)
const claseElegida = ref<number | null>(null)
const enviando = ref(false)
const mensaje = ref<string | null>(null)
const error = ref<string | null>(null)

const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const nombreClase = (id: number) => datos.value?.destinos.find((d) => d.classId === id)?.nombre ?? 'la clase'

async function cargar() {
  try {
    datos.value = await api.get<Datos>(`/proyecto-envios/proyecto/${props.proyectoId}`)
    if (claseElegida.value === null) claseElegida.value = datos.value.destinos[0]?.classId ?? null
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar a qué clases puedes enviar.')
  } finally {
    cargando.value = false
  }
}

async function enviar() {
  if (claseElegida.value === null) return
  enviando.value = true
  mensaje.value = null
  error.value = null
  try {
    const r = await api.post<{ version: number }>('/proyecto-envios', { proyectoId: props.proyectoId, classId: claseElegida.value })
    mensaje.value = `Enviado: versión ${r.version} para ${nombreClase(claseElegida.value)}.`
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo enviar el proyecto.')
  } finally {
    enviando.value = false
  }
}

async function descargarVersion(id: number) {
  try {
    const e = await api.get<{ titulo: string; version: number; archivos: ArchivoProyecto[] }>(`/proyecto-envios/${id}`)
    descargarZip(`${e.titulo} v${e.version}`, e.archivos)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo descargar la versión.')
  }
}

onMounted(cargar)
</script>
