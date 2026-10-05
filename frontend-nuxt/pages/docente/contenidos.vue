<template>
  <div class="max-w-5xl mx-auto space-y-6">
    <DocentePestanasClase v-if="selectedClassId" :class-id="selectedClassId" activa="contenido" :nombre="selectedClass?.name" :codigo="selectedClass?.code" />
    <!-- Cabecera DOC-V02 -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">
          Contenidos del curso
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5 max-w-md">
          Organiza el curso en módulos, temas y lecciones. Abre una lección para escribir su explicación y crear sus ejercicios.
        </p>
      </div>

      <!-- Selector de Clase y Botón Nuevo Módulo -->
      <div class="flex flex-wrap items-center gap-3">
        <div v-if="teacherClasses.length > 1" class="flex items-center gap-2">
          <label for="class-selector" class="text-xs font-semibold text-base-texto-secundario whitespace-nowrap">Clase:</label>
          <select
            id="class-selector"
            v-model="selectedClassId"
            @change="loadSections"
            class="min-h-[44px] text-xs bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-1.5 outline-none focus:border-acento-ambar-fuerte">
            <option v-for="c in teacherClasses" :key="c.id" :value="c.id">
              {{ c.name }} ({{ c.code }})
            </option>
          </select>
        </div>

        <button
          v-if="selectedClassId"
          @click="openNewModuleModal"
          class="min-h-[44px] px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte shadow-sm"
          aria-label="Crear nuevo módulo curricular">
          <Plus :size="14" aria-hidden="true" />
          <span>Nuevo módulo</span>
        </button>

        <!-- Botón Traer de otra clase (T3) -->
        <button
          v-if="selectedClassId && (otherClasses.length > 0 || plantillas.length > 0)"
          id="abrir-importar"
          type="button"
          @click="openImportModal"
          class="min-h-[44px] px-3 py-1.5 rounded-md borde-afordancia bg-base-blanco text-base-texto-primario font-semibold text-xs hover:bg-base-bg-secundario transition-colors flex items-center gap-1.5 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte shadow-sm"
          aria-label="Traer contenidos de otra clase">
          <CopyPlus :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" />
          <span>Traer de otra clase</span>
        </button>
      </div>
    </header>

    <!-- Feedback de guardado -->
    <div v-if="actionFeedback" role="status" aria-live="polite" class="p-3 bg-semantico-pasa/10 border border-semantico-pasa/40 text-semantico-pasa rounded-lg text-xs flex items-center justify-between">
      <span>{{ actionFeedback }}</span>
      <button @click="actionFeedback = null" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-pasa rounded">Cerrar</button>
    </div>

    <!-- Feedback de error de acción -->
    <div v-if="actionError" role="alert" aria-live="assertive" class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-lg text-xs flex items-center justify-between">
      <span class="inline-flex items-center gap-1"><CircleX :size="14" aria-hidden="true" /> {{ actionError }}</span>
      <button @click="actionError = null" class="text-[11px] underline focus:outline-none focus:ring-2 focus:ring-semantico-falla rounded">Cerrar</button>
    </div>

    <!-- ESTADO 1: Cargando -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <Loader2 :size="14" class="inline-block animate-spin mr-2" aria-hidden="true" /> Cargando los contenidos…
    </div>

    <!-- ESTADO 2: Error -->
    <div v-else-if="errorMessage" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <TriangleAlert :size="22" class="text-2xl" aria-hidden="true" />
      <p class="font-bold text-semantico-falla">{{ errorMessage }}</p>
      <button
        @click="loadSections"
        class="px-4 py-2 rounded-md bg-base-bg-secundario border border-base-borde-fuerte font-semibold hover:bg-base-borde-sutil transition-colors">
        Volver a cargar
      </button>
    </div>

    <!-- ESTADO 3: Vacío -->
    <div v-else-if="sections.length === 0" class="p-12 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-4">
      <BookOpen :size="28" class="text-3xl block" aria-hidden="true" />
      <div>
        <h3 class="font-bold text-base-texto-primario text-sm">Esta clase todavía no tiene módulos</h3>
        <p class="text-base-texto-secundario max-w-md mx-auto mt-1">
          Crea el primero o trae los de otra clase tuya o de una plantilla.
        </p>
      </div>
      <div class="flex items-center justify-center gap-3">
        <button
          v-if="selectedClassId"
          @click="openNewModuleModal"
          class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte shadow-sm">
          <Plus :size="14" aria-hidden="true" />
          <span>Crear el primer módulo</span>
        </button>
        <button
          v-if="selectedClassId && (otherClasses.length > 0 || plantillas.length > 0)"
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
              <p v-if="sec.description" class="text-[11px] text-slate-600">
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
              class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer border focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
              :class="sec.isPublished
                ? 'bg-semantico-pasa/10 text-emerald-800 border-semantico-pasa/40 hover:bg-semantico-pasa/25'
                : 'bg-base-blanco text-base-texto-secundario border-base-borde-fuerte hover:text-base-texto-primario'">
              {{ sec.isPublished ? 'Publicado' : 'Borrador' }}
            </button>
            <button
              @click="openNewTopicModal(sec)"
              class="min-h-[44px] sm:min-h-0 px-2.5 py-1 rounded text-[11px] font-bold bg-base-blanco border border-base-borde-fuerte text-base-texto-primario hover:bg-acento-ambar/10 hover:border-acento-ambar-fuerte transition-colors focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte flex items-center gap-1"
              :aria-label="`Crear nuevo tema en módulo ${sec.title}`">
              <Plus :size="13" aria-hidden="true" />
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
                <!-- Editar y archivar detrás de «Más» (crítica del 05/10): «Archivar» en rojo junto a «Nueva lección»
                     llamaba la atención en cada tema y quedaba a un clic por error. -->
                <MenuMas :id-boton="`mas-tema-${topic.id}`" :etiqueta="`Más acciones del tema ${topic.title}`">
                  <button type="button" class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-base-texto-primario hover:bg-acento-ambar/10 focus:outline-none focus:bg-acento-ambar/10"
                    @click="openEditTopicModal(topic)">
                    Editar tema
                  </button>
                  <button type="button" class="w-full min-h-[44px] sm:min-h-[36px] px-3 text-left font-semibold text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none focus:bg-semantico-falla/10"
                    @click="confirmArchiveTopic(topic)">
                    Archivar tema…
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

    <!-- Una ventana a la vez; cada una es su propio componente con la base común (foco, Tab atrapado, Escape). -->
    <DocenteContenidosVentanaEditarTema v-if="ventana?.tipo === 'tema'" :tema="ventana.tema" @cerrar="ventana = null" />
    <DocenteContenidosVentanaArchivarTema v-else-if="ventana?.tipo === 'archivar'" :tema="ventana.tema" @cerrar="ventana = null" />
    <DocenteContenidosVentanaEditarLeccion v-else-if="ventana?.tipo === 'leccion'" :leccion="ventana.leccion" @cerrar="ventana = null" />
    <DocenteContenidosVentanaImportar v-else-if="ventana?.tipo === 'importar'" @cerrar="ventana = null" />

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
// Contenidos del curso (DOC-V02): la página organiza el árbol y abre una ventana a la vez; los datos y la API están en
// composables/useContenidosCurso.ts y cada ventana en components/docente/contenidos/ (PAT-01 y PAT-04; antes un solo
// archivo de 1131 líneas con cuatro ventanas y sus llamadas a la API).
import { computed, nextTick, onMounted, provide, ref } from 'vue'
import { BookOpen, ChevronRight, CircleX, CopyPlus, FileText, Folder, Loader2, Pencil, Plus, TriangleAlert } from 'lucide-vue-next'
import CurriculumBuilderModals from '~/components/docente/CurriculumBuilderModals.vue'
import UnitLessonsModal from '~/components/docente/UnitLessonsModal.vue'
import { CLAVE_CONTENIDOS, useContenidosCurso } from '~/composables/useContenidosCurso'
import { mayorOrden, resumenDeLeccion, type LeccionDelArbol, type ModuloDelArbol, type TemaDelArbol } from '~/utils/contenidosCurso'

definePageMeta({ layout: 'teacher' })

const estado = useContenidosCurso()
provide(CLAVE_CONTENIDOS, estado)
// Los nombres de la plantilla se conservan: así el árbol no cambió y el cambio queda en la lógica.
const {
  clases: teacherClasses, claseId: selectedClassId, clase: selectedClass, otrasClases: otherClasses, modulos: sections,
  cargando: isLoading, error: errorMessage, aviso: actionFeedback, errorAccion: actionError, plantillas,
  cargarModulos: loadSections, alternarPublicacion: toggleSectionPublish,
  explicaciones: lessonsByUnit, ejercicios: exerciseCountByUnit, cargarExplicaciones: loadLessons,
} = estado

type Ventana =
  | { tipo: 'tema' | 'archivar'; tema: TemaDelArbol }
  | { tipo: 'leccion'; leccion: LeccionDelArbol }
  | { tipo: 'importar' }
const ventana = ref<Ventana | null>(null)
const openEditTopicModal = (tema: TemaDelArbol) => { ventana.value = { tipo: 'tema', tema } }
const confirmArchiveTopic = (tema: TemaDelArbol) => { ventana.value = { tipo: 'archivar', tema } }
const openEditUnitModal = (leccion: LeccionDelArbol) => { ventana.value = { tipo: 'leccion', leccion } }
const openImportModal = () => { ventana.value = { tipo: 'importar' } }

// Crear módulos, temas y lecciones, y escribir las explicaciones: sus ventanas ya eran componentes aparte.
const builderModalsRef = ref<InstanceType<typeof CurriculumBuilderModals> | null>(null)
const lessonsModalRef = ref<InstanceType<typeof UnitLessonsModal> | null>(null)
const selectedUnitForLessons = ref<{ id: number; title: string } | null>(null)

function openNewModuleModal() {
  if (selectedClassId.value) builderModalsRef.value?.openCreateModule(selectedClassId.value, mayorOrden(sections.value))
}
function openNewTopicModal(sec: ModuloDelArbol) {
  builderModalsRef.value?.openCreateTopic(sec.id, mayorOrden(sec.topics))
}
function openNewUnitModal(sec: ModuloDelArbol, topic: TemaDelArbol) {
  builderModalsRef.value?.openCreateUnit(sec.id, topic.id, mayorOrden(topic.learningUnits))
}
function openLessonsModal(unit: LeccionDelArbol, opts: { create?: boolean; editId?: number } = {}) {
  selectedUnitForLessons.value = { id: unit.id, title: unit.title }
  nextTick(() => lessonsModalRef.value?.openModal(opts))
}
function onLessonsModalClosed() {
  if (selectedUnitForLessons.value) void loadLessons(selectedUnitForLessons.value.id)
}
function onSectionCreated(nuevo: ModuloDelArbol) {
  sections.value.push({ ...nuevo, isPublished: nuevo.isPublished ?? false, topics: [] })
}
function onTopicCreated(p: { sectionId: number; topic: TemaDelArbol }) {
  const m = sections.value.find((s) => s.id === p.sectionId)
  if (m) (m.topics ??= []).push({ ...p.topic, learningUnits: [] })
}
function onUnitCreated(p: { sectionId: number; topicId: number; unit: LeccionDelArbol }) {
  const t = sections.value.find((s) => s.id === p.sectionId)?.topics?.find((x) => x.id === p.topicId)
  if (t) (t.learningUnits ??= []).push(p.unit)
}

// La lección abierta muestra sus explicaciones y sus ejercicios.
const expandedUnitId = ref<number | null>(null)
function toggleUnit(unit: LeccionDelArbol) {
  expandedUnitId.value = expandedUnitId.value === unit.id ? null : unit.id
  if (expandedUnitId.value) void loadLessons(unit.id)
}
function setExerciseCount(unitId: number, n: number) {
  exerciseCountByUnit[unitId] = n
}
const unitSummary = computed(() => {
  const out: Record<number, string> = {}
  const ids = new Set([...Object.keys(lessonsByUnit), ...Object.keys(exerciseCountByUnit)].map(Number))
  for (const id of ids) out[id] = resumenDeLeccion(lessonsByUnit[id]?.length, exerciseCountByUnit[id])
  return out
})

// Con ?classId abre esa clase; con ?unitId, además, esa lección (enlaces desde «Hoy» y desde el ejercicio).
const route = useRoute()
onMounted(async () => {
  await estado.cargarClases(Number(route.query.classId) || undefined)
  const qUnit = Number(route.query.unitId)
  if (qUnit) {
    expandedUnitId.value = qUnit
    void loadLessons(qUnit)
    nextTick(() => document.getElementById(`unidad-${qUnit}`)?.scrollIntoView({ block: 'center' }))
  }
})
</script>
