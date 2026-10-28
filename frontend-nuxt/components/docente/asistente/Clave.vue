<template>
  <!-- Sin clave, el Asistente explica cómo conseguirla (gratis) y la guarda cifrada (src/asistente-docente). -->
  <div class="space-y-3 text-sm">
    <p class="text-base-texto-primario">Para trabajar contigo necesito tu clave gratuita de <strong>Google AI Studio</strong>. Es tuya: con ella pido los borradores y nadie más la usa.</p>
    <ol class="list-decimal pl-5 space-y-1 text-xs text-base-texto-secundario">
      <li>Entra a <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" class="font-semibold text-stire-blue underline">aistudio.google.com/apikey</a> con tu cuenta de Google.</li>
      <li>Toca «Create API key» y cópiala.</li>
      <li>Pégala aquí. Se guarda cifrada y nunca se muestra completa.</li>
    </ol>
    <form class="flex gap-2" @submit.prevent="guardar">
      <label for="asistente-clave" class="sr-only">Clave de Google AI Studio</label>
      <input id="asistente-clave" v-model="clave" type="password" autocomplete="off" class="input-stire min-h-[40px] flex-1 text-sm" placeholder="Pega tu clave" />
      <button type="submit" class="btn-stire-primary min-h-[40px]" :disabled="guardando || clave.trim().length < 20">{{ guardando ? 'Verificando…' : 'Guardar' }}</button>
    </form>
    <MensajeError v-if="error" class="text-xs">{{ error }}</MensajeError>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { guardarClave } = useAsistente()
const clave = ref('')
const guardando = ref(false)
const error = ref<string | null>(null)
async function guardar() {
  guardando.value = true
  error.value = await guardarClave(clave.value.trim())
  guardando.value = false
  if (!error.value) clave.value = ''
}
</script>
