<template>
  <!-- La mascota en «Entrar» (cuadro del lienzo): se asoma sobre la tarjeta y reacciona a lo que pasa. Saluda según la
       hora, mira el correo, no mira mientras se escribe la contraseña, se apena con un error y celebra al entrar.
       Es decorativa (aria-hidden): no cambia el formulario. -->
  <div class="mascota-entrar hidden sm:block" aria-hidden="true">
    <span v-if="globo" class="globo-entrar">{{ globo }}</span>
    <TutorMascota :expresion="expresion" :tamano="96" forma="completa" mirar-cursor saludar />
  </div>
</template>

<script setup lang="ts">
import type { ExpresionTutor } from '~/utils/mascotaTutor'

const props = defineProps<{
  campo: 'email' | 'password' | null
  verClave: boolean
  error: boolean
  listo: boolean
  pestana: 'codigo' | 'cuenta'
}>()

const saludo = ref('')
onMounted(() => {
  const h = new Date().getHours()
  saludo.value = h < 12 ? '¡Buenos días!' : h < 19 ? '¡Buenas tardes!' : '¡Buenas noches!'
})
const tapada = computed(() => props.campo === 'password' && !props.verClave)
const expresion = computed<ExpresionTutor>(() => {
  if (props.listo) return 'acierto'
  if (props.error) return 'error'
  if (tapada.value) return 'durmiendo'
  if (props.campo === 'email') return 'atento'
  return 'contento'
})
const globo = computed(() => {
  if (props.listo) return '¡Vamos!'
  if (tapada.value) return 'No miro tu contraseña'
  if (props.campo === 'email') return 'Ese es tu correo, ¿cierto?'
  if (props.pestana === 'codigo') return '¿Te dieron un código?'
  return saludo.value
})
</script>
