<template>
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden text-xs" aria-labelledby="acciones-admin-titulo">
    <div class="p-4 border-b border-base-borde-sutil flex items-start justify-between gap-3">
      <div>
        <h2 id="acciones-admin-titulo" class="font-bold text-sm text-base-texto-primario">Acciones de administradores</h2>
        <p class="text-base-texto-secundario mt-0.5">Quién cambió un rol, decidió una solicitud o desactivó una cuenta, y cuándo.</p>
      </div>
      <button type="button" class="min-h-[44px] sm:min-h-0 px-2.5 py-1.5 rounded-md borde-afordancia inline-flex items-center gap-1.5 shrink-0" :disabled="cargando" @click="cargar">
        <RefreshCw :size="13" aria-hidden="true" :class="cargando ? 'animate-spin' : ''" /> Actualizar
      </button>
    </div>

    <MensajeError v-if="error" class="p-4">{{ error }}</MensajeError>
    <p v-else-if="cargando && !acciones.length" class="p-8 text-center text-base-texto-secundario">Cargando…</p>
    <p v-else-if="!acciones.length" class="p-8 text-center text-base-texto-secundario">Todavía no hay acciones registradas.</p>

    <ul v-else class="divide-y divide-base-borde-sutil">
      <li v-for="a in acciones" :key="a.id" class="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <time :datetime="a.createdAt" class="text-base-texto-secundario whitespace-nowrap sm:w-52 shrink-0">{{ fecha(a.createdAt) }}</time>
        <p class="flex-1 min-w-0 text-base-texto-primario">
          <strong>{{ NOMBRES[a.accion] ?? a.accion }}</strong>
          <span v-if="a.detalle" class="text-base-texto-secundario"> · {{ a.detalle }}</span>
        </p>
        <p class="text-base-texto-secundario sm:text-right shrink-0">Administrador n.º {{ a.adminId }}<template v-if="a.objetivoId"> · cuenta n.º {{ a.objetivoId }}</template></p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { useAccionesAdmin, type AccionAdminVista } from '~/composables/useAccionesAdmin'

const accionesAdmin = useAccionesAdmin()
const acciones = ref<AccionAdminVista[]>([])
const cargando = ref(false)
const error = ref('')

const NOMBRES: Record<string, string> = {
  cambiar_rol: 'Cambió un rol',
  decidir_solicitud: 'Decidió una solicitud de docente',
  desactivar_usuario: 'Desactivó una cuenta',
}
const fecha = (iso: string) => new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    acciones.value = await accionesAdmin.cargar()
  } catch {
    error.value = 'No se pudo cargar el registro de acciones.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>
