<template>
  <!-- Globo de diálogo del Tutor: lo que el Tutor dice, con su nombre arriba y una cola que apunta a la mascota. Se ajusta
       al largo del texto (no ocupa todo el ancho si dice poco) y toma los colores del tema, también oscuro y alto
       contraste. Lo usan la retroalimentación de los ejercicios (ResultadoEntrega.vue) y el lanzador (LanzadorTutor.vue). -->
  <div class="globo-tutor relative w-fit max-w-full rounded-2xl px-3.5 py-2.5 text-left text-sm leading-snug text-base-texto-primario" :class="[`cola-${cola}`, `sup-${superficie}`]">
    <p class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-stire-purple">
      Tutor
      <span v-if="detalle" class="font-normal text-base-texto-secundario">· {{ detalle }}</span>
    </p>
    <div class="mt-0.5"><slot /></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Hacia dónde apunta la cola: a la izquierda (mascota al lado), arriba (mascota encima) o abajo a la derecha (lanzador). */
  cola?: 'izquierda' | 'arriba' | 'abajo-derecha'
  /** «suave» sobre una ventana; «flotante», translúcida y con sombra, sobre la página. */
  superficie?: 'suave' | 'flotante'
  /** Texto pequeño junto al nombre, p. ej. «sobre tu entrega». */
  detalle?: string
}>(), { cola: 'izquierda', superficie: 'suave' })
</script>

<style scoped>
.globo-tutor { --g-fondo: rgb(var(--c-base-bg-secundario)); --g-borde: rgb(var(--c-base-borde-sutil)); background: var(--g-fondo); border: 1px solid var(--g-borde); }
.sup-flotante {
  --g-fondo: rgb(var(--c-base-blanco) / 0.94);
  backdrop-filter: blur(16px) saturate(170%);
  -webkit-backdrop-filter: blur(16px) saturate(170%);
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.06), 0 10px 28px -8px rgb(11 61 145 / 0.28);
}
/* La cola: un cuadrado girado con el mismo fondo y borde, que asoma por un lado. */
.globo-tutor::before {
  content: ''; position: absolute; width: 10px; height: 10px; background: var(--g-fondo);
  border: 1px solid var(--g-borde);
}
.cola-izquierda { border-top-left-radius: 6px; }
.cola-izquierda::before { left: -6px; top: 12px; border-right: 0; border-top: 0; transform: rotate(45deg); }
.cola-arriba::before { left: 18px; top: -6px; border-right: 0; border-bottom: 0; transform: rotate(45deg); }
.cola-abajo-derecha { border-bottom-right-radius: 6px; }
.cola-abajo-derecha::before { right: 18px; bottom: -6px; border-left: 0; border-top: 0; transform: rotate(45deg); }
@media (prefers-reduced-transparency: reduce) {
  .sup-flotante { --g-fondo: rgb(var(--c-base-blanco)); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
</style>
