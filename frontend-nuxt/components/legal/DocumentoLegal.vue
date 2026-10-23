<template>
  <!-- Términos o política de datos (utils/legal.ts). Página pública, como el manual: se lee antes de crear la cuenta. -->
  <div class="min-h-screen bg-stire-canvas text-base-texto-primario font-interfaz">
    <header class="bg-gradient-to-br from-stire-blue to-stire-purple text-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-3">
        <NuxtLink :to="volver.ruta" class="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
          <ArrowLeft :size="16" aria-hidden="true" /> {{ volver.texto }}
        </NuxtLink>
        <h1 class="font-poppins text-3xl sm:text-4xl font-bold tracking-tight">{{ documento.titulo }}</h1>
        <p class="text-white/90">{{ documento.resumen }}</p>
        <p class="text-xs text-white/80">Versión del {{ FECHA_TERMINOS }}</p>
      </div>
    </header>
    <main class="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      <section v-for="s in documento.secciones" :key="s.titulo" class="space-y-2">
        <h2 class="font-poppins text-lg font-bold">{{ s.titulo }}</h2>
        <p v-for="(p, i) in s.parrafos" :key="i" class="text-sm leading-relaxed text-base-texto-secundario">{{ p }}</p>
      </section>
      <p class="pt-4 border-t border-slate-200 text-sm">
        Lee también:
        <NuxtLink :to="otro.ruta" class="font-semibold text-stire-blue hover:underline">{{ otro.texto }}</NuxtLink>
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { FECHA_TERMINOS, POLITICA, TERMINOS } from '~/utils/legal'

const props = defineProps<{ tipo: 'terminos' | 'privacidad' }>()
const documento = computed(() => (props.tipo === 'terminos' ? TERMINOS : POLITICA))
const otro = computed(() =>
  props.tipo === 'terminos'
    ? { ruta: '/privacidad', texto: 'Política de tratamiento de datos' }
    : { ruta: '/terminos', texto: 'Términos y condiciones' },
)
const authStore = useAuthStore()
const volver = computed(() =>
  authStore.isAuthenticated ? { ruta: '/', texto: 'Volver a STIRE' } : { ruta: '/auth/register', texto: 'Volver al registro' },
)
useHead({ title: `${documento.value.titulo} · STIRE` })
</script>
