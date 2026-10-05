<template>
  <!-- Invitación a la encuesta SUS (UX-08), sin interrumpir: una tarjeta en el inicio, no una ventana encima. Aparece solo
       a quien lleva unos días usando STIRE y no la ha respondido (el servidor decide); «Ahora no» la oculta una semana.
       Preguntar después de usar, no al llegar, es lo que da respuestas que sirven (docs/DISENO_ENCUESTA_USABILIDAD.md). -->
  <aside v-if="visible" class="rounded-lg border border-semantico-info/30 bg-semantico-info/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3" aria-labelledby="invitacion-encuesta-titulo">
    <MessageSquareHeart :size="22" class="shrink-0 text-semantico-info" aria-hidden="true" />
    <div class="flex-1 min-w-0">
      <p id="invitacion-encuesta-titulo" class="text-sm font-bold text-base-texto-primario">¿Nos ayudas a mejorar STIRE?</p>
      <p class="text-xs text-slate-700">10 afirmaciones sobre cómo te ha parecido usarlo. Son unos 2 minutos.</p>
    </div>
    <div class="flex gap-2">
      <NuxtLink :to="ruta" class="min-h-[44px] inline-flex items-center px-4 rounded-md bg-semantico-info text-base-blanco text-xs font-bold">Responder</NuxtLink>
      <button type="button" class="min-h-[44px] px-3 rounded-md text-xs font-semibold text-slate-700 hover:bg-base-bg-secundario" @click="posponer">Ahora no</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { MessageSquareHeart } from 'lucide-vue-next'
import { CLAVE_POSPUESTA, invitacionPospuesta, type EstadoSus } from '~/utils/sus'

defineProps<{ ruta: string }>()
const api = useApi()
const visible = ref(false)

function leer(): string | null {
  try { return localStorage.getItem(CLAVE_POSPUESTA) } catch { return null }
}
function posponer() {
  visible.value = false
  try { localStorage.setItem(CLAVE_POSPUESTA, String(Date.now())) } catch { /* sin almacenamiento: vuelve a aparecer la próxima vez */ }
}

onMounted(async () => {
  if (invitacionPospuesta(leer(), Date.now())) return
  try {
    visible.value = (await api.get<EstadoSus>('/usabilidad/sus/estado')).invitar
  } catch {
    visible.value = false
  }
})
</script>
