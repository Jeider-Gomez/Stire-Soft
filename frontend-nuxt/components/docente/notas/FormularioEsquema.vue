<template>
  <!-- Cómo se arman las notas (antes dentro de pages/docente/clase/[classId]/notas.vue): qué notas hay, de dónde sale
     cada una, cómo se combinan por módulo y en la final, la aprobatoria y si el estudiante las ve. -->
  <section v-if="borrador && libro" class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm" aria-labelledby="titulo-esquema">
    <button v-if="libro.esquema" type="button" class="w-full flex items-center justify-between gap-3 p-5 text-left min-h-[44px]" :aria-expanded="editando" @click="editando = !editando">
      <span class="min-w-0">
        <span id="titulo-esquema" class="block text-sm font-bold text-base-texto-primario">Cómo se arman las notas</span>
        <span class="block text-[11px] text-base-texto-secundario mt-0.5">{{ resumenEsquema }}</span>
      </span>
      <ChevronDown :size="16" class="shrink-0 transition-transform" :class="editando ? 'rotate-180' : ''" aria-hidden="true" />
    </button>
    <h2 v-else id="titulo-esquema" class="p-5 pb-3 text-sm font-bold text-base-texto-primario">Arma las notas de la clase</h2>

    <form v-if="editando || !libro.esquema" class="px-5 pb-5 space-y-5" @submit.prevent="guardarEsquema">
      <!-- Las notas -->
      <fieldset class="space-y-3">
        <legend class="text-xs font-bold text-base-texto-primario mb-2">Las notas</legend>
        <div v-for="(c, i) in borrador.componentes" :key="i" class="rounded-lg border border-base-borde-sutil p-3 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_13rem_13rem_6rem_auto] gap-3 items-end">
            <div>
              <label :for="`comp-nombre-${i}`" class="block text-[11px] font-semibold text-base-texto-primario mb-1">Nombre</label>
              <input :id="`comp-nombre-${i}`" v-model="c.nombre" maxlength="60" required placeholder="Ej.: Quiz en el salón" class="w-full min-h-[44px] sm:min-h-0 px-3 py-2 text-xs rounded-md border border-base-borde-fuerte bg-base-blanco" />
            </div>
            <div>
              <label :for="`comp-tipo-${i}`" class="block text-[11px] font-semibold text-base-texto-primario mb-1">De dónde sale</label>
              <select :id="`comp-tipo-${i}`" v-model="c.tipo" class="w-full min-h-[44px] sm:min-h-0 px-3 py-2 text-xs rounded-md border border-base-borde-fuerte bg-base-blanco" @change="alCambiarTipo(c)">
                <option v-for="(t, clave) in TIPO_COMPONENTE" :key="clave" :value="clave">{{ t.nombre }}</option>
              </select>
            </div>
            <div>
              <label :for="`comp-modulo-${i}`" class="block text-[11px] font-semibold text-base-texto-primario mb-1">Es de</label>
              <select :id="`comp-modulo-${i}`" v-model="c.moduloId" class="w-full min-h-[44px] sm:min-h-0 px-3 py-2 text-xs rounded-md border border-base-borde-fuerte bg-base-blanco" @change="alCambiarModulo(c)">
                <option :value="null">Todo el curso</option>
                <option v-for="m in libro.modulos" :key="m.id" :value="m.id">{{ m.titulo }}</option>
              </select>
            </div>
            <div v-if="usaPorcentajes(c)">
              <label :for="`comp-peso-${i}`" class="block text-[11px] font-semibold text-base-texto-primario mb-1">Porcentaje</label>
              <input :id="`comp-peso-${i}`" v-model.number="c.peso" type="number" min="0" max="100" step="1" class="w-full min-h-[44px] sm:min-h-0 px-3 py-2 text-xs rounded-md border border-base-borde-fuerte bg-base-blanco" :aria-describedby="`comp-peso-ayuda-${i}`" />
              <span :id="`comp-peso-ayuda-${i}`" class="sr-only">{{ c.moduloId === null ? 'en la nota final' : 'en la nota del módulo' }}</span>
            </div>
            <button type="button" :disabled="borrador.componentes.length === 1" :aria-label="`Quitar la nota ${c.nombre || 'sin nombre'}`" class="min-h-[44px] sm:min-h-0 px-3 py-2 rounded-md text-xs font-semibold text-semantico-falla hover:bg-semantico-falla/10 disabled:opacity-40 inline-flex items-center gap-1 justify-center" @click="borrador.componentes.splice(i, 1)">
              <Trash2 :size="14" aria-hidden="true" /> Quitar
            </button>
          </div>
          <p class="text-[11px] text-base-texto-secundario">{{ TIPO_COMPONENTE[c.tipo].ayuda }}</p>

          <!-- Qué cuenta: las lecciones del módulo, todas, o las que elija; las entregas, todas o algunas. -->
          <fieldset v-if="c.tipo !== 'manual'" class="text-xs space-y-2">
            <legend class="text-[11px] font-semibold text-base-texto-primario mb-1">{{ c.tipo === 'dominio' ? 'Lecciones que cuentan' : 'Entregas que cuentan' }}</legend>
            <div class="flex flex-wrap gap-4">
              <label class="inline-flex items-center gap-1.5"><input type="radio" :name="`alcance-${i}`" :checked="lista(c) === null" @change="elegirTodas(c)" /> {{ textoTodas(c) }}</label>
              <label class="inline-flex items-center gap-1.5"><input type="radio" :name="`alcance-${i}`" :checked="lista(c) !== null" @change="elegirAlgunas(c)" /> Elegir</label>
            </div>
            <div v-if="lista(c) !== null && c.tipo === 'dominio'" class="max-h-64 overflow-y-auto rounded-md border border-base-borde-sutil p-2 space-y-2">
              <div v-for="m in modulosParaElegir(c)" :key="m.id">
                <label class="inline-flex items-center gap-1.5 font-semibold min-w-0">
                  <input type="checkbox" :disabled="m.lecciones.length === 0" :checked="m.lecciones.length > 0 && m.lecciones.every((id) => lista(c)!.includes(id))" @change="alternarModulo(c, m.lecciones)" />
                  <span class="truncate">Todo «{{ m.titulo }}»</span>
                </label>
                <div class="pl-5 grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                  <label v-for="id in m.lecciones" :key="id" class="inline-flex items-center gap-1.5 min-w-0">
                    <input type="checkbox" :checked="lista(c)!.includes(id)" @change="alternar(c, id)" />
                    <span class="truncate">{{ tituloLeccion(id) }}</span>
                  </label>
                  <span v-if="m.lecciones.length === 0" class="text-base-texto-secundario">Sin lecciones publicadas todavía.</span>
                </div>
              </div>
            </div>
            <div v-if="lista(c) !== null && c.tipo === 'entregas'" class="max-h-48 overflow-y-auto rounded-md border border-base-borde-sutil p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
              <label v-for="op in libro.entregas" :key="op.id" class="inline-flex items-center gap-1.5 min-w-0">
                <input type="checkbox" :checked="lista(c)!.includes(op.id)" @change="alternar(c, op.id)" />
                <span class="truncate">{{ op.titulo }}</span>
              </label>
              <p v-if="libro.entregas.length === 0" class="text-base-texto-secundario">No hay entregas con nota.</p>
            </div>
          </fieldset>
        </div>
        <button type="button" :disabled="borrador.componentes.length >= 40" class="min-h-[44px] px-3 py-2 rounded-md borde-afordancia text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40" @click="agregarComponente">
          <Plus :size="14" aria-hidden="true" /> Agregar nota
        </button>
      </fieldset>

      <!-- La nota de cada módulo que tenga notas -->
      <fieldset v-if="borrador.grupos.length" class="space-y-2">
        <legend class="text-xs font-bold text-base-texto-primario mb-2">Nota de cada módulo</legend>
        <div v-for="g in borrador.grupos" :key="g.moduloId" class="rounded-lg bg-base-bg-secundario p-3 flex flex-col lg:flex-row lg:items-center gap-3 text-xs">
          <span class="font-semibold text-base-texto-primario lg:w-56 truncate">{{ tituloModulo(g.moduloId) }}</span>
          <label class="inline-flex items-center gap-2">
            <span>Sus notas se combinan</span>
            <select v-model="g.calculo" class="px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco">
              <option value="promedio">promediando</option>
              <option value="porcentajes">con porcentajes</option>
            </select>
          </label>
          <span v-if="g.calculo === 'porcentajes'" class="text-[11px]" :class="sumaModulo(g.moduloId) === 100 ? 'text-semantico-pasa' : 'text-base-texto-secundario'">
            Suman {{ sumaModulo(g.moduloId) }} %{{ sumaModulo(g.moduloId) === 100 ? '' : ': se reparte en proporción' }}
          </span>
          <label v-if="borrador.calculo === 'porcentajes'" class="inline-flex items-center gap-2 lg:ml-auto">
            <span>Pesa en la final</span>
            <input v-model.number="g.peso" type="number" min="0" max="100" step="1" class="w-16 px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco" :aria-label="`Porcentaje de ${tituloModulo(g.moduloId)} en la nota final`" /> %
          </label>
        </div>
      </fieldset>

      <!-- La nota final -->
      <fieldset class="rounded-lg border border-base-borde-sutil p-3 space-y-2 text-xs">
        <legend class="text-xs font-bold text-base-texto-primario px-1">Nota final</legend>
        <div class="flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-2">
          <label v-for="(texto, modo) in MODO_CALCULO" :key="modo" class="inline-flex items-center gap-1.5">
            <input v-model="borrador.calculo" type="radio" name="calculo-final" :value="modo" /> {{ texto }}
          </label>
        </div>
        <p class="text-[11px] text-base-texto-secundario">
          <template v-if="borrador.calculo === 'porcentajes'">
            Cuentan {{ itemsDeLaFinal }}. Suman {{ sumaFinal }} %{{ sumaFinal === 100 ? '.' : ': si no suman 100, se reparte en proporción.' }} Con 0 % una nota se registra pero no cuenta.
          </template>
          <template v-else-if="borrador.calculo === 'promedio'">La final es el promedio de {{ itemsDeLaFinal }}, con lo que ya tenga nota.</template>
          <template v-else>STIRE no calcula una final: registras las notas y, si quieres, pones la final a mano en la tabla.</template>
        </p>
      </fieldset>

      <div class="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
        <label class="inline-flex items-center gap-2">
          <span class="font-semibold text-base-texto-primario">Nota aprobatoria</span>
          <input v-model="aprobatoriaTexto" inputmode="decimal" required class="w-16 px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco" aria-describedby="ayuda-aprobatoria" />
        </label>
        <span id="ayuda-aprobatoria" class="text-[11px] text-base-texto-secundario">De 0,0 a 5,0. Confírmala con el reglamento de la Universidad.</span>
      </div>
      <label class="flex items-start gap-2 text-xs">
        <input v-model="borrador.visibleParaEstudiantes" type="checkbox" class="mt-0.5" />
        <span><span class="font-semibold">Cada estudiante ve sus notas</span> en «Mi progreso». Ve la nota final, no el motivo de un ajuste.</span>
      </label>

      <div class="flex flex-wrap items-center gap-3">
        <button type="submit" :disabled="guardandoEsquema" class="min-h-[44px] px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs disabled:opacity-40">
          {{ guardandoEsquema ? 'Guardando…' : 'Guardar las notas' }}
        </button>
        <button type="button" class="min-h-[44px] px-4 py-2 rounded-md borde-afordancia text-xs font-semibold" @click="descartar">{{ libro.esquema ? 'Descartar cambios' : 'Cancelar' }}</button>
        <button v-if="libro.esquema" type="button" class="min-h-[44px] px-4 py-2 rounded-md text-xs font-semibold text-semantico-falla hover:bg-semantico-falla/10 sm:ml-auto" @click="dejarDeUsar">Dejar de usar notas en esta clase</button>
        <span v-if="errorEsquema" role="alert" class="text-xs text-semantico-falla">{{ errorEsquema }}</span>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { ChevronDown, Plus, Trash2 } from 'lucide-vue-next'
import { CLAVE_NOTAS_CLASE } from '~/composables/useNotasClase'
import { MODO_CALCULO, TIPO_COMPONENTE, leerNota, notaComa, sincronizarGrupos, sumaPesos, type Componente } from '~/utils/calificaciones'

const estado = inject(CLAVE_NOTAS_CLASE)
if (!estado) throw new Error('FormularioEsquema necesita useNotasClase() con provide(CLAVE_NOTAS_CLASE).')
const { libro, borrador, aprobatoriaTexto, editando, descartar: descartarBorrador } = estado
const { confirmar } = useConfirmar()

const guardandoEsquema = ref(false)
const errorEsquema = ref<string | null>(null)

const tituloModulo = (id: number) => libro.value?.modulos.find((m) => m.id === id)?.titulo ?? 'Módulo'
const titulosLeccion = computed(() => new Map((libro.value?.lecciones ?? []).map((l) => [l.id, l.titulo])))
const tituloLeccion = (id: number) => titulosLeccion.value.get(id) ?? `Lección ${id}`

const resumenEsquema = computed(() => {
  const e = libro.value?.esquema
  if (!e) return ''
  const n = e.componentes.length
  const modulos = e.grupos.length ? ` en ${e.grupos.length} ${e.grupos.length === 1 ? 'módulo' : 'módulos'}` : ''
  return `${n} ${n === 1 ? 'nota' : 'notas'}${modulos} · final: ${MODO_CALCULO[e.calculo].toLowerCase()} · aprueba con ${notaComa(e.notaAprobatoria)}`
})

// ─── Porcentajes del borrador ───
/** Una nota lleva porcentaje si su nivel (el módulo o la final) los usa. */
function usaPorcentajes(c: Componente): boolean {
  const b = borrador.value
  if (!b) return false
  if (c.moduloId === null) return b.calculo === 'porcentajes'
  return b.grupos.find((g) => g.moduloId === c.moduloId)?.calculo === 'porcentajes'
}
const sumaModulo = (moduloId: number) => sumaPesos((borrador.value?.componentes ?? []).filter((c) => c.moduloId === moduloId))
const sumaFinal = computed(() => {
  const b = borrador.value
  if (!b) return 0
  return sumaPesos(b.componentes.filter((c) => c.moduloId === null)) + sumaPesos(b.grupos)
})
const itemsDeLaFinal = computed(() => {
  const b = borrador.value
  if (!b) return ''
  const partes = [...b.grupos.map((g) => `la nota de ${tituloModulo(g.moduloId)}`), ...b.componentes.filter((c) => c.moduloId === null).map((c) => `«${c.nombre || 'sin nombre'}»`)]
  return partes.length ? partes.join(', ') : 'nada todavía'
})

// Cada módulo que tenga notas tiene su nota de módulo; se crea o se quita sola al cambiar de qué es cada nota.
watch(() => borrador.value?.componentes.map((c) => c.moduloId).join(','), () => {
  if (borrador.value && libro.value) borrador.value.grupos = sincronizarGrupos(borrador.value, libro.value.modulos)
})

// ─── Qué cuenta en cada nota ───
const lista = (c: Componente) => (c.tipo === 'dominio' ? c.lecciones : c.entregas)
const textoTodas = (c: Componente) => (c.tipo === 'entregas' ? 'Todas las que llevan nota' : c.moduloId !== null ? 'Todas las del módulo' : 'Todas las de módulos publicados')
const modulosParaElegir = (c: Componente) => (libro.value?.modulos ?? []).filter((m) => c.moduloId === null || m.id === c.moduloId)

function alCambiarTipo(c: Componente) {
  c.lecciones = null
  c.entregas = null
}
function alCambiarModulo(c: Componente) {
  c.lecciones = null
}
function elegirTodas(c: Componente) {
  if (c.tipo === 'dominio') c.lecciones = null
  else c.entregas = null
}
function elegirAlgunas(c: Componente) {
  if (c.tipo === 'dominio') c.lecciones = []
  else c.entregas = []
}
function alternar(c: Componente, id: number) {
  const actual = lista(c) ?? []
  const nueva = actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]
  if (c.tipo === 'dominio') c.lecciones = nueva
  else c.entregas = nueva
}
function alternarModulo(c: Componente, ids: number[]) {
  const actual = lista(c) ?? []
  const todas = ids.every((id) => actual.includes(id))
  const nueva = todas ? actual.filter((id) => !ids.includes(id)) : [...new Set([...actual, ...ids])]
  if (c.tipo === 'dominio') c.lecciones = nueva
}
function agregarComponente() {
  borrador.value?.componentes.push({ clave: '', nombre: '', tipo: 'manual', peso: 0, moduloId: null, lecciones: null, entregas: null })
}
function descartar() {
  descartarBorrador()
  errorEsquema.value = null
}

async function dejarDeUsar() {
  if (!(await confirmar({ titulo: '¿Dejar de usar notas en esta clase?', mensaje: 'Las notas que pusiste y su historial se conservan por si vuelves a armarlas.', accion: 'Dejar de usar notas' }))) return
  errorEsquema.value = await estado!.dejarDeUsar()
}

async function guardarEsquema() {
  if (!borrador.value) return
  const aprobatoria = leerNota(aprobatoriaTexto.value)
  if (aprobatoria === undefined || aprobatoria === null) {
    errorEsquema.value = 'La nota aprobatoria va de 0,0 a 5,0.'
    return
  }
  guardandoEsquema.value = true
  errorEsquema.value = await estado!.guardarEsquema(borrador.value, aprobatoria)
  guardandoEsquema.value = false
}
</script>
