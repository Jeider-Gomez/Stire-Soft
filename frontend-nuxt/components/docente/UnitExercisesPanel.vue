<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h4 class="text-[11px] font-bold uppercase tracking-wider text-base-texto-secundario">
        Ejercicios <span v-if="!loading">({{ activities.length }})</span>
      </h4>
      <div class="flex items-center gap-1.5">
        <!-- Botón Mi banco (T4) -->
        <button
          type="button"
          @click="openBankModal"
          class="px-2.5 py-1 rounded-md text-[11px] font-semibold borde-afordancia bg-base-blanco text-base-texto-primario hover:bg-base-bg-secundario transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
          aria-label="Agregar desde mi banco">
          <Library :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" />
          <span>Mi banco</span>
        </button>
        <NuxtLink
          :to="`/docente/ejercicios/crear?classId=${classId}&unitId=${unitId}`"
          class="px-2.5 py-1 rounded-md text-[11px] font-bold bg-acento-ambar-fuerte text-base-blanco hover:bg-acento-ambar transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
          <Plus :size="14" aria-hidden="true" /> Ejercicio
        </NuxtLink>
      </div>
    </div>

    <!-- Texto de ayuda variantes (T5) -->
    <p class="text-[11px] text-base-texto-secundario">
      Las variantes son otro ejercicio del mismo tipo y nivel. STIRE las usa para reintentos y repasos, para que el estudiante no repita la misma respuesta.
    </p>

    <!-- Avisos de casillas con 1 solo ejercicio (T6) -->
    <div v-if="singleExerciseSlots.length > 0" class="space-y-1.5 pt-1">
      <div
        v-for="slot in singleExerciseSlots"
        :key="slot.activityId"
        class="p-2.5 rounded-md bg-acento-ambar/10 border border-acento-ambar/30 text-[11px] flex items-center justify-between gap-3 text-base-texto-primario">
        <span>El nivel {{ slot.level }} de {{ slot.typeName }} tiene 1 ejercicio; una variante ayuda en los repasos.</span>
        <button
          type="button"
          @click="duplicateVariant(slot.activityId, slot.title)"
          :disabled="isDuplicating"
          class="shrink-0 font-bold text-acento-ambar-fuerte hover:underline flex items-center gap-1 disabled:opacity-50">
          <Copy :size="12" aria-hidden="true" />
          <span>Crear variante</span>
        </button>
      </div>
    </div>

    <p v-if="loading" class="text-[11px] text-base-texto-secundario animate-pulse">Cargando ejercicios…</p>
    <p v-else-if="loadError" role="alert" class="text-[11px] text-semantico-falla">{{ loadError }}</p>
    <p v-else-if="activities.length === 0" class="text-[11px] text-base-texto-secundario italic">
      Todavía no hay ejercicios. Empieza por uno sencillo: una pregunta de opción múltiple sobre la explicación.
    </p>

    <ul v-else class="divide-y divide-base-borde-sutil rounded-lg border border-base-borde-sutil bg-base-blanco">
      <li v-for="act in visibleActivities" :key="act.id" class="flex items-center justify-between gap-3 px-3 py-2 text-xs">
        <div class="min-w-0">
          <p class="font-semibold text-base-texto-primario truncate">{{ act.title }}</p>
          <p class="text-[10px] text-base-texto-secundario">
            {{ act.activityType?.name || 'Práctica' }} · {{ difficultyLabel(act.difficulty) }} · {{ act.totalPoints }} pts
          </p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold"
            :class="act.status === 'published' ? 'bg-semantico-pasa/15 text-semantico-pasa' : 'bg-acento-ambar/15 text-acento-ambar-fuerte'">
            {{ act.status === 'published' ? 'Visible' : 'Borrador' }}
          </span>
          <button
            v-if="act.status === 'draft'"
            @click="publish(act)"
            class="px-2 py-0.5 rounded text-[11px] font-semibold border border-semantico-pasa/40 text-semantico-pasa hover:bg-semantico-pasa/10 focus:outline-none focus:ring-2 focus:ring-semantico-pasa"
            :aria-label="`Publicar ${act.title}`">
            Publicar
          </button>
          <button
            @click="openEdit(act)"
            class="p-1 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
            :data-editar-id="act.id"
            :aria-label="`Editar ${act.title}`" title="Editar">
            <Pencil :size="14" aria-hidden="true" />
          </button>
          <!-- Duplicar como variante (T5) -->
          <button
            @click="duplicateVariant(act.id, act.title)"
            :disabled="isDuplicating"
            class="p-1 rounded text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte disabled:opacity-50"
            :aria-label="`Duplicar como variante ${act.title}`"
            title="Duplicar como variante">
            <Copy :size="14" aria-hidden="true" />
          </button>
          <button
            @click="askArchive(act)"
            class="p-1 rounded text-base-texto-secundario hover:text-semantico-falla hover:bg-semantico-falla/10 focus:outline-none focus:ring-2 focus:ring-semantico-falla"
            :aria-label="`Archivar ${act.title}`" title="Archivar">
            <Archive :size="14" aria-hidden="true" />
          </button>
        </div>
      </li>
    </ul>
    <p v-if="feedback" role="status" class="text-[11px] text-semantico-pasa">{{ feedback }}</p>
    <p v-if="feedbackAviso" role="status" class="text-[11px] text-acento-ambar-fuerte font-semibold">{{ feedbackAviso }}</p>

    <!-- Editar datos del ejercicio -->
    <Teleport to="body">
      <div
        v-if="edit.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true" aria-labelledby="edit-exercise-title"
        @click.self="edit.open = false">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <form @submit.prevent="saveEdit" class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
          <h2 id="edit-exercise-title" class="text-sm font-bold text-base-texto-primario">Editar ejercicio</h2>
          <div>
            <label for="edit-ex-title" class="block font-semibold text-base-texto-primario mb-1">Título</label>
            <input id="edit-ex-title" ref="editTitleRef" v-model="edit.form.title" type="text" required
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="edit-ex-statement" class="font-semibold text-base-texto-primario">Enunciado</label>
              <button type="button" @click="edit.preview = !edit.preview" :aria-pressed="edit.preview"
                class="text-[11px] font-semibold text-acento-ambar-fuerte hover:underline">
                {{ edit.preview ? 'Editar texto' : 'Vista previa del enunciado' }}
              </button>
            </div>
            <textarea v-if="!edit.preview" id="edit-ex-statement" v-model="edit.form.description" rows="8"
              class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte font-codigo text-[11px] leading-relaxed focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30"></textarea>
            <div v-else class="rounded-md border border-base-borde-sutil bg-base-bg-secundario/40 p-3 text-xs leading-relaxed text-base-texto-primario"
              v-html="formatMarkdown(edit.form.description, { escapeHtml: true })"></div>
            <p class="text-[10px] text-base-texto-secundario mt-1">
              Admite **negrita**, `código`, bloques de código entre ```, listas y tablas. Los estudiantes ven el cambio al abrir el ejercicio.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="edit-ex-difficulty" class="block font-semibold text-base-texto-primario mb-1">Dificultad</label>
              <select id="edit-ex-difficulty" v-model="edit.form.difficulty" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte">
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <label for="edit-ex-points" class="block font-semibold text-base-texto-primario mb-1">Puntos</label>
              <input id="edit-ex-points" v-model.number="edit.form.totalPoints" type="number" min="5" max="100" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte" />
            </div>
          </div>
          <div>
            <label for="edit-ex-type" class="block font-semibold text-base-texto-primario mb-1">Tipo de actividad</label>
            <select id="edit-ex-type" v-model="edit.form.activityTypeId" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte">
              <option v-for="t in activityTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <p class="text-[10px] text-base-texto-secundario mt-1">Un taller o un parcial cuentan más en el dominio del estudiante que una práctica.</p>
          </div>
          <!-- Respuestas del ejercicio (Fase 28): el editor de su tipo, ya cargado -->
          <section
            ref="respuestasRef" tabindex="-1" aria-labelledby="edit-ex-answers-title"
            class="border-t border-base-borde-sutil pt-3 space-y-3 focus:outline-none">
            <div class="flex items-center justify-between gap-2">
              <h3 id="edit-ex-answers-title" class="font-semibold text-base-texto-primario">Respuestas del ejercicio</h3>
              <button
                v-if="respuestas.estado === 'editable'"
                type="button" @click="alternarVistaPrevia" :aria-pressed="respuestas.vistaPrevia"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-acento-ambar-fuerte hover:underline">
                <Eye :size="12" aria-hidden="true" />
                {{ respuestas.vistaPrevia ? 'Volver al editor' : 'Ver como el estudiante' }}
              </button>
            </div>

            <p v-if="edit.esVariante && respuestas.estado === 'editable'" role="note"
              class="rounded-md bg-acento-ambar/10 border border-acento-ambar/30 p-2 text-[11px] text-base-texto-primario">
              Esta es una copia. Cambia los datos (números, opciones, casos) para que sea un ejercicio distinto del original.
            </p>

            <p v-if="respuestas.estado === 'cargando'" role="status" class="flex items-center gap-2 text-base-texto-secundario">
              <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando respuestas…
            </p>
            <p v-else-if="respuestas.estado === 'error'" role="alert" class="text-semantico-falla text-[11px]">{{ respuestas.error }}</p>
            <p v-else-if="respuestas.estado === 'sin-editor'" class="text-base-texto-secundario text-[11px]">
              Las respuestas de este tipo de ejercicio no se editan desde aquí.
            </p>
            <div v-else-if="respuestas.estado === 'bloqueado'"
              class="rounded-md border border-base-borde-fuerte bg-base-bg-secundario/40 p-3 space-y-2">
              <p class="text-[11px] text-base-texto-primario">
                Este ejercicio ya tiene {{ plural(respuestas.submissions, 'entrega', 'entregas') }}: sus respuestas no se pueden cambiar sin alterar notas ya puestas.
              </p>
              <button type="button" @click="edit.id && duplicateVariant(edit.id)" :disabled="isDuplicating"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-acento-ambar-fuerte text-acento-ambar-fuerte font-semibold hover:bg-acento-ambar/10 disabled:opacity-50">
                <Copy :size="13" aria-hidden="true" /> Duplicar como variante
              </button>
            </div>

            <!-- Solo se monta el editor del tipo de este ejercicio: los demás, ocultos, tendrían campos `required` vacíos
                 que el navegador no puede enfocar y bloquearían el envío del formulario. -->
            <div v-if="respuestas.estado === 'editable'" v-show="!respuestas.vistaPrevia">
              <CodingExerciseBuilder v-if="respuestas.tipo === 'coding'" ref="codingBuilderRef" />
              <McqExerciseBuilder v-else-if="respuestas.tipo === 'mcq'" ref="mcqBuilderRef" />
              <FillCodeExerciseBuilder v-else-if="respuestas.tipo === 'fill_code'" ref="fillCodeBuilderRef" />
              <DragDropExerciseBuilder v-else-if="respuestas.tipo === 'drag_drop'" ref="dragDropBuilderRef" />
              <MatchingExerciseBuilder v-else-if="respuestas.tipo === 'matching'" ref="matchingBuilderRef" />
              <OrderingExerciseBuilder v-else-if="respuestas.tipo === 'ordering'" ref="orderingBuilderRef" />
              <HtmlCssExerciseBuilder v-else-if="respuestas.tipo === 'html_css'" ref="htmlCssBuilderRef" />
            </div>
            <DocenteExercisePreview
              v-if="respuestas.vistaPrevia && respuestas.vistaConfig && respuestas.tipo"
              :type="respuestas.tipo" :title="edit.form.title" :statement="edit.form.description" :config="respuestas.vistaConfig" />
            <p v-if="respuestas.errorEditor" role="alert" class="text-semantico-falla text-[11px]">{{ respuestas.errorEditor }}</p>
          </section>
          <details class="border-t border-base-borde-sutil pt-3">
            <summary class="text-[11px] font-semibold text-base-texto-secundario cursor-pointer select-none">Tutor IA en este ejercicio</summary>
            <div class="mt-3"><DocenteTutorSettingsPanel scope-type="activity" :scope-id="edit.id!" /></div>
          </details>
          <p v-if="edit.error" role="alert" class="text-semantico-falla text-[11px]">{{ edit.error }}</p>
          <div class="flex justify-end gap-2">
            <button type="button" @click="edit.open = false" class="px-4 py-2 rounded-md borde-afordancia font-semibold">Cancelar</button>
            <button type="submit" :disabled="edit.saving" class="px-5 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold disabled:opacity-50">
              {{ edit.saving ? 'Guardando…' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>

    <!-- Confirmar archivo -->
    <Teleport to="body">
      <div
        v-if="archive.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true" aria-labelledby="archive-exercise-title"
        @click.self="archive.open = false">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-sm p-6 space-y-4 text-xs">
          <h2 id="archive-exercise-title" class="text-sm font-bold text-base-texto-primario">¿Archivar «{{ archive.activity?.title }}»?</h2>
          <p class="text-base-texto-secundario">Los estudiantes dejarán de verlo. Sus entregas anteriores se conservan.</p>
          <p v-if="archive.error" role="alert" class="text-semantico-falla text-[11px]">{{ archive.error }}</p>
          <div class="flex justify-end gap-2">
            <button @click="archive.open = false" class="px-4 py-2 rounded-md borde-afordancia font-semibold">Cancelar</button>
            <button @click="confirmArchive" :disabled="archive.saving" class="px-5 py-2 rounded-md bg-semantico-falla text-base-blanco font-bold disabled:opacity-50">
              {{ archive.saving ? 'Archivando…' : 'Archivar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Mi banco (T4) -->
    <Teleport to="body">
      <div
        v-if="bankModal.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog" aria-modal="true" aria-labelledby="bank-dialog-title"
        @click.self="closeBankModal">
        <div class="absolute inset-0 bg-base-texto-primario/40 backdrop-blur-sm" aria-hidden="true"></div>
        <div class="relative bg-base-blanco rounded-2xl border border-base-borde-fuerte shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col p-6 space-y-4 text-xs">
          <!-- Encabezado del diálogo -->
          <div class="flex items-center justify-between border-b border-base-borde-sutil pb-3">
            <div class="flex items-center gap-2">
              <Library :size="18" class="text-acento-ambar-fuerte" aria-hidden="true" />
              <h2 id="bank-dialog-title" class="text-sm font-bold text-base-texto-primario">
                Mi banco de ejercicios
              </h2>
            </div>
            <button
              type="button"
              @click="closeBankModal"
              class="text-base-texto-secundario hover:text-base-texto-primario p-1"
              aria-label="Cerrar modal">
              ✕
            </button>
          </div>

          <!-- Filtros -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label for="bank-filter-type" class="block font-semibold text-base-texto-primario text-[11px] mb-1">
                Tipo
              </label>
              <select
                id="bank-filter-type"
                v-model="bankQuery.type"
                class="w-full px-2.5 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco text-xs outline-none focus:border-acento-ambar-fuerte">
                <option value="">Todos los tipos</option>
                <option v-for="t in EXERCISE_TYPES" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
            </div>

            <div>
              <label for="bank-filter-difficulty" class="block font-semibold text-base-texto-primario text-[11px] mb-1">
                Nivel
              </label>
              <select
                id="bank-filter-difficulty"
                v-model="bankQuery.difficulty"
                class="w-full px-2.5 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco text-xs outline-none focus:border-acento-ambar-fuerte">
                <option value="">Todos los niveles</option>
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div>
              <label for="bank-filter-q" class="block font-semibold text-base-texto-primario text-[11px] mb-1">
                Buscar
              </label>
              <div class="relative">
                <input
                  id="bank-filter-q"
                  ref="bankSearchRef"
                  v-model="bankQuery.q"
                  type="text"
                  placeholder="Título o lección…"
                  class="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco text-xs outline-none focus:border-acento-ambar-fuerte" />
                <Search :size="13" aria-hidden="true" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-base-texto-secundario" />
              </div>
            </div>
          </div>

          <!-- Error si ocurre -->
          <p v-if="bankModal.error" role="alert" class="text-semantico-falla text-[11px]">
            {{ bankModal.error }}
          </p>

          <!-- Lista de ejercicios -->
          <div class="flex-1 overflow-y-auto border border-base-borde-sutil rounded-lg divide-y divide-base-borde-sutil min-h-[220px] max-h-[380px]">
            <div v-if="bankModal.loading" class="p-8 text-center text-xs text-base-texto-secundario">
              <Loader2 :size="14" class="inline-block animate-spin mr-2 align-middle" aria-hidden="true" /> Buscando en el banco…
            </div>

            <div v-else-if="bankModal.items.length === 0" class="p-8 text-center text-xs text-base-texto-secundario italic">
              {{ (!bankQuery.type && !bankQuery.difficulty && !bankQuery.q.trim())
                ? 'Todavía no tienes ejercicios en otras lecciones'
                : 'Ningún ejercicio coincide con los filtros' }}
            </div>

            <div
              v-else
              v-for="item in bankModal.items"
              :key="item.activityId"
              class="p-3 hover:bg-base-bg-secundario/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
              <div class="min-w-0 space-y-1 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-base-texto-primario text-xs">
                    {{ item.title }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-base-bg-secundario border border-base-borde-sutil text-base-texto-secundario">
                    {{ questionTypeName(item.questionType) }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-base-bg-secundario border border-base-borde-sutil text-base-texto-secundario">
                    {{ difficultyLabel(item.difficulty) }}
                  </span>
                </div>
                <p class="text-[11px] text-acento-ambar-fuerte font-medium">
                  {{ item.className }} · {{ item.learningUnitTitle }}
                </p>
                <p v-if="item.questionPreview" class="text-[11px] text-base-texto-secundario truncate max-w-xl">
                  {{ item.questionPreview }}
                </p>
              </div>

              <button
                type="button"
                @click="copyFromBank(item)"
                :disabled="bankModal.copyingId === item.activityId"
                class="px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors disabled:opacity-50 shrink-0 self-end sm:self-auto flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte">
                <Loader2 v-if="bankModal.copyingId === item.activityId" :size="12" class="animate-spin" aria-hidden="true" />
                <span>{{ bankModal.copyingId === item.activityId ? 'Agregando…' : 'Agregar a esta lección' }}</span>
              </button>
            </div>
          </div>

          <!-- Pie del modal -->
          <div class="flex items-center justify-between pt-2 border-t border-base-borde-sutil">
            <span class="text-[11px] text-base-texto-secundario">
              {{ bankModal.items.length }} ejercicio{{ bankModal.items.length !== 1 ? 's' : '' }} encontrado{{ bankModal.items.length !== 1 ? 's' : '' }}
            </span>
            <button
              type="button"
              @click="closeBankModal"
              class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold text-base-texto-primario hover:bg-base-bg-secundario">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Plus, Pencil, Archive, Copy, Library, Search, Loader2, Eye } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { formatMarkdown } from '~/utils/formatMarkdown'
import { EXERCISE_TYPES, exerciseTypeInfo, type ExerciseTypeId } from '~/utils/exerciseTypes'
import { stableJson } from '~/utils/exerciseConfig'
import CodingExerciseBuilder from '~/components/docente/exercise-builders/CodingExerciseBuilder.vue'
import McqExerciseBuilder from '~/components/docente/exercise-builders/McqExerciseBuilder.vue'
import FillCodeExerciseBuilder from '~/components/docente/exercise-builders/FillCodeExerciseBuilder.vue'
import DragDropExerciseBuilder from '~/components/docente/exercise-builders/DragDropExerciseBuilder.vue'
import MatchingExerciseBuilder from '~/components/docente/exercise-builders/MatchingExerciseBuilder.vue'
import OrderingExerciseBuilder from '~/components/docente/exercise-builders/OrderingExerciseBuilder.vue'
import HtmlCssExerciseBuilder from '~/components/docente/exercise-builders/HtmlCssExerciseBuilder.vue'

const props = defineProps<{ unitId: number; classId: number }>()
const emit = defineEmits<{ (e: 'count', n: number): void }>()

interface ActivityTypeOption { id: number; name: string; baseWeight: number }
interface ActivityItem {
  id: number
  title: string
  difficulty: string
  totalPoints: number
  description?: string | null
  status: 'draft' | 'published' | 'archived'
  activityTypeId?: number
  activityType?: { id: number; name: string; baseWeight: number }
}

const api = useApi()
const { messageOf } = useApiErrorMessage()

const activities = ref<ActivityItem[]>([])
const activityTypes = ref<ActivityTypeOption[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)
const feedback = ref<string | null>(null)
const feedbackAviso = ref<string | null>(null)

const visibleActivities = computed(() => activities.value.filter((a) => a.status !== 'archived'))

function difficultyLabel(d: string) {
  return d === 'intermedio' ? 'Intermedio' : d === 'avanzado' ? 'Avanzado' : 'Básico'
}

interface EjercicioDelBanco {
  activityId: number
  title: string
  difficulty: string
  questionType: string | null
  status: string
  questionPreview: string
  learningUnitId: number
  learningUnitTitle: string
  classId: number
  className: string
}

function questionTypeName(type: string | null | undefined): string {
  if (!type) return 'Práctica'
  const info = exerciseTypeInfo(type as ExerciseTypeId)
  return info?.name || type
}

async function load() {
  loading.value = true
  loadError.value = null
  try {
    const [res, types] = await Promise.all([
      api.get<{ data?: ActivityItem[] } | ActivityItem[]>(`/activities?learningUnitId=${props.unitId}&limit=50`),
      activityTypes.value.length ? Promise.resolve(activityTypes.value) : api.get<ActivityTypeOption[] | { data?: ActivityTypeOption[] }>('/activity-types'),
      checkSingleExerciseSlots()
    ])
    activities.value = Array.isArray(res) ? res : (res?.data ?? [])
    activityTypes.value = Array.isArray(types) ? types : (types?.data ?? [])
    emit('count', visibleActivities.value.length)
  } catch (err) {
    loadError.value = messageOf(err, 'No se pudieron cargar los ejercicios.')
  } finally {
    loading.value = false
  }
}

async function publish(act: ActivityItem) {
  try {
    await api.patch(`/activities/${act.id}/publish`)
    act.status = 'published'
    feedback.value = `«${act.title}» ya es visible para los estudiantes.`
  } catch (err) {
    loadError.value = messageOf(err, 'No se pudo publicar el ejercicio.')
  }
}

// ─── Editar ───────────────────────────────────────────────────────────────────
const editTitleRef = ref<HTMLInputElement | null>(null)
const edit = reactive({
  open: false,
  id: null as number | null,
  form: { title: '', description: '', difficulty: 'basico', totalPoints: 20, activityTypeId: null as number | null },
  preview: false,
  saving: false,
  error: null as string | null,
  /** Viene de «Duplicar como variante»: el diálogo invita a cambiar las respuestas. */
  esVariante: false
})

// Las respuestas del ejercicio (Fase 28): el editor de su tipo, cargado con el config guardado.
type BuilderResult = { valid: boolean; error?: string; config?: unknown }
interface BuilderHandle { validateAndGetConfig: (puntos: number) => BuilderResult; load: (config: unknown) => void }
interface PreguntaDelDocente { id: number; type: string; config: unknown }

const respuestasRef = ref<HTMLElement | null>(null)
const codingBuilderRef = ref<InstanceType<typeof CodingExerciseBuilder> | null>(null)
const mcqBuilderRef = ref<InstanceType<typeof McqExerciseBuilder> | null>(null)
const fillCodeBuilderRef = ref<InstanceType<typeof FillCodeExerciseBuilder> | null>(null)
const dragDropBuilderRef = ref<InstanceType<typeof DragDropExerciseBuilder> | null>(null)
const matchingBuilderRef = ref<InstanceType<typeof MatchingExerciseBuilder> | null>(null)
const orderingBuilderRef = ref<InstanceType<typeof OrderingExerciseBuilder> | null>(null)
const htmlCssBuilderRef = ref<InstanceType<typeof HtmlCssExerciseBuilder> | null>(null)

const respuestas = reactive({
  estado: 'cargando' as 'cargando' | 'editable' | 'bloqueado' | 'sin-editor' | 'error',
  questionId: null as number | null,
  tipo: null as ExerciseTypeId | null,
  submissions: 0,
  error: null as string | null,
  errorEditor: null as string | null,
  /** El config tal como lo dejó el editor al cargar: sirve para saber si una variante quedó igual al original. */
  base: '',
  vistaPrevia: false,
  vistaConfig: null as Record<string, unknown> | null
})

function constructorActivo(): BuilderHandle | null {
  switch (respuestas.tipo) {
    case 'coding': return codingBuilderRef.value
    case 'mcq': return mcqBuilderRef.value
    case 'fill_code': return fillCodeBuilderRef.value
    case 'drag_drop': return dragDropBuilderRef.value
    case 'matching': return matchingBuilderRef.value
    case 'ordering': return orderingBuilderRef.value
    case 'html_css': return htmlCssBuilderRef.value
    default: return null
  }
}

function esTipoEditable(tipo: string): tipo is ExerciseTypeId {
  return EXERCISE_TYPES.some((t) => t.id === tipo)
}

async function cargarRespuestas(activityId: number) {
  Object.assign(respuestas, {
    estado: 'cargando', questionId: null, tipo: null, submissions: 0, error: null, errorEditor: null,
    base: '', vistaPrevia: false, vistaConfig: null
  })
  try {
    const [preguntas, editable] = await Promise.all([
      api.get<PreguntaDelDocente[]>(`/activity-questions/activity/${activityId}`),
      api.get<{ editable: boolean; submissions: number }>(`/activity-questions/activity/${activityId}/editable`)
    ])
    if (!edit.open || edit.id !== activityId) return // el docente cerró el diálogo o abrió otro ejercicio
    const pregunta = preguntas[0]
    if (!pregunta || !esTipoEditable(pregunta.type)) { respuestas.estado = 'sin-editor'; return }
    respuestas.questionId = pregunta.id
    respuestas.tipo = pregunta.type
    respuestas.submissions = editable.submissions
    if (!editable.editable) { respuestas.estado = 'bloqueado'; return }
    respuestas.estado = 'editable'
    await nextTick()
    const editor = constructorActivo()
    if (!editor) { respuestas.estado = 'sin-editor'; return }
    editor.load(pregunta.config)
    const inicial = editor.validateAndGetConfig(edit.form.totalPoints)
    respuestas.base = inicial.valid ? stableJson(inicial.config) : ''
    if (edit.esVariante) respuestasRef.value?.focus()
  } catch (err) {
    if (edit.id !== activityId) return
    respuestas.estado = 'error'
    respuestas.error = messageOf(err, 'No se pudieron cargar las respuestas del ejercicio.')
  }
}

function alternarVistaPrevia() {
  respuestas.errorEditor = null
  if (respuestas.vistaPrevia) { respuestas.vistaPrevia = false; return }
  const res = constructorActivo()?.validateAndGetConfig(edit.form.totalPoints)
  if (!res?.valid || typeof res.config !== 'object' || res.config === null) {
    respuestas.errorEditor = res?.error || 'Revisa las respuestas del ejercicio antes de verlo como el estudiante.'
    return
  }
  respuestas.vistaConfig = res.config as Record<string, unknown>
  respuestas.vistaPrevia = true
}

// El foco vuelve al botón que abrió el diálogo; si la lista se recargó y ese botón ya no existe (p. ej. tras
// «Duplicar como variante»), al botón «Editar» del ejercicio que se estaba editando.
let abiertoDesde: HTMLElement | null = null

watch(() => edit.open, (abierto) => {
  if (abierto) return
  const id = edit.id
  nextTick(() => {
    const destino = abiertoDesde?.isConnected ? abiertoDesde : document.querySelector<HTMLElement>(`[data-editar-id="${id}"]`)
    destino?.focus()
  })
})

function openEdit(act: ActivityItem, opciones: { variante?: boolean } = {}) {
  const activo = document.activeElement
  abiertoDesde = activo instanceof HTMLElement && activo !== document.body ? activo : null
  edit.esVariante = opciones.variante === true
  feedbackAviso.value = null
  edit.id = act.id
  edit.form = {
    title: act.title,
    description: act.description ?? '',
    difficulty: act.difficulty || 'basico',
    totalPoints: act.totalPoints,
    activityTypeId: act.activityTypeId ?? act.activityType?.id ?? activityTypes.value[0]?.id ?? null
  }
  edit.error = null
  edit.preview = false
  edit.open = true
  nextTick(() => { if (!edit.esVariante) editTitleRef.value?.focus() })
  cargarRespuestas(act.id)
}

async function saveEdit() {
  if (!edit.form.title.trim()) { edit.error = 'El título es obligatorio.'; return }
  if (!edit.form.description.trim()) { edit.error = 'El enunciado no puede quedar vacío.'; return }
  // Se valida el editor de respuestas ANTES de guardar nada: si no valida, no se toca el ejercicio.
  respuestas.errorEditor = null
  let configNueva: unknown
  if (respuestas.estado === 'editable') {
    const res = constructorActivo()?.validateAndGetConfig(edit.form.totalPoints)
    if (res && !res.valid) { respuestas.errorEditor = res.error || 'Revisa las respuestas del ejercicio.'; return }
    configNueva = res?.config
  }
  edit.saving = true
  edit.error = null
  try {
    await api.patch(`/activities/${edit.id}`, {
      title: edit.form.title.trim(),
      description: edit.form.description.trim(),
      difficulty: edit.form.difficulty,
      totalPoints: edit.form.totalPoints,
      activityTypeId: edit.form.activityTypeId
    })
    const act = activities.value.find((a) => a.id === edit.id)
    if (act) {
      act.title = edit.form.title.trim()
      act.description = edit.form.description.trim()
      act.difficulty = edit.form.difficulty
      act.totalPoints = edit.form.totalPoints
      const t = activityTypes.value.find((x) => x.id === edit.form.activityTypeId)
      if (t) { act.activityTypeId = t.id; act.activityType = t }
    }
    if (configNueva !== undefined && respuestas.questionId !== null) {
      // El enunciado y los puntos de la pregunta son los de la actividad (así los crea «Crear ejercicio»).
      await api.patch(`/activity-questions/${respuestas.questionId}`, {
        question: edit.form.description.trim(),
        points: edit.form.totalPoints,
        config: configNueva
      })
    }
    feedback.value = 'Cambios guardados.'
    feedbackAviso.value = edit.esVariante && configNueva !== undefined && stableJson(configNueva) === respuestas.base
      ? 'La variante quedó igual al original: en un reintento el estudiante verá las mismas respuestas.'
      : null
    edit.open = false
  } catch (err) {
    edit.error = messageOf(err, 'No se pudieron guardar los cambios.')
  } finally {
    edit.saving = false
  }
}

// ─── Archivar ─────────────────────────────────────────────────────────────────
const archive = reactive({ open: false, activity: null as ActivityItem | null, saving: false, error: null as string | null })

function askArchive(act: ActivityItem) {
  archive.activity = act
  archive.error = null
  archive.open = true
}

async function confirmArchive() {
  if (!archive.activity) return
  archive.saving = true
  try {
    await api.patch(`/activities/${archive.activity.id}/archive`)
    archive.activity.status = 'archived'
    feedback.value = `«${archive.activity.title}» archivado.`
    emit('count', visibleActivities.value.length)
    archive.open = false
  } catch (err) {
    archive.error = messageOf(err, 'No se pudo archivar el ejercicio.')
  } finally {
    archive.saving = false
  }
}

// ─── T5: Duplicar como variante ───────────────────────────────────────────
const isDuplicating = ref(false)

async function duplicateVariant(activityId: number, title?: string) {
  isDuplicating.value = true
  feedback.value = null
  try {
    const res = await api.post<{ id: number; title: string; status: string }>(`/reuse/activities/${activityId}/copy`, {
      learningUnitId: props.unitId,
      variant: true
    })
    feedback.value = 'Variante creada en borrador.'
    await load()
    const nueva = activities.value.find(a => a.id === res.id)
    if (nueva) {
      openEdit(nueva, { variante: true })
    }
  } catch (err) {
    loadError.value = messageOf(err, 'No se pudo duplicar el ejercicio como variante.')
  } finally {
    isDuplicating.value = false
  }
}

// ─── T6: Aviso de casillas con un solo ejercicio ───────────────────────────
const bankExercisesForUnit = ref<EjercicioDelBanco[]>([])

async function checkSingleExerciseSlots() {
  try {
    // Solo los de esta unidad (el banco ya excluye los archivados). Cuentan también los borradores: una variante recién
    // duplicada ya resuelve el aviso aunque el docente todavía no la publique.
    const res = await api.get<EjercicioDelBanco[]>(`/reuse/bank?learningUnitId=${props.unitId}`)
    bankExercisesForUnit.value = Array.isArray(res) ? res : []
  } catch {
    bankExercisesForUnit.value = []
  }
}

const singleExerciseSlots = computed(() => {
  const groups = new Map<string, EjercicioDelBanco[]>()
  for (const ej of bankExercisesForUnit.value) {
    const key = `${ej.questionType || 'unknown'}_${ej.difficulty || 'basico'}`
    const list = groups.get(key) || []
    list.push(ej)
    groups.set(key, list)
  }

  const result: Array<{
    level: string
    typeName: string
    activityId: number
    title: string
  }> = []

  for (const [, list] of groups) {
    if (list.length === 1) {
      const ej = list[0]
      result.push({
        level: difficultyLabel(ej.difficulty).toLowerCase(),
        typeName: questionTypeName(ej.questionType),
        activityId: ej.activityId,
        title: ej.title
      })
    }
  }
  return result
})

// ─── T4: Mi banco de ejercicios ────────────────────────────────────────────
const bankModal = reactive({
  open: false,
  loading: false,
  copyingId: null as number | null,
  error: null as string | null,
  items: [] as EjercicioDelBanco[]
})

const bankQuery = reactive({
  type: '' as string,
  difficulty: '' as string,
  q: ''
})

let debounceTimer: ReturnType<typeof setTimeout> | undefined

const bankSearchRef = ref<HTMLInputElement | null>(null)
let bankOpener: HTMLElement | null = null

function openBankModal() {
  bankOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  bankModal.open = true
  bankModal.error = null
  bankQuery.type = ''
  bankQuery.difficulty = ''
  bankQuery.q = ''
  nextTick(() => bankSearchRef.value?.focus())
  fetchBank()
}

function closeBankModal() {
  bankModal.open = false
  nextTick(() => bankOpener?.focus())
}

async function fetchBank() {
  bankModal.loading = true
  bankModal.error = null
  try {
    const params = new URLSearchParams()
    if (bankQuery.type) params.append('type', bankQuery.type)
    if (bankQuery.difficulty) params.append('difficulty', bankQuery.difficulty)
    if (bankQuery.q.trim()) params.append('q', bankQuery.q.trim())

    const queryStr = params.toString() ? `?${params.toString()}` : ''
    const res = await api.get<EjercicioDelBanco[]>(`/reuse/bank${queryStr}`)
    bankModal.items = Array.isArray(res) ? res : []
  } catch (err) {
    bankModal.error = messageOf(err, 'No se pudieron cargar los ejercicios del banco.')
    bankModal.items = []
  } finally {
    bankModal.loading = false
  }
}

watch(
  () => [bankQuery.type, bankQuery.difficulty, bankQuery.q],
  () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fetchBank()
    }, 300)
  }
)

async function copyFromBank(item: EjercicioDelBanco) {
  bankModal.copyingId = item.activityId
  bankModal.error = null
  try {
    await api.post(`/reuse/activities/${item.activityId}/copy`, {
      learningUnitId: props.unitId
    })
    feedback.value = 'Agregado como borrador. Revísalo y publícalo.'
    bankModal.open = false
    await load()
  } catch (err) {
    bankModal.error = messageOf(err, 'No se pudo agregar el ejercicio a esta lección.')
  } finally {
    bankModal.copyingId = null
  }
}

useEscapeToClose(() => edit.open, () => { edit.open = false })
useEscapeToClose(() => archive.open, () => { archive.open = false })
useEscapeToClose(() => bankModal.open, closeBankModal)

onMounted(load)
defineExpose({ reload: load })
</script>
