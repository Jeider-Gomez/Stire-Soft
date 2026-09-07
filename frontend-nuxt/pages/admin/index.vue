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
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o correo..."
          class="w-full px-3 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <span class="text-base-texto-secundario text-xs">Filtrar por rol:</span>
        <select
          v-model="roleFilter"
          class="px-2.5 py-1.5 rounded-md bg-base-blanco border border-base-borde-fuerte text-xs outline-none">
          <option value="todos">Todos los roles</option>
          <option value="estudiante">Estudiantes</option>
          <option value="docente">Docentes</option>
          <option value="administrador">Administradores</option>
        </select>
      </div>
    </section>

    <!-- Tabla de Usuarios (ADM-V02) -->
    <section class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil">
            <tr>
              <th class="p-3 font-semibold">Usuario</th>
              <th class="p-3 font-semibold">Correo Institucional</th>
              <th class="p-3 font-semibold">Rol Asignado</th>
              <th class="p-3 font-semibold">Estado</th>
              <th class="p-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-borde-sutil">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-base-bg-primario/60 transition-colors">
              <td class="p-3 font-bold text-base-texto-primario flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-base-bg-secundario border border-base-borde-fuerte flex items-center justify-center text-[10px]">
                  {{ user.name[0] }}
                </span>
                <span>{{ user.name }}</span>
              </td>
              <td class="p-3 font-codigo text-base-texto-secundario">{{ user.email }}</td>
              <td class="p-3">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="{
                    'bg-acento-ambar/15 text-acento-ambar-fuerte': user.role === 'estudiante',
                    'bg-semantico-info/15 text-semantico-info': user.role === 'docente',
                    'bg-semantico-pasa/15 text-semantico-pasa': user.role === 'administrador'
                  }">
                  {{ user.role }}
                </span>
              </td>
              <td class="p-3">
                <span class="flex items-center gap-1.5 text-semantico-pasa font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-semantico-pasa"></span>
                  <span>Activo</span>
                </span>
              </td>
              <td class="p-3 text-right">
                <button class="borde-afordancia px-2.5 py-1 rounded text-[11px] font-medium text-base-texto-primario hover:bg-base-bg-secundario">
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const searchQuery = ref('')
const roleFilter = ref('todos')

const users = ref([
  { id: 1, name: 'Pedro Romero', email: 'pedro.estudiante@unicor.edu.co', role: 'estudiante' },
  { id: 2, name: 'Ana María Gómez', email: 'ana.gomez@unicor.edu.co', role: 'estudiante' },
  { id: 3, name: 'Prof. Roberto Toscano', email: 'roberto.toscano@unicor.edu.co', role: 'docente' },
  { id: 4, name: 'Prof. Julio Galvis', email: 'julio.galvis@unicor.edu.co', role: 'docente' },
  { id: 5, name: 'Administrador STIRE', email: 'admin.sistema@unicor.edu.co', role: 'administrador' }
])

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = roleFilter.value === 'todos' || u.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})
</script>
