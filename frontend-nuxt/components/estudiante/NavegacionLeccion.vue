<!-- Moverse entre lecciones en el celular (12/10, Jeider: «no hay un botón para la siguiente lección y elegir no está tan
     desarrollado como en el PC»). Una barra abajo, en la zona del pulgar, con anterior, «Lecciones» (el plan entero en una
     hoja, como el menú lateral del computador), siguiente y el Tutor. Se esconde al bajar leyendo y vuelve al subir, para
     dejar la pantalla a la lección (como la barra de YouTube o de Chrome). En computador no se muestra: allí está el menú.
     utils/navegacionLeccion.ts. -->
<template>
  <div class="md:hidden">
    <nav
      aria-label="Lecciones"
      class="barra-leccion fixed inset-x-0 bottom-0 z-30 bg-base-blanco/95 border-t border-base-borde-sutil shadow-[0_-4px_12px_rgba(15,23,42,0.06)] transition-transform duration-200"
      :class="oculta && !hojaAbierta ? 'translate-y-full' : 'translate-y-0'">
      <div class="flex items-stretch gap-1 px-2 pt-1.5">
        <NuxtLink v-if="nav.anterior" :to="`/estudiante/unidad/${nav.anterior.id}`" class="boton-barra" :aria-label="`Lección anterior: ${nav.anterior.titulo}`">
          <ChevronLeft :size="20" aria-hidden="true" /><span>Anterior</span>
        </NuxtLink>
        <span v-else class="boton-barra opacity-40" aria-hidden="true"><ChevronLeft :size="20" /><span>Anterior</span></span>

        <button type="button" class="boton-barra flex-[1.4]" :aria-expanded="hojaAbierta" aria-controls="hoja-lecciones" @click="hojaAbierta = true">
          <ListOrdered :size="20" aria-hidden="true" />
          <span>{{ nav.posicion ? `Lección ${nav.posicion.n} de ${nav.posicion.total}` : 'Lecciones' }}</span>
        </button>

        <NuxtLink v-if="nav.siguiente" :to="`/estudiante/unidad/${nav.siguiente.id}`" class="boton-barra" :aria-label="`Siguiente lección: ${nav.siguiente.titulo}${nav.siguiente.abierta ? '' : ' (módulo cerrado)'}`">
          <component :is="nav.siguiente.abierta ? ChevronRight : Lock" :size="20" aria-hidden="true" /><span>Siguiente</span>
        </NuxtLink>
        <span v-else class="boton-barra opacity-40" aria-hidden="true"><ChevronRight :size="20" /><span>Siguiente</span></span>

        <button v-if="!tutorStore.isOpen" id="tutor-barra" type="button" class="boton-barra text-stire-purple" aria-label="Abrir el Tutor IA" @click="tutorStore.openDrawer()">
          <Sparkles :size="20" aria-hidden="true" /><span>Tutor</span>
        </button>
      </div>
    </nav>

    <!-- La hoja con el plan del curso: cada módulo con sus lecciones, su estado y, si está cerrado, qué lo abre. -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-active-class="transition-opacity duration-100" leave-to-class="opacity-0">
        <div v-if="hojaAbierta" class="fixed inset-0 z-[60] bg-base-texto-primario/30 md:hidden" aria-hidden="true" @click="hojaAbierta = false" />
      </Transition>
      <Transition enter-active-class="transition-transform duration-200 ease-out" enter-from-class="translate-y-full" leave-active-class="transition-transform duration-150 ease-in" leave-to-class="translate-y-full">
        <div v-if="hojaAbierta" id="hoja-lecciones" role="dialog" aria-modal="true" aria-labelledby="titulo-hoja-lecciones"
          class="fixed inset-x-0 bottom-0 z-[61] md:hidden max-h-[80dvh] flex flex-col bg-base-blanco rounded-t-2xl shadow-2xl">
          <div class="px-4 pt-2 pb-2 border-b border-base-borde-sutil shrink-0">
            <div class="mx-auto mb-2 w-10 h-1 rounded-full bg-base-borde-fuerte" aria-hidden="true" />
            <div class="flex items-center gap-2">
              <h2 id="titulo-hoja-lecciones" class="flex-1 text-sm font-bold text-base-texto-primario">Plan del curso</h2>
              <button ref="cerrarRef" type="button" class="min-w-[44px] min-h-[44px] -my-2 -mr-2 inline-flex items-center justify-center rounded-md hover:bg-base-bg-secundario" @click="hojaAbierta = false">
                <X :size="18" aria-hidden="true" /><span class="sr-only">Cerrar el plan del curso</span>
              </button>
            </div>
          </div>
          <div class="overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            <section v-for="m in nav.modulos" :key="m.id" :aria-labelledby="`hoja-mod-${m.id}`" class="py-2">
              <h3 :id="`hoja-mod-${m.id}`" class="px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-base-texto-secundario flex items-center gap-1.5">
                <Lock v-if="!m.abierto" :size="12" aria-hidden="true" />{{ m.titulo }}<span v-if="!m.abierto" class="sr-only"> (cerrado)</span>
              </h3>
              <p v-if="m.requiere" class="mx-4 mb-1 px-2.5 py-1.5 rounded-md bg-acento-ambar/10 text-[11px] text-base-texto-primario">{{ m.requiere }}</p>
              <ul>
                <li v-for="l in m.lecciones" :key="l.id">
                  <NuxtLink :to="`/estudiante/unidad/${l.id}`" :aria-current="l.actual ? 'page' : undefined"
                    class="flex items-center gap-3 min-h-[48px] px-4 py-2 text-sm"
                    :class="l.actual ? 'bg-acento-ambar/10 font-bold text-base-texto-primario' : 'text-base-texto-primario hover:bg-base-bg-secundario'"
                    @click="hojaAbierta = false">
                    <component :is="ICONO[l.estado]" :size="18" class="shrink-0" :class="COLOR[l.estado]" aria-hidden="true" />
                    <span class="flex-1 min-w-0 break-words">{{ l.titulo }}</span>
                    <span class="text-xs tabular-nums text-base-texto-secundario">{{ l.dominio }} %</span>
                  </NuxtLink>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, CircleDot, ListOrdered, Lock, Sparkles, X } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { useTutorStore } from '~/stores/tutor'
import { navegacionLeccion } from '~/utils/navegacionLeccion'
import type { UnitStatus } from '~/types'

const props = defineProps<{ unitId: number }>()
const studentStore = useStudentStore()
const tutorStore = useTutorStore()
const nav = computed(() => navegacionLeccion(studentStore.modules, studentStore.estadosModulos, props.unitId))

const ICONO: Record<UnitStatus, typeof Circle> = { dominado: CheckCircle2, 'en-progreso': CircleDot, 'por-iniciar': Circle, bloqueado: Lock }
const COLOR: Record<UnitStatus, string> = { dominado: 'text-semantico-pasa', 'en-progreso': 'text-acento-ambar-fuerte', 'por-iniciar': 'text-base-texto-secundario', bloqueado: 'text-base-texto-secundario' }

const hojaAbierta = ref(false)
const cerrarRef = ref<HTMLButtonElement | null>(null)
watch(hojaAbierta, (a) => { if (a) nextTick(() => cerrarRef.value?.focus()) })
watch(() => props.unitId, () => { hojaAbierta.value = false })
useEscapeToClose(() => hojaAbierta.value, () => { hojaAbierta.value = false })
useBloqueoScrollMovil(() => hojaAbierta.value)

// Se esconde al bajar (más de 8 px seguidos) y vuelve al subir o cerca del inicio. La página se desplaza en la ventana o en
// el contenedor principal del layout.
const oculta = ref(false)
let anterior = 0
function alDesplazar(e: Event) {
  const y = e.target instanceof HTMLElement ? e.target.scrollTop : window.scrollY
  if (Math.abs(y - anterior) < 8) return
  oculta.value = y > 120 && y > anterior
  anterior = y
}
onMounted(() => document.addEventListener('scroll', alDesplazar, { capture: true, passive: true }))
onBeforeUnmount(() => document.removeEventListener('scroll', alDesplazar, { capture: true }))
</script>

<style scoped>
.barra-leccion { padding-bottom: calc(0.375rem + env(safe-area-inset-bottom)); }
.boton-barra {
  @apply flex-1 min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] font-semibold text-base-texto-primario active:bg-base-bg-secundario;
}
</style>
