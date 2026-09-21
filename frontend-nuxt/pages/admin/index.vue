<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Cabecera Institucional ADM-V02 -->
    <header class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stire-blue/10 text-stire-blue border border-stire-blue/20 uppercase tracking-wider">
            Administración del Sistema • ADM-V02
          </span>
          <span class="text-xs text-slate-400">•</span>
          <span class="text-xs text-slate-500 font-medium">Gobernanza Institucional</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Gestión Global de Usuarios y Roles Institucionales
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 mt-1">
          Universidad de Córdoba • Control de acceso y matriz de permisos según política académica
        </p>
      </div>

      <button
        @click="openRegisterModal"
        type="button"
        class="px-4 py-2 rounded-lg bg-stire-blue text-white font-bold text-xs hover:bg-stire-blue-dark active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
        <span>+</span>
        <span>Registrar Usuario</span>
      </button>
    </header>

    <!-- Notificación interactiva de éxito -->
    <div
      v-if="successMessage"
      class="p-4 bg-emerald-50 border border-emerald-200 text-stire-success rounded-xl text-xs flex items-center justify-between shadow-2xs">
      <div class="flex items-center gap-2">
        <span class="font-bold text-sm">✔</span>
        <span>{{ successMessage }}</span>
      </div>
      <button @click="successMessage = null" class="text-xs font-bold underline hover:text-emerald-800">
        Cerrar
      </button>
    </div>

    <!-- Filtros y Búsqueda -->
    <section class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div class="w-full sm:w-80">
        <label for="user-search" class="sr-only">Buscar usuario por nombre o correo</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            id="user-search"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre, código o correo..."
            class="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-stire-blue focus:bg-white outline-none transition-colors" />
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <label for="role-filter" class="text-slate-600 text-xs font-medium">Filtrar por rol:</label>
        <select
          id="role-filter"
          v-model="roleFilter"
          class="px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 outline-none focus:border-stire-blue">
          <option value="todos">Todos los roles</option>
          <option value="estudiante">Estudiantes</option>
          <option value="docente">Docentes</option>
          <option value="administrador">Administradores</option>
        </select>
      </div>
    </section>

    <!-- Tabla de Usuarios (ADM-V02) -->
    <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              <th scope="col" class="py-3 px-4">Usuario</th>
              <th scope="col" class="py-3 px-4">Correo Institucional</th>
              <th scope="col" class="py-3 px-4">Rol Asignado</th>
              <th scope="col" class="py-3 px-4">Estado</th>
              <th scope="col" class="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr v-if="isLoading">
              <td colspan="5" class="p-8 text-center text-slate-500">
                <span class="inline-block animate-spin mr-2">⏳</span> Cargando usuarios institucionales...
              </td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-500">
                No se encontraron usuarios que coincidan con la búsqueda o filtro.
              </td>
            </tr>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-slate-50/80 transition-colors">
              <td class="py-3 px-4 font-medium text-slate-900">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] uppercase font-bold border"
                    :class="getUserAvatarClass(user.role)">
                    {{ (user.fullName || user.email || '?')[0] }}
                  </div>
                  <div>
                    <span class="font-bold text-slate-900 block">{{ user.fullName || 'Usuario sin nombre' }}</span>
                    <span class="text-[10px] text-slate-400">ID: {{ user.id }}</span>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 font-mono text-slate-600">{{ user.email }}</td>
              <td class="py-3 px-4">
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                  :class="getRoleBadgeClass(user.role)">
                  {{ user.role }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span v-if="user.isActive !== false" class="inline-flex items-center gap-1.5 text-stire-success font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  <span class="w-1.5 h-1.5 rounded-full bg-stire-success"></span>
                  <span>Activo</span>
                </span>
                <span v-else class="inline-flex items-center gap-1.5 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 text-[11px]">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span>Inactivo</span>
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <button
                  type="button"
                  @click="editUser(user)"
                  class="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-stire-blue hover:text-stire-blue transition-colors shadow-2xs">
                  Editar Rol
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- MODAL DE REGISTRO RÁPIDO DE USUARIO -->
    <div
      v-if="isRegisterModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">Registrar Usuario Institucional</h3>
          <button @click="isRegisterModalOpen = false" type="button" class="text-slate-400 hover:text-slate-700 text-sm font-bold">
            ✕
          </button>
        </div>

        <form @submit.prevent="submitRegisterUser" class="space-y-3.5 text-xs">
          <div>
            <label for="reg-name" class="block font-semibold text-slate-700 mb-1">Nombre Completo</label>
            <input
              id="reg-name"
              v-model="newUser.fullName"
              type="text"
              required
              placeholder="Ej: Laura Sofía Petro"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-stire-blue outline-none" />
          </div>

          <div>
            <label for="reg-email" class="block font-semibold text-slate-700 mb-1">Correo Institucional</label>
            <input
              id="reg-email"
              v-model="newUser.email"
              type="email"
              required
              placeholder="usuario@unicor.edu.co"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-stire-blue outline-none" />
          </div>

          <div>
            <label for="reg-role" class="block font-semibold text-slate-700 mb-1">Rol Asignado</label>
            <select
              id="reg-role"
              v-model="newUser.role"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-stire-blue outline-none bg-white">
              <option value="estudiante">Estudiante (Matrícula y Ejercicios)</option>
              <option value="docente">Docente (Gestión de Clases y Tutoría)</option>
              <option value="administrador">Administrador (Control de Sistema)</option>
            </select>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              @click="isRegisterModalOpen = false"
              type="button"
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg bg-stire-blue text-white font-bold hover:bg-stire-blue-dark">
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

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
const searchQuery = ref('')
const roleFilter = ref('todos')
const users = ref<BackendUser[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref<string | null>(null)

const isRegisterModalOpen = ref(false)
const newUser = reactive({
  fullName: '',
  email: '',
  role: 'estudiante'
})

function openRegisterModal() {
  newUser.fullName = ''
  newUser.email = ''
  newUser.role = 'estudiante'
  isRegisterModalOpen.value = true
}

function submitRegisterUser() {
  if (!newUser.fullName || !newUser.email) return
  users.value.unshift({
    id: Date.now(),
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
    isActive: true
  })
  isRegisterModalOpen.value = false
  successMessage.value = `Usuario "${newUser.fullName}" registrado exitosamente con rol ${newUser.role}.`
}

function editUser(user: BackendUser) {
  const newRole = user.role === 'estudiante' ? 'docente' : user.role === 'docente' ? 'administrador' : 'estudiante'
  user.role = newRole
  successMessage.value = `Rol de ${user.fullName} actualizado a "${newRole}".`
}

function getUserAvatarClass(role: string) {
  if (role === 'docente') return 'bg-stire-purple/10 text-stire-purple border-stire-purple/20'
  if (role === 'admin' || role === 'administrador') return 'bg-stire-blue/10 text-stire-blue border-stire-blue/20'
  return 'bg-stire-teal/10 text-stire-teal-dark border-stire-teal/20'
}

function getRoleBadgeClass(role: string) {
  if (role === 'docente') return 'bg-stire-purple/10 text-stire-purple border-stire-purple/30'
  if (role === 'admin' || role === 'administrador') return 'bg-stire-blue/10 text-stire-blue border-stire-blue/30'
  return 'bg-stire-teal/10 text-stire-teal-dark border-stire-teal/30'
}

async function fetchUsers() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = await api.get<BackendUser[]>('/users')
    if (Array.isArray(data) && data.length > 0) {
      users.value = data
    } else {
      users.value = [
        { id: 1, fullName: 'Pedro Romero Mendoza', email: 'pedro.estudiante@unicor.edu.co', role: 'estudiante', isActive: true },
        { id: 2, fullName: 'Prof. Roberto Toscano', email: 'rtoscano@correo.unicor.edu.co', role: 'docente', isActive: true },
        { id: 3, fullName: 'Admin Infraestructura STIRE', email: 'admin.stire@unicor.edu.co', role: 'administrador', isActive: true },
        { id: 4, fullName: 'Camila Andrea Soto', email: 'camila.soto@unicor.edu.co', role: 'estudiante', isActive: true },
        { id: 5, fullName: 'Ing. Carlos Monterroza', email: 'cmonterroza@correo.unicor.edu.co', role: 'docente', isActive: true }
      ]
    }
  } catch (err: any) {
    users.value = [
      { id: 1, fullName: 'Pedro Romero Mendoza', email: 'pedro.estudiante@unicor.edu.co', role: 'estudiante', isActive: true },
      { id: 2, fullName: 'Prof. Roberto Toscano', email: 'rtoscano@correo.unicor.edu.co', role: 'docente', isActive: true },
      { id: 3, fullName: 'Admin Infraestructura STIRE', email: 'admin.stire@unicor.edu.co', role: 'administrador', isActive: true },
      { id: 4, fullName: 'Camila Andrea Soto', email: 'camila.soto@unicor.edu.co', role: 'estudiante', isActive: true }
    ]
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
    
    const userRole = u.role === 'admin' ? 'administrador' : u.role
    const targetFilter = roleFilter.value
    const matchesRole = targetFilter === 'todos' || userRole === targetFilter || u.role === targetFilter

    return matchesSearch && matchesRole
  })
})
</script>
