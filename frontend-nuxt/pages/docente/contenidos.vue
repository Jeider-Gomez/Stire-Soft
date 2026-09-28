<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <!-- Cabecera DOC-V02 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Contenidos del curso
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5 max-w-md">
          Organiza el curso en módulos, temas y unidades. Abre una unidad para escribir sus lecciones y crear sus ejercicios.
        </p>
      </div>

      <!-- Selector de Clase y Botón Nuevo Módulo -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2">
          <label for="class-selector" class="text-xs font-semibold text-base-texto-secundario whitespace-nowrap">Clase:</label>
          <select
            id="class-selector"
            v-model="selectedClassId"
            @change="loadSections"
            class="text-xs bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-1.5 outline-none focus:border-acento-ambar-fuerte">
            <option v-for="c in teacherClasses" :key="c.id" :value="c.id">
              {{ c.name }} ({{ c.code }})
            </option>
          </select>
        </div>

        <button
          v-if="selectedClassId"
          @click="openNewModuleModal"
          class="px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte shadow-sm"
          aria-label="Crear nuevo módulo curricular">
          <span>+</span>
          <span>Nuevo módulo</span>
        </button>

        <!-- Botón Traer de otra clase (T3) -->
        <button
          v-if="selectedClassId && otherClasses.length > 0"
          type="button"
          @click="openImportModal"
          class="px-3 py-1.5 rounded-md borde-afordancia bg-base-blanco text-base-texto-primario font-semibold text-xs hover:bg-base-bg-secundario transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte shadow-sm"
          aria-label="Traer contenidos de otra clase">
          <CopyPlus :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" />
          <span>Traer de otra clase</span>
        </button>
      </div>
    </header>

    <!-- Feedback de guardado -->
    <div v-if="actionFeedback" role="status" aria-live="polite" class="p-3 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-lg text-xs flex items-center justify-between">
      <span>✔ {{ actionFeedback }}</span>
      <button @click="actionFeedback = null" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-pasa rounded">Cerrar</button>
    </div>

    <!-- Feedback de error de acción -->
    <div v-if="actionError" role="alert" aria-live="assertive" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs flex items-center justify-between">
      <span>✖ {{ actionError }}</span>
      <button @click="actionError = null" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-falla rounded">Cerrar</button>
    </div>

    <!-- ESTADO 1: Cargando -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <span class="inline-block animate-spin mr-2">⏳</span> Cargando estructura curricular...
    </div>

    <!-- ESTADO 2: Error -->
    <div v-else-if="errorMessage" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <span class="text-2xl">⚠</span>
      <p class="font-bold text-semantico-falla">{{ errorMessage }}</p>
      <button
        @click="loadSections"
        class="px-4 py-2 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil transition-colors">
        Reintentar carga
      </button>
    </div>

    <!-- ESTADO 3: Vacío -->
    <div v-else-if="sections.length === 0" class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-4">
      <span class="text-3xl block">📚</span>
      <div>
        <h3 class="font-bold text-base-texto-primario text-sm">Sin módulos curriculares</h3>
        <p class="text-base-texto-secundario max-w-md mx-auto mt-1">
          Esta clase aún no cuenta con secciones temáticas configuradas en el sistema.
        </p>
      </div>
      <div class="flex items-center justify-center gap-3">
        <button
          v-if="selectedClassId"
          @click="openNewModuleModal"
          class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte shadow-sm">
          <span>+</span>
          <span>Crear primer módulo</span>
        </button>
        <button
          v-if="selectedClassId && otherClasses.length > 0"
          type="button"
          @click="openImportModal"
          class="px-4 py-2 rounded-md borde-afordancia bg-base-blanco text-base-texto-primario font-semibold text-xs hover:bg-base-bg-secundario transition-colors inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte shadow-sm">
          <CopyPlus :size="14" class="text-acento-ambar-fuerte" />
          <span>Traer de otra clase</span>
        </button>
      </div>
    </div>

    <!-- ESTADO 4: Defecto (Árbol Curricular) -->
    <div v-else class="space-y-4">
      <div
        v-for="sec in sections"
        :key="sec.id"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden">
        <!-- Cabecera de Sección / Módulo -->
        <div class="p-4 bg-base-bg-secundario flex items-center justify-between gap-3 border-b border-base-borde-sutil">
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded bg-acento-ambar/20 text-acento-ambar-fuerte font-bold text-xs flex items-center justify-center">
              {{ sec.order || 'M' }}
            </span>
            <div>
              <h2 class="text-xs font-bold text-base-texto-primario">
                {{ sec.title }}
              </h2>
              <p v-if="sec.description" class="text-[11px] text-base-texto-secundario">
                {{ sec.description }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span v-if="!sec.isPublished" class="text-[11px] text-base-texto-secundario italic hidden md:inline">
              Los estudiantes no lo verán hasta que lo publiques
            </span>
            <button
              @click="toggleSectionPublish(sec)"
              class="px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer border focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
              :class="sec.isPublished
                ? 'bg-semantico-pasa/15 text-semantico-pasa border-semantico-pasa/40 hover:bg-semantico-pasa/25'
                : 'bg-base-blanco text-base-texto-secundario border-base-borde-fuerte hover:text-base-texto-primario'">
              {{ sec.isPublished ? '✔ Publicado' : '○ Borrador' }}
            </button>
            <button
              @click="openNewTopicModal(sec)"
              class="px-2.5 py-1 rounded text-[11px] font-bold bg-base-blanco border border-base-borde-fuerte text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte flex items-center gap-1"
              :aria-label="`Crear nuevo tema en módulo ${sec.title}`">
              <span>+</span>
              <span>Nuevo tema</span>
            </button>
          </div>
        </div>

        <!-- Temas y Unidades -->
        <div class="p-4 space-y-3">
          <div v-if="!sec.topics || sec.topics.length === 0" class="text-xs text-base-texto-secundario italic p-2">
            Sin temas agregados a este módulo.
          </div>

          <div
            v-for="topic in sec.topics"
            :key="topic.id"
            class="rounded-lg border border-base-borde-sutil p-3 bg-base-blanco space-y-2">
            <!-- Cabecera del Topic con acciones Editar / Archivar / Nueva unidad -->
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-base-texto-primario flex items-center gap-1.5">
                <span class="text-acento-ambar-fuerte">📁</span>
                <span>{{ topic.title }}</span>
              </span>
              <div class="flex items-center gap-2">
                <button
                  @click="openNewUnitModal(sec, topic)"
                  class="px-2 py-0.5 rounded text-[11px] font-semibold bg-acento-ambar-fuerte/10 border border-acento-ambar-fuerte/30 text-acento-ambar-fuerte hover:bg-acento-ambar/20 transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  :aria-label="`Nueva unidad en tema ${topic.title}`">
                  + Nueva unidad
                </button>
                <button
                  @click="openEditTopicModal(topic)"
                  class="px-2 py-0.5 rounded text-[11px] font-semibold bg-base-bg-secundario border border-base-borde-fuerte text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  :aria-label="`Editar tema ${topic.title}`">
                  ✏ Editar
                </button>
                <button
                  @click="confirmArchiveTopic(topic)"
                  class="px-2 py-0.5 rounded text-[11px] font-semibold border border-semantico-falla/30 text-semantico-falla hover:bg-semantico-falla/10 transition-colors focus:outline-none focus:ring-2 focus:ring-semantico-falla"
                  :aria-label="`Archivar tema ${topic.title}`">
                  🗄 Archivar
                </button>
              </div>
            </div>

            <!-- Unidades: cada una se abre y muestra sus lecciones y sus ejercicios -->
            <div v-if="topic.learningUnits && topic.learningUnits.length > 0" class="pl-4 space-y-1.5 pt-1">
              <div
                v-for="unit in topic.learningUnits"
                :key="unit.id"
                :id="`unidad-${unit.id}`"
                class="rounded-lg border text-xs transition-colors"
                :class="expandedUnitId === unit.id ? 'border-acento-ambar-fuerte/50 bg-base-blanco' : 'border-transparent bg-base-bg-secundario'">
                <div class="flex items-center justify-between gap-2 p-2">
                  <button
                    type="button"
                    @click="toggleUnit(unit)"
                    :aria-expanded="expandedUnitId === unit.id"
                    :aria-controls="`unidad-panel-${unit.id}`"
                    class="flex items-center gap-2 text-left flex-1 min-w-0 rounded focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                    <ChevronRight :size="16" class="shrink-0 text-base-texto-secundario transition-transform" :class="expandedUnitId === unit.id ? 'rotate-90' : ''" aria-hidden="true" />
                    <span class="text-base-texto-primario font-semibold truncate">{{ unit.title }}</span>
                    <span v-if="unitSummary[unit.id]" class="text-[10px] text-base-texto-secundario whitespace-nowrap">
                      {{ unitSummary[unit.id] }}
                    </span>
                  </button>
                  <div class="flex items-center gap-2 shrink-0">
                    <span v-if="unit.isActive === false" class="text-[10px] font-bold px-2 py-0.5 rounded bg-base-texto-secundario/15 text-base-texto-secundario">Inactiva</span>
                    <button
                      @click="openEditUnitModal(unit)"
                      class="p-1 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-blanco focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                      :aria-label="`Editar unidad ${unit.title}`" title="Editar unidad">
                      <Pencil :size="14" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div v-if="expandedUnitId === unit.id" :id="`unidad-panel-${unit.id}`" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 pt-3 border-t border-base-borde-sutil">
                  <!-- Lecciones -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <h4 class="text-[11px] font-bold uppercase tracking-wider text-base-texto-secundario">
                        Lecciones <span v-if="lessonsByUnit[unit.id]">({{ lessonsByUnit[unit.id].length }})</span>
                      </h4>
                      <button
                        @click="openLessonsModal(unit, lessonsByUnit[unit.id]?.length ? {} : { create: true })"
                        class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-acento-ambar-fuerte text-base-blanco hover:bg-acento-ambar inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                        :aria-label="`Gestionar lecciones de la unidad ${unit.title}`">
                        <BookOpen :size="14" aria-hidden="true" /> {{ lessonsByUnit[unit.id]?.length ? 'Lecciones' : 'Escribir lección' }}
                      </button>
                    </div>
                    <p v-if="!lessonsByUnit[unit.id]" class="text-[11px] text-base-texto-secundario animate-pulse">Cargando lecciones…</p>
                    <p v-else-if="lessonsByUnit[unit.id].length === 0" class="text-[11px] text-base-texto-secundario italic">
                      Sin lecciones. Una lección corta con un ejemplo prepara al estudiante antes de los ejercicios.
                    </p>
                    <ul v-else class="divide-y divide-base-borde-sutil rounded-lg border border-base-borde-sutil bg-base-blanco">
                      <li v-for="l in lessonsByUnit[unit.id]" :key="l.id">
                        <button
                          type="button"
                          @click="openLessonsModal(unit, { editId: l.id })"
                          class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded-lg"
                          :aria-label="`Editar la lección ${l.title}`">
                          <span class="flex items-center gap-2 min-w-0">
                            <FileText :size="14" class="shrink-0 text-base-texto-secundario" aria-hidden="true" />
                            <span class="truncate text-base-texto-primario">{{ l.title }}</span>
                          </span>
                          <span v-if="l.isVisible === false" class="text-[10px] font-bold text-base-texto-secundario">Oculta</span>
                        </button>
                      </li>
                    </ul>
                  </div>

                  <!-- Ejercicios -->
                  <DocenteUnitExercisesPanel
                    :unit-id="unit.id"
                    :class-id="selectedClassId!"
                    @count="(n: number) => setExerciseCount(unit.id, n)" />
                </div>
              </div>
            </div>
            <div v-else class="text-[11px] text-base-texto-secundario pl-4 italic">
              Sin unidades asociadas aún.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: Editar Topic -->
    <Teleport to="body">
      <div
        v-if="editTopicModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-topic-title"
        @click.self="closeEditTopicModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 id="modal-topic-title" class="text-sm font-bold text-base-texto-primario">Editar Tema Curricular</h2>
            <button
              @click="closeEditTopicModal"
              class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded"
              aria-label="Cerrar modal de edición de tema">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitEditTopic" class="space-y-4 text-xs">
            <div>
              <label for="topic-title" class="block font-semibold text-base-texto-primario mb-1">Título *</label>
              <input
                id="topic-title"
                ref="editTopicTitleRef"
                v-model="editTopicModal.form.title"
                type="text"
                required
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="topic-desc" class="block font-semibold text-base-texto-primario mb-1">Descripción</label>
              <textarea
                id="topic-desc"
                v-model="editTopicModal.form.description"
                rows="3"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"></textarea>
            </div>

            <div>
              <label for="topic-order" class="block font-semibold text-base-texto-primario mb-1">Orden</label>
              <input
                id="topic-order"
                v-model.number="editTopicModal.form.order"
                type="number"
                min="0"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <p v-if="editTopicModal.error" role="alert" class="text-semantico-falla text-[11px]">{{ editTopicModal.error }}</p>

            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="closeEditTopicModal"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="editTopicModal.saving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="editTopicModal.saving" class="animate-spin">⚙️</span>
                <span>{{ editTopicModal.saving ? 'Guardando…' : '✔ Guardar cambios' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: Confirmar Archivar Topic -->
    <Teleport to="body">
      <div
        v-if="archiveTopicModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-archive-title"
        @click.self="archiveTopicModal.open = false">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-sm p-6 space-y-4">
          <h2 id="modal-archive-title" class="text-sm font-bold text-base-texto-primario">¿Archivar este tema?</h2>
          <p class="text-xs text-base-texto-secundario">
            El tema <strong class="text-base-texto-primario">{{ archiveTopicModal.topic?.title }}</strong>
            quedará inactivo (soft delete). Esta acción es reversible por un administrador.
          </p>
          <p v-if="archiveTopicModal.error" role="alert" class="text-semantico-falla text-[11px]">{{ archiveTopicModal.error }}</p>
          <div class="flex items-center justify-end gap-3">
            <button
              @click="archiveTopicModal.open = false"
              class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
              Cancelar
            </button>
            <button
              @click="submitArchiveTopic"
              :disabled="archiveTopicModal.saving"
              class="px-5 py-2 rounded-md bg-semantico-falla text-base-blanco font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-semantico-falla">
              <span v-if="archiveTopicModal.saving" class="animate-spin">⚙️</span>
              <span>{{ archiveTopicModal.saving ? 'Archivando…' : '🗄 Confirmar Archivo' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: Editar LearningUnit -->
    <Teleport to="body">
      <div
        v-if="editUnitModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-unit-title"
        @click.self="closeEditUnitModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-md p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h2 id="modal-unit-title" class="text-sm font-bold text-base-texto-primario">Editar Unidad de Aprendizaje</h2>
            <button
              @click="closeEditUnitModal"
              class="text-base-texto-secundario hover:text-base-texto-primario transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded"
              aria-label="Cerrar modal de edición de unidad">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitEditUnit" class="space-y-4 text-xs">
            <div>
              <label for="unit-title" class="block font-semibold text-base-texto-primario mb-1">Título *</label>
              <input
                id="unit-title"
                ref="editUnitTitleRef"
                v-model="editUnitModal.form.title"
                type="text"
                required
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <div>
              <label for="unit-desc" class="block font-semibold text-base-texto-primario mb-1">Descripción</label>
              <textarea
                id="unit-desc"
                v-model="editUnitModal.form.description"
                rows="3"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 resize-y text-base-texto-primario"></textarea>
            </div>

            <div>
              <label for="unit-difficulty" class="block font-semibold text-base-texto-primario mb-1">Nivel de Dificultad</label>
              <select
                id="unit-difficulty"
                v-model="editUnitModal.form.difficulty"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario">
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label for="unit-order" class="block font-semibold text-base-texto-primario mb-1">Orden</label>
              <input
                id="unit-order"
                v-model.number="editUnitModal.form.order"
                type="number"
                min="0"
                class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 text-base-texto-primario" />
            </div>

            <!-- Sección plegable: Tutor IA en esta unidad (§20.1) -->
            <details v-if="editUnitModal.unitId" class="border-t border-base-borde-sutil pt-3">
              <summary class="text-[11px] font-semibold text-base-texto-secundario cursor-pointer hover:text-base-texto-primario select-none flex items-center gap-1.5">
                <span aria-hidden="true">🤖</span> Tutor IA en esta unidad
              </summary>
              <div class="mt-3">
                <DocenteTutorSettingsPanel scope-type="unit" :scope-id="editUnitModal.unitId" />
              </div>
            </details>

            <p v-if="editUnitModal.error" role="alert" class="text-semantico-falla text-[11px]">{{ editUnitModal.error }}</p>

            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                @click="closeEditUnitModal"
                class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-base-borde-fuerte">
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="editUnitModal.saving"
                class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <span v-if="editUnitModal.saving" class="animate-spin">⚙️</span>
                <span>{{ editUnitModal.saving ? 'Guardando…' : '✔ Guardar cambios' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal Traer de otra clase (T3) -->
    <Teleport to="body">
      <div
        v-if="importModal.open"
        class="fixed inset-0 bg-base-texto-primario/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeImportModal">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-import-title"
          class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-base-borde-sutil pb-3">
            <div class="flex items-center gap-2">
              <CopyPlus :size="18" class="text-acento-ambar-fuerte" />
              <h2 id="modal-import-title" class="text-sm font-bold text-base-texto-primario">
                Traer contenido de otra clase
              </h2>
            </div>
            <button
              type="button"
              @click="closeImportModal"
              class="text-base-texto-secundario hover:text-base-texto-primario text-xs p-1"
              aria-label="Cerrar modal">
              ✕
            </button>
          </div>

          <p class="text-xs text-base-texto-secundario">
            Se copian lecciones y ejercicios <strong>sin publicar</strong>. No se copian estudiantes ni notas.
          </p>

          <!-- Selector de clase origen -->
          <div class="space-y-1">
            <label for="import-source-class" class="text-xs font-semibold text-base-texto-primario block">
              Clase de origen:
            </label>
            <select
              id="import-source-class"
              ref="importSourceRef"
              v-model="importModal.sourceClassId"
              @change="onSourceClassChange"
              class="w-full text-xs bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-2 outline-none focus:border-acento-ambar-fuerte">
              <option v-for="c in otherClasses" :key="c.id" :value="c.id">
                {{ c.name }} ({{ c.code }})
              </option>
            </select>
          </div>

          <!-- Secciones disponibles -->
          <div class="space-y-2 flex-1 overflow-y-auto min-h-[140px] max-h-[260px] border border-base-borde-sutil rounded-lg p-3 bg-base-bg-secundario/30">
            <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil text-[11px] font-semibold text-base-texto-secundario">
              <span>Secciones a copiar ({{ importModal.selectedSectionIds.length }}/{{ importModal.sections.length }})</span>
              <div class="space-x-2">
                <button
                  type="button"
                  @click="selectAllSections"
                  class="text-acento-ambar-fuerte hover:underline">
                  Todas
                </button>
                <span>·</span>
                <button
                  type="button"
                  @click="deselectAllSections"
                  class="text-base-texto-secundario hover:underline">
                  Ninguna
                </button>
              </div>
            </div>

            <div v-if="importModal.isLoadingSections" class="p-6 text-center text-xs text-base-texto-secundario">
              <Loader2 :size="14" class="inline-block animate-spin mr-2 align-middle" aria-hidden="true" /> Cargando secciones de la clase...
            </div>

            <div v-else-if="importModal.sections.length === 0" class="p-6 text-center text-xs text-base-texto-secundario italic">
              Esta clase no tiene secciones para copiar.
            </div>

            <div v-else class="space-y-1.5 pt-1">
              <label
                v-for="sec in importModal.sections"
                :key="sec.id"
                class="flex items-center gap-2.5 p-2 rounded hover:bg-base-blanco cursor-pointer text-xs transition-colors border border-transparent hover:border-base-borde-sutil">
                <input
                  type="checkbox"
                  :value="sec.id"
                  v-model="importModal.selectedSectionIds"
                  class="rounded border-base-borde-fuerte text-acento-ambar-fuerte focus:ring-acento-ambar-fuerte" />
                <span class="font-medium text-base-texto-primario">
                  Módulo {{ sec.order || '—' }}: {{ sec.title }}
                </span>
              </label>
            </div>
          </div>

          <p v-if="importModal.error" role="alert" class="text-semantico-falla text-xs">
            {{ importModal.error }}
          </p>

          <div class="flex items-center justify-end gap-3 pt-2 border-t border-base-borde-sutil">
            <button
              type="button"
              @click="closeImportModal"
              :disabled="importModal.isImporting"
              class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-50">
              Cancelar
            </button>
            <button
              type="button"
              @click="submitImport"
              :disabled="importModal.isImporting || !importModal.sourceClassId || importModal.selectedSectionIds.length === 0"
              class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 flex items-center gap-2">
              <Loader2 v-if="importModal.isImporting" :size="14" class="animate-spin" aria-hidden="true" />
              <span>{{ importModal.isImporting ? 'Copiando…' : 'Traer contenido' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modales para construir currículo (Módulo, Tema, Unidad) -->
    <CurriculumBuilderModals
      ref="builderModalsRef"
      @section-created="onSectionCreated"
      @topic-created="onTopicCreated"
      @unit-created="onUnitCreated"
      @feedback="msg => actionFeedback = msg" />

    <!-- Modal para gestionar Lecciones de una unidad -->
    <UnitLessonsModal
      ref="lessonsModalRef"
      :unit="selectedUnitForLessons"
      @close="onLessonsModalClosed" />
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Pencil, BookOpen, FileText, CopyPlus, Loader2 } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import CurriculumBuilderModals from '~/components/docente/CurriculumBuilderModals.vue'
import UnitLessonsModal from '~/components/docente/UnitLessonsModal.vue'

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
  description?: string
  difficulty: string
  order: number
  isActive?: boolean
}

interface TopicItem {
  id: number
  title: string
  description?: string
  order: number
  learningUnits?: LearningUnitItem[]
}

interface SectionItem {
  id: number
  title: string
  description?: string
  order: number
  isPublished: boolean
  topics?: TopicItem[]
}

const api = useApi()
const { messageOf } = useApiErrorMessage()

const teacherClasses = ref<TeacherClass[]>([])
const selectedClassId = ref<number | null>(null)
const sections = ref<SectionItem[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const actionFeedback = ref<string | null>(null)
const actionError = ref<string | null>(null)

// Refs para modales de construcción y lecciones
const builderModalsRef = ref<InstanceType<typeof CurriculumBuilderModals> | null>(null)
const lessonsModalRef = ref<InstanceType<typeof UnitLessonsModal> | null>(null)
const selectedUnitForLessons = ref<{ id: number; title: string } | null>(null)

function openNewModuleModal() {
  if (!selectedClassId.value) return
  const maxOrder = sections.value.reduce((max, s) => Math.max(max, s.order || 0), 0)
  builderModalsRef.value?.openCreateModule(selectedClassId.value, maxOrder)
}

function openNewTopicModal(sec: SectionItem) {
  const maxOrder = (sec.topics || []).reduce((max, t) => Math.max(max, t.order || 0), 0)
  builderModalsRef.value?.openCreateTopic(sec.id, maxOrder)
}

function openNewUnitModal(sec: SectionItem, topic: TopicItem) {
  const maxOrder = (topic.learningUnits || []).reduce((max, u) => Math.max(max, u.order || 0), 0)
  builderModalsRef.value?.openCreateUnit(sec.id, topic.id, maxOrder)
}

function openLessonsModal(unit: LearningUnitItem, opts: { create?: boolean; editId?: number } = {}) {
  selectedUnitForLessons.value = { id: unit.id, title: unit.title }
  nextTick(() => {
    lessonsModalRef.value?.openModal(opts)
  })
}

// ─── Unidad abierta: sus lecciones y ejercicios ─────────────────────────────────
interface LessonSummary { id: number; title: string; isVisible?: boolean }
const route = useRoute()
const expandedUnitId = ref<number | null>(null)
const lessonsByUnit = reactive<Record<number, LessonSummary[]>>({})
const exerciseCountByUnit = reactive<Record<number, number>>({})

const unitSummary = computed(() => {
  const out: Record<number, string> = {}
  const ids = new Set([...Object.keys(lessonsByUnit), ...Object.keys(exerciseCountByUnit)].map(Number))
  for (const id of ids) {
    const parts: string[] = []
    if (lessonsByUnit[id] !== undefined) parts.push(plural(lessonsByUnit[id].length, 'lección', 'lecciones'))
    if (exerciseCountByUnit[id] !== undefined) parts.push(plural(exerciseCountByUnit[id], 'ejercicio', 'ejercicios'))
    out[id] = parts.join(' · ')
  }
  return out
})

async function loadLessons(unitId: number) {
  try {
    const list = await api.get<LessonSummary[]>(`/content/unit/${unitId}/all`)
    lessonsByUnit[unitId] = Array.isArray(list) ? list : []
  } catch {
    lessonsByUnit[unitId] = []
  }
}

function toggleUnit(unit: LearningUnitItem) {
  expandedUnitId.value = expandedUnitId.value === unit.id ? null : unit.id
  if (expandedUnitId.value) loadLessons(unit.id)
}

function setExerciseCount(unitId: number, n: number) {
  exerciseCountByUnit[unitId] = n
}

function onLessonsModalClosed() {
  if (selectedUnitForLessons.value) loadLessons(selectedUnitForLessons.value.id)
}

function onSectionCreated(newSec: any) {
  sections.value.push({
    ...newSec,
    isPublished: newSec.isPublished ?? false,
    topics: []
  })
}

function onTopicCreated(payload: { sectionId: number; topic: any }) {
  const sec = sections.value.find(s => s.id === payload.sectionId)
  if (sec) {
    if (!sec.topics) sec.topics = []
    sec.topics.push({
      ...payload.topic,
      learningUnits: []
    })
  }
}

function onUnitCreated(payload: { sectionId: number; topicId: number; unit: any }) {
  const sec = sections.value.find(s => s.id === payload.sectionId)
  if (sec) {
    const topic = sec.topics?.find(t => t.id === payload.topicId)
    if (topic) {
      if (!topic.learningUnits) topic.learningUnits = []
      topic.learningUnits.push(payload.unit)
    }
  }
}

// Refs para autofocus en modales
const editTopicTitleRef = ref<HTMLInputElement | null>(null)
const editUnitTitleRef = ref<HTMLInputElement | null>(null)

const selectedClass = computed(() => {
  return teacherClasses.value.find(c => c.id === selectedClassId.value)
})

// ─── Modal Editar Topic ────────────────────────────────────────────────────────
const editTopicModal = reactive({
  open: false,
  topicId: null as number | null,
  form: { title: '', description: '', order: 0 },
  saving: false,
  error: null as string | null
})

function openEditTopicModal(topic: TopicItem) {
  editTopicModal.topicId = topic.id
  editTopicModal.form.title = topic.title
  editTopicModal.form.description = topic.description || ''
  editTopicModal.form.order = topic.order
  editTopicModal.error = null
  editTopicModal.open = true
  nextTick(() => editTopicTitleRef.value?.focus())
}

function closeEditTopicModal() {
  editTopicModal.open = false
}

async function submitEditTopic() {
  if (!editTopicModal.form.title.trim()) {
    editTopicModal.error = 'El título es obligatorio.'
    return
  }
  editTopicModal.saving = true
  editTopicModal.error = null
  try {
    await api.patch(`/topic/${editTopicModal.topicId}`, {
      title: editTopicModal.form.title.trim(),
      description: editTopicModal.form.description.trim() || undefined,
      order: editTopicModal.form.order
    })
    // Actualizar en memoria
    for (const sec of sections.value) {
      const t = sec.topics?.find(t => t.id === editTopicModal.topicId)
      if (t) {
        t.title = editTopicModal.form.title.trim()
        t.description = editTopicModal.form.description.trim()
        t.order = editTopicModal.form.order
        break
      }
    }
    actionFeedback.value = `Tema "${editTopicModal.form.title}" actualizado correctamente.`
    closeEditTopicModal()
  } catch (err: any) {
    editTopicModal.error = messageOf(err, 'Error al actualizar el tema.')
  } finally {
    editTopicModal.saving = false
  }
}

// ─── Modal Archivar Topic ──────────────────────────────────────────────────────
const archiveTopicModal = reactive({
  open: false,
  topic: null as TopicItem | null,
  saving: false,
  error: null as string | null
})

function confirmArchiveTopic(topic: TopicItem) {
  archiveTopicModal.topic = topic
  archiveTopicModal.error = null
  archiveTopicModal.open = true
}

async function submitArchiveTopic() {
  if (!archiveTopicModal.topic) return
  archiveTopicModal.saving = true
  archiveTopicModal.error = null
  try {
    await api.del(`/topic/${archiveTopicModal.topic.id}`)
    // Remover de la vista
    for (const sec of sections.value) {
      if (sec.topics) {
        const idx = sec.topics.findIndex(t => t.id === archiveTopicModal.topic!.id)
        if (idx !== -1) {
          sec.topics.splice(idx, 1)
          break
        }
      }
    }
    actionFeedback.value = `Tema "${archiveTopicModal.topic.title}" archivado correctamente.`
    archiveTopicModal.open = false
  } catch (err: any) {
    archiveTopicModal.error = messageOf(err, 'Error al archivar el tema.')
  } finally {
    archiveTopicModal.saving = false
  }
}

// ─── Modal Editar LearningUnit ────────────────────────────────────────────────
const editUnitModal = reactive({
  open: false,
  unitId: null as number | null,
  form: { title: '', description: '', difficulty: 'basico', order: 0 },
  saving: false,
  error: null as string | null
})

function openEditUnitModal(unit: LearningUnitItem) {
  editUnitModal.unitId = unit.id
  editUnitModal.form.title = unit.title
  editUnitModal.form.description = unit.description || ''
  editUnitModal.form.difficulty = unit.difficulty || 'basico'
  editUnitModal.form.order = unit.order
  editUnitModal.error = null
  editUnitModal.open = true
  nextTick(() => editUnitTitleRef.value?.focus())
}

function closeEditUnitModal() {
  editUnitModal.open = false
}

async function submitEditUnit() {
  if (!editUnitModal.form.title.trim()) {
    editUnitModal.error = 'El título es obligatorio.'
    return
  }
  editUnitModal.saving = true
  editUnitModal.error = null
  try {
    await api.patch(`/learning-unit/${editUnitModal.unitId}`, {
      title: editUnitModal.form.title.trim(),
      description: editUnitModal.form.description.trim() || undefined,
      difficulty: editUnitModal.form.difficulty,
      order: editUnitModal.form.order
    })
    // Actualizar en memoria
    for (const sec of sections.value) {
      for (const t of sec.topics || []) {
        const u = t.learningUnits?.find(u => u.id === editUnitModal.unitId)
        if (u) {
          u.title = editUnitModal.form.title.trim()
          u.description = editUnitModal.form.description.trim()
          u.difficulty = editUnitModal.form.difficulty
          u.order = editUnitModal.form.order
          break
        }
      }
    }
    actionFeedback.value = `Unidad "${editUnitModal.form.title}" actualizada correctamente.`
    closeEditUnitModal()
  } catch (err: any) {
    editUnitModal.error = messageOf(err, 'Error al actualizar la unidad.')
  } finally {
    editUnitModal.saving = false
  }
}

// ─── Carga de datos ────────────────────────────────────────────────────────────
async function fetchClasses() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const cls = await api.get<TeacherClass[]>('/class/my-classes')
    if (Array.isArray(cls) && cls.length > 0) {
      teacherClasses.value = cls
      const qClass = Number(route.query.classId)
      selectedClassId.value = cls.find(c => c.id === qClass)?.id ?? cls[0].id
      await loadSections()
      const qUnit = Number(route.query.unitId)
      if (qUnit) {
        expandedUnitId.value = qUnit
        loadLessons(qUnit)
        nextTick(() => document.getElementById(`unidad-${qUnit}`)?.scrollIntoView({ block: 'center' }))
      }
    } else {
      teacherClasses.value = []
      isLoading.value = false
    }
  } catch (err: any) {
    errorMessage.value = messageOf(err, 'Error al cargar las clases del docente')
    isLoading.value = false
  }
}

async function loadSections() {
  if (!selectedClassId.value) return
  isLoading.value = true
  errorMessage.value = null

  try {
    const secList = await api.get<SectionItem[]>(`/sections/class/${selectedClassId.value}`)
    if (Array.isArray(secList)) {
      const fullSections: SectionItem[] = []
      for (const s of secList) {
        try {
          const topics = await api.get<TopicItem[]>(`/topic/section/${s.id}`)
          fullSections.push({
            ...s,
            topics: Array.isArray(topics) ? topics : []
          })
        } catch {
          fullSections.push({ ...s, topics: [] })
        }
      }
      sections.value = fullSections
    } else {
      sections.value = []
    }
  } catch (err: any) {
    errorMessage.value = messageOf(err, 'Error al cargar los contenidos de la clase')
  } finally {
    isLoading.value = false
  }
}

async function toggleSectionPublish(sec: SectionItem) {
  try {
    const newStatus = !sec.isPublished
    await api.patch(`/sections/${sec.id}/publish`, { isPublished: newStatus })
    sec.isPublished = newStatus
    actionFeedback.value = `Sección "${sec.title}" actualizada a ${newStatus ? 'Publicado' : 'Borrador'}.`
  } catch (err: any) {
    actionError.value = 'No se pudo actualizar el estado de publicación.'
  }
}

onMounted(() => {
  fetchClasses()
})

// ─── T3: Traer de otra clase ───────────────────────────────────────────────
interface ResumenImportacion {
  sections: number
  topics: number
  learningUnits: number
  contents: number
  activities: number
  questions: number
}

const otherClasses = computed(() => {
  return teacherClasses.value.filter(c => c.id !== selectedClassId.value)
})

const importModal = reactive({
  open: false,
  sourceClassId: null as number | null,
  sections: [] as Array<{ id: number; title: string; order: number }>,
  selectedSectionIds: [] as number[],
  isLoadingSections: false,
  isImporting: false,
  error: null as string | null
})

// El foco entra al diálogo al abrirlo y vuelve al botón que lo abrió al cerrarlo.
const importSourceRef = ref<HTMLSelectElement | null>(null)
let importOpener: HTMLElement | null = null

function openImportModal() {
  importOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  importModal.open = true
  importModal.error = null
  nextTick(() => importSourceRef.value?.focus())
  if (otherClasses.value.length > 0) {
    importModal.sourceClassId = otherClasses.value[0].id
    onSourceClassChange()
  } else {
    importModal.sourceClassId = null
    importModal.sections = []
    importModal.selectedSectionIds = []
  }
}

function closeImportModal() {
  if (importModal.isImporting) return
  importModal.open = false
  nextTick(() => importOpener?.focus())
}

async function onSourceClassChange() {
  if (!importModal.sourceClassId) {
    importModal.sections = []
    importModal.selectedSectionIds = []
    return
  }
  importModal.isLoadingSections = true
  importModal.error = null
  try {
    const res = await api.get<Array<{ id: number; title: string; order: number }>>(`/sections/class/${importModal.sourceClassId}`)
    importModal.sections = Array.isArray(res) ? res : []
    importModal.selectedSectionIds = importModal.sections.map(s => s.id)
  } catch (err: unknown) {
    importModal.error = messageOf(err, 'Error al cargar las secciones de la clase de origen')
    importModal.sections = []
    importModal.selectedSectionIds = []
  } finally {
    importModal.isLoadingSections = false
  }
}

function selectAllSections() {
  importModal.selectedSectionIds = importModal.sections.map(s => s.id)
}

function deselectAllSections() {
  importModal.selectedSectionIds = []
}

async function submitImport() {
  if (!selectedClassId.value || !importModal.sourceClassId || importModal.selectedSectionIds.length === 0) return
  importModal.isImporting = true
  importModal.error = null

  try {
    const payload: { sourceClassId: number; sectionIds?: number[] } = {
      sourceClassId: importModal.sourceClassId
    }
    if (importModal.selectedSectionIds.length !== importModal.sections.length) {
      payload.sectionIds = importModal.selectedSectionIds
    }

    const res = await api.post<ResumenImportacion>(`/reuse/classes/${selectedClassId.value}/import`, payload)
    importModal.open = false
    actionFeedback.value = `Se trajeron ${plural(res.sections, 'sección', 'secciones')}, ${plural(res.learningUnits, 'unidad', 'unidades')} y ${plural(res.activities, 'ejercicio', 'ejercicios')}. Revísalas y publícalas cuando quieras.`
    await loadSections()
  } catch (err: unknown) {
    importModal.error = messageOf(err, 'Error al traer contenidos de la clase')
  } finally {
    importModal.isImporting = false
  }
}

// Escape cierra el diálogo abierto aunque el foco se haya perdido.
useEscapeToClose(() => editTopicModal.open, closeEditTopicModal)
useEscapeToClose(() => archiveTopicModal.open, () => { archiveTopicModal.open = false })
useEscapeToClose(() => editUnitModal.open, closeEditUnitModal)
useEscapeToClose(() => importModal.open, closeImportModal)
</script>
