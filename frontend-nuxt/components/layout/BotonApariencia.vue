<template>
  <!-- Apariencia como acceso rápido (Jeider, 16/11: «uno pierde mucho tiempo seleccionando»): dos íconos, uno cambia entre
       claro y oscuro (con el círculo de utils/transicionTema.ts) y otro sube el contraste. Todo lo demás (temas de Windows,
       tamaño del texto, espaciado, movimiento) sigue en el perfil, en «Apariencia y lectura». -->
  <div class="flex items-center">
    <button id="boton-apariencia" type="button" :title="oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
      :aria-pressed="oscuro" class="boton-rapido" @click="cambiar({ tema: oscuro ? 'claro' : 'oscuro', temaContraste: 'ninguno' })">
      <Sun v-if="oscuro" :size="20" aria-hidden="true" />
      <Moon v-else :size="20" aria-hidden="true" />
      <span class="sr-only">Tema oscuro</span>
    </button>
    <button type="button" :title="apariencia.altoContraste ? 'Quitar el contraste alto' : 'Aumentar el contraste'"
      :aria-pressed="apariencia.altoContraste" class="boton-rapido" :class="{ encendido: apariencia.altoContraste }"
      @click="cambiar({ altoContraste: !apariencia.altoContraste })">
      <Contrast :size="20" aria-hidden="true" />
      <span class="sr-only">Contraste alto</span>
    </button>
    <!-- Sonidos (pendiente de la evaluación heurística, ítem 1): apagados por defecto; al encenderlos se oye una muestra. -->
    <button type="button" :title="apariencia.sonidos ? 'Apagar los sonidos' : 'Encender los sonidos al probar y entregar'"
      :aria-pressed="apariencia.sonidos" class="boton-rapido solo-amplio" :class="{ encendido: apariencia.sonidos }" @click="alternarSonidos">
      <Volume2 v-if="apariencia.sonidos" :size="20" aria-hidden="true" />
      <VolumeX v-else :size="20" aria-hidden="true" />
      <span class="sr-only">Sonidos</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Contrast, Moon, Sun, Volume2, VolumeX } from 'lucide-vue-next'
import { probarSonido } from '~/utils/sonidos'

const { apariencia, cambiar } = useApariencia()
function alternarSonidos() {
  const encender = !apariencia.value.sonidos
  cambiar({ sonidos: encender })
  if (encender) probarSonido()
}
// El tema que se ve (con «Como mi dispositivo» ya resuelto) lo pone utils/apariencia.ts en <html data-tema>.
const temaVisto = ref<string | null>(null)
onMounted(() => {
  temaVisto.value = document.documentElement.getAttribute('data-tema')
  new MutationObserver(() => { temaVisto.value = document.documentElement.getAttribute('data-tema') })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] })
})
const oscuro = computed(() => (temaVisto.value ?? (apariencia.value.tema === 'oscuro' ? 'oscuro' : 'claro')) === 'oscuro')
</script>

<style scoped>
.boton-rapido {
  display: inline-flex; align-items: center; justify-content: center; min-width: 44px; min-height: 44px; border-radius: 12px;
  color: rgb(var(--c-base-texto-secundario)); transition: background-color .15s ease, color .15s ease;
}
.boton-rapido:hover { background: rgb(var(--c-base-bg-secundario)); color: rgb(var(--c-base-texto-primario)); }
.boton-rapido.encendido { color: rgb(var(--c-base-texto-primario)); background: rgb(var(--c-base-bg-secundario)); }
@media (max-width: 767px) { .solo-amplio { display: none; } }
</style>
