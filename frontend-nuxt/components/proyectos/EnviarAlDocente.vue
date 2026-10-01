<template>
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm space-y-3 text-xs" aria-labelledby="enviar-titulo">
    <h2 id="enviar-titulo" class="text-sm font-bold text-base-texto-primario flex items-center gap-1.5">
      <Send :size="15" class="text-acento-ambar-fuerte" aria-hidden="true" /> Entregar a tu docente
    </h2>
    <p v-if="cargando" class="text-base-texto-secundario">Cargando…</p>
    <template v-else>
      <p v-if="abiertas.length === 0" class="text-base-texto-secundario bg-base-bg-secundario rounded-md p-3">
        No tienes entregas abiertas para este tipo de proyecto. Cuando tu docente cree una, aparecerá aquí y en tu inicio.
      </p>
      <form v-else novalidate @submit.prevent="enviar" class="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div class="flex-1 min-w-0">
          <label for="enviar-entrega" class="block font-semibold text-base-texto-primario mb-1">Entrega</label>
          <select id="enviar-entrega" v-model="elegida" class="w-full max-w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco">
            <option v-for="e in abiertas" :key="e.id" :value="e.id">
              {{ e.titulo }} · {{ e.versionesUsadas }} de {{ e.limite }}{{ e.cierraAt ? ` · cierra ${fechaCorta(e.cierraAt)}` : '' }}
            </option>
          </select>
        </div>
        <button type="submit" :disabled="enviando || !puedeEnviar"
          class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
          <Loader2 v-if="enviando" :size="14" class="animate-spin" aria-hidden="true" /><Send v-else :size="14" aria-hidden="true" />
          Entregar
        </button>
      </form>
      <p v-if="!puedeEnviar && abiertas.length" class="text-[11px] text-base-texto-secundario">Espera a que se guarden tus cambios para entregar.</p>
      <p v-if="mensaje" role="status" class="text-semantico-exito font-semibold">
        {{ mensaje }} <NuxtLink v-if="ultimaEntrega" :to="`/estudiante/entregas/${ultimaEntrega}`" class="underline">Ver la entrega</NuxtLink>
      </p>
      <p v-if="error" role="alert" class="text-semantico-falla">{{ error }}</p>
    </template>
  </section>
</template>

<script setup lang="ts">
// Desde el editor: entregar este proyecto a una de las entregas abiertas que creó el docente
// (docs/DISENO_INTERVENCION_DOCENTE.md §3). El historial y la revisión se ven en la página de la entrega.
import { onMounted, ref } from 'vue'
import { Loader2, Send } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { fechaCorta } from '~/utils/entregas'

const props = defineProps<{ proyectoId: number; puedeEnviar: boolean }>()

interface Abierta { id: number; titulo: string; cierraAt: string | null; versionesUsadas: number; limite: number }

const api = useApi()
const { messageOf } = useApiErrorMessage()
const abiertas = ref<Abierta[]>([])
const cargando = ref(true)
const elegida = ref<number | null>(null)
const enviando = ref(false)
const mensaje = ref<string | null>(null)
const ultimaEntrega = ref<number | null>(null)
const error = ref<string | null>(null)

async function cargar() {
  try {
    abiertas.value = await api.get<Abierta[]>(`/entregas/abiertas/proyecto/${props.proyectoId}`)
    if (!abiertas.value.some((e) => e.id === elegida.value)) elegida.value = abiertas.value[0]?.id ?? null
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar tus entregas.')
  } finally {
    cargando.value = false
  }
}

async function enviar() {
  if (elegida.value === null) return
  enviando.value = true
  mensaje.value = null
  error.value = null
  const id = elegida.value
  try {
    const r = await api.post<{ version: number }>(`/entregas/${id}/enviar`, { proyectoId: props.proyectoId })
    mensaje.value = `Entregaste la versión ${r.version}.`
    ultimaEntrega.value = id
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo entregar.')
  } finally {
    enviando.value = false
  }
}

onMounted(cargar)
</script>
