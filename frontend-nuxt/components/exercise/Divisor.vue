<template>
  <!-- Un divisor que se arrastra para dar más espacio a un panel (mesa de trabajo, 14/11; utils/mesaEjercicio.ts). También con el
       teclado: enfocado, las flechas lo mueven (Mayús, de a 10 %), Inicio y Fin van a los límites; doble clic vuelve al ancho de
       siempre. Mientras se arrastra, muestra el ancho. -->
  <div
    ref="raiz"
    role="separator"
    aria-orientation="vertical"
    :aria-label="etiqueta"
    :aria-valuenow="Math.round(modelValue)"
    :aria-valuemin="min"
    :aria-valuemax="max"
    tabindex="0"
    class="divisor-mesa group relative flex-none w-2 -mx-1 z-20 cursor-col-resize select-none touch-none outline-none"
    :class="{ activo: arrastrando }"
    title="Arrastra para cambiar el ancho · doble clic para volver al de siempre"
    @pointerdown="empezar"
    @keydown="tecla"
    @dblclick="emit('update:modelValue', inicial)">
    <span class="linea-divisor" aria-hidden="true" />
    <span class="agarre-divisor" aria-hidden="true"><i /><i /><i /></span>
    <span v-if="arrastrando" class="medida-divisor" aria-hidden="true">{{ Math.round(modelValue) }} %</span>
  </div>
</template>

<script setup lang="ts">
import { medidaConTecla, medidaDesdePuntero } from '~/utils/mesaEjercicio'

const props = defineProps<{ modelValue: number; min: number; max: number; inicial: number; etiqueta: string; lado: 'izquierda' | 'derecha' }>()
const emit = defineEmits<{ 'update:modelValue': [v: number] }>()

const raiz = ref<HTMLElement | null>(null)
const arrastrando = ref(false)

function empezar(e: PointerEvent) {
  const fila = raiz.value?.parentElement
  if (!fila || e.button !== 0) return
  e.preventDefault()
  raiz.value?.setPointerCapture(e.pointerId)
  arrastrando.value = true
  // Sobre la vista previa (un iframe) el puntero se perdería: mientras se arrastra, nada más recibe el ratón.
  document.body.classList.add('arrastrando-divisor')
  const mover = (ev: PointerEvent) => emit('update:modelValue', medidaDesdePuntero(ev.clientX, fila.getBoundingClientRect(), props.lado))
  const soltar = () => {
    arrastrando.value = false
    document.body.classList.remove('arrastrando-divisor')
    raiz.value?.removeEventListener('pointermove', mover)
    raiz.value?.removeEventListener('pointerup', soltar)
    raiz.value?.removeEventListener('pointercancel', soltar)
  }
  raiz.value?.addEventListener('pointermove', mover)
  raiz.value?.addEventListener('pointerup', soltar)
  raiz.value?.addEventListener('pointercancel', soltar)
}

function tecla(e: KeyboardEvent) {
  const v = medidaConTecla(e.key, props.modelValue, props, props.lado, e.shiftKey)
  if (v === null) return
  e.preventDefault()
  emit('update:modelValue', v)
}

onBeforeUnmount(() => document.body.classList.remove('arrastrando-divisor'))
</script>

<style scoped>
.linea-divisor { position: absolute; inset: 0 auto 0 50%; width: 1px; transform: translateX(-50%); background: rgb(var(--c-base-borde-sutil)); transition: width 0.15s ease, background-color 0.15s ease; }
.divisor-mesa:hover .linea-divisor, .divisor-mesa:focus-visible .linea-divisor, .divisor-mesa.activo .linea-divisor { width: 3px; background: #00c2a8; }
.agarre-divisor { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; gap: 3px; padding: 6px 3px; border-radius: 999px; background: rgb(var(--c-base-blanco)); border: 1px solid rgb(var(--c-base-borde-fuerte)); box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12); transition: transform 0.15s ease, border-color 0.15s ease; }
.agarre-divisor i { width: 3px; height: 3px; border-radius: 50%; background: rgb(var(--c-base-texto-secundario)); }
.divisor-mesa:hover .agarre-divisor, .divisor-mesa:focus-visible .agarre-divisor, .divisor-mesa.activo .agarre-divisor { transform: translate(-50%, -50%) scale(1.15); border-color: #00c2a8; }
.divisor-mesa:focus-visible .agarre-divisor { box-shadow: 0 0 0 3px rgba(0, 194, 168, 0.35); }
.medida-divisor { position: absolute; top: calc(50% + 34px); left: 50%; transform: translateX(-50%); padding: 2px 8px; border-radius: 999px; background: #14213d; color: #fff; font-size: 11px; font-weight: 700; white-space: nowrap; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .linea-divisor, .agarre-divisor { transition: none; } }
</style>

<style>
/* Mientras se arrastra un divisor: el cursor se mantiene, no se selecciona texto y los iframes no se quedan con el puntero. */
body.arrastrando-divisor { cursor: col-resize; user-select: none; }
body.arrastrando-divisor iframe { pointer-events: none; }
</style>
