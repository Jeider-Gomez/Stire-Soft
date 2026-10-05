<template>
  <!-- Usuarios y roles (ADM-V02). La página solo organiza: los datos y las llamadas a la API están en
       composables/useGestionUsuarios.ts, cada pestaña y cada ventana es su propio componente (components/admin/). Antes era
       un solo archivo de 1532 líneas («The Blob», PAT-04); docs/DISENO_ARQUITECTURA_FRONTEND.md. -->
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="inline-block mb-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/10 text-semantico-pasa uppercase tracking-wider">Administración del sistema</span>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Usuarios y roles</h1>
        <p class="text-xs text-slate-600 mt-0.5">Control de acceso y permisos según la matriz institucional</p>
      </div>
      <button id="open-register-user-btn" type="button" class="min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar shadow-sm self-start sm:self-auto inline-flex items-center gap-1.5"
        @click="abrir({ tipo: 'registrar' })">
        <UserPlus :size="14" aria-hidden="true" /> Registrar usuario
      </button>
    </header>

    <!-- Pestañas (§23 T4) -->
    <nav class="flex items-center gap-4 border-b border-base-borde-sutil text-xs font-semibold overflow-x-auto whitespace-nowrap" aria-label="Secciones de administración">
      <button v-for="p in PESTANAS" :key="p.id" type="button" class="min-h-[44px] pb-2.5 px-3 -mb-px transition-colors flex items-center gap-1.5"
        :class="pestana === p.id ? 'border-b-2 border-acento-ambar-fuerte text-acento-ambar-fuerte font-bold' : 'text-slate-600 hover:text-base-texto-primario'"
        :aria-current="pestana === p.id ? 'true' : undefined" @click="pestana = p.id">
        <component :is="p.icono" :size="14" aria-hidden="true" /><span>{{ p.texto }}</span>
        <span v-if="p.id === 'usuarios'" class="px-1.5 py-0.5 rounded-full bg-base-bg-secundario text-[10px] text-slate-600 font-normal">{{ gestion.usuarios.value.length }}</span>
        <span v-else-if="p.id === 'solicitudes'" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
          :class="pendientes > 0 ? 'bg-acento-ambar-fuerte text-base-blanco' : 'bg-base-bg-secundario text-slate-600 font-normal'">{{ pendientes }}</span>
      </button>
    </nav>

    <!-- Resultado de la última acción (§23 T2 / T4) -->
    <div v-if="gestion.error.value" role="alert" class="p-3 rounded-lg bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla flex items-center justify-between gap-2">
      <span class="flex items-center gap-2"><TriangleAlert :size="16" aria-hidden="true" /> {{ gestion.error.value }}</span>
      <button type="button" class="min-h-[44px] px-2 text-xs hover:underline" @click="gestion.error.value = ''">Cerrar</button>
    </div>
    <div v-if="gestion.exito.value" role="status" class="p-3 rounded-lg bg-semantico-pasa/10 border border-semantico-pasa/30 text-xs text-semantico-pasa flex items-center justify-between gap-2">
      <span class="flex items-center gap-2"><Check :size="16" aria-hidden="true" /> {{ gestion.exito.value }}</span>
      <button type="button" class="min-h-[44px] px-2 text-xs hover:underline" @click="gestion.exito.value = ''">Cerrar</button>
    </div>

    <AdminTablaUsuarios v-if="pestana === 'usuarios'" :id-propio="authStore.user?.id"
      @cambiar-rol="(u, rol) => abrir({ tipo: 'rol', usuario: u, rol })" @clave="(u) => abrir({ tipo: 'clave', usuario: u })" @activar="(u) => abrir({ tipo: 'activar', usuario: u })" />
    <AdminSolicitudesDocente v-else-if="pestana === 'solicitudes'" @decidir="(s, decision) => abrir({ tipo: 'decision', solicitud: s, decision })" />
    <AdminHistorialRoles v-else-if="pestana === 'roles'" />

    <!-- Una sola ventana a la vez (sin ventanas encima de otras, PAT-04) -->
    <AdminModalCambioRol v-if="ventana?.tipo === 'rol'" :usuario="ventana.usuario" :rol="ventana.rol" @cerrar="ventana = null" />
    <AdminModalDecision v-else-if="ventana?.tipo === 'decision'" :solicitud="ventana.solicitud" :decision="ventana.decision" @cerrar="ventana = null" />
    <AdminModalRegistrar v-else-if="ventana?.tipo === 'registrar'" @cerrar="ventana = null" />
    <AdminModalActivar v-else-if="ventana?.tipo === 'activar'" :usuario="ventana.usuario" @cerrar="ventana = null" />
    <AdminModalClave v-else-if="ventana?.tipo === 'clave'" :usuario="ventana.usuario" @cerrar="ventana = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue'
import { Check, ClipboardList, History, TriangleAlert, UserPlus, Users } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { CLAVE_GESTION_USUARIOS, useGestionUsuarios } from '~/composables/useGestionUsuarios'
import type { Rol, SolicitudRol, UsuarioAdmin } from '~/utils/adminUsuarios'

definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const gestion = useGestionUsuarios()
provide(CLAVE_GESTION_USUARIOS, gestion)

type Pestana = 'usuarios' | 'solicitudes' | 'roles'
const PESTANAS: ReadonlyArray<{ id: Pestana; texto: string; icono: typeof Users }> = [
  { id: 'usuarios', texto: 'Gestión de usuarios', icono: Users },
  { id: 'solicitudes', texto: 'Solicitudes de docente', icono: ClipboardList },
  { id: 'roles', texto: 'Cambios de rol', icono: History },
]
const pestana = ref<Pestana>('usuarios')
const pendientes = computed(() => gestion.solicitudes.value.filter((s) => s.status === 'pending').length)

type Ventana =
  | { tipo: 'rol'; usuario: UsuarioAdmin; rol: Rol }
  | { tipo: 'decision'; solicitud: SolicitudRol; decision: 'approve' | 'reject' }
  | { tipo: 'registrar' }
  | { tipo: 'activar'; usuario: UsuarioAdmin }
  | { tipo: 'clave'; usuario: UsuarioAdmin }
const ventana = ref<Ventana | null>(null)
function abrir(v: Ventana) {
  // Abrir una acción nueva limpia el aviso de la anterior (no se mezclan resultados).
  if (v.tipo === 'rol' || v.tipo === 'decision') gestion.limpiarAvisos()
  ventana.value = v
}

onMounted(() => {
  gestion.cargarUsuarios()
  gestion.cargarSolicitudes()
})
</script>
