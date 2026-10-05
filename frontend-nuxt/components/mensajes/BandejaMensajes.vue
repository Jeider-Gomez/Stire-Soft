<template>
  <!-- Bandeja de mensajes del estudiante y del docente (antes, dos páginas casi iguales de 400 líneas cada una).
       - Cada mensaje se lee completo: los largos se abren con «Leer completo» (antes se cortaban en dos líneas y no
         había forma de leer el resto).
       - Nada se marca como leído con un clic en la tarjeta: hay botones, que también sirven con el teclado. -->
  <div class="space-y-4">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight inline-flex items-center gap-2">
          {{ titulo }}
          <span v-if="noLeidos > 0" class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-semantico-falla/15 text-semantico-falla">
            {{ noLeidos }} sin leer
          </span>
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">{{ descripcion }}</p>
      </div>
      <button id="redactar-mensaje" type="button" class="min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors shadow-sm self-start sm:self-auto inline-flex items-center gap-1.5" @click="emit('redactar')">
        <PenLine :size="14" aria-hidden="true" /> {{ textoRedactar }}
      </button>
    </header>

    <div class="flex flex-wrap items-center gap-2 border-b border-base-borde-sutil text-xs" role="tablist" aria-label="Bandejas">
      <button v-for="b in BANDEJAS" :key="b.valor" type="button" role="tab" :aria-selected="bandeja === b.valor"
        class="min-h-[44px] px-3 font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px"
        :class="bandeja === b.valor ? 'border-acento-ambar-fuerte text-acento-ambar-fuerte' : 'border-transparent text-base-texto-secundario hover:text-base-texto-primario'"
        @click="bandeja = b.valor">
        {{ b.texto }}
        <span class="px-1.5 rounded-full bg-base-bg-secundario text-[10px] text-base-texto-primario">{{ (b.valor === 'recibidos' ? recibidos : enviados).length }}</span>
      </button>
      <button v-if="noLeidos > 0" type="button" class="ml-auto min-h-[44px] px-2 text-[11px] font-semibold text-acento-ambar-fuerte hover:underline" @click="marcarTodos">
        Marcar todos como leídos
      </button>
    </div>

    <p v-if="cargando" role="status" class="p-10 text-center text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil">
      <Loader2 :size="14" class="inline-block animate-spin mr-2" aria-hidden="true" /> Cargando mensajes…
    </p>

    <div v-else-if="error" role="alert" class="p-8 text-center bg-base-blanco rounded-xl border border-semantico-falla/30 text-xs space-y-3">
      <p class="font-bold text-semantico-falla inline-flex items-center gap-1.5"><TriangleAlert :size="16" aria-hidden="true" /> {{ error }}</p>
      <button type="button" class="min-h-[44px] px-4 rounded-md borde-afordancia font-semibold" @click="cargar">Volver a cargar</button>
    </div>

    <div v-else-if="visibles.length === 0" class="p-10 text-center bg-base-blanco rounded-xl border border-base-borde-sutil text-xs space-y-2">
      <MailOpen :size="28" class="mx-auto text-base-texto-secundario" aria-hidden="true" />
      <p class="font-bold text-base-texto-primario text-sm">{{ bandeja === 'recibidos' ? 'No tienes mensajes recibidos' : 'No has enviado mensajes' }}</p>
      <p class="text-base-texto-secundario max-w-md mx-auto">{{ bandeja === 'recibidos' ? vacioRecibidos : vacioEnviados }}</p>
    </div>

    <ul v-else class="space-y-2" :aria-label="bandeja === 'recibidos' ? 'Mensajes recibidos' : 'Mensajes enviados'">
      <li v-for="m in visibles" :key="m.id" class="bg-base-blanco rounded-xl border p-4 shadow-sm flex gap-3 text-xs"
        :class="bandeja === 'recibidos' && !m.isRead ? 'border-acento-ambar-fuerte/50' : 'border-base-borde-sutil'">
        <AvatarUsuario :nombre="otraPersona(m, bandeja)" decorativo />
        <div class="flex-1 min-w-0 space-y-1">
          <p class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-base-texto-primario">{{ bandeja === 'recibidos' ? 'De' : 'Para' }} {{ otraPersona(m, bandeja) }}</span>
            <span v-if="bandeja === 'recibidos' && !m.isRead" class="px-1.5 py-0.5 rounded-full bg-semantico-info/15 text-semantico-info text-[10px] font-bold">Sin leer</span>
            <time :datetime="m.createdAt" class="ml-auto text-[11px] text-slate-600">{{ fechaMensaje(m.createdAt) }}</time>
          </p>
          <p :id="`mensaje-${m.id}`" class="text-slate-700 whitespace-pre-line break-words" :class="esLargo(m) && !abiertos.has(m.id) ? 'line-clamp-2' : ''">{{ m.content }}</p>
          <div class="flex flex-wrap items-center gap-x-3">
            <button v-if="esLargo(m)" type="button" class="min-h-[44px] sm:min-h-[32px] font-semibold text-acento-ambar-fuerte hover:underline" :aria-expanded="abiertos.has(m.id)" :aria-controls="`mensaje-${m.id}`" @click="alternar(m)">
              {{ abiertos.has(m.id) ? 'Mostrar menos' : 'Leer completo' }}
            </button>
            <button v-else-if="bandeja === 'recibidos' && !m.isRead" type="button" class="min-h-[44px] sm:min-h-[32px] font-semibold text-acento-ambar-fuerte hover:underline" @click="marcarLeido(m)">
              Marcar como leído
            </button>
            <button v-if="bandeja === 'recibidos'" type="button" class="min-h-[44px] sm:min-h-[32px] font-semibold text-acento-ambar-fuerte hover:underline inline-flex items-center gap-1"
              :aria-label="`Responder a ${otraPersona(m, bandeja)}`" @click="responder(m)">
              <Reply :size="13" aria-hidden="true" /> Responder
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { Loader2, MailOpen, PenLine, Reply, TriangleAlert } from 'lucide-vue-next'
import { CLAVE_MENSAJES } from '~/composables/useMensajes'
import { esLargo, fechaMensaje, otraPersona, type Bandeja, type Mensaje } from '~/utils/mensajes'

defineProps<{ titulo: string; descripcion: string; textoRedactar: string; vacioRecibidos: string; vacioEnviados: string }>()
const emit = defineEmits<{ redactar: []; responder: [m: Mensaje] }>()

const estado = inject(CLAVE_MENSAJES)
if (!estado) throw new Error('BandejaMensajes necesita useMensajes() con provide(CLAVE_MENSAJES).')
const { bandeja, recibidos, enviados, noLeidos, cargando, error, visibles, cargar, marcarLeido, marcarTodos } = estado

const BANDEJAS: Array<{ valor: Bandeja; texto: string }> = [
  { valor: 'recibidos', texto: 'Recibidos' },
  { valor: 'enviados', texto: 'Enviados' },
]
const abiertos = ref(new Set<number>())

/** Abrir un mensaje largo también lo marca como leído. */
function alternar(m: Mensaje) {
  const s = new Set(abiertos.value)
  if (s.has(m.id)) s.delete(m.id)
  else { s.add(m.id); void marcarLeido(m) }
  abiertos.value = s
}
function responder(m: Mensaje) {
  void marcarLeido(m)
  emit('responder', m)
}

onMounted(cargar)
</script>
