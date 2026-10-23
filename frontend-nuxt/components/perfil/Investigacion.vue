<template>
  <!-- Participar en la investigación es opcional y se puede cambiar cuando quiera (Decreto 1377, art. 9; utils/legal.ts). -->
  <section aria-labelledby="investigacion-titulo" class="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
    <h2 id="investigacion-titulo" class="font-bold text-base-texto-primario">Mis datos y la investigación</h2>
    <p class="text-sm text-slate-600">
      {{ participa
        ? 'Participas en la investigación sobre STIRE: tus datos de aprendizaje se analizan sin tu nombre.'
        : 'No participas en la investigación: tus datos solo se usan para tu clase.' }}
      Cambiarlo no afecta tus notas.
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <button type="button" :disabled="guardando" class="min-h-[44px] px-4 rounded-xl text-sm font-semibold border border-slate-300 hover:bg-slate-50 disabled:cursor-wait" @click="cambiar">
        {{ participa ? 'Dejar de participar' : 'Participar en la investigación' }}
      </button>
      <NuxtLink to="/privacidad" class="text-sm font-semibold text-stire-blue hover:underline">Política de datos</NuxtLink>
    </div>
    <p v-if="aviso" class="text-xs font-semibold" :class="ok ? 'text-emerald-700' : 'text-red-700'" role="status">{{ aviso }}</p>
  </section>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const participa = computed(() => authStore.user?.investigacionConsentida === true)
const guardando = ref(false)
const aviso = ref('')
const ok = ref(true)

async function cambiar() {
  guardando.value = true
  ok.value = await authStore.decidirInvestigacion(!participa.value)
  guardando.value = false
  aviso.value = ok.value ? 'Listo, quedó guardado.' : 'No se pudo guardar. Intenta de nuevo.'
}
</script>
