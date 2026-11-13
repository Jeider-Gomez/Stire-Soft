<template>
  <!-- «Otras formas de verla» (v3, Fase D, paso 2; cuadros «E-Leccion» y «E-Leccion-Cerrado»): las puertas a la misma
       idea que la lección sí trae (diagrama, ejemplo en vivo, video o recurso) y las explicaciones extra que dejó el
       docente. Solo las que existen (Pedro, S09-V-PEDRO: no ofrecer un diagrama que no hay); cada una lleva a su sitio.
       Al lado, se recoge a una columna de íconos y se recuerda; en pantallas angostas va como una fila bajo el título. -->
  <div v-if="formas.length" :class="modo === 'lado' ? 'sticky top-32 self-start' : ''">
    <div v-if="modo === 'fila'" role="group" aria-label="Otras formas de verla" class="flex flex-wrap items-center gap-2">
      <span class="text-[13px] font-bold mr-0.5">Verla también como</span>
      <button v-for="f in formas" :key="f.clave" type="button" class="forma-pastilla" @click="ir(f)">
        <component :is="f.icono" :size="15" aria-hidden="true" /> {{ f.corto }}
      </button>
    </div>

    <aside v-else-if="!recogido" aria-label="Otras formas de verla" class="tarjeta-leccion w-[280px] p-4">
      <div class="flex items-start gap-2">
        <p class="flex-1 m-0">
          <span class="block text-xs font-bold uppercase text-base-texto-secundario">Otras formas de verla · {{ formas.length }}</span>
          <span class="block text-[13px] text-base-texto-secundario">La misma idea, contada de otra manera</span>
        </p>
        <button type="button" class="w-9 h-9 -mt-1 -mr-1 shrink-0 rounded-lg border border-base-borde-sutil inline-flex items-center justify-center hover:bg-base-bg-secundario"
          aria-label="Recoger otras formas de verla" title="Recoger" @click="alternar">
          <PanelRightClose :size="16" aria-hidden="true" />
        </button>
      </div>
      <ul class="m-0 mt-3 p-0 list-none flex flex-col gap-2">
        <li v-for="f in formas" :key="f.clave">
          <button type="button" class="forma-fila w-full text-left" @click="ir(f)">
            <span class="forma-icono" :class="f.color" aria-hidden="true"><component :is="f.icono" :size="18" /></span>
            <span class="min-w-0">
              <span class="block text-[11px] font-bold uppercase" :class="f.colorTexto">{{ f.tipo }}</span>
              <span class="block text-sm font-bold leading-snug">{{ f.texto }}</span>
            </span>
          </button>
        </li>
      </ul>
    </aside>

    <aside v-else aria-label="Otras formas de verla (recogidas)">
      <button type="button" class="tarjeta-leccion w-16 py-3 flex flex-col items-center gap-2.5 hover:shadow-md transition-shadow"
        :aria-label="`Abrir otras formas de verla: ${formas.length}`" @click="alternar">
        <span class="w-9 h-9 rounded-lg border border-base-borde-sutil inline-flex items-center justify-center" aria-hidden="true"><PanelRightOpen :size="16" /></span>
        <span v-for="f in formas" :key="f.clave" class="forma-icono" :class="f.color" aria-hidden="true"><component :is="f.icono" :size="18" /></span>
        <span class="texto-vertical text-[13px] font-bold mt-1" aria-hidden="true">Otras formas · {{ formas.length }}</span>
      </button>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { BookOpenText, PanelRightClose, PanelRightOpen, PlayCircle, Sparkles, Workflow } from 'lucide-vue-next'
import type { Component } from 'vue'
import { FORMAS } from '~/utils/formasLeccion'

const props = defineProps<{
  modo: 'lado' | 'fila'
  /** Las explicaciones extra del docente que ya se ven en la lección («Otra forma de verlo»). */
  alternativas: ReadonlyArray<{ id: number; title: string }>
  /** Cambia cuando cambia el contenido, para volver a mirar qué formas trae la página. */
  version: number
}>()

interface Forma { clave: string; selector: string; tipo: string; texto: string; corto: string; icono: Component; color: string; colorTexto: string }
const ESTILO: Record<string, Pick<Forma, 'tipo' | 'corto' | 'icono' | 'color' | 'colorTexto'>> = {
  '[data-forma="algoritmo"]': { tipo: 'Diagrama', corto: 'Diagrama o paso a paso', icono: Workflow, color: 'forma-sol', colorTexto: 'texto-sol' },
  '[data-forma="vivo"]': { tipo: 'Ejemplo en vivo', corto: 'Ejemplo en vivo', icono: Sparkles, color: 'forma-lila', colorTexto: 'texto-lila' },
  '[data-forma="recurso"]': { tipo: 'Video o recurso', corto: 'Video o recurso', icono: PlayCircle, color: 'forma-rosa', colorTexto: 'texto-rosa' },
}

const hay = ref<string[]>([])
const formas = computed<Forma[]>(() => [
  ...FORMAS.filter((f) => ESTILO[f.selector] && hay.value.includes(f.selector))
    .map((f) => ({ clave: f.selector, selector: f.selector, texto: f.texto, ...ESTILO[f.selector] })),
  ...props.alternativas.map((a) => ({
    clave: `alt-${a.id}`, selector: `#bloque-${a.id}`, tipo: 'Otra explicación', texto: a.title || 'Otra forma de verlo',
    corto: a.title || 'Otra explicación', icono: BookOpenText, color: 'forma-menta', colorTexto: 'texto-menta',
  })),
])

function mirar() {
  nextTick(() => { hay.value = Object.keys(ESTILO).filter((s) => document.querySelector(`#explicacion ${s}`)) })
}
onMounted(mirar)
watch(() => props.version, mirar)

/** Lleva a esa forma dentro de la lección y le pasa el foco (también para el lector de pantalla). */
function ir(f: Forma) {
  const el = document.querySelector<HTMLElement>(`#explicacion ${f.selector}`) ?? document.querySelector<HTMLElement>(f.selector)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

const CLAVE = 'stire-otras-formas-recogidas'
const recogido = ref(false)
onMounted(() => { try { recogido.value = localStorage.getItem(CLAVE) === '1' } catch { /* sin almacenamiento */ } })
function alternar() {
  recogido.value = !recogido.value
  try { localStorage.setItem(CLAVE, recogido.value ? '1' : '0') } catch { /* sin almacenamiento */ }
}
</script>

<style scoped>
.forma-fila { display: flex; gap: 12px; align-items: center; min-height: 44px; padding: 10px; border-radius: 14px; border: 1px solid rgb(var(--c-base-borde-sutil)); background: rgb(var(--c-base-blanco)); transition: border-color 0.15s ease, transform 0.15s ease; }
.forma-fila:hover { border-color: rgb(var(--c-base-borde-fuerte)); }
.forma-fila:active { transform: scale(0.99); }
.forma-icono { width: 40px; height: 40px; flex: none; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.forma-pastilla { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 12px; border-radius: 999px; font-size: 13px; font-weight: 600; background: rgb(255 255 255 / 0.85); color: #14213d; }
.forma-pastilla:hover { background: #fff; }
:root[data-tema='oscuro'] .forma-pastilla { background: rgb(255 255 255 / 0.12); color: rgb(var(--c-base-texto-primario)); }
.forma-sol { background: rgb(var(--c-sec-sol-fondo)); color: rgb(var(--c-sec-sol-icono)); }
.forma-lila { background: rgb(var(--c-sec-lila-fondo)); color: rgb(var(--c-sec-lila-icono)); }
.forma-rosa { background: rgb(var(--c-sec-rosa-fondo)); color: rgb(var(--c-sec-rosa-icono)); }
.forma-menta { background: rgb(var(--c-sec-menta-fondo)); color: rgb(var(--c-sec-menta-icono)); }
.texto-sol { color: rgb(var(--c-sec-sol-icono)); }
.texto-lila { color: rgb(var(--c-sec-lila-icono)); }
.texto-rosa { color: rgb(var(--c-sec-rosa-icono)); }
.texto-vertical { writing-mode: vertical-rl; transform: rotate(180deg); }
</style>
