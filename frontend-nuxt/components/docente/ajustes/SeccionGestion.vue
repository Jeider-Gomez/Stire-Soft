<template>
  <!-- Estado y gestión de la clase (Archivar y Eliminar) -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 space-y-4" aria-labelledby="gestion-clase-titulo">
    <h2 id="gestion-clase-titulo" class="text-sm font-bold text-base-texto-primario">Estado y gestión de la clase</h2>

    <!-- Archivar / Reactivar clase -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-base-bg-secundario rounded-lg border border-base-borde-sutil">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-base-texto-primario">Estado:</span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold"
            :class="classInfo?.isActive !== false ? 'bg-semantico-pasa/15 text-emerald-800' : 'bg-slate-200 text-slate-700'">
            {{ classInfo?.isActive !== false ? 'Clase activa' : 'Clase archivada' }}
          </span>
        </div>
        <p class="text-[11px] text-slate-600 mt-1">
          {{ classInfo?.isActive !== false
            ? 'Los estudiantes matriculados pueden acceder al curso. Si la archivas, no podrán verla ni enviar entregas, pero se conserva todo su contenido y notas.'
            : 'Esta clase está archivada. Los estudiantes no pueden verla ni enviar entregas. Puedes reactivarla cuando desees.' }}
        </p>
      </div>
      <button
        type="button"
        :disabled="guardandoEstadoClase"
        @click="alternarArchivoClase"
        class="min-h-[44px] px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors shrink-0 self-start sm:self-auto inline-flex items-center gap-1.5 border"
        :class="classInfo?.isActive !== false
          ? 'border-base-borde-fuerte bg-base-blanco text-slate-700 hover:bg-slate-100'
          : 'border-semantico-pasa bg-semantico-pasa/10 text-emerald-800 hover:bg-semantico-pasa/20'">
        <Loader2 v-if="guardandoEstadoClase" :size="13" class="animate-spin" aria-hidden="true" />
        <Archive v-else-if="classInfo?.isActive !== false" :size="13" aria-hidden="true" />
        <Check v-else :size="13" aria-hidden="true" />
        {{ guardandoEstadoClase ? 'Guardando…' : classInfo?.isActive !== false ? 'Archivar clase' : 'Reactivar clase' }}
      </button>
    </div>

    <!-- Zona de peligro: Eliminar clase -->
    <div class="p-4 rounded-lg border border-semantico-falla/30 bg-semantico-falla/5 space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 class="text-xs font-bold text-semantico-falla flex items-center gap-1.5">
            <TriangleAlert :size="14" aria-hidden="true" /> Eliminar clase definitivamente
          </h3>
          <p class="text-[11px] text-slate-700 mt-1 max-w-xl">
            Si la clase fue creada por error y nadie ha trabajado en ella, puedes eliminarla. Si ya tiene contenido o trabajo de estudiantes, te recomendamos <strong>archivarla</strong> para proteger el registro académico.
          </p>
        </div>
        <button
          type="button"
          class="min-h-[44px] px-4 py-2 rounded-md text-xs font-bold bg-semantico-falla text-base-blanco hover:opacity-90 transition-opacity shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto"
          @click="mostrarEliminarClase = true">
          <Trash2 :size="14" aria-hidden="true" />
          Eliminar clase…
        </button>
      </div>
    </div>

    <!-- Diálogo: Confirmar eliminar clase (B4 D3 bis) -->
    <DocenteVentanaEliminarClase
      v-if="mostrarEliminarClase"
      :clase-id="classId"
      :nombre-clase="classInfo?.name || ''"
      :eliminando="eliminandoClase"
      @cerrar="mostrarEliminarClase = false"
      @confirmar="ejecutarEliminarClase"
      @archivar="alternarArchivoClase"
    />
  </section>
</template>

<script setup lang="ts">
import { Archive, Check, Loader2, Trash2, TriangleAlert } from 'lucide-vue-next'
import type { EstadoAjustesClase } from '~/composables/useAjustesClase'

/**
 * «Estado y gestión de la clase» de Ajustes: archivar o reactivar, y eliminar con la ventana de la cuenta regresiva.
 * Los errores van en un aviso: antes se guardaban en variables que ninguna parte de la pantalla mostraba (si eliminar
 * daba 409 porque un estudiante empezó a trabajar, la ventana se quedaba sin explicar nada).
 */
const props = defineProps<{ ajustes: EstadoAjustesClase; classId: number }>()
const { classInfo } = props.ajustes
const { messageOf } = useApiErrorMessage()
const { avisar } = useAvisos()

const guardandoEstadoClase = ref(false)
const mostrarEliminarClase = ref(false)
const eliminandoClase = ref(false)

async function alternarArchivoClase() {
  if (!classInfo.value) return
  guardandoEstadoClase.value = true
  try {
    await props.ajustes.alternarArchivoClase()
    mostrarEliminarClase.value = false
  } catch (err: unknown) {
    avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo cambiar el estado de la clase.') })
  } finally {
    guardandoEstadoClase.value = false
  }
}

async function ejecutarEliminarClase() {
  eliminandoClase.value = true
  try {
    await props.ajustes.eliminarClase()
    mostrarEliminarClase.value = false
    await navigateTo('/docente')
  } catch (err: unknown) {
    avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo eliminar la clase.') })
  } finally {
    eliminandoClase.value = false
  }
}
</script>
