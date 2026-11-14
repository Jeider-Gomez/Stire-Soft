<template>
  <!-- Mis proyectos (v3, Fase D, paso 6; cuadros «E-Proyectos» y «E-Cel-Proyectos»): las pestañas Mis proyectos /
       Laboratorio, la franja del Laboratorio, «Nuevo proyecto» con los cuatro tipos como tarjetas y la lista. -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <ProyectosPestanas actual="mios" :cuantos="estado?.disponible ? proyectos.length : null" :nuevas="nuevas" />

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-sm text-base-texto-secundario">
      <Loader2 :size="16" class="animate-spin" aria-hidden="true" /> Cargando tus proyectos…
    </p>
    <MensajeError v-else-if="error" class="text-sm" :reintentar="cargar">{{ error }}</MensajeError>

    <section v-else-if="estado && !estado.disponible" class="tarjeta-inicio space-y-1">
      <h1 class="titulo-tarjeta">Proyectos está en prueba</h1>
      <p class="m-0 text-[15px] text-base-texto-secundario">Por ahora solo está disponible en algunas clases. Pronto lo tendrás.</p>
    </section>

    <template v-else-if="estado">
      <NuxtLink to="/estudiante/proyectos/laboratorio" class="franja-lab">
        <span class="min-w-[220px] flex-1">
          <span class="block text-[12px] font-extrabold uppercase tracking-wide texto-menta">Laboratorio</span>
          <span class="block font-poppins font-bold text-[18px] sm:text-[20px] leading-snug">Prueba lo que crean tus compañeros y muestra lo tuyo</span>
          <span class="block text-[14px] text-base-texto-secundario mt-0.5">{{ resumenLab }}</span>
        </span>
        <span v-if="autoresRecientes.length" class="hidden sm:flex -space-x-2" aria-hidden="true">
          <span v-for="a in autoresRecientes" :key="a" class="burbuja-autor">{{ a }}</span>
        </span>
        <span class="boton-tinta inline-flex flex-none whitespace-nowrap">Entrar al Laboratorio <ChevronRight :size="16" aria-hidden="true" /></span>
      </NuxtLink>

      <section class="heroe-inicio" aria-labelledby="titulo-mis-proyectos">
        <h1 id="titulo-mis-proyectos" class="m-0 font-poppins font-bold text-[24px] sm:text-[30px] leading-tight">Mis proyectos</h1>
        <p class="m-0 mt-1 text-[15px] max-w-[60ch]">Tu espacio para programar lo que quieras, sin nota ni intentos. Solo tú los ves y corren en tu navegador.</p>
        <p class="m-0 mt-3 flex flex-wrap gap-2">
          <span class="pastilla-inicio pastilla-tinta">{{ proyectos.length }} de {{ estado.limites.proyectosPorUsuario }} proyectos</span>
          <span class="pastilla-inicio pastilla-gris">{{ estado.limites.archivosPorProyecto }} archivos y 200 KB cada uno</span>
        </p>
      </section>

      <form id="nuevo-proyecto" novalidate data-recorrido="nuevo-proyecto" class="tarjeta-inicio space-y-4" @submit.prevent="crearProyecto">
        <h2 class="titulo-tarjeta">Nuevo proyecto</h2>
        <fieldset class="m-0 p-0 border-0">
          <legend class="sr-only">Tipo de proyecto</legend>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <label v-for="t in TIPOS_NUEVO" :key="t.tipo" class="tipo-nuevo" :class="`tono-${t.tipo}`">
              <input v-model="nuevo.tipo" type="radio" :value="t.tipo" name="tipo-proyecto" class="sr-only" />
              <span class="icono-tipo" aria-hidden="true"><component :is="ICONOS[t.tipo]" :size="18" /></span>
              <span class="block font-bold text-[15px] mt-2">{{ t.texto }}</span>
              <span class="hidden sm:block text-[13px] text-base-texto-secundario mt-0.5">{{ t.detalle }}</span>
            </label>
          </div>
        </fieldset>
        <div class="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div class="flex-1">
            <label for="proyecto-titulo" class="block text-sm font-bold mb-1">Nombre</label>
            <input id="proyecto-titulo" v-model="nuevo.titulo" type="text" maxlength="100" placeholder="Mi calculadora"
              class="w-full min-h-[44px] px-3 rounded-xl border border-base-borde-fuerte bg-base-blanco text-[15px]" />
          </div>
          <button type="submit" class="boton-tinta inline-flex" :disabled="creando || proyectos.length >= estado.limites.proyectosPorUsuario">
            <Plus :size="16" aria-hidden="true" /> Crear proyecto
          </button>
        </div>
        <MensajeError v-if="errorCrear" class="text-[13px]">{{ errorCrear }}</MensajeError>
      </form>

      <section aria-labelledby="lista-proyectos" class="space-y-3">
        <h2 id="lista-proyectos" class="m-0 text-[13px] font-extrabold uppercase tracking-wide text-base-texto-secundario">Tus proyectos</h2>
        <p v-if="proyectos.length === 0" class="tarjeta-inicio text-[15px] text-base-texto-secundario text-center">
          Todavía no tienes proyectos. Crea el primero arriba.
        </p>
        <ul v-else class="m-0 p-0 list-none grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <li v-for="p in proyectos" :key="p.id" class="tarjeta-proyecto">
            <span class="icono-tipo" :class="`tono-${p.tipo}`" aria-hidden="true"><component :is="ICONOS[p.tipo]" :size="18" /></span>
            <div class="min-w-0 flex-1">
              <NuxtLink :to="`/estudiante/proyectos/${p.id}`" class="block font-bold text-[16px] truncate hover:underline">{{ p.titulo }}</NuxtLink>
              <p class="m-0 text-[13px] text-base-texto-secundario">{{ TIPO_PROYECTO[p.tipo] }} · {{ kb(p.bytes) }} · editado {{ fecha(p.updatedAt) }}</p>
              <span v-if="enLab.has(p.id)" class="pastilla-inicio pastilla-lila inline-block mt-1.5">En el Laboratorio</span>
            </div>
            <div class="flex items-center gap-1 flex-none">
              <NuxtLink :to="`/estudiante/proyectos/${p.id}`" class="boton-abrir bg-base-texto-primario" :aria-label="`Abrir ${p.titulo}`">Abrir proyecto</NuxtLink>
              <button v-if="porBorrar !== p.id" type="button" class="boton-borrar" :aria-label="`Borrar ${p.titulo}`" title="Borrar" @click="porBorrar = p.id">
                <Trash2 :size="16" aria-hidden="true" />
              </button>
            </div>
            <div v-if="porBorrar === p.id" class="basis-full flex flex-wrap items-center gap-2 text-[13px]" role="group" :aria-label="`Confirmar borrar ${p.titulo}`">
              <span class="font-semibold">¿Borrar? No se puede deshacer.</span>
              <button type="button" class="px-3 min-h-[36px] rounded-lg bg-semantico-falla text-base-blanco font-bold" @click="borrar(p.id)">Sí, borrar</button>
              <button type="button" class="px-3 min-h-[36px] rounded-lg borde-afordancia" @click="porBorrar = null">No</button>
            </div>
          </li>
        </ul>
        <p class="lg:hidden m-0 text-[13px] text-base-texto-secundario">El diagrama de flujo se edita mejor en el computador; en el celular se puede ver y ejecutar.</p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Braces, ChevronRight, Globe, ListOrdered, Loader2, Plus, Trash2, Workflow } from 'lucide-vue-next'
import { TIPO_PROYECTO, TIPOS_QUE_SE_CREAN, type TipoProyecto } from '~/utils/proyectoNavegador'
import { cuantasNuevas, TIPOS_NUEVO } from '~/utils/laboratorio'
import { useProyectos, type EstadoProyectosEstudiante as Estado, type ResumenProyectoEstudiante as Resumen } from '~/composables/useProyectos'
import { useLaboratorio, type PublicacionLaboratorio } from '~/composables/useLaboratorio'

definePageMeta({ layout: 'student' })

const ICONOS = { web: Globe, javascript: Braces, pseudocodigo: ListOrdered, diagrama: Workflow } as const
const accionesProyecto = useProyectos()
const lab = useLaboratorio()
const route = useRoute()
const { messageOf } = useApiErrorMessage()
const estado = ref<Estado | null>(null)
const proyectos = ref<Resumen[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)
// Una idea del Laboratorio llega con ?nuevo=tipo&nombre=…: el formulario ya la tiene puesta.
const tipoPedido = String(route.query.nuevo ?? '') as TipoProyecto
const nuevo = reactive({ titulo: String(route.query.nombre ?? '').slice(0, 100), tipo: (TIPOS_QUE_SE_CREAN.includes(tipoPedido) ? tipoPedido : 'web') as TipoProyecto })
const creando = ref(false)
const errorCrear = ref<string | null>(null)
const porBorrar = ref<number | null>(null)

// Lo del Laboratorio (si falla, la franja queda sin cifras: Mis proyectos funciona igual).
const delLab = ref<PublicacionLaboratorio[]>([])
const enLab = ref(new Set<number>())
const nuevas = computed(() => cuantasNuevas(delLab.value, ultimaVisita()))
const autoresRecientes = computed(() => [...new Set(delLab.value.filter((p) => !p.esMia).map((p) => p.autor.iniciales))].slice(0, 4))
const resumenLab = computed(() => {
  const otros = delLab.value.filter((p) => !p.esMia).length
  if (nuevas.value) return `${nuevas.value} ${nuevas.value === 1 ? 'proyecto nuevo' : 'proyectos nuevos'} en tu clase desde tu última visita`
  if (otros) return `${otros} ${otros === 1 ? 'proyecto' : 'proyectos'} de tu clase para probar`
  return 'Sé el primero de tu clase en mostrar un proyecto'
})
function ultimaVisita(): number | null {
  try { return Number(localStorage.getItem('stire.laboratorio.ultimaVisita')) || null } catch { return null }
}

const kb = (bytes: number) => (bytes < 1024 ? 'menos de 1 KB' : `${Math.round(bytes / 1024)} KB`)
const fecha = (iso: string) => {
  const d = new Date(iso)
  const hoy = new Date().toDateString() === d.toDateString()
  return hoy ? 'hoy' : `el ${d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`
}

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    estado.value = await accionesProyecto.estado()
    if (estado.value.disponible) {
      proyectos.value = await accionesProyecto.listar()
      Promise.all([lab.listar({ alcance: 'clase' }), lab.mias()])
        .then(([lista, mias]) => { delLab.value = lista; enLab.value = new Set(mias.map((m) => m.proyectoId)) })
        .catch(() => { delLab.value = [] })
    }
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar tus proyectos.')
  } finally {
    cargando.value = false
  }
}
onMounted(cargar)

async function crearProyecto() {
  errorCrear.value = null
  if (!nuevo.titulo.trim()) { errorCrear.value = 'Ponle un nombre al proyecto.'; return }
  creando.value = true
  try {
    const creado = await accionesProyecto.crear(nuevo.titulo.trim(), nuevo.tipo)
    await navigateTo(`/estudiante/proyectos/${creado.id}`)
  } catch (err) {
    errorCrear.value = messageOf(err, 'No se pudo crear el proyecto.')
  } finally {
    creando.value = false
  }
}

async function borrar(id: number) {
  try {
    await accionesProyecto.borrar(id)
    proyectos.value = proyectos.value.filter((p) => p.id !== id)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo borrar el proyecto.')
  } finally {
    porBorrar.value = null
  }
}
</script>

<style scoped>
.franja-lab { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 18px; background: linear-gradient(90deg, rgb(var(--c-sec-menta-fondo)), rgb(var(--c-sec-cielo-fondo))); color: rgb(var(--c-base-texto-primario)); }
.franja-lab:hover .boton-tinta { filter: brightness(1.12); }
.burbuja-autor { width: 32px; height: 32px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; background: rgb(var(--c-base-blanco)); color: rgb(var(--c-base-texto-primario)); box-shadow: 0 0 0 2px rgb(var(--c-sec-menta-fondo)); }
.tipo-nuevo { display: block; padding: 14px; border-radius: 16px; border: 1px solid rgb(var(--c-base-borde-sutil)); background: rgb(var(--c-base-blanco)); cursor: pointer; transition: border-color 0.15s ease, box-shadow 0.15s ease; }
.tipo-nuevo:hover { border-color: rgb(var(--c-base-borde-fuerte)); }
.tipo-nuevo:has(input:checked) { border-color: #00c2a8; box-shadow: inset 0 0 0 1px #00c2a8; background: rgb(var(--c-sec-menta-fondo)); }
.tipo-nuevo:has(input:focus-visible) { outline: 3px solid rgb(var(--c-base-texto-primario)); outline-offset: 2px; }
.icono-tipo { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.tono-web .icono-tipo, .icono-tipo.tono-web { background: rgb(var(--c-sec-cielo-fondo)); color: rgb(var(--c-sec-cielo-icono)); }
.tono-javascript .icono-tipo, .icono-tipo.tono-javascript { background: rgb(var(--c-sec-lila-fondo)); color: rgb(var(--c-sec-lila-icono)); }
.tono-pseudocodigo .icono-tipo, .icono-tipo.tono-pseudocodigo { background: rgb(var(--c-sec-menta-fondo)); color: rgb(var(--c-semantico-pasa)); }
.tono-diagrama .icono-tipo, .icono-tipo.tono-diagrama { background: rgb(var(--c-sec-sol-fondo)); color: rgb(var(--c-sec-sol-icono)); }
.tarjeta-proyecto { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 16px; background: rgb(var(--c-base-blanco)); border: 1px solid rgb(var(--c-base-borde-sutil)); }
.boton-abrir { display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 10px; font-weight: 700; font-size: 14px; background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco)); }
.boton-abrir:hover { filter: brightness(1.12); }
.boton-borrar { width: 40px; height: 40px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: rgb(var(--c-base-texto-secundario)); }
.boton-borrar:hover { background: rgb(var(--c-base-bg-secundario)); color: rgb(var(--c-semantico-falla)); }
</style>
