<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera ADM-V02 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-pasa/15 text-semantico-pasa uppercase tracking-wider">
            Administración del Sistema • ADM-V02
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Gestión Global de Usuarios y Roles
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Control de acceso y permisos según la matriz institucional
        </p>
      </div>

      <button
        class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors shadow-sm self-start sm:self-auto">
        + Registrar Usuario
      </button>
    </header>

    <!-- Filtros y Búsqueda -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div class="w-full sm:w-72">
        <label for="user-search" class="sr-only">Buscar usuario por nombre o correo</label>
        <input
          id="user-search"
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o correo..."
          class="w-full px-3 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <label for="role-filter" class="text-base-texto-secundario text-xs">Filtrar por rol:</label>
        <select
          id="role-filter"
          v-model="roleFilter"
          class="px-2.5 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte text-xs outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 focus:border-acento-ambar-fuerte">
          <option value="todos">Todos los roles</option>
          <option value="estudiante">Estudiantes</option>
          <option value="docente">Docentes</option>
          <option value="administrador">Administradores</option>
        </select>
      </div>
    </section>

    <!-- Alertas de estado y error de la acción (§23 T2) -->
    <div
      v-if="errorMessage"
      role="alert"
      class="p-3 rounded-lg bg-semantico-falla/10 border border-semantico-falla/30 text-xs text-semantico-falla flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span aria-hidden="true">⚠</span>
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="errorMessage = ''" class="text-xs hover:underline">Cerrar</button>
    </div>

    <div
      v-if="successMessage"
      role="status"
      class="p-3 rounded-lg bg-semantico-pasa/10 border border-semantico-pasa/30 text-xs text-semantico-pasa flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span aria-hidden="true">✓</span>
        <span>{{ successMessage }}</span>
      </div>
      <button @click="successMessage = ''" class="text-xs hover:underline">Cerrar</button>
    </div>

    <!-- Tabla de Usuarios (ADM-V02) -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil">
            <tr>
              <th scope="col" class="p-3 font-semibold">Usuario</th>
              <th scope="col" class="p-3 font-semibold">Correo Institucional</th>
              <th scope="col" class="p-3 font-semibold">Rol Asignado</th>
              <th scope="col" class="p-3 font-semibold">Estado</th>
              <th scope="col" class="p-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-borde-sutil">
            <tr v-if="isLoading">
              <td colspan="5" class="p-8 text-center text-base-texto-secundario">
                <span class="inline-block animate-spin mr-2">⏳</span> Cargando usuarios desde la base de datos...
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5" class="p-8 text-center text-base-texto-secundario">
                No se encontraron usuarios que coincidan con la búsqueda o filtro.
              </td>
            </tr>
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-base-bg-primario/60 transition-colors">
              <td class="p-3 font-bold text-base-texto-primario flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-base-bg-secundario border border-base-borde-fuerte flex items-center justify-center text-[10px] uppercase font-bold">
                  {{ (user.fullName || user.email || '?')[0] }}
                </span>
                <span>{{ user.fullName || 'Usuario sin nombre' }}</span>
              </td>
              <td class="p-3 font-codigo text-base-texto-secundario">{{ user.email }}</td>
              <td class="p-3">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  :class="{
                    'bg-acento-ambar/15 text-acento-ambar-fuerte': user.role === 'estudiante',
                    'bg-semantico-info/15 text-semantico-info': user.role === 'docente',
                    'bg-semantico-pasa/15 text-semantico-pasa': user.role === 'admin' || user.role === 'administrador'
                  }">
                  {{ user.role }}
                </span>
              </td>
              <td class="p-3">
                <span v-if="user.isActive !== false" class="flex items-center gap-1.5 text-semantico-pasa font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-semantico-pasa"></span>
                  <span>Activo</span>
                </span>
                <span v-else class="flex items-center gap-1.5 text-base-texto-secundario font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-base-borde-fuerte"></span>
                  <span>Inactivo</span>
                </span>
              </td>
              <td class="p-3 text-right">
                <div v-if="user.id === authStore.user?.id" class="text-right">
                  <span class="inline-block px-2 py-1 rounded bg-base-bg-secundario border border-base-borde-sutil text-[10px] text-base-texto-secundario font-medium">
                    Tu propia cuenta (rol bloqueado)
                  </span>
                </div>
                <div v-else class="flex items-center justify-end gap-2">
                  <label :for="`role-select-${user.id}`" class="sr-only">Cambiar rol de {{ user.fullName || user.email }}</label>
                  <select
                    :id="`role-select-${user.id}`"
                    v-model="userSelectedRoles[user.id]"
                    :disabled="isUpdatingRole && targetUser?.id === user.id"
                    class="px-2 py-1 rounded border border-base-borde-fuerte bg-base-blanco text-[11px] text-base-texto-primario outline-none focus:ring-1 focus:ring-acento-ambar-fuerte">
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <button
                    :id="`change-role-btn-${user.id}`"
                    @click="openChangeRoleModal(user, userSelectedRoles[user.id])"
                    :disabled="isUpdatingRole && targetUser?.id === user.id"
                    class="borde-afordancia px-2.5 py-1 rounded text-[11px] font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50 transition-colors">
                    Cambiar rol
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal accesible de Confirmación de Cambio de Rol (§23 T2) -->
    <div
      v-if="showRoleModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-negro/50 backdrop-blur-sm"
      @click.self="cancelChangeRole">
      <div
        ref="roleDialogRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
        aria-describedby="role-modal-desc"
        tabindex="-1"
        @keydown="handleDialogKeydown"
        class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 max-w-md w-full shadow-xl space-y-4 outline-none">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-acento-ambar/15 text-acento-ambar-fuerte flex items-center justify-center text-lg font-bold flex-shrink-0">
            👤
          </div>
          <div>
            <h3 id="role-modal-title" class="font-bold text-sm text-base-texto-primario">
              Confirmar cambio de rol
            </h3>
            <p class="text-xs text-base-texto-secundario">
              Actualización de permisos institucionales
            </p>
          </div>
        </div>

        <div id="role-modal-desc" class="p-3 rounded-lg bg-base-bg-secundario border border-base-borde-sutil text-xs space-y-2">
          <p class="text-base-texto-primario font-medium">
            {{ roleChangeExplanation }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-base-borde-sutil">
          <button
            ref="cancelRoleBtnRef"
            type="button"
            @click="cancelChangeRole"
            :disabled="isUpdatingRole"
            class="px-4 py-2 rounded-md border border-base-borde-fuerte text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50 transition-colors">
            Cancelar
          </button>
          <button
            ref="confirmRoleBtnRef"
            type="button"
            @click="executeChangeRole"
            :disabled="isUpdatingRole"
            class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar disabled:opacity-50 transition-colors flex items-center gap-2">
            <span v-if="isUpdatingRole" class="inline-block animate-spin">⏳</span>
            <span>{{ isUpdatingRole ? 'Cambiando rol...' : 'Confirmar cambio' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin'
})

interface BackendUser {
  id: number
  fullName: string
  email: string
  role: string
  isActive: boolean
  createdAt?: string
}

const api = useApi()
const authStore = useAuthStore()

const searchQuery = ref('')
const roleFilter = ref('todos')
const users = ref<BackendUser[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Roles seleccionados por usuario en la tabla (§23 T2)
const userSelectedRoles = ref<Record<number, string>>({})

// Estado del modal de confirmación (§23 T2)
const showRoleModal = ref(false)
const targetUser = ref<BackendUser | null>(null)
const targetRole = ref<'estudiante' | 'docente' | 'admin'>('estudiante')
const isUpdatingRole = ref(false)

const roleDialogRef = ref<HTMLElement | null>(null)
const cancelRoleBtnRef = ref<HTMLButtonElement | null>(null)
const confirmRoleBtnRef = ref<HTMLButtonElement | null>(null)
const lastFocusedBtnId = ref<string | null>(null)

const roleChangeExplanation = computed(() => {
  if (!targetUser.value) return ''
  const name = targetUser.value.fullName || targetUser.value.email
  const currentRole = targetUser.value.role === 'admin' ? 'administrador' : targetUser.value.role
  const newRole = targetRole.value

  if (newRole === 'docente') {
    return `${name} pasará de ${currentRole} a docente. Podrá crear clases, diseñar actividades y ver a los estudiantes de sus clases.`
  } else if (newRole === 'admin') {
    return `${name} pasará de ${currentRole} a administrador. Tendrá acceso global a la gestión del sistema, usuarios y métricas.`
  } else {
    return `${name} pasará de ${currentRole} a estudiante. Tendrá acceso a las clases en las que se matricule y no podrá gestionar clases.`
  }
})

function openChangeRoleModal(user: BackendUser, newRole: string) {
  targetUser.value = user
  targetRole.value = (newRole === 'administrador' ? 'admin' : newRole) as 'estudiante' | 'docente' | 'admin'
  errorMessage.value = ''
  successMessage.value = ''
  lastFocusedBtnId.value = `change-role-btn-${user.id}`
  showRoleModal.value = true
}

function cancelChangeRole() {
  if (isUpdatingRole.value) return
  showRoleModal.value = false
  if (lastFocusedBtnId.value) {
    nextTick(() => {
      document.getElementById(lastFocusedBtnId.value!)?.focus()
    })
  }
}

watch(showRoleModal, (open) => {
  if (open) {
    nextTick(() => cancelRoleBtnRef.value?.focus())
  }
})

function handleDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    cancelChangeRole()
    return
  }
  if (event.key === 'Tab') {
    if (!roleDialogRef.value) return
    const focusable = Array.from(
      roleDialogRef.value.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

async function executeChangeRole() {
  if (!targetUser.value) return
  isUpdatingRole.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await api.patch<{ message: string }>(`/users/${targetUser.value.id}/role`, {
      role: targetRole.value
    })

    // Actualizar fila localmente sin recargar toda la lista (§23 T2)
    const userInList = users.value.find(u => u.id === targetUser.value!.id)
    if (userInList) {
      userInList.role = targetRole.value
      userSelectedRoles.value[userInList.id] = targetRole.value
    }
    successMessage.value = res?.message || `Rol de ${targetUser.value.fullName || targetUser.value.email} actualizado a ${targetRole.value}.`
    showRoleModal.value = false
    if (lastFocusedBtnId.value) {
      nextTick(() => {
        document.getElementById(lastFocusedBtnId.value!)?.focus()
      })
    }
  } catch (err: any) {
    const serverMsg = err?.data?.message || err?.message || 'Error al actualizar el rol del usuario.'
    errorMessage.value = Array.isArray(serverMsg) ? serverMsg.join('. ') : serverMsg
    showRoleModal.value = false
    if (lastFocusedBtnId.value) {
      nextTick(() => {
        document.getElementById(lastFocusedBtnId.value!)?.focus()
      })
    }
  } finally {
    isUpdatingRole.value = false
  }
}

async function fetchUsers() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await api.get<BackendUser[]>('/users')
    if (Array.isArray(data)) {
      users.value = data
      for (const u of data) {
        userSelectedRoles.value[u.id] = u.role === 'administrador' ? 'admin' : u.role
      }
    }
  } catch (err: any) {
    console.error('[STIRE Admin] Error cargando usuarios:', err)
    errorMessage.value = 'No se pudieron cargar los usuarios de la base de datos.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const name = u.fullName || ''
    const email = u.email || ''
    const matchesSearch = name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          email.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // Normalizar admin / administrador para el filtro
    const userRole = u.role === 'admin' ? 'administrador' : u.role
    const targetFilter = roleFilter.value
    const matchesRole = targetFilter === 'todos' || userRole === targetFilter || u.role === targetFilter

    return matchesSearch && matchesRole
  })
})
</script>
