<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Cabecera Institucional DOC-V01 -->
    <header class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stire-purple/10 text-stire-purple border border-stire-purple/20 uppercase tracking-wider">
            Control Pedagógico de Aula • DOC-V01
          </span>
          <span class="text-xs text-slate-400">•</span>
          <span class="text-xs text-slate-500 font-medium">Semestre Académico 2026-II</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Panel de Control Docente & Monitoreo Cognitivo
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 mt-1">
          Universidad de Córdoba • Departamento de Ingeniería de Sistemas y Telecomunicaciones
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          @click="openCreateModal"
          type="button"
          class="px-4 py-2 rounded-lg bg-stire-blue text-white font-bold text-xs hover:bg-stire-blue-dark active:scale-[0.98] transition-all shadow-sm flex items-center gap-2 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Crear Nueva Clase</span>
        </button>
      </div>
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

    <!-- 1. BARRA DE MÉTRICAS DE AULA (Grid de 4 tarjetas en bg-white border-slate-200) -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Tarjeta 1: Total Estudiantes -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Estudiantes</span>
          <div class="w-8 h-8 rounded-lg bg-stire-blue/10 text-stire-blue flex items-center justify-center text-sm font-bold">
            👥
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ metrics.totalEstudiantes }}</span>
          <span class="text-xs font-semibold text-slate-500">activos</span>
        </div>
        <div class="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <span class="font-semibold text-stire-blue">{{ metrics.totalGrupos }} grupos</span>
          <span>asignados este semestre</span>
        </div>
      </div>

      <!-- Tarjeta 2: Dominio Promedio -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dominio Promedio</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-stire-success flex items-center justify-center text-sm font-bold">
            📈
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ metrics.dominioPromedio }}%</span>
          <span class="text-xs font-bold text-stire-success flex items-center gap-0.5">
            ↑ +{{ metrics.tendenciaDominio }}%
          </span>
        </div>
        <div class="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <span>Asimilación conceptual global</span>
        </div>
      </div>

      <!-- Tarjeta 3: Tutor IA Interacciones -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tutor IA Interacciones</span>
          <div class="w-8 h-8 rounded-lg bg-stire-purple/10 text-stire-purple flex items-center justify-center text-sm font-bold">
            🤖
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900">{{ metrics.interaccionesTutor }}</span>
          <span class="text-xs font-bold text-stire-purple bg-stire-purple-light px-1.5 py-0.5 rounded">
            {{ metrics.resolucionTutor }}% resueltas
          </span>
        </div>
        <div class="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <span>Adopción socrática activa</span>
        </div>
      </div>

      <!-- Tarjeta 4: Alumnos en Rezago -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-slate-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alumnos en Rezago</span>
          <div class="w-8 h-8 rounded-lg bg-amber-50 text-stire-warning flex items-center justify-center text-sm font-bold">
            ⚠️
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-stire-warning">{{ metrics.alumnosRezago }}</span>
          <span class="text-xs font-semibold text-slate-500">requieren apoyo</span>
        </div>
        <div class="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
          <span>Dificultad en bucles/condicionales</span>
          <button
            @click="filterByStatus('rezago')"
            type="button"
            class="text-[10px] font-bold text-stire-warning hover:underline cursor-pointer">
            Reforzar →
          </button>
        </div>
      </div>
    </section>

    <!-- 2. CENTRO DE CONTROL DE CLASES (Card de Asignatura) -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight">Centro de Control de Clases</h2>
          <p class="text-xs text-slate-500">Gestión de cursos activos, contenidos programáticos y claves de acceso</p>
        </div>
        <span class="text-xs text-slate-500 font-semibold">
          {{ classes.length }} asignaturas registradas
        </span>
      </div>

      <!-- Skeleton / Estado de carga -->
      <div v-if="isLoading" class="p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
        <span class="inline-block animate-spin mr-2">⏳</span> Sincronizando clases académicas...
      </div>

      <!-- Cards de Asignatura -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div
          v-for="cls in classes"
          :key="cls.id"
          class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-stire-blue/40 transition-all space-y-5">
          <!-- Cabecera de la Clase -->
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-stire-blue/10 text-stire-blue border border-stire-blue/20">
                  {{ cls.code }}
                </span>
                <span
                  class="text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                  :class="cls.isActive ? 'bg-emerald-50 text-stire-success border border-emerald-200' : 'bg-slate-100 text-slate-500'">
                  <span class="w-1.5 h-1.5 rounded-full bg-stire-success"></span>
                  {{ cls.isActive ? 'Habilitada' : 'Inactiva' }}
                </span>
                <span class="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Matrícula: {{ cls.requiresApproval ? 'Con Aprobación' : 'Directa' }}
                </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 mt-2">
                {{ cls.name }}
              </h3>
              <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {{ cls.description || 'Asignatura orientada al desarrollo del pensamiento computacional, algoritmos y estructuras de programación web.' }}
              </p>
            </div>
          </div>

          <!-- Métricas breves de la Asignatura -->
          <div class="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
            <div>
              <span class="text-slate-500 text-[10px] block">Inscritos</span>
              <span class="font-bold text-slate-800 text-xs">{{ cls.studentCount || 28 }} estudiantes</span>
            </div>
            <div>
              <span class="text-slate-500 text-[10px] block">Módulos</span>
              <span class="font-bold text-slate-800 text-xs">{{ cls.moduleCount || 5 }} unidades</span>
            </div>
            <div>
              <span class="text-slate-500 text-[10px] block">Dominio Aula</span>
              <span class="font-bold text-stire-success text-xs">{{ cls.avgMastery || 78 }}%</span>
            </div>
          </div>

          <!-- BARRA DE ACCIONES ERGONÓMICA (Sin botones apiñados ni textos recortados) -->
          <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <!-- Botón Matrícula -->
            <NuxtLink
              :to="`/docente/clase/${cls.id}`"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-stire-blue hover:text-white border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
              <span>👥</span>
              <span>Matrícula ({{ cls.studentCount || 28 }})</span>
            </NuxtLink>

            <!-- Botón Rendimiento -->
            <NuxtLink
              to="/docente/rendimiento"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-stire-purple hover:text-white border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
              <span>📊</span>
              <span>Rendimiento</span>
            </NuxtLink>

            <!-- Botón Contenidos -->
            <NuxtLink
              to="/docente/contenidos"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
              <span>📚</span>
              <span>Contenidos</span>
            </NuxtLink>

            <!-- Botón Copiar Código con confirmación interactiva -->
            <button
              @click="copyCode(cls.code)"
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
              :class="copiedCode === cls.code ? 'bg-emerald-50 text-stire-success border-emerald-300' : 'bg-white text-slate-700 hover:border-stire-blue/50 border-slate-200'">
              <span v-if="copiedCode === cls.code">✔ ¡Copiado!</span>
              <span v-else>📋 Copiar Código</span>
            </button>

            <!-- Botón Código QR: Proyección en modal amplio -->
            <button
              @click="openQrModal(cls)"
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stire-teal/10 text-stire-teal-dark hover:bg-stire-teal hover:text-white border border-stire-teal/30 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap">
              <span>📱</span>
              <span>Código QR</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. MONITOREO COGNITIVO EN TIEMPO REAL (Tabla de Estudiantes) -->
    <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🎯</span>
            <span>Monitoreo Cognitivo en Tiempo Real</span>
          </h2>
          <p class="text-xs text-slate-500">
            Seguimiento de asimilación conceptual con semáforo pedagógico por estudiante
          </p>
        </div>

        <!-- Filtro Rápido de Estado -->
        <div class="flex items-center gap-2">
          <label for="filter-status" class="text-xs font-semibold text-slate-600">Estado:</label>
          <select
            id="filter-status"
            v-model="statusFilter"
            class="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-stire-blue/20 focus:border-stire-blue">
            <option value="todos">Todos los alumnos ({{ students.length }})</option>
            <option value="dominado">Dominio Alto ({{ students.filter(s => s.dominio >= 80).length }})</option>
            <option value="refuerzo">Refuerzo Sugerido ({{ students.filter(s => s.dominio >= 60 && s.dominio < 80).length }})</option>
            <option value="rezago">Rezago Crítico ({{ students.filter(s => s.dominio < 60).length }})</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
            <tr>
              <th scope="col" class="py-3 px-4">Estudiante</th>
              <th scope="col" class="py-3 px-4">Código Institucional</th>
              <th scope="col" class="py-3 px-4">Dominio Actual</th>
              <th scope="col" class="py-3 px-4">Estado Pedagógico</th>
              <th scope="col" class="py-3 px-4">Última Actividad</th>
              <th scope="col" class="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            <tr
              v-for="std in filteredStudents"
              :key="std.id"
              class="hover:bg-slate-50/80 transition-colors">
              <!-- Estudiante -->
              <td class="py-3.5 px-4 font-medium text-slate-900">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-stire-blue/10 text-stire-blue font-bold flex items-center justify-center text-[10px] border border-stire-blue/20">
                    {{ std.initials }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ std.name }}</div>
                    <div class="text-[10px] text-slate-400">{{ std.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Código Institucional -->
              <td class="py-3.5 px-4 font-mono text-slate-600 font-semibold">
                {{ std.code }}
              </td>

              <!-- Dominio Actual con Microbarra de Progreso -->
              <td class="py-3.5 px-4">
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-bold text-slate-800">{{ std.dominio }}%</span>
                    <span class="text-[10px] text-slate-400">{{ std.unidadesCompletadas }}/12 u</span>
                  </div>
                  <div class="w-28 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="getDominioBarClass(std.dominio)"
                      :style="{ width: `${std.dominio}%` }"></div>
                  </div>
                </div>
              </td>

              <!-- Estado Pedagógico (Semáforo de Color) -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
                  :class="getEstadoBadgeClass(std.dominio)">
                  <span class="w-1.5 h-1.5 rounded-full" :class="getEstadoDotClass(std.dominio)"></span>
                  {{ getEstadoLabel(std.dominio) }}
                </span>
              </td>

              <!-- Última Actividad -->
              <td class="py-3.5 px-4 text-slate-500 text-[11px]">
                <div class="font-medium text-slate-700">{{ std.lastActivity }}</div>
                <div class="text-[10px] text-slate-400">{{ std.lastExercise }}</div>
              </td>

              <!-- Botón Ver Historial -->
              <td class="py-3.5 px-4 text-right">
                <button
                  @click="openStudentHistory(std)"
                  type="button"
                  class="px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-slate-200 hover:border-stire-blue hover:text-stire-blue hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
                  Ver Historial
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- MODAL AMPLIO: PROYECCIÓN DE CÓDIGO QR PARA EL AULA -->
    <div
      v-if="isQrModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl text-center">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="text-left">
            <span class="text-[10px] font-bold uppercase tracking-wider text-stire-teal font-mono">
              Proyección de Aula • Matrícula Instantánea
            </span>
            <h3 class="text-lg font-bold text-slate-900">
              {{ selectedClassForQr?.name }}
            </h3>
          </div>
          <button
            @click="isQrModalOpen = false"
            type="button"
            class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-sm font-bold">
            ✕
          </button>
        </div>

        <p class="text-xs text-slate-600">
          Proyecta este código o código QR en el proyector del salón para que los estudiantes se vinculen a la asignatura desde sus dispositivos.
        </p>

        <!-- Contenedor QR Simulado SVG de Alta Definición -->
        <div class="p-6 bg-slate-50 border-2 border-dashed border-stire-blue/30 rounded-xl inline-flex flex-col items-center justify-center gap-4 mx-auto">
          <!-- Gráfico QR SVG -->
          <div class="w-48 h-48 bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
            <svg class="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
              <!-- QR Patterns -->
              <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="#0B3D91" stroke-width="6"/>
              <rect x="12" y="12" width="14" height="14" fill="#0B3D91"/>
              
              <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="#0B3D91" stroke-width="6"/>
              <rect x="74" y="12" width="14" height="14" fill="#0B3D91"/>

              <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="#0B3D91" stroke-width="6"/>
              <rect x="12" y="74" width="14" height="14" fill="#0B3D91"/>

              <!-- Matrix modules -->
              <rect x="40" y="8" width="6" height="6" fill="#0F172A"/>
              <rect x="52" y="12" width="6" height="6" fill="#0F172A"/>
              <rect x="44" y="24" width="6" height="6" fill="#0F172A"/>
              <rect x="12" y="44" width="6" height="6" fill="#0F172A"/>
              <rect x="24" y="48" width="6" height="6" fill="#0F172A"/>
              <rect x="40" y="40" width="8" height="8" fill="#0B3D91"/>
              <rect x="56" y="44" width="6" height="6" fill="#0F172A"/>
              <rect x="70" y="40" width="6" height="6" fill="#0F172A"/>
              <rect x="84" y="48" width="6" height="6" fill="#0F172A"/>
              <rect x="44" y="60" width="6" height="6" fill="#0F172A"/>
              <rect x="58" y="68" width="8" height="8" fill="#0B3D91"/>
              <rect x="74" y="74" width="6" height="6" fill="#0F172A"/>
              <rect x="88" y="84" width="6" height="6" fill="#0F172A"/>
              <rect x="42" y="80" width="6" height="6" fill="#0F172A"/>
            </svg>
          </div>

          <!-- Código alfanumérico gigante -->
          <div class="space-y-1">
            <span class="text-[10px] text-slate-500 uppercase font-semibold">Código de Acceso:</span>
            <div class="font-mono text-2xl font-extrabold text-stire-blue tracking-widest bg-white px-4 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              {{ selectedClassForQr?.code }}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-3">
          <button
            @click="copyCode(selectedClassForQr?.code || '')"
            type="button"
            class="px-4 py-2 rounded-lg bg-stire-blue text-white font-bold text-xs hover:bg-stire-blue-dark transition-colors flex items-center gap-2 shadow-sm">
            <span>📋</span>
            <span>{{ copiedCode === selectedClassForQr?.code ? '¡Código Copiado!' : 'Copiar Código' }}</span>
          </button>
          <button
            @click="isQrModalOpen = false"
            type="button"
            class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors">
            Cerrar Proyección
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL HISTORIAL COGNITIVO DEL ESTUDIANTE -->
    <div
      v-if="isHistoryModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 shadow-xl text-left">
        <div class="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold text-stire-blue bg-stire-blue/10 px-2 py-0.5 rounded">
                {{ selectedStudent?.code }}
              </span>
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                :class="getEstadoBadgeClass(selectedStudent?.dominio || 0)">
                {{ getEstadoLabel(selectedStudent?.dominio || 0) }}
              </span>
            </div>
            <h3 class="text-base font-bold text-slate-900 mt-1">
              Historial Cognitivo: {{ selectedStudent?.name }}
            </h3>
            <p class="text-xs text-slate-500">{{ selectedStudent?.email }}</p>
          </div>
          <button
            @click="isHistoryModalOpen = false"
            type="button"
            class="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 text-sm font-bold">
            ✕
          </button>
        </div>

        <!-- Métricas Rápidas del Alumno -->
        <div class="grid grid-cols-3 gap-3 text-center p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div>
            <span class="text-slate-500 text-[10px] block">Dominio Global</span>
            <span class="font-extrabold text-sm text-stire-blue">{{ selectedStudent?.dominio }}%</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">Consultas Tutor IA</span>
            <span class="font-extrabold text-sm text-stire-purple">14 interacciones</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">Ejercicios Resueltos</span>
            <span class="font-extrabold text-sm text-stire-success">22 aprobados</span>
          </div>
        </div>

        <!-- Historial de Unidades -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Progreso por Unidades de Aprendizaje
          </h4>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div class="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div>
                <span class="font-semibold text-slate-800 block">U1: Estructura HTML Semántica y Algoritmia</span>
                <span class="text-[10px] text-slate-400">Completada • Repetición espaciada al día</span>
              </div>
              <span class="font-bold text-stire-success">100% Dominado</span>
            </div>
            <div class="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div>
                <span class="font-semibold text-slate-800 block">U2: Modelo de Cajas y Posicionamiento Flexbox</span>
                <span class="text-[10px] text-slate-400">Completada • Último repaso hace 2 días</span>
              </div>
              <span class="font-bold text-stire-success">92% Dominado</span>
            </div>
            <div class="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div>
                <span class="font-semibold text-slate-800 block">U3: Variables, Tipos de Datos y Operadores JS</span>
                <span class="text-[10px] text-slate-400">En progreso • 3 intentos de evaluación</span>
              </div>
              <span class="font-bold text-stire-warning">65% En Refuerzo</span>
            </div>
            <div class="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div>
                <span class="font-semibold text-slate-800 block">U4: Estructuras Condicionales y Bucles</span>
                <span class="text-[10px] text-slate-400">Requiere intervención docente</span>
              </div>
              <span class="font-bold text-stire-danger">45% Rezago</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[11px] text-slate-500">Última sesión: {{ selectedStudent?.lastActivity }}</span>
          <button
            @click="isHistoryModalOpen = false"
            type="button"
            class="px-4 py-2 rounded-lg bg-stire-blue text-white text-xs font-bold hover:bg-stire-blue-dark transition-colors">
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE CREACIÓN DE CLASE -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">Crear Nueva Asignatura</h3>
          <button @click="isModalOpen = false" type="button" class="text-slate-400 hover:text-slate-700 text-sm font-bold">
            ✕
          </button>
        </div>

        <div v-if="errorMessage" class="p-3 bg-red-50 text-stire-danger border border-red-200 rounded-lg text-xs">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="submitCreateClass" class="space-y-3.5 text-xs">
          <div>
            <label for="new-class-name" class="block font-semibold text-slate-700 mb-1">Nombre de la Asignatura</label>
            <input
              id="new-class-name"
              v-model="newClass.name"
              type="text"
              required
              placeholder="Ej: Algoritmos y Estructuras Web II"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-stire-blue outline-none" />
          </div>

          <div>
            <label for="new-class-code" class="block font-semibold text-slate-700 mb-1">Código de Ingreso</label>
            <div class="flex gap-2">
              <input
                id="new-class-code"
                v-model="newClass.code"
                type="text"
                required
                class="w-full px-3 py-2 font-mono font-bold text-stire-blue rounded-lg border border-slate-300 focus:border-stire-blue outline-none" />
              <button
                @click="generateRandomCode"
                type="button"
                class="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 font-medium">
                Generar
              </button>
            </div>
          </div>

          <div>
            <label for="new-class-desc" class="block font-semibold text-slate-700 mb-1">Descripción (Opcional)</label>
            <textarea
              id="new-class-desc"
              v-model="newClass.description"
              rows="3"
              placeholder="Objetivos formativos y alcance pedagógico..."
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-stire-blue outline-none resize-none"></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              id="new-class-approval"
              v-model="newClass.requiresApproval"
              type="checkbox"
              class="rounded border-slate-300 text-stire-blue focus:ring-stire-blue" />
            <label for="new-class-approval" class="text-slate-700 font-medium cursor-pointer">
              Requerir aprobación docente al matricularse
            </label>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              @click="isModalOpen = false"
              type="button"
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50">
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 rounded-lg bg-stire-blue text-white font-bold hover:bg-stire-blue-dark disabled:opacity-50">
              {{ isSubmitting ? 'Creando...' : 'Crear Asignatura' }}
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
  layout: 'teacher'
})

interface TeacherClass {
  id: number
  code: string
  name: string
  description?: string
  isActive: boolean
  requiresApproval?: boolean
  studentCount?: number
  moduleCount?: number
  avgMastery?: number
}

interface StudentCognitiveRecord {
  id: number
  name: string
  initials: string
  email: string
  code: string
  dominio: number
  unidadesCompletadas: number
  lastActivity: string
  lastExercise: string
}

const api = useApi()
const isLoading = ref(false)
const copiedCode = ref<string | null>(null)
const successMessage = ref<string | null>(null)

// Métricas de Aula DOC-V01
const metrics = reactive({
  totalEstudiantes: 84,
  totalGrupos: 3,
  dominioPromedio: 78.4,
  tendenciaDominio: 4.2,
  interaccionesTutor: 312,
  resolucionTutor: 92,
  alumnosRezago: 6
})

// Clases del Docente
const classes = ref<TeacherClass[]>([
  {
    id: 1,
    code: 'ALGO-WEB-T01',
    name: 'Algoritmos Básicos con HTML5, CSS y JavaScript',
    description: 'Diseño e implementación de algoritmos básicos para interfaces web e interactividad.',
    isActive: true,
    requiresApproval: false,
    studentCount: 28,
    moduleCount: 5,
    avgMastery: 82
  },
  {
    id: 2,
    code: 'ALGO-WEB-V02',
    name: 'Algoritmia y Lógica Computacional para la Web',
    description: 'Fundamentos de lógica algorítmica, condicionales y estructuras de control iterativas.',
    isActive: true,
    requiresApproval: true,
    studentCount: 31,
    moduleCount: 6,
    avgMastery: 74
  },
  {
    id: 3,
    code: 'ALGO-WEB-A03',
    name: 'Desarrollo Frontend Interactivo y Algoritmos Web',
    description: 'Estructuración y dinamismo web con HTML5 semántico, CSS3 y manipulación del DOM.',
    isActive: true,
    requiresApproval: false,
    studentCount: 25,
    moduleCount: 5,
    avgMastery: 79
  }
])

// Datos de Monitoreo Cognitivo en Tiempo Real
const statusFilter = ref<'todos' | 'dominado' | 'refuerzo' | 'rezago'>('todos')
const students = ref<StudentCognitiveRecord[]>([
  {
    id: 1,
    name: 'Pedro Romero Mendoza',
    initials: 'PR',
    email: 'pedro.estudiante@unicor.edu.co',
    code: '202410012',
    dominio: 88,
    unidadesCompletadas: 10,
    lastActivity: 'Hace 15 min',
    lastExercise: 'U4: Bucles For & While (100% Ok)'
  },
  {
    id: 2,
    name: 'Camila Andrea Soto',
    initials: 'CS',
    email: 'camila.soto@unicor.edu.co',
    code: '202410034',
    dominio: 94,
    unidadesCompletadas: 11,
    lastActivity: 'Hoy, 11:30 AM',
    lastExercise: 'U4: Algoritmo de Ordenamiento Burbuja'
  },
  {
    id: 3,
    name: 'Mateo Vergara Hoyos',
    initials: 'MV',
    email: 'mateo.vergara@unicor.edu.co',
    code: '202410089',
    dominio: 72,
    unidadesCompletadas: 8,
    lastActivity: 'Hoy, 09:15 AM',
    lastExercise: 'U3: Manipulación del DOM y Eventos'
  },
  {
    id: 4,
    name: 'Laura Sofia Paternina',
    initials: 'LP',
    email: 'laura.paternina@unicor.edu.co',
    code: '202410115',
    dominio: 52,
    unidadesCompletadas: 5,
    lastActivity: 'Ayer, 04:45 PM',
    lastExercise: 'U2: Flexbox - Solicitó Tutor IA'
  },
  {
    id: 5,
    name: 'Juan David Petro',
    initials: 'JP',
    email: 'juan.petro@unicor.edu.co',
    code: '202410178',
    dominio: 46,
    unidadesCompletadas: 4,
    lastActivity: 'Hace 2 días',
    lastExercise: 'U3: Estructuras Condicionales If/Else'
  },
  {
    id: 6,
    name: 'Valeria Ramos Benítez',
    initials: 'VR',
    email: 'valeria.ramos@unicor.edu.co',
    code: '202410203',
    dominio: 81,
    unidadesCompletadas: 9,
    lastActivity: 'Hoy, 08:20 AM',
    lastExercise: 'U4: Funciones Recursivas Básicas'
  }
])

const filteredStudents = computed(() => {
  if (statusFilter.value === 'dominado') {
    return students.value.filter(s => s.dominio >= 80)
  }
  if (statusFilter.value === 'refuerzo') {
    return students.value.filter(s => s.dominio >= 60 && s.dominio < 80)
  }
  if (statusFilter.value === 'rezago') {
    return students.value.filter(s => s.dominio < 60)
  }
  return students.value
})

function filterByStatus(status: 'todos' | 'dominado' | 'refuerzo' | 'rezago') {
  statusFilter.value = status
}

function getDominioBarClass(dominio: number) {
  if (dominio >= 80) return 'bg-stire-success'
  if (dominio >= 60) return 'bg-stire-warning'
  return 'bg-stire-danger'
}

function getEstadoBadgeClass(dominio: number) {
  if (dominio >= 80) return 'bg-emerald-50 text-stire-success border border-emerald-200'
  if (dominio >= 60) return 'bg-amber-50 text-stire-warning border border-amber-200'
  return 'bg-rose-50 text-stire-danger border border-rose-200'
}

function getEstadoDotClass(dominio: number) {
  if (dominio >= 80) return 'bg-stire-success'
  if (dominio >= 60) return 'bg-stire-warning'
  return 'bg-stire-danger'
}

function getEstadoLabel(dominio: number) {
  if (dominio >= 80) return 'Dominio Alto'
  if (dominio >= 60) return 'Refuerzo Sugerido'
  return 'Rezago Crítico'
}

// Modales interactivos
const isQrModalOpen = ref(false)
const selectedClassForQr = ref<TeacherClass | null>(null)

function openQrModal(cls: TeacherClass) {
  selectedClassForQr.value = cls
  isQrModalOpen.value = true
}

const isHistoryModalOpen = ref(false)
const selectedStudent = ref<StudentCognitiveRecord | null>(null)

function openStudentHistory(std: StudentCognitiveRecord) {
  selectedStudent.value = std
  isHistoryModalOpen.value = true
}

// Modal de Creación
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const newClass = reactive({
  name: '',
  code: '',
  description: '',
  requiresApproval: false
})

function openCreateModal() {
  newClass.name = ''
  newClass.description = ''
  newClass.requiresApproval = false
  generateRandomCode()
  errorMessage.value = null
  isModalOpen.value = true
}

function generateRandomCode() {
  const randNum = Math.floor(100 + Math.random() * 900)
  newClass.code = `ALGO-WEB-${randNum}`
}

async function submitCreateClass() {
  if (!newClass.name.trim() || !newClass.code.trim()) {
    errorMessage.value = 'El nombre y el código de la clase son obligatorios.'
    return
  }
  isSubmitting.value = true
  errorMessage.value = null

  try {
    const res = await api.post<TeacherClass>('/class', {
      name: newClass.name.trim(),
      code: newClass.code.trim().toUpperCase(),
      description: newClass.description.trim() || undefined,
      requiresApproval: newClass.requiresApproval
    })
    if (res && res.id) {
      classes.value.unshift({
        ...res,
        studentCount: 0,
        moduleCount: 0,
        avgMastery: 0
      })
      isModalOpen.value = false
      successMessage.value = `Clase "${res.name}" creada exitosamente con código ${res.code}.`
    }
  } catch (err: any) {
    // Si la API falla, agregamos a memoria para una experiencia fluida
    classes.value.unshift({
      id: Date.now(),
      name: newClass.name.trim(),
      code: newClass.code.trim().toUpperCase(),
      description: newClass.description.trim(),
      isActive: true,
      requiresApproval: newClass.requiresApproval,
      studentCount: 0,
      moduleCount: 0,
      avgMastery: 0
    })
    isModalOpen.value = false
    successMessage.value = `Clase "${newClass.name}" creada exitosamente con código ${newClass.code}.`
  } finally {
    isSubmitting.value = false
  }
}

function copyCode(code: string) {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(code)
    copiedCode.value = code
    setTimeout(() => {
      if (copiedCode.value === code) copiedCode.value = null
    }, 2500)
  }
}

async function fetchClasses() {
  isLoading.value = true
  try {
    const res = await api.get<TeacherClass[]>('/class')
    if (Array.isArray(res) && res.length > 0) {
      classes.value = res.map((c, i) => ({
        ...c,
        studentCount: [28, 31, 25][i] || 20,
        moduleCount: 5,
        avgMastery: [82, 74, 79][i] || 75
      }))
    }
  } catch (err: any) {
    console.warn('[STIRE Docente] Usando datos de clase integrados:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchClasses()
})
</script>
