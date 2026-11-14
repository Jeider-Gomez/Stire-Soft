<template>
  <!-- Un proyecto del Laboratorio (v3, Fase D, paso 6; cuadro «E-Laboratorio-Proyecto»): se prueba aquí mismo (corre en
       el navegador, como en Mis proyectos), «Me gusta», «Ver el código», «Hacer mi copia» y los mensajes para el autor. -->
  <div class="max-w-6xl mx-auto space-y-4">
    <nav aria-label="Ruta" class="text-[13px] text-base-texto-secundario flex flex-wrap gap-1">
      <NuxtLink to="/estudiante/proyectos" class="hover:underline">Mis proyectos</NuxtLink> ›
      <NuxtLink to="/estudiante/proyectos/laboratorio" class="hover:underline">Laboratorio</NuxtLink>
      <template v-if="pub"> › <span class="font-semibold text-base-texto-primario">{{ pub.titulo }}</span></template>
    </nav>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-sm text-base-texto-secundario">
      <Loader2 :size="16" class="animate-spin" aria-hidden="true" /> Abriendo el proyecto…
    </p>
    <MensajeError v-else-if="error && !pub" class="text-sm">{{ error }}</MensajeError>

    <div v-else-if="pub" class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px] items-start">
      <article class="tarjeta-inicio space-y-4" aria-labelledby="titulo-lab-proyecto">
        <header class="flex items-center gap-3">
          <span class="avatar-autor" aria-hidden="true">{{ pub.autor.iniciales }}</span>
          <div class="min-w-0">
            <h1 id="titulo-lab-proyecto" class="m-0 font-poppins font-bold text-[20px] leading-tight">{{ pub.titulo }}</h1>
            <p class="m-0 text-[13px] text-base-texto-secundario">
              {{ pub.esMia ? 'Tú' : pub.autor.nombre }}<template v-if="pub.clase"> · {{ pub.clase }}</template> · {{ haceCuanto(pub.updatedAt) }} · {{ textoAlcance(pub.alcance) }}
            </p>
          </div>
          <span v-if="pub.oculta" class="ml-auto pastilla-inicio pastilla-sol">Oculto: solo lo ven su autor y el profe</span>
        </header>

        <ProyectosResultadoProyecto :tipo="pub.tipo" :archivos="pub.archivos" :titulo-vista="`Vista de «${pub.titulo}»`" />

        <div class="flex flex-wrap gap-2">
          <button type="button" class="boton-lab" :aria-pressed="pub.laMarque" @click="alternar">
            <Heart :size="16" :fill="pub.laMarque ? 'currentColor' : 'none'" aria-hidden="true" /> Me gusta · {{ pub.meGusta }}
          </button>
          <button type="button" class="boton-lab" :aria-expanded="verCodigo" aria-controls="codigo-lab" @click="verCodigo = !verCodigo">
            <Code2 :size="16" aria-hidden="true" /> {{ verCodigo ? 'Ocultar el código' : 'Ver el código' }}
          </button>
          <button v-if="!pub.esMia" type="button" class="boton-tinta inline-flex" :disabled="copiando" @click="copiar">Hacer mi copia</button>
          <NuxtLink v-if="pub.esMia && pub.proyectoId" :to="`/estudiante/proyectos/${pub.proyectoId}`" class="boton-tinta inline-flex">Abrir mi proyecto</NuxtLink>
          <button v-if="pub.puedeModerar" type="button" class="boton-lab ml-auto" @click="ocultar">{{ pub.oculta ? 'Volver a mostrar' : 'Ocultar' }}</button>
        </div>

        <div v-if="verCodigo" id="codigo-lab" class="space-y-2">
          <div class="flex gap-1 overflow-x-auto" role="tablist" aria-label="Archivos">
            <button v-for="(a, i) in pub.archivos" :key="a.nombre" type="button" role="tab" :aria-selected="i === archivo" class="filtro-aprender font-mono" :aria-pressed="i === archivo" @click="archivo = i">{{ a.nombre }}</button>
          </div>
          <CodeEditor :key="archivo" :model-value="pub.archivos[archivo]?.contenido ?? ''" :language="lenguajeDeArchivo(pub.archivos[archivo]?.nombre ?? '')" read-only
            :aria-label="`Código de ${pub.archivos[archivo]?.nombre}`" min-height="14rem" />
        </div>

        <p v-if="pub.descripcion" class="m-0 text-[15px] whitespace-pre-line">{{ pub.descripcion }}</p>
        <p role="status" class="m-0 text-sm font-semibold texto-menta">{{ aviso }}</p>
        <MensajeError v-if="error" class="text-sm">{{ error }}</MensajeError>
      </article>

      <ProyectosMensajesLaboratorio :pub="pub" @comentar="comentar" @borrar="borrarMensaje" @reportar="reportar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Code2, Heart, Loader2 } from 'lucide-vue-next'
import { useLaboratorio, type DetalleLaboratorio } from '~/composables/useLaboratorio'
import { haceCuanto, textoAlcance } from '~/utils/laboratorio'
import { lenguajeDeArchivo } from '~/utils/entregas'

definePageMeta({ layout: 'student' })

const route = useRoute()
const lab = useLaboratorio()
const { messageOf } = useApiErrorMessage()
const id = Number(route.params.id)
const pub = ref<DetalleLaboratorio | null>(null)
const cargando = ref(true)
const error = ref<string | null>(null)
const aviso = ref('')
const verCodigo = ref(false)
const archivo = ref(0)
const copiando = ref(false)

async function cargar() {
  try {
    pub.value = await lab.obtener(id)
    error.value = null
  } catch (err) {
    error.value = messageOf(err, 'No se pudo abrir el proyecto.')
  } finally {
    cargando.value = false
  }
}
onMounted(cargar)

async function hacer(accion: () => Promise<unknown>, siFalla: string, recargar = true) {
  try {
    await accion()
    if (recargar) await cargar()
  } catch (err) {
    error.value = messageOf(err, siFalla)
  }
}

const alternar = () => hacer(async () => {
  const r = await lab.meGusta(id)
  if (pub.value) Object.assign(pub.value, r)
}, 'No se pudo marcar.', false)
const comentar = (texto: string) => hacer(() => lab.comentar(id, texto), 'No se pudo enviar tu mensaje.')
const borrarMensaje = (comentarioId: number) => hacer(() => lab.borrarMensaje(id, comentarioId), 'No se pudo borrar el mensaje.')
const reportar = (motivo: string) => hacer(async () => {
  await lab.reportar(id, motivo)
  aviso.value = 'Gracias: tu profe lo va a revisar.'
}, 'No se pudo enviar el reporte.')
const ocultar = () => hacer(() => lab.ocultar(id, !pub.value?.oculta), 'No se pudo cambiar.')

async function copiar() {
  copiando.value = true
  try {
    const { proyectoId } = await lab.copiar(id)
    await navigateTo(`/estudiante/proyectos/${proyectoId}`)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo hacer la copia.')
  } finally {
    copiando.value = false
  }
}
</script>

<style scoped>
.avatar-autor { flex: none; width: 44px; height: 44px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; background: rgb(var(--c-sec-lila-fondo)); color: rgb(var(--c-sec-lila-icono)); }
.boton-lab { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 12px; border: 1px solid rgb(var(--c-base-borde-fuerte)); font-size: 14px; font-weight: 700; }
.boton-lab:hover { background: rgb(var(--c-base-bg-secundario)); }
.boton-lab[aria-pressed="true"] { color: rgb(var(--c-sec-rosa-icono)); border-color: currentColor; }
</style>
