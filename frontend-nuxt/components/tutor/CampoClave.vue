<template>
  <!-- Campo de la clave del Tutor: 16 px de letra en el celular (con menos, iPhone acerca la pantalla al tocarlo), ojo para
       ver lo pegado y, si se pide, «Pegar» del portapapeles. Todos los toques de 44 px. -->
  <div>
    <label for="tutor-api-key" class="block text-xs font-semibold text-base-texto-primario mb-1">Tu clave de Google AI Studio</label>
    <div class="flex gap-2">
      <div class="relative flex-1 min-w-0">
        <input id="tutor-api-key" ref="entrada" :type="ver ? 'text' : 'password'" :value="modelValue" :disabled="disabled"
          autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Empieza por AIza o AQ."
          class="w-full min-h-[44px] pl-3 pr-11 text-base sm:text-sm rounded-md bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
        <button type="button" class="absolute right-0 top-0 w-11 h-11 inline-flex items-center justify-center text-base-texto-secundario hover:text-base-texto-primario"
          :aria-label="ver ? 'Ocultar la clave' : 'Mostrar la clave'" :title="ver ? 'Ocultar la clave' : 'Mostrar la clave'" :aria-pressed="ver" @click="ver = !ver">
          <EyeOff v-if="ver" :size="18" aria-hidden="true" /><Eye v-else :size="18" aria-hidden="true" />
        </button>
      </div>
      <button v-if="conPegar" type="button" :disabled="disabled"
        class="borde-afordancia shrink-0 min-h-[44px] px-3 rounded-md inline-flex items-center gap-1.5 text-sm font-semibold text-base-texto-primario"
        @click="emit('pegar')">
        <ClipboardPaste :size="16" aria-hidden="true" /> Pegar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardPaste, Eye, EyeOff } from 'lucide-vue-next'

defineProps<{ modelValue: string; disabled?: boolean; conPegar?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [valor: string]; pegar: [] }>()
const ver = ref(false)
const entrada = ref<HTMLInputElement | null>(null)

/** Lleva el foco al campo y lo deja a la vista (al volver de Google). */
function enfocar() {
  entrada.value?.focus({ preventScroll: true })
  entrada.value?.scrollIntoView({ block: 'nearest' })
}
defineExpose({ enfocar })
</script>
