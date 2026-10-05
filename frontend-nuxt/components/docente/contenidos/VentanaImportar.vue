<template>
  <!-- Traer contenido de otra clase propia o de una plantilla de otro docente (T3; utils/plantillas.ts). Se copia sin
       publicar; no se copian estudiantes ni notas. -->
  <AdminDialogo id-titulo="importar-titulo" titulo="Traer contenido de otra clase" subtitulo="Se copia sin publicar. No se copian estudiantes ni notas."
    devolver-foco="abrir-importar" :ocupado="importando" @cerrar="emit('cerrar')">
    <template #icono><CopyPlus :size="18" aria-hidden="true" /></template>
    <div class="space-y-1 text-xs">
      <label for="import-source-class" class="font-semibold text-base-texto-primario block">De dónde</label>
      <select id="import-source-class" v-model="origenId" data-foco-inicial
        class="w-full min-h-[44px] bg-base-blanco text-base-texto-primario border border-base-borde-fuerte rounded-md px-3 outline-none focus:border-acento-ambar-fuerte"
        @change="cargarModulos">
        <optgroup v-if="otrasClases.length" label="Mis clases">
          <option v-for="c in otrasClases" :key="c.id" :value="c.id">{{ c.name }} ({{ c.code }})</option>
        </optgroup>
        <!-- Plantillas de otros docentes, agrupadas por asignatura: primero la de esta clase (§2.3) -->
        <optgroup v-for="g in gruposDePlantillas" :key="g.clave" :label="`${g.titulo} · ${cuantosEnfoques(g)}`">
          <option v-for="p in g.plantillas" :key="`p${p.classId}`" :value="p.classId">{{ textoPlantilla(p) }}</option>
        </optgroup>
      </select>
    </div>

    <fieldset class="text-xs space-y-2 max-h-[260px] overflow-y-auto border border-base-borde-sutil rounded-lg p-3 bg-base-bg-secundario/30">
      <legend class="sr-only">Módulos a traer</legend>
      <div class="flex items-center justify-between pb-2 border-b border-base-borde-sutil text-[11px] font-semibold text-slate-700">
        <span>Módulos a traer ({{ elegidos.length }} de {{ modulosOrigen.length }})</span>
        <span class="flex gap-1">
          <button type="button" class="min-h-[44px] sm:min-h-[32px] px-2 text-acento-ambar-fuerte hover:underline" @click="elegidos = modulosOrigen.map((m) => m.id)">Todos</button>
          <button type="button" class="min-h-[44px] sm:min-h-[32px] px-2 text-slate-700 hover:underline" @click="elegidos = []">Ninguno</button>
        </span>
      </div>
      <p v-if="cargando" role="status" class="p-4 text-center text-base-texto-secundario"><Loader2 :size="14" class="inline-block animate-spin mr-2" aria-hidden="true" /> Cargando módulos…</p>
      <p v-else-if="!modulosOrigen.length" class="p-4 text-center text-base-texto-secundario">Esta clase no tiene módulos para traer.</p>
      <label v-for="m in modulosOrigen" v-else :key="m.id" class="flex items-center gap-2.5 min-h-[44px] px-2 rounded hover:bg-base-blanco cursor-pointer">
        <input v-model="elegidos" type="checkbox" :value="m.id" class="accent-acento-ambar-fuerte" />
        <span class="font-medium text-base-texto-primario">Módulo {{ m.order || '—' }}: {{ m.title }}</span>
      </label>
    </fieldset>

    <p v-if="error" role="alert" class="text-semantico-falla text-xs">{{ error }}</p>
    <div class="flex items-center justify-end gap-2">
      <button type="button" class="min-h-[44px] px-4 rounded-md borde-afordancia text-xs font-semibold" :disabled="importando" @click="emit('cerrar')">Cancelar</button>
      <button type="button" :disabled="importando || !origenId || !elegidos.length"
        class="min-h-[44px] px-5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar disabled:opacity-50 inline-flex items-center gap-2" @click="traer">
        <Loader2 v-if="importando" :size="14" class="animate-spin" aria-hidden="true" />
        {{ importando ? 'Copiando…' : 'Traer contenido' }}
      </button>
    </div>
  </AdminDialogo>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { CopyPlus, Loader2 } from 'lucide-vue-next'
import { CLAVE_CONTENIDOS } from '~/composables/useContenidosCurso'
import { agruparPorAsignatura, cuantosEnfoques, textoPlantilla } from '~/utils/plantillas'

const emit = defineEmits<{ cerrar: [] }>()
const estado = inject(CLAVE_CONTENIDOS)
if (!estado) throw new Error('VentanaImportar necesita useContenidosCurso() con provide(CLAVE_CONTENIDOS).')
const { otrasClases, plantillas, modulosDeOrigen, importar } = estado

const gruposDePlantillas = computed(() => agruparPorAsignatura(plantillas.value))
const origenId = ref<number | null>(otrasClases.value[0]?.id ?? plantillas.value[0]?.classId ?? null)
const modulosOrigen = ref<Array<{ id: number; title: string; order: number }>>([])
const elegidos = ref<number[]>([])
const cargando = ref(false)
const importando = ref(false)
const error = ref<string | null>(null)
const { messageOf } = useApiErrorMessage()

async function cargarModulos() {
  modulosOrigen.value = []
  elegidos.value = []
  if (!origenId.value) return
  cargando.value = true
  error.value = null
  try {
    modulosOrigen.value = await modulosDeOrigen(origenId.value)
    elegidos.value = modulosOrigen.value.map((m) => m.id)
  } catch (err: unknown) {
    error.value = messageOf(err, 'No se pudieron cargar los módulos de esa clase.')
  } finally {
    cargando.value = false
  }
}

async function traer() {
  if (!origenId.value || !elegidos.value.length) return
  importando.value = true
  // Si van todos, no se mandan los ids (el servidor trae la clase completa).
  error.value = await importar(origenId.value, elegidos.value.length === modulosOrigen.value.length ? null : elegidos.value)
  importando.value = false
  if (!error.value) emit('cerrar')
}

onMounted(cargarModulos)
</script>
