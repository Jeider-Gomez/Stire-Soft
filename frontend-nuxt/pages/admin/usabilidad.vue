<template>
  <!-- Resultados de la encuesta SUS (UX-08; utils/sus.ts), sin nombres: el puntaje, su lectura (Bangor, Kortum y Miller,
       2008), por rol, qué afirmación lo arrastra y qué cambiarían primero. Con 5 personas ya se encuentran la mayoría de
       los problemas de usabilidad; el SUS dice cuánto, los comentarios dicen qué. -->
  <div class="max-w-5xl mx-auto space-y-5">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-2">
      <h1 class="text-xl font-bold text-base-texto-primario flex items-center gap-2">
        <ClipboardList :size="22" class="text-acento-ambar-fuerte" aria-hidden="true" /> Encuesta de usabilidad (SUS)
      </h1>
      <p class="text-xs text-slate-600">
        Estudiantes y docentes la responden desde su inicio o su perfil. Cuenta la última respuesta de cada persona; se puede
        volver a responder a los 90 días, para medir otra vez después de los cambios.
      </p>
    </header>

    <p v-if="!datos" :role="error ? 'alert' : 'status'" class="text-xs" :class="error ? 'text-semantico-falla' : 'text-slate-600'">{{ error || 'Cargando…' }}</p>

    <template v-else>
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Resumen">
        <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 text-center">
          <p class="text-xs text-slate-600">Puntaje SUS promedio</p>
          <p class="text-3xl font-bold text-base-texto-primario">{{ datos.promedio === null ? '—' : formato(datos.promedio) }}</p>
          <p class="text-[11px] text-slate-600">de 100</p>
        </div>
        <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 text-center">
          <p class="text-xs text-slate-600">Lectura</p>
          <p class="text-sm font-bold mt-2" :class="colorAceptabilidad">{{ datos.aceptabilidad ? NOMBRE_ACEPTABILIDAD[datos.aceptabilidad] : 'Sin respuestas' }}</p>
        </div>
        <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4 text-center">
          <p class="text-xs text-slate-600">Personas que respondieron</p>
          <p class="text-3xl font-bold text-base-texto-primario">{{ datos.n }}</p>
          <p class="text-[11px] text-slate-600"><template v-for="(g, rol, i) in datos.porRol" :key="rol">{{ i ? ' · ' : '' }}{{ rol }}: {{ g.n }} ({{ formato(g.promedio) }})</template></p>
        </div>
      </section>

      <section v-if="datos.n" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3" aria-labelledby="por-afirmacion-titulo">
        <h2 id="por-afirmacion-titulo" class="text-sm font-bold text-base-texto-primario">Por afirmación</h2>
        <p class="text-[11px] text-slate-600">Promedio de 1 a 5. En las positivas, más alto es mejor; en las negativas, más bajo. Las marcadas son las que más bajan el puntaje.</p>
        <ul class="space-y-2">
          <li v-for="(a, i) in AFIRMACIONES_SUS" :key="i" class="grid grid-cols-[1fr_auto] gap-3 items-center text-xs">
            <span class="text-base-texto-primario">
              <span class="font-semibold">{{ i + 1 }}.</span> {{ a }}
              <span class="text-slate-600">({{ esPositivaSus(i) ? 'positiva' : 'negativa' }})</span>
              <span v-if="peores.includes(i)" class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">A mejorar</span>
            </span>
            <span class="font-bold text-base-texto-primario tabular-nums">{{ formato(datos.porPregunta[i]) }}</span>
          </li>
        </ul>
      </section>

      <!-- Segunda parte, por rol: dónde está la dificultad. La más difícil, arriba. -->
      <section v-for="(lista, r) in datos.tareas ?? {}" :key="r" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3" :aria-labelledby="`tareas-${r}-titulo`">
        <h2 :id="`tareas-${r}-titulo`" class="text-sm font-bold text-base-texto-primario">Facilidad de las tareas: {{ r === 'docente' ? 'docentes' : 'estudiantes' }}</h2>
        <p class="text-[11px] text-slate-600">Promedio de 1 (muy difícil) a 7 (muy fácil), de la más difícil a la más fácil. Bajo {{ FACILIDAD_ACEPTABLE }}, la tarea cuesta más de lo que debería: es la primera a mejorar.</p>
        <ul class="space-y-2">
          <li v-for="t in lista" :key="t.clave" class="grid grid-cols-[1fr_auto] gap-3 items-center text-xs">
            <span class="text-base-texto-primario">
              {{ t.texto }} <span class="text-slate-600">({{ t.n }} {{ t.n === 1 ? 'respuesta' : 'respuestas' }})</span>
              <span v-if="t.promedio !== null && t.promedio < FACILIDAD_ACEPTABLE" class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">A mejorar</span>
            </span>
            <span class="font-bold text-base-texto-primario tabular-nums">{{ t.promedio === null ? '—' : formato(t.promedio) }}</span>
          </li>
        </ul>
      </section>

      <section class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3" aria-labelledby="comentarios-titulo">
        <h2 id="comentarios-titulo" class="text-sm font-bold text-base-texto-primario">Lo que pidieron, en sus palabras</h2>
        <p class="text-[11px] text-slate-600">Estudiantes: «¿Qué te ayudaría a aprender mejor?». Docentes: «¿Qué te quitaría más trabajo?».</p>
        <p v-if="!datos.comentarios.length" class="text-xs text-slate-600">Nadie ha dejado un comentario todavía.</p>
        <ul v-else class="divide-y divide-base-borde-sutil">
          <li v-for="(c, i) in datos.comentarios" :key="i" class="py-2 text-xs">
            <p class="text-base-texto-primario">{{ c.texto }}</p>
            <p class="text-[11px] text-slate-600">{{ c.rol }} · {{ new Date(c.fecha).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' }) }}</p>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ClipboardList } from 'lucide-vue-next'
import { afirmacionesAMejorar, AFIRMACIONES_SUS, esPositivaSus, FACILIDAD_ACEPTABLE, NOMBRE_ACEPTABILIDAD, type ResumenSus } from '~/utils/sus'

definePageMeta({ layout: 'admin' })

const api = useApi()
const datos = ref<ResumenSus | null>(null)
const error = ref('')
const formato = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 })

const peores = computed(() => (datos.value?.n ? afirmacionesAMejorar(datos.value.porPregunta) : []))
const colorAceptabilidad = computed(() =>
  datos.value?.aceptabilidad === 'aceptable' ? 'text-semantico-pasa' : datos.value?.aceptabilidad === 'marginal' ? 'text-acento-ambar-fuerte' : 'text-semantico-falla',
)

onMounted(async () => {
  try {
    datos.value = await api.get<ResumenSus>('/usabilidad/sus/resultados')
  } catch {
    error.value = 'No se pudieron cargar los resultados.'
  }
})
</script>
