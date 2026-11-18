<template>
  <!-- «Mi clase» › Avisos y mensajes (v3, Fase D, paso 5; cuadro «E-Clase-Mensajes»): la cabecera de la clase y, debajo,
       los avisos del profe a la izquierda y la conversación con él a la derecha, a la vista las dos. 17/11 (Jeider: «en el
       chat no tenemos coherencia con el diseño»): antes eran dos pestañas y los mensajes, una bandeja de correo con
       «Recibidos», «Enviados» y una ventana aparte para escribir. En el celular el chat va primero. -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <EstudianteClaseCabecera />
    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start">
      <MensajesAvisosClase id="avisos-clase" rol="estudiante" compacto class="order-2 lg:order-1" />
      <MensajesConversacionProfe :texto-inicial="textoInicial" class="order-1 lg:order-2 lg:sticky lg:top-20" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Mensajes del estudiante: los datos son los de siempre (composables/useMensajes.ts), compartidos con el chat
// (components/mensajes/ConversacionProfe.vue).
import { onMounted, provide, ref } from 'vue'
import { CLAVE_MENSAJES, useMensajes } from '~/composables/useMensajes'

definePageMeta({ layout: 'student' })

const route = useRoute()
const estado = useMensajes()
provide(CLAVE_MENSAJES, estado)
const textoInicial = ref('')

onMounted(() => {
  estado.cargar()
  // «Preguntarle a tu docente» desde una lección que no quedó clara (UI-01): la duda queda escrita en el chat.
  if (route.query.redactar === '1') {
    textoInicial.value = typeof route.query.texto === 'string' ? route.query.texto.slice(0, 2000) : ''
    navigateTo({ path: route.path }, { replace: true })
    nextTick(() => document.getElementById('chat-profe-texto')?.focus())
  }
  // La notificación de un aviso (?ver=avisos) lleva a los avisos, que en el celular van debajo del chat.
  if (route.query.ver === 'avisos') nextTick(() => document.getElementById('avisos-clase')?.scrollIntoView({ block: 'start' }))
})
</script>
