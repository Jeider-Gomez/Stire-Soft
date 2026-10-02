<template>
  <form novalidate @submit.prevent="guardar" class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-5 shadow-sm space-y-4 text-xs" aria-labelledby="entrega-form-titulo">
    <div class="flex items-center justify-between gap-2">
      <h2 id="entrega-form-titulo" class="text-sm font-bold text-base-texto-primario">{{ inicial ? 'Editar la entrega' : 'Nueva entrega' }}</h2>
      <button type="button" @click="$emit('cancelar')" class="p-1.5 rounded hover:bg-base-bg-secundario" aria-label="Cerrar el formulario"><X :size="16" aria-hidden="true" /></button>
    </div>

    <div>
      <label for="entrega-titulo" class="block font-semibold text-base-texto-primario mb-1">Título</label>
      <input id="entrega-titulo" ref="tituloRef" v-model="f.titulo" type="text" maxlength="150" placeholder="Calculadora con funciones"
        class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30" />
    </div>

    <div>
      <label for="entrega-consigna" class="block font-semibold text-base-texto-primario mb-1">Consigna</label>
      <textarea id="entrega-consigna" v-model="f.consigna" rows="5" placeholder="Qué hay que hacer y cómo se va a valorar. Admite Markdown."
        class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/30 font-mono text-[11px]"></textarea>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="entrega-leccion" class="block font-semibold text-base-texto-primario mb-1">Lección <span class="font-normal text-base-texto-secundario">(opcional)</span></label>
        <select id="entrega-leccion" v-model="f.learningUnitId" class="w-full max-w-full px-2 py-2 rounded-md border border-base-borde-fuerte bg-base-blanco">
          <option :value="null">Ninguna: es una entrega de la materia</option>
          <optgroup v-for="m in modulos" :key="m.id" :label="m.title">
            <option v-for="l in m.lecciones" :key="l.id" :value="l.id">{{ l.title }}</option>
          </optgroup>
        </select>
      </div>
      <div>
        <label for="entrega-tipo" class="block font-semibold text-base-texto-primario mb-1">Qué se entrega</label>
        <select id="entrega-tipo" v-model="f.tipoProyecto" class="w-full px-2 py-2 rounded-md border border-base-borde-fuerte bg-base-blanco">
          <option v-for="(texto, valor) in TIPO_ENTREGA" :key="valor" :value="valor">{{ texto }}</option>
        </select>
      </div>
      <div>
        <label for="entrega-abre" class="block font-semibold text-base-texto-primario mb-1">Abre <span class="font-normal text-base-texto-secundario">(opcional)</span></label>
        <input id="entrega-abre" v-model="f.abreAt" type="datetime-local" class="w-full px-2 py-2 rounded-md border border-base-borde-fuerte" />
      </div>
      <div>
        <label for="entrega-cierra" class="block font-semibold text-base-texto-primario mb-1">Cierra <span class="font-normal text-base-texto-secundario">(opcional)</span></label>
        <input id="entrega-cierra" v-model="f.cierraAt" type="datetime-local" class="w-full px-2 py-2 rounded-md border border-base-borde-fuerte" />
        <label v-if="f.cierraAt" class="flex items-center gap-1.5 mt-1.5 cursor-pointer">
          <input v-model="f.aceptaTarde" type="checkbox" class="accent-acento-ambar-fuerte" /> Aceptar entregas tarde (quedan marcadas)
        </label>
      </div>
      <div>
        <label for="entrega-versiones" class="block font-semibold text-base-texto-primario mb-1">Máximo de versiones por estudiante</label>
        <input id="entrega-versiones" v-model.number="f.maxVersiones" type="number" min="1" max="10" class="w-24 px-2 py-2 rounded-md border border-base-borde-fuerte" />
        <p class="text-[11px] text-base-texto-secundario mt-1">Puedes darle una versión más a un estudiante cuando lo necesite.</p>
      </div>
    </div>

    <fieldset class="space-y-2 rounded-lg border border-base-borde-sutil p-3">
      <legend class="px-1 font-semibold text-base-texto-primario">Cómo se valora</legend>
      <label class="flex items-start gap-2 cursor-pointer">
        <input v-model="f.conNota" type="checkbox" class="mt-0.5 accent-acento-ambar-fuerte" />
        <span>Con nota de 0,0 a 5,0 <span class="block text-[11px] text-base-texto-secundario">Sin marcar, solo comentario: en lo formativo el comentario suele servir más que la nota.</span></span>
      </label>
      <label class="flex items-start gap-2" :class="puedeContar ? 'cursor-pointer' : 'opacity-60'">
        <input v-model="f.cuentaParaDominio" type="checkbox" :disabled="!puedeContar" class="mt-0.5 accent-acento-ambar-fuerte" />
        <span>La nota cuenta para el dominio de la lección
          <span class="block text-[11px] text-base-texto-secundario">{{ puedeContar ? 'Es evidencia: entra al dominio como un ejercicio más, del nivel que elijas.' : 'Necesita una lección y nota.' }}</span>
        </span>
      </label>
      <div v-if="f.cuentaParaDominio" class="pl-6">
        <label for="entrega-nivel" class="font-semibold text-base-texto-primario mr-2">Nivel</label>
        <select id="entrega-nivel" v-model="f.dificultad" class="px-2 py-1 rounded-md border border-base-borde-fuerte bg-base-blanco">
          <option value="basico">Básico</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option>
        </select>
      </div>
    </fieldset>

    <fieldset class="space-y-2 rounded-lg border border-base-borde-sutil p-3">
      <legend class="px-1 font-semibold text-base-texto-primario">Para quién</legend>
      <div class="flex flex-wrap gap-4">
        <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="paraTodos" type="radio" :value="true" name="entrega-para" class="accent-acento-ambar-fuerte" /> Toda la clase</label>
        <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="paraTodos" type="radio" :value="false" name="entrega-para" class="accent-acento-ambar-fuerte" /> Solo algunos estudiantes</label>
      </div>
      <ul v-if="!paraTodos" class="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        <li v-for="e in estudiantes" :key="e.id">
          <label class="flex items-center gap-1.5 cursor-pointer"><input v-model="f.asignadaA" type="checkbox" :value="e.id" class="accent-acento-ambar-fuerte" /> {{ e.nombre }}</label>
        </li>
      </ul>
    </fieldset>

    <!-- Código inicial (opcional): el estudiante empieza desde aquí con «Empezar desde la plantilla». -->
    <fieldset v-if="f.tipoProyecto !== 'cualquiera'" class="space-y-2">
      <legend class="font-semibold text-base-texto-primario">Código inicial <span class="font-normal text-base-texto-secundario">(opcional)</span></legend>
      <label class="flex items-start gap-2 cursor-pointer">
        <input v-model="usarCodigoInicial" type="checkbox" class="accent-acento-ambar-fuerte mt-0.5" @change="alCambiarCodigoInicial" />
        <span>Darles un punto de partida: por ejemplo, una página a medio hacer o un programa con la estructura lista. Cada
          estudiante recibe su propia copia y la entrega cuando quiera.</span>
      </label>
      <div v-if="usarCodigoInicial" class="space-y-2">
        <div class="flex flex-wrap gap-1" role="tablist" aria-label="Archivos del código inicial">
          <button v-for="(a, idx) in codigoInicial" :key="a.nombre" type="button" role="tab" :aria-selected="archivoAbierto === idx"
            class="px-3 py-1.5 rounded-md font-mono text-[11px] border"
            :class="archivoAbierto === idx ? 'border-acento-ambar-fuerte bg-acento-ambar/10 font-bold' : 'border-base-borde-fuerte'"
            @click="archivoAbierto = idx">{{ a.nombre }}</button>
        </div>
        <ProyectosEditorDiagrama
          v-if="f.tipoProyecto === 'diagrama' && codigoInicial[archivoAbierto]"
          v-model="codigoInicial[archivoAbierto].contenido"
        />
        <CodeEditor
          v-else-if="codigoInicial[archivoAbierto]"
          v-model="codigoInicial[archivoAbierto].contenido"
          :language="lenguajeDeArchivo(codigoInicial[archivoAbierto].nombre)"
          :aria-label="`Código inicial: ${codigoInicial[archivoAbierto].nombre}`"
        />
        <button type="button" class="text-[11px] font-semibold text-acento-ambar-fuerte hover:underline" @click="restaurarCodigoInicial">Volver al código de ejemplo</button>
      </div>
    </fieldset>

    <label class="flex items-center gap-2 cursor-pointer font-semibold text-base-texto-primario">
      <input v-model="f.publicada" type="checkbox" class="accent-acento-ambar-fuerte" /> Publicada (los estudiantes la ven)
    </label>

    <p v-if="error" role="alert" class="text-semantico-falla">{{ error }}</p>
    <div class="flex items-center gap-2">
      <button type="submit" :disabled="guardando" class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold inline-flex items-center gap-1.5 disabled:opacity-50">
        <Loader2 v-if="guardando" :size="14" class="animate-spin" aria-hidden="true" /><Save v-else :size="14" aria-hidden="true" />
        {{ inicial ? 'Guardar cambios' : 'Crear la entrega' }}
      </button>
      <button type="button" @click="$emit('cancelar')" class="px-3 py-2 rounded-md borde-afordancia font-semibold">Cancelar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Loader2, Save, X } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { TIPO_ENTREGA, aFechaLocal, deFechaLocal, type EntregaEditable, type TipoEntrega, codigoInicialPorDefecto, lenguajeDeArchivo, type ArchivoCodigo } from '~/utils/entregas'

const props = defineProps<{ classId: number; inicial?: EntregaEditable | null }>()
const emit = defineEmits<{ (e: 'guardada', entrega: { id: number }): void; (e: 'cancelar'): void }>()

const api = useApi()
const { messageOf } = useApiErrorMessage()
const tituloRef = ref<HTMLInputElement | null>(null)
const guardando = ref(false)
const error = ref<string | null>(null)
const modulos = ref<Array<{ id: number; title: string; lecciones: Array<{ id: number; title: string }> }>>([])
const estudiantes = ref<Array<{ id: number; nombre: string }>>([])

const i = props.inicial
const f = reactive({
  titulo: i?.titulo ?? '',
  consigna: i?.consigna ?? '',
  learningUnitId: i?.learningUnitId ?? null as number | null,
  tipoProyecto: i?.tipoProyecto ?? 'cualquiera' as TipoEntrega,
  abreAt: aFechaLocal(i?.abreAt),
  cierraAt: aFechaLocal(i?.cierraAt),
  aceptaTarde: i?.aceptaTarde ?? true,
  maxVersiones: i?.maxVersiones ?? 3,
  conNota: i?.conNota ?? false,
  cuentaParaDominio: i?.cuentaParaDominio ?? false,
  dificultad: i?.dificultad ?? 'basico',
  publicada: i?.publicada ?? false,
  asignadaA: [...(i?.asignadaA ?? [])],
})
const paraTodos = ref(!i?.asignadaA?.length)

// Código inicial: al cambiar el tipo se propone el ejemplo de ese tipo.
const usarCodigoInicial = ref(!!i?.plantilla?.length)
const codigoInicial = ref<ArchivoCodigo[]>(i?.plantilla?.length ? i.plantilla.map((a) => ({ ...a })) : [])
const archivoAbierto = ref(0)
function restaurarCodigoInicial() {
  if (f.tipoProyecto === 'cualquiera') return
  codigoInicial.value = codigoInicialPorDefecto(f.tipoProyecto)
  archivoAbierto.value = 0
}
function alCambiarCodigoInicial() {
  if (usarCodigoInicial.value && codigoInicial.value.length === 0) restaurarCodigoInicial()
}
watch(() => f.tipoProyecto, (tipo) => {
  if (tipo === 'cualquiera') usarCodigoInicial.value = false
  else if (usarCodigoInicial.value) restaurarCodigoInicial()
})

const puedeContar = computed(() => f.learningUnitId !== null && f.conNota)
watch(puedeContar, (si) => { if (!si) f.cuentaParaDominio = false })

onMounted(async () => {
  nextTick(() => tituloRef.value?.focus())
  try {
    const [secciones, matriculas] = await Promise.all([
      api.get<Array<{ id: number; title: string; topics?: Array<{ learningUnits?: Array<{ id: number; title: string }> }> }>>(`/sections/class/${props.classId}`),
      api.get<Array<{ studentId: number; status: string; student?: { fullName?: string; email?: string } }>>(`/enrollment/class/${props.classId}`),
    ])
    modulos.value = secciones.map((s) => ({ id: s.id, title: s.title, lecciones: (s.topics ?? []).flatMap((t) => t.learningUnits ?? []).map((l) => ({ id: l.id, title: l.title })) }))
    estudiantes.value = matriculas.filter((m) => m.status === 'active').map((m) => ({ id: m.studentId, nombre: m.student?.fullName || m.student?.email || 'Estudiante' }))
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar las lecciones y los estudiantes de la clase.')
  }
})

async function guardar() {
  error.value = null
  if (!f.titulo.trim()) { error.value = 'Ponle un título a la entrega.'; tituloRef.value?.focus(); return }
  if (!paraTodos.value && f.asignadaA.length === 0) { error.value = 'Elige al menos un estudiante, o «Toda la clase».'; return }
  guardando.value = true
  const cuerpo = {
    titulo: f.titulo.trim(),
    consigna: f.consigna,
    learningUnitId: f.learningUnitId,
    tipoProyecto: f.tipoProyecto,
    abreAt: deFechaLocal(f.abreAt),
    cierraAt: deFechaLocal(f.cierraAt),
    aceptaTarde: f.aceptaTarde,
    maxVersiones: Number(f.maxVersiones),
    conNota: f.conNota,
    cuentaParaDominio: f.cuentaParaDominio,
    dificultad: f.dificultad,
    publicada: f.publicada,
    asignadaA: paraTodos.value ? null : f.asignadaA,
    plantilla: usarCodigoInicial.value && f.tipoProyecto !== 'cualquiera' ? codigoInicial.value : null,
  }
  try {
    const r = props.inicial
      ? await api.patch<{ id: number }>(`/entregas/${props.inicial.id}`, cuerpo)
      : await api.post<{ id: number }>('/entregas', { ...cuerpo, classId: props.classId })
    emit('guardada', r)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo guardar la entrega.')
  } finally {
    guardando.value = false
  }
}
</script>
