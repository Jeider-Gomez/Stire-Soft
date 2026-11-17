<template>
  <!-- Clave de Google AI Studio del Tutor (§19). Medido el 17/11 a 360×640: el campo y «Guardar» quedaban fuera de la
       pantalla, debajo de la guía, y en el celular, al volver de Google, había que bajar a buscarlos (audio de Pedro: «se
       interrumpe el proceso de aprendizaje»). Ahora la guía sube y el campo, «Pegar» y «Guardar» quedan fijos abajo. -->
  <div class="flex flex-col min-h-full">
    <!-- Ya tiene clave: estado y acciones -->
    <div v-if="tutorStore.hasKey" class="p-4 space-y-3">
      <div class="flex items-center gap-2 p-3 rounded-lg bg-semantico-pasa/10 border border-semantico-pasa/30">
        <KeyRound :size="16" aria-hidden="true" />
        <div class="text-sm">
          <p class="font-semibold text-semantico-pasa">Tutor activado</p>
          <p class="text-base-texto-secundario text-xs">Tu clave termina en <code class="font-codigo">••••{{ tutorStore.last4 }}</code></p>
        </div>
      </div>
      <div class="flex gap-2">
        <button type="button" class="borde-afordancia flex-1 min-h-[44px] rounded-md text-sm font-semibold text-base-texto-primario"
          aria-label="Cambiar la clave de Google AI Studio" @click="showForm = !showForm">Cambiar</button>
        <button type="button" :disabled="isDeleting" class="borde-afordancia flex-1 min-h-[44px] rounded-md text-sm font-semibold text-semantico-falla hover:bg-semantico-falla/10 disabled:opacity-50"
          aria-label="Quitar la clave de Google AI Studio" @click="handleDelete">{{ isDeleting ? 'Quitando…' : 'Quitar mi clave' }}</button>
      </div>
      <form v-if="showForm" class="space-y-3 pt-3 border-t border-base-borde-sutil" @submit.prevent="handleSave">
        <CampoClave ref="campoRef" v-model="apiKeyInput" :disabled="isSaving" />
        <button type="submit" :disabled="!apiKeyInput.trim() || isSaving" class="boton-guardar">{{ isSaving ? 'Comprobando con Google…' : 'Guardar y comprobar' }}</button>
        <MensajeError v-if="saveError" class="text-xs">{{ saveError }}</MensajeError>
      </form>
    </div>

    <!-- Sin clave: para qué sirve, la guía y, fijo abajo, dónde pegarla -->
    <template v-else>
      <div class="flex-1 p-4 space-y-4">
        <div class="space-y-1">
          <h3 class="text-base font-bold text-base-texto-primario">Activa tu Tutor</h3>
          <p class="text-sm text-base-texto-secundario leading-relaxed">
            Para responderte necesita una clave gratuita de Google. Se hace <strong class="text-base-texto-primario">una sola vez</strong>
            y queda guardada en tu cuenta, también en el celular.
          </p>
        </div>
        <GuiaClaveGoogle />
        <details class="text-xs rounded-md border border-base-borde-sutil px-3 bg-base-bg-secundario">
          <summary class="cursor-pointer min-h-[44px] flex items-center gap-1.5 font-semibold text-base-texto-primario">
            <Lock :size="14" aria-hidden="true" /> Qué pasa con tu clave y tus preguntas
          </summary>
          <p class="pb-3 text-base-texto-secundario leading-relaxed">
            Tu clave se guarda cifrada y solo sirve para hablar con el Tutor; nadie del equipo puede verla. Las preguntas que le
            haces (y el código que tengas abierto) se envían a Google usando <strong>tu</strong> cuenta. En la capa gratuita, Google
            puede usar ese contenido para mejorar sus productos: no escribas datos personales ni contraseñas en el chat.
          </p>
        </details>
      </div>

      <form class="sticky bottom-0 p-4 pt-3 space-y-2.5 bg-base-blanco border-t border-base-borde-sutil shadow-[0_-6px_16px_-12px_rgba(0,0,0,0.35)]" @submit.prevent="handleSave">
        <p v-if="volvio" class="text-xs font-semibold text-base-texto-primario" role="status">¿Ya la copiaste? Pégala aquí.</p>
        <CampoClave ref="campoRef" v-model="apiKeyInput" :disabled="isSaving" con-pegar @pegar="pegar" />
        <button type="submit" :disabled="!apiKeyInput.trim() || isSaving" class="boton-guardar">{{ isSaving ? 'Comprobando con Google…' : 'Guardar y activar el Tutor' }}</button>
        <MensajeError v-if="saveError" class="text-xs">{{ saveError }}</MensajeError>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { KeyRound, Lock } from 'lucide-vue-next'
import { useTutorStore } from '~/stores/tutor'
import { revisarFormatoClave } from '~/utils/claveGoogle'
import CampoClave from '~/components/tutor/CampoClave.vue'

const { confirmar } = useConfirmar()
const tutorStore = useTutorStore()

const apiKeyInput = ref('')
const isSaving = ref(false)
const isDeleting = ref(false)
const saveError = ref('')
const showForm = ref(false)
/** Salió a Google y volvió: se le dice dónde pegarla y el campo queda listo. */
const volvio = ref(false)
const campoRef = ref<InstanceType<typeof CampoClave> | null>(null)

function alVolver() {
  if (document.visibilityState !== 'visible' || tutorStore.hasKey || apiKeyInput.value) return
  volvio.value = true
  campoRef.value?.enfocar()
}
onMounted(() => document.addEventListener('visibilitychange', alVolver))
onBeforeUnmount(() => document.removeEventListener('visibilitychange', alVolver))

/** «Pegar»: lee el portapapeles si el navegador lo deja; si no, se pega a mano (el campo queda enfocado). */
async function pegar() {
  saveError.value = ''
  try {
    const texto = (await navigator.clipboard.readText()).trim()
    if (texto) { apiKeyInput.value = texto; return }
  } catch { /* sin permiso para leer el portapapeles */ }
  campoRef.value?.enfocar()
  saveError.value = 'No pude leer lo que copiaste. Mantén presionado el campo y elige «Pegar».'
}

async function handleSave() {
  if (!apiKeyInput.value.trim()) return
  // Ítem 7: si la clave no tiene la forma de una de Google, se dice qué revisar sin esperar al servidor.
  const formato = revisarFormatoClave(apiKeyInput.value)
  if (formato) { saveError.value = formato; return }
  isSaving.value = true
  saveError.value = ''
  const result = await tutorStore.saveApiKey(apiKeyInput.value.trim())
  isSaving.value = false
  if (!result.ok) {
    saveError.value = result.error || 'No se pudo guardar la clave.'
  } else {
    apiKeyInput.value = ''
    showForm.value = false
    volvio.value = false
  }
}

async function handleDelete() {
  if (!(await confirmar({ titulo: '¿Quitar tu clave?', mensaje: 'El Tutor dejará de responder hasta que pongas una nueva.', accion: 'Quitar la clave', peligro: true }))) return
  isDeleting.value = true
  const result = await tutorStore.deleteApiKey()
  isDeleting.value = false
  if (!result.ok) saveError.value = result.error || 'No se pudo quitar la clave.'
}
</script>

<style scoped>
.boton-guardar {
  @apply w-full min-h-[44px] rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-sm disabled:opacity-50 hover:bg-acento-ambar transition-colors;
}
</style>
