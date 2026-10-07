<template>
  <!-- Avisos a la clase (utils/avisosClase.ts): el docente publica un aviso, una citación o un recordatorio para TODA la
       clase, y a cada estudiante le llega una notificación. El estudiante los ve aquí, el más nuevo primero. -->
  <div class="space-y-4">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight inline-flex items-center gap-2">
          <Megaphone :size="20" class="text-acento-ambar-fuerte" aria-hidden="true" /> {{ rol === 'docente' ? 'Avisos a tus clases' : 'Avisos de tus clases' }}
        </h1>
        <p class="text-xs text-base-texto-secundario mt-0.5">
          {{ rol === 'docente'
            ? 'Para todos tus estudiantes a la vez: una citación, un recordatorio o un informe. A cada uno le llega una notificación.'
            : 'Lo que tus docentes les comunican a todos: citaciones, recordatorios e informes.' }}
        </p>
      </div>
      <button v-if="rol === 'docente'" id="publicar-aviso" type="button" :disabled="!clases.length"
        class="min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs hover:bg-acento-ambar transition-colors shadow-sm self-start sm:self-auto inline-flex items-center gap-1.5 disabled:opacity-50"
        @click="abrir">
        <Megaphone :size="14" aria-hidden="true" /> Publicar un aviso
      </button>
    </header>

    <p v-if="hecho" role="status" class="text-xs font-semibold text-semantico-pasa bg-semantico-pasa/10 border border-semantico-pasa/30 rounded-md px-3 py-2">{{ hecho }}</p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    <p v-if="cargando" role="status" class="text-xs text-base-texto-secundario">Cargando avisos…</p>

    <div v-else-if="!avisos.length" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-8 text-center text-xs text-base-texto-secundario space-y-1">
      <p class="font-semibold text-base-texto-primario">Todavía no hay avisos</p>
      <p>{{ rol === 'docente' ? 'Usa «Publicar un aviso» para citar a tus estudiantes o recordarles algo.' : 'Cuando un docente publique un aviso para tu clase, aparecerá aquí y te llegará una notificación.' }}</p>
    </div>

    <ul v-else class="space-y-3">
      <li v-for="a in avisos" :key="a.id">
        <article class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-2" :aria-labelledby="`aviso-${a.id}`">
          <div class="flex flex-wrap items-center gap-2 text-[11px]">
            <span class="px-2 py-0.5 rounded font-bold inline-flex items-center gap-1" :class="ESTILO[a.tipo]">
              <component :is="ICONO[a.tipo]" :size="12" aria-hidden="true" /> {{ nombreTipoAviso(a.tipo) }}
            </span>
            <span class="font-semibold text-base-texto-primario">{{ a.clase }}</span>
            <span class="text-base-texto-secundario">· publicado {{ fechaCorta(a.createdAt) }}</span>
          </div>
          <h2 :id="`aviso-${a.id}`" class="text-sm font-bold text-base-texto-primario">{{ a.titulo }}</h2>
          <!-- La fecha y el lugar de una citación, grandes y arriba del texto: es lo que no se puede perder. -->
          <p v-if="a.fechaEvento || a.lugar" class="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-base-texto-primario bg-base-bg-secundario rounded-md px-3 py-2">
            <span v-if="a.fechaEvento" class="inline-flex items-center gap-1.5"><CalendarClock :size="14" aria-hidden="true" /> <span class="first-letter:uppercase">{{ fechaDeEvento(a.fechaEvento) }}</span></span>
            <span v-if="a.lugar" class="inline-flex items-center gap-1.5"><MapPin :size="14" aria-hidden="true" /> {{ a.lugar }}</span>
          </p>
          <p class="text-xs text-base-texto-primario whitespace-pre-line break-words leading-relaxed">{{ a.cuerpo }}</p>
          <div v-if="rol === 'docente'" class="pt-1">
            <button type="button" class="min-h-[44px] text-[11px] font-semibold text-semantico-falla hover:underline inline-flex items-center gap-1" @click="borrar(a)">
              <Trash2 :size="13" aria-hidden="true" /> Borrar el aviso<span class="sr-only"> «{{ a.titulo }}»</span>
            </button>
          </div>
        </article>
      </li>
    </ul>

    <AdminDialogo v-if="abierta" id-titulo="aviso-titulo" titulo="Publicar un aviso" ancho="2xl" devolver-foco="publicar-aviso"
      subtitulo="Les llega a todos los estudiantes de la clase, como notificación y en «Avisos»." :ocupado="enviando" @cerrar="abierta = false">
      <template #icono><Megaphone :size="18" aria-hidden="true" /></template>
      <form class="space-y-4 text-xs" @submit.prevent="enviar">
        <div>
          <label for="aviso-clase" class="block font-semibold text-base-texto-primario mb-1">Clase</label>
          <select id="aviso-clase" v-model.number="claseId" data-foco-inicial class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte">
            <option :value="0" disabled>Elige una clase</option>
            <option v-for="c in clases" :key="c.id" :value="c.id">{{ c.name }} ({{ c.code }})</option>
          </select>
        </div>
        <fieldset>
          <legend class="font-semibold text-base-texto-primario mb-1">Qué es</legend>
          <div class="grid sm:grid-cols-3 gap-2">
            <label v-for="t in TIPOS_AVISO" :key="t.valor" class="flex items-start gap-2 rounded-md border-2 p-2 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-acento-ambar-fuerte"
              :class="form.tipo === t.valor ? 'border-acento-ambar-fuerte' : 'border-base-borde-sutil'">
              <input v-model="form.tipo" type="radio" name="aviso-tipo" :value="t.valor" class="mt-0.5 w-4 h-4 accent-acento-ambar-fuerte" />
              <span><span class="font-semibold text-base-texto-primario">{{ t.texto }}</span><span class="block text-[11px] text-base-texto-secundario">{{ t.ayuda }}</span></span>
            </label>
          </div>
        </fieldset>
        <div>
          <label for="aviso-titulo-campo" class="block font-semibold text-base-texto-primario mb-1">Título</label>
          <input id="aviso-titulo-campo" v-model="form.titulo" maxlength="120" class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte"
            :placeholder="form.tipo === 'citacion' ? 'Ej.: Reunión con acudientes' : 'Ej.: No hay clase el lunes'" />
        </div>
        <div v-if="conFecha" class="grid sm:grid-cols-2 gap-3">
          <div>
            <label for="aviso-fecha" class="block font-semibold text-base-texto-primario mb-1">Día y hora <span v-if="form.tipo !== 'citacion'" class="font-normal text-base-texto-secundario">(opcional)</span></label>
            <input id="aviso-fecha" v-model="form.fecha" type="datetime-local" class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte" />
          </div>
          <div>
            <label for="aviso-lugar" class="block font-semibold text-base-texto-primario mb-1">Lugar <span class="font-normal text-base-texto-secundario">(opcional)</span></label>
            <input id="aviso-lugar" v-model="form.lugar" maxlength="160" placeholder="Ej.: Aula 3, bloque B" class="w-full min-h-[44px] px-3 rounded-md bg-base-blanco border border-base-borde-fuerte" />
          </div>
        </div>
        <div>
          <label for="aviso-cuerpo" class="block font-semibold text-base-texto-primario mb-1">Aviso</label>
          <textarea id="aviso-cuerpo" v-model="form.cuerpo" v-crece rows="4" maxlength="3000" class="w-full px-3 py-2 rounded-md bg-base-blanco border border-base-borde-fuerte"
            placeholder="Qué deben saber o traer…" />
        </div>
        <p v-if="errorEnvio" role="alert" class="text-semantico-falla font-semibold">{{ errorEnvio }}</p>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <p v-if="falta" class="mr-auto text-base-texto-secundario">{{ falta }}</p>
          <button type="button" class="min-h-[44px] px-4 rounded-md borde-afordancia font-semibold" @click="abierta = false">Cancelar</button>
          <button type="submit" :disabled="!!falta || enviando" class="min-h-[44px] px-4 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold disabled:opacity-50">
            {{ enviando ? 'Publicando…' : 'Publicar y avisar' }}
          </button>
        </div>
      </form>
    </AdminDialogo>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Bell, CalendarClock, Info, MapPin, Megaphone, Trash2 } from 'lucide-vue-next'
import { avisoParaEnviar, faltaEnAviso, fechaDeEvento, nombreTipoAviso, TIPOS_AVISO, type AvisoClase, type FormularioAviso, type TipoAviso } from '~/utils/avisosClase'
import { fechaCorta } from '~/utils/entregas'

const props = defineProps<{ rol: 'docente' | 'estudiante' }>()

const { avisos, cargando, error, cargar, publicar, eliminar } = useAvisosClase()
const { clasesDelDocente } = useDestinatarios()
const { confirmar } = useConfirmar()

const ICONO: Record<TipoAviso, typeof Bell> = { aviso: Info, citacion: CalendarClock, recordatorio: Bell }
const ESTILO: Record<TipoAviso, string> = {
  aviso: 'bg-semantico-info/10 text-semantico-info',
  citacion: 'bg-semantico-falla/10 text-semantico-falla',
  recordatorio: 'bg-acento-ambar/15 text-acento-ambar-fuerte',
}

const clases = ref<Array<{ id: number; name: string; code: string }>>([])
const abierta = ref(false)
const enviando = ref(false)
const errorEnvio = ref<string | null>(null)
const hecho = ref<string | null>(null)
const claseId = ref(0)
const form = reactive<FormularioAviso>({ tipo: 'aviso', titulo: '', cuerpo: '', fecha: '', lugar: '' })
const conFecha = computed(() => TIPOS_AVISO.find((t) => t.valor === form.tipo)?.conFecha ?? false)
const falta = computed(() => faltaEnAviso(form, claseId.value))

function abrir() {
  Object.assign(form, { tipo: 'aviso', titulo: '', cuerpo: '', fecha: '', lugar: '' })
  errorEnvio.value = null
  hecho.value = null
  if (clases.value.length === 1) claseId.value = clases.value[0].id
  abierta.value = true
}

async function enviar() {
  if (falta.value) return
  enviando.value = true
  const r = await publicar(claseId.value, avisoParaEnviar(form))
  enviando.value = false
  if (typeof r === 'string') { errorEnvio.value = r; return }
  abierta.value = false
  hecho.value = r.avisados === 1 ? 'Publicado: le llegó a 1 estudiante.' : `Publicado: les llegó a ${r.avisados} estudiantes.`
}

async function borrar(a: AvisoClase) {
  const ok = await confirmar({ titulo: '¿Borrar el aviso?', mensaje: `«${a.titulo}» deja de verse para tus estudiantes. Las notificaciones que ya les llegaron no se borran.`, accion: 'Borrar el aviso', peligro: true })
  if (!ok) return
  error.value = await eliminar(a.id)
}

onMounted(async () => {
  if (props.rol === 'docente') {
    clases.value = await clasesDelDocente()
    await cargar('docente', clases.value.map((c) => c.id))
  } else await cargar('estudiante')
})
</script>
