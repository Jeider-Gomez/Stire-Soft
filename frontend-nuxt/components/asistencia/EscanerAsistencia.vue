<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="escaner-asistencia-titulo" @keydown.esc="emit('cerrar')">
      <div class="bg-base-blanco rounded-2xl p-5 w-full max-w-md space-y-3 text-xs max-h-full overflow-y-auto">
        <div class="flex items-center justify-between gap-2">
          <h2 id="escaner-asistencia-titulo" class="text-sm font-bold text-base-texto-primario">Escanear la asistencia</h2>
          <button ref="cerrarRef" type="button" class="px-3 py-2 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1" @click="emit('cerrar')">
            <X :size="14" aria-hidden="true" /> Terminar
          </button>
        </div>

        <CamaraQr v-if="camara" @leido="alLeer" @fallo="camara = false" />
        <div v-else role="alert" class="rounded-lg border border-semantico-falla/40 bg-semantico-falla/5 p-3 space-y-1 text-base-texto-primario">
          <p class="font-semibold text-semantico-falla">No se pudo usar la cámara.</p>
          <p>Revisa que el navegador tenga permiso para usarla (en el candado junto a la dirección), o marca a mano en la lista.</p>
        </div>

        <p class="text-base-texto-secundario">Cada estudiante abre <strong>Mi asistencia</strong> en su celular y te muestra su código. Compara la foto y el nombre con quien lo muestra.</p>

        <!-- El último que marcó: grande, para comparar con la persona que tienes delante. -->
        <div aria-live="polite" class="min-h-[88px]">
          <p v-if="procesando" class="flex items-center gap-2 text-base-texto-secundario"><Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Marcando…</p>
          <div v-else-if="ultimo?.ok" class="flex items-center gap-3 rounded-lg border p-3" :class="ultimo.alerta ? 'border-acento-ambar-fuerte bg-acento-ambar/10' : 'border-semantico-pasa bg-semantico-pasa/10'">
            <AvatarUsuario :nombre="ultimo.nombre" :foto-id="ultimo.fotoId" tamano="w-16 h-16 text-xl" />
            <div class="min-w-0 space-y-0.5">
              <p class="text-base font-bold text-base-texto-primario truncate">{{ ultimo.nombre }}</p>
              <p class="font-semibold" :class="ultimo.yaEstaba ? 'text-slate-700' : 'text-semantico-pasa'">{{ ultimo.yaEstaba ? 'Ya estaba marcado' : 'Presente' }}</p>
              <p v-if="ultimo.alerta" class="font-semibold text-acento-ambar-fuerte flex items-center gap-1"><TriangleAlert :size="14" aria-hidden="true" /> {{ ultimo.alerta }}</p>
            </div>
          </div>
          <p v-else-if="ultimo" role="alert" class="rounded-lg border border-semantico-falla/40 bg-semantico-falla/5 p-3 font-semibold text-semantico-falla">{{ ultimo.mensaje }}</p>
        </div>
        <p class="text-base-texto-secundario">{{ marcados }} de {{ total }} marcados</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// El docente escanea, uno tras otro, el QR del celular de cada estudiante. Ignora QR que no son de asistencia y el
// mismo código leído varias veces seguidas (la cámara lo ve muchas veces por segundo).
import { Loader2, TriangleAlert, X } from 'lucide-vue-next'
import { esQrDeAsistencia, type ResultadoEscaneo } from '~/utils/asistencia'
import { hayCamara } from '~/utils/lectorQr'

defineProps<{ ultimo: ResultadoEscaneo | null; procesando: boolean; marcados: number; total: number }>()
const emit = defineEmits<{ (e: 'codigo', codigo: string): void; (e: 'cerrar'): void }>()

const camara = ref(hayCamara())
const cerrarRef = ref<HTMLButtonElement | null>(null)
const vistos = new Map<string, number>()

function alLeer(texto: string) {
  if (!esQrDeAsistencia(texto)) return
  const ahora = Date.now()
  if ((vistos.get(texto) ?? 0) > ahora - 5000) return
  vistos.set(texto, ahora)
  emit('codigo', texto.trim())
}

onMounted(() => cerrarRef.value?.focus())
</script>
