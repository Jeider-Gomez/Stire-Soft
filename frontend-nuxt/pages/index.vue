<template>
  <!-- Página de inicio pública (v3, Fase C; cuadros «Pagina-inicio» y «Pagina-inicio-celular» del lienzo). Quien ya
       inició sesión no la ve: middleware/auth.global.ts lo lleva a su panel. -->
  <div class="pagina-inicio min-h-screen text-base-texto-primario">
    <a href="#contenido" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-base-blanco">Ir al contenido</a>
    <header class="cabecera-inicio sticky top-0 z-40 flex items-center gap-3 sm:gap-7 min-h-[64px] sm:min-h-[76px] px-4 lg:px-20 border-b border-base-borde-sutil">
      <NuxtLink to="/" class="inline-flex items-center min-h-[44px]" aria-label="STIRE, ir al inicio">
        <LayoutLogo tamano="menu" con-nombre />
      </NuxtLink>
      <nav aria-label="Secciones" class="hidden lg:flex gap-6 ml-6 text-[15px] font-semibold">
        <a href="#que-es">Qué es</a>
        <a href="#como-ensena">Cómo enseña</a>
        <a href="#docentes">Para docentes</a>
        <NuxtLink to="/ayuda">Ayuda</NuxtLink>
      </nav>
      <div class="ml-auto flex items-center gap-2.5">
        <LayoutBotonApariencia />
        <NuxtLink to="/auth/login" class="inline-flex boton boton-claro h-11 px-4 sm:px-[22px]">Entrar</NuxtLink>
        <NuxtLink :to="{ path: '/auth/login', query: { forma: 'codigo' } }" class="hidden sm:inline-flex boton boton-oscuro h-11 px-[22px]">Unirme a una clase</NuxtLink>
      </div>
    </header>

    <main id="contenido">
      <section id="que-es" class="portada scroll-mt-20 grid lg:grid-cols-[1fr_minmax(0,620px)] gap-8 lg:gap-14 items-center px-4 lg:px-20 pt-8 pb-12 lg:pt-16 lg:pb-[72px]">
        <div class="flex flex-col gap-5 lg:gap-[22px]">
          <p class="m-0 self-start px-3.5 py-[7px] rounded-full text-sm font-bold insignia">
            Gratis · en español<span class="hidden sm:inline"> · para aprender a programar</span>
          </p>
          <h1 class="m-0 font-poppins font-bold text-[34px] sm:text-[56px] leading-[1.08]">
            Aprende a programar desde cero, con un Tutor que te <span class="acento">ayuda a pensar</span>
          </h1>
          <p class="hidden sm:block m-0 text-xl leading-relaxed text-base-texto-secundario">
            Lecciones cortas, práctica con ayuda por pasos y repasos que vuelven justo a tiempo. Tu docente te acompaña.
          </p>
          <PresentacionVideoEnLinea class="lg:hidden" />
          <div class="flex flex-col sm:flex-row gap-3">
            <NuxtLink :to="{ path: '/auth/login', query: { forma: 'codigo' } }" class="inline-flex boton boton-oscuro min-h-[52px] px-[22px]">
              Unirme con el código<span class="hidden sm:inline">&nbsp;de mi clase</span>
            </NuxtLink>
            <NuxtLink :to="{ path: '/auth/register', query: { rol: 'docente' } }" class="inline-flex boton boton-claro min-h-[52px] px-[22px]">Soy docente</NuxtLink>
          </div>
          <p class="m-0 text-sm text-base-texto-secundario">Para mayores de 18 años · funciona en el computador y en el celular</p>
          <!-- Demostración (NUXT_PUBLIC_DEMO_MODE=true): una línea sutil; entra de verdad con cuentas sembradas (stores/auth.ts). -->
          <div v-if="demoModeEnabled" class="-mt-2 flex flex-wrap items-center gap-1.5 text-[13px] font-medium text-base-texto-secundario">
            <span>Solo mirar, con datos de ejemplo:</span>
            <button v-for="d in DEMOS" :key="d.rol" type="button" class="chip-demo" :class="d.tono" :disabled="cargandoDemo" @click="mirar(d.rol)">{{ d.titulo }}</button>
          </div>
          <p v-if="errorDemo" role="alert" class="m-0 flex items-start gap-2 text-sm font-semibold text-semantico-falla"><AlertCircle :size="18" class="shrink-0" aria-hidden="true" /><span>{{ errorDemo }}</span></p>
        </div>
        <PresentacionVideoEnLinea class="hidden lg:flex" />
      </section>

      <PresentacionSecciones />

      <section class="franja-codigo mx-4 lg:mx-20 mb-16 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 px-6 py-8 sm:px-[52px] sm:py-11 rounded-[28px]" aria-label="Entrar con el código de tu clase">
        <TutorMascota :tamano="110" aria-hidden="true" />
        <PresentacionCodigoClase class="flex-1 w-full" />
      </section>
    </main>

    <footer class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 lg:px-20 py-8 border-t border-base-borde-sutil text-sm text-base-texto-secundario">
      <LayoutLogo tamano="mini" con-nombre />
      <span>Proyecto de la Licenciatura en Informática · Universidad de Córdoba</span>
      <span class="lg:ml-auto flex gap-[18px]">
        <NuxtLink to="/terminos" class="underline">Términos</NuxtLink>
        <NuxtLink to="/privacidad" class="underline">Privacidad</NuxtLink>
        <NuxtLink to="/ayuda" class="underline">Ayuda</NuxtLink>
      </span>
      <span>Para mayores de 18 años</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const authStore = useAuthStore()
const demoModeEnabled = useRuntimeConfig().public.demoMode
const DEMOS = [
  { rol: 'estudiante' as const, titulo: 'Estudiante', tono: 'chip-menta' },
  { rol: 'docente' as const, titulo: 'Docente', tono: 'chip-sol' },
  { rol: 'administrador' as const, titulo: 'Administrador', tono: 'chip-cielo' },
]
const cargandoDemo = ref(false)
const errorDemo = ref('')

/** «Solo mirar»: entra con la cuenta de ejemplo del rol y va a su inicio. */
async function mirar(rol: 'estudiante' | 'docente' | 'administrador') {
  cargandoDemo.value = true
  errorDemo.value = ''
  const r = await authStore.switchRoleForDemo(rol)
  cargandoDemo.value = false
  if (r.ok) navigateTo(rol === 'docente' ? '/docente' : rol === 'administrador' ? '/admin' : '/estudiante')
  else errorDemo.value = r.error || 'No se pudo abrir la cuenta de ejemplo. Intenta de nuevo en un momento.'
}
</script>

<style scoped>
.pagina-inicio { background: rgb(var(--c-base-bg-primario)); }
.cabecera-inicio { background: rgb(var(--c-base-blanco) / 0.92); backdrop-filter: blur(8px); }
.portada {
  background:
    radial-gradient(circle at 10% 20%, rgb(var(--c-sec-menta-fondo)) 0, transparent 40%),
    radial-gradient(circle at 90% 90%, rgb(var(--c-sec-lila-fondo)) 0, transparent 45%);
}
.insignia { background: rgb(var(--c-sec-menta-fondo)); color: rgb(var(--c-base-texto-primario)); }
.acento { color: #7b2fbf; }
:root[data-tema='oscuro'] .acento { color: #c9a8f5; }
.boton { align-items: center; justify-content: center; border-radius: 14px; font-weight: 700; font-size: 16px; } /* display va en la clase (inline-flex / hidden sm:inline-flex) */
.boton-oscuro { background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco)); }
.boton-claro { background: rgb(var(--c-base-blanco)); color: rgb(var(--c-base-texto-primario)); border: 1px solid rgb(var(--c-base-borde-fuerte)); }
/* La franja del final va en cielo con letra azul noche en todos los temas (es una tarjeta de color, como en el cuadro). */
.franja-codigo {
  color: #14213d;
  background:
    radial-gradient(circle at 88% 8%, rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0) 42%),
    linear-gradient(120deg, #8debff 0%, #5ccbff 58%, #7fb8ff 100%);
}
</style>
