<template>
    <div class="space-y-4">
      <div
        v-for="sec in sections"
        :key="sec.id"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-hidden">
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
            <!-- Publicar/Borrador: color y texto según estado para máxima claridad -->
            <button
              @click="toggleSectionPublish(sec)"
              :aria-label="sec.isPublished ? `Módulo '${sec.title}' publicado. Pulsa para volver a borrador` : `Módulo '${sec.title}' en borrador. Pulsa para publicarlo`"
              class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer border focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte inline-flex items-center gap-1"
              :class="sec.isPublished
                ? 'bg-semantico-pasa/10 text-emerald-800 border-semantico-pasa/40 hover:bg-red-50 hover:border-red-300 hover:text-red-700'
                : 'bg-acento-ambar-fuerte text-base-blanco border-acento-ambar-fuerte hover:bg-acento-ambar'">
              <Check v-if="sec.isPublished" :size="12" aria-hidden="true" />
              <EyeOff v-else :size="12" aria-hidden="true" />
              {{ sec.isPublished ? 'Publicado' : 'Publicar' }}
            </button>
            <button
              @click="openNewTopicModal(sec)"
              class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded text-[11px] font-bold bg-base-blanco border border-base-borde-fuerte text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte flex items-center gap-1"
              :aria-label="`Crear nuevo tema en módulo ${sec.title}`">
              <Plus :size="13" aria-hidden="true" />
              <span>Nuevo tema</span>
            </button>
            <!-- Menú «Más» del módulo: editar orden y eliminar -->
            <MenuMas :id-boton="`mas-seccion-${sec.id}`" :etiqueta="`Más acciones del módulo ${sec.title}`">
              <button type="button" class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none focus:bg-semantico-falla/10 flex items-center gap-2"
                @click="confirmarEliminarModulo(sec)">
                <Trash2 :size="13" aria-hidden="true" />
                Eliminar módulo…
              </button>
            </MenuMas>
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
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span class="font-bold text-base-texto-primario flex items-center gap-1.5">
                <Folder :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" />
                <span>{{ topic.title }}</span>
              </span>
              <div class="flex items-center gap-2">
                <button
                  @click="openNewUnitModal(sec, topic)"
                  class="min-h-[44px] sm:min-h-0 px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 bg-acento-ambar-fuerte/10 border border-acento-ambar-fuerte/30 text-acento-ambar-fuerte hover:bg-acento-ambar/20 transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                  :aria-label="`Nueva lección en el tema ${topic.title}`">
                  <Plus :size="13" aria-hidden="true" /> Nueva lección
                </button>
                <!-- Editar, archivar y eliminar detrás de «Más» -->
                <MenuMas :id-boton="`mas-tema-${topic.id}`" :etiqueta="`Más acciones del tema ${topic.title}`">
                  <button type="button" class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-base-texto-primario hover:bg-acento-ambar/10 focus:outline-none focus:bg-acento-ambar/10"
                    @click="openEditTopicModal(topic)">
                    Editar tema
                  </button>
                  <button type="button" class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-slate-700 hover:bg-base-bg-secundario focus:outline-none flex items-center gap-2"
                    @click="confirmArchiveTopic(topic)">
                    <Archive :size="13" aria-hidden="true" />
                    Archivar tema…
                  </button>
                  <button type="button" class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none flex items-center gap-2"
                    @click="confirmarEliminarTema(sec, topic)">
                    <Trash2 :size="13" aria-hidden="true" />
                    Eliminar tema…
                  </button>
                </MenuMas>
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
                    class="min-h-[44px] sm:min-h-0 flex items-center gap-2 text-left flex-1 min-w-0 rounded focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
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
                      class="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 inline-flex items-center justify-center p-1 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-blanco focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                      :aria-label="`Editar la lección ${unit.title}`" title="Editar lección">
                      <Pencil :size="14" aria-hidden="true" />
                    </button>
                    <!-- Eliminar lección detrás de Más para no borrar por error -->
                    <MenuMas :id-boton="`mas-leccion-${unit.id}`" :etiqueta="`Más acciones de la lección ${unit.title}`">
                      <button type="button" class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none flex items-center gap-2"
                        @click="confirmarEliminarLeccion(unit)">
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
                        :aria-label="`Explicación de la lección ${unit.title}`">
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
                          :aria-label="`Editar la explicación ${l.title}`">
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
              Este tema todavía no tiene lecciones.
            </div>
          </div>
        </div>
      </div>
    </div>


</template>

<script setup lang="ts">
import { toRefs } from 'vue'
import { Archive, BookOpen, Check, ChevronRight, FileText, Folder, Pencil, Plus, Trash2, EyeOff } from 'lucide-vue-next'
import type { EstadoContenidos } from '~/composables/useContenidosCurso'
import type { LeccionDelArbol, ModuloDelArbol, TemaDelArbol } from '~/utils/contenidosCurso'

type OpcionesExplicacion = { create?: boolean; editId?: number }

const props = defineProps<{
  estado: EstadoContenidos
  expandedUnitId: number | null
  unitSummary: Record<number, string>
  toggleSectionPublish: (modulo: ModuloDelArbol) => void
  openNewTopicModal: (modulo: ModuloDelArbol) => void
  confirmarEliminarModulo: (modulo: ModuloDelArbol) => void
  openNewUnitModal: (modulo: ModuloDelArbol, tema: TemaDelArbol) => void
  openEditTopicModal: (tema: TemaDelArbol) => void
  confirmArchiveTopic: (tema: TemaDelArbol) => void
  confirmarEliminarTema: (modulo: ModuloDelArbol, tema: TemaDelArbol) => void
  toggleUnit: (leccion: LeccionDelArbol) => void
  openEditUnitModal: (leccion: LeccionDelArbol) => void
  confirmarEliminarLeccion: (leccion: LeccionDelArbol) => void
  openLessonsModal: (leccion: LeccionDelArbol, opciones?: OpcionesExplicacion) => void
  setExerciseCount: (unitId: number, cantidad: number) => void
}>()

const {
  expandedUnitId, unitSummary, toggleSectionPublish, openNewTopicModal, confirmarEliminarModulo,
  openNewUnitModal, openEditTopicModal, confirmArchiveTopic, confirmarEliminarTema, toggleUnit,
  openEditUnitModal, confirmarEliminarLeccion, openLessonsModal, setExerciseCount,
} = toRefs(props)
const { modulos: sections, claseId: selectedClassId, explicaciones: lessonsByUnit, ejercicios: exerciseCountByUnit } = toRefs(props.estado)
</script>