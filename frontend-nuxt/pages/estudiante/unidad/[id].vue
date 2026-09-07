<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Migajas de Pan / Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <NuxtLink to="/estudiante" class="hover:underline">Inicio</NuxtLink>
      <span>›</span>
      <span>{{ unitData.moduleTitle }}</span>
      <span>›</span>
      <span class="font-bold text-base-texto-primario">{{ unitData.title }}</span>
    </nav>

    <!-- Cabecera de la Lección (EST-V02) -->
    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info uppercase tracking-wider">
          Lección Teórica • Unidad {{ unitData.id }}
        </span>
        <span class="text-xs text-base-texto-secundario">• Tiempo estimado: 15 min</span>
      </div>

      <h1 class="text-xl md:text-2xl font-bold text-base-texto-primario tracking-tight">
        Lección: {{ unitData.title }}
      </h1>
      <p class="text-xs text-base-texto-secundario mt-1">
        {{ unitData.description }}
      </p>
    </header>

    <!-- Cuerpo del Contenido (Diseño de lectura limpio ~750px) -->
    <article class="bg-base-blanco rounded-xl border border-base-borde-sutil p-6 md:p-8 shadow-sm space-y-6 text-xs text-base-texto-primario leading-relaxed">
      <section class="space-y-3">
        <h2 class="text-sm font-bold text-base-texto-primario border-b border-base-borde-sutil pb-2">
          1. Concepto Fundamental y Modelo Mental
        </h2>
        <p>
          En ciencias de la computación, una estructura de ciclo permite repetir un bloque de instrucciones de manera determinística o condicional. La clave para evitar <em>ciclos infinitos</em> radica en asegurar que la expresión de control modifique su estado en cada iteración hasta que la condición se evalúe como <code>false</code>.
        </p>
      </section>

      <!-- Bloque de Código de Ejemplo -->
      <section class="space-y-2">
        <h3 class="text-xs font-bold text-base-texto-primario">Ejemplo de Recorrido con Acumulador:</h3>
        <div class="rounded-lg bg-[#24292e] text-base-blanco p-4 font-codigo text-xs overflow-x-auto shadow-inner">
          <pre><code><span class="text-[#f97583]">function</span> <span class="text-[#b392f0]">calcularSumaPares</span>(limite) {
  <span class="text-[#f97583]">let</span> total = <span class="text-[#79b8ff]">0</span>;
  <span class="text-[#f97583]">for</span> (<span class="text-[#f97583]">let</span> i = <span class="text-[#79b8ff]">1</span>; i &lt;= limite; i++) {
    <span class="text-[#f97583]">if</span> (i % <span class="text-[#79b8ff]">2</span> === <span class="text-[#79b8ff]">0</span>) {
      total += i;
    }
  }
  <span class="text-[#f97583]">return</span> total;
}</code></pre>
        </div>
      </section>

      <!-- 🔍 TRAZADO DE MEMORIA INTERACTIVO (P07 — Codificación Dual / Insumo 15 §8) -->
      <section class="bg-base-bg-secundario/70 border border-base-borde-fuerte rounded-xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">🧠</span>
            <div>
              <h3 class="font-bold text-xs text-base-texto-primario">
                Máquina Nocional: Trazado de Memoria en Vivo
              </h3>
              <p class="text-[11px] text-base-texto-secundario">
                Observa cómo mutan las variables en la pila de memoria paso a paso
              </p>
            </div>
          </div>

          <!-- Controles de Trazado ◀ ▶ -->
          <div class="flex items-center gap-1.5 bg-base-blanco border border-base-borde-fuerte rounded-lg p-1 shadow-sm">
            <button
              @click="prevTraceStep"
              :disabled="currentStep === 1"
              class="px-2.5 py-1 rounded text-xs font-bold hover:bg-base-bg-secundario disabled:opacity-30 transition-colors"
              title="Paso anterior">
              ◀
            </button>
            <span class="px-2 text-xs font-bold text-acento-ambar-fuerte">
              Paso {{ currentStep }} de {{ traceSteps.length }}
            </span>
            <button
              @click="nextTraceStep"
              :disabled="currentStep === traceSteps.length"
              class="px-2.5 py-1 rounded text-xs font-bold hover:bg-base-bg-secundario disabled:opacity-30 transition-colors"
              title="Paso siguiente">
              ▶
            </button>
          </div>
        </div>

        <!-- Estado Actual de la Pila de Variables -->
        <div class="bg-base-blanco rounded-lg border border-base-borde-sutil p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-[11px] font-semibold text-base-texto-secundario mb-1">Línea Ejecutada:</p>
              <div class="p-2.5 bg-base-bg-secundario rounded font-codigo text-xs text-acento-ambar-fuerte border border-base-borde-sutil">
                {{ traceSteps[currentStep - 1].lineExecuted }}
              </div>
              <p class="text-[11px] text-base-texto-secundario mt-2">
                <strong>Explicación:</strong> {{ traceSteps[currentStep - 1].explanation }}
              </p>
            </div>

            <div>
              <p class="text-[11px] font-semibold text-base-texto-secundario mb-1">Tabla de Estado de Variables:</p>
              <table class="w-full text-xs text-left border border-base-borde-sutil rounded overflow-hidden">
                <thead class="bg-base-bg-secundario text-base-texto-primario">
                  <tr>
                    <th class="p-2 border-b border-base-borde-sutil font-bold">Variable</th>
                    <th class="p-2 border-b border-base-borde-sutil font-bold">Valor Actual</th>
                    <th class="p-2 border-b border-base-borde-sutil font-bold">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="v in traceSteps[currentStep - 1].variables" :key="v.name" class="border-b border-base-borde-sutil/50">
                    <td class="p-2 font-codigo text-acento-ambar-fuerte font-semibold">{{ v.name }}</td>
                    <td class="p-2 font-codigo">{{ v.value }}</td>
                    <td class="p-2 text-base-texto-secundario">{{ v.type }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Botón de Navegación al Ejercicio Práctico (Zona D) -->
      <div class="pt-4 border-t border-base-borde-sutil flex items-center justify-between">
        <NuxtLink
          to="/estudiante"
          class="borde-afordancia px-4 py-2 rounded-md text-xs font-semibold bg-base-blanco text-base-texto-primario">
          ◀ Volver al Menú
        </NuxtLink>

        <NuxtLink
          :to="`/estudiante/evaluacion/${unitData.exerciseActivityId}`"
          class="px-5 py-2.5 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold text-xs transition-colors shadow-sm flex items-center gap-2">
          <span>Pasar al Ejercicio Práctico</span>
          <span>▶</span>
        </NuxtLink>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { useStudentStore } from '~/stores/student'

definePageMeta({
  layout: 'student'
})

const route = useRoute()
const studentStore = useStudentStore()

const unitId = Number(route.params.id) || 1
const unitData = computed(() => {
  return studentStore.modules.flatMap(m => m.units).find(u => u.id === unitId) || studentStore.modules[0].units[0]
})

// Pasos del Trazador Interactivo (P07)
const currentStep = ref(1)

const traceSteps = [
  {
    step: 1,
    lineExecuted: 'let total = 0;',
    explanation: 'Se asigna espacio en memoria para la variable acumuladora total con valor inicial 0.',
    variables: [
      { name: 'limite', value: '4', type: 'number' },
      { name: 'total', value: '0', type: 'number' },
      { name: 'i', value: 'undefined', type: 'undefined' }
    ]
  },
  {
    step: 2,
    lineExecuted: 'for (let i = 1; i <= limite; i++) [Iteración 1]',
    explanation: 'Se inicializa el contador i = 1. Se evalúa (1 <= 4) -> true. Como 1 % 2 !== 0, no se acumula.',
    variables: [
      { name: 'limite', value: '4', type: 'number' },
      { name: 'total', value: '0', type: 'number' },
      { name: 'i', value: '1', type: 'number' }
    ]
  },
  {
    step: 3,
    lineExecuted: 'total += i; [Iteración 2, i=2]',
    explanation: 'i se incrementa a 2. La condición (2 % 2 === 0) es verdadera. total pasa a ser 0 + 2 = 2.',
    variables: [
      { name: 'limite', value: '4', type: 'number' },
      { name: 'total', value: '2', type: 'number' },
      { name: 'i', value: '2', type: 'number' }
    ]
  },
  {
    step: 4,
    lineExecuted: 'total += i; [Iteración 4, i=4]',
    explanation: 'Tras i=3 (impar), i llega a 4 (par). Se suma total = 2 + 4 = 6. Siguiente i=5 termina el ciclo.',
    variables: [
      { name: 'limite', value: '4', type: 'number' },
      { name: 'total', value: '6', type: 'number' },
      { name: 'i', value: '4', type: 'number' }
    ]
  }
]

function nextTraceStep() {
  if (currentStep.value < traceSteps.length) {
    currentStep.value++
  }
}

function prevTraceStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}
</script>
