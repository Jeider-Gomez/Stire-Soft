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
              <th scope="col" class="p-2.5">Categoría / Peso</th>
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
              <td class="p-2.5 text-base-texto-secundario whitespace-nowrap">
                <span class="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] bg-base-bg-secundario border border-base-borde-sutil">
                  {{ act.activityType?.name || 'Práctica Formativa' }}
                  <span class="text-acento-ambar-fuerte font-mono text-[10px]">({{ act.activityType?.baseWeight || 1 }}×)</span>
                </span>
              </td>
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
    <!--
      novalidate: los constructores de los 6 tipos viven a la vez en el DOM (v-show) y cada uno tiene campos
      `required`. Los de los tipos no elegidos están ocultos y vacíos, y el navegador bloqueaba el envío
      ("invalid form control is not focusable"). La validación real la hace submitExercise() (unidad, título,
      enunciado) y validateAndGetConfig() de cada constructor, con mensajes propios.
    -->
    <form novalidate @submit.prevent="submitExercise" class="space-y-6">
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

        <!-- Categoría de Actividad y Ponderación (§17) -->
        <div class="text-xs">
          <label for="create-activity-type" class="block font-semibold text-base-texto-primario mb-1">
            Categoría Pedagógica / Tipo de Actividad *
          </label>
          <select
            id="create-activity-type"
            v-model="activityTypeId"
            required
            class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario">
            <option v-for="t in activityTypes" :key="t.id" :value="t.id">
              {{ t.name }} (peso {{ t.baseWeight }}×)
            </option>
          </select>
          <p class="text-[11px] text-base-texto-secundario mt-1 leading-normal">
            Los talleres y parciales pesan más en el dominio del estudiante que la práctica libre — úsalo para reflejar evaluaciones reales, no para inflar el Mastery.
          </p>
        </div>

        <!-- Selector de Tipo de Ejercicio (§T2) -->
        <div class="text-xs">
          <label for="create-exercise-type" class="block font-semibold text-base-texto-primario mb-1">
            Tipo de Ejercicio *
          </label>
          <select
            id="create-exercise-type"
            v-model="exerciseType"
            class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario font-semibold">
            <option value="coding">Código en JavaScript (Evaluación en Sandbox)</option>
            <option value="mcq">Opción Múltiple (Selección Única)</option>
            <option value="fill_code">Completar Código (Rellenar Huecos ___id___)</option>
            <option value="drag_drop">Arrastrar y Soltar (Categorías / Destinos)</option>
            <option value="matching">Emparejar (Pares de Conceptos Izq ↔ Der)</option>
            <option value="ordering">Ordenar Bloques (Secuencia de Pasos)</option>
            <option value="html_css">HTML y CSS (Calificado por Reglas)</option>
          </select>
          <p class="text-[11px] text-base-texto-secundario mt-1">
            {{ currentTypeDescription }}
          </p>
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

      <!-- Sección 2: Enunciado y Configuración del Ejercicio -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <h2 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-2">
          <span>2.</span>
          <span>Enunciado y Contenido ({{ currentTypeName }})</span>
        </h2>

        <div class="text-xs">
          <label for="create-question" class="block font-semibold text-base-texto-primario mb-1">
            Enunciado Pedagógico del Problema / Pregunta *
          </label>
          <textarea
            id="create-question"
            v-model="form.questionText"
            required
            rows="4"
            placeholder="Describe con claridad las instrucciones del ejercicio, condiciones pedagógicas y lo que el estudiante debe resolver..."
            class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none resize-y focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
        </div>

        <!-- Formulario modular según el tipo de ejercicio seleccionado -->
        <div class="pt-2 border-t border-base-borde-sutil">
          <CodingExerciseBuilder v-show="exerciseType === 'coding'" ref="codingBuilderRef" />
          <McqExerciseBuilder v-show="exerciseType === 'mcq'" ref="mcqBuilderRef" />
          <FillCodeExerciseBuilder v-show="exerciseType === 'fill_code'" ref="fillCodeBuilderRef" />
          <DragDropExerciseBuilder v-show="exerciseType === 'drag_drop'" ref="dragDropBuilderRef" />
          <MatchingExerciseBuilder v-show="exerciseType === 'matching'" ref="matchingBuilderRef" />
          <OrderingExerciseBuilder v-show="exerciseType === 'ordering'" ref="orderingBuilderRef" />
          <HtmlCssExerciseBuilder v-show="exerciseType === 'html_css'" ref="htmlCssBuilderRef" />
        </div>
      </section>

      <!-- Mensaje de Error de envío -->
      <div v-if="submitError" role="alert" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs">
        {{ submitError }}
      </div>

      <!-- Barra de Acciones de Envío -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <label for="publish-checkbox" class="flex items-center gap-2 cursor-pointer select-none text-xs">
          <input
            id="publish-checkbox"
            type="checkbox"
            v-model="publishImmediately"
            class="accent-acento-ambar-fuerte h-4 w-4 rounded" />
          <span class="font-semibold text-base-texto-primario">
            Publicar ahora (visible inmediatamente para los estudiantes)
          </span>
        </label>

        <div class="flex items-center justify-end gap-3">
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
            <span>
              {{ isSubmitting
                ? 'Guardando Ejercicio...'
                : (publishImmediately ? '🚀 Guardar y Publicar Ejercicio' : '💾 Guardar Borrador') }}
            </span>
          </button>
        </div>
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

            <div>
              <label for="act-type" class="block font-semibold text-base-texto-primario mb-1">Categoría Pedagógica *</label>
              <select
                id="act-type"
                v-model="editActivityModal.form.activityTypeId"
                required
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario">
                <option v-for="t in activityTypes" :key="t.id" :value="t.id">
                  {{ t.name }} (peso {{ t.baseWeight }}×)
                </option>
              </select>
              <p class="text-[10px] text-base-texto-secundario mt-0.5">
                Recategorizar la actividad recalcula el impacto en el dominio (Mastery) de los envíos de los estudiantes.
              </p>
            </div>

            <!-- Sección plegable: Tutor IA en esta actividad (§20.1) -->
            <details v-if="editActivityModal.activityId" class="border-t border-base-borde-sutil pt-3">
              <summary class="text-[11px] font-semibold text-base-texto-secundario cursor-pointer hover:text-base-texto-primario select-none flex items-center gap-1.5">
                <span aria-hidden="true">🤖</span> Tutor IA en esta actividad
              </summary>
              <div class="mt-3">
                <DocenteTutorSettingsPanel scope-type="activity" :scope-id="editActivityModal.activityId" />
              </div>
            </details>

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

interface ActivityTypeOption {
  id: number
  name: string
  code: string
  baseWeight: number
}

// Actividad ya existente en la unidad (contrato real de GET /activities?learningUnitId=X)
interface ActivityItem {
  id: number
  title: string
  description?: string
  difficulty: string
  totalPoints: number
  status: string  // 'draft' | 'published' | 'archived'
  activityTypeId?: number
  activityType?: {
    id: number
    name: string
    code?: string
    baseWeight: number
  }
}

import CodingExerciseBuilder from '~/components/docente/exercise-builders/CodingExerciseBuilder.vue'
import McqExerciseBuilder from '~/components/docente/exercise-builders/McqExerciseBuilder.vue'
import FillCodeExerciseBuilder from '~/components/docente/exercise-builders/FillCodeExerciseBuilder.vue'
import DragDropExerciseBuilder from '~/components/docente/exercise-builders/DragDropExerciseBuilder.vue'
import MatchingExerciseBuilder from '~/components/docente/exercise-builders/MatchingExerciseBuilder.vue'
import OrderingExerciseBuilder from '~/components/docente/exercise-builders/OrderingExerciseBuilder.vue'
import HtmlCssExerciseBuilder from '~/components/docente/exercise-builders/HtmlCssExerciseBuilder.vue'

const api = useApi()
const { messageOf } = useApiErrorMessage()

const teacherClasses = ref<TeacherClass[]>([])
const selectedClassId = ref<number | null>(null)
const units = ref<LearningUnitItem[]>([])
const activityTypes = ref<ActivityTypeOption[]>([])
const activityTypeId = ref<number>(1)

const exerciseType = ref<'coding' | 'mcq' | 'fill_code' | 'drag_drop' | 'matching' | 'ordering' | 'html_css'>('coding')
const publishImmediately = ref(true)

// Builder refs
const codingBuilderRef = ref<InstanceType<typeof CodingExerciseBuilder> | null>(null)
const mcqBuilderRef = ref<InstanceType<typeof McqExerciseBuilder> | null>(null)
const fillCodeBuilderRef = ref<InstanceType<typeof FillCodeExerciseBuilder> | null>(null)
const dragDropBuilderRef = ref<InstanceType<typeof DragDropExerciseBuilder> | null>(null)
const matchingBuilderRef = ref<InstanceType<typeof MatchingExerciseBuilder> | null>(null)
const orderingBuilderRef = ref<InstanceType<typeof OrderingExerciseBuilder> | null>(null)
const htmlCssBuilderRef = ref<InstanceType<typeof HtmlCssExerciseBuilder> | null>(null)

const currentTypeName = computed(() => {
  switch (exerciseType.value) {
    case 'coding': return 'Código en JavaScript'
    case 'mcq': return 'Opción Múltiple'
    case 'fill_code': return 'Completar Código'
    case 'drag_drop': return 'Arrastrar y Soltar'
    case 'matching': return 'Emparejar'
    case 'ordering': return 'Ordenar Bloques'
    case 'html_css': return 'HTML y CSS'
    default: return 'Ejercicio'
  }
})

const currentTypeDescription = computed(() => {
  switch (exerciseType.value) {
    case 'coding': return 'El estudiante escribe código evaluado por casos de prueba en un sandbox.'
    case 'mcq': return 'Pregunta de opción única con selección radial (todo o nada).'
    case 'fill_code': return 'El estudiante rellena huecos dentro de una plantilla de código (calificación proporcional).'
    case 'drag_drop': return 'Clasificar elementos en categorías o destinos correspondientes (calificación proporcional).'
    case 'matching': return 'Asociar parejas de conceptos en dos columnas (calificación proporcional).'
    case 'ordering': return 'Reordenar bloques de código o pasos en la secuencia correcta (todo o nada).'
    case 'html_css': return 'El estudiante escribe HTML y CSS calificados automáticamente por reglas que define el docente.'
    default: return ''
  }
})

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
  totalPoints: 20,
  attemptsAllowed: 3,
  adaptiveWeight: 0.4,
  questionText: ''
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
    actionError.value = messageOf(err, 'Error al publicar el ejercicio.')
  }
}

// ─── Modal Editar Actividad ────────────────────────────────────────────────────
const editActTitleRef = ref<HTMLInputElement | null>(null)

const editActivityModal = reactive({
  open: false,
  activityId: null as number | null,
  form: {
    title: '',
    description: '',
    difficulty: 'basico',
    totalPoints: 25,
    activityTypeId: null as number | null
  },
  saving: false,
  error: null as string | null
})

function openEditActivityModal(act: ActivityItem) {
  editActivityModal.activityId = act.id
  editActivityModal.form.title = act.title
  editActivityModal.form.description = act.description || ''
  editActivityModal.form.difficulty = act.difficulty || 'basico'
  editActivityModal.form.totalPoints = act.totalPoints
  editActivityModal.form.activityTypeId = act.activityTypeId || act.activityType?.id || (activityTypes.value[0]?.id ?? 1)
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
      totalPoints: editActivityModal.form.totalPoints,
      activityTypeId: editActivityModal.form.activityTypeId
    })
    // Actualizar en memoria
    const act = unitActivities.value.find(a => a.id === editActivityModal.activityId)
    if (act) {
      act.title = editActivityModal.form.title.trim()
      act.description = editActivityModal.form.description.trim()
      act.difficulty = editActivityModal.form.difficulty
      act.totalPoints = editActivityModal.form.totalPoints
      if (editActivityModal.form.activityTypeId) {
        act.activityTypeId = editActivityModal.form.activityTypeId
        const matched = activityTypes.value.find(t => t.id === editActivityModal.form.activityTypeId)
        if (matched) {
          act.activityType = { id: matched.id, name: matched.name, baseWeight: matched.baseWeight }
        }
      }
    }
    actionFeedback.value = `Ejercicio "${editActivityModal.form.title}" actualizado correctamente.`
    closeEditActivityModal()
  } catch (err: any) {
    editActivityModal.error = messageOf(err, 'Error al actualizar el ejercicio.')
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
    archiveActivityModal.error = messageOf(err, 'Error al archivar el ejercicio.')
  } finally {
    archiveActivityModal.saving = false
  }
}

// ─── Helpers formulario de creación ───────────────────────────────────────────
function resetForm() {
  form.title = ''
  form.questionText = ''
  submitError.value = null
  codingBuilderRef.value?.reset()
  mcqBuilderRef.value?.reset()
  fillCodeBuilderRef.value?.reset()
  dragDropBuilderRef.value?.reset()
  matchingBuilderRef.value?.reset()
  orderingBuilderRef.value?.reset()
  htmlCssBuilderRef.value?.reset()
}

function getActiveBuilderConfig(): { valid: boolean; error?: string; config?: any } {
  switch (exerciseType.value) {
    case 'coding':
      return codingBuilderRef.value?.validateAndGetConfig(form.totalPoints) || { valid: false, error: 'Configurador de código no disponible.' }
    case 'mcq':
      return mcqBuilderRef.value?.validateAndGetConfig(form.totalPoints) || { valid: false, error: 'Configurador de opción múltiple no disponible.' }
    case 'fill_code':
      return fillCodeBuilderRef.value?.validateAndGetConfig(form.totalPoints) || { valid: false, error: 'Configurador de completar código no disponible.' }
    case 'drag_drop':
      return dragDropBuilderRef.value?.validateAndGetConfig(form.totalPoints) || { valid: false, error: 'Configurador de arrastrar y soltar no disponible.' }
    case 'matching':
      return matchingBuilderRef.value?.validateAndGetConfig(form.totalPoints) || { valid: false, error: 'Configurador de emparejar no disponible.' }
    case 'ordering':
      return orderingBuilderRef.value?.validateAndGetConfig(form.totalPoints) || { valid: false, error: 'Configurador de ordenamiento no disponible.' }
    case 'html_css':
      return htmlCssBuilderRef.value?.validateAndGetConfig(form.totalPoints) || { valid: false, error: 'Configurador de HTML y CSS no disponible.' }
    default:
      return { valid: false, error: 'Tipo de ejercicio desconocido.' }
  }
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
    activityTypes.value = typesList
    if (typesList.length > 0) {
      const defaultType = typesList.find((t: any) => t.code === 'AUTO-EVAL') || typesList[0]
      activityTypeId.value = defaultType.id
    }
  } catch (err: any) {
    console.error('Error al inicializar diseñador:', err)
  }
}

async function submitExercise() {
  if (!form.learningUnitId) {
    submitError.value = 'Selecciona una unidad de aprendizaje.'
    return
  }
  if (!form.title.trim()) {
    submitError.value = 'El título del ejercicio es obligatorio.'
    return
  }
  if (!form.questionText.trim()) {
    submitError.value = 'El enunciado de la pregunta es obligatorio.'
    return
  }

  // Validar campos específicos del tipo de ejercicio antes de enviar
  const builderResult = getActiveBuilderConfig()
  if (!builderResult.valid) {
    submitError.value = builderResult.error || 'La configuración del ejercicio no es válida.'
    return
  }

  isSubmitting.value = true
  submitError.value = null

  let createdActivityId: number | null = null

  try {
    // 1. Crear Activity en estado borrador (draft)
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

    if (!actRes || !actRes.id) {
      throw new Error('No se pudo crear la actividad en el servidor.')
    }
    createdActivityId = actRes.id

    // 2. Crear ActivityQuestion con points = totalPoints y el config validado
    try {
      await api.post('/activity-questions', {
        activityId: createdActivityId,
        type: exerciseType.value,
        question: form.questionText.trim(),
        points: form.totalPoints,
        order: 0,
        config: builderResult.config
      })
    } catch (questionErr: any) {
      // Regla atómica T2: si falla la creación de la pregunta, eliminar la actividad creada
      // para no dejar un borrador huérfano en la base de datos
      if (createdActivityId) {
        try {
          await api.del(`/activities/${createdActivityId}`)
        } catch (delErr) {
          console.error('Error al limpiar actividad huérfana tras fallo:', delErr)
        }
      }
      throw questionErr
    }

    // 3. Si la casilla «Publicar ahora» está activa, publicar inmediatamente
    if (publishImmediately.value && createdActivityId) {
      try {
        await api.patch(`/activities/${createdActivityId}/publish`)
      } catch (pubErr: any) {
        console.warn('La actividad se guardó como borrador pero falló la publicación inmediata:', pubErr)
      }
    }

    successCreatedId.value = createdActivityId
    actionFeedback.value = publishImmediately.value
      ? `Ejercicio "${form.title.trim()}" guardado y publicado exitosamente.`
      : `Ejercicio "${form.title.trim()}" guardado como borrador exitosamente.`

    // Recargar actividades de la unidad
    await loadUnitActivities(form.learningUnitId)
    resetForm()
  } catch (err: any) {
    const msg = messageOf(err, 'Error al guardar el ejercicio')
    submitError.value = Array.isArray(msg) ? msg.join(', ') : msg
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchInitialData()
})

// Escape cierra el diálogo abierto aunque el foco se haya perdido.
useEscapeToClose(() => editActivityModal.open, closeEditActivityModal)
useEscapeToClose(() => archiveActivityModal.open, () => { archiveActivityModal.open = false })
</script>
