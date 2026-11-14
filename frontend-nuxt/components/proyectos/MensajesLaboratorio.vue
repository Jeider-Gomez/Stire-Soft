<template>
  <!-- «Mensajes para Laura» (cuadro «E-Laboratorio-Proyecto»): lo que le escriben al autor, con comienzos amables, y
       «¿Algo no está bien? Reportar; el profe lo revisa.» -->
  <section class="tarjeta-inicio flex flex-col gap-3" aria-labelledby="titulo-mensajes-lab">
    <h2 id="titulo-mensajes-lab" class="titulo-tarjeta">
      {{ pub.esMia ? 'Mensajes para ti' : `Mensajes para ${primerNombre}` }} · {{ pub.comentarios.length }}
    </h2>
    <p v-if="!pub.comentarios.length" class="m-0 text-[14px] text-base-texto-secundario">Todavía nadie escribe. {{ pub.esMia ? '' : 'Sé el primero en decirle algo amable.' }}</p>
    <ul v-else class="m-0 p-0 list-none space-y-3 max-h-[480px] overflow-y-auto">
      <li v-for="c in pub.comentarios" :key="c.id" class="flex gap-2.5">
        <span class="avatar-msj" :class="{ 'avatar-docente': c.autor.esDocente }" aria-hidden="true">{{ c.autor.iniciales }}</span>
        <div class="min-w-0 flex-1">
          <p class="m-0 text-[14px]">
            <b>{{ c.esMio ? 'Tú' : c.autor.esDocente ? `Prof. ${c.autor.nombre}` : c.autor.nombre }}</b>
            <span v-if="c.autor.esDocente" class="ml-1.5 pastilla-inicio pastilla-menta">Docente</span>
          </p>
          <p class="m-0 text-[15px] whitespace-pre-line break-words">{{ c.texto }}</p>
          <p class="m-0 text-[12px] text-base-texto-secundario">
            {{ haceCuanto(c.createdAt) }}
            <button v-if="c.puedoBorrar" type="button" class="ml-2 underline hover:text-semantico-falla" @click="emit('borrar', c.id)">Borrar</button>
          </p>
        </div>
      </li>
    </ul>

    <form novalidate class="mt-auto space-y-2" @submit.prevent="enviar">
      <label for="mensaje-lab" class="sr-only">Tu mensaje</label>
      <textarea id="mensaje-lab" ref="caja" v-model="texto" rows="3" maxlength="500" placeholder="Escribe un comentario amable…"
        class="w-full px-3 py-2 rounded-xl border border-base-borde-fuerte bg-base-blanco text-[15px]" />
      <div class="flex flex-wrap items-center gap-2">
        <button v-for="c in COMIENZOS_MENSAJE" :key="c" type="button" class="filtro-aprender" @click="empezar(c)">{{ c }}</button>
        <button type="submit" class="boton-tinta inline-flex ml-auto" :disabled="!texto.trim() || enviando">Comentar</button>
      </div>
    </form>

    <p v-if="!pub.esMia" class="m-0 text-[13px] text-base-texto-secundario">
      ¿Algo no está bien?
      <button v-if="!pub.yaReporte && !reportando" type="button" class="underline font-semibold" @click="reportando = true">Reportar</button>
      <span v-else-if="pub.yaReporte" class="font-semibold">Ya lo reportaste</span>; el profe lo revisa.
    </p>
    <form v-if="reportando" novalidate class="space-y-2" @submit.prevent="reportar">
      <label for="motivo-lab" class="text-sm font-bold">¿Qué pasa? (si quieres contarlo)</label>
      <input id="motivo-lab" v-model="motivo" maxlength="300" class="w-full min-h-[44px] px-3 rounded-xl border border-base-borde-fuerte bg-base-blanco" />
      <div class="flex gap-2">
        <button type="submit" class="boton-tinta inline-flex">Enviar el reporte</button>
        <button type="button" class="px-4 min-h-[44px] rounded-xl borde-afordancia font-semibold" @click="reportando = false">Cancelar</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { DetalleLaboratorio } from '~/composables/useLaboratorio'
import { COMIENZOS_MENSAJE, haceCuanto } from '~/utils/laboratorio'

const props = defineProps<{ pub: DetalleLaboratorio; enviando?: boolean }>()
const emit = defineEmits<{ comentar: [texto: string]; borrar: [id: number]; reportar: [motivo: string] }>()
const texto = ref('')
const motivo = ref('')
const reportando = ref(false)
const caja = ref<HTMLTextAreaElement | null>(null)
const primerNombre = computed(() => props.pub.autor.nombre.split(' ')[0])

function empezar(c: string) {
  texto.value = c.replace('…', ' ')
  nextTick(() => caja.value?.focus())
}
function enviar() {
  if (!texto.value.trim()) return
  emit('comentar', texto.value.trim())
  texto.value = ''
}
function reportar() {
  emit('reportar', motivo.value.trim())
  reportando.value = false
}
</script>

<style scoped>
.avatar-msj { flex: none; width: 34px; height: 34px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; background: rgb(var(--c-sec-lila-fondo)); color: rgb(var(--c-sec-lila-icono)); }
.avatar-docente { background: rgb(var(--c-sec-menta-fondo)); color: rgb(var(--c-semantico-pasa)); }
</style>
