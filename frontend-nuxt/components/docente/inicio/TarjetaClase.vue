<template>
  <!-- Tarjeta de una clase (v3, Fase E, paso 1; cuadro «D3-Inicio»): arriba, en el tono de la clase, su sigla, el nombre y
       cuántos estudiantes tiene; debajo, el dominio del grupo, quién necesita apoyo y «Ver el resumen». El código y el QR
       siguen a mano (abajo, discretos): el cuadro no los muestra, pero aquí es donde el docente los proyecta. -->
  <article class="tarjeta-clase" :style="{ '--tono': color }">
    <header class="cabeza-clase">
      <span class="sigla-clase" aria-hidden="true">{{ sigla }}</span>
      <div class="min-w-0 flex-1">
        <h3 class="m-0 font-poppins font-bold text-[17px] leading-snug line-clamp-2">{{ cls.name }}</h3>
        <NuxtLink :to="`/docente/rendimiento?classId=${cls.id}`" class="enlace-sutil inline-flex items-center min-h-[44px] text-[13px] text-base-texto-secundario hover:text-base-texto-primario tabular-nums">
          {{ cls.enrollmentCount === 1 ? '1 estudiante' : `${cls.enrollmentCount ?? 0} estudiantes` }}
        </NuxtLink>
        <p v-if="cls.grupo || cls.periodo" class="m-0 text-[12px] text-base-texto-secundario truncate">{{ [cls.grupo, cls.periodo].filter(Boolean).join(' · ') }}</p>
      </div>
      <span v-if="cls.isActive === false" class="pastilla-inicio pastilla-gris">Archivada</span>
    </header>

    <div class="flex-1 flex flex-col gap-2.5 p-4">
      <div v-if="cls.avgMastery !== undefined && cls.enrollmentCount" class="space-y-1.5">
        <div class="flex justify-between text-[13px] text-base-texto-secundario"><span>Dominio del grupo</span>
          <strong class="text-[15px] text-base-texto-primario tabular-nums">{{ porcentaje(cls.avgMastery) }}</strong></div>
        <div class="h-2 rounded-full bg-base-bg-secundario overflow-hidden"><div class="barra h-full rounded-full" :style="{ width: `${cls.avgMastery}%` }" /></div>
      </div>
      <p v-else-if="!cls.enrollmentCount" class="m-0 text-[13px] text-base-texto-secundario">Todavía no hay estudiantes: comparte el código.</p>
      <NuxtLink v-if="cls.atRiskCount" :to="`/docente/rendimiento?classId=${cls.id}`" class="pastilla-inicio pastilla-sol self-start enlace-sutil">
        {{ cls.atRiskCount === 1 ? '1 necesita apoyo' : `${cls.atRiskCount} necesitan apoyo` }}
      </NuxtLink>

      <div class="mt-auto pt-3 flex flex-wrap items-center gap-2 border-t border-base-borde-sutil">
        <NuxtLink :to="`/docente/clase/${cls.id}`" class="ver-resumen enlace-sutil min-h-[44px]">Ver el resumen <ChevronRight :size="15" aria-hidden="true" /></NuxtLink>
        <span class="ml-auto flex items-center gap-1">
        <span class="font-mono text-[12px] font-bold tracking-wider text-base-texto-secundario" title="Código para entrar">{{ cls.code }}</span>
        <button type="button" class="boton-mini min-h-[44px]" :title="copiado ? 'Copiado' : 'Copiar el código'" :aria-label="copiado ? `Código ${cls.code} copiado` : `Copiar el código ${cls.code}`" @click="$emit('copiar', cls.code)">
          <Check v-if="copiado" :size="14" aria-hidden="true" /><Copy v-else :size="14" aria-hidden="true" />
        </button>
        <button type="button" class="boton-mini min-h-[44px]" title="Proyectar el código QR" :aria-label="`Mostrar el QR de ${cls.name} para proyectarlo`" @click="$emit('qr', cls)">
          <QrCode :size="14" aria-hidden="true" />
        </button>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Check, ChevronRight, Copy, QrCode } from 'lucide-vue-next'
import { porcentaje } from '~/utils/porcentaje'
import type { ClaseDelDocente } from '~/composables/useClasesDocente'

defineProps<{ cls: ClaseDelDocente; color: string; sigla: string; copiado: boolean }>()
defineEmits<{ copiar: [codigo: string]; qr: [cls: ClaseDelDocente] }>()
</script>

<style scoped>
.tarjeta-clase { display: flex; flex-direction: column; overflow: hidden; border-radius: 18px; background: rgb(var(--c-base-blanco)); border: 1px solid rgb(var(--c-base-borde-sutil)); transition: box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
.tarjeta-clase:hover { box-shadow: 0 10px 28px -12px rgb(15 23 42 / 0.25); transform: translateY(-2px); }
.cabeza-clase { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: color-mix(in srgb, var(--tono) 16%, rgb(var(--c-base-blanco))); }
.sigla-clase { flex: none; width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; background: rgb(var(--c-base-blanco)); color: rgb(var(--c-base-texto-primario)); }
.barra { background: #00c2a8; transition: width 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
.ver-resumen { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; font-size: 14px; font-weight: 700; color: rgb(var(--c-semantico-pasa)); }
.ver-resumen:hover { text-decoration: underline; }
.boton-mini { width: 44px; height: 44px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: rgb(var(--c-base-texto-secundario)); border: 1px solid rgb(var(--c-base-borde-sutil)); }
.boton-mini:hover { background: rgb(var(--c-base-bg-secundario)); color: rgb(var(--c-base-texto-primario)); }
@media (prefers-reduced-motion: reduce) {
  .tarjeta-clase, .barra { transition: none; }
  .tarjeta-clase:hover { transform: none; }
}
</style>
