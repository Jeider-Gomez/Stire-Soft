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
        <!-- En el celular el nombre largo de la clase sacaba el selector del recuadro: ahora ocupa el ancho y se recorta. -->
        <div v-if="teacherClasses.length > 1" class="flex items-center gap-2 w-full sm:w-auto min-w-0">
          <label for="class-selector" class="text-xs font-semibold text-base-texto-secundario whitespace-nowrap">Clase:</label>
          <select
            id="class-selector"
            v-model="selectedClassId"
            @change="loadSections"
            class="min-w-0 flex-1 sm:flex-none w-full sm:w-auto sm:max-w-xs truncate min-h-[44px] text-xs bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 py-1.5 outline-none focus:border-acento-ambar-fuerte">
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

    <DocenteArbolContenidos
      v-else
      :estado="estado"
      :expanded-unit-id="expandedUnitId"
      :unit-summary="unitSummary"
      :toggle-section-publish="estado.alternarPublicacion"
      :open-new-topic-modal="openNewTopicModal"
      :open-edit-module-modal="openEditModuleModal"
      :confirm-archive-module="confirmArchiveModule"
      :confirmar-eliminar-modulo="confirmarEliminarModulo"
      :restaurar-modulo="m => estado.restaurar('modulo', m.id)"
      :open-new-unit-modal="openNewUnitModal"
      :open-edit-topic-modal="openEditTopicModal"
      :confirm-archive-topic="confirmArchiveTopic"
      :confirmar-eliminar-tema="confirmarEliminarTema"
      :restaurar-tema="t => estado.restaurar('tema', t.id)"
      :toggle-unit="toggleUnit"
      :open-edit-unit-modal="openEditUnitModal"
      :confirm-archive-unit="confirmArchiveUnit"
      :confirmar-eliminar-leccion="confirmarEliminarLeccion"
      :restaurar-leccion="u => estado.restaurar('leccion', u.id)"
      :open-lessons-modal="openLessonsModal"
      :set-exercise-count="setExerciseCount" />
    <!-- Una ventana a la vez; cada una es su propio componente con la base común (foco, Tab atrapado, Escape). -->
    <DocenteContenidosVentanaEditarModulo v-if="ventana?.tipo === 'modulo'" :modulo="ventana.modulo" @cerrar="ventana = null" />
    <DocenteContenidosVentanaEditarTema v-else-if="ventana?.tipo === 'tema'" :tema="ventana.tema" @cerrar="ventana = null" />
    <DocenteContenidosVentanaArchivar v-else-if="ventana?.tipo === 'archivar'" :nivel="ventana.nivel" :id="ventana.id" :titulo="ventana.titulo" :devolver-foco="ventana.devolverFoco" @archivado="loadSections" @cerrar="ventana = null" />
    <DocenteContenidosVentanaArchivarTema v-else-if="ventana?.tipo === 'archivar-tema'" :tema="ventana.tema" @cerrar="ventana = null" />
    <DocenteContenidosVentanaEditarLeccion v-else-if="ventana?.tipo === 'leccion'" :leccion="ventana.leccion" @cerrar="ventana = null" />
    <DocenteContenidosVentanaImportar v-else-if="ventana?.tipo === 'importar'" @cerrar="ventana = null" />
    <DocenteContenidosVentanaCrear v-else-if="ventana?.tipo === 'crear'" :nivel="ventana.nivel" :padre-id="ventana.padreId" :orden="ventana.orden" @creado="onCreado" @cerrar="ventana = null" />

    <!-- Ventana única de eliminación para módulo / tema / lección (B3) -->
    <DocenteContenidosVentanaEliminar
      v-if="confirmacion"
      :nivel="confirmacion.tipo"
      :id="confirmacion.id"
      :titulo="confirmacion.titulo"
      :eliminando="eliminando"
      @cerrar="confirmacion = null"
      @confirmar="ejecutarEliminar"
      @archivar="onArchivar" />

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
import { Archive, BookOpen, Check, ChevronRight, CopyPlus, EyeOff, FileText, Folder, Loader2, Pencil, Plus, Trash2, TriangleAlert } from 'lucide-vue-next'
import UnitLessonsModal from '~/components/docente/UnitLessonsModal.vue'
import { CLAVE_CONTENIDOS, useContenidosCurso } from '~/composables/useContenidosCurso'
import { useContenidosAcciones } from '~/composables/useContenidosAcciones'
import { useAvisos } from '~/composables/useAvisos'
const { messageOf } = useApiErrorMessage()
import { mayorOrden, resumenDeLeccion, type LeccionDelArbol, type ModuloDelArbol, type TemaDelArbol } from '~/utils/contenidosCurso'

definePageMeta({ layout: 'teacher' })

const estado = useContenidosCurso()
const acciones = useContenidosAcciones()
const { avisar } = useAvisos()
provide(CLAVE_CONTENIDOS, estado)
// Los nombres de la plantilla se conservan: así el árbol no cambió y el cambio queda en la lógica.
const {
  clases: teacherClasses, claseId: selectedClassId, clase: selectedClass, otrasClases: otherClasses, modulos: sections,
  cargando: isLoading, error: errorMessage, plantillas,
  cargarModulos: loadSections, alternarPublicacion: toggleSectionPublish,
  explicaciones: lessonsByUnit, ejercicios: exerciseCountByUnit, cargarExplicaciones: loadLessons,
} = estado

type Ventana =
  | { tipo: 'modulo'; modulo: ModuloDelArbol }
  | { tipo: 'tema'; tema: TemaDelArbol }
  | { tipo: 'archivar'; nivel: 'modulo' | 'tema' | 'leccion'; id: number; titulo: string; devolverFoco?: string }
  | { tipo: 'archivar-tema'; tema: TemaDelArbol }
  | { tipo: 'leccion'; leccion: LeccionDelArbol }
  | { tipo: 'importar' }
  | { tipo: 'crear'; nivel: 'modulo' | 'tema' | 'leccion'; padreId: number; orden: number; sectionId?: number; topicId?: number }
const ventana = ref<Ventana | null>(null)
const openEditModuleModal = (modulo: ModuloDelArbol) => { ventana.value = { tipo: 'modulo', modulo } }
const confirmArchiveModule = (modulo: ModuloDelArbol) => {
  ventana.value = { tipo: 'archivar', nivel: 'modulo', id: modulo.id, titulo: modulo.title, devolverFoco: `mas-seccion-${modulo.id}` }
}
const openEditTopicModal = (tema: TemaDelArbol) => { ventana.value = { tipo: 'tema', tema } }
const confirmArchiveTopic = (tema: TemaDelArbol) => {
  ventana.value = { tipo: 'archivar', nivel: 'tema', id: tema.id, titulo: tema.title, devolverFoco: `mas-tema-${tema.id}` }
}
const openEditUnitModal = (leccion: LeccionDelArbol) => { ventana.value = { tipo: 'leccion', leccion } }
const confirmArchiveUnit = (leccion: LeccionDelArbol) => {
  ventana.value = { tipo: 'archivar', nivel: 'leccion', id: leccion.id, titulo: leccion.title, devolverFoco: `mas-leccion-${leccion.id}` }
}
const openImportModal = () => { ventana.value = { tipo: 'importar' } }

// ─── Eliminar módulo / tema / lección ───
type Confirmacion =
  | { tipo: 'modulo'; id: number; titulo: string }
  | { tipo: 'tema'; id: number; titulo: string; sectionId: number; cantidadLecciones: number }
  | { tipo: 'leccion'; id: number; titulo: string; sectionId: number; topicId: number }
const confirmacion = ref<Confirmacion | null>(null)
const eliminando = ref(false)

function confirmarEliminarModulo(sec: ModuloDelArbol) {
  confirmacion.value = { tipo: 'modulo', id: sec.id, titulo: sec.title }
}
function confirmarEliminarTema(sec: ModuloDelArbol, topic: TemaDelArbol) {
  confirmacion.value = {
    tipo: 'tema',
    id: topic.id,
    titulo: topic.title,
    sectionId: sec.id,
    cantidadLecciones: topic.learningUnits?.length ?? 0
  }
}
function confirmarEliminarLeccion(unit: LeccionDelArbol) {
  // Buscamos sectionId y topicId para poder quitar la lección del árbol local
  let sectionId = 0, topicId = 0
  for (const m of sections.value) {
    for (const t of m.topics ?? []) {
      if (t.learningUnits?.some(u => u.id === unit.id)) { sectionId = m.id; topicId = t.id }
    }
  }
  confirmacion.value = { tipo: 'leccion', id: unit.id, titulo: unit.title, sectionId, topicId }
}

/** Ejecutor único — el componente VentanaEliminar delega aquí. */
async function ejecutarEliminar() {
  const conf = confirmacion.value
  if (!conf) return
  eliminando.value = true
  try {
    if (conf.tipo === 'modulo') {
      await acciones.eliminar('modulo', conf.id)
      sections.value = sections.value.filter(s => s.id !== conf.id)
    } else if (conf.tipo === 'tema') {
      await acciones.eliminar('tema', conf.id)
      const sec = sections.value.find(s => s.id === conf.sectionId)
      if (sec) sec.topics = (sec.topics ?? []).filter(t => t.id !== conf.id)
    } else {
      await acciones.eliminar('leccion', conf.id)
      const modulo = sections.value.find(s => s.id === conf.sectionId)
      const tema = modulo?.topics?.find(t => t.id === conf.topicId)
      if (tema) tema.learningUnits = (tema.learningUnits ?? []).filter(u => u.id !== conf.id)
      if (expandedUnitId.value === conf.id) expandedUnitId.value = null
    }
    const textos: Record<string, string> = { modulo: 'Módulo «%s» eliminado', tema: 'Tema «%s» eliminado', leccion: 'Lección «%s» eliminada' }
    avisar({ tipo: 'exito', texto: `${textos[conf.tipo].replace('%s', conf.titulo)}.` })
    confirmacion.value = null
  } catch (err: unknown) {
    avisar({ tipo: 'error', texto: messageOf(err, 'No se pudo eliminar.') })
  } finally {
    eliminando.value = false
  }
}

/**
 * Cuando VentanaEliminar archivó el ítem en lugar de eliminarlo: se recarga el árbol para que aparezca en su bloque
 * «Archivados (N)» con «Restaurar» (antes se quitaba del árbol local y parecía eliminado).
 */
function onArchivar() {
  confirmacion.value = null
  void loadSections()
}

// Crear módulos, temas y lecciones, y escribir las explicaciones: sus ventanas ya eran componentes aparte.
const lessonsModalRef = ref<InstanceType<typeof UnitLessonsModal> | null>(null)
const selectedUnitForLessons = ref<{ id: number; title: string } | null>(null)

// Crear módulo, tema o lección: una sola ventana (VentanaCrear) sobre la base común.
function openNewModuleModal() {
  if (selectedClassId.value) ventana.value = { tipo: 'crear', nivel: 'modulo', padreId: selectedClassId.value, orden: mayorOrden(sections.value) + 1 }
}
function openNewTopicModal(sec: ModuloDelArbol) {
  ventana.value = { tipo: 'crear', nivel: 'tema', padreId: sec.id, orden: mayorOrden(sec.topics) + 1, sectionId: sec.id }
}
function openNewUnitModal(sec: ModuloDelArbol, topic: TemaDelArbol) {
  ventana.value = { tipo: 'crear', nivel: 'leccion', padreId: topic.id, orden: mayorOrden(topic.learningUnits) + 1, sectionId: sec.id, topicId: topic.id }
}
function openLessonsModal(unit: LeccionDelArbol, opts: { create?: boolean; editId?: number } = {}) {
  selectedUnitForLessons.value = { id: unit.id, title: unit.title }
  nextTick(() => lessonsModalRef.value?.openModal(opts))
}
function onLessonsModalClosed() {
  if (selectedUnitForLessons.value) void loadLessons(selectedUnitForLessons.value.id)
}
/** Lo recién creado se agrega al árbol en su lugar, sin recargar. */
function onCreado(creado: ModuloDelArbol | TemaDelArbol | LeccionDelArbol) {
  const v = ventana.value
  if (v?.tipo !== 'crear') return
  if (v.nivel === 'modulo') {
    const m = creado as ModuloDelArbol
    sections.value.push({ ...m, isPublished: m.isPublished ?? false, topics: [] })
  } else if (v.nivel === 'tema') {
    const m = sections.value.find((s) => s.id === v.sectionId)
    if (m) (m.topics ??= []).push({ ...(creado as TemaDelArbol), learningUnits: [] })
  } else {
    const t = sections.value.find((s) => s.id === v.sectionId)?.topics?.find((x) => x.id === v.topicId)
    if (t) (t.learningUnits ??= []).push(creado as LeccionDelArbol)
  }
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
