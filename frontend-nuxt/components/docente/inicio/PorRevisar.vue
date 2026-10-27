<template>
  <!-- «Por revisar» (prototipo del panel v2): lo que pide atención en todas las clases, con la cifra a la izquierda y la
       clase debajo. Reemplaza las cuatro tarjetas de cifras: aquí cada número lleva a donde se atiende. -->
  <section data-recorrido="rezago" aria-labelledby="titulo-por-revisar" class="space-y-3">
    <div class="flex items-baseline justify-between gap-3">
      <h2 id="titulo-por-revisar" class="text-base font-poppins font-bold text-base-texto-primario">Por revisar</h2>
      <span class="text-xs text-base-texto-secundario">Lo más reciente de todas tus clases</span>
    </div>
    <ul v-if="items.length" class="grid gap-2 sm:grid-cols-2">
      <li v-for="(p, i) in items" :key="p.ir" class="aparece" :style="{ animationDelay: `${i * 40}ms` }">
        <NuxtLink :to="p.ir" :title="TITULO[p.tipo ?? (p.claseId ? 'rezago' : 'mensajes')]"
          class="group flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-base-blanco border border-base-borde-sutil hover:border-stire-blue/40 hover:shadow-sm transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stire-blue/40">
          <span class="shrink-0 min-w-[2.5rem] h-10 px-2 rounded-lg grid place-items-center text-lg font-poppins font-bold tabular-nums"
            :class="CIFRA[p.tipo ?? (p.claseId ? 'rezago' : 'mensajes')]">{{ p.n }}</span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-base-texto-primario">{{ p.texto }}</span>
            <span v-if="p.clase" class="flex items-center gap-1.5 text-xs text-base-texto-secundario truncate">
              <span aria-hidden="true" class="w-3 h-3 rounded shrink-0" :style="{ backgroundColor: colores[p.claseId as number] }" />{{ p.clase }}
            </span>
            <span v-else class="block text-xs text-base-texto-secundario">De tus estudiantes</span>
          </span>
          <ChevronRight :size="16" class="shrink-0 text-base-texto-secundario group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
        </NuxtLink>
      </li>
    </ul>
    <p v-else class="px-4 py-3 rounded-xl bg-base-blanco border border-dashed border-base-borde-fuerte text-sm text-base-texto-secundario">
      Nada pendiente: nadie va por debajo de 50 % ni está bloqueado, y no tienes mensajes sin leer.
    </p>
  </section>
</template>

<script setup lang="ts">
// Cada tipo de aviso con su color y adónde lleva: rojo para quien no puede avanzar, ámbar para el rezago y los errores.
const TITULO = { rezago: 'Ver quiénes están en rezago', bloqueados: 'Ver quiénes no pueden avanzar', error: 'Ver el error y a quiénes les pasa', mensajes: 'Ver tus mensajes' } as const
const CIFRA = { rezago: 'bg-amber-50 text-amber-800', bloqueados: 'bg-semantico-falla/10 text-semantico-falla', error: 'bg-amber-50 text-amber-800', mensajes: 'bg-stire-purple/10 text-stire-purple' } as const
import { ChevronRight } from 'lucide-vue-next'
import type { PendienteInicio } from '~/utils/inicioDocente'

defineProps<{ items: PendienteInicio[]; colores: Record<number, string> }>()
</script>

<style scoped>
.aparece { animation: aparecer 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@keyframes aparecer { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) { .aparece { animation: none; } }
</style>
