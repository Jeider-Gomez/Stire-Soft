<template>
  <!-- Asistencia activa (stores/asistenciaActiva.ts): sigue a la vista mientras el docente usa STIRE, en una esquina para
       no estorbar. Plegada muestra «Asistencia 12 de 30» y cuántos llegaron sin que los viera; abierta, los últimos que
       llegaron, el escáner pequeño y marcar a mano. No sale en la propia página de asistencia, que ya lo muestra todo. -->
  <div v-if="store.activa && store.detalle && !enSuPagina" class="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 max-w-[calc(100vw-2rem)]" @keydown.esc="plegar">
    <section v-if="abierto" id="panel-asistencia" aria-labelledby="panel-asistencia-titulo"
      class="w-[22rem] max-w-full max-h-[70vh] overflow-y-auto bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-xl p-4 space-y-3 text-xs">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <h2 id="panel-asistencia-titulo" class="text-sm font-bold text-base-texto-primario">Asistencia abierta</h2>
          <p class="text-base-texto-secundario truncate">{{ store.detalle.clase }} · {{ fechaSesion(store.detalle.sesion.fecha) }}</p>
        </div>
        <button ref="plegarRef" type="button" class="shrink-0 min-h-[36px] px-2 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1" aria-controls="panel-asistencia" @click="plegar">
          <ChevronDown :size="14" aria-hidden="true" /> Plegar
        </button>
      </div>

      <div>
        <p class="text-base-texto-primario"><strong>{{ store.conteo.llegaron }}</strong> de {{ store.conteo.total }} llegaron</p>
        <div class="mt-1 h-2 rounded-full bg-base-bg-secundario overflow-hidden" role="progressbar" :aria-valuenow="store.conteo.llegaron" aria-valuemin="0" :aria-valuemax="store.conteo.total" aria-label="Estudiantes que llegaron">
          <div class="h-full bg-semantico-pasa transition-all" :style="{ width: `${store.conteo.total ? (store.conteo.llegaron / store.conteo.total) * 100 : 0}%` }" />
        </div>
      </div>
      <p v-if="store.error" role="alert" class="text-semantico-falla">{{ store.error }}</p>

      <!-- Escanear sin salir de la pantalla: la cámara pequeña sigue leyendo mientras el panel está abierto. -->
      <div class="space-y-2">
        <button type="button" class="w-full min-h-[40px] rounded-md font-bold inline-flex items-center justify-center gap-1.5"
          :class="escaneando ? 'borde-afordancia text-base-texto-primario' : 'bg-semantico-info text-base-blanco'" @click="escaneando = !escaneando">
          <ScanLine :size="14" aria-hidden="true" /> {{ escaneando ? 'Apagar la cámara' : 'Escanear aquí' }}
        </button>
        <div v-if="escaneando" class="max-w-[12rem] mx-auto"><CamaraQr @leido="alLeer" @fallo="escaneando = false" /></div>
        <div aria-live="polite">
          <p v-if="store.procesando" class="text-base-texto-secundario">Marcando…</p>
          <p v-else-if="store.ultimo?.ok" class="font-semibold" :class="store.ultimo.alerta ? 'text-acento-ambar-fuerte' : 'text-semantico-pasa'">
            {{ store.ultimo.nombre }}: {{ store.ultimo.yaEstaba ? 'ya estaba marcado' : 'presente' }}<template v-if="store.ultimo.alerta"> · {{ store.ultimo.alerta }}</template>
          </p>
          <p v-else-if="store.ultimo" role="alert" class="font-semibold text-semantico-falla">{{ store.ultimo.mensaje }}</p>
        </div>
      </div>

      <div>
        <h3 class="font-semibold text-base-texto-primario mb-1">Llegaron hace poco</h3>
        <p v-if="!store.recientes.length" class="text-base-texto-secundario">Todavía nadie.</p>
        <ul v-else class="space-y-1.5">
          <li v-for="e in store.recientes" :key="e.id" class="flex items-center gap-2">
            <AvatarUsuario :nombre="e.nombre" :foto-id="e.fotoId" tamano="w-7 h-7 text-[10px]" decorativo />
            <span class="min-w-0 flex-1 truncate text-base-texto-primario">{{ e.nombre }}</span>
            <span class="shrink-0 text-base-texto-secundario">{{ e.estado === 'tarde' ? 'tarde · ' : '' }}{{ e.metodo === 'qr' ? 'QR' : 'a mano' }} · {{ hora(e.hora) }}</span>
          </li>
        </ul>
      </div>

      <!-- Marcar a mano a quien no trae el celular: buscar por nombre entre los que faltan. -->
      <div>
        <label for="asistencia-buscar" class="font-semibold text-base-texto-primario">Marcar a mano</label>
        <input id="asistencia-buscar" v-model="busqueda" type="search" placeholder="Escribe un nombre" autocomplete="off"
          class="mt-1 w-full min-h-[40px] px-2 rounded-md border border-base-borde-fuerte bg-base-blanco text-base-texto-primario" />
        <ul v-if="busqueda.trim()" class="mt-1.5 space-y-1">
          <li v-if="!coinciden.length" class="text-base-texto-secundario">Nadie sin marcar con ese nombre.</li>
          <li v-for="e in coinciden" :key="e.id" class="flex items-center gap-2">
            <span class="min-w-0 flex-1 truncate text-base-texto-primario">{{ e.nombre }}</span>
            <button type="button" class="min-h-[36px] px-2 rounded-md border border-semantico-pasa text-semantico-pasa font-semibold" @click="marcar(e.id, 'presente')">Presente</button>
            <button type="button" class="min-h-[36px] px-2 rounded-md border border-acento-ambar-fuerte text-acento-ambar-fuerte font-semibold" @click="marcar(e.id, 'tarde')">Tarde</button>
          </li>
        </ul>
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-base-borde-sutil">
        <NuxtLink :to="`/docente/clase/${store.activa.classId}/asistencia?sesion=${store.activa.sesionId}`" class="min-h-[36px] inline-flex items-center font-semibold text-semantico-info underline">
          Ver la lista completa
        </NuxtLink>
        <button type="button" class="min-h-[36px] px-2 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1" @click="cerrar">
          <Lock :size="14" aria-hidden="true" /> Cerrar asistencia
        </button>
        <button type="button" class="min-h-[36px] px-1 font-semibold text-base-texto-secundario hover:text-base-texto-primario" @click="store.desactivar()">
          Quitar de la vista
        </button>
      </div>
    </section>

    <button type="button" :aria-expanded="abierto" aria-controls="panel-asistencia"
      class="min-h-[44px] pl-3 pr-4 rounded-full bg-acento-ambar-fuerte text-base-blanco font-bold text-xs shadow-lg inline-flex items-center gap-2"
      @click="abierto ? plegar() : abrir()">
      <ClipboardCheck :size="16" aria-hidden="true" />
      Asistencia {{ store.conteo.llegaron }} de {{ store.conteo.total }}
      <span v-if="!abierto && store.nuevos" class="px-1.5 py-0.5 rounded-full bg-base-blanco text-acento-ambar-fuerte text-[10px]">+{{ store.nuevos }} {{ store.nuevos === 1 ? 'nuevo' : 'nuevos' }}</span>
    </button>
    <!-- Lo anuncia al lector de pantalla sin tener que abrir el panel. -->
    <p class="sr-only" aria-live="polite">{{ !abierto && store.nuevos ? `${store.nuevos} ${store.nuevos === 1 ? 'estudiante nuevo llegó' : 'estudiantes nuevos llegaron'}` : '' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, ClipboardCheck, Lock, ScanLine } from 'lucide-vue-next'
import { useAsistenciaActivaStore } from '~/stores/asistenciaActiva'
import { esQrDeAsistencia, fechaSesion, sinMarcarQueCoinciden, type EstadoAsistencia } from '~/utils/asistencia'

const store = useAsistenciaActivaStore()
const route = useRoute()
const { confirmar } = useConfirmar()
const abierto = ref(false)
const escaneando = ref(false)
const busqueda = ref('')
const plegarRef = ref<HTMLButtonElement | null>(null)

const enSuPagina = computed(() => !!store.activa && route.path === `/docente/clase/${store.activa.classId}/asistencia`)
const coinciden = computed(() => sinMarcarQueCoinciden(store.detalle?.estudiantes ?? [], busqueda.value))
const hora = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }) : '')

async function abrir() {
  abierto.value = true
  store.ponerAlDia()
  await nextTick()
  plegarRef.value?.focus()
}
function plegar() {
  abierto.value = false
  escaneando.value = false
}

// La cámara ve el mismo código muchas veces por segundo: se ignora si se leyó hace menos de 5 s (como EscanerAsistencia).
const leidos = new Map<string, number>()
function alLeer(texto: string) {
  if (!esQrDeAsistencia(texto)) return
  const ahora = Date.now()
  if ((leidos.get(texto) ?? 0) > ahora - 5000) return
  leidos.set(texto, ahora)
  store.escanear(texto.trim()).then(() => store.ponerAlDia())
}

async function marcar(id: number, estado: EstadoAsistencia) {
  await store.marcar(id, estado)
  store.ponerAlDia()
  busqueda.value = ''
}

async function cerrar() {
  if (!(await confirmar({ titulo: '¿Cerrar la asistencia de hoy?', mensaje: 'Quien no marcó queda ausente. Puedes corregirlo después en la lista.', accion: 'Cerrar la asistencia' }))) return
  plegar()
  await store.cerrarAsistencia()
}

onMounted(() => store.recuperar())
</script>
