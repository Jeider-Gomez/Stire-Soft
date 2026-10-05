<template>
  <div class="max-w-5xl mx-auto">
    <MensajesBandejaMensajes
      titulo="Mensajes con tus estudiantes"
      descripcion="Escríbele a un estudiante para orientarlo o responde sus dudas."
      texto-redactar="Escribir a un estudiante"
      vacio-recibidos="Cuando un estudiante te escriba, el mensaje aparece aquí."
      vacio-enviados="Aún no le has escrito a ningún estudiante. Usa «Escribir a un estudiante» para empezar."
      @redactar="abrir(null)"
      @responder="(m) => abrir(m)" />

    <MensajesVentanaRedactar
      v-if="abierta"
      v-model:contenido="contenido"
      titulo="Escribir a un estudiante"
      subtitulo="El estudiante lo recibe en su bandeja de STIRE."
      etiqueta-mensaje="Tu mensaje"
      placeholder="Escribe la orientación o la retroalimentación…"
      :respondiendo-a="respondiendoA"
      :enviando="enviando"
      :error="errorEnvio"
      @cerrar="abierta = false"
      @enviar="enviarMensaje">
      <template #destinatario>
        <div class="space-y-3">
          <div>
            <label for="redactar-clase" class="block font-semibold text-base-texto-primario mb-1">Clase</label>
            <select id="redactar-clase" v-model="claseId" data-foco-inicial class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte" @change="cargarEstudiantes">
              <option :value="0" disabled>{{ clases.length ? 'Elige una clase' : 'No tienes clases' }}</option>
              <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.name }} ({{ c.code }})</option>
            </select>
          </div>
          <div>
            <label for="redactar-destinatario" class="block font-semibold text-base-texto-primario mb-1">Estudiante</label>
            <p v-if="cargandoEstudiantes" class="text-base-texto-secundario">Cargando estudiantes…</p>
            <select v-else id="redactar-destinatario" v-model="destinatario" :disabled="estudiantes.length === 0"
              class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte disabled:opacity-50">
              <option :value="0" disabled>{{ estudiantes.length ? 'Elige un estudiante' : claseId ? 'Esta clase no tiene estudiantes' : 'Primero elige una clase' }}</option>
              <option v-for="e in estudiantes" :key="e.id" :value="e.id">{{ e.nombre }}{{ e.detalle ? ` · ${e.detalle}` : '' }}</option>
            </select>
          </div>
        </div>
      </template>
    </MensajesVentanaRedactar>
  </div>
</template>

<script setup lang="ts">
// Mensajes del docente: la bandeja y la ventana son compartidas con el estudiante (components/mensajes/); aquí solo
// se decide a quién puede escribirle: a los estudiantes de una de sus clases.
import { provide, ref } from 'vue'
import { CLAVE_MENSAJES, useDestinatarios, useMensajes, type Destinatario } from '~/composables/useMensajes'
import { otraPersona, type Mensaje } from '~/utils/mensajes'

definePageMeta({ layout: 'teacher' })

const estado = useMensajes()
provide(CLAVE_MENSAJES, estado)
const { clasesDelDocente, estudiantesDeClase } = useDestinatarios()

const abierta = ref(false)
const contenido = ref('')
const destinatario = ref(0)
const respondiendoA = ref<string | null>(null)
const enviando = ref(false)
const errorEnvio = ref<string | null>(null)
const clases = ref<Array<{ id: number; name: string; code: string }>>([])
const claseId = ref(0)
const estudiantes = ref<Destinatario[]>([])
const cargandoEstudiantes = ref(false)

async function cargarEstudiantes() {
  destinatario.value = 0
  if (!claseId.value) return
  cargandoEstudiantes.value = true
  estudiantes.value = await estudiantesDeClase(claseId.value)
  cargandoEstudiantes.value = false
}

async function abrir(m: Mensaje | null) {
  contenido.value = ''
  errorEnvio.value = null
  respondiendoA.value = m ? otraPersona(m, 'recibidos') : null
  destinatario.value = m ? m.senderId : 0
  abierta.value = true
  if (m) return
  if (clases.value.length === 0) clases.value = await clasesDelDocente()
  // Con una sola clase, ya queda elegida.
  if (clases.value.length === 1 && !claseId.value) {
    claseId.value = clases.value[0].id
    await cargarEstudiantes()
  }
}

async function enviarMensaje() {
  enviando.value = true
  errorEnvio.value = await estado.enviar(destinatario.value, contenido.value)
  enviando.value = false
  if (!errorEnvio.value) abierta.value = false
}
</script>
