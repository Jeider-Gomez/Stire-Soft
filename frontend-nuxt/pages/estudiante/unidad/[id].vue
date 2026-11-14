<template>
  <div class="max-w-[1240px] mx-auto space-y-5">
    <!-- Dónde está: Inicio › Módulo › Tema (si agrupa varias lecciones) › Lección -->
    <nav aria-label="Ubicación" class="flex items-center gap-1.5 flex-wrap text-xs text-base-texto-secundario">
      <NuxtLink to="/estudiante" class="hover:underline inline-flex items-center min-h-[44px] -my-3">Inicio</NuxtLink>
      <ChevronRight :size="12" aria-hidden="true" />
      <template v-if="ubicacion.modulo">
        <span>{{ ubicacion.modulo }}</span>
        <ChevronRight :size="12" aria-hidden="true" />
      </template>
      <template v-if="ubicacion.tema">
        <span>{{ ubicacion.tema }}</span>
        <ChevronRight :size="12" aria-hidden="true" />
      </template>
      <span class="font-bold text-base-texto-primario" aria-current="page">{{ unitData?.title || 'Cargando…' }}</span>
    </nav>
    <!-- Computador: anterior · «Lección n de N» (abre Ctrl+K) · siguiente, fijo arriba (26/10) -->
    <EstudianteSaltosLeccion :unit-id="unitId" class="-mt-4" />

    <!-- Estado de carga -->
    <p v-if="isLoading" role="status" class="p-12 flex items-center justify-center gap-2 text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando la lección…
    </p>

    <!-- Módulo todavía cerrado (bloqueo suave, utils/bloqueoModulos.ts): se dice qué falta y a dónde ir -->
    <div v-else-if="bloqueo" role="status" class="p-8 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <Lock :size="28" class="mx-auto text-slate-500" aria-hidden="true" />
      <p class="text-sm font-bold text-base-texto-primario">Esta lección se abre cuando domines un poco más «{{ bloqueo.titulo.split(':')[0] }}»</p>
      <p class="text-slate-600 max-w-md mx-auto">
        Tu docente pidió {{ bloqueo.umbral }} % de <Termino palabra="Dominio">dominio</Termino> en ese módulo antes de seguir, para que avances con base. Vas en
        <strong class="text-base-texto-primario">{{ bloqueo.dominio }} %</strong>: te faltan {{ Math.max(0, bloqueo.umbral - bloqueo.dominio) }} puntos.
      </p>
      <div class="max-w-xs mx-auto h-2 bg-base-bg-secundario rounded-full overflow-hidden" role="progressbar" :aria-valuenow="bloqueo.dominio" aria-valuemin="0" :aria-valuemax="bloqueo.umbral" aria-label="Dominio del módulo anterior">
        <div class="h-full bg-acento-ambar-fuerte rounded-full" :style="{ width: `${Math.min(100, Math.round((bloqueo.dominio / bloqueo.umbral) * 100))}%` }" />
      </div>
      <NuxtLink to="/estudiante" class="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-white">
        Seguir con lo que me falta
      </NuxtLink>
    </div>

    <!-- Lección no encontrada / sin acceso -->
    <div v-else-if="loadError || !unitData" class="p-8 text-center bg-base-blanco rounded-xl border border-base-borde-fuerte text-xs space-y-3">
      <p class="font-bold text-base-texto-primario">No pudimos cargar esta lección.</p>
      <p class="text-base-texto-secundario">Puede que no exista o que no estés matriculado en la clase a la que pertenece.</p>
      <NuxtLink to="/estudiante" class="inline-flex items-center gap-1.5 borde-afordancia px-4 py-2 rounded-md text-xs font-semibold bg-base-blanco text-base-texto-primario">
        <ArrowLeft :size="14" aria-hidden="true" /> Volver al inicio
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Lección v3 (Fase D, paso 2; cuadro «E-Leccion»): la lección principal en una columna de lectura y, al lado, las
           otras formas de verla; debajo, «Practica esta lección». Con poco ancho, las otras formas van bajo el título. -->
      <div class="xl:flex gap-6 items-start">
        <div class="flex-1 min-w-0 space-y-5">
          <article class="tarjeta-leccion overflow-hidden" aria-labelledby="titulo-leccion">
            <header class="portada-leccion space-y-2">
              <p v-if="ubicacion.rotulo" class="m-0 text-[13px] font-bold uppercase opacity-80">{{ ubicacion.rotulo }}</p>
              <h1 id="titulo-leccion" class="m-0 font-poppins text-[26px] sm:text-[32px] font-bold leading-tight">{{ unitData.title }}</h1>
              <p v-if="unitData.description" id="descripcion-leccion" class="m-0 max-w-[560px] text-base leading-relaxed">{{ unitData.description }}</p>
              <div class="flex flex-wrap items-center gap-2.5 pt-2">
                <span class="pastilla-principal inline-flex items-center gap-2 min-h-[38px] px-3.5 rounded-full text-[13px] font-bold">
                  <BookOpen :size="15" aria-hidden="true" /> {{ TERMINOS.leccion.uno }} principal
                </span>
                <!-- UI-01: escuchar la lección y qué más trae, en una línea (docs/DISENO_FORMATOS_LECCION.md) -->
                <EscucharLeccion v-if="unitContent.length > 0" :bloques="bloquesDeTexto" data-recorrido="escuchar" />
              </div>
              <EstudianteLeccionOtrasFormas modo="fila" class="xl:hidden pt-1" :alternativas="alternativas" :version="unitContent.length" />
            </header>

            <!-- La explicación y los recursos de la lección, tal como los publicó el docente -->
            <div v-if="unitContent.length > 0" id="explicacion" tabindex="-1"
              class="px-5 sm:px-8 py-6 space-y-6 text-[17px] text-base-texto-primario leading-[1.7] focus:outline-none">
              <section v-for="content in unitContent" :id="`bloque-${content.id}`" :key="content.id" class="space-y-2 scroll-mt-32"
                :class="esAlternativa(content.cuando) ? 'rounded-2xl border-l-4 border-stire-blue bg-stire-blue/5 p-4 -mx-1' : ''">
                <!-- Explicación alternativa: otra forma de explicar lo mismo, que aparece cuando el estudiante la necesita. -->
                <p v-if="esAlternativa(content.cuando)" class="text-[11px] font-bold uppercase tracking-wider text-stire-blue">Otra forma de verlo</p>
                <h2 v-if="content.title" class="font-poppins text-[22px] font-bold text-base-texto-primario">
                  {{ content.title }}
                </h2>
                <LessonResource v-if="esRecurso(content.type)" :type="content.type ?? ''" :title="content.title" :metadata="content.metadata" />
                <ContenidoLeccion v-else :texto="content.body" :insertados="insertadosDe(content.metadata)" />
              </section>
            </div>
            <p v-else class="m-0 px-5 sm:px-8 py-6 text-sm text-base-texto-secundario">
              Esta lección todavía no tiene explicación publicada. Puedes pasar directo a practicar.
            </p>

            <div class="px-4 sm:px-6 pb-5 space-y-2">
              <ValorarLeccion :unit-id="unitId" data-recorrido="valorar" @no-claro="buscarAlternativa" />
              <p v-if="avisoAlternativa" role="status" class="text-sm font-semibold text-stire-blue">{{ avisoAlternativa }}</p>
            </div>
          </article>

          <EstudianteColaRepasos :learning-unit-id="unitId" />
          <EstudianteLeccionPractica :unit-id="unitId" />

          <!-- Entregas de esta lección: el docente las valora (docs/DISENO_INTERVENCION_DOCENTE.md §3) -->
          <section v-if="entregas.length" class="tarjeta-leccion p-5 space-y-2 text-sm" aria-labelledby="entregas-leccion">
            <h2 id="entregas-leccion" class="text-base font-bold text-base-texto-primario flex items-center gap-1.5"><Inbox :size="16" class="text-acento-ambar-fuerte" aria-hidden="true" /> Entregas de esta lección</h2>
            <NuxtLink v-for="e in entregas" :key="e.id" :to="`/estudiante/entregas/${e.id}`" class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-base-borde-sutil px-3 min-h-[44px] hover:border-acento-ambar-fuerte">
              <span class="font-semibold text-base-texto-primario">{{ e.titulo }}</span>
              <span class="text-xs text-base-texto-secundario">{{ e.versionesUsadas }} de {{ e.limite }} versiones{{ e.cierraAt ? ` · cierra ${fechaCorta(e.cierraAt)}` : '' }}</span>
            </NuxtLink>
          </section>

          <!-- Entre lecciones (cuadro «E-Leccion»): volver al curso y la siguiente, con su nombre. Si su módulo está cerrado, qué falta. -->
          <nav aria-label="Entre lecciones" class="grid gap-3 sm:grid-cols-2">
            <NuxtLink to="/estudiante/aprender" class="tarjeta-leccion flex items-center gap-3 px-5 py-4 min-h-[44px] hover:shadow-md transition-shadow">
              <ArrowLeft :size="20" aria-hidden="true" />
              <span><span class="block text-xs text-base-texto-secundario">Volver</span><span class="block font-bold">Al plan del curso</span></span>
            </NuxtLink>
            <NuxtLink v-if="sigLeccion?.abierta" :to="`/estudiante/unidad/${sigLeccion.id}`" class="salto-final flex items-center justify-end gap-3 px-5 py-4 rounded-[22px] min-h-[44px] text-right">
              <span><span class="block text-xs opacity-75">Siguiente lección</span><span class="block font-bold">{{ sigLeccion.titulo }}</span></span>
              <ArrowRight :size="20" aria-hidden="true" />
            </NuxtLink>
            <p v-else-if="sigLeccion" class="m-0 self-center text-sm text-base-texto-secundario sm:text-right">{{ notaModuloCerrado(sigLeccion) }}</p>
          </nav>
        </div>
        <EstudianteLeccionOtrasFormas modo="lado" class="hidden xl:block" :alternativas="alternativas" :version="unitContent.length" />
      </div>
    </template>
    <!-- Celular: anterior, plan del curso, siguiente y Tutor en una barra abajo (12/10). -->
    <EstudianteNavegacionLeccion :unit-id="unitId" />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Inbox, Loader2, Lock } from 'lucide-vue-next'
import { fechaCorta } from '~/utils/entregas'
import { tituloConNombre } from '~/utils/tituloPagina'
import { TERMINOS } from '~/utils/terminos'
import { useStudentStore } from '~/stores/student'
import { useUnidadEstudiante } from '~/composables/useUnidadEstudiante'
import { esAlternativa } from '~/utils/explicacionesAlternativas'
import { insertadosDe } from '~/utils/contenidoLeccion'
import { siguienteLeccion } from '~/utils/siguienteLeccion'
import { notaModuloCerrado } from '~/utils/resultadoEntrega'
import { ubicacionLeccion } from '~/utils/leccionV3'

definePageMeta({
  layout: 'student'
})

const route = useRoute()
const studentStore = useStudentStore()
const { unidad, contenidos, entregasDeClase } = useUnidadEstudiante()

const unitId = Number(route.params.id) || 0
/** Si la lección es de un módulo todavía cerrado, qué falta para abrirlo; null si está abierta. */
const bloqueo = computed(() => {
  const mod = studentStore.modules.find((m) => m.units.some((u) => u.id === unitId))
  return mod ? studentStore.estadoModulo(mod.id)?.requiere ?? null : null
})

const sigLeccion = computed(() => siguienteLeccion(studentStore.modules, studentStore.estadosModulos, unitId))
/** Módulo y tema para la miga de pan; «Módulo 1 · Tema 2 · Lección 2 de 2» para la portada. */
const ubicacion = computed(() => ubicacionLeccion(studentStore.modules, unitId))

interface UnitDetail {
  id: number
  title: string
  description: string
  /** Clase a la que pertenece la unidad. */
  classId?: number
}

interface ContentBlock {
  id: number
  title: string
  body: string
  type?: string
  metadata?: Record<string, unknown> | null
  cuando?: string
}

/** Video, PDF, imagen o recurso insertado (paso 6); el resto es texto en Markdown. */
const esRecurso = (type?: string) => ['video', 'pdf', 'image', 'embed'].includes(type ?? '')
/** Los bloques de texto, para escucharlos (EscucharLeccion). Computado: el mismo arreglo mientras no cambie la lección. */
const bloquesDeTexto = computed(() => unitContent.value.filter((c) => !esRecurso(c.type)))
/** Las explicaciones extra que ya se ven: van también en «Otras formas de verla». */
const alternativas = computed(() => unitContent.value.filter((c) => esAlternativa(c.cuando)).map((c) => ({ id: c.id, title: c.title })))

const isLoading = ref(true)
const loadError = ref(false)
const unitData = ref<UnitDetail | null>(null)
// El nombre de la lección en la pestaña y para el lector de pantalla (WCAG 2.4.2).
useHead({ title: computed(() => tituloConNombre(unitData.value?.title, route.path)) })
const unitContent = ref<ContentBlock[]>([])
// Al decir «No me quedó claro», si el docente preparó otra forma de explicarlo, aparece y se lleva al estudiante allí.
const avisoAlternativa = ref<string | null>(null)
async function buscarAlternativa() {
  const antes = new Set(unitContent.value.map((c) => c.id))
  const ahora = (await contenidos(unitId).catch(() => null)) ?? unitContent.value
  unitContent.value = ahora
  const nueva = ahora.find((c) => !antes.has(c.id))
  avisoAlternativa.value = nueva ? 'Tu docente preparó otra forma de explicarlo: la tienes arriba, marcada «Otra forma de verlo».' : null
  if (nueva) nextTick(() => document.getElementById(`bloque-${nueva.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

const entregas = ref<Array<{ id: number; titulo: string; learningUnitId: number | null; cierraAt: string | null; versionesUsadas: number; limite: number }>>([])

onMounted(async () => {
  if (!unitId) {
    loadError.value = true
    isLoading.value = false
    return
  }

  try {
    const [unit, contents] = await Promise.all([
      unidad(unitId),
      contenidos(unitId)
    ])
    unitData.value = unit
    unitContent.value = contents || []
    // Si la unidad es de otra de sus clases (llegó desde un repaso o una notificación), el encabezado y el
    // plan de estudio pasan a esa clase.
    if (unit?.classId) {
      entregasDeClase(unit.classId)
        .then((lista) => { entregas.value = lista.filter((e) => e.learningUnitId === unitId) })
        .catch(() => undefined)
    }
    if (unit?.classId && unit.classId !== studentStore.currentClassId) {
      studentStore.selectClass(unit.classId).catch(() => undefined)
    }
  } catch (error: unknown) {
    console.warn('[STIRE Student] No se pudo cargar la lección:', error)
    loadError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.salto-final { background: linear-gradient(135deg, #14213d, #25407a); color: #fff; transition: filter 0.15s ease; }
.salto-final:hover { filter: brightness(1.12); }
:root[data-tema='oscuro'] .salto-final { background: #e8f6ff; color: #14213d; }
</style>
