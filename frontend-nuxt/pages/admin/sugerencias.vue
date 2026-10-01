<template>
  <div class="max-w-5xl mx-auto space-y-5">
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm space-y-3">
      <h1 class="text-xl font-bold text-base-texto-primario flex items-center gap-2">
        <MessageSquarePlus :size="22" class="text-acento-ambar-fuerte" aria-hidden="true" /> Sugerencias
      </h1>
      <p class="text-xs text-base-texto-secundario">
        Lo que envían los usuarios con el botón «Sugerencias»: problemas, cosas confusas e ideas, con la pantalla, el dispositivo
        y la clase. Lo que más afecta va primero. Quien lo envió ve el estado y tu nota.
      </p>
      <div class="flex flex-wrap items-center gap-2 text-xs" role="group" aria-label="Filtrar por estado">
        <button v-for="(texto, valor) in FILTROS" :key="valor" type="button" class="px-3 py-1.5 rounded-full border"
          :class="filtro === valor ? 'border-acento-ambar-fuerte bg-acento-ambar/10 font-semibold' : 'border-base-borde-fuerte'"
          :aria-pressed="filtro === valor" @click="cambiarFiltro(valor)">
          {{ texto }}
        </button>
        <button type="button" :disabled="!lista.length" class="ml-auto px-3 py-1.5 rounded-md borde-afordancia font-semibold inline-flex items-center gap-1.5 disabled:opacity-40" @click="descargarCsv">
          <Download :size="14" aria-hidden="true" /> Descargar CSV
        </button>
      </div>
    </header>

    <p v-if="cargando" role="status" class="text-xs text-base-texto-secundario">Cargando…</p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>
    <p v-if="!cargando && !lista.length" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-center">
      No hay sugerencias {{ filtro === 'todos' ? '' : `«${FILTROS[filtro].toLowerCase()}»` }}.
    </p>

    <ul class="space-y-3">
      <li v-for="r in lista" :key="r.id" class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4 space-y-2 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2 py-0.5 rounded font-bold" :class="r.gravedad === 3 ? 'bg-semantico-falla/10 text-semantico-falla' : r.gravedad === 2 ? 'bg-acento-ambar/15 text-acento-ambar-fuerte' : 'bg-base-bg-secundario text-base-texto-secundario'">
            {{ TIPOS[r.tipo] }}{{ r.gravedad ? ` · ${GRAVEDADES[r.gravedad]}` : '' }}
          </span>
          <span class="font-semibold">{{ r.autor }}</span>
          <span class="text-base-texto-secundario">{{ r.rol }} · {{ fechaCorta(r.createdAt) }}</span>
          <span v-if="r.clase" class="px-2 py-0.5 rounded bg-semantico-info/10 text-semantico-info font-semibold">{{ r.clase }}</span>
        </div>
        <p class="text-sm text-base-texto-primario whitespace-pre-line">{{ r.texto }}</p>
        <p class="text-[11px] text-base-texto-secundario break-all">
          <span class="font-mono">{{ r.ruta }}</span> · {{ r.dispositivo }}
        </p>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
          <label class="sr-only" :for="`estado-${r.id}`">Estado</label>
          <select :id="`estado-${r.id}`" v-model="r.estado" class="px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco">
            <option v-for="(texto, valor) in ESTADOS" :key="valor" :value="valor">{{ texto }}</option>
          </select>
          <label class="sr-only" :for="`nota-${r.id}`">Nota para quien lo envió</label>
          <input :id="`nota-${r.id}`" v-model="r.notaEditada" maxlength="1000" placeholder="Nota para quien lo envió (opcional)" class="flex-1 min-w-0 px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco" />
          <button type="button" class="px-3 py-1.5 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold" @click="guardar(r)">Guardar</button>
          <span v-if="guardado === r.id" role="status" class="text-semantico-pasa font-semibold">Guardado</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Download, MessageSquarePlus } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { fechaCorta } from '~/utils/entregas'

definePageMeta({ layout: 'admin' })

type Estado = 'nuevo' | 'visto' | 'resuelto' | 'descartado'
interface Reporte {
  id: number; autor: string; rol: string; tipo: 'problema' | 'confuso' | 'idea'; gravedad: number | null
  texto: string; ruta: string; dispositivo: string; clase: string; estado: Estado; nota: string | null; createdAt: string; notaEditada?: string
}

const TIPOS = { problema: 'Problema', confuso: 'Confuso', idea: 'Idea' }
const GRAVEDADES: Record<number, string> = { 1: 'detalle', 2: 'confunde', 3: 'bloquea' }
const ESTADOS: Record<Estado, string> = { nuevo: 'Nuevo', visto: 'Visto', resuelto: 'Resuelto', descartado: 'Descartado' }
const FILTROS: Record<'todos' | Estado, string> = { todos: 'Todos', nuevo: 'Nuevos', visto: 'Vistos', resuelto: 'Resueltos', descartado: 'Descartados' }

const api = useApi()
const { messageOf } = useApiErrorMessage()
const lista = ref<Reporte[]>([])
const filtro = ref<'todos' | Estado>('nuevo')
const cargando = ref(true)
const error = ref<string | null>(null)
const guardado = ref<number | null>(null)

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    const datos = await api.get<Reporte[]>(filtro.value === 'todos' ? '/reportes' : `/reportes?estado=${filtro.value}`)
    lista.value = datos.map((r) => ({ ...r, notaEditada: r.nota ?? '' }))
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar las sugerencias.')
  } finally {
    cargando.value = false
  }
}

function cambiarFiltro(valor: 'todos' | Estado) {
  filtro.value = valor
  cargar()
}

async function guardar(r: Reporte) {
  try {
    await api.patch(`/reportes/${r.id}`, { estado: r.estado, nota: r.notaEditada })
    guardado.value = r.id
    setTimeout(() => { if (guardado.value === r.id) guardado.value = null }, 2000)
  } catch (err) {
    error.value = messageOf(err, 'No se pudo guardar.')
  }
}

/** Para pasar los hallazgos de la prueba a una tabla (docs/calidad/PRUEBA_DOS_SEMANAS.md). */
function descargarCsv() {
  const celda = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
  const filas = [['Fecha', 'Autor', 'Rol', 'Clase', 'Tipo', 'Gravedad', 'Texto', 'Pantalla', 'Dispositivo', 'Estado', 'Nota']]
    .concat(lista.value.map((r) => [r.createdAt, r.autor, r.rol, r.clase, TIPOS[r.tipo], r.gravedad ? String(r.gravedad) : '', r.texto, r.ruta, r.dispositivo, ESTADOS[r.estado], r.nota ?? '']))
  const url = URL.createObjectURL(new Blob(['﻿' + filas.map((f) => f.map(celda).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'sugerencias-stire.csv'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

onMounted(cargar)
</script>
