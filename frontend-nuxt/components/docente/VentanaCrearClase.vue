<template>
  <!-- Nueva clase (v3, Fase E; cuadro «D3-Nueva-Clase»): una sola ventana que empieza por «¿Con qué contenido empieza?»
       (Vacía, Copiar una de mis clases o Un curso de la Biblioteca) y sigue con el nombre, grupo, periodo, descripción,
       código y la aprobación. Sobre la base de ventanas común: el foco entra al primer campo, Tab no se sale, Escape cierra
       y el foco vuelve a «Nueva clase»; el fondo la cierra solo si el clic empezó en el fondo (no se pierde lo escrito).
       La franja «O créala con el Asistente» del cuadro espera poder leer el microcurrículo (P-19). -->
  <AdminDialogo id-titulo="crear-clase-titulo" titulo="Nueva clase" subtitulo="Tus estudiantes entran con el código o escaneando su QR."
    devolver-foco="abrir-crear-clase" :ocupado="guardando" ancho="2xl" @cerrar="emit('cerrar')">
    <template #icono><BookOpen :size="18" aria-hidden="true" /></template>
    <form class="space-y-4" novalidate @submit.prevent="crear">
      <fieldset class="m-0 p-0 border-0">
        <legend class="block text-[13px] font-bold text-base-texto-primario mb-2">¿Con qué contenido empieza?</legend>
        <div class="flex flex-wrap gap-2">
          <label v-for="o in OPCIONES" :key="o.valor" class="opcion-contenido" :class="{ elegida: modo === o.valor }">
            <input v-model="modo" type="radio" name="contenido-clase" :value="o.valor" class="sr-only" />{{ o.texto }}
          </label>
        </div>
        <p class="m-0 mt-1.5 text-[12px] text-slate-600" aria-live="polite">{{ lineaContenido }}</p>
        <div v-if="modo === 'mia' && clases.length" class="mt-2">
          <label for="new-class-copiar" class="sr-only">Clase que se copia</label>
          <select id="new-class-copiar" v-model.number="f.sourceClassId" class="input-stire min-h-[44px]">
            <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div v-else-if="modo === 'biblioteca' && plantillas.length" class="mt-2 max-h-[260px] overflow-y-auto pr-1">
          <DocenteElegirPlantilla v-model="f.sourceClassId" :plantillas="plantillas" :mis-clases="[]" :asignatura-nombre="f.asignatura?.nombre" sin-vacia />
        </div>
      </fieldset>

      <div>
        <label for="new-class-name" class="etiqueta-clase">Nombre de la clase</label>
        <input id="new-class-name" v-model="f.name" data-foco-inicial type="text" required maxlength="150" placeholder="Ej.: Algoritmos y lógica de programación"
          class="input-stire min-h-[44px]" :aria-describedby="nombreYaUsado ? 'new-class-name-repetido' : undefined" @input="nombreTocado = true" />
        <!-- Dos clases con el mismo nombre se confunden: los estudiantes creen ver el mismo curso (prueba del 07/10). -->
        <p v-if="nombreYaUsado" id="new-class-name-repetido" class="text-[11px] mt-1 text-semantico-falla font-semibold">
          Ya tienes una clase que se llama así. Agrégale el grupo o el periodo (por ejemplo «{{ f.name.trim() }} — G2 {{ periodoActual() }}») para que tus estudiantes las distingan.
        </p>
      </div>

      <!-- Asignatura, grupo y periodo (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): opcionales; sugieren el nombre y
           ordenan los cursos de la Biblioteca por cercanía. -->
      <div>
        <label for="new-class-asignatura" class="etiqueta-clase">Asignatura <span class="font-normal text-slate-600">(opcional)</span></label>
        <DocenteSelectorAsignatura v-model="f.asignatura" input-id="new-class-asignatura" :programa-sugerido="programaHabitual" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="new-class-grupo" class="etiqueta-clase">Grupo</label>
          <input id="new-class-grupo" v-model="f.grupo" type="text" maxlength="40" placeholder="G1" class="input-stire min-h-[44px]" />
        </div>
        <div>
          <label for="new-class-periodo" class="etiqueta-clase">Periodo</label>
          <input id="new-class-periodo" v-model="f.periodo" type="text" maxlength="7" placeholder="2026-2" class="input-stire min-h-[44px]" />
        </div>
      </div>

      <div>
        <label for="new-class-desc" class="etiqueta-clase">Descripción <span class="block font-normal text-[12px] text-slate-600">(una línea: cómo la diferencias de otras)</span></label>
        <textarea id="new-class-desc" v-model="f.description" v-crece rows="1" placeholder="Martes y jueves, 8:00 a. m." class="input-stire resize-none" />
      </div>

      <div>
        <label for="new-class-code" class="etiqueta-clase">Código de la clase</label>
        <div class="flex gap-2">
          <input id="new-class-code" v-model="f.code" type="text" required placeholder="Ej.: ALGO-2026-1" class="input-stire min-h-[44px] font-mono uppercase flex-1 min-w-0" aria-describedby="new-class-code-estado" />
          <button type="button" class="btn-stire-secondary min-h-[44px] shrink-0" @click="sugerir">Generar sugerido</button>
        </div>
        <p id="new-class-code-estado" class="text-[11px] mt-1 flex items-center gap-1" aria-live="polite"
          :class="estadoCodigo.tipo === 'ocupado' ? 'text-semantico-falla font-semibold' : estadoCodigo.tipo === 'libre' ? 'text-semantico-pasa font-semibold' : 'text-slate-600'">
          <X v-if="estadoCodigo.tipo === 'ocupado'" :size="12" aria-hidden="true" />
          <Check v-else-if="estadoCodigo.tipo === 'libre'" :size="12" aria-hidden="true" />
          {{ estadoCodigo.texto }}
        </p>
      </div>

      <DocenteSelectorPortada v-model="f.portada" />

      <div class="pt-3 border-t border-base-borde-sutil flex items-center justify-between gap-4">
        <div>
          <label for="new-class-aprobacion" class="text-[13px] font-bold text-base-texto-primario">Requiere aprobación</label>
          <p class="text-[12px] text-slate-600 mt-0.5">Apruebas a cada estudiante antes de que entre.</p>
        </div>
        <input id="new-class-aprobacion" v-model="f.requiresApproval" type="checkbox" role="switch" class="interruptor-clase" />
      </div>

      <MensajeError v-if="error" class="p-3 bg-stire-danger/10 border border-stire-danger/25 rounded-xl text-xs">{{ error }}</MensajeError>

      <div class="flex items-center justify-end gap-3 pt-1">
        <button type="button" class="btn-stire-secondary min-h-[44px]" :disabled="guardando" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" :disabled="guardando" class="boton-tinta inline-flex items-center gap-2 min-h-[44px] disabled:opacity-50">
          <Loader2 v-if="guardando" :size="14" class="animate-spin" aria-hidden="true" />
          {{ guardando ? 'Creando…' : 'Crear la clase' }}
        </button>
      </div>
    </form>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { BookOpen, Check, Loader2, X } from 'lucide-vue-next'
import { CLAVE_CLASES_DOCENTE, type DatosClaseNueva } from '~/composables/useClasesDocente'
import { nombreRepetido, nombreSugerido, periodoActual } from '~/utils/contextoAcademico'
import { normalizarCodigo, sugerirCodigo } from '~/utils/codigoClase'

const emit = defineEmits<{ cerrar: []; creada: [aviso: string] }>()
/** Desde la Biblioteca, «Usar en una clase nueva» llega con la plantilla ya elegida. */
const props = defineProps<{ plantillaInicial?: number | null }>()
const estado = inject(CLAVE_CLASES_DOCENTE)
if (!estado) throw new Error('VentanaCrearClase necesita useClasesDocente() con provide(CLAVE_CLASES_DOCENTE).')
const { clases, plantillas, cargarPlantillas, revisarCodigo, crearClase } = estado

const f = reactive<DatosClaseNueva>({ name: '', code: '', description: '', requiresApproval: false, sourceClassId: props.plantillaInicial ?? null, asignatura: null, grupo: '', periodo: periodoActual(), portada: null })
const guardando = ref(false)
const error = ref<string | null>(null)

// ¿Con qué contenido empieza? Al cambiar de opción se elige lo primero que haya (o nada, si es «Vacía»).
const OPCIONES = [
  { valor: 'vacia', texto: 'Vacía' },
  { valor: 'mia', texto: 'Copiar una de mis clases' },
  { valor: 'biblioteca', texto: 'Un curso de la Biblioteca' },
] as const
type ModoContenido = (typeof OPCIONES)[number]['valor']
const modo = ref<ModoContenido>(props.plantillaInicial ? 'biblioteca' : 'vacia')
watch(modo, (m) => {
  if (m === 'vacia') f.sourceClassId = null
  else if (m === 'mia') f.sourceClassId = clases.value[0]?.id ?? null
  else f.sourceClassId = plantillas.value[0]?.classId ?? null
})
const lineaContenido = computed(() => {
  if (modo.value === 'vacia') return 'Creas los módulos y lecciones tú.'
  if (modo.value === 'mia') return clases.value.length ? 'Se copian sus lecciones y ejercicios en borrador; nunca estudiantes ni notas.' : 'Aún no tienes otra clase para copiar.'
  if (!plantillas.value.length) return 'Aún no hay cursos compartidos en la Biblioteca.'
  const p = plantillas.value.find((x) => x.classId === f.sourceClassId)
  return p ? `«${p.enfoque || p.nombre}», de ${p.docente}. Se copia en borrador.` : 'Elige un curso: se copia en borrador.'
})

// Con la asignatura elegida se ordenan las plantillas por cercanía.
watch(() => f.asignatura?.id, (id) => { void cargarPlantillas(id) })
// El nombre se sugiere con la asignatura, el grupo y el periodo hasta que el docente lo escribe él mismo.
const nombreTocado = ref(false)
const nombreYaUsado = computed(() => nombreRepetido(f.name, clases.value.map((c) => c.name)))
watch(() => [f.asignatura, f.grupo, f.periodo] as const, ([a, grupo, periodo]) => {
  if (!nombreTocado.value && a) f.name = nombreSugerido(a.nombre, grupo, periodo)
})
// El programa en el que más enseña, para sugerir primero sus asignaturas; sin clases con asignatura, el de «Dónde enseño».
const contexto = useContextoDocente()
contexto.cargar()
const programaHabitual = computed<number | null>(() => {
  const cuenta = new Map<number, number>()
  for (const c of clases.value) if (c.asignatura?.programId) cuenta.set(c.asignatura.programId, (cuenta.get(c.asignatura.programId) ?? 0) + 1)
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? contexto.programaPrincipal.value
})

function sugerir() {
  f.code = sugerirCodigo(f.name)
}
sugerir()

// Mientras escribe, si el código sirve y está libre.
const INICIAL = 'Los estudiantes lo escriben o escanean su QR para entrar.'
const estadoCodigo = reactive<{ tipo: 'nada' | 'revisando' | 'libre' | 'ocupado'; texto: string }>({ tipo: 'nada', texto: INICIAL })
let reloj: ReturnType<typeof setTimeout> | null = null
watch(() => f.code, (texto) => {
  if (reloj) clearTimeout(reloj)
  if (!texto.trim()) { Object.assign(estadoCodigo, { tipo: 'nada', texto: INICIAL }); return }
  Object.assign(estadoCodigo, { tipo: 'revisando', texto: 'Revisando que nadie lo tenga…' })
  reloj = setTimeout(async () => {
    try {
      const r = await revisarCodigo(texto)
      if (normalizarCodigo(f.code) !== r.codigo) return
      Object.assign(estadoCodigo, r.disponible
        ? { tipo: 'libre', texto: r.codigo === f.code.trim() ? 'Disponible.' : `Disponible. Se guardará como ${r.codigo}.` }
        : { tipo: 'ocupado', texto: r.motivo ?? 'No disponible.' })
    } catch {
      Object.assign(estadoCodigo, { tipo: 'nada', texto: 'No se pudo revisar ahora; se revisará al crear la clase.' })
    }
  }, 400)
}, { immediate: true })
onBeforeUnmount(() => { if (reloj) clearTimeout(reloj) })

async function crear() {
  if (estadoCodigo.tipo === 'ocupado') { error.value = `${estadoCodigo.texto} Elige otro o pulsa «Generar sugerido».`; return }
  if (modo.value !== 'vacia' && f.sourceClassId === null) { error.value = 'Elige de dónde se copia el contenido, o toca «Vacía».'; return }
  guardando.value = true
  error.value = null
  const r = await crearClase(f)
  guardando.value = false
  if ('error' in r) { error.value = r.error; return }
  emit('creada', r.aviso)
}
</script>

<style scoped>
.etiqueta-clase { display: block; font-size: 13px; font-weight: 700; color: rgb(var(--c-base-texto-primario)); margin-bottom: 6px; }
.opcion-contenido { display: inline-flex; align-items: center; min-height: 44px; padding: 0 14px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
  border: 1px solid rgb(var(--c-base-borde-fuerte)); color: rgb(var(--c-base-texto-primario)); background: rgb(var(--c-base-blanco)); }
.opcion-contenido:hover { background: rgb(var(--c-base-bg-secundario)); }
.opcion-contenido.elegida { background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco)); border-color: rgb(var(--c-base-texto-primario)); }
.opcion-contenido:focus-within { outline: 2px solid rgb(var(--c-acento-ambar-fuerte)); outline-offset: 2px; }
.interruptor-clase { appearance: none; flex: none; position: relative; width: 48px; height: 28px; border-radius: 999px; cursor: pointer;
  background: rgb(var(--c-base-borde-fuerte)); transition: background-color 0.2s ease; }
.interruptor-clase::after { content: ''; position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; border-radius: 999px; background: #fff;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.3); transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
.interruptor-clase:checked { background: rgb(var(--c-semantico-pasa)); }
.interruptor-clase:checked::after { transform: translateX(20px); }
.interruptor-clase:focus-visible { outline: 2px solid rgb(var(--c-acento-ambar-fuerte)); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .interruptor-clase, .interruptor-clase::after { transition: none; } }
</style>
