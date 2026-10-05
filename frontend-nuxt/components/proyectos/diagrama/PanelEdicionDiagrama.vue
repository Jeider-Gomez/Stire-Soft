<template>
  <!-- Panel de la figura o la flecha elegida (antes dentro de EditorDiagrama.vue). Nombra las figuras por lo que dicen
       («Proceso: x <- 1»), no por su identificador interno («Proceso (f3)»). -->
  <aside class="w-full lg:w-72 bg-base-blanco rounded-xl border border-base-borde-fuerte p-4 shadow-sm space-y-3 shrink-0" aria-label="Panel de edición">
    <div v-if="flecha" class="space-y-3">
      <div class="flex items-center justify-between border-b border-base-borde-sutil pb-2">
        <span class="font-bold text-base-texto-primario text-xs flex items-center gap-1.5">
          <Link2 :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" />
          Flecha{{ flecha.rama ? ` del «${flecha.rama}»` : '' }}
        </span>
        <button type="button" class="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] inline-flex items-center justify-center rounded text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario"
          aria-label="Cerrar el panel de la flecha" @click="emit('cerrar')">
          <X :size="14" aria-hidden="true" />
        </button>
      </div>
      <p class="text-xs text-base-texto-secundario">
        De: <strong class="text-base-texto-primario">{{ flecha.origen }}</strong><br />
        A: <strong class="text-base-texto-primario">{{ flecha.destino }}</strong>
      </p>
      <p class="text-[11px] text-base-texto-secundario">También puedes quitarla con la tecla Supr.</p>
      <button type="button" class="w-full min-h-[44px] sm:min-h-[36px] px-3 py-2 rounded-lg bg-semantico-falla/10 hover:bg-semantico-falla/20 text-semantico-falla font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        @click="emit('quitarFlecha')">
        <Unlink :size="14" aria-hidden="true" />
        <span>Quitar flecha</span>
      </button>
    </div>

    <div v-else-if="figura" class="space-y-3">
      <div class="flex items-center justify-between border-b border-base-borde-sutil pb-2">
        <span class="font-bold text-base-texto-primario text-xs">{{ TIPO_FIGURA[figura.tipo].nombre }}</span>
        <button type="button" class="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] inline-flex items-center justify-center rounded text-slate-600 hover:text-base-texto-primario hover:bg-base-bg-secundario"
          :aria-label="`Cerrar el panel de ${nombreFigura(figura)}`" @click="emit('cerrar')">
          <X :size="14" aria-hidden="true" />
        </button>
      </div>
      <p class="text-[11px] text-base-texto-secundario leading-relaxed">{{ TIPO_FIGURA[figura.tipo].ayuda }}</p>

      <!-- Inicio y Fin no tienen texto editable -->
      <div v-if="figura.tipo !== 'inicio' && figura.tipo !== 'fin'" class="space-y-1">
        <label for="editor-texto-figura" class="block font-semibold text-[11px] text-base-texto-primario">Contenido</label>
        <textarea v-if="figura.tipo === 'proceso'" id="editor-texto-figura" ref="campo" :value="figura.texto" rows="4" maxlength="200"
          placeholder="Una instrucción por línea…" aria-describedby="editor-texto-cuenta"
          class="w-full px-2.5 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco text-xs font-mono outline-none focus:border-acento-ambar-fuerte leading-relaxed"
          @input="alEscribir" />
        <input v-else id="editor-texto-figura" ref="campo" :value="figura.texto" type="text" maxlength="200" aria-describedby="editor-texto-cuenta"
          :placeholder="figura.tipo === 'decision' ? 'x >= 10' : 'valor'"
          class="w-full min-h-[44px] sm:min-h-0 px-2.5 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco text-xs font-mono outline-none focus:border-acento-ambar-fuerte"
          @input="alEscribir" />
        <span id="editor-texto-cuenta" class="text-[10px] text-base-texto-secundario block text-right">{{ figura.texto.length }} / 200</span>
      </div>

      <!-- Unir por botones (celular y teclado): «Sí» y «No» en una decisión; una sola salida en el resto; Fin no sale. -->
      <div class="space-y-1.5 pt-1 border-t border-base-borde-sutil">
        <div v-for="s in salidas" :key="s.salida" class="flex items-center justify-between gap-2">
          <button type="button" class="min-h-[44px] sm:min-h-[32px] flex-1 px-2.5 py-1 rounded bg-base-blanco border border-base-borde-fuerte hover:bg-base-bg-secundario font-semibold text-xs text-left flex items-center gap-1.5"
            @click="emit('unir', s.salida)">
            <Link2 :size="13" class="text-acento-ambar-fuerte" aria-hidden="true" />
            <span>{{ s.texto }}</span>
          </button>
          <button v-if="figura[s.salida]" type="button" class="min-h-[44px] sm:min-h-[32px] px-2 py-1 text-semantico-falla hover:bg-semantico-falla/10 rounded font-semibold text-xs"
            :aria-label="s.quitar" @click="emit('quitarSalida', s.salida)">
            Quitar
          </button>
        </div>
        <button type="button" class="w-full min-h-[44px] sm:min-h-[32px] mt-2 px-3 py-1.5 rounded-lg border border-semantico-falla/40 text-semantico-falla hover:bg-semantico-falla/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          @click="emit('borrar')">
          <Trash2 :size="13" aria-hidden="true" />
          <span>Borrar figura</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Link2, Trash2, Unlink, X } from 'lucide-vue-next'
import { TIPO_FIGURA, type Figura } from '~/utils/diagramaFlujo'
import { nombreFigura, type Salida } from '~/utils/geometriaDiagrama'

const props = defineProps<{ figura: Figura | null; flecha: { origen: string; destino: string; rama: 'Sí' | 'No' | null } | null }>()
const emit = defineEmits<{ cerrar: []; texto: [valor: string]; unir: [salida: Salida]; quitarSalida: [salida: Salida]; quitarFlecha: []; borrar: [] }>()

const campo = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
defineExpose({ enfocarTexto: () => campo.value?.focus() })

function alEscribir(e: Event) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) emit('texto', e.target.value)
}

const salidas = computed<Array<{ salida: Salida; texto: string; quitar: string }>>(() => {
  const f = props.figura
  if (!f || f.tipo === 'fin') return []
  if (f.tipo === 'decision') {
    return [
      { salida: 'si', texto: 'Unir «Sí» con…', quitar: 'Quitar la flecha del «Sí»' },
      { salida: 'no', texto: 'Unir «No» con…', quitar: 'Quitar la flecha del «No»' },
    ]
  }
  return [{ salida: 'siguiente', texto: 'Unir con…', quitar: 'Quitar la flecha que sale' }]
})
</script>
