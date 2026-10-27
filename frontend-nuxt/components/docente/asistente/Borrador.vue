<template>
  <!-- El borrador del Asistente para revisarlo y ajustarlo antes de crear nada (27/10, pedido de Jeider): la estructura
       como árbol y los ejercicios, cada uno con subir, bajar, quitar y su texto editable; la explicación como se leerá.
       Lo que el docente cambia aquí es lo que se crea. Con el porqué de la propuesta. -->
  <section class="rounded-xl border border-base-borde-sutil bg-base-bg-secundario/40 p-3.5 space-y-2.5" aria-label="Borrador del Asistente">
    <p class="text-xs font-semibold text-stire-blue">Borrador · {{ resumenBorrador(borrador) }}</p>
    <p v-if="editable && borrador.tipo !== 'leccion'" class="text-[11px] text-base-texto-secundario">Cambia los nombres, el orden o quita lo que no quieras: se crea tal como lo dejes.</p>

    <ol v-if="borrador.tipo === 'estructura'" class="space-y-3 text-sm">
      <li v-for="(m, i) in borrador.modulos" :key="`m${i}-${m.titulo}`" class="rounded-lg bg-base-blanco border border-base-borde-sutil p-2.5 space-y-1.5">
        <div class="flex items-center gap-1">
          <span class="w-5 text-xs font-semibold text-base-texto-secundario">{{ i + 1 }}.</span>
          <input :value="m.titulo" :disabled="!editable" :aria-label="`Nombre del módulo ${i + 1}`" class="campo font-semibold" @change="cambiarModulo(i, ($event.target as HTMLInputElement).value)" />
          <Controles v-if="editable" :i="i" :n="borrador.modulos.length" :que="`el módulo «${m.titulo}»`" @mover="(d) => moverModulo(i, d)" @quitar="quitarModulo(i)" />
        </div>
        <ul class="space-y-1.5 pl-5 text-xs">
          <li v-for="(t, j) in m.temas" :key="`t${j}-${t.titulo}`">
            <p class="font-medium text-base-texto-primario">{{ t.titulo }}</p>
            <ol class="mt-0.5 space-y-0.5 pl-2">
              <li v-for="(l, k) in t.lecciones" :key="`l${k}-${l.titulo}`" class="flex items-center gap-1 text-base-texto-secundario">
                <input :value="l.titulo" :disabled="!editable" :aria-label="`Nombre de la lección ${k + 1} de ${t.titulo}`" class="campo text-xs" @change="cambiarLeccion(i, j, k, ($event.target as HTMLInputElement).value)" />
                <Controles v-if="editable" :i="k" :n="t.lecciones.length" :que="`la lección «${l.titulo}»`" @mover="(d) => moverLeccion(i, j, k, d)" @quitar="quitarLeccion(i, j, k)" />
              </li>
            </ol>
          </li>
        </ul>
      </li>
    </ol>

    <div v-else-if="borrador.tipo === 'alternativa'" class="space-y-1.5">
      <p class="text-[11px] text-base-texto-secundario">{{ borrador.forma === 'paso' ? 'Paso a paso' : 'Analogía' }} · la verá el estudiante {{ CUANDO_TEXTO[borrador.cuando] }}</p>
      <p class="text-sm font-semibold text-base-texto-primario">{{ borrador.titulo }}</p>
      <div class="prose prose-sm max-w-none text-base-texto-primario max-h-80 overflow-y-auto" v-html="html" />
    </div>

    <!-- Análisis de la clase: cada hallazgo con su acción; las de contenido se hacen aquí mismo con el Asistente. -->
    <ol v-else-if="borrador.tipo === 'analisis'" class="space-y-2.5">
      <li v-for="(h, i) in borrador.hallazgos" :key="i" class="rounded-lg bg-base-blanco border border-base-borde-sutil p-3 space-y-1.5">
        <p class="text-sm font-semibold text-base-texto-primario">{{ i + 1 }}. {{ h.titulo }}</p>
        <p class="text-xs text-base-texto-primario">{{ h.detalle }}</p>
        <p v-if="h.leccion" class="text-[11px] text-base-texto-secundario">Lección: {{ h.leccion }}</p>
        <button v-if="ACCION_HALLAZGO[h.accion].tarea" type="button" class="text-xs font-semibold text-stire-blue hover:underline min-h-[32px]"
          @click="$emit('hacer', ACCION_HALLAZGO[h.accion].tarea!, h.leccion)">{{ ACCION_HALLAZGO[h.accion].texto }} con el Asistente</button>
        <NuxtLink v-else-if="classId && enlaceDeHallazgo(h.accion, classId)" :to="enlaceDeHallazgo(h.accion, classId)!" class="inline-flex items-center text-xs font-semibold text-stire-blue hover:underline min-h-[32px]">
          {{ ACCION_HALLAZGO[h.accion].texto }}</NuxtLink>
      </li>
    </ol>

    <div v-else-if="borrador.tipo === 'leccion'" class="space-y-1">
      <p class="text-sm font-semibold text-base-texto-primario">{{ borrador.titulo }}</p>
      <div class="prose prose-sm max-w-none text-base-texto-primario max-h-80 overflow-y-auto" v-html="html" />
    </div>

    <ol v-else class="space-y-3 text-sm">
      <li v-for="(e, i) in borrador.ejercicios" :key="`e${i}-${e.enunciado.slice(0, 20)}`" class="rounded-lg bg-base-blanco border border-base-borde-sutil p-2.5 space-y-1.5">
        <div class="flex items-start gap-1">
          <span class="w-5 pt-1.5 text-xs font-semibold text-base-texto-secundario">{{ i + 1 }}.</span>
          <textarea :value="e.enunciado" :disabled="!editable" rows="2" :aria-label="`Enunciado del ejercicio ${i + 1}`" class="campo resize-y" @change="cambiarEnunciado(i, ($event.target as HTMLTextAreaElement).value)" />
          <Controles v-if="editable" :i="i" :n="borrador.ejercicios.length" :que="`el ejercicio ${i + 1}`" @mover="(d) => moverEjercicio(i, d)" @quitar="quitarEjercicio(i)" />
        </div>
        <fieldset class="pl-6 space-y-0.5 text-xs" :disabled="!editable">
          <legend class="sr-only">Respuesta correcta del ejercicio {{ i + 1 }}</legend>
          <label v-for="(o, k) in e.opciones" :key="k" class="flex items-start gap-1.5 cursor-pointer" :class="k === e.correcta ? 'text-semantico-pasa font-semibold' : 'text-base-texto-secundario'">
            <input type="radio" :name="`correcta-${i}`" :checked="k === e.correcta" class="mt-0.5 accent-current" @change="marcarCorrecta(i, k)" />
            <span>{{ o }}<span v-if="k === e.correcta" class="sr-only"> (correcta)</span></span>
          </label>
        </fieldset>
      </li>
    </ol>

    <p v-if="borrador.porque" class="text-[11px] text-base-texto-secundario border-t border-base-borde-sutil pt-2"><strong>Por qué así:</strong> {{ borrador.porque }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { ArrowDown, ArrowUp, X } from 'lucide-vue-next'
import { ACCION_HALLAZGO, enlaceDeHallazgo, moverItem, quitarItem, resumenBorrador, type BorradorAsistente, type BorradorEjercicios, type BorradorEstructura, type TipoBorrador } from '~/utils/asistenteDocente'

const props = withDefaults(defineProps<{ borrador: BorradorAsistente; editable?: boolean; classId?: number | null }>(), { editable: true, classId: null })
const emit = defineEmits<{ cambiar: [b: BorradorAsistente]; hacer: [tarea: TipoBorrador, leccion: string] }>()
const CUANDO_TEXTO = { noclaro: 'si no entendió', falla2: 'si falla dos veces', repaso: 'en el repaso' } as const
// La explicación se ve como la leerá el estudiante, con el mismo formateo seguro del Tutor.
const html = computed(() => (props.borrador.tipo === 'leccion' || props.borrador.tipo === 'alternativa' ? formatTutorMessage(props.borrador.explicacion) : ''))

/** Subir, bajar y quitar: tres botones pequeños con su nombre accesible. */
const Controles = defineComponent({
  props: { i: { type: Number, required: true }, n: { type: Number, required: true }, que: { type: String, required: true } },
  emits: ['mover', 'quitar'],
  setup(p, { emit: e }) {
    const boton = (icono: typeof X, etiqueta: string, titulo: string, deshabilitado: boolean, accion: () => void) =>
      h('button', { type: 'button', class: 'control', disabled: deshabilitado, 'aria-label': etiqueta, title: titulo, onClick: accion }, [h(icono, { size: 13, 'aria-hidden': 'true' })])
    return () => h('span', { class: 'flex shrink-0' }, [
      boton(ArrowUp, `Subir ${p.que}`, 'Subir', p.i === 0, () => e('mover', -1)),
      boton(ArrowDown, `Bajar ${p.que}`, 'Bajar', p.i === p.n - 1, () => e('mover', 1)),
      boton(X, `Quitar ${p.que}`, 'Quitar', p.n <= 1, () => e('quitar')),
    ])
  },
})

// Cada cambio arma un borrador nuevo (sin tocar el que llegó) y lo entrega al panel.
const estructura = (fn: (b: BorradorEstructura) => BorradorEstructura['modulos']) => {
  if (props.borrador.tipo === 'estructura') emit('cambiar', { ...props.borrador, modulos: fn(props.borrador) })
}
const ejercicios = (fn: (b: BorradorEjercicios) => BorradorEjercicios['ejercicios']) => {
  if (props.borrador.tipo === 'ejercicios') emit('cambiar', { ...props.borrador, ejercicios: fn(props.borrador) })
}
const conTemas = (b: BorradorEstructura, i: number, fn: (t: BorradorEstructura['modulos'][number]['temas']) => BorradorEstructura['modulos'][number]['temas']) =>
  b.modulos.map((m, x) => (x === i ? { ...m, temas: fn(m.temas) } : m))

const moverModulo = (i: number, d: number) => estructura((b) => moverItem(b.modulos, i, i + d))
const quitarModulo = (i: number) => estructura((b) => quitarItem(b.modulos, i))
const cambiarModulo = (i: number, titulo: string) => estructura((b) => b.modulos.map((m, x) => (x === i && titulo.trim() ? { ...m, titulo: titulo.trim() } : m)))
const cambiarLecciones = (i: number, j: number, fn: (ls: BorradorEstructura['modulos'][number]['temas'][number]['lecciones']) => BorradorEstructura['modulos'][number]['temas'][number]['lecciones']) =>
  estructura((b) => conTemas(b, i, (ts) => ts.map((t, y) => (y === j ? { ...t, lecciones: fn(t.lecciones) } : t))))
const moverLeccion = (i: number, j: number, k: number, d: number) => cambiarLecciones(i, j, (ls) => moverItem(ls, k, k + d))
const quitarLeccion = (i: number, j: number, k: number) => cambiarLecciones(i, j, (ls) => quitarItem(ls, k))
const cambiarLeccion = (i: number, j: number, k: number, titulo: string) => cambiarLecciones(i, j, (ls) => ls.map((l, z) => (z === k && titulo.trim() ? { ...l, titulo: titulo.trim() } : l)))

const moverEjercicio = (i: number, d: number) => ejercicios((b) => moverItem(b.ejercicios, i, i + d))
const quitarEjercicio = (i: number) => ejercicios((b) => quitarItem(b.ejercicios, i))
const cambiarEnunciado = (i: number, texto: string) => ejercicios((b) => b.ejercicios.map((e, x) => (x === i && texto.trim() ? { ...e, enunciado: texto.trim() } : e)))
const marcarCorrecta = (i: number, k: number) => ejercicios((b) => b.ejercicios.map((e, x) => (x === i ? { ...e, correcta: k } : e)))
</script>

<style scoped>
.campo { @apply flex-1 min-w-0 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-base-texto-primario hover:border-base-borde-sutil focus:border-base-borde-fuerte focus:bg-base-blanco focus:outline-none focus:ring-2 focus:ring-stire-blue/20 disabled:hover:border-transparent; }
:deep(.control) { @apply w-7 h-7 grid place-items-center rounded-md text-base-texto-secundario hover:text-base-texto-primario hover:bg-base-bg-secundario disabled:opacity-30 disabled:pointer-events-none; }
</style>
