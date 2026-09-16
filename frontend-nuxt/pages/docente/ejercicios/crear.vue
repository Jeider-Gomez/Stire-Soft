<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Cabecera DOC-V03 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
            Diseñador de Ejercicios • DOC-V03
          </span>
        </div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Gestión de Ejercicios y Casos de Prueba
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          Crea nuevos ejercicios y gestiona los existentes por unidad de aprendizaje
        </p>
      </div>

      <NuxtLink
        to="/docente/contenidos"
        class="borde-afordancia px-3 py-1.5 rounded-md text-xs font-semibold text-base-texto-secundario hover:text-base-texto-primario flex items-center gap-1 self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
        <span>←</span>
        <span>Ver Contenidos</span>
      </NuxtLink>
    </header>

    <!-- Feedback de Éxito creación -->
    <div v-if="successCreatedId" role="status" aria-live="polite" class="p-4 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-xl text-xs space-y-2">
      <div class="flex items-center justify-between font-bold">
        <span>🎉 ¡Ejercicio creado exitosamente con ID #{{ successCreatedId }}!</span>
        <button @click="successCreatedId = null" class="underline text-[11px] focus:outline-none focus:ring-2 focus:ring-semantico-pasa rounded">Cerrar</button>
      </div>
      <p class="text-base-texto-secundario text-[11px]">
        El ejercicio ya está disponible en el banco de actividades de la unidad de aprendizaje seleccionada.
      </p>
    </div>

    <!-- Feedback de acción general -->
    <div v-if="actionFeedback" role="status" aria-live="polite" class="p-3 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-lg text-xs flex items-center justify-between">
      <span>✔ {{ actionFeedback }}</span>
      <button @click="actionFeedback = null" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-pasa rounded">Cerrar</button>
    </div>
    <div v-if="actionError" role="alert" aria-live="assertive" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs flex items-center justify-between">
      <span>✖ {{ actionError }}</span>
      <button @click="actionError = null" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-falla rounded">Cerrar</button>
    </div>

    <!-- ── Sección A: Actividades existentes de la unidad ────────────────── -->
    <section v-if="form.learningUnitId" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-2">
          <span>📋</span>
          <span>Actividades en la Unidad Seleccionada</span>
        </h2>
        <span v-if="loadingActivities" class="text-[11px] text-base-texto-secundario animate-pulse">Cargando…</span>
        <span v-else class="text-[11px] text-base-texto-secundario">{{ unitActivities.length }} actividades</span>
      </div>

      <div v-if="unitActivities.length === 0 && !loadingActivities" class="text-xs text-base-texto-secundario italic py-2">
        No hay actividades creadas en esta unidad aún.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="bg-base-bg-secundario text-base-texto-secundario border-b border-base-borde-sutil font-semibold">
            <tr>
              <th scope="col" class="p-2.5">Título</th>
              <th scope="col" class="p-2.5">Dificultad</th>
              <th scope="col" class="p-2.5 text-center">Pts</th>
              <th scope="col" class="p-2.5 text-center">Estado</th>
              <th scope="col" class="p-2.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-base-borde-sutil">
            <tr
              v-for="act in unitActivities"
              :key="act.id"
              class="hover:bg-base-bg-secundario/40 transition-colors">
              <td class="p-2.5 font-medium text-base-texto-primario max-w-[200px] truncate">{{ act.title }}</td>
              <td class="p-2.5 text-base-texto-secundario font-mono">{{ act.difficulty }}</td>
              <td class="p-2.5 text-center font-mono text-base-texto-secundario">{{ act.totalPoints }}</td>
              <td class="p-2.5 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="act.status === 'published'
                    ? 'bg-semantico-pasa/15 text-semantico-pasa'
                    : act.status === 'archived'
                      ? 'bg-base-texto-secundario/15 text-base-texto-secundario'
                      : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
                  {{ act.status === 'published' ? '✔ Publicada' : act.status === 'archived' ? '🗄 Archivada' : '○ Borrador' }}
                </span>
              </td>
              <td class="p-2.5 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- Editar metadatos -->
                  <button
                    @click="openEditActivityModal(act)"
                    class="px-2 py-0.5 rounded text-[11px] font-semibold border border-base-borde-fuerte text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                    :aria-label="`Editar actividad ${act.title}`">
                    ✏
                  </button>
                  <!-- Publicar / Despublicar -->
                  <button
                    v-if="act.status !== 'archived'"
                    @click="togglePublish(act)"
                    class="px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors focus:outline-none focus:ring-2"
                    :class="act.status === 'published'
                      ? 'border-acento-ambar-fuerte/40 text-acento-ambar-fuerte hover:bg-acento-ambar/10 focus:ring-acento-ambar-fuerte'
                      : 'border-semantico-pasa/40 text-semantico-pasa hover:bg-semantico-pasa/10 focus:ring-semantico-pasa'"
                    :aria-label="act.status === 'published' ? `Pasar a borrador actividad ${act.title}` : `Publicar actividad ${act.title}`">
                    {{ act.status === 'published' ? '↩ Borrador' : '▶ Publicar' }}
                  </button>
                  <!-- Archivar -->
                  <button
                    v-if="act.status !== 'archived'"
                    @click="confirmArchiveActivity(act)"
                    class="px-2 py-0.5 rounded text-[11px] font-semibold border border-semantico-falla/30 text-semantico-falla hover:bg-semantico-falla/10 transition-colors focus:outline-none focus:ring-2 focus:ring-semantico-falla"
                    :aria-label="`Archivar actividad ${act.title}`">
                    🗄
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ── Sección B: Crear nuevo ejercicio ──────────────────────────────── -->
    <form @submit.prevent="submitExercise" class="space-y-6">
      <!-- Sección 1: Asociación Curricular -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-2">
          <span>1.</span>
          <span>Asociación Curricular y Metadatos</span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <!-- Clase -->
          <div>
            <label for="create-class" class="block font-semibold text-base-texto-primario mb-1">Clase Académica *</label>
            <select
              id="create-class"
              v-model="selectedClassId"
              @change="onClassChange"
              required
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30">
              <option :value="null" disabled>-- Selecciona una clase --</option>
              <option v-for="c in teacherClasses" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.code }})
              </option>
            </select>
          </div>

          <!-- Unidad de Aprendizaje -->
          <div>
            <label for="create-unit" class="block font-semibold text-base-texto-primario mb-1">Unidad de Aprendizaje *</label>
            <select
              id="create-unit"
              v-model="form.learningUnitId"
              @change="onUnitChange"
              required
              :disabled="units.length === 0"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none disabled:opacity-50 focus:ring-2 focus:ring-acento-ambar-fuerte/30">
              <option :value="null" disabled>-- Selecciona una unidad --</option>
              <option v-for="u in units" :key="u.id" :value="u.id">
                {{ u.title }} (Dificultad: {{ u.difficulty }})
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <!-- Título -->
          <div class="sm:col-span-2">
            <label for="create-title" class="block font-semibold text-base-texto-primario mb-1">Título del Ejercicio *</label>
            <input
              id="create-title"
              v-model="form.title"
              type="text"
              required
              placeholder="Ej: Desafío de Código: Validador de Contraseñas"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>

          <!-- Dificultad -->
          <div>
            <label for="create-difficulty" class="block font-semibold text-base-texto-primario mb-1">Nivel de Dificultad *</label>
            <select
              id="create-difficulty"
              v-model="form.difficulty"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30">
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 text-xs">
          <!-- Puntos -->
          <div>
            <label for="create-points" class="block font-semibold text-base-texto-primario mb-1">Puntos Totales</label>
            <input
              id="create-points"
              v-model.number="form.totalPoints"
              type="number"
              min="5"
              max="100"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>

          <!-- Intentos -->
          <div>
            <label for="create-attempts" class="block font-semibold text-base-texto-primario mb-1">Intentos Permitidos</label>
            <input
              id="create-attempts"
              v-model.number="form.attemptsAllowed"
              type="number"
              min="1"
              max="10"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>

          <!-- Peso Adaptativo -->
          <div>
            <label for="create-weight" class="block font-semibold text-base-texto-primario mb-1">Peso Adaptativo (0-1)</label>
            <input
              id="create-weight"
              v-model.number="form.adaptiveWeight"
              type="number"
              step="0.05"
              min="0.1"
              max="1"
              class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>
        </div>
      </section>

      <!-- Sección 2: Enunciado y Código Inicial -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-2">
          <span>2.</span>
          <span>Enunciado y Plantilla de Código (JavaScript)</span>
        </h2>

        <div class="text-xs">
          <label for="create-question" class="block font-semibold text-base-texto-primario mb-1">
            Enunciado Pedagógico del Problema *
          </label>
          <textarea
            id="create-question"
            v-model="form.questionText"
            required
            rows="4"
            placeholder="Describe con claridad las entradas esperadas por stdin, las condiciones lógicas y la salida requerida..."
            class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none resize-y focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
        </div>

        <div class="text-xs">
          <label for="create-starter" class="block font-semibold text-base-texto-primario mb-1">
            Código Plantilla Inicial (<code>starterCode</code>)
          </label>
          <textarea
            id="create-starter"
            v-model="form.starterCode"
            rows="5"
            spellcheck="false"
            class="w-full px-3 py-2 rounded-md bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs outline-none resize-y border border-[#333]"></textarea>
        </div>
      </section>

      <!-- Sección 3: Casos de Prueba -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-2">
            <span>3.</span>
            <span>Rúbrica: Casos de Prueba para Evaluación</span>
          </h2>

          <button
            type="button"
            @click="addTestCase"
            class="px-3 py-1 rounded text-xs font-bold bg-acento-ambar/15 text-acento-ambar-fuerte hover:bg-acento-ambar/25 transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
            <span>+</span>
            <span>Agregar Caso</span>
          </button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(tc, idx) in form.testCases"
            :key="idx"
            class="p-3 rounded-lg border border-base-borde-sutil bg-base-bg-secundario/40 space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-base-texto-primario">Caso #{{ idx + 1 }}</span>
              <div class="flex items-center gap-3">
                <label :for="`tc-public-${idx}`" class="flex items-center gap-1.5 cursor-pointer text-[11px] select-none">
                  <input :id="`tc-public-${idx}`" type="checkbox" v-model="tc.isPublic" class="accent-acento-ambar-fuerte" />
                  <span :class="tc.isPublic ? 'text-semantico-pasa font-bold' : 'text-base-texto-secundario'">
                    {{ tc.isPublic ? '👁 Público (visible)' : '🔒 Privado (ciego)' }}
                  </span>
                </label>

                <button
                  v-if="form.testCases.length > 1"
                  type="button"
                  @click="removeTestCase(idx)"
                  class="text-semantico-falla text-[11px] hover:underline focus:outline-none focus:ring-2 focus:ring-semantico-falla rounded"
                  :aria-label="`Eliminar caso ${idx + 1}`">
                  Eliminar
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label :for="`tc-input-${idx}`" class="block text-[11px] text-base-texto-secundario mb-1">Entrada (<code>stdin</code>)</label>
                <input
                  :id="`tc-input-${idx}`"
                  v-model="tc.input"
                  type="text"
                  placeholder="Ej: 15"
                  class="w-full px-2.5 py-1.5 font-mono text-xs rounded bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
              </div>

              <div>
                <label :for="`tc-expected-${idx}`" class="block text-[11px] text-base-texto-secundario mb-1">Salida Esperada (<code>stdout</code>)</label>
                <input
                  :id="`tc-expected-${idx}`"
                  v-model="tc.expected"
                  type="text"
                  placeholder="Ej: Acceso denegado"
                  class="w-full px-2.5 py-1.5 font-mono text-xs rounded bg-base-blanco border border-base-borde-sutil focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mensaje de Error de envío -->
      <div v-if="submitError" role="alert" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs">
        {{ submitError }}
      </div>

      <!-- Barra de Acciones de Envío -->
      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
          Restablecer Formulario
        </button>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          <span v-if="isSubmitting" class="animate-spin">⚙️</span>
          <span>{{ isSubmitting ? 'Guardando Ejercicio...' : '🚀 Guardar y Publicar Ejercicio' }}</span>
        </button>
      </div>
    </form>

    <!-- MODAL: Editar Actividad (metadatos) -->
    <Teleport to="body">
      <div
        v-if="editActivityModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-act-title"
        @click.self="closeEditActivityModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 id="modal-act-title" class="text-sm font-bold text-base-texto-primario">Editar Metadatos del Ejercicio</h2>
            <button
              @click="closeEditActivityModal"
              class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded"
              aria-label="Cerrar modal de edición de ejercicio">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitEditActivity" class="space-y-4 text-xs">
            <div>
              <label for="act-title" class="block font-semibold text-base-texto-primario mb-1">Título *</label>
              <input
                id="act-title"
                ref="editActTitleRef"
                v-model="editActivityModal.form.title"
                type="text"
                required
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="act-desc" class="block font-semibold text-base-texto-primario mb-1">Descripción</label>
              <textarea
                id="act-desc"
                v-model="editActivityModal.form.description"
                rows="3"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="act-difficulty" class="block font-semibold text-base-texto-primario mb-1">Dificultad</label>
                <select
                  id="act-difficulty"
                  v-model="editActivityModal.form.difficulty"
                  class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario">
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>

              <div>
                <label for="act-points" class="block font-semibold text-base-texto-primario mb-1">Puntos Totales</label>
                <input
                  id="act-points"
                  v-model.number="editActivityModal.form.totalPoints"
                  type="number"
                  min="5"
                  max="100"
                  class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
              </div>
            </div>

            <p v-if="editActivityModal.error" role="alert" class="text-semantico-falla text-[11px]">{{ editActivityModal.error }}</p>

            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="closeEditActivityModal"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="editActivityModal.saving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="editActivityModal.saving" class="animate-spin">⚙️</span>
                <span>{{ editActivityModal.saving ? 'Guardando…' : '✔ Guardar cambios' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: Confirmar Archivar Actividad -->
    <Teleport to="body">
      <div
        v-if="archiveActivityModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-archive-act-title"
        @click.self="archiveActivityModal.open = false">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-sm p-6 space-y-4">
          <h2 id="modal-archive-act-title" class="text-sm font-bold text-base-texto-primario">¿Archivar este ejercicio?</h2>
          <p class="text-xs text-base-texto-secundario">
            El ejercicio <strong class="text-base-texto-primario">{{ archiveActivityModal.activity?.title }}</strong>
            quedará archivado y no será visible para los estudiantes.
          </p>
          <p v-if="archiveActivityModal.error" role="alert" class="text-semantico-falla text-[11px]">{{ archiveActivityModal.error }}</p>
          <div class="flex items-center justify-end gap-3">
            <button
              @click="archiveActivityModal.open = false"
              class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
              Cancelar
            </button>
            <button
              @click="submitArchiveActivity"
              :disabled="archiveActivityModal.saving"
              class="px-5 py-2 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-semantico-falla">
              <span v-if="archiveActivityModal.saving" class="animate-spin">⚙️</span>
              <span>{{ archiveActivityModal.saving ? 'Archivando…' : '🗄 Confirmar Archivo' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({
  layout: 'teacher'
})

interface TeacherClass {
  id: number
  code: string
  name: string
}

interface LearningUnitItem {
  id: number
  title: string
  difficulty: string
}

interface SectionItem {
  id: number
  topics?: Array<{
    learningUnits?: LearningUnitItem[]
  }>
}

// Actividad ya existente en la unidad (contrato real de GET /activities?learningUnitId=X)
interface ActivityItem {
  id: number
  title: string
  description?: string
  difficulty: string
  totalPoints: number
  status: string  // 'draft' | 'published' | 'archived'
}

const api = useApi()

const teacherClasses = ref<TeacherClass[]>([])
const selectedClassId = ref<number | null>(null)
const units = ref<LearningUnitItem[]>([])
const activityTypeId = ref<number>(1)

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const successCreatedId = ref<number | null>(null)
const actionFeedback = ref<string | null>(null)
const actionError = ref<string | null>(null)

// Actividades de la unidad seleccionada
const unitActivities = ref<ActivityItem[]>([])
const loadingActivities = ref(false)

const form = reactive({
  learningUnitId: null as number | null,
  title: '',
  difficulty: 'basico',
  totalPoints: 25,
  attemptsAllowed: 3,
  adaptiveWeight: 0.4,
  questionText: '',
  starterCode: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\n\n// Escribe tu solución aquí\n`,
  testCases: [
    { label: 'Caso 1', input: '10', expected: '10', isPublic: true },
    { label: 'Caso Oculto', input: '20', expected: '20', isPublic: false }
  ]
})

// ─── Actividades existentes ───────────────────────────────────────────────────
async function loadUnitActivities(unitId: number) {
  loadingActivities.value = true
  unitActivities.value = []
  try {
    const res = await api.get<any>(`/activities?learningUnitId=${unitId}&limit=50`)
    // El endpoint devuelve paginado: { data: ActivityItem[], meta: {...} }
    const list = Array.isArray(res) ? res : (res?.data || res?.items || [])
    unitActivities.value = list
  } catch (err: any) {
    console.error('Error al cargar actividades de la unidad:', err)
  } finally {
    loadingActivities.value = false
  }
}

async function onUnitChange() {
  if (form.learningUnitId) {
    await loadUnitActivities(form.learningUnitId)
  } else {
    unitActivities.value = []
  }
}

async function togglePublish(act: ActivityItem) {
  try {
    if (act.status === 'published') {
      // No hay endpoint PATCH draft directo — publicar/archivar son los dos extremos.
      // Aquí se usa PATCH /activities/:id para volver a 'draft' si el backend lo soporta,
      // o simplemente no exponemos "Despublicar" — el botón solo aparece para 'draft'.
      // Por diseño del plan §16.1: solo publicar es expuesto. El botón ↩ ya no aparece.
      return
    }
    await api.patch(`/activities/${act.id}/publish`)
    act.status = 'published'
    actionFeedback.value = `Ejercicio "${act.title}" publicado correctamente.`
  } catch (err: any) {
    actionError.value = err?.data?.message || 'Error al publicar el ejercicio.'
  }
}

// ─── Modal Editar Actividad ────────────────────────────────────────────────────
const editActTitleRef = ref<HTMLInputElement | null>(null)

const editActivityModal = reactive({
  open: false,
  activityId: null as number | null,
  form: { title: '', description: '', difficulty: 'basico', totalPoints: 25 },
  saving: false,
  error: null as string | null
})

function openEditActivityModal(act: ActivityItem) {
  editActivityModal.activityId = act.id
  editActivityModal.form.title = act.title
  editActivityModal.form.description = act.description || ''
  editActivityModal.form.difficulty = act.difficulty || 'basico'
  editActivityModal.form.totalPoints = act.totalPoints
  editActivityModal.error = null
  editActivityModal.open = true
  nextTick(() => editActTitleRef.value?.focus())
}

function closeEditActivityModal() {
  editActivityModal.open = false
}

async function submitEditActivity() {
  if (!editActivityModal.form.title.trim()) {
    editActivityModal.error = 'El título es obligatorio.'
    return
  }
  editActivityModal.saving = true
  editActivityModal.error = null
  try {
    await api.patch(`/activities/${editActivityModal.activityId}`, {
      title: editActivityModal.form.title.trim(),
      description: editActivityModal.form.description.trim() || undefined,
      difficulty: editActivityModal.form.difficulty,
      totalPoints: editActivityModal.form.totalPoints
    })
    // Actualizar en memoria
    const act = unitActivities.value.find(a => a.id === editActivityModal.activityId)
    if (act) {
      act.title = editActivityModal.form.title.trim()
      act.description = editActivityModal.form.description.trim()
      act.difficulty = editActivityModal.form.difficulty
      act.totalPoints = editActivityModal.form.totalPoints
    }
    actionFeedback.value = `Ejercicio "${editActivityModal.form.title}" actualizado correctamente.`
    closeEditActivityModal()
  } catch (err: any) {
    editActivityModal.error = err?.data?.message || 'Error al actualizar el ejercicio.'
  } finally {
    editActivityModal.saving = false
  }
}

// ─── Modal Archivar Actividad ──────────────────────────────────────────────────
const archiveActivityModal = reactive({
  open: false,
  activity: null as ActivityItem | null,
  saving: false,
  error: null as string | null
})

function confirmArchiveActivity(act: ActivityItem) {
  archiveActivityModal.activity = act
  archiveActivityModal.error = null
  archiveActivityModal.open = true
}

async function submitArchiveActivity() {
  if (!archiveActivityModal.activity) return
  archiveActivityModal.saving = true
  archiveActivityModal.error = null
  try {
    await api.patch(`/activities/${archiveActivityModal.activity.id}/archive`)
    const act = unitActivities.value.find(a => a.id === archiveActivityModal.activity!.id)
    if (act) act.status = 'archived'
    actionFeedback.value = `Ejercicio "${archiveActivityModal.activity.title}" archivado correctamente.`
    archiveActivityModal.open = false
  } catch (err: any) {
    archiveActivityModal.error = err?.data?.message || 'Error al archivar el ejercicio.'
  } finally {
    archiveActivityModal.saving = false
  }
}

// ─── Helpers formulario de creación ───────────────────────────────────────────
function addTestCase() {
  form.testCases.push({
    label: `Caso ${form.testCases.length + 1}`,
    input: '',
    expected: '',
    isPublic: true
  })
}

function removeTestCase(index: number) {
  form.testCases.splice(index, 1)
}

function resetForm() {
  form.title = ''
  form.questionText = ''
  form.testCases = [
    { label: 'Caso 1', input: '10', expected: '10', isPublic: true },
    { label: 'Caso Oculto', input: '20', expected: '20', isPublic: false }
  ]
  submitError.value = null
}

async function onClassChange() {
  units.value = []
  form.learningUnitId = null
  unitActivities.value = []
  if (!selectedClassId.value) return

  try {
    const secList = await api.get<SectionItem[]>(`/sections/class/${selectedClassId.value}`)
    const unitCollector: LearningUnitItem[] = []
    if (Array.isArray(secList)) {
      for (const s of secList) {
        const topics = await api.get<any[]>(`/topic/section/${s.id}`)
        if (Array.isArray(topics)) {
          for (const t of topics) {
            if (Array.isArray(t.learningUnits)) {
              unitCollector.push(...t.learningUnits)
            }
          }
        }
      }
    }
    units.value = unitCollector
    if (unitCollector.length > 0) {
      form.learningUnitId = unitCollector[0].id
      await loadUnitActivities(unitCollector[0].id)
    }
  } catch (err: any) {
    console.error('Error al cargar unidades de la clase:', err)
  }
}

async function fetchInitialData() {
  try {
    const [classesRes, typesRes] = await Promise.all([
      api.get<TeacherClass[]>('/class/my-classes'),
      api.get<any>('/activity-types')
    ])

    if (Array.isArray(classesRes) && classesRes.length > 0) {
      teacherClasses.value = classesRes
      selectedClassId.value = classesRes[0].id
      await onClassChange()
    }

    const typesList = Array.isArray(typesRes) ? typesRes : (typesRes?.data || typesRes?.items || [])
    if (typesList.length > 0) {
      activityTypeId.value = typesList[0].id
    }
  } catch (err: any) {
    console.error('Error al inicializar diseñador:', err)
  }
}

async function submitExercise() {
  if (!form.learningUnitId || !form.title.trim() || !form.questionText.trim()) {
    submitError.value = 'Completa los campos obligatorios del ejercicio.'
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    // 1. Crear Activity
    const actRes = await api.post<any>('/activities', {
      learningUnitId: form.learningUnitId,
      activityTypeId: activityTypeId.value,
      title: form.title.trim(),
      description: form.questionText.trim(),
      difficulty: form.difficulty,
      totalPoints: form.totalPoints,
      passingScore: 60,
      attemptsAllowed: form.attemptsAllowed,
      isRequired: true,
      adaptiveWeight: form.adaptiveWeight
    })

    if (actRes && actRes.id) {
      // 2. Crear ActivityQuestion asociada
      await api.post('/activity-questions', {
        activityId: actRes.id,
        type: 'coding',
        question: form.questionText.trim(),
        points: form.totalPoints,
        order: 0,
        config: {
          language: 'javascript',
          starterCode: form.starterCode,
          testCases: form.testCases.map((tc, i) => ({
            label: `Caso ${i + 1}`,
            input: tc.input,
            expected: tc.expected,
            isPublic: tc.isPublic
          }))
        }
      })

      successCreatedId.value = actRes.id
      // Recargar actividades de la unidad
      await loadUnitActivities(form.learningUnitId)
      resetForm()
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Error al guardar el ejercicio'
    submitError.value = Array.isArray(msg) ? msg.join(', ') : msg
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})
</script>
