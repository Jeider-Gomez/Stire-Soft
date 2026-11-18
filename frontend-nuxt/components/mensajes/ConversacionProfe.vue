<template>
  <!-- La conversación con el profe (17/11, Jeider: «en el chat no tenemos coherencia con el diseño»; cuadro
       «E-Clase-Mensajes»): un chat con burbujas por día y la caja para escribir abajo, en vez de una bandeja de correo con
       «Recibidos», «Enviados» y una ventana aparte. Usa los mismos mensajes de siempre (composables/useMensajes.ts). -->
  <section class="chat-profe bg-base-blanco rounded-2xl border border-base-borde-sutil shadow-sm flex flex-col" aria-labelledby="chat-profe-titulo">
    <header class="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-base-borde-sutil">
      <AvatarUsuario v-if="docente" :nombre="docente.nombre" decorativo />
      <div class="min-w-0 flex-1">
        <h2 id="chat-profe-titulo" class="m-0 text-base font-bold text-base-texto-primario truncate">{{ docente ? `Prof. ${docente.nombre}` : 'Tu profe' }}</h2>
        <p class="m-0 text-xs text-base-texto-secundario truncate">{{ docente?.detalle || 'Escríbele lo que no te quedó claro' }}</p>
      </div>
      <!-- Con docentes en varias clases, se elige con cuál hablar. -->
      <select v-if="docentes.length > 1" v-model.number="docenteId" aria-label="Hablar con" class="min-h-[44px] max-w-[45%] rounded-md border border-base-borde-fuerte bg-base-blanco px-2 text-xs">
        <option v-for="d in docentes" :key="d.id" :value="d.id">{{ d.nombre }} · {{ d.detalle }}</option>
      </select>
    </header>

    <div ref="hilo" class="hilo-chat flex-1 overflow-y-auto px-5 py-4 space-y-3" role="log" aria-live="polite" aria-label="Conversación con tu profe">
      <p v-if="estado.cargando.value && !conversacion.length" class="text-sm text-base-texto-secundario">Cargando la conversación…</p>
      <MensajeError v-else-if="estado.error.value" class="text-xs">{{ estado.error.value }}</MensajeError>
      <div v-else-if="!docentes.length && !cargandoDocentes" class="text-center text-sm text-base-texto-secundario py-8">
        Cuando estés en una clase, aquí puedes escribirle a tu profe.
      </div>
      <div v-else-if="!conversacion.length" class="text-center text-sm text-base-texto-secundario py-8 space-y-1">
        <p class="m-0 font-semibold text-base-texto-primario">Aún no le has escrito</p>
        <p class="m-0">Pregúntale lo que no te quedó claro; le llega a su bandeja de STIRE.</p>
      </div>
      <template v-for="g in porDia" :key="g.dia">
        <p class="m-0 text-center text-xs text-base-texto-secundario">{{ g.dia }}</p>
        <div v-for="m in g.mensajes" :key="m.id" class="flex" :class="esMio(m) ? 'justify-end' : 'justify-start'">
          <div class="burbuja-chat" :class="esMio(m) ? 'mia' : 'suya'">
            <MensajesImagenMensaje v-if="m.imagenId" :mensaje-id="m.id" class="mb-2" />
            <p class="m-0 whitespace-pre-line break-words">{{ m.content }}</p>
            <p class="m-0 mt-1 text-right text-[11px] opacity-80">
              <time :datetime="m.createdAt">{{ horaDeMensaje(m.createdAt) }}</time><template v-if="m.editadoEn"> · editado</template>
            </p>
          </div>
        </div>
      </template>
    </div>

    <form v-if="docentes.length" class="flex items-end gap-2 px-4 py-3 border-t border-base-borde-sutil" novalidate @submit.prevent="enviar">
      <label class="boton-adjuntar" :title="imagen ? 'Quitar la imagen' : 'Adjuntar una imagen'">
        <input type="file" accept="image/*" class="sr-only" @change="elegirImagen" />
        <ImagePlus :size="18" aria-hidden="true" /><span class="sr-only">{{ imagen ? 'Cambiar la imagen' : 'Adjuntar una imagen' }}</span>
      </label>
      <div class="flex-1 min-w-0">
        <p v-if="imagen" class="m-0 mb-1 text-[11px] text-base-texto-secundario inline-flex items-center gap-1">
          <ImageIcon :size="12" aria-hidden="true" /> Imagen lista para enviar ·
          <button type="button" class="underline" @click="imagen = null">quitar</button>
        </p>
        <label for="chat-profe-texto" class="sr-only">Mensaje para tu profe</label>
        <textarea id="chat-profe-texto" v-model="texto" v-crece rows="1" maxlength="2000" placeholder="Escríbele al profe…"
          class="w-full min-h-[44px] max-h-40 px-3 py-2.5 rounded-xl bg-base-blanco border border-base-borde-fuerte resize-none text-sm focus:outline-none focus:ring-2 focus:ring-acento-ambar-fuerte/40"
          @keydown.enter.exact.prevent="enviar" @paste="pegar" />
      </div>
      <button type="submit" :disabled="enviando || !texto.trim() || !docenteId" class="min-h-[44px] px-4 rounded-xl bg-base-texto-primario text-base-blanco font-bold text-sm inline-flex items-center gap-1.5 disabled:opacity-50">
        <Loader2 v-if="enviando" :size="15" class="animate-spin" aria-hidden="true" /><Send v-else :size="15" aria-hidden="true" /> Enviar
      </button>
    </form>
    <MensajeError v-if="errorEnvio" class="mx-4 mb-3 text-xs">{{ errorEnvio }}</MensajeError>
    <p v-if="estado.aviso.value" role="status" class="mx-4 mb-3 text-xs text-base-texto-secundario">{{ estado.aviso.value }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { ImageIcon, ImagePlus, Loader2, Send } from 'lucide-vue-next'
import { CLAVE_MENSAJES, useDestinatarios, type Destinatario } from '~/composables/useMensajes'
import { conversacionCon, diaDeMensaje, horaDeMensaje, type Mensaje } from '~/utils/mensajes'
import { imagenDe } from '~/utils/captura'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'

/** Texto para empezar (desde «Preguntarle a tu docente» en una lección). */
const props = defineProps<{ textoInicial?: string }>()
const estado = inject(CLAVE_MENSAJES)!
const authStore = useAuthStore()
const studentStore = useStudentStore()
const { docentesDelEstudiante } = useDestinatarios()

const docentes = ref<Destinatario[]>([])
const cargandoDocentes = ref(true)
const docenteId = ref(0)
const docente = computed(() => docentes.value.find((d) => d.id === docenteId.value) ?? null)
const texto = ref(props.textoInicial ?? '')
const imagen = ref<Blob | null>(null)
const enviando = ref(false)
const errorEnvio = ref<string | null>(null)
const hilo = ref<HTMLElement | null>(null)

const esMio = (m: Mensaje) => m.senderId === authStore.user?.id
const conversacion = computed(() => (docenteId.value ? conversacionCon([...estado.recibidos.value, ...estado.enviados.value], docenteId.value) : []))
const porDia = computed(() => {
  const grupos: Array<{ dia: string; mensajes: Mensaje[] }> = []
  for (const m of conversacion.value) {
    const dia = diaDeMensaje(m.createdAt)
    if (grupos.at(-1)?.dia !== dia) grupos.push({ dia, mensajes: [] })
    grupos.at(-1)!.mensajes.push(m)
  }
  return grupos
})

function bajar() {
  nextTick(() => { if (hilo.value) hilo.value.scrollTop = hilo.value.scrollHeight })
}
// Lo que el profe escribió y se ve aquí queda leído; el chat baja al último mensaje.
watch(conversacion, (lista) => {
  for (const m of lista) if (!esMio(m) && !m.isRead) estado.marcarLeido(m)
  bajar()
}, { immediate: true })
watch(() => props.textoInicial, (t) => { if (t) texto.value = t })

onMounted(async () => {
  docentes.value = await docentesDelEstudiante()
  cargandoDocentes.value = false
  // El profe de la clase activa primero; si no, el primero.
  docenteId.value = (docentes.value.find((d) => d.detalle === studentStore.currentClassName) ?? docentes.value[0])?.id ?? 0
})

function elegirImagen(e: Event) {
  const input = e.target as HTMLInputElement
  imagen.value = input.files?.[0] ?? null
  input.value = ''
}
function pegar(e: ClipboardEvent) {
  const archivo = imagenDe(e.clipboardData)
  if (!archivo) return
  e.preventDefault()
  imagen.value = archivo
}

async function enviar() {
  if (enviando.value || !texto.value.trim() || !docenteId.value) return
  enviando.value = true
  errorEnvio.value = await estado.enviar(docenteId.value, texto.value, imagen.value)
  enviando.value = false
  if (!errorEnvio.value) { texto.value = ''; imagen.value = null; bajar() }
}
</script>

<style scoped>
/* Alto fijo con el hilo desplazable, como un chat: la caja de escribir siempre a la vista. */
.chat-profe { height: min(640px, calc(100vh - 220px)); min-height: 420px; }
.burbuja-chat { max-width: 82%; padding: 10px 14px; border-radius: 16px; font-size: 15px; line-height: 1.45; }
.burbuja-chat.mia { background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco)); border-bottom-right-radius: 6px; }
.burbuja-chat.suya { background: rgb(var(--c-base-bg-secundario)); color: rgb(var(--c-base-texto-primario)); border-bottom-left-radius: 6px; }
.boton-adjuntar {
  display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; flex-shrink: 0; cursor: pointer;
  border-radius: 12px; border: 1px solid rgb(var(--c-base-borde-fuerte)); color: rgb(var(--c-base-texto-secundario));
}
.boton-adjuntar:hover { color: rgb(var(--c-base-texto-primario)); }
.boton-adjuntar:focus-within { outline: 2px solid rgb(var(--c-acento-ambar-fuerte)); outline-offset: 2px; }
</style>
