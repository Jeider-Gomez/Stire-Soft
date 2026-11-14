<template>
  <!-- «Mis proyectos» y «Laboratorio» (v3, Fase D, paso 6; cuadros «E-Proyectos» y «E-Laboratorio»): dos pantallas
       hermanas, cada una con su dirección; la actual va marcada. -->
  <nav aria-label="Proyectos" class="pestanas-proyectos">
    <NuxtLink to="/estudiante/proyectos" :aria-current="actual === 'mios' ? 'page' : undefined">
      Mis proyectos <span v-if="cuantos !== null" class="pastilla-inicio pastilla-sol">{{ cuantos }}</span>
    </NuxtLink>
    <NuxtLink to="/estudiante/proyectos/laboratorio" :aria-current="actual === 'laboratorio' ? 'page' : undefined">
      Laboratorio <span v-if="nuevas" class="pastilla-inicio pastilla-sol">{{ nuevas }} {{ nuevas === 1 ? 'nuevo' : 'nuevos' }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ actual: 'mios' | 'laboratorio'; cuantos?: number | null; nuevas?: number }>(), { cuantos: null, nuevas: 0 })
</script>

<style scoped>
.pestanas-proyectos { display: inline-flex; gap: 4px; padding: 5px; border-radius: 16px; background: rgb(var(--c-base-blanco)); border: 1px solid rgb(var(--c-base-borde-sutil)); }
.pestanas-proyectos a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: 12px; font-size: 14px; font-weight: 700; color: rgb(var(--c-base-texto-primario)); }
.pestanas-proyectos a:hover { background: rgb(var(--c-base-bg-secundario)); }
.pestanas-proyectos a[aria-current="page"] { background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco)); }
</style>
