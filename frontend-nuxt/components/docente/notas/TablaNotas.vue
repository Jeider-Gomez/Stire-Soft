<template>
  <!-- La tabla de notas (antes dentro de pages/docente/clase/[classId]/notas.vue): cada nota, la de cada módulo, la que
       propone STIRE y la final. Las notas «a mano» se escriben en la celda; la final se ajusta con motivo e historial. -->
  <div v-if="libro && libro.esquema">
  
    <p v-if="libro.filas.length === 0" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-center">
      Todavía no hay estudiantes en la clase.
    </p>
    <section v-else class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <caption class="sr-only">Notas por estudiante: cada nota, la de cada módulo, la que propone STIRE y la final</caption>
          <thead class="bg-base-bg-secundario text-slate-600">
            <tr>
              <th scope="col" class="text-left font-semibold px-3 py-2 sticky left-0 bg-base-bg-secundario min-w-[10rem]">Estudiante</th>
              <th v-for="col in columnas" :key="col.clave" scope="col" class="text-left font-semibold px-3 py-2 min-w-[8rem]" :class="col.tipo === 'modulo' ? 'bg-acento-ambar/10 text-base-texto-primario' : ''">
                {{ col.titulo }} <span v-if="col.porcentaje" class="font-normal">({{ col.porcentaje }})</span>
              </th>
              <th v-if="libro.esquema.calculo !== 'ninguno'" scope="col" class="text-left font-semibold px-3 py-2 min-w-[7rem]">Propuesta</th>
              <th scope="col" class="text-left font-semibold px-3 py-2 min-w-[9rem]">Final</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="f in libro.filas" :key="f.studentId">
              <tr class="border-t border-base-borde-sutil align-top">
                <th scope="row" class="text-left font-semibold px-3 py-2 sticky left-0 bg-base-blanco">
                  <NuxtLink :to="`/docente/estudiante/${f.studentId}?clase=${classId}`" class="hover:underline">{{ f.nombre }}</NuxtLink>
                </th>
                <td v-for="col in columnas" :key="col.clave" class="px-3 py-2" :class="col.tipo === 'modulo' ? 'bg-acento-ambar/5' : ''">
                  <template v-if="col.tipo === 'modulo'">
                    <span class="font-bold" :class="claseNota(notaModulo(f, col.moduloId))">{{ notaModulo(f, col.moduloId) === null ? '—' : notaComa(notaModulo(f, col.moduloId)) }}</span>
                    <span v-if="f.modulos[String(col.moduloId)]?.faltan.length" class="block text-[10px] text-base-texto-secundario">Falta: {{ f.modulos[String(col.moduloId)]?.faltan.join(', ') }}</span>
                  </template>
                  <template v-else-if="col.componente.tipo === 'manual'">
                    <input
                      :value="notaComa(f.componentes[col.clave]?.nota)"
                      inputmode="decimal"
                      :aria-label="`${col.titulo} de ${f.nombre}`"
                      :aria-invalid="errorCelda[celdaId(f.studentId, col.clave)] ? true : undefined"
                      placeholder="—"
                      class="w-16 min-h-[44px] sm:min-h-0 px-2 py-1.5 rounded-md border bg-base-blanco"
                      :class="errorCelda[celdaId(f.studentId, col.clave)] ? 'border-semantico-falla' : 'border-base-borde-fuerte'"
                      @change="(ev) => guardarManual(f, col.clave, ev)"
                    />
                    <span v-if="guardandoCelda === celdaId(f.studentId, col.clave)" class="block text-[10px] text-base-texto-secundario">Guardando…</span>
                    <span v-else-if="errorCelda[celdaId(f.studentId, col.clave)]" role="alert" class="block text-[10px] text-semantico-falla">{{ errorCelda[celdaId(f.studentId, col.clave)] }}</span>
                  </template>
                  <template v-else>
                    <span class="font-bold" :class="claseNota(f.componentes[col.clave]?.nota)">{{ f.componentes[col.clave]?.nota == null ? '—' : notaComa(f.componentes[col.clave]?.nota) }}</span>
                    <span class="block text-[10px] text-base-texto-secundario">{{ f.componentes[col.clave]?.detalle }}</span>
                  </template>
                </td>
                <td v-if="libro.esquema.calculo !== 'ninguno'" class="px-3 py-2">
                  <span class="font-bold" :class="claseNota(f.propuesta)">{{ f.propuesta === null ? '—' : notaComa(f.propuesta) }}</span>
                  <span v-if="f.faltan.length" class="block text-[10px] text-base-texto-secundario">Falta: {{ f.faltan.join(', ') }}</span>
                </td>
                <td class="px-3 py-2">
                  <span class="font-bold text-sm" :class="claseNota(f.final)">{{ f.final === null ? '—' : notaComa(f.final) }}</span>
                  <span v-if="f.ajuste" class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info">{{ libro.esquema.calculo === 'ninguno' ? 'Puesta por ti' : 'Ajustada' }}</span>
                  <button type="button" class="block mt-1 min-h-[44px] sm:min-h-0 text-[11px] font-semibold text-acento-ambar-fuerte hover:underline" :aria-expanded="abierto === f.studentId" :aria-label="`${abierto === f.studentId ? 'Cerrar' : libro.esquema.calculo === 'ninguno' ? 'Poner la nota final' : 'Ajustar la nota final'} de ${f.nombre}`" @click="abrirAjuste(f)">
                    {{ abierto === f.studentId ? 'Cerrar' : libro.esquema.calculo === 'ninguno' ? 'Poner final · historial' : 'Ajustar · historial' }}
                  </button>
                </td>
              </tr>
              <!-- Ajuste (o nota final a mano) con motivo, e historial de lo que cambió -->
              <tr v-if="abierto === f.studentId" class="bg-base-bg-secundario/60">
                <td :colspan="columnas.length + (libro.esquema.calculo !== 'ninguno' ? 3 : 2)" class="px-3 py-4">
                  <form class="flex flex-col lg:flex-row gap-3 lg:items-end max-w-3xl" @submit.prevent="guardarAjuste(f)">
                    <label class="text-[11px] font-semibold text-base-texto-primario">
                      Nota final
                      <input v-model="ajuste.nota" inputmode="decimal" required class="block mt-1 w-20 min-h-[44px] sm:min-h-0 px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco font-normal" />
                    </label>
                    <label class="text-[11px] font-semibold text-base-texto-primario flex-1">
                      Motivo (queda en el historial)
                      <input v-model="ajuste.motivo" maxlength="500" required placeholder="Ej.: presentó el supletorio del parcial" class="block mt-1 w-full min-h-[44px] sm:min-h-0 px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco font-normal" />
                    </label>
                    <div class="flex gap-2">
                      <button type="submit" :disabled="guardandoAjuste" class="min-h-[44px] px-3 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs disabled:opacity-40">Guardar</button>
                      <button v-if="f.ajuste" type="button" :disabled="guardandoAjuste" class="min-h-[44px] px-3 py-2 rounded-md borde-afordancia text-xs font-semibold" @click="quitarAjuste(f)">Quitar</button>
                    </div>
                  </form>
                  <p v-if="errorAjuste" role="alert" class="text-xs text-semantico-falla mt-2">{{ errorAjuste }}</p>
                  <div class="mt-4">
                    <h3 class="text-[11px] font-bold uppercase tracking-wider text-base-texto-secundario">Historial</h3>
                    <p v-if="historial.length === 0" class="text-xs text-base-texto-secundario mt-1">Sin cambios todavía.</p>
                    <ol v-else class="mt-1 space-y-1 text-xs">
                      <li v-for="h in historial" :key="h.id">
                        <span class="text-base-texto-secundario">{{ fechaCorta(h.createdAt) }} ·</span>
                        {{ h.nombre }}: {{ h.antes === null ? '—' : notaComa(h.antes) }} → {{ h.despues === null ? '—' : notaComa(h.despues) }}
                        <span v-if="h.motivo" class="text-base-texto-secundario">· «{{ h.motivo }}»</span>
                      </li>
                    </ol>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, reactive, ref } from 'vue'
import { CLAVE_NOTAS_CLASE, type EventoNota } from '~/composables/useNotasClase'
import { fechaCorta } from '~/utils/entregas'
import { columnasDelLibro, leerNota, notaComa, type FilaLibro } from '~/utils/calificaciones'

const estado = inject(CLAVE_NOTAS_CLASE)
if (!estado) throw new Error('TablaNotas necesita useNotasClase() con provide(CLAVE_NOTAS_CLASE).')
const { libro, classId, ponerNota, historialDe } = estado

const guardandoCelda = ref<string | null>(null)
const errorCelda = reactive<Record<string, string>>({})
const abierto = ref<number | null>(null)
const ajuste = reactive({ nota: '', motivo: '' })
const guardandoAjuste = ref(false)
const errorAjuste = ref<string | null>(null)
const historial = ref<EventoNota[]>([])

const celdaId = (studentId: number, clave: string) => `${studentId}-${clave}`
const columnas = computed(() => (libro.value?.esquema ? columnasDelLibro(libro.value.esquema, libro.value.modulos) : []))
const notaModulo = (f: FilaLibro, moduloId: number) => f.modulos[String(moduloId)]?.nota ?? null

function claseNota(n: number | null | undefined): string {
  const esquema = libro.value?.esquema
  if (n === null || n === undefined || !esquema) return 'text-base-texto-secundario'
  return n >= esquema.notaAprobatoria ? 'text-base-texto-primario' : 'text-semantico-falla'
}

// ─── Notas a mano ───
async function guardarManual(f: FilaLibro, clave: string, ev: Event) {
  if (!(ev.target instanceof HTMLInputElement)) return
  const id = celdaId(f.studentId, clave)
  const valor = leerNota(ev.target.value)
  if (valor === undefined) {
    errorCelda[id] = 'De 0,0 a 5,0'
    return
  }
  delete errorCelda[id]
  guardandoCelda.value = id
  const err = await ponerNota(f.studentId, { clave, nota: valor })
  if (err) errorCelda[id] = err
  guardandoCelda.value = null
}

// ─── Ajuste de la final, con motivo e historial ───
async function abrirAjuste(f: FilaLibro) {
  if (abierto.value === f.studentId) {
    abierto.value = null
    return
  }
  abierto.value = f.studentId
  ajuste.nota = notaComa(f.final)
  ajuste.motivo = f.ajuste?.motivo ?? ''
  errorAjuste.value = null
  historial.value = []
  historial.value = await historialDe(f.studentId)
}

async function enviarAjuste(f: FilaLibro, cuerpo: { nota: number | null; motivo?: string }) {
  guardandoAjuste.value = true
  errorAjuste.value = await ponerNota(f.studentId, { clave: 'final', ...cuerpo })
  if (!errorAjuste.value) historial.value = await historialDe(f.studentId)
  guardandoAjuste.value = false
}

async function guardarAjuste(f: FilaLibro) {
  const valor = leerNota(ajuste.nota)
  if (valor === undefined || valor === null) {
    errorAjuste.value = 'La nota va de 0,0 a 5,0.'
    return
  }
  await enviarAjuste(f, { nota: valor, motivo: ajuste.motivo })
}

async function quitarAjuste(f: FilaLibro) {
  await enviarAjuste(f, { nota: null })
  ajuste.nota = notaComa(libro.value?.filas.find((x) => x.studentId === f.studentId)?.final)
  ajuste.motivo = ''
}
</script>
