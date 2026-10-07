<template>
  <!-- «Apariencia» en la cabecera (07/10): tema, alto contraste, tamaño del texto y espaciado sin salir de la pantalla.
       Antes estaba solo al final del perfil, debajo de la contraseña, y quien la necesitaba no la encontraba. Así lo
       resuelven Moodle (bloque de accesibilidad en cada página) y YouTube (apariencia en el menú de arriba). -->
  <div>
    <button
      id="boton-apariencia"
      type="button"
      class="flex items-center gap-1.5 px-2 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors text-xs font-semibold min-h-[44px] min-w-[44px] justify-center"
      aria-label="Apariencia y lectura: tema, contraste y tamaño del texto"
      :aria-expanded="abierto"
      @click="abierto = true"
    >
      <Contrast :size="18" aria-hidden="true" />
      <span class="hidden lg:inline">Apariencia</span>
    </button>

    <Teleport to="body">
      <AdminDialogo v-if="abierto" id-titulo="apariencia-rapida-titulo" titulo="Apariencia y lectura"
        subtitulo="Se aplica al instante y se recuerda en este navegador." ancho="2xl" devolver-foco="boton-apariencia"
        @cerrar="abierto = false">
        <template #icono><Contrast :size="18" aria-hidden="true" /></template>
        <PerfilAparienciaLectura compacto />
        <div class="flex justify-end pt-1">
          <button type="button" class="min-h-[44px] px-5 rounded-md bg-acento-ambar-fuerte text-base-blanco text-xs font-bold hover:bg-acento-ambar transition-colors"
            @click="abierto = false">Listo</button>
        </div>
      </AdminDialogo>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Contrast } from 'lucide-vue-next'

const abierto = ref(false)
</script>
