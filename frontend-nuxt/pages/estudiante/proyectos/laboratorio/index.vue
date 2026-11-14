<template>
  <!-- El Laboratorio (v3, Fase D, paso 6; cuadro «E-Laboratorio»): los proyectos que cada quien decide mostrar a su clase
       o a toda la universidad. Se prueban, se les da «me gusta» y se hace una copia propia. El «Reto de la semana» del
       cuadro lo propone el docente: queda para cuando exista (pendiente P-17); aquí no se inventa. -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <div class="flex flex-wrap items-center gap-3">
      <ProyectosPestanas actual="laboratorio" :nuevas="nuevas" />
      <NuxtLink to="/estudiante/proyectos" class="boton-tinta inline-flex self-center whitespace-nowrap ml-auto">Mostrar un proyecto mío</NuxtLink>
    </div>

    <h1 class="sr-only">Laboratorio</h1>

    <div class="flex flex-wrap gap-2" role="group" aria-label="De dónde">
      <button v-for="a in ALCANCES" :key="a.valor" type="button" class="filtro-aprender" :aria-pressed="alcance === a.valor" @click="alcance = a.valor">{{ a.texto }}</button>
      <span class="w-px bg-base-borde-sutil mx-1" aria-hidden="true" />
      <button v-for="f in FILTROS_TIPO" :key="f.texto" type="button" class="filtro-aprender" :aria-pressed="tipo === f.tipo" @click="tipo = f.tipo">{{ f.texto }}</button>
    </div>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-sm text-base-texto-secundario">
      <Loader2 :size="16" class="animate-spin" aria-hidden="true" /> Abriendo el Laboratorio…
    </p>
    <MensajeError v-else-if="error" class="text-sm" :reintentar="cargar">{{ error }}</MensajeError>
    <section v-else-if="lista.length === 0" class="tarjeta-inicio text-center space-y-2">
      <p class="m-0 font-poppins font-bold text-[18px]">{{ alcance === 'clase' ? 'Todavía nadie de tu clase muestra un proyecto' : 'Todavía no hay proyectos para toda la universidad' }}</p>
      <p class="m-0 text-[15px] text-base-texto-secundario">Abre uno de tus proyectos y toca «Publicar en el Laboratorio».</p>
    </section>
    <ul v-else class="m-0 p-0 list-none grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Proyectos del Laboratorio">
      <li v-for="p in lista" :key="p.id" class="flex">
        <ProyectosTarjetaLaboratorio class="flex-1" :pub="p" :copiando="copiando === p.id" @me-gusta="alternar(p)" @copiar="copiar(p)" />
      </li>
    </ul>
    <p role="status" class="m-0 text-sm font-semibold texto-menta">{{ aviso }}</p>

    <section class="tarjeta-inicio" aria-labelledby="titulo-ideas">
      <h2 id="titulo-ideas" class="titulo-tarjeta">¿No sabes qué crear? Ideas para empezar</h2>
      <ul class="m-0 mt-3 p-0 list-none grid gap-2 md:grid-cols-3">
        <li v-for="i in IDEAS_LABORATORIO" :key="i.titulo">
          <NuxtLink :to="enlaceIdea(i)" class="idea-lab borde-control">
            <span class="text-[24px]" aria-hidden="true">{{ i.emoji }}</span>
            <span class="min-w-0 flex-1">
              <span class="block font-bold text-[15px]">{{ i.titulo }}</span>
              <span class="block text-[13px] text-base-texto-secundario">{{ i.pista }}</span>
            </span>
            <ChevronRight :size="16" class="flex-none text-base-texto-secundario" aria-hidden="true" />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <section class="como-funciona" aria-labelledby="titulo-como-funciona">
      <h2 id="titulo-como-funciona" class="m-0 text-[15px] font-bold">Cómo funciona el Laboratorio</h2>
      <p class="m-0 mt-1 text-[14px] text-base-texto-secundario">
        Aquí se muestran los proyectos que cada quien decide compartir, con su clase o con toda la universidad. Puedes
        probarlos y hacer tu propia copia para cambiarlos. No cuenta para la nota, y el profe puede quitar algo que no esté bien.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Loader2 } from 'lucide-vue-next'
import { useLaboratorio, type PublicacionLaboratorio } from '~/composables/useLaboratorio'
import { cuantasNuevas, enlaceIdea, FILTROS_TIPO, IDEAS_LABORATORIO, type AlcanceLaboratorio } from '~/utils/laboratorio'
import type { TipoProyecto } from '~/utils/proyectoNavegador'
import { useStudentStore } from '~/stores/student'

definePageMeta({ layout: 'student' })

const ALCANCES: ReadonlyArray<{ valor: AlcanceLaboratorio; texto: string }> = [
  { valor: 'clase', texto: 'Mi clase' },
  { valor: 'universidad', texto: 'Toda la Universidad' },
]
const CLAVE_VISITA = 'stire.laboratorio.ultimaVisita'
const lab = useLaboratorio()
const studentStore = useStudentStore()
const { messageOf } = useApiErrorMessage()

const alcance = ref<AlcanceLaboratorio>('clase')
const tipo = ref<TipoProyecto | null>(null)
const lista = ref<PublicacionLaboratorio[]>([])
const cargando = ref(true)
const error = ref<string | null>(null)
const aviso = ref('')
const copiando = ref<number | null>(null)

// «N nuevos» cuenta desde la visita anterior; al salir, esta visita pasa a ser la última.
let visitaAnterior: number | null = null
const nuevas = ref(0)
onMounted(() => {
  try { visitaAnterior = Number(localStorage.getItem(CLAVE_VISITA)) || null } catch { visitaAnterior = null }
})
onBeforeUnmount(() => {
  try { localStorage.setItem(CLAVE_VISITA, String(Date.now())) } catch { /* sin almacenamiento, no hay «nuevos» */ }
})

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    if (!studentStore.hasLoaded) await studentStore.fetchStudentData()
    lista.value = await lab.listar({ alcance: alcance.value, classId: alcance.value === 'clase' ? studentStore.currentClassId : null, tipo: tipo.value })
    if (alcance.value === 'clase' && !tipo.value) nuevas.value = cuantasNuevas(lista.value, visitaAnterior)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo abrir el Laboratorio.')
  } finally {
    cargando.value = false
  }
}
onMounted(cargar)
watch([alcance, tipo], cargar)

async function alternar(p: PublicacionLaboratorio) {
  try {
    const r = await lab.meGusta(p.id)
    p.laMarque = r.laMarque
    p.meGusta = r.meGusta
  } catch (err) {
    aviso.value = messageOf(err, 'No se pudo marcar.')
  }
}

async function copiar(p: PublicacionLaboratorio) {
  copiando.value = p.id
  try {
    const { proyectoId } = await lab.copiar(p.id)
    await navigateTo(`/estudiante/proyectos/${proyectoId}`)
  } catch (err) {
    aviso.value = messageOf(err, 'No se pudo hacer la copia.')
  } finally {
    copiando.value = null
  }
}
</script>

<style scoped>
.idea-lab { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 10px 14px; border-radius: 14px; border: 1px solid rgb(var(--c-base-borde-sutil)); }
.idea-lab:hover { background: rgb(var(--c-base-bg-secundario)); }
.como-funciona { padding: 14px 18px; border-radius: 16px; border: 1px dashed rgb(var(--c-base-borde-fuerte)); }
</style>
