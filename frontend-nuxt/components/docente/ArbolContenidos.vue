<template>
  <div class="space-y-4">
    <div
      v-for="sec in activeSections"
      :key="sec.id"
      class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden"
    >
      <!-- Cabecera de Sección / Módulo -->
      <!-- En el celular, título arriba y acciones debajo (antes el número se aplastaba y el título quedaba en una columna angosta). -->
      <div class="p-4 bg-base-bg-secundario flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-base-borde-sutil">
        <div class="flex items-start sm:items-center gap-3 min-w-0">
          <span class="shrink-0 w-6 h-6 rounded bg-acento-ambar/20 text-acento-ambar-fuerte font-bold text-xs flex items-center justify-center">
            {{ sec.order || 'M' }}
          </span>
          <div>
            <h2 class="text-xs font-bold text-base-texto-primario">
              {{ sec.title }}
            </h2>
            <p v-if="sec.description" class="text-[11px] text-slate-600">
              {{ sec.description }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <span v-if="!sec.isPublished" class="text-[11px] text-base-texto-secundario italic hidden md:inline">
            Los estudiantes no lo verán hasta que lo publiques
          </span>
          <!-- Estado de publicación: chip (etiqueta) + botón (acción), D1 -->
          <DocenteContenidosEstadoPublicacion
            :publicado="sec.isPublished"
            :titulo="sec.title"
            @accion="toggleSectionPublish(sec)"
          />
          <button
            @click="openNewTopicModal(sec)"
            class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded text-[11px] font-bold bg-base-blanco border border-base-borde-fuerte text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte flex items-center gap-1"
            :aria-label="`Crear nuevo tema en módulo ${sec.title}`"
          >
            <Plus :size="13" aria-hidden="true" />
            <span>Nuevo tema</span>
          </button>
          <!-- Menú «Más» del módulo: orden D2 fijo (Editar, Archivar, separador, Eliminar) -->
          <MenuMas :id-boton="`mas-seccion-${sec.id}`" :etiqueta="`Más acciones del módulo ${sec.title}`">
            <button
              type="button"
              class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-base-texto-primario hover:bg-acento-ambar/10 focus:outline-none flex items-center gap-2"
              @click="openEditModuleModal(sec)"
            >
              <Pencil :size="13" aria-hidden="true" />
              Editar módulo…
            </button>
            <button
              type="button"
              class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-slate-700 hover:bg-base-bg-secundario focus:outline-none flex items-center gap-2"
              @click="confirmArchiveModule(sec)"
            >
              <Archive :size="13" aria-hidden="true" />
              Archivar módulo…
            </button>
            <div class="border-t border-base-borde-sutil my-1" role="separator" />
            <button
              type="button"
              class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none focus:bg-semantico-falla/10 flex items-center gap-2"
              @click="confirmarEliminarModulo(sec)"
            >
              <Trash2 :size="13" aria-hidden="true" />
              Eliminar módulo…
            </button>
          </MenuMas>
        </div>
      </div>

      <!-- Temas y Unidades -->
      <div class="p-4 space-y-3">
        <div v-if="!activeTopics(sec).length && !archivedTopics(sec).length" class="text-xs text-base-texto-secundario italic p-2">
          Sin temas agregados a este módulo.
        </div>

        <div
          v-for="topic in activeTopics(sec)"
          :key="topic.id"
          class="rounded-lg border border-base-borde-sutil p-3 bg-base-blanco space-y-2"
        >
          <!-- Cabecera del Topic con acciones Editar / Archivar / Nueva unidad -->
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span class="font-bold text-base-texto-primario flex items-center gap-1.5">
              <Folder :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" />
              <span>{{ topic.title }}</span>
            </span>
            <div class="flex items-center gap-2">
              <button
                @click="openNewUnitModal(sec, topic)"
                class="min-h-[44px] sm:min-h-0 px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 bg-acento-ambar-fuerte/10 border border-acento-ambar-fuerte/30 text-acento-ambar-fuerte hover:bg-acento-ambar/20 transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                :aria-label="`Nueva lección en el tema ${topic.title}`"
              >
                <Plus :size="13" aria-hidden="true" /> Nueva lección
              </button>
              <!-- Editar, archivar y eliminar detrás de «Más» (D2) -->
              <MenuMas :id-boton="`mas-tema-${topic.id}`" :etiqueta="`Más acciones del tema ${topic.title}`">
                <button
                  type="button"
                  class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-base-texto-primario hover:bg-acento-ambar/10 focus:outline-none flex items-center gap-2"
                  @click="openEditTopicModal(topic)"
                >
                  <Pencil :size="13" aria-hidden="true" />
                  Editar tema…
                </button>
                <button
                  type="button"
                  class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-slate-700 hover:bg-base-bg-secundario focus:outline-none flex items-center gap-2"
                  @click="confirmArchiveTopic(topic)"
                >
                  <Archive :size="13" aria-hidden="true" />
                  Archivar tema…
                </button>
                <div class="border-t border-base-borde-sutil my-1" role="separator" />
                <button
                  type="button"
                  class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none flex items-center gap-2"
                  @click="confirmarEliminarTema(sec, topic)"
                >
                  <Trash2 :size="13" aria-hidden="true" />
                  Eliminar tema…
                </button>
              </MenuMas>
            </div>
          </div>

          <!-- Unidades: cada una se abre y muestra sus lecciones y sus ejercicios -->
          <div v-if="activeUnits(topic).length" class="pl-4 space-y-1.5 pt-1">
            <div
              v-for="unit in activeUnits(topic)"
              :key="unit.id"
              :id="`unidad-${unit.id}`"
              class="rounded-lg border text-xs transition-colors"
              :class="expandedUnitId === unit.id ? 'border-acento-ambar-fuerte/50 bg-base-blanco' : 'border-transparent bg-base-bg-secundario'"
            >
              <div class="flex items-center justify-between gap-2 p-2">
                <button
                  type="button"
                  @click="toggleUnit(unit)"
                  :aria-expanded="expandedUnitId === unit.id"
                  :aria-controls="`unidad-panel-${unit.id}`"
                  class="min-h-[44px] sm:min-h-0 flex items-center gap-2 text-left flex-1 min-w-0 rounded focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                >
                  <ChevronRight :size="16" class="shrink-0 text-base-texto-secundario transition-transform" :class="expandedUnitId === unit.id ? 'rotate-90' : ''" aria-hidden="true" />
                  <span class="text-base-texto-primario font-semibold truncate">{{ unit.title }}</span>
                  <span v-if="unitSummary[unit.id]" class="text-[10px] text-base-texto-secundario whitespace-nowrap">
                    {{ unitSummary[unit.id] }}
                  </span>
                </button>
                <div class="flex items-center gap-2 shrink-0">
                  <button
                    @click="openEditUnitModal(unit)"
                    class="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 inline-flex items-center justify-center p-1 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-blanco focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                    :aria-label="`Editar la lección ${unit.title}`"
                    title="Editar lección"
                  >
                    <Pencil :size="14" aria-hidden="true" />
                  </button>
                  <!-- Menú Más de la lección (D2) -->
                  <MenuMas :id-boton="`mas-leccion-${unit.id}`" :etiqueta="`Más acciones de la lección ${unit.title}`">
                    <button
                      type="button"
                      class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-base-texto-primario hover:bg-acento-ambar/10 focus:outline-none flex items-center gap-2"
                      @click="openEditUnitModal(unit)"
                    >
                      <Pencil :size="13" aria-hidden="true" />
                      Editar lección…
                    </button>
                    <button
                      type="button"
                      class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-slate-700 hover:bg-base-bg-secundario focus:outline-none flex items-center gap-2"
                      @click="confirmArchiveUnit(unit)"
                    >
                      <Archive :size="13" aria-hidden="true" />
                      Archivar lección…
                    </button>
                    <div class="border-t border-base-borde-sutil my-1" role="separator" />
                    <button
                      type="button"
                      class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none flex items-center gap-2"
                      @click="confirmarEliminarLeccion(unit)"
                    >
                      <Trash2 :size="13" aria-hidden="true" />
                      Eliminar lección…
                    </button>
                  </MenuMas>
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
                      class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded-md text-[11px] font-bold bg-acento-ambar-fuerte text-base-blanco hover:bg-acento-ambar inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                      :aria-label="`Explicación de la lección ${unit.title}`"
                    >
                      <BookOpen :size="14" aria-hidden="true" /> {{ lessonsByUnit[unit.id]?.length ? 'Explicación' : 'Escribir la explicación' }}
                    </button>
                  </div>
                  <p v-if="!lessonsByUnit[unit.id]" class="text-[11px] text-base-texto-secundario animate-pulse">Cargando la explicación…</p>
                  <p v-else-if="lessonsByUnit[unit.id].length === 0" class="text-[11px] text-base-texto-secundario italic">
                    Sin explicación. Una explicación corta con un ejemplo prepara al estudiante antes de los ejercicios.
                  </p>
                  <ul v-else class="divide-y divide-base-borde-sutil rounded-lg border border-base-borde-sutil bg-base-blanco">
                    <li v-for="l in lessonsByUnit[unit.id]" :key="l.id">
                      <button
                        type="button"
                        @click="openLessonsModal(unit, { editId: l.id })"
                        class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte rounded-lg"
                        :aria-label="`Editar la explicación ${l.title}`"
                      >
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
                  @count="(n: number) => setExerciseCount(unit.id, n)"
                />
              </div>
            </div>
          </div>
          <div v-else class="text-[11px] text-base-texto-secundario pl-4 italic">
            Este tema todavía no tiene lecciones activas.
          </div>

          <!-- Bloque «Lecciones archivadas (N)» -->
          <div v-if="archivedUnits(topic).length" class="mt-2 pl-4 pt-2 border-t border-dashed border-base-borde-sutil">
            <details class="group text-xs">
              <summary class="cursor-pointer font-semibold text-base-texto-secundario hover:text-base-texto-primario list-none flex items-center justify-between py-1">
                <span class="flex items-center gap-1.5">
                  <Archive :size="13" aria-hidden="true" />
                  <span>Lecciones archivadas ({{ archivedUnits(topic).length }})</span>
                </span>
                <ChevronRight :size="14" class="transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <div class="mt-2 space-y-1.5 pl-2">
                <div
                  v-for="u in archivedUnits(topic)"
                  :key="u.id"
                  class="flex items-center justify-between gap-2 p-2 rounded bg-base-bg-secundario text-xs"
                >
                  <span class="truncate text-base-texto-secundario">{{ u.title }}</span>
                  <button
                    type="button"
                    class="px-2.5 py-1 rounded text-[11px] font-semibold border border-base-borde-fuerte hover:bg-base-blanco text-base-texto-primario inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                    @click="restaurarLeccion(u)"
                  >
                    <RotateCcw :size="12" aria-hidden="true" />
                    Restaurar
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>

        <!-- Bloque «Temas archivados (N)» dentro del módulo -->
        <div v-if="archivedTopics(sec).length" class="mt-3 pt-3 border-t border-dashed border-base-borde-sutil">
          <details class="group text-xs">
            <summary class="cursor-pointer font-semibold text-base-texto-primario hover:text-base-texto-primario list-none flex items-center justify-between p-2 rounded bg-base-bg-secundario/50">
              <span class="flex items-center gap-1.5">
                <Archive :size="14" aria-hidden="true" />
                <span>Temas archivados ({{ archivedTopics(sec).length }})</span>
              </span>
              <ChevronRight :size="14" class="transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <div class="mt-2 space-y-2 p-2">
              <div
                v-for="t in archivedTopics(sec)"
                :key="t.id"
                class="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-base-borde-sutil bg-base-blanco text-xs"
              >
                <div>
                  <p class="font-semibold text-base-texto-primario">{{ t.title }}</p>
                  <p class="text-[10px] text-base-texto-secundario">Tema archivado</p>
                </div>
                <button
                  type="button"
                  class="px-2.5 py-1 rounded text-[11px] font-semibold border border-base-borde-fuerte hover:bg-base-bg-secundario text-base-texto-primario inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  @click="restaurarTema(t)"
                >
                  <RotateCcw :size="12" aria-hidden="true" />
                  Restaurar
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- Bloque «Módulos archivados (N)» plegado al final del árbol -->
    <div v-if="archivedSections.length" class="rounded-xl border border-dashed border-base-borde-fuerte p-4 bg-base-bg-secundario/40 space-y-2">
      <details class="group text-xs">
        <summary class="cursor-pointer font-bold text-base-texto-secundario hover:text-base-texto-primario list-none flex items-center justify-between p-1">
          <span class="flex items-center gap-2">
            <Archive :size="16" aria-hidden="true" />
            <span>Módulos archivados ({{ archivedSections.length }})</span>
          </span>
          <ChevronRight :size="16" class="transition-transform group-open:rotate-90" aria-hidden="true" />
        </summary>
        <div class="mt-3 space-y-2 pt-2 border-t border-base-borde-sutil">
          <div
            v-for="sec in archivedSections"
            :key="sec.id"
            class="flex items-center justify-between gap-3 p-3 bg-base-blanco rounded-lg border border-base-borde-sutil text-xs"
          >
            <div class="min-w-0">
              <p class="font-bold text-base-texto-primario truncate">{{ sec.title }}</p>
              <p class="text-[11px] text-base-texto-secundario">Módulo archivado · No visible para estudiantes</p>
            </div>
            <button
              type="button"
              class="min-h-[36px] px-3 py-1 rounded text-xs font-semibold border border-base-borde-fuerte hover:bg-base-bg-secundario text-base-texto-primario inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
              @click="restaurarModulo(sec)"
            >
              <RotateCcw :size="13" aria-hidden="true" />
              Restaurar
            </button>
          </div>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { Archive, BookOpen, ChevronRight, FileText, Folder, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-vue-next'
import type { EstadoContenidos } from '~/composables/useContenidosCurso'
import type { LeccionDelArbol, ModuloDelArbol, TemaDelArbol } from '~/utils/contenidosCurso'

type OpcionesExplicacion = { create?: boolean; editId?: number }

const props = defineProps<{
  estado: EstadoContenidos
  expandedUnitId: number | null
  unitSummary: Record<number, string>
  toggleSectionPublish: (modulo: ModuloDelArbol) => void
  openNewTopicModal: (modulo: ModuloDelArbol) => void
  openEditModuleModal: (modulo: ModuloDelArbol) => void
  confirmArchiveModule: (modulo: ModuloDelArbol) => void
  confirmarEliminarModulo: (modulo: ModuloDelArbol) => void
  restaurarModulo: (modulo: ModuloDelArbol) => void
  openNewUnitModal: (modulo: ModuloDelArbol, tema: TemaDelArbol) => void
  openEditTopicModal: (tema: TemaDelArbol) => void
  confirmArchiveTopic: (tema: TemaDelArbol) => void
  confirmarEliminarTema: (modulo: ModuloDelArbol, tema: TemaDelArbol) => void
  restaurarTema: (tema: TemaDelArbol) => void
  toggleUnit: (leccion: LeccionDelArbol) => void
  openEditUnitModal: (leccion: LeccionDelArbol) => void
  confirmArchiveUnit: (leccion: LeccionDelArbol) => void
  confirmarEliminarLeccion: (leccion: LeccionDelArbol) => void
  restaurarLeccion: (leccion: LeccionDelArbol) => void
  openLessonsModal: (leccion: LeccionDelArbol, opciones?: OpcionesExplicacion) => void
  setExerciseCount: (unitId: number, cantidad: number) => void
}>()

const {
  expandedUnitId, unitSummary, toggleSectionPublish, openNewTopicModal, openEditModuleModal,
  confirmArchiveModule, confirmarEliminarModulo, restaurarModulo,
  openNewUnitModal, openEditTopicModal, confirmArchiveTopic, confirmarEliminarTema, restaurarTema,
  toggleUnit, openEditUnitModal, confirmArchiveUnit, confirmarEliminarLeccion, restaurarLeccion,
  openLessonsModal, setExerciseCount,
} = toRefs(props)

const { modulos: sections, claseId: selectedClassId, explicaciones: lessonsByUnit, ejercicios: exerciseCountByUnit } = toRefs(props.estado)

const activeSections = computed(() => sections.value.filter((s) => s.isActive !== false))
const archivedSections = computed(() => sections.value.filter((s) => s.isActive === false))

function activeTopics(sec: ModuloDelArbol) {
  return (sec.topics ?? []).filter((t) => t.isActive !== false)
}
function archivedTopics(sec: ModuloDelArbol) {
  return (sec.topics ?? []).filter((t) => t.isActive === false)
}
function activeUnits(topic: TemaDelArbol) {
  return (topic.learningUnits ?? []).filter((u) => u.isActive !== false)
}
function archivedUnits(topic: TemaDelArbol) {
  return (topic.learningUnits ?? []).filter((u) => u.isActive === false)
}
</script>