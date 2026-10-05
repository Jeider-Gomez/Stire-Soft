<template>
  <!-- Crear una clase (antes dentro de pages/docente/index.vue). Sobre la base de ventanas común: el foco entra al
       primer campo, Tab no se sale, Escape cierra y el foco vuelve a «Crear nueva clase». Se cierra por el fondo solo si
       el clic empezó en el fondo (seleccionar texto y soltar afuera no borra lo escrito). -->
  <AdminDialogo id-titulo="crear-clase-titulo" titulo="Crear nueva clase" subtitulo="Tus estudiantes entran con el código o escaneando su QR."
    devolver-foco="abrir-crear-clase" :ocupado="guardando" @cerrar="emit('cerrar')">
    <template #icono><BookOpen :size="18" aria-hidden="true" /></template>
    <form class="space-y-4" novalidate @submit.prevent="crear">
      <!-- Asignatura, grupo y periodo (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md): opcionales; sugieren el nombre -->
      <div>
        <label for="new-class-asignatura" class="block text-xs font-semibold text-slate-700 mb-1.5">
          Asignatura <span class="font-normal text-slate-600">(opcional)</span>
        </label>
        <DocenteSelectorAsignatura v-model="f.asignatura" input-id="new-class-asignatura" :programa-sugerido="programaHabitual" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="new-class-grupo" class="block text-xs font-semibold text-slate-700 mb-1.5">Grupo</label>
          <input id="new-class-grupo" v-model="f.grupo" type="text" maxlength="40" placeholder="Grupo 2" class="input-stire min-h-[44px]" />
        </div>
        <div>
          <label for="new-class-periodo" class="block text-xs font-semibold text-slate-700 mb-1.5">Periodo</label>
          <input id="new-class-periodo" v-model="f.periodo" type="text" maxlength="7" placeholder="2026-2" class="input-stire min-h-[44px]" />
        </div>
      </div>

      <div>
        <label for="new-class-name" class="block text-xs font-semibold text-slate-700 mb-1.5">Nombre de la clase</label>
        <input id="new-class-name" v-model="f.name" data-foco-inicial type="text" required maxlength="150" placeholder="Ej.: Algoritmos y lógica de programación"
          class="input-stire min-h-[44px]" @input="nombreTocado = true" />
      </div>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label for="new-class-code" class="text-xs font-semibold text-slate-700">Código de la clase</label>
          <button type="button" class="min-h-[44px] sm:min-h-0 text-[11px] text-stire-blue hover:underline font-medium transition-colors" @click="sugerir">Generar sugerido</button>
        </div>
        <input id="new-class-code" v-model="f.code" type="text" required placeholder="Ej.: ALGO-2026-1" class="input-stire min-h-[44px] font-mono uppercase" aria-describedby="new-class-code-estado" />
        <p id="new-class-code-estado" class="text-[11px] mt-1 flex items-center gap-1" aria-live="polite"
          :class="estadoCodigo.tipo === 'ocupado' ? 'text-semantico-falla font-semibold' : estadoCodigo.tipo === 'libre' ? 'text-semantico-pasa font-semibold' : 'text-slate-600'">
          <X v-if="estadoCodigo.tipo === 'ocupado'" :size="12" aria-hidden="true" />
          <Check v-else-if="estadoCodigo.tipo === 'libre'" :size="12" aria-hidden="true" />
          {{ estadoCodigo.texto }}
        </p>
      </div>

      <div>
        <label for="new-class-desc" class="block text-xs font-semibold text-slate-700 mb-1.5">Descripción <span class="font-normal text-slate-600">(opcional)</span></label>
        <textarea id="new-class-desc" v-model="f.description" v-crece rows="2" placeholder="Qué van a aprender en el curso…" class="input-stire resize-none" />
      </div>

      <!-- Copiar contenido: plantillas recomendadas para su asignatura, el resto agrupado, y sus clases (§2.3) -->
      <DocenteElegirPlantilla v-model="f.sourceClassId" :plantillas="plantillas" :mis-clases="clases" :asignatura-nombre="f.asignatura?.nombre" />

      <div class="p-4 bg-stire-canvas rounded-xl border border-base-borde-sutil flex items-center justify-between gap-4">
        <div>
          <label for="new-class-aprobacion" class="text-xs font-semibold text-base-texto-primario">Requiere aprobación</label>
          <p class="text-[11px] text-slate-600 mt-0.5">Apruebas a cada estudiante antes de que entre.</p>
        </div>
        <input id="new-class-aprobacion" v-model="f.requiresApproval" type="checkbox" class="w-5 h-5 rounded cursor-pointer accent-stire-blue" />
      </div>

      <p v-if="error" role="alert" class="p-3 bg-stire-danger/10 border border-stire-danger/25 text-semantico-falla rounded-xl text-xs">{{ error }}</p>

      <div class="flex items-center justify-end gap-3 pt-1">
        <button type="button" class="btn-stire-secondary min-h-[44px]" :disabled="guardando" @click="emit('cerrar')">Cancelar</button>
        <button type="submit" :disabled="guardando" class="btn-stire-primary min-h-[44px] disabled:opacity-50">
          <Loader2 v-if="guardando" :size="14" class="animate-spin" aria-hidden="true" />
          <Plus v-else :size="14" aria-hidden="true" />
          {{ guardando ? 'Creando…' : 'Crear clase' }}
        </button>
      </div>
    </form>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { BookOpen, Check, Loader2, Plus, X } from 'lucide-vue-next'
import { CLAVE_CLASES_DOCENTE, type DatosClaseNueva } from '~/composables/useClasesDocente'
import { nombreSugerido, periodoActual } from '~/utils/contextoAcademico'
import { normalizarCodigo, sugerirCodigo } from '~/utils/codigoClase'

const emit = defineEmits<{ cerrar: []; creada: [aviso: string] }>()
const estado = inject(CLAVE_CLASES_DOCENTE)
if (!estado) throw new Error('VentanaCrearClase necesita useClasesDocente() con provide(CLAVE_CLASES_DOCENTE).')
const { clases, plantillas, cargarPlantillas, revisarCodigo, crearClase } = estado

const f = reactive<DatosClaseNueva>({ name: '', code: '', description: '', requiresApproval: false, sourceClassId: null, asignatura: null, grupo: '', periodo: periodoActual() })
const guardando = ref(false)
const error = ref<string | null>(null)

// Con la asignatura elegida se ordenan las plantillas por cercanía.
watch(() => f.asignatura?.id, (id) => { void cargarPlantillas(id) })
// El nombre se sugiere con la asignatura, el grupo y el periodo hasta que el docente lo escribe él mismo.
const nombreTocado = ref(false)
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
  guardando.value = true
  error.value = null
  const r = await crearClase(f)
  guardando.value = false
  if ('error' in r) { error.value = r.error; return }
  emit('creada', r.aviso)
}
</script>
