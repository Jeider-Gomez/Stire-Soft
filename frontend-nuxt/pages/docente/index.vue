<template>
  <div class="max-w-5xl mx-auto space-y-7">

    <!-- Inicio como en el prototipo del panel v2: saludo con el resumen, «Por revisar» de todas las clases y «Mis clases»
         en tarjetas o lista (utils/inicioDocente.ts). Las cuatro tarjetas de cifras pasaron al resumen y a «Por revisar». -->
    <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-poppins font-bold text-base-texto-primario tracking-tight">{{ saludo(new Date().getHours()) }}{{ nombre ? `, ${nombre}` : '' }}</h1>
        <p class="text-sm text-base-texto-secundario mt-1">{{ isLoading ? 'Cargando tus clases…' : resumenInicio(clasesActivas) }}</p>
      </div>
      <div class="flex flex-wrap gap-2 self-start sm:self-auto">
      <NuxtLink to="/docente/biblioteca" class="btn-stire-secondary min-h-[44px]">Explorar la biblioteca</NuxtLink>
      <button id="abrir-crear-clase" @click="openCreateModal" class="btn-stire-primary min-h-[44px]">
        <Plus :size="15" aria-hidden="true" />
        Crear clase
      </button>
      </div>
    </header>

    <!-- Encuesta de usabilidad SUS (UX-08): solo si lleva unos días usando STIRE y no la ha respondido -->
    <InvitacionEncuesta ruta="/docente/encuesta" />

    <DocenteInicioPorRevisar v-if="!isLoading && classes.length > 0" :items="porRevisar(clasesActivas, unreadMessages)" :colores="colores" />

    <!-- Notificación de éxito -->
    <Transition enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div
        v-if="successMessage"
        class="p-3.5 bg-stire-success/10 border border-stire-success/30 text-emerald-700 rounded-xl text-xs flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2">
          <Check :size="14" />
          <span>{{ successMessage }}</span>
        </div>
        <button @click="successMessage = null" class="text-[11px] underline opacity-70 hover:opacity-100">Cerrar</button>
      </div>
    </Transition>

    <!-- Cargando -->
    <div
      v-if="isLoading"
      class="p-14 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200"
    >
      <div class="inline-block w-6 h-6 border-2 border-stire-blue border-t-transparent rounded-full animate-spin mb-3" />
      <p>Cargando tus clases académicas…</p>
    </div>

    <!-- Sin clases -->
    <div
      v-else-if="classes.length === 0"
      class="p-14 text-center bg-white rounded-2xl border border-slate-200 space-y-4"
    >
      <div class="w-16 h-16 rounded-2xl gradient-stire flex items-center justify-center mx-auto shadow-md">
        <BookOpen :size="28" class="text-white" />
      </div>
      <div>
        <p class="font-poppins font-bold text-slate-800">Aún no tienes clases creadas</p>
        <p class="text-sm text-slate-500 mt-1">Crea tu primera clase y comparte el código con tus estudiantes.</p>
      </div>
      <button @click="openCreateModal" class="btn-stire-primary mx-auto">
        <Plus :size="15" />
        Crear mi primera clase
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         BUSCADOR + CONTADOR
    ═══════════════════════════════════════════════════════ -->
    <div v-else class="flex flex-wrap items-center gap-3">
      <h2 class="text-base font-poppins font-bold text-base-texto-primario mr-auto">Mis clases</h2>
      <div class="relative flex-1 min-w-[12rem] max-w-xs">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar clase por código o nombre…"
          class="input-stire pl-9"
        />
        <Search :size="12" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" aria-hidden="true" />
      </div>
      <p class="text-xs text-slate-500 whitespace-nowrap">
        Mostrando {{ filteredClasses.length }} de {{ classes.length }} clase{{ classes.length !== 1 ? 's' : '' }}
      </p>
      <div role="group" aria-label="Cómo ver tus clases" class="seg relative inline-flex p-0.5 rounded-full bg-base-bg-secundario border border-base-borde-sutil text-xs font-semibold">
        <span aria-hidden="true" class="seg-pulgar absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-base-blanco shadow-sm transition-transform duration-200 motion-reduce:transition-none" :class="{ 'translate-x-full': vista === 'lista' }" />
        <button v-for="v in (['tarjetas', 'lista'] as const)" :key="v" type="button" class="relative min-h-[36px] px-3.5 rounded-full capitalize"
          :class="vista === v ? 'text-base-texto-primario' : 'text-base-texto-secundario'" :aria-pressed="vista === v" @click="elegirVista(v)">{{ v }}</button>
      </div>
    </div>
    <!-- Filtro por programa: solo si enseña en más de uno -->
    <div v-if="!isLoading && programasDelDocente.length > 1" role="group" aria-label="Filtrar por programa" class="flex flex-wrap gap-2 text-xs">
      <button v-for="p in [{ id: null, nombre: 'Todos los programas' }, ...programasDelDocente]" :key="p.id ?? 'todos'" type="button"
        class="min-h-[44px] px-3 rounded-full border"
        :class="programaFiltro === p.id ? 'border-acento-ambar-fuerte bg-acento-ambar/10 font-semibold' : 'border-base-borde-fuerte'"
        :aria-pressed="programaFiltro === p.id" @click="programaFiltro = p.id">
        {{ p.nombre }}
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         TARJETAS DE CLASES
    ═══════════════════════════════════════════════════════ -->
    <section v-if="!isLoading && classes.length > 0" data-recorrido="clases" class="space-y-5">
      <div v-if="vista === 'tarjetas'" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DocenteInicioTarjetaClase v-for="cls in filteredClasses" :key="cls.id" :cls="cls" :color="colores[cls.id]" :sigla="siglas[cls.id]"
          :copiado="copiedCode === cls.code" @copiar="copyCode" @qr="openQrModal" />
        <button type="button" class="min-h-[240px] rounded-2xl border-2 border-dashed border-base-borde-fuerte text-stire-blue font-semibold flex flex-col items-center justify-center gap-1 hover:bg-stire-blue/5 transition-colors" @click="openCreateModal">
          <Plus :size="20" aria-hidden="true" />Crear clase
          <small class="font-normal text-xs text-base-texto-secundario px-6 text-center">En blanco, desde otra clase tuya o desde una plantilla</small>
        </button>
      </div>
      <DocenteInicioListaClases v-else :clases="filteredClasses" :colores="colores" :siglas="siglas" />
      <!-- Periodos anteriores, plegados: no estorban, pero siguen a un clic -->
      <button v-if="organizacion.anteriores > 0" type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" :aria-expanded="verAnteriores" @click="verAnteriores = true">
        Ver {{ organizacion.anteriores === 1 ? 'la clase' : `las ${organizacion.anteriores} clases` }} de periodos anteriores
      </button>
      <button v-else-if="verAnteriores" type="button" class="min-h-[44px] text-xs font-semibold text-acento-ambar-fuerte hover:underline" :aria-expanded="true" @click="verAnteriores = false">
        Ocultar periodos anteriores
      </button>

      <!-- Clases archivadas (N) plegadas, con Restaurar (B4) -->
      <div v-if="clasesArchivadas.length > 0" class="rounded-xl border border-dashed border-base-borde-fuerte p-4 bg-base-bg-secundario/40 space-y-2 mt-4">
        <details class="group text-xs">
          <summary class="cursor-pointer font-bold text-base-texto-secundario hover:text-base-texto-primario list-none flex items-center justify-between p-1">
            <span class="flex items-center gap-2">
              <Archive :size="16" aria-hidden="true" />
              <span>Clases archivadas ({{ clasesArchivadas.length }})</span>
            </span>
            <ChevronRight :size="16" class="transition-transform group-open:rotate-90" aria-hidden="true" />
          </summary>
          <div class="mt-3 space-y-2 pt-2 border-t border-base-borde-sutil">
            <div
              v-for="c in clasesArchivadas"
              :key="c.id"
              class="flex items-center justify-between gap-3 p-3 bg-base-blanco rounded-lg border border-base-borde-sutil text-xs"
            >
              <div class="min-w-0">
                <p class="font-bold text-base-texto-primario truncate">{{ c.name }} <span class="font-mono text-xs text-base-texto-secundario">({{ c.code }})</span></p>
                <p class="text-[11px] text-base-texto-secundario">Archivada · Los estudiantes no pueden acceder</p>
              </div>
              <button
                type="button"
                class="min-h-[36px] px-3 py-1 rounded text-xs font-semibold border border-base-borde-fuerte hover:bg-base-bg-secundario text-base-texto-primario inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte"
                @click="restaurarClase(c)"
              >
                <RotateCcw :size="13" aria-hidden="true" />
                Restaurar
              </button>
            </div>
          </div>
        </details>
      </div>
    </section>

    <!-- Ventanas: crear una clase y mostrar su QR (components/docente/), sobre la base de ventanas común. -->
    <DocenteVentanaCrearClase v-if="creando" :plantilla-inicial="plantillaInicial" @cerrar="creando = false; plantillaInicial = null" @creada="alCrear" />
    <DocenteVentanaQrClase v-if="qr" :codigo="qr.codigo" :nombre="qr.nombre" @cerrar="qr = null" />

  </div>
</template>

<script setup lang="ts">
// Inicio del docente: sus clases organizadas por periodo y programa, las cifras de todas y el acceso a cada una. Los datos
// y la API están en composables/useClasesDocente.ts; crear una clase y el QR, en sus ventanas (PAT-01 y PAT-04; antes
// 826 líneas con las dos ventanas dentro).
import { computed, onMounted, provide, ref } from 'vue'
import { organizarClases, programasDeLasClases } from '~/utils/organizarClases'
import { siglasDeClases } from '~/utils/contextoAcademico'
import { colorDeClase } from '~/utils/pestanasClase'
import { CLAVE_VISTA_CLASES, porRevisar, primerNombre, resumenInicio, saludo, vistaGuardada, type VistaClases } from '~/utils/inicioDocente'
import { useAuthStore } from '~/stores/auth'
import { Archive, BookOpen, Check, ChevronRight, Plus, RotateCcw, Search } from 'lucide-vue-next'
import { CLAVE_CLASES_DOCENTE, useClasesDocente, type ClaseDelDocente } from '~/composables/useClasesDocente'

definePageMeta({ layout: 'teacher' })

const estado = useClasesDocente()
provide(CLAVE_CLASES_DOCENTE, estado)
const { clases: classes, cargando: isLoading, noLeidos: unreadMessages } = estado
const nombre = computed(() => primerNombre(useAuthStore().user?.fullName))
// Color y sigla iguales a los del menú lateral (ClasesDelMenu.vue): por el orden de todas las clases.
const colores = computed(() => Object.fromEntries(classes.value.map((c, i) => [c.id, c.portada ?? colorDeClase(i)])) as Record<number, string>)
const siglas = computed(() => siglasDeClases(classes.value))
const vista = ref<VistaClases>('tarjetas')
function elegirVista(v: VistaClases) {
  vista.value = v
  try { localStorage.setItem(CLAVE_VISTA_CLASES, v) } catch { /* sin almacenamiento: solo por esta visita */ }
}

const successMessage = ref<string | null>(null)
const copiedCode = ref<string | null>(null)
const searchQuery = ref('')

// Cuando pasan los semestres (utils/organizarClases.ts): el periodo vigente a la vista, los anteriores plegados y un
// filtro por programa solo si enseña en más de uno. Al buscar, se busca en todo.
const programaFiltro = ref<number | null>(null)
const verAnteriores = ref(false)
const clasesActivas = computed(() => classes.value.filter((c) => c.isActive !== false))
const clasesArchivadas = computed(() => classes.value.filter((c) => c.isActive === false))
const programasDelDocente = computed(() => programasDeLasClases(clasesActivas.value))
const organizacion = computed(() => organizarClases(clasesActivas.value, { texto: searchQuery.value, programaId: programaFiltro.value, verAnteriores: verAnteriores.value }))
const filteredClasses = computed(() => organizacion.value.visibles)

async function restaurarClase(cls: ClaseDelDocente) {
  await estado.restaurarClase(cls.id)
}

// Ventanas
const creando = ref(false)
const plantillaInicial = ref<number | null>(null)
const qr = ref<{ codigo: string; nombre: string } | null>(null)
const openCreateModal = () => { creando.value = true }
const openQrModal = (cls: ClaseDelDocente) => { qr.value = { codigo: cls.code, nombre: cls.name } }
function alCrear(aviso: string) {
  creando.value = false
  successMessage.value = aviso
  setTimeout(() => { if (successMessage.value === aviso) successMessage.value = null }, aviso.includes('no se pudo copiar') ? 10000 : 5000)
}

function copyCode(code: string) {
  if (!navigator?.clipboard) return
  void navigator.clipboard.writeText(code)
  copiedCode.value = code
  setTimeout(() => { if (copiedCode.value === code) copiedCode.value = null }, 2500)
}

onMounted(() => {
  try { vista.value = vistaGuardada(localStorage.getItem(CLAVE_VISTA_CLASES)) } catch { /* se queda en tarjetas */ }
  const q = useRoute().query
  if (q.crear) creando.value = true // «Crear clase» del menú lateral (ClasesDelMenu.vue) o de la Biblioteca
  if (Number(q.plantilla) > 0) plantillaInicial.value = Number(q.plantilla)
  void estado.cargarPlantillas(); void estado.cargarClases(); void estado.cargarNoLeidos()
})
</script>
