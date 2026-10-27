<template>
  <!-- Tarjeta de una clase (prototipo del panel v2): portada con el color y la sigla que la clase tiene en el menú
       lateral, y debajo lo que el docente mira antes de entrar: estudiantes, dominio, quién necesita apoyo y el código. -->
  <article class="tarjeta-clase flex flex-col rounded-2xl bg-base-blanco border border-base-borde-sutil overflow-hidden">
    <div class="portada relative px-4 pt-4 pb-3.5 text-white" :style="{ backgroundColor: color }">
      <svg class="absolute right-3 bottom-2 opacity-90" width="72" height="58" viewBox="0 0 64 52" aria-hidden="true">
        <rect x="2" y="30" width="11" height="22" rx="4.5" fill="#fff" opacity="0.18" /><rect x="18" y="20" width="11" height="32" rx="4.5" fill="#fff" opacity="0.24" />
        <rect x="34" y="10" width="11" height="42" rx="4.5" fill="#fff" opacity="0.3" /><rect x="50" y="0" width="11" height="52" rx="4.5" fill="#fff" opacity="0.36" />
      </svg>
      <span class="inline-flex px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-bold font-mono tracking-wider">{{ sigla }}</span>
      <h3 class="relative mt-6 pr-16 text-base font-poppins font-bold leading-snug line-clamp-2">{{ cls.name }}</h3>
      <p v-if="cls.asignatura || cls.grupo || cls.periodo" class="relative pr-16 text-xs text-white/85 truncate">
        <template v-if="cls.asignatura">{{ cls.asignatura.nombre }} · {{ lugarDeAsignatura(cls.asignatura) }}</template>
        <template v-if="cls.grupo || cls.periodo">{{ cls.asignatura ? ' · ' : '' }}{{ [cls.grupo, cls.periodo].filter(Boolean).join(' · ') }}</template>
      </p>
      <span v-if="cls.isActive === false" class="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/90 text-slate-700 text-[11px] font-bold">Archivada</span>
    </div>

    <div class="flex-1 flex flex-col gap-2.5 p-4">
      <NuxtLink :to="`/docente/rendimiento?classId=${cls.id}`"
        class="min-h-[44px] inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-stire-blue hover:underline tabular-nums">
        <Users :size="14" aria-hidden="true" />
        <span>{{ cls.enrollmentCount === 1 ? '1 estudiante' : `${cls.enrollmentCount ?? 0} estudiantes` }}</span>
      </NuxtLink>
      <div v-if="cls.avgMastery !== undefined && cls.enrollmentCount" class="space-y-1">
        <div class="flex justify-between text-xs text-base-texto-secundario"><span>Dominio del grupo</span>
          <strong :class="cls.avgMastery >= 70 ? 'text-emerald-700' : 'text-amber-700'">{{ porcentaje(cls.avgMastery) }}</strong></div>
        <div class="h-1.5 rounded-full bg-base-bg-secundario overflow-hidden"><div class="barra h-full rounded-full" :style="{ width: `${cls.avgMastery}%`, backgroundColor: color }" /></div>
      </div>
      <!-- Lo que pide atención: quién necesita apoyo (antes un «Activo» igual en todas). -->
      <NuxtLink v-if="cls.atRiskCount" :to="`/docente/rendimiento?classId=${cls.id}`"
        class="self-start flex items-center gap-1.5 px-2.5 py-1 min-h-[32px] rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 hover:bg-amber-100">
        <AlertTriangle :size="12" aria-hidden="true" />
        {{ cls.atRiskCount === 1 ? '1 necesita apoyo' : `${cls.atRiskCount} necesitan apoyo` }}
      </NuxtLink>

      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-stire-blue/10 text-stire-blue border border-stire-blue/20 tracking-wider" title="Código para entrar">{{ cls.code }}</span>
        <button type="button" @click="$emit('copiar', cls.code)"
          class="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 min-h-[44px] rounded-lg border border-slate-200 text-slate-500 hover:border-stire-teal/50 hover:text-teal-700 active:scale-95 transition-all duration-150"
          :aria-label="copiado ? `Código ${cls.code} copiado` : `Copiar el código ${cls.code}`">
          <Check v-if="copiado" :size="12" class="text-emerald-700" aria-hidden="true" /><Copy v-else :size="12" aria-hidden="true" />
          <span>{{ copiado ? 'Copiado' : 'Copiar' }}</span>
        </button>
        <button type="button" @click="$emit('qr', cls)"
          class="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 min-h-[44px] rounded-lg border border-slate-200 text-slate-500 hover:border-stire-purple/50 hover:text-stire-purple active:scale-95 transition-all duration-150"
          title="Proyectar código QR" :aria-label="`Mostrar el QR de ${cls.name} para proyectarlo`">
          <QrCode :size="12" aria-hidden="true" /><span>QR</span>
        </button>
      </div>
      <p class="text-[11px] text-base-texto-secundario">Matrícula {{ cls.requiresApproval ? 'con aprobación' : 'directa con el código' }}</p>

      <div class="mt-auto flex flex-wrap gap-2 pt-3 border-t border-slate-100">
        <NuxtLink :to="`/docente/clase/${cls.id}`" class="btn-stire-teal !bg-teal-700 hover:!bg-teal-800 min-h-[44px] flex-1 justify-center">
          <UserCheck :size="14" aria-hidden="true" />
          <span>Ver hoy en la clase</span>
        </NuxtLink>
        <NuxtLink :to="`/docente/contenidos?classId=${cls.id}`" class="btn-stire-secondary min-h-[44px]">
          <BookOpen :size="14" aria-hidden="true" />
          <span>Contenidos</span>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { AlertTriangle, BookOpen, Check, Copy, QrCode, UserCheck, Users } from 'lucide-vue-next'
import { porcentaje } from '~/utils/porcentaje'
import { lugarDeAsignatura } from '~/utils/contextoAcademico'
import type { ClaseDelDocente } from '~/composables/useClasesDocente'

defineProps<{ cls: ClaseDelDocente; color: string; sigla: string; copiado: boolean }>()
defineEmits<{ copiar: [codigo: string]; qr: [cls: ClaseDelDocente] }>()
</script>

<style scoped>
.tarjeta-clase { transition: box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
.tarjeta-clase:hover { box-shadow: 0 10px 28px -12px rgb(15 23 42 / 0.25); transform: translateY(-2px); }
.barra { transition: width 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
@media (prefers-reduced-motion: reduce) {
  .tarjeta-clase, .barra { transition: none; }
  .tarjeta-clase:hover { transform: none; }
}
</style>
