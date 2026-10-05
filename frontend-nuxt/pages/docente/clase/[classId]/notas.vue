<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <DocentePestanasClase :class-id="classId" activa="notas" :nombre="clase?.name" :codigo="clase?.code" />

    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Notas de la clase</h1>
        <p class="text-xs text-base-texto-secundario mt-1 max-w-2xl">
          Opcional y a tu manera. Agrega las notas que quieras: las que STIRE calcula (el dominio de las lecciones, las
          entregas) y las que pones tú, también de actividades en el salón. Cada una puede ser del curso entero o de un
          módulo; usas porcentajes, promedias o solo registras. Las notas oficiales van a Moodle: descarga el archivo y
          súbelo en «Importar calificaciones».
        </p>
      </div>
      <button v-if="libro?.esquema" type="button" :disabled="libro.filas.length === 0" @click="descargarCsv"
        class="min-h-[44px] px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs inline-flex items-center gap-1.5 shrink-0 self-start disabled:opacity-40">
        <Download :size="14" aria-hidden="true" /> Descargar para Moodle (CSV)
      </button>
    </header>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Calculando las notas…
    </p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

    <template v-if="libro">
      <!-- ─── Sin notas: es opcional. Formas de empezar, que después se cambian por completo. ─── -->
      <section v-if="!libro.esquema && !borrador" class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm p-6 space-y-4">
        <div>
          <h2 class="text-sm font-bold text-base-texto-primario">Esta clase no lleva notas en STIRE</h2>
          <p class="text-xs text-base-texto-secundario mt-1">No es obligatorio. Si quieres llevarlas aquí, elige cómo empezar; después cambias lo que quieras.</p>
        </div>
        <ul class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <li v-for="forma in formasDeEmpezar(libro.modulos)" :key="forma.id">
            <button type="button" class="w-full h-full text-left rounded-lg border border-base-borde-fuerte p-4 hover:border-acento-ambar-fuerte hover:bg-acento-ambar/5 transition-colors" @click="empezarCon(forma.esquema)">
              <span class="block text-sm font-bold text-base-texto-primario">{{ forma.titulo }}</span>
              <span class="block text-[11px] text-base-texto-secundario mt-1">{{ forma.descripcion }}</span>
            </button>
          </li>
        </ul>
      </section>

      <DocenteNotasFormularioEsquema />

      <template v-if="libro.esquema">
        <!-- ─── Resumen ─── -->
        <section v-if="libro.esquema.calculo !== 'ninguno' || libro.filas.some((f) => f.final !== null)" aria-label="Resumen de la clase" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
            <p class="text-[11px] text-base-texto-secundario">Promedio de la clase</p>
            <p class="text-xl font-bold text-base-texto-primario">{{ libro.resumen.promedio === null ? '—' : notaComa(libro.resumen.promedio) }}</p>
          </div>
          <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
            <p class="text-[11px] text-base-texto-secundario">Aprueban</p>
            <p class="text-xl font-bold text-semantico-pasa">{{ libro.resumen.aprueban }}</p>
          </div>
          <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
            <p class="text-[11px] text-base-texto-secundario">Por debajo de {{ notaComa(libro.esquema.notaAprobatoria) }}</p>
            <p class="text-xl font-bold text-semantico-falla">{{ libro.resumen.reprueban }}</p>
          </div>
          <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
            <p class="text-[11px] text-base-texto-secundario">Sin nota todavía</p>
            <p class="text-xl font-bold text-base-texto-primario">{{ libro.resumen.sinNota }}</p>
          </div>
        </section>

        <!-- La tabla: cada nota, la de cada módulo, la propuesta y la final, con ajuste e historial -->
        <DocenteNotasTablaNotas />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
// Notas de la clase: la página organiza. Los datos y la API están en composables/useNotasClase.ts; cómo se arman las
// notas, en components/docente/notas/FormularioEsquema.vue, y la tabla con sus ajustes, en TablaNotas.vue (PAT-01;
// antes 584 líneas).
import { onMounted, provide } from 'vue'
import { Download, Loader2 } from 'lucide-vue-next'
import { CLAVE_NOTAS_CLASE, useNotasClase } from '~/composables/useNotasClase'
import { csvParaMoodle, formasDeEmpezar, nombreArchivoNotas, notaComa } from '~/utils/calificaciones'

definePageMeta({ layout: 'teacher' })

const route = useRoute()
const classId = Number(route.params.classId)
const estado = useNotasClase(classId)
provide(CLAVE_NOTAS_CLASE, estado)
const { clase, libro, borrador, cargando, error, empezarCon } = estado

// ─── Exportar ───
function descargarCsv() {
  if (!libro.value) return
  const url = URL.createObjectURL(new Blob([csvParaMoodle(libro.value)], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivoNotas(clase.value?.name ?? 'clase', new Date())
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

onMounted(estado.cargar)
</script>
