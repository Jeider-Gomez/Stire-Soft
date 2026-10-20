<template>
  <!-- Manual de usuario (S10-P07). Público: se abre sin iniciar sesión y se comparte por enlace. El contenido está en
       utils/manual.ts; esta página lo dibuja con la identidad de STIRE y, al imprimir, sale como PDF con portada,
       índice y números de página. -->
  <div class="manual min-h-screen bg-stire-canvas text-base-texto-primario font-interfaz">
    <a href="#contenido-manual" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-base-blanco focus:shadow-lg">Saltar al contenido</a>

    <!-- Portada: en pantalla es la cabecera; en el PDF ocupa la primera página. -->
    <header class="portada relative overflow-hidden bg-gradient-to-br from-stire-blue via-stire-blue to-stire-purple text-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-6">
        <div class="flex items-center gap-3">
          <LayoutMarcaST />
          <div class="font-poppins leading-tight">
            <p class="text-lg font-bold">STIRE <span class="font-light">Soft</span></p>
            <p class="text-xs text-white/80">Universidad de Córdoba · Licenciatura en Informática</p>
          </div>
        </div>
        <div class="space-y-3 max-w-2xl">
          <p class="inline-block px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-semibold tracking-wide">{{ VERSION_MANUAL }}</p>
          <h1 class="font-poppins text-3xl sm:text-5xl font-bold tracking-tight">Manual de usuario</h1>
          <p class="text-base sm:text-lg text-white/90">Cómo usar STIRE, tarea por tarea, si eres estudiante, docente o administrador.</p>
        </div>
        <div class="no-imprimir flex flex-wrap gap-3">
          <a :href="PDF_MANUAL" download class="min-h-[44px] inline-flex items-center gap-2 px-5 rounded-lg bg-white text-stire-blue font-bold text-sm shadow-md hover:bg-stire-purple-light">
            <Download :size="16" aria-hidden="true" /> Descargar en PDF
          </a>
          <NuxtLink :to="volver.ruta" class="min-h-[44px] inline-flex items-center gap-2 px-5 rounded-lg border border-white/60 text-white font-semibold text-sm hover:bg-white/10">
            <ArrowLeft :size="16" aria-hidden="true" /> {{ volver.texto }}
          </NuxtLink>
        </div>
      </div>
      <div class="absolute -right-24 -bottom-24 w-72 h-72 rounded-full border-[28px] border-stire-teal/40" aria-hidden="true" />
    </header>

    <div class="max-w-5xl mx-auto px-4 sm:px-8 py-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
      <!-- Índice: a un lado en pantalla grande; en el PDF, su propia página. -->
      <nav aria-label="Índice del manual" class="indice mb-8 lg:mb-0">
        <div class="lg:sticky lg:top-6 bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
          <p class="font-poppins text-sm font-bold mb-2">Contenido</p>
          <ol class="space-y-1 text-sm">
            <li v-for="(s, i) in visibles" :key="s.id">
              <a :href="`#${s.id}`" class="block py-1.5 font-semibold text-base-texto-primario hover:underline">{{ i + 1 }}. {{ s.titulo }}</a>
              <ul v-if="s.tareas.length" class="ml-4 space-y-0.5">
                <li v-for="t in s.tareas" :key="t.id"><a :href="`#${t.id}`" class="block py-1 text-base-texto-secundario hover:underline">{{ t.titulo }}</a></li>
              </ul>
            </li>
          </ol>
        </div>
      </nav>

      <main id="contenido-manual" tabindex="-1" class="space-y-12 min-w-0">
        <!-- Buscador y filtro por rol (solo en pantalla; el PDF lleva todo). -->
        <div class="no-imprimir bg-base-blanco rounded-xl border border-base-borde-sutil p-4 space-y-3" role="search">
          <label for="buscar-manual" class="block text-sm font-bold text-base-texto-primario">Buscar en el manual</label>
          <div class="relative">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-texto-secundario" aria-hidden="true" />
            <input id="buscar-manual" v-model="busqueda" type="search" placeholder="Por ejemplo: repasos, Tutor, asistencia" autocomplete="off"
              class="w-full min-h-[44px] pl-9 pr-3 rounded-lg border border-base-borde-fuerte bg-base-blanco text-sm text-base-texto-primario" />
          </div>
          <div class="flex flex-wrap gap-2" role="group" aria-label="Ver el manual de">
            <button v-for="r in ROLES" :key="r.valor" type="button" :aria-pressed="rol === r.valor"
              class="min-h-[44px] px-4 rounded-full border text-sm font-semibold"
              :class="rol === r.valor ? 'bg-stire-blue border-stire-blue text-base-blanco' : 'border-base-borde-fuerte text-base-texto-primario hover:bg-base-bg-secundario'"
              @click="rol = r.valor">{{ r.texto }}</button>
          </div>
          <p class="text-xs text-base-texto-secundario" aria-live="polite">{{ resumenFiltro }}</p>
        </div>

        <p v-if="!visibles.length" class="text-sm text-base-texto-secundario">
          No encontramos «{{ busqueda }}». Prueba con otra palabra o cuéntanos qué buscabas con «Sugerencias».
        </p>

        <section v-for="(s, i) in visibles" :id="s.id" :key="s.id" class="seccion-manual space-y-5" :aria-labelledby="`${s.id}-titulo`">
          <header class="space-y-2">
            <p class="text-xs font-bold uppercase tracking-wider" :class="s.rol === 'estudiante' ? 'text-stire-purple' : 'text-base-texto-secundario'">{{ etiquetaRol(s.rol) }}</p>
            <h2 :id="`${s.id}-titulo`" class="font-poppins text-2xl font-bold">{{ i + 1 }}. {{ s.titulo }}</h2>
            <p class="text-base text-base-texto-secundario max-w-2xl">{{ s.intro }}</p>
          </header>
          <ManualTareaManual v-for="t in s.tareas" :key="t.id" :tarea="t" :rol="s.rol" />
          <dl v-if="s.bloques?.length" class="grid sm:grid-cols-2 gap-4">
            <div v-for="b in s.bloques" :key="b.titulo" class="bg-base-blanco rounded-xl border border-base-borde-sutil border-t-4 border-t-stire-teal p-4">
              <dt class="font-poppins font-bold">{{ b.titulo }}</dt>
              <dd class="text-sm text-base-texto-secundario mt-1 leading-relaxed"><ManualTextoConBotones :texto="b.texto" /></dd>
            </div>
          </dl>
          <ManualCalendarioRepasos v-if="s.conCalendario" />
          <dl v-if="s.preguntas?.length" class="bg-base-blanco rounded-xl border border-base-borde-sutil divide-y divide-base-borde-sutil">
            <div v-for="p in s.preguntas" :key="p.pregunta" class="pregunta p-4">
              <dt class="font-semibold text-base-texto-primario"><ManualTextoConBotones :texto="p.pregunta" /></dt>
              <dd class="text-sm text-base-texto-secundario mt-1 leading-relaxed"><ManualTextoConBotones :texto="p.respuesta" /></dd>
            </div>
          </dl>
        </section>
      </main>
    </div>

    <footer class="border-t border-base-borde-sutil text-center text-xs text-base-texto-secundario py-6 px-4">
      STIRE Soft · Universidad de Córdoba · {{ VERSION_MANUAL }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { ArrowLeft, Download, Search } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { MANUAL, PDF_MANUAL, VERSION_MANUAL, etiquetaRol, filtrarManual, type RolManual } from '~/utils/manual'

definePageMeta({ layout: false })
useHead({ title: 'Manual de usuario · STIRE' })

// Quien ya entró vuelve a su inicio; quien no, a la entrada.
const authStore = useAuthStore()
const volver = computed(() =>
  authStore.isAuthenticated ? { ruta: '/', texto: 'Volver a STIRE' } : { ruta: '/auth/login', texto: 'Entrar a STIRE' },
)

const ROLES: Array<{ valor: RolManual; texto: string }> = [
  { valor: 'todos', texto: 'Todo' },
  { valor: 'estudiante', texto: 'Estudiante' },
  { valor: 'docente', texto: 'Docente' },
  { valor: 'administrador', texto: 'Administrador' },
]
// Quien entra con su cuenta ve primero lo de su rol; sin cuenta (y en el PDF), todo.
const rolDeCuenta = authStore.isAuthenticated ? authStore.currentRole : null
const rol = ref<RolManual>(rolDeCuenta === 'estudiante' || rolDeCuenta === 'docente' || rolDeCuenta === 'administrador' ? rolDeCuenta : 'todos')
const busqueda = ref('')
const visibles = computed(() => filtrarManual(MANUAL, busqueda.value, rol.value))
// Un enlace directo (/ayuda#hacer-repasos, el «Ver en el manual» del recorrido) siempre llega a su tarea, aunque sea de
// otro rol: si el filtro la ocultaba, se muestra todo.
onMounted(async () => {
  const id = decodeURIComponent(window.location.hash.slice(1))
  if (!id) return
  const esta = (lista: typeof visibles.value) => lista.some((s) => s.id === id || s.tareas.some((t) => t.id === id))
  if (!esta(visibles.value)) rol.value = 'todos'
  await nextTick()
  document.getElementById(id)?.scrollIntoView()
})
const resumenFiltro = computed(() => {
  const n = visibles.value.reduce((a, s) => a + s.tareas.length, 0)
  return `${n} ${n === 1 ? 'tarea' : 'tareas'} · ${rol.value === 'todos' ? 'todos los roles' : etiquetaRol(rol.value)}`
})
</script>

<style>
/* Para el PDF (imprimir → Guardar como PDF): A4, colores tal cual, portada e índice en su propia página y número de
   página abajo. */
@media print {
  @page { size: A4; margin: 16mm 14mm 18mm; @bottom-right { content: 'STIRE · Manual de usuario · ' counter(page); font: 9px Inter, sans-serif; color: #64748B; } }
  @page :first { margin: 0; @bottom-right { content: none; } }
  html, body { background: #fff !important; }
  .manual { min-height: 0; background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .manual .no-imprimir { display: none !important; }
  .manual .portada { min-height: 297mm; display: flex; align-items: center; break-after: page; }
  .manual .indice { break-after: page; }
  .manual .indice > div { position: static; border: none; }
  .manual .seccion-manual { break-before: page; }
  .manual .seccion-manual:first-of-type { break-before: auto; }
  .manual .seccion-manual > header { break-after: avoid; }
  .manual .pregunta { break-inside: avoid; }
}
</style>
