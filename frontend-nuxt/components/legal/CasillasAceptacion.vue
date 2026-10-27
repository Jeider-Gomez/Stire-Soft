<template>
  <!-- Una sola casilla (Jeider, 26/10: «que no tenga que andar seleccionando muchas opciones»): mayoría de edad, términos
       y política, y el uso de los datos de aprendizaje con fines investigativos, en una frase. No viene marcada: el
       silencio no autoriza (Decreto 1377, art. 7). La parte de investigación se puede retirar en el perfil. -->
  <div class="text-sm">
    <label class="flex items-start gap-2.5 cursor-pointer">
      <input id="acepta-condiciones" v-model="todo" type="checkbox" class="casilla" :aria-invalid="falta && !todo || undefined" />
      <span>
        Tengo <strong>18 años o más</strong> y acepto los
        <NuxtLink to="/terminos" target="_blank" class="font-semibold text-stire-blue underline">términos</NuxtLink>
        y la
        <NuxtLink to="/privacidad" target="_blank" class="font-semibold text-stire-blue underline">política de datos</NuxtLink>,
        incluido el uso de mis datos de aprendizaje, sin mi nombre, con fines investigativos.
      </span>
    </label>
    <p v-if="falta && !todo" class="mt-1.5 text-[11px] font-semibold text-red-700" role="alert">
      Marca la casilla para continuar: STIRE es para personas de 18 años o más.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineProps<{ falta?: boolean }>()
const mayorDeEdad = defineModel<boolean>('mayorDeEdad', { default: false })
const terminos = defineModel<boolean>('terminos', { default: false })
const investigacion = defineModel<boolean>('investigacion', { default: false })
/** La única casilla marca las tres decisiones a la vez. */
const todo = computed({
  get: () => mayorDeEdad.value && terminos.value,
  set: (v: boolean) => { mayorDeEdad.value = v; terminos.value = v; investigacion.value = v },
})
</script>

<style scoped>
.casilla {
  @apply mt-0.5 w-5 h-5 shrink-0 rounded border-slate-400 text-stire-blue focus:ring-2 focus:ring-stire-blue/40;
}
</style>
