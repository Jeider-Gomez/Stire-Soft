<!-- La clase en el menú lateral (rediseño v2, 24/10; antes la lista de todas las clases con sus ocho secciones, que el
     docente sentía «como manejar un barco»). Arriba un selector con la clase elegida; al tocarlo, la lista de sus clases.
     Debajo, las cinco secciones de esa clase (utils/pestanasClase.ts, SECCIONES_MENU) y Ajustes al pie. Fuera de una
     clase (Inicio, Mensajes) muestra la última que eligió. Cada clase lleva sus iniciales («FA1», «FA2» si se repiten)
     para distinguirla con el menú plegado (Jeider, 07/10). -->
<template>
  <div v-if="clases.length" ref="raiz" class="pt-3 pb-1 border-t border-base-borde-sutil mt-2">
    <p class="text-xs uppercase tracking-wider text-base-texto-secundario px-3 pb-1.5" :class="{ 'md:hidden': colapsado }">Clase</p>

    <div class="relative">
      <button
        type="button"
        :title="actual ? (actual.code ? `${actual.name} · ${actual.code}` : actual.name) : 'Elegir clase'"
        aria-haspopup="menu"
        :aria-expanded="abierto ? 'true' : 'false'"
        class="w-full flex items-center gap-2.5 min-h-[52px] px-2.5 py-2 rounded-xl border border-base-borde-sutil bg-base-blanco text-left transition-colors hover:border-base-borde-fuerte"
        :class="colapsado ? 'md:justify-center md:px-1.5' : ''"
        @click="abierto = !abierto"
        @keydown.escape="abierto = false">
        <span aria-hidden="true" class="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-[10px] font-bold font-mono text-white" :style="{ backgroundColor: actual ? colores[actual.id] : undefined }">{{ actual ? siglas[actual.id] : '' }}</span>
        <span class="min-w-0 flex-1" :class="{ 'md:sr-only': colapsado }">
          <span class="block truncate font-semibold text-[13px] text-base-texto-primario">{{ actual?.name }}</span>
          <span v-if="actual?.code" class="block truncate font-mono text-[10px] text-base-texto-secundario">{{ actual.code }}</span>
        </span>
        <ChevronsUpDown :size="15" aria-hidden="true" class="shrink-0 text-base-texto-secundario" :class="{ 'md:hidden': colapsado }" />
      </button>

      <Transition
        enter-active-class="transition duration-150 ease-out origin-top"
        enter-from-class="opacity-0 scale-[0.97] -translate-y-1"
        leave-active-class="transition duration-100 ease-in origin-top"
        leave-to-class="opacity-0 scale-[0.97] -translate-y-1">
        <div v-if="abierto" role="menu" aria-label="Cambiar de clase" class="absolute left-0 right-0 top-full mt-1.5 z-30 min-w-[240px] p-1.5 rounded-xl border border-base-borde-sutil bg-base-blanco shadow-lg">
          <NuxtLink
            v-for="c in clases" :key="c.id"
            role="menuitem"
            :to="enlacePestana(seccionActual ?? 'hoy', c.id)"
            :title="c.code ? `${c.name} · ${c.code}` : c.name"
            :aria-current="c.id === actual?.id ? 'true' : undefined"
            class="flex items-center gap-2.5 min-h-[44px] px-2 rounded-lg text-[13px] transition-colors"
            :class="c.id === actual?.id ? 'bg-semantico-info/10 font-semibold text-base-texto-primario' : 'text-base-texto-primario hover:bg-base-bg-secundario'"
            @click="elegir(c.id)">
            <span aria-hidden="true" class="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold font-mono text-white" :style="{ backgroundColor: colores[c.id] }">{{ siglas[c.id] }}</span>
            <span class="min-w-0">
              <span class="block truncate">{{ c.name }}</span>
              <span v-if="c.code" class="block truncate font-mono text-[10px] font-normal text-base-texto-secundario">{{ c.code }}</span>
            </span>
          </NuxtLink>
          <div class="h-px bg-base-borde-sutil my-1.5 mx-1" />
          <NuxtLink role="menuitem" to="/docente" class="flex items-center gap-2 min-h-[40px] px-2 rounded-lg text-[13px] text-base-texto-primario hover:bg-base-bg-secundario" @click="abierto = false">
            <LayoutGrid :size="15" aria-hidden="true" />Ver todas mis clases
          </NuxtLink>
          <NuxtLink role="menuitem" to="/docente?crear=1" class="flex items-center gap-2 min-h-[40px] px-2 rounded-lg text-[13px] text-base-texto-primario hover:bg-base-bg-secundario" @click="abierto = false">
            <Plus :size="15" aria-hidden="true" />Crear clase
          </NuxtLink>
        </div>
      </Transition>
    </div>

    <!-- Las secciones de la clase elegida. Plegado el menú, no caben y se omiten. -->
    <ul v-if="actual" :class="{ 'md:hidden': colapsado }" :aria-label="`Secciones de ${actual.name}`" class="mt-2 space-y-0.5">
      <li v-for="s in SECCIONES_MENU" :key="s.id">
        <NuxtLink
          :to="enlacePestana(s.id, actual.id)"
          :aria-current="s.id === seccionMarcada && s.incluye.length === 1 ? 'page' : undefined"
          class="flex items-center gap-2.5 min-h-[40px] px-3 rounded-md text-[13px] transition-colors"
          :class="s.id === seccionMarcada ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <component :is="ICONOS[s.id]" :size="16" aria-hidden="true" class="shrink-0" />
          <span>{{ s.texto }}</span>
        </NuxtLink>
        <!-- Una sección que agrupa dos pantallas las muestra al abrirla (Estudiantes y Refuerzos; Asistencia y Notas). -->
        <ul v-if="s.id === seccionMarcada && s.incluye.length > 1" class="ml-8 mt-0.5 mb-1 space-y-0.5">
          <li v-for="p in s.incluye" :key="p">
            <NuxtLink
              :to="enlacePestana(p, actual.id)"
              :aria-current="p === seccionActual ? 'page' : undefined"
              class="flex items-center min-h-[34px] px-2.5 rounded-md text-[12.5px] transition-colors"
              :class="p === seccionActual ? 'text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
              {{ TEXTO_PESTANA[p] }}
            </NuxtLink>
          </li>
        </ul>
      </li>
      <li class="pt-1.5 mt-1.5 border-t border-base-borde-sutil">
        <NuxtLink
          :to="enlacePestana('ajustes', actual.id)"
          :aria-current="seccionActual === 'ajustes' ? 'page' : undefined"
          class="flex items-center gap-2.5 min-h-[40px] px-3 rounded-md text-[13px] transition-colors"
          :class="seccionActual === 'ajustes' ? 'bg-semantico-info/10 text-semantico-info font-semibold' : 'text-base-texto-primario hover:bg-base-bg-secundario'">
          <Settings :size="16" aria-hidden="true" class="shrink-0" />
          <span>Ajustes de la clase</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, CalendarCheck, ChevronsUpDown, ClipboardCheck, Inbox, LayoutGrid, Plus, Settings, Users } from 'lucide-vue-next'
import { PESTANAS_CLASE, SECCIONES_MENU, claseDeLaRuta, claseDelMenu, colorDeClase, enlacePestana, pestanaDeLaRuta, seccionDelMenu, type PestanaClase } from '~/utils/pestanasClase'
import { siglasDeClases } from '~/utils/contextoAcademico'

const CLAVE_RECORDADA = 'stire-clase-docente'
const route = useRoute()
const colapsado = useState('menu-colapsado', () => false)
const { misClases } = useMisClases()

const clases = ref<Array<{ id: number; name: string; code?: string }>>([])
const abierto = ref(false)
const raiz = ref<HTMLElement | null>(null)
const recordada = useState<number | null>('clase-docente-elegida', () => null)

const deLaRuta = computed(() => claseDeLaRuta(route.path, route.query))
const actual = computed(() => {
  const id = claseDelMenu(deLaRuta.value, recordada.value, clases.value.map((c) => c.id))
  return clases.value.find((c) => c.id === id) ?? null
})
/** La pantalla de la clase en la que está el docente: al cambiar de clase se queda en esa misma sección. */
const seccionActual = computed<PestanaClase | null>(() => (deLaRuta.value ? pestanaDeLaRuta(route.path) : null))
const seccionMarcada = computed(() => seccionDelMenu(seccionActual.value))
const ICONOS: Partial<Record<PestanaClase, unknown>> = { hoy: CalendarCheck, contenido: BookOpen, estudiantes: Users, entregas: Inbox, asistencia: ClipboardCheck }
const TEXTO_PESTANA = Object.fromEntries(PESTANAS_CLASE.map((p) => [p.id, p.texto])) as Record<PestanaClase, string>
const siglas = computed(() => siglasDeClases(clases.value))
const colores = computed(() => Object.fromEntries(clases.value.map((c, i) => [c.id, colorDeClase(i)])) as Record<number, string>)

function elegir(id: number) {
  recordada.value = id
  abierto.value = false
  try { localStorage.setItem(CLAVE_RECORDADA, String(id)) } catch { /* sin almacenamiento: solo dura la sesión */ }
}
// Si la dirección es de una clase, esa pasa a ser la recordada (así Inicio y Mensajes muestran la última usada).
watch(deLaRuta, (id) => { if (id) recordada.value = id }, { immediate: true })
watch(() => route.fullPath, () => { abierto.value = false })

function alTocarFuera(e: MouseEvent) {
  if (abierto.value && raiz.value && !raiz.value.contains(e.target as Node)) abierto.value = false
}

onMounted(async () => {
  document.addEventListener('click', alTocarFuera)
  if (!recordada.value) {
    try { recordada.value = Number(localStorage.getItem(CLAVE_RECORDADA)) || null } catch { /* sin almacenamiento */ }
  }
  try {
    clases.value = await misClases()
  } catch {
    clases.value = []
  }
})
onBeforeUnmount(() => document.removeEventListener('click', alTocarFuera))
</script>
