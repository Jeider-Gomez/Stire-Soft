<template>
  <!-- Pestaña «Gestión de usuarios» (ADM-V02): búsqueda, filtro por rol y la tabla con el menú «Acciones» de cada uno.
       Las acciones se piden a la página (eventos); esta pestaña solo muestra. -->
  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
    <div class="w-full sm:w-72">
      <label for="user-search" class="sr-only">Buscar usuario por nombre o correo</label>
      <input id="user-search" v-model="busqueda" type="text" placeholder="Buscar por nombre o correo..."
        class="w-full min-h-[44px] px-3 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
    </div>
    <div class="flex items-center gap-2 w-full sm:w-auto">
      <label for="role-filter" class="text-slate-600 text-xs">Filtrar por rol:</label>
      <select id="role-filter" v-model="filtroRol" class="min-h-[44px] px-2.5 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte text-xs outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 focus:border-acento-ambar-fuerte">
        <option value="todos">Todos los roles</option>
        <option value="estudiante">Estudiantes</option>
        <option value="docente">Docentes</option>
        <option value="administrador">Administradores</option>
      </select>
    </div>
  </section>

  <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-xs text-left">
        <thead class="bg-base-bg-secundario text-slate-600 border-b border-base-borde-sutil">
          <tr>
            <th scope="col" class="p-3 font-semibold">Usuario</th>
            <th scope="col" class="p-3 font-semibold">Correo institucional</th>
            <th scope="col" class="p-3 font-semibold">Rol asignado</th>
            <th scope="col" class="p-3 font-semibold">Estado</th>
            <th scope="col" class="p-3 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-base-borde-sutil">
          <tr v-if="gestion.cargandoUsuarios.value">
            <td colspan="5" class="p-8 text-center text-slate-600"><Loader2 :size="14" class="inline-block animate-spin mr-2" aria-hidden="true" /> Cargando usuarios…</td>
          </tr>
          <tr v-else-if="filtrados.length === 0">
            <td colspan="5" class="p-8 text-center text-slate-600">No se encontraron usuarios que coincidan con la búsqueda o filtro.</td>
          </tr>
          <tr v-for="u in filtrados" :key="u.id" class="hover:bg-base-bg-primario/60 transition-colors">
            <td class="p-3 font-bold text-base-texto-primario flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-base-bg-secundario border border-base-borde-fuerte flex items-center justify-center text-[10px] uppercase font-bold" aria-hidden="true">{{ (u.fullName || u.email || '?')[0] }}</span>
              <span>{{ u.fullName || 'Usuario sin nombre' }}</span>
            </td>
            <td class="p-3 font-codigo text-slate-600">{{ u.email }}</td>
            <td class="p-3">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="{
                'bg-acento-ambar/15 text-acento-ambar-fuerte': u.role === 'estudiante',
                'bg-semantico-info/15 text-semantico-info': u.role === 'docente',
                'bg-semantico-pasa/10 text-semantico-pasa': u.role === 'admin' || u.role === 'administrador' }">{{ u.role }}</span>
            </td>
            <td class="p-3">
              <span class="flex items-center gap-1.5 font-medium" :class="u.isActive !== false ? 'text-semantico-pasa' : 'text-slate-600'">
                <span class="w-1.5 h-1.5 rounded-full" :class="u.isActive !== false ? 'bg-semantico-pasa' : 'bg-base-borde-fuerte'" aria-hidden="true" />
                <span>{{ u.isActive !== false ? 'Activo' : 'Inactivo' }}</span>
              </span>
            </td>
            <td class="p-3 text-right">
              <span v-if="u.id === idPropio" class="inline-block px-2 py-1 rounded bg-base-bg-secundario border border-base-borde-sutil text-[10px] text-slate-600 font-medium">Tu propia cuenta (protegida)</span>
              <div v-else class="inline-block text-left">
                <button :id="`acciones-btn-${u.id}`" type="button" :aria-expanded="abierto === u.id" aria-haspopup="menu" :aria-label="`Acciones para ${u.fullName || u.email}`"
                  class="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 px-2.5 py-1.5 rounded-md border border-base-borde-fuerte text-[11px] font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  @click.stop="alternarMenu(u.id, $event)">
                  Acciones <ChevronDown :size="14" aria-hidden="true" />
                </button>
                <div v-if="abierto === u.id" role="menu" :style="estiloMenu" class="fixed z-50 w-56 rounded-lg border border-base-borde-sutil bg-base-blanco shadow-lg py-1 text-left text-xs" @click.stop>
                  <p class="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Cambiar rol</p>
                  <button v-for="r in otrosRoles(u)" :key="r.value" type="button" role="menuitem" class="w-full flex items-center gap-2 px-3 py-2 hover:bg-base-bg-secundario text-base-texto-primario"
                    @click="cerrarMenu(); emit('cambiar-rol', u, r.value)">
                    <UserCog :size="14" aria-hidden="true" /> Cambiar a {{ r.label }}
                  </button>
                  <div class="my-1 border-t border-base-borde-sutil" />
                  <button type="button" role="menuitem" class="w-full flex items-center gap-2 px-3 py-2 hover:bg-base-bg-secundario text-base-texto-primario" @click="cerrarMenu(); emit('clave', u)">
                    <KeyRound :size="14" aria-hidden="true" /> Restablecer contraseña
                  </button>
                  <button type="button" role="menuitem" class="w-full flex items-center gap-2 px-3 py-2 hover:bg-base-bg-secundario" :class="u.isActive !== false ? 'text-semantico-falla' : 'text-semantico-pasa'"
                    @click="cerrarMenu(); emit('activar', u)">
                    <component :is="u.isActive !== false ? UserX : UserCheck" :size="14" aria-hidden="true" />
                    {{ u.isActive !== false ? 'Desactivar cuenta' : 'Reactivar cuenta' }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronDown, KeyRound, Loader2, UserCheck, UserCog, UserX } from 'lucide-vue-next'
import { filtrarUsuarios, otrosRoles, type Rol, type UsuarioAdmin } from '~/utils/adminUsuarios'
import { useGestionUsuariosDeLaPagina } from '~/composables/useGestionUsuarios'

defineProps<{ idPropio?: number }>()
const emit = defineEmits<{ 'cambiar-rol': [UsuarioAdmin, Rol]; clave: [UsuarioAdmin]; activar: [UsuarioAdmin] }>()
const gestion = useGestionUsuariosDeLaPagina()
const busqueda = ref('')
const filtroRol = ref('todos')
const filtrados = computed(() => filtrarUsuarios(gestion.usuarios.value, busqueda.value, filtroRol.value))

// Menú «Acciones» en posición fija junto al botón: la tabla se desplaza de lado y recortaría un menú absoluto.
const abierto = ref<number | null>(null)
const estiloMenu = ref<Record<string, string>>({})
function alternarMenu(id: number, e: MouseEvent) {
  if (abierto.value === id) { abierto.value = null; return }
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const right = `${window.innerWidth - r.right}px`
  estiloMenu.value = r.bottom + 230 > window.innerHeight ? { right, bottom: `${window.innerHeight - r.top + 4}px` } : { right, top: `${r.bottom + 4}px` }
  abierto.value = id
}
function cerrarMenu() {
  abierto.value = null
}
onMounted(() => {
  document.addEventListener('click', cerrarMenu)
  window.addEventListener('scroll', cerrarMenu, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', cerrarMenu)
  window.removeEventListener('scroll', cerrarMenu, true)
})
useEscapeToClose(() => abierto.value !== null, cerrarMenu)
</script>
