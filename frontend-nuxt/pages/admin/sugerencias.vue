<template>
  <!-- Bandeja de sugerencias (utils/sugerencias.ts), como la de un sistema de soporte: lo pendiente aparte y lo más nuevo
       arriba; al resolver se escribe cómo (lo lee quien la envió); lo que no sirve (pruebas, vacías) se archiva con un
       motivo, sin borrarlo. Se descarga como Excel con filtros y un resumen. -->
  <div class="max-w-5xl mx-auto space-y-5">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-bold text-base-texto-primario flex items-center gap-2">
            <MessageSquarePlus :size="22" class="text-acento-ambar-fuerte" aria-hidden="true" /> Sugerencias
          </h1>
          <p class="text-xs text-base-texto-secundario mt-0.5">
            Lo que envían los usuarios con el botón «Sugerencias»: problemas, cosas confusas e ideas, con la pantalla, el dispositivo y la clase.
            Quien la envió ve el estado y tu respuesta.
          </p>
        </div>
        <button type="button" :disabled="!lista.length" class="shrink-0 min-h-[44px] px-4 rounded-md bg-semantico-pasa text-base-blanco font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-40 self-start" @click="descargar">
          <FileSpreadsheet :size="15" aria-hidden="true" /> Descargar Excel
        </button>
      </div>
      <!-- El estado de un vistazo: cuánto falta y cuánto bloquea. -->
      <dl class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-lg bg-acento-ambar/10 border border-acento-ambar/30 p-2">
          <dt class="text-[11px] text-base-texto-secundario">Por atender</dt>
          <dd class="text-lg font-bold text-base-texto-primario">{{ conteo.pendientes }}<span v-if="bloquean" class="block text-[11px] font-semibold text-semantico-falla">{{ bloquean }} {{ bloquean === 1 ? 'bloquea' : 'bloquean' }}</span></dd>
        </div>
        <div class="rounded-lg bg-semantico-pasa/10 border border-semantico-pasa/30 p-2">
          <dt class="text-[11px] text-base-texto-secundario">Resueltas</dt>
          <dd class="text-lg font-bold text-base-texto-primario">{{ conteo.resueltas }}</dd>
        </div>
        <div class="rounded-lg bg-base-bg-secundario border border-base-borde-sutil p-2">
          <dt class="text-[11px] text-base-texto-secundario">Archivadas</dt>
          <dd class="text-lg font-bold text-base-texto-primario">{{ conteo.archivadas }}</dd>
        </div>
      </dl>
    </header>

    <div class="flex flex-wrap gap-2 border-b border-base-borde-sutil text-xs" role="tablist" aria-label="Bandejas de sugerencias">
      <button v-for="b in BANDEJAS" :id="`tab-${b.valor}`" :key="b.valor" type="button" role="tab" :aria-selected="filtros.bandeja === b.valor" aria-controls="panel-sugerencias"
        class="min-h-[44px] px-3 font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px"
        :class="filtros.bandeja === b.valor ? 'border-acento-ambar-fuerte text-acento-ambar-fuerte' : 'border-transparent text-base-texto-secundario hover:text-base-texto-primario'"
        @click="filtros.bandeja = b.valor">
        {{ b.texto }} <span class="px-1.5 rounded-full bg-base-bg-secundario text-[10px] text-base-texto-primario">{{ conteo[b.valor] }}</span>
      </button>
    </div>

    <div id="panel-sugerencias" role="tabpanel" :aria-labelledby="`tab-${filtros.bandeja}`" class="space-y-3">
      <p class="text-[11px] text-base-texto-secundario">{{ BANDEJAS.find((b) => b.valor === filtros.bandeja)?.ayuda }}</p>
      <div class="flex flex-col sm:flex-row gap-2 text-xs">
        <label class="flex-1 min-w-0 relative">
          <span class="sr-only">Buscar en las sugerencias</span>
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-texto-secundario" aria-hidden="true" />
          <input v-model="filtros.buscar" type="search" placeholder="Buscar por texto, persona, clase o pantalla" class="w-full min-h-[44px] pl-8 pr-3 rounded-md border border-base-borde-fuerte bg-base-blanco" />
        </label>
        <label class="sr-only" for="filtro-tipo">Tipo</label>
        <select id="filtro-tipo" v-model="filtros.tipo" class="min-h-[44px] px-2 rounded-md border border-base-borde-fuerte bg-base-blanco">
          <option value="todos">Todos los tipos</option>
          <option v-for="(t, v) in TIPOS" :key="v" :value="v">{{ t }}</option>
        </select>
        <label class="sr-only" for="filtro-orden">Orden</label>
        <select id="filtro-orden" v-model="filtros.orden" class="min-h-[44px] px-2 rounded-md border border-base-borde-fuerte bg-base-blanco">
          <option value="recientes">Más nuevas primero</option>
          <option value="graves">Más graves primero</option>
          <option value="antiguas">Más antiguas primero</option>
        </select>
      </div>

      <p role="status" class="sr-only">{{ anuncio }}</p>
      <p v-if="cargando" class="text-xs text-base-texto-secundario">Cargando…</p>
      <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
      <div v-if="!cargando && !visibles.length" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-8 text-center space-y-1">
        <p class="font-semibold text-base-texto-primario">{{ filtros.buscar || filtros.tipo !== 'todos' ? 'Nada coincide con la búsqueda' : filtros.bandeja === 'pendientes' ? '¡Al día! No hay nada por atender' : 'Aquí no hay nada todavía' }}</p>
      </div>

      <ul class="space-y-3">
        <li v-for="r in visibles" :key="r.id">
          <article class="bg-base-blanco rounded-xl border p-4 space-y-2 text-xs" :class="r.estado === 'nuevo' ? 'border-acento-ambar-fuerte/50' : 'border-base-borde-sutil'" :aria-labelledby="`sug-${r.id}`">
            <div class="flex flex-wrap items-center gap-2">
              <span v-if="r.estado === 'nuevo'" class="px-2 py-0.5 rounded-full font-bold bg-acento-ambar-fuerte text-base-blanco text-[10px]">Nueva</span>
              <span class="px-2 py-0.5 rounded font-bold" :class="r.gravedad === 3 ? 'bg-semantico-falla/10 text-semantico-falla' : r.gravedad === 2 ? 'bg-acento-ambar/15 text-acento-ambar-fuerte' : 'bg-base-bg-secundario text-base-texto-primario'">
                {{ TIPOS[r.tipo] }}{{ r.gravedad ? ` · ${GRAVEDADES[r.gravedad].toLowerCase()}` : '' }}
              </span>
              <span :id="`sug-${r.id}`" class="font-semibold">{{ r.autor }}</span>
              <span class="text-base-texto-secundario">{{ r.rol }} · <time :datetime="r.createdAt" :title="new Date(r.createdAt).toLocaleString('es-CO')">{{ hace(r.createdAt) }}</time></span>
              <span v-if="r.clase" class="px-2 py-0.5 rounded bg-semantico-info/10 text-semantico-info font-semibold">{{ r.clase }}</span>
            </div>
            <p class="text-sm text-base-texto-primario whitespace-pre-line break-words">{{ r.texto }}</p>
            <details class="text-[11px] text-base-texto-secundario">
              <summary class="cursor-pointer min-h-[32px] inline-flex items-center">Pantalla y dispositivo</summary>
              <p class="break-all"><span class="font-mono">{{ r.ruta }}</span> · {{ r.dispositivo }}</p>
            </details>
            <div v-if="r.tieneCaptura">
              <a v-if="capturas[r.id]" :href="capturas[r.id]" target="_blank" rel="noopener" class="block w-fit" title="Abrir el pantallazo en grande">
                <img :src="capturas[r.id]" :alt="`Pantallazo de la sugerencia de ${r.autor}`" class="max-h-64 rounded-md border border-base-borde-fuerte" />
              </a>
              <button v-else type="button" :disabled="cargandoCaptura === r.id" class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1.5 disabled:opacity-50" @click="verCaptura(r)">
                <ImageIcon :size="14" aria-hidden="true" /> {{ cargandoCaptura === r.id ? 'Cargando…' : 'Ver pantallazo' }}
              </button>
            </div>

            <!-- La respuesta: cómo se resolvió (verde) o por qué se archivó (gris). -->
            <p v-if="r.nota && editando?.id !== r.id" class="rounded-md px-3 py-2 border" :class="r.estado === 'resuelto' ? 'bg-semantico-pasa/10 border-semantico-pasa/30' : 'bg-base-bg-secundario border-base-borde-sutil'">
              <span class="font-semibold">{{ r.estado === 'resuelto' ? 'Cómo se resolvió: ' : r.estado === 'descartado' ? 'Motivo: ' : 'Nota: ' }}</span>{{ r.nota }}
            </p>

            <!-- Resolver o archivar: se abre aquí mismo, con lo que hay que escribir. -->
            <form v-if="editando?.id === r.id" class="rounded-md border border-base-borde-fuerte p-3 space-y-2" @submit.prevent="guardar(r)">
              <p class="font-semibold text-base-texto-primario">{{ editando.estado === 'resuelto' ? 'Marcar como resuelta' : 'Archivar' }}</p>
              <div v-if="editando.estado === 'descartado'" class="flex flex-wrap gap-1.5" role="group" aria-label="Motivo rápido">
                <button v-for="m in MOTIVOS_ARCHIVAR" :key="m" type="button" class="min-h-[36px] px-3 rounded-full border text-[11px] font-semibold"
                  :class="editando.nota === m ? 'border-acento-ambar-fuerte bg-acento-ambar/10' : 'border-base-borde-fuerte'" :aria-pressed="editando.nota === m" @click="editando.nota = m">{{ m }}</button>
              </div>
              <label :for="`nota-${r.id}`" class="block font-semibold text-base-texto-primario">
                {{ editando.estado === 'resuelto' ? '¿Cómo se resolvió?' : 'Motivo' }}
                <span class="font-normal text-base-texto-secundario">{{ editando.estado === 'resuelto' ? '(lo lee quien la envió)' : '(opcional)' }}</span>
              </label>
              <textarea :id="`nota-${r.id}`" v-model="editando.nota" v-crece rows="2" maxlength="1000" data-foco-nota class="w-full px-3 py-2 rounded-md border border-base-borde-fuerte bg-base-blanco"
                :placeholder="editando.estado === 'resuelto' ? 'Ej.: Arreglado: el botón ya se ve en el celular (versión del 07/10).' : ''" />
              <!-- Opcional (08/10): le llega una notificación con lo que escribiste y abre «Lo que he enviado». -->
              <label class="flex items-start gap-2 min-h-[44px] cursor-pointer">
                <input v-model="editando.avisar" type="checkbox" class="mt-0.5 w-4 h-4" />
                <span>Avisarle a {{ r.autor }}: le llega una notificación con lo que escribiste aquí.</span>
              </label>
              <div class="flex flex-wrap items-center gap-2 justify-end">
                <p v-if="falta" class="mr-auto text-base-texto-secundario">{{ falta }}</p>
                <button type="button" class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold" @click="editando = null">Cancelar</button>
                <button type="submit" :disabled="!!falta || guardando" class="min-h-[44px] px-4 rounded-md font-bold text-base-blanco disabled:opacity-50" :class="editando.estado === 'resuelto' ? 'bg-semantico-pasa' : 'bg-base-texto-secundario'">
                  {{ guardando ? 'Guardando…' : editando.estado === 'resuelto' ? 'Guardar como resuelta' : 'Archivar' }}
                </button>
              </div>
            </form>

            <div v-else class="flex flex-wrap gap-2 pt-1">
              <template v-if="bandejaDe(r.estado) === 'pendientes'">
                <button type="button" class="min-h-[44px] px-3 rounded-md bg-semantico-pasa text-base-blanco font-bold inline-flex items-center gap-1.5" @click="abrirEdicion(r, 'resuelto')">
                  <CheckCircle2 :size="14" aria-hidden="true" /> Resolver…
                </button>
                <button v-if="r.estado === 'nuevo'" type="button" class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1.5" @click="cambiar(r, 'visto', r.nota)">
                  <Eye :size="14" aria-hidden="true" /> Marcar como vista
                </button>
                <button type="button" class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1.5" @click="abrirEdicion(r, 'descartado')">
                  <Archive :size="14" aria-hidden="true" /> Archivar…
                </button>
              </template>
              <template v-else>
                <button v-if="r.estado === 'resuelto'" type="button" class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold" @click="abrirEdicion(r, 'resuelto')">Editar la respuesta</button>
                <button type="button" class="min-h-[44px] px-3 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1.5" @click="cambiar(r, 'visto', r.nota)">
                  <RotateCcw :size="14" aria-hidden="true" /> {{ r.estado === 'resuelto' ? 'Reabrir' : 'Sacar del archivo' }}
                </button>
              </template>
            </div>
          </article>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Archive, CheckCircle2, Eye, FileSpreadsheet, Image as ImageIcon, MessageSquarePlus, RotateCcw, Search } from 'lucide-vue-next'
import { descargarExcel } from '~/utils/excel'
import {
  BANDEJAS, bandejaDe, contarPorBandeja, ESTADOS, faltaEnRevision, filtrar, GRAVEDADES, libroDeSugerencias, MOTIVOS_ARCHIVAR, TIPOS,
  type EstadoSugerencia, type Filtros, type Sugerencia,
} from '~/utils/sugerencias'

definePageMeta({ layout: 'admin' })

const sugerencias = useSugerencias()
const { messageOf } = useApiErrorMessage()
const lista = ref<Sugerencia[]>([])
const filtros = reactive<Filtros>({ bandeja: 'pendientes', tipo: 'todos', buscar: '', orden: 'recientes' })
const cargando = ref(true)
const error = ref<string | null>(null)
const anuncio = ref('')
const capturas = ref<Record<number, string>>({})
const cargandoCaptura = ref<number | null>(null)
const editando = ref<{ id: number; estado: EstadoSugerencia; nota: string; avisar: boolean } | null>(null)
const guardando = ref(false)

const visibles = computed(() => filtrar(lista.value, filtros))
const conteo = computed(() => contarPorBandeja(lista.value))
const bloquean = computed(() => lista.value.filter((s) => s.gravedad === 3 && bandejaDe(s.estado) === 'pendientes').length)
const falta = computed(() => (editando.value ? faltaEnRevision(editando.value.estado, editando.value.nota) : null))

function hace(iso: string): string {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 60) return min <= 1 ? 'hace un momento' : `hace ${min} min`
  if (min < 24 * 60) return `hace ${Math.round(min / 60)} h`
  const dias = Math.round(min / (24 * 60))
  return dias < 7 ? `hace ${dias} ${dias === 1 ? 'día' : 'días'}` : new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

async function verCaptura(r: Sugerencia) {
  cargandoCaptura.value = r.id
  try {
    const blob = await sugerencias.captura(r.id)
    capturas.value = { ...capturas.value, [r.id]: URL.createObjectURL(blob) }
  } catch (err) {
    error.value = messageOf(err, 'No se pudo cargar el pantallazo.')
  } finally {
    cargandoCaptura.value = null
  }
}
onBeforeUnmount(() => Object.values(capturas.value).forEach((u) => URL.revokeObjectURL(u)))

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    lista.value = await sugerencias.listar<Sugerencia[]>(null)
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar las sugerencias.')
  } finally {
    cargando.value = false
  }
}

function abrirEdicion(r: Sugerencia, estado: EstadoSugerencia) {
  editando.value = { id: r.id, estado, nota: estado === r.estado ? (r.nota ?? '') : '', avisar: estado === 'resuelto' }
  nextTick(() => document.querySelector<HTMLTextAreaElement>('[data-foco-nota]')?.focus())
}

async function cambiar(r: Sugerencia, estado: EstadoSugerencia, nota: string | null, avisar = false) {
  guardando.value = true
  try {
    await sugerencias.actualizar(r.id, { estado, nota: nota ?? undefined, avisar })
    r.estado = estado
    r.nota = nota && nota.trim() ? nota.trim() : null
    r.updatedAt = new Date().toISOString()
    editando.value = null
    const destino = BANDEJAS.find((b) => b.valor === bandejaDe(estado))!
    anuncio.value = destino.valor === filtros.bandeja ? `Sugerencia de ${r.autor}: ${ESTADOS[estado].toLowerCase()}.` : `Sugerencia de ${r.autor} movida a «${destino.texto}».`
  } catch (err) {
    error.value = messageOf(err, 'No se pudo guardar.')
  } finally {
    guardando.value = false
  }
}

function guardar(r: Sugerencia) {
  if (!editando.value || falta.value) return
  void cambiar(r, editando.value.estado, editando.value.nota, editando.value.avisar)
}

function descargar() {
  descargarExcel(libroDeSugerencias(lista.value), `sugerencias-stire-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

onMounted(cargar)
</script>
