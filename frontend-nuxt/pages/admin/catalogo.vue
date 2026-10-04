<template>
  <!-- Catálogo académico (docs/DISENO_ORGANIZACION_Y_PLANTILLAS.md §2.2.2): el admin no busca duplicados a mano; STIRE los
       detecta y aquí se unen o se descartan con un clic. También se confirman como oficiales las que agregan los docentes. -->
  <div class="max-w-5xl mx-auto space-y-5">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-2">
      <h1 class="text-xl font-bold text-base-texto-primario flex items-center gap-2">
        <Library :size="22" class="text-acento-ambar-fuerte" aria-hidden="true" /> Catálogo académico
      </h1>
      <p class="text-xs text-base-texto-secundario">
        Los docentes agregan asignaturas al crear sus clases, sin esperar a nadie. Aquí revisas lo que STIRE detecta: la misma
        asignatura con dos nombres, y las agregadas que puedes confirmar como oficiales. Al unir, las clases pasan a la que se
        queda y el nombre viejo sigue sirviendo para buscarla.
      </p>
    </header>

    <p v-if="cargando" role="status" class="text-xs text-base-texto-secundario">Cargando…</p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    <p v-if="aviso" role="status" class="text-xs text-semantico-exito">{{ aviso }}</p>

    <section aria-labelledby="duplicados-titulo" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3">
      <h2 id="duplicados-titulo" class="text-sm font-bold text-base-texto-primario">Posibles duplicados ({{ datos.duplicados.length }})</h2>
      <p v-if="!cargando && !datos.duplicados.length" class="text-xs text-base-texto-secundario">Nada que revisar: no hay asignaturas parecidas.</p>
      <ul class="space-y-3">
        <li v-for="d in datos.duplicados" :key="`${d.a.id}-${d.b.id}`" class="rounded-lg border border-base-borde-sutil p-3 space-y-2">
          <p class="text-[11px] font-semibold text-acento-ambar-fuerte">{{ d.motivo === 'mismo código' ? 'Mismo código' : 'Nombre parecido' }}</p>
          <div class="grid sm:grid-cols-2 gap-2">
            <div v-for="x in [d.a, d.b]" :key="x.id" class="rounded-md bg-base-bg-secundario p-2.5 text-xs">
              <p class="font-semibold text-base-texto-primario">{{ x.nombre }}<span v-if="x.codigo" class="font-normal text-base-texto-secundario"> · {{ x.codigo }}</span></p>
              <p class="text-[11px] text-base-texto-secundario">{{ lugarDeAsignatura(x) }} · {{ clases(x.id) }} · {{ x.oficial ? 'oficial' : 'agregada por un docente' }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="min-h-[44px] px-3 rounded-md text-xs font-semibold borde-afordancia" :disabled="ocupado" @click="unir(d.b, d.a)">Dejar «{{ corto(d.a.nombre) }}»</button>
            <button type="button" class="min-h-[44px] px-3 rounded-md text-xs font-semibold borde-afordancia" :disabled="ocupado" @click="unir(d.a, d.b)">Dejar «{{ corto(d.b.nombre) }}»</button>
            <button type="button" class="min-h-[44px] px-3 rounded-md text-xs font-semibold text-base-texto-secundario hover:underline" :disabled="ocupado" @click="distintas(d.a, d.b)">Son distintas</button>
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="agregadas-titulo" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-5 space-y-3">
      <h2 id="agregadas-titulo" class="text-sm font-bold text-base-texto-primario">Agregadas por docentes ({{ datos.agregadas.length }})</h2>
      <p class="text-xs text-base-texto-secundario">Funcionan desde que se agregan. Confirmarlas es opcional: las oficiales salen primero en la búsqueda.</p>
      <p v-if="!cargando && !datos.agregadas.length" class="text-xs text-base-texto-secundario">Todas las asignaturas son oficiales.</p>
      <ul class="divide-y divide-base-borde-sutil">
        <li v-for="a in datos.agregadas" :key="a.id" class="flex flex-wrap items-center justify-between gap-2 py-2.5">
          <span class="text-xs min-w-0">
            <span class="font-semibold text-base-texto-primario">{{ a.nombre }}</span><span v-if="a.codigo" class="text-base-texto-secundario"> · {{ a.codigo }}</span>
            <span class="block text-[11px] text-base-texto-secundario">{{ lugarDeAsignatura(a) }} · {{ clases(a.id) }}</span>
          </span>
          <button type="button" class="min-h-[44px] px-3 rounded-md text-xs font-bold bg-acento-ambar-fuerte text-base-blanco inline-flex items-center gap-1.5" :disabled="ocupado" @click="confirmarOficial(a)">
            <BadgeCheck :size="14" aria-hidden="true" /> Confirmar como oficial
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { BadgeCheck, Library } from 'lucide-vue-next'
import { lugarDeAsignatura, type AsignaturaInfo } from '~/utils/contextoAcademico'

definePageMeta({ layout: 'admin' })

interface Revision {
  duplicados: Array<{ a: AsignaturaInfo; b: AsignaturaInfo; motivo: string }>
  agregadas: AsignaturaInfo[]
  clasesPorAsignatura: Record<number, number>
}

const api = useApi()
const { messageOf } = useApiErrorMessage()
const { confirmar } = useConfirmar()
const datos = ref<Revision>({ duplicados: [], agregadas: [], clasesPorAsignatura: {} })
const cargando = ref(true)
const ocupado = ref(false)
const error = ref('')
const aviso = ref('')

const corto = (t: string) => (t.length > 40 ? `${t.slice(0, 38)}…` : t)
const clases = (id: number) => {
  const n = datos.value.clasesPorAsignatura[id] ?? 0
  return n === 1 ? '1 clase' : `${n} clases`
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try { datos.value = await api.get<Revision>('/asignaturas/revision') } catch (e) { error.value = messageOf(e, 'No se pudo cargar el catálogo.') }
  cargando.value = false
}

async function hacer(fn: () => Promise<unknown>, texto: string) {
  ocupado.value = true
  error.value = ''
  aviso.value = ''
  try {
    await fn()
    aviso.value = texto
    await cargar()
  } catch (e) {
    error.value = messageOf(e, 'No se pudo guardar.')
  } finally {
    ocupado.value = false
  }
}

async function unir(origen: AsignaturaInfo, destino: AsignaturaInfo) {
  const ok = await confirmar({
    titulo: `¿Unir en «${destino.nombre}»?`,
    mensaje: `Las ${clases(origen.id)} de «${origen.nombre}» pasan a «${destino.nombre}», y «${origen.nombre}» se quita del catálogo (su nombre sigue sirviendo para buscar). No se deshace.`,
    accion: 'Unir',
    peligro: true,
  })
  if (ok) await hacer(() => api.post(`/asignaturas/${origen.id}/unir`, { destinoId: destino.id }), `Listo: «${origen.nombre}» quedó unida a «${destino.nombre}».`)
}
function distintas(a: AsignaturaInfo, b: AsignaturaInfo) {
  return hacer(() => api.post('/asignaturas/distintas', { aId: a.id, bId: b.id }), 'Marcadas como distintas: no volverán a salir juntas.')
}
function confirmarOficial(a: AsignaturaInfo) {
  return hacer(() => api.patch(`/asignaturas/${a.id}`, { oficial: true }), `«${a.nombre}» ya es oficial.`)
}

onMounted(cargar)
</script>
