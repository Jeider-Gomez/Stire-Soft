<template>
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden text-xs" aria-labelledby="historial-roles-titulo">
    <div class="p-4 border-b border-base-borde-sutil flex items-start justify-between gap-3">
      <div>
        <h2 id="historial-roles-titulo" class="font-bold text-sm text-base-texto-primario">Cambios de rol</h2>
        <p class="text-base-texto-secundario mt-0.5">Cada vez que una cuenta cambia de rol queda aquí: cuándo, de qué rol a cuál y quién lo hizo.</p>
      </div>
      <button type="button" class="min-h-[44px] sm:min-h-0 px-2.5 py-1.5 rounded-md borde-afordancia inline-flex items-center gap-1.5 shrink-0" :disabled="cargando" @click="cargar">
        <RefreshCw :size="13" aria-hidden="true" :class="cargando ? 'animate-spin' : ''" /> Actualizar
      </button>
    </div>

    <p v-if="error" role="alert" class="p-4 text-semantico-falla">{{ error }}</p>
    <p v-else-if="cargando && !cambios.length" class="p-8 text-center text-base-texto-secundario">Cargando…</p>
    <p v-else-if="!cambios.length" class="p-8 text-center text-base-texto-secundario">Todavía no hay cambios de rol registrados.</p>

    <ul v-else class="divide-y divide-base-borde-sutil">
      <li v-for="c in cambios" :key="c.id" class="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <time :datetime="c.fecha" class="text-base-texto-secundario whitespace-nowrap sm:w-52 shrink-0">{{ fecha(c.fecha) }}</time>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-base-texto-primario truncate">
            {{ c.usuario?.fullName || c.usuario?.email || 'Cuenta eliminada' }}
            <span v-if="c.usuario?.fullName" class="font-normal font-codigo text-[10px] text-base-texto-secundario">{{ c.usuario.email }}</span>
          </p>
          <p class="text-base-texto-secundario">
            de <strong class="text-base-texto-primario">{{ nombreRol(c.rolAnterior) }}</strong>
            a <strong class="text-base-texto-primario">{{ nombreRol(c.rolNuevo) }}</strong>
          </p>
        </div>
        <p class="text-base-texto-secundario sm:text-right sm:w-56 shrink-0">
          {{ c.origen === 'solicitud_docente' ? 'Aprobó la solicitud' : 'Lo cambió' }}:
          <span class="text-base-texto-primario">{{ c.cambiadoPor?.fullName || c.cambiadoPor?.email || 'no se sabe' }}</span>
        </p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'

interface Persona { id: number; email: string; fullName: string }
interface CambioDeRol {
  id: number; fecha: string; rolAnterior: string; rolNuevo: string; origen: 'panel_admin' | 'solicitud_docente'
  usuario: Persona | null; cambiadoPor: Persona | null
}

const api = useApi()
const cambios = ref<CambioDeRol[]>([])
const cargando = ref(false)
const error = ref('')

const ROLES: Record<string, string> = { admin: 'administrador', docente: 'docente', estudiante: 'estudiante' }
const nombreRol = (r: string) => ROLES[r] ?? r
const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    cambios.value = await api.get<CambioDeRol[]>('/users/cambios-de-rol')
  } catch {
    error.value = 'No se pudo cargar el historial de cambios de rol.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>
