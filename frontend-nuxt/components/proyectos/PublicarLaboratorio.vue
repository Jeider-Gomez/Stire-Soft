<template>
  <!-- «¿Te gustó cómo quedó? Compártelo» (cuadros «E-Proyecto-Web» y «E-Proyecto-JS»): la franja de arriba del proyecto
       abre aquí mismo, sin otra ventana, con quién compartirlo. Se publica una copia: lo que siga cambiando no se ve
       hasta «Actualizar». -->
  <section class="franja-publicar" aria-labelledby="titulo-publicar">
    <div class="flex flex-wrap items-center gap-3">
      <Sparkles :size="20" class="flex-none text-[#7c3aed]" aria-hidden="true" />
      <p id="titulo-publicar" class="m-0 flex-1 min-w-[200px] text-[15px] font-semibold">
        <template v-if="mia">Está en el Laboratorio, {{ textoAlcance(mia.alcance) }}.<span v-if="mia.oculta" class="ml-1 pastilla-inicio pastilla-sol">Tu profe lo ocultó</span></template>
        <template v-else>¿Te gustó cómo quedó? Compártelo para que tu clase lo pruebe.</template>
      </p>
      <NuxtLink v-if="mia" :to="`/estudiante/proyectos/laboratorio/${mia.id}`" class="boton-franja boton-franja-otro">Verlo</NuxtLink>
      <button type="button" class="boton-franja" :aria-expanded="abierto" aria-controls="formulario-publicar" @click="abierto = !abierto">
        {{ mia ? 'Actualizar o quitar' : 'Publicar en el Laboratorio' }} <ChevronDown :size="16" :class="{ 'rotate-180': abierto }" aria-hidden="true" />
      </button>
    </div>

    <form v-if="abierto" id="formulario-publicar" novalidate class="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]" @submit.prevent="publicar">
      <fieldset class="m-0 p-0 border-0">
        <legend class="text-sm font-bold mb-2">¿Con quién lo compartes?</legend>
        <label class="opcion-publicar"><input v-model="alcance" type="radio" value="clase" name="alcance-lab" /> <span><b>Mi clase</b><br><span class="text-[13px] text-base-texto-secundario">Lo ven tus compañeros y tu profe</span></span></label>
        <label class="opcion-publicar mt-2"><input v-model="alcance" type="radio" value="universidad" name="alcance-lab" /> <span><b>Toda la universidad</b><br><span class="text-[13px] text-base-texto-secundario">Cualquier estudiante de STIRE puede probarlo</span></span></label>
        <label v-if="clases.length > 1" class="block mt-3 text-sm font-bold" for="clase-lab">Desde la clase</label>
        <select v-if="clases.length > 1" id="clase-lab" v-model.number="classId" class="mt-1 w-full min-h-[44px] px-3 rounded-xl border border-base-borde-fuerte bg-base-blanco">
          <option v-for="c in clases" :key="c.classId" :value="c.classId">{{ c.name }}</option>
        </select>
      </fieldset>
      <div class="flex flex-col gap-2">
        <label for="descripcion-lab" class="text-sm font-bold">Cuéntales algo (si quieres)</label>
        <textarea id="descripcion-lab" v-model="descripcion" maxlength="300" rows="3" placeholder="Hice una tarjeta con un botón que muestra la sorpresa…"
          class="w-full px-3 py-2 rounded-xl border border-base-borde-fuerte bg-base-blanco text-[15px]" />
        <p class="m-0 text-[13px] text-base-texto-secundario">No cuenta para la nota. Tu profe puede ocultar algo que no esté bien.</p>
        <MensajeError v-if="error" class="text-[13px]">{{ error }}</MensajeError>
        <div class="flex flex-wrap gap-2 mt-auto">
          <button type="submit" class="boton-tinta inline-flex" :disabled="enviando || !classId">{{ mia ? 'Actualizar con lo de ahora' : 'Publicar' }}</button>
          <button v-if="mia" type="button" class="boton-franja boton-franja-otro" :disabled="enviando" @click="quitar">Quitar del Laboratorio</button>
        </div>
      </div>
    </form>
    <p role="status" class="m-0 text-[14px] font-semibold" :class="{ 'mt-2': aviso }">{{ aviso }}</p>
  </section>
</template>

<script setup lang="ts">
import { ChevronDown, Sparkles } from 'lucide-vue-next'
import { useStudentStore } from '~/stores/student'
import { useLaboratorio, type MiPublicacion } from '~/composables/useLaboratorio'
import { textoAlcance, type AlcanceLaboratorio } from '~/utils/laboratorio'

const props = defineProps<{ proyectoId: number }>()
const lab = useLaboratorio()
const studentStore = useStudentStore()
const { messageOf } = useApiErrorMessage()

const mia = ref<MiPublicacion | null>(null)
const abierto = ref(false)
const alcance = ref<AlcanceLaboratorio>('clase')
const classId = ref<number | null>(null)
const descripcion = ref('')
const enviando = ref(false)
const error = ref<string | null>(null)
const aviso = ref('')
const clases = computed(() => studentStore.enrolledClasses)

async function cargar() {
  try {
    mia.value = (await lab.mias()).find((p) => p.proyectoId === props.proyectoId) ?? null
  } catch {
    mia.value = null
  }
  if (mia.value) { alcance.value = mia.value.alcance; classId.value = mia.value.classId; descripcion.value = mia.value.descripcion }
  else classId.value = studentStore.currentClassId ?? clases.value[0]?.classId ?? null
}
onMounted(async () => {
  if (!studentStore.hasLoaded) await studentStore.fetchStudentData()
  await cargar()
})

async function publicar() {
  if (!classId.value) return
  enviando.value = true
  error.value = null
  try {
    const r = await lab.publicar({ proyectoId: props.proyectoId, classId: classId.value, alcance: alcance.value, descripcion: descripcion.value })
    aviso.value = r.actualizada ? 'Listo: el Laboratorio ya tiene lo de ahora.' : '¡Publicado! Tu clase ya puede probarlo.'
    abierto.value = false
    await cargar()
  } catch (err) {
    error.value = messageOf(err, 'No se pudo publicar.')
  } finally {
    enviando.value = false
  }
}

async function quitar() {
  if (!mia.value) return
  enviando.value = true
  try {
    await lab.quitar(mia.value.id)
    aviso.value = 'Lo quitaste del Laboratorio. Tu proyecto sigue aquí.'
    abierto.value = false
    mia.value = null
  } catch (err) {
    error.value = messageOf(err, 'No se pudo quitar.')
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.franja-publicar { padding: 14px 18px; border-radius: 18px; background: linear-gradient(90deg, rgb(var(--c-sec-lila-fondo)), rgb(var(--c-sec-menta-fondo))); color: rgb(var(--c-base-texto-primario)); }
.boton-franja { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px; border-radius: 12px; font-weight: 700; font-size: 14px; background: rgb(var(--c-base-texto-primario)); color: rgb(var(--c-base-blanco)); }
.boton-franja:hover { filter: brightness(1.12); }
.boton-franja-otro { background: rgb(var(--c-base-blanco)); color: rgb(var(--c-base-texto-primario)); border: 1px solid rgb(var(--c-base-borde-fuerte)); }
.opcion-publicar { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 12px; background: rgb(var(--c-base-blanco)); border: 1px solid rgb(var(--c-base-borde-sutil)); cursor: pointer; }
.opcion-publicar:has(input:checked) { border-color: rgb(var(--c-base-texto-primario)); box-shadow: inset 0 0 0 1px rgb(var(--c-base-texto-primario)); }
.opcion-publicar input { margin-top: 4px; }
</style>
