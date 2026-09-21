<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Cabecera Institucional ADM-V01 -->
    <header class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stire-blue/10 text-stire-blue border border-stire-blue/20 uppercase tracking-wider">
            Telemetría & Salud del Sistema • ADM-V01
          </span>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-stire-success border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-stire-success animate-ping"></span>
            Clúster 100% Operacional
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Panel de Control Administrativo & Modelos IA
        </h1>
        <p class="text-xs sm:text-sm text-slate-600 mt-1">
          Universidad de Córdoba • Infraestructura de Nodos, Modelos Pedagógicos y Usuarios
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin"
          class="px-4 py-2 rounded-lg bg-stire-blue text-white font-bold text-xs hover:bg-stire-blue-dark transition-colors shadow-sm flex items-center gap-1.5">
          <span>👥</span>
          <span>Gestionar Usuarios & Roles</span>
        </NuxtLink>
      </div>
    </header>

    <!-- 1. TELEMETRÍA DE NODOS DE EJECUCIÓN (Cluster Sandboxes) -->
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🖥️</span>
            <span>Telemetría de Nodos del Clúster (Aislamiento de Código)</span>
          </h2>
          <p class="text-xs text-slate-500">Métricas de carga, memoria y aislamiento de ejecución para ejercicios de estudiantes</p>
        </div>
        <span class="text-xs font-mono font-semibold text-stire-blue bg-stire-blue/10 px-2 py-0.5 rounded">
          4/4 Nodos Activos
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="node in clusterNodes"
          :key="node.id"
          class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs font-bold text-slate-800">{{ node.name }}</span>
            <span class="inline-flex items-center gap-1 text-[10px] font-bold text-stire-success bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-stire-success"></span>
              {{ node.status }}
            </span>
          </div>

          <!-- Métricas de CPU y Memoria -->
          <div class="space-y-2 text-xs">
            <div>
              <div class="flex justify-between text-[11px] text-slate-500 mb-0.5">
                <span>Carga CPU</span>
                <span class="font-bold text-slate-800">{{ node.cpu }}%</span>
              </div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-stire-blue h-full rounded-full" :style="{ width: `${node.cpu}%` }"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[11px] text-slate-500 mb-0.5">
                <span>Memoria RAM</span>
                <span class="font-bold text-slate-800">{{ node.ram }}%</span>
              </div>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-stire-teal h-full rounded-full" :style="{ width: `${node.ram}%` }"></div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Latencia: <strong class="text-slate-800 font-mono">{{ node.latency }}ms</strong></span>
            <span>Uptime: <strong class="text-stire-success font-mono">{{ node.uptime }}</strong></span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. CONSUMO DE MODELOS IA (Tutor Socrático STIRE) -->
    <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-stire-purple"></span>
            <h2 class="text-base font-bold text-slate-900 tracking-tight">
              Consumo de Modelos IA & Tutor Socrático
            </h2>
          </div>
          <p class="text-xs text-slate-500">
            Monitorización de inferencias, generación de pistas pedagógicas y cuotas institucionales
          </p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stire-purple/10 text-stire-purple border border-stire-purple/20">
          Modelo: STIRE-Socratic-Flash-v2
        </span>
      </div>

      <!-- Tarjetas de Métricas de Modelos IA -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Tokens consumidos hoy -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <span class="text-[11px] font-semibold text-slate-500 uppercase">Tokens Hoy</span>
          <div class="text-2xl font-bold font-mono text-slate-900">248,510</div>
          <span class="text-[10px] text-slate-400">Cuota institucional: 24.8%</span>
        </div>

        <!-- Prompts / Minuto -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <span class="text-[11px] font-semibold text-slate-500 uppercase">Peticiones / Min</span>
          <div class="text-2xl font-bold font-mono text-stire-purple">46 req/m</div>
          <span class="text-[10px] text-stire-success font-semibold">Pico estable sin encolamiento</span>
        </div>

        <!-- Latencia Media Inferencia -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <span class="text-[11px] font-semibold text-slate-500 uppercase">Tiempo Inferencia</span>
          <div class="text-2xl font-bold font-mono text-stire-blue">380 ms</div>
          <span class="text-[10px] text-slate-400">P95: 520 ms con streaming</span>
        </div>

        <!-- Tasa de Resolución Socrática -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
          <span class="text-[11px] font-semibold text-slate-500 uppercase">Efectividad Tutor</span>
          <div class="text-2xl font-bold font-mono text-stire-success">96.4%</div>
          <span class="text-[10px] text-slate-400">Sin revelar soluciones directas</span>
        </div>
      </div>

      <!-- Barra de Cuota Institucional -->
      <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-700">Consumo de Cuota Institucional del Mes</span>
          <span class="font-mono font-bold text-slate-800">1,248,500 / 5,000,000 Tokens (24.9%)</span>
        </div>
        <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-stire-blue to-stire-purple h-full rounded-full" style="width: 24.9%"></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-400">
          <span>Ciclo de facturación: 1 al 30 del mes</span>
          <span class="text-stire-success font-medium">Bajo el límite institucional de seguridad</span>
        </div>
      </div>
    </section>

    <!-- 3. ACCESOS Y USUARIOS INSTITUCIONALES -->
    <section class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight">
            Gestión de Accesos & Cuentas Institucionales
          </h2>
          <p class="text-xs text-slate-500">Distribución de perfiles según la matriz de roles de la Universidad de Córdoba</p>
        </div>
        <NuxtLink
          to="/admin/usuarios"
          class="text-xs font-bold text-stire-blue hover:underline">
          Ver directorio completo →
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Estudiantes -->
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span class="text-xs text-slate-500 block">Estudiantes Activos</span>
            <span class="text-xl font-bold text-slate-900">412 usuarios</span>
            <span class="text-[10px] text-stire-teal font-semibold block mt-0.5">Rol: Matrícula Directa</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-stire-teal/10 text-stire-teal flex items-center justify-center text-lg">
            🎓
          </div>
        </div>

        <!-- Docentes -->
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span class="text-xs text-slate-500 block">Cuerpo Docente</span>
            <span class="text-xl font-bold text-slate-900">18 docentes</span>
            <span class="text-[10px] text-stire-purple font-semibold block mt-0.5">Rol: Gestión de Asignaturas</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-stire-purple/10 text-stire-purple flex items-center justify-center text-lg">
            👨‍🏫
          </div>
        </div>

        <!-- Administradores -->
        <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <span class="text-xs text-slate-500 block">Administradores</span>
            <span class="text-xl font-bold text-slate-900">3 administradores</span>
            <span class="text-[10px] text-stire-blue font-semibold block mt-0.5">Rol: Gobernanza & Infraestructura</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-stire-blue/10 text-stire-blue flex items-center justify-center text-lg">
            🛡️
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const clusterNodes = ref([
  { id: 1, name: 'Nodo Sandbox #01', status: 'Activo', cpu: 32, ram: 48, latency: 38, uptime: '99.99%' },
  { id: 2, name: 'Nodo Sandbox #02', status: 'Activo', cpu: 41, ram: 52, latency: 42, uptime: '99.98%' },
  { id: 3, name: 'Nodo Sandbox #03', status: 'Activo', cpu: 26, ram: 39, latency: 35, uptime: '100.0%' },
  { id: 4, name: 'Nodo Sandbox #04', status: 'Activo', cpu: 38, ram: 44, latency: 39, uptime: '99.97%' }
])
</script>
