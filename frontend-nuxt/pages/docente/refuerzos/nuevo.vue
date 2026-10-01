<template>
  <div class="max-w-4xl mx-auto space-y-5">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-5 shadow-sm space-y-2">
      <div class="flex items-center gap-3">
        <NuxtLink :to="`/docente/refuerzos${claseId ? `?clase=${claseId}` : ''}`" class="p-1.5 rounded borde-afordancia" aria-label="Volver a los refuerzos" title="Volver"><ArrowLeft :size="16" aria-hidden="true" /></NuxtLink>
        <h1 class="text-lg font-bold text-base-texto-primario">{{ f.tipo === 'reto' ? 'Asignar un reto' : 'Asignar un refuerzo' }}</h1>
      </div>
      <p class="text-xs text-base-texto-secundario">
        <template v-if="f.tipo === 'refuerzo'">Si la actividad normal no le está funcionando, muéstrale el concepto de otra forma: una explicación distinta, un recurso, un ejemplo y luego práctica. Pocos pasos se terminan.</template>
        <template v-else>Para quien va adelante: ejercicios de mayor nivel o una entrega abierta.</template>
      </p>
    </header>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario"><Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Cargando la clase…</p>

    <form v-else novalidate @submit.prevent="guardar" class="space-y-4 text-xs">
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 min-w-0">
            <label for="ref-clase" class="block font-semibold text-base-texto-primario mb-1">Clase</label>
            <select id="ref-clase" v-model="claseId" @change="cargarClase" class="w-full max-w-full px-2 py-2 rounded-md border border-base-borde-fuerte bg-base-blanco">
              <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <fieldset>
            <legend class="font-semibold text-base-texto-primario mb-1">Tipo</legend>
            <div class="flex gap-4 py-2">
              <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="f.tipo" type="radio" value="refuerzo" name="ref-tipo" class="accent-acento-ambar-fuerte" /> Refuerzo</label>
              <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="f.tipo" type="radio" value="reto" name="ref-tipo" class="accent-acento-ambar-fuerte" /> Reto</label>
            </div>
          </fieldset>
        </div>
        <div>
          <label for="ref-titulo" class="block font-semibold text-base-texto-primario mb-1">Título</label>
          <input id="ref-titulo" v-model="f.titulo" maxlength="150" type="text" :placeholder="f.tipo === 'reto' ? 'Un paso más con los ciclos' : 'Otra forma de ver el else if'"
            class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <fieldset class="rounded-lg border border-base-borde-sutil p-3">
            <legend class="px-1 font-semibold text-base-texto-primario">Estudiantes ({{ f.estudiantes.length }})</legend>
            <ul class="max-h-48 overflow-y-auto space-y-1">
              <li v-for="e in estudiantes" :key="e.id">
                <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="f.estudiantes" type="checkbox" :value="e.id" class="accent-acento-ambar-fuerte" /> {{ e.nombre }}</label>
              </li>
            </ul>
          </fieldset>
          <fieldset class="rounded-lg border border-base-borde-sutil p-3">
            <legend class="px-1 font-semibold text-base-texto-primario">Lecciones en las que cuenta ({{ f.lecciones.length }})</legend>
            <div class="max-h-48 overflow-y-auto space-y-2">
              <div v-for="m in modulos" :key="m.id">
                <p class="text-[10px] font-bold uppercase tracking-wider text-base-texto-secundario">{{ m.title }}</p>
                <label v-for="l in m.lecciones" :key="l.id" class="flex items-center gap-1.5 cursor-pointer">
                  <input v-model="f.lecciones" type="checkbox" :value="l.id" class="accent-acento-ambar-fuerte" /> {{ l.title }}
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </section>

      <!-- Pasos -->
      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-3" aria-labelledby="pasos-titulo">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 id="pasos-titulo" class="text-sm font-bold text-base-texto-primario">Pasos ({{ f.pasos.length }} de 5)</h2>
          <div v-if="f.pasos.length < 5" class="flex flex-wrap gap-1.5">
            <button type="button" @click="agregar('explicacion')" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1"><FileText :size="13" aria-hidden="true" /> Explicación</button>
            <button type="button" @click="agregar('recurso')" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1"><Video :size="13" aria-hidden="true" /> Recurso</button>
            <button type="button" @click="agregar('ejercicio')" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1"><Dumbbell :size="13" aria-hidden="true" /> Ejercicio</button>
            <button type="button" @click="agregar('entrega')" class="px-2.5 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1"><Inbox :size="13" aria-hidden="true" /> Entrega</button>
          </div>
        </div>
        <p v-if="f.pasos.length === 0" class="text-base-texto-secundario">
          Agrega los pasos en el orden en que el estudiante los hará. Por ejemplo: otra explicación, un video corto y dos ejercicios más fáciles.
        </p>
        <ol class="space-y-3">
          <li v-for="(p, i) in f.pasos" :key="p.clave" class="rounded-lg border border-base-borde-sutil p-3 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-base-texto-primario">{{ i + 1 }}. {{ NOMBRE_PASO[p.tipo] }}</span>
              <span class="flex items-center gap-1">
                <button type="button" :disabled="i === 0" @click="mover(i, -1)" class="p-1 rounded hover:bg-base-bg-secundario disabled:opacity-30" :aria-label="`Subir el paso ${i + 1}`"><ChevronUp :size="14" aria-hidden="true" /></button>
                <button type="button" :disabled="i === f.pasos.length - 1" @click="mover(i, 1)" class="p-1 rounded hover:bg-base-bg-secundario disabled:opacity-30" :aria-label="`Bajar el paso ${i + 1}`"><ChevronDown :size="14" aria-hidden="true" /></button>
                <button type="button" @click="f.pasos.splice(i, 1)" class="p-1 rounded hover:bg-semantico-falla/10 hover:text-semantico-falla" :aria-label="`Quitar el paso ${i + 1}`"><Trash2 :size="14" aria-hidden="true" /></button>
              </span>
            </div>
            <template v-if="p.tipo === 'explicacion' || p.tipo === 'recurso'">
              <label :for="`paso-titulo-${i}`" class="sr-only">Título del paso {{ i + 1 }}</label>
              <input :id="`paso-titulo-${i}`" v-model="p.titulo" type="text" maxlength="150" placeholder="Título" class="w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte" />
            </template>
            <template v-if="p.tipo === 'explicacion'">
              <label :for="`paso-texto-${i}`" class="sr-only">Texto del paso {{ i + 1 }}</label>
              <textarea :id="`paso-texto-${i}`" v-model="p.texto" rows="4" placeholder="Explícalo de otra forma: una analogía, un ejemplo resuelto paso a paso, el error común. Admite Markdown y código."
                class="w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte font-mono text-[11px]"></textarea>
            </template>
            <template v-else-if="p.tipo === 'recurso'">
              <label :for="`paso-url-${i}`" class="sr-only">Enlace del paso {{ i + 1 }}</label>
              <input :id="`paso-url-${i}`" v-model="p.url" type="url" placeholder="Enlace de YouTube, Vimeo, Drive, Genially, Canva…" class="w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte" />
            </template>
            <template v-else-if="p.tipo === 'ejercicio'">
              <label :for="`paso-ej-${i}`" class="sr-only">Ejercicio del paso {{ i + 1 }}</label>
              <select :id="`paso-ej-${i}`" v-model="p.activityId" class="w-full max-w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco">
                <option :value="null" disabled>{{ sugerencias.ejercicios.length ? 'Elige un ejercicio (los sugeridos van primero)' : 'Elige lecciones para ver sus ejercicios' }}</option>
                <option v-for="e in sugerencias.ejercicios" :key="e.id" :value="e.id">{{ etiquetaEjercicio(e) }}</option>
              </select>
              <p v-if="ejercicioDe(p.activityId)?.borrador" class="text-[11px] text-semantico-info">Es un borrador: se publicará solo para estos estudiantes. Así creas en Contenidos un ejercicio a la medida y lo asignas aquí.</p>
            </template>
            <template v-else-if="p.tipo === 'entrega'">
              <label :for="`paso-ent-${i}`" class="sr-only">Entrega del paso {{ i + 1 }}</label>
              <select :id="`paso-ent-${i}`" v-model="p.entregaId" class="w-full max-w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco">
                <option :value="null" disabled>{{ sugerencias.entregas.length ? 'Elige una entrega de la clase' : 'Esta clase no tiene entregas: créala en «Entregas»' }}</option>
                <option v-for="e in sugerencias.entregas" :key="e.id" :value="e.id">{{ e.titulo }}{{ e.publicada ? '' : ' (borrador: se publicará solo para estos estudiantes)' }}</option>
              </select>
            </template>
          </li>
        </ol>
      </section>

      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 shadow-sm space-y-3">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1">
            <label for="ref-mensaje" class="font-semibold text-base-texto-primario">Mensaje para {{ f.estudiantes.length === 1 ? 'el estudiante' : 'los estudiantes' }}</label>
            <button type="button" @click="mensajeEditado = false; proponerMensaje()" class="text-[11px] font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1"><Sparkles :size="12" aria-hidden="true" /> Proponer un mensaje</button>
          </div>
          <textarea id="ref-mensaje" v-model="f.mensaje" @input="mensajeEditado = true" rows="3" maxlength="2000" class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte"></textarea>
          <p class="text-[11px] text-base-texto-secundario">Le llega como mensaje y lo ve en su inicio. Corto y sobre la tarea, no sobre la persona.</p>
        </div>
        <div class="sm:w-64">
          <label for="ref-fecha" class="block font-semibold text-base-texto-primario mb-1">Fecha límite <span class="font-normal text-base-texto-secundario">(opcional)</span></label>
          <input id="ref-fecha" v-model="f.fechaLimite" type="datetime-local" class="w-full px-2 py-2 rounded-md border border-base-borde-fuerte" />
        </div>
      </section>

      <p v-if="error" role="alert" class="text-semantico-falla">{{ error }}</p>
      <button type="submit" :disabled="guardando" class="px-5 py-2.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
        <Loader2 v-if="guardando" :size="14" class="animate-spin" aria-hidden="true" /><Send v-else :size="14" aria-hidden="true" />
        {{ f.tipo === 'reto' ? 'Asignar el reto' : 'Asignar el refuerzo' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { ArrowLeft, ChevronDown, ChevronUp, Dumbbell, FileText, Inbox, Loader2, Send, Sparkles, Trash2, Video } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { deFechaLocal } from '~/utils/entregas'
import { NOMBRE_NIVEL, NOMBRE_TIPO_PREGUNTA, idsDeConsulta, mensajeSugerido, type TipoRefuerzo } from '~/utils/refuerzos'

definePageMeta({ layout: 'teacher' })

type TipoPaso = 'explicacion' | 'recurso' | 'ejercicio' | 'entrega'
interface PasoForm { clave: number; tipo: TipoPaso; titulo: string; texto: string; url: string; activityId: number | null; entregaId: number | null }
interface Ejercicio { id: number; titulo: string; leccion: string; dificultad: string; tipoPregunta: string | null; borrador: boolean; soloPara: number; aprobadosPor: number }

const NOMBRE_PASO: Record<TipoPaso, string> = { explicacion: 'Otra explicación', recurso: 'Recurso', ejercicio: 'Ejercicio', entrega: 'Entrega' }

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const clases = ref<Array<{ id: number; name: string }>>([])
const claseId = ref<number | null>(null)
const estudiantes = ref<Array<{ id: number; nombre: string }>>([])
const modulos = ref<Array<{ id: number; title: string; lecciones: Array<{ id: number; title: string }> }>>([])
const sugerencias = ref<{ ejercicios: Ejercicio[]; entregas: Array<{ id: number; titulo: string; publicada: boolean }> }>({ ejercicios: [], entregas: [] })
const cargando = ref(true)
const guardando = ref(false)
const error = ref<string | null>(null)
let siguienteClave = 1

const f = reactive({
  tipo: (route.query.tipo === 'reto' ? 'reto' : 'refuerzo') as TipoRefuerzo,
  titulo: '',
  estudiantes: idsDeConsulta(route.query.estudiantes),
  lecciones: idsDeConsulta(route.query.lecciones),
  pasos: [] as PasoForm[],
  mensaje: '',
  fechaLimite: '',
})

const nombreLeccion = (id: number) => modulos.value.flatMap((m) => m.lecciones).find((l) => l.id === id)?.title ?? ''
const ejercicioDe = (id: number | null) => sugerencias.value.ejercicios.find((e) => e.id === id)
function etiquetaEjercicio(e: Ejercicio) {
  const partes = [e.titulo, e.leccion, NOMBRE_NIVEL[e.dificultad] ?? e.dificultad]
  if (e.tipoPregunta) partes.push(NOMBRE_TIPO_PREGUNTA[e.tipoPregunta] ?? e.tipoPregunta)
  if (f.estudiantes.length) partes.push(`${e.aprobadosPor} de ${f.estudiantes.length} ya lo aprueban`)
  if (e.borrador) partes.push('borrador')
  return partes.join(' · ')
}

function agregar(tipo: TipoPaso) {
  f.pasos.push({ clave: siguienteClave++, tipo, titulo: '', texto: '', url: '', activityId: null, entregaId: null })
}
function mover(i: number, d: number) {
  const [p] = f.pasos.splice(i, 1)
  f.pasos.splice(i + d, 0, p!)
}
// El mensaje propuesto se rehace al cambiar lecciones, estudiantes o tipo, mientras el docente no lo haya escrito él.
const mensajeEditado = ref(false)
watch(() => [f.lecciones.join(), f.estudiantes.join(), f.tipo], () => { if (!mensajeEditado.value && estudiantes.value.length) proponerMensaje() })

function proponerMensaje() {
  const nombres = estudiantes.value.filter((e) => f.estudiantes.includes(e.id)).map((e) => e.nombre)
  f.mensaje = mensajeSugerido(f.tipo, f.lecciones.map(nombreLeccion).filter(Boolean), nombres)
}

async function cargarSugerencias() {
  if (claseId.value === null) return
  try {
    sugerencias.value = await api.get(`/refuerzos/clase/${claseId.value}/sugerencias?lecciones=${f.lecciones.join(',')}&estudiantes=${f.estudiantes.join(',')}&tipo=${f.tipo}`)
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar los ejercicios sugeridos.')
  }
}
watch(() => [f.lecciones.join(), f.estudiantes.join(), f.tipo], cargarSugerencias)

async function cargarClase() {
  if (claseId.value === null) return
  try {
    const [secciones, matriculas] = await Promise.all([
      api.get<Array<{ id: number; title: string; topics?: Array<{ learningUnits?: Array<{ id: number; title: string }> }> }>>(`/sections/class/${claseId.value}`),
      api.get<Array<{ studentId: number; status: string; student?: { fullName?: string; email?: string } }>>(`/enrollment/class/${claseId.value}`),
    ])
    modulos.value = secciones.map((s) => ({ id: s.id, title: s.title, lecciones: (s.topics ?? []).flatMap((t) => t.learningUnits ?? []).map((l) => ({ id: l.id, title: l.title })) }))
    estudiantes.value = matriculas.filter((m) => m.status === 'active').map((m) => ({ id: m.studentId, nombre: m.student?.fullName || m.student?.email || 'Estudiante' }))
    const validos = new Set(estudiantes.value.map((e) => e.id))
    f.estudiantes = f.estudiantes.filter((id) => validos.has(id))
    const lecciones = new Set(modulos.value.flatMap((m) => m.lecciones).map((l) => l.id))
    f.lecciones = f.lecciones.filter((id) => lecciones.has(id))
    if (!f.titulo && f.lecciones.length === 1) f.titulo = `${f.tipo === 'reto' ? 'Reto' : 'Refuerzo'}: ${nombreLeccion(f.lecciones[0]!)}`
    if (!f.mensaje && f.estudiantes.length) proponerMensaje()
    await cargarSugerencias()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar la clase.')
  }
}

onMounted(async () => {
  try {
    clases.value = await api.get('/class/my-classes')
    const pedida = Number(route.query.clase)
    claseId.value = clases.value.find((c) => c.id === pedida)?.id ?? clases.value[0]?.id ?? null
    await cargarClase()
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  error.value = null
  if (!f.titulo.trim()) { error.value = 'Ponle un título.'; return }
  if (!f.estudiantes.length) { error.value = 'Elige al menos un estudiante.'; return }
  if (!f.lecciones.length) { error.value = 'Elige al menos una lección en la que cuente.'; return }
  if (!f.pasos.length) { error.value = 'Agrega al menos un paso.'; return }
  guardando.value = true
  try {
    await api.post('/refuerzos', {
      classId: claseId.value,
      tipo: f.tipo,
      titulo: f.titulo.trim(),
      mensaje: f.mensaje.trim() || null,
      learningUnitIds: f.lecciones,
      estudiantes: f.estudiantes,
      fechaLimite: deFechaLocal(f.fechaLimite),
      pasos: f.pasos.map((p) => {
        if (p.tipo === 'explicacion') return { tipo: p.tipo, titulo: p.titulo, texto: p.texto }
        if (p.tipo === 'recurso') return { tipo: p.tipo, titulo: p.titulo, url: p.url }
        if (p.tipo === 'ejercicio') return { tipo: p.tipo, activityId: p.activityId }
        return { tipo: p.tipo, entregaId: p.entregaId }
      }),
    })
    await navigateTo(`/docente/refuerzos?clase=${claseId.value}`)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo asignar.')
  } finally {
    guardando.value = false
  }
}
</script>
