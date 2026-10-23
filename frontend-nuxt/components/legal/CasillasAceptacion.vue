<template>
  <!-- Mayoría de edad, términos e investigación (src/user/aceptacion-terminos.ts). Ninguna casilla viene marcada: el
       silencio no autoriza (Decreto 1377, art. 7). La investigación va aparte y es opcional. -->
  <fieldset class="space-y-2.5 text-sm">
    <legend class="sr-only">Condiciones para usar STIRE</legend>
    <label class="flex items-start gap-2.5 cursor-pointer">
      <input id="confirma-mayor-de-edad" v-model="mayorDeEdad" type="checkbox" class="casilla" :aria-invalid="falta && !mayorDeEdad || undefined" />
      <span>Confirmo que tengo <strong>18 años o más</strong>.</span>
    </label>
    <label class="flex items-start gap-2.5 cursor-pointer">
      <input id="acepta-terminos" v-model="terminos" type="checkbox" class="casilla" :aria-invalid="falta && !terminos || undefined" />
      <span>
        Acepto los
        <NuxtLink to="/terminos" target="_blank" class="font-semibold text-stire-blue underline">términos y condiciones</NuxtLink>
        y la
        <NuxtLink to="/privacidad" target="_blank" class="font-semibold text-stire-blue underline">política de datos</NuxtLink>.
      </span>
    </label>
    <p v-if="falta && !(mayorDeEdad && terminos)" class="text-[11px] font-semibold text-red-700" role="alert">
      STIRE es para personas de 18 años o más: marca las dos casillas para continuar.
    </p>
    <label class="flex items-start gap-2.5 cursor-pointer pt-1 text-slate-600">
      <input id="consiente-investigacion" v-model="investigacion" type="checkbox" class="casilla" />
      <span>
        <span class="font-semibold text-slate-700">Opcional:</span> acepto que mis datos de aprendizaje, sin mi nombre, se
        usen en la investigación sobre STIRE. Puedo cambiarlo cuando quiera en mi perfil.
      </span>
    </label>
  </fieldset>
</template>

<script setup lang="ts">
defineProps<{ falta?: boolean }>()
const mayorDeEdad = defineModel<boolean>('mayorDeEdad', { default: false })
const terminos = defineModel<boolean>('terminos', { default: false })
const investigacion = defineModel<boolean>('investigacion', { default: false })
</script>

<style scoped>
.casilla {
  @apply mt-0.5 w-5 h-5 shrink-0 rounded border-slate-400 text-stire-blue focus:ring-2 focus:ring-stire-blue/40;
}
</style>
