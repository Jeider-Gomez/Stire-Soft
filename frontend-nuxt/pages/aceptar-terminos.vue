<template>
  <!-- Cuentas creadas antes del 22/10/2026, o cuando cambian los términos: confirman su edad y aceptan una vez
       (middleware/auth.global.ts las trae aquí). -->
  <div class="min-h-screen bg-stire-canvas flex items-center justify-center px-4 py-10 font-interfaz">
    <main class="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-5">
      <div class="space-y-2">
        <h1 class="font-poppins text-2xl font-bold text-base-texto-primario">Antes de seguir</h1>
        <p class="text-sm text-slate-600">
          STIRE ahora tiene términos y política de datos, y es para personas de 18 años o más, porque el Tutor usa
          servicios de inteligencia artificial que no se permiten para menores de edad. Confírmalo una vez y sigues donde ibas.
        </p>
      </div>
      <form novalidate class="space-y-5" @submit.prevent="aceptar">
        <LegalCasillasAceptacion v-model:mayor-de-edad="mayorDeEdad" v-model:terminos="terminos" v-model:investigacion="investigacion" :falta="falta" />
        <p v-if="error" class="text-sm font-semibold text-red-700" role="alert">{{ error }}</p>
        <div class="flex flex-col sm:flex-row gap-2">
          <button type="submit" :disabled="enviando" class="min-h-[44px] flex-1 px-4 rounded-xl font-bold text-sm text-white bg-stire-blue hover:bg-stire-blue/90 disabled:cursor-wait">
            {{ enviando ? 'Guardando…' : 'Aceptar y continuar' }}
          </button>
          <button type="button" class="min-h-[44px] px-4 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100" @click="salir">
            Cerrar sesión
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { rutaDeVuelta } from '~/utils/codigoClase'

definePageMeta({ layout: false })
useHead({ title: 'Términos de STIRE' })

const authStore = useAuthStore()
const route = useRoute()
const mayorDeEdad = ref(false)
const terminos = ref(false)
const investigacion = ref(false)
const falta = ref(false)
const enviando = ref(false)
const error = ref('')

async function aceptar() {
  if (!mayorDeEdad.value || !terminos.value) { falta.value = true; return }
  enviando.value = true
  error.value = ''
  const r = await authStore.aceptarTerminos({ confirmaMayorDeEdad: true, aceptaTerminos: true, consienteInvestigacion: investigacion.value })
  enviando.value = false
  if (!r.ok) { error.value = r.error ?? 'No se pudo guardar. Intenta de nuevo.'; return }
  await navigateTo(rutaDeVuelta(route.query.volver) ?? '/')
}

function salir() {
  authStore.logout()
}
</script>
