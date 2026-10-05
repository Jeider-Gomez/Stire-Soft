<template>
  <!-- Pestaña «Solicitudes de docente» (§23 T4): las pendientes primero; se pueden ver también las resueltas. -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
    <p class="flex items-center gap-2">
      <span class="font-semibold text-base-texto-primario">Estado de solicitudes:</span>
      <span class="text-slate-600">{{ pendientes }} {{ pendientes === 1 ? 'pendiente de revisión' : 'pendientes de revisión' }}</span>
    </p>
    <label class="flex items-center gap-2 min-h-[44px] cursor-pointer select-none text-xs text-base-texto-primario font-medium">
      <input v-model="verTodas" type="checkbox" class="rounded text-acento-ambar-fuerte focus:ring-acento-ambar-fuerte" />
      <span>Ver también aprobadas y rechazadas</span>
    </label>
  </section>

  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-xs text-left">
        <thead class="bg-base-bg-secundario text-slate-600 border-b border-base-borde-sutil">
          <tr>
            <th scope="col" class="p-3 font-semibold">Solicitante</th>
            <th scope="col" class="p-3 font-semibold">Materia o dependencia</th>
            <th scope="col" class="p-3 font-semibold">Fecha</th>
            <th scope="col" class="p-3 font-semibold">Estado</th>
            <th scope="col" class="p-3 font-semibold text-right">Acciones / Resolución</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-base-borde-sutil">
          <tr v-if="gestion.cargandoSolicitudes.value">
            <td colspan="5" class="p-8 text-center text-slate-600"><Loader2 :size="14" class="inline-block animate-spin mr-2" aria-hidden="true" /> Cargando solicitudes…</td>
          </tr>
          <tr v-else-if="mostradas.length === 0">
            <td colspan="5" class="p-8 text-center text-slate-600">{{ verTodas ? 'No se encontraron solicitudes de rol docente.' : 'No hay solicitudes pendientes.' }}</td>
          </tr>
          <tr v-for="s in mostradas" :key="s.id" class="hover:bg-base-bg-primario/60 transition-colors">
            <td class="p-3 font-bold text-base-texto-primario">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-base-bg-secundario border border-base-borde-fuerte flex items-center justify-center text-[10px] uppercase font-bold flex-shrink-0" aria-hidden="true">{{ (s.user?.fullName || s.user?.email || '?')[0] }}</span>
                <div>
                  <div>{{ s.user?.fullName || 'Usuario sin nombre' }}</div>
                  <div class="text-[10px] font-codigo font-normal text-slate-600">{{ s.user?.email }}</div>
                </div>
              </div>
            </td>
            <td class="p-3 text-base-texto-primario max-w-xs">
              <span v-if="s.reason" class="block" :title="s.reason">«{{ s.reason }}»</span>
              <span v-else class="text-slate-600 italic">Sin motivo indicado</span>
            </td>
            <td class="p-3 text-slate-600 whitespace-nowrap">{{ new Date(s.createdAt).toLocaleDateString('es-CO') }}</td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="{
                'bg-acento-ambar/15 text-acento-ambar-fuerte': s.status === 'pending',
                'bg-semantico-pasa/10 text-semantico-pasa': s.status === 'approved',
                'bg-semantico-falla/15 text-semantico-falla': s.status === 'rejected' }">
                {{ s.status === 'pending' ? 'Pendiente' : s.status === 'approved' ? 'Aprobada' : 'Rechazada' }}
              </span>
            </td>
            <td class="p-3 text-right">
              <div v-if="s.status === 'pending'" class="flex items-center justify-end gap-1.5">
                <button :id="`approve-btn-${s.id}`" type="button" class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded bg-semantico-pasa text-base-blanco text-[11px] font-bold hover:opacity-90" @click="emit('decidir', s, 'approve')">Aprobar</button>
                <button :id="`reject-btn-${s.id}`" type="button" class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded border border-semantico-falla text-semantico-falla text-[11px] font-semibold hover:bg-semantico-falla/10" @click="emit('decidir', s, 'reject')">Rechazar</button>
              </div>
              <div v-else class="text-[11px] text-slate-600 text-right space-y-0.5">
                <span v-if="s.reviewNote" class="block italic text-[10px] text-base-texto-primario" :title="s.reviewNote">Nota: «{{ s.reviewNote }}»</span>
                <span class="text-[10px]">{{ s.reviewedAt ? new Date(s.reviewedAt).toLocaleDateString('es-CO') : 'Resuelta' }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { SolicitudRol } from '~/utils/adminUsuarios'
import { useGestionUsuariosDeLaPagina } from '~/composables/useGestionUsuarios'

const emit = defineEmits<{ decidir: [SolicitudRol, 'approve' | 'reject'] }>()
const gestion = useGestionUsuariosDeLaPagina()
const verTodas = ref(false)
const pendientes = computed(() => gestion.solicitudes.value.filter((s) => s.status === 'pending').length)
const mostradas = computed(() => (verTodas.value ? gestion.solicitudes.value : gestion.solicitudes.value.filter((s) => s.status === 'pending')))
</script>
