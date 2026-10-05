<template>
  <div class="max-w-5xl mx-auto">
    <MensajesBandejaMensajes
      titulo="Mensajes con tus docentes"
      descripcion="Escríbele a un docente de tus clases o lee lo que te han enviado."
      texto-redactar="Escribir a un docente"
      vacio-recibidos="Cuando un docente te escriba, el mensaje aparece aquí."
      vacio-enviados="Aún no le has escrito a ningún docente. Usa «Escribir a un docente» para empezar."
      @redactar="abrir(null)"
      @responder="(m) => abrir(m)" />

    <MensajesVentanaRedactar
      v-if="abierta"
      v-model:contenido="contenido"
      titulo="Escribir a un docente"
      subtitulo="Tu docente lo recibe en su bandeja de STIRE."
      etiqueta-mensaje="Tu mensaje"
      placeholder="Escribe tu duda o comentario…"
      :respondiendo-a="respondiendoA"
      :enviando="enviando"
      :error="errorEnvio"
      @cerrar="abierta = false"
      @enviar="enviarMensaje">
      <template #destinatario>
        <label for="redactar-destinatario" class="block font-semibold text-base-texto-primario mb-1">Docente</label>
        <p v-if="cargandoDocentes" class="text-base-texto-secundario">Cargando tus docentes…</p>
        <select v-else id="redactar-destinatario" v-model="destinatario" data-foco-inicial :disabled="docentes.length === 0"
          class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte disabled:opacity-50">
          <option :value="0" disabled>{{ docentes.length ? 'Elige un docente' : 'No estás matriculado en ninguna clase activa' }}</option>
          <option v-for="d in docentes" :key="d.id" :value="d.id">{{ d.nombre }} · {{ d.detalle }}</option>
        </select>
      </template>
    </MensajesVentanaRedactar>
  </div>
</template>

<script setup lang="ts">
// Mensajes del estudiante: la bandeja y la ventana son compartidas con el docente (components/mensajes/); aquí solo
// se decide a quién puede escribirle: a los docentes de sus clases activas.
import { provide, ref } from 'vue'
import { CLAVE_MENSAJES, useDestinatarios, useMensajes, type Destinatario } from '~/composables/useMensajes'
import { otraPersona, type Mensaje } from '~/utils/mensajes'

definePageMeta({ layout: 'student' })

const estado = useMensajes()
provide(CLAVE_MENSAJES, estado)
const { docentesDelEstudiante } = useDestinatarios()

const abierta = ref(false)
const contenido = ref('')
const destinatario = ref(0)
const respondiendoA = ref<string | null>(null)
const enviando = ref(false)
const errorEnvio = ref<string | null>(null)
const docentes = ref<Destinatario[]>([])
const cargandoDocentes = ref(false)

async function abrir(m: Mensaje | null) {
  contenido.value = ''
  errorEnvio.value = null
  respondiendoA.value = m ? otraPersona(m, 'recibidos') : null
  destinatario.value = m ? m.senderId : 0
  abierta.value = true
  if (!m && docentes.value.length === 0) {
    cargandoDocentes.value = true
    docentes.value = await docentesDelEstudiante()
    cargandoDocentes.value = false
  }
}

async function enviarMensaje() {
  enviando.value = true
  errorEnvio.value = await estado.enviar(destinatario.value, contenido.value)
  enviando.value = false
  if (!errorEnvio.value) abierta.value = false
}
</script>
