<template>
  <div class="w-full max-w-4xl mx-auto mb-6">
    <!-- Barra Superior Desplegable de la Guía de Identidad Visual -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      <div 
        @click="isOpen = !isOpen"
        class="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none bg-white hover:bg-slate-50 transition-colors">
        
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-stire-blue flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-stire-blue/20">
            ST
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Guía de Identidad Visual STIRE Soft
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stire-purple/10 text-stire-purple border border-stire-purple/20">
                Paleta Oficial & Roles
              </span>
            </div>
            <p class="text-[11px] text-slate-500">
              Universidad de Córdoba • Tokens oficiales (@theme), accesibilidad WCAG 2.1 AA y cuentas demo
            </p>
          </div>
        </div>

        <button
          type="button"
          :aria-expanded="isOpen"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:border-stire-blue transition-all">
          <span>{{ isOpen ? 'Ocultar Identidad' : 'Desplegar Guía Oficial' }}</span>
          <svg 
            class="w-4 h-4 transition-transform duration-200" 
            :class="{ 'rotate-180': isOpen }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Contenido Desplegable -->
      <div v-show="isOpen" class="border-t border-slate-200 bg-slate-50/50 p-5 space-y-6">
        
        <!-- Notificación de Copiado -->
        <div v-if="copiedColor" class="p-2.5 bg-emerald-50 border border-emerald-200 text-stire-success rounded-lg text-xs flex items-center justify-between">
          <span>✔ Código de color copiado al portapapeles: <strong>{{ copiedColor }}</strong></span>
          <button @click="copiedColor = null" class="text-[11px] underline">Cerrar</button>
        </div>

        <!-- Bloque 1: Paleta de Colores Oficial STIRE Soft -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>●</span> Paleta Oficial STIRE Soft (Tokens @theme)
            </h3>
            <span class="text-[11px] text-slate-500">Haz clic en cualquier tarjeta para copiar el valor HEX</span>
          </div>

          <!-- Grupos de Colores Oficiales -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            <!-- Grupo Primario / Institucional -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <span class="text-[11px] font-bold text-slate-700 block uppercase">1. Identidad Institucional</span>
              
              <div 
                @click="copyHex('#0B3D91', 'stire-blue')"
                class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                <div class="w-8 h-8 rounded-md bg-stire-blue shadow-xs flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 truncate">Azul Tecnológico</span>
                    <span class="text-[10px] font-mono text-slate-500">#0B3D91</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">--color-stire-blue</span>
                </div>
              </div>

              <div 
                @click="copyHex('#07275e', 'stire-blue-dark')"
                class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                <div class="w-8 h-8 rounded-md bg-stire-blue-dark shadow-xs flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 truncate">Azul Hover / Contraste</span>
                    <span class="text-[10px] font-mono text-slate-500">#07275e</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">--color-stire-blue-dark</span>
                </div>
              </div>
            </div>

            <!-- Grupo Innovación & Acción -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <span class="text-[11px] font-bold text-slate-700 block uppercase">2. Innovación & Acción</span>
              
              <div 
                @click="copyHex('#7B2FBF', 'stire-purple')"
                class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                <div class="w-8 h-8 rounded-md bg-stire-purple shadow-xs flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 truncate">Morado Tutor IA / Docente</span>
                    <span class="text-[10px] font-mono text-slate-500">#7B2FBF</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">--color-stire-purple</span>
                </div>
              </div>

              <div 
                @click="copyHex('#00C2A8', 'stire-teal')"
                class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                <div class="w-8 h-8 rounded-md bg-stire-teal shadow-xs flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 truncate">Turquesa Acción / CTA</span>
                    <span class="text-[10px] font-mono text-slate-500">#00C2A8</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">--color-stire-teal</span>
                </div>
              </div>
            </div>

            <!-- Semáforo Pedagógico -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
              <span class="text-[11px] font-bold text-slate-700 block uppercase">3. Semáforo Cognitivo</span>
              
              <div 
                @click="copyHex('#10B981', 'stire-success')"
                class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                <div class="w-8 h-8 rounded-md bg-stire-success shadow-xs flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 truncate">Dominio Alto</span>
                    <span class="text-[10px] font-mono text-slate-500">#10B981</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">--color-stire-success</span>
                </div>
              </div>

              <div 
                @click="copyHex('#F59E0B', 'stire-warning')"
                class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                <div class="w-8 h-8 rounded-md bg-stire-warning shadow-xs flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 truncate">Rezago / Refuerzo</span>
                    <span class="text-[10px] font-mono text-slate-500">#F59E0B</span>
                  </div>
                  <span class="text-[10px] text-slate-400 block">--color-stire-warning</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Bloque 2: Cuentas Demo de Prueba Rápida -->
        <div class="border-t border-slate-200 pt-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>👤</span> Cuentas Institucionales para Pruebas
            </h3>
            <span class="text-[11px] text-slate-500">Haz clic en una cuenta para cargarla en el formulario</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <button
              v-for="acc in testAccounts"
              :key="acc.email"
              type="button"
              @click="$emit('select-account', acc)"
              class="p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-stire-blue hover:bg-slate-50 transition-all group shadow-2xs">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-slate-900 group-hover:text-stire-blue">{{ acc.name }}</span>
                <span 
                  class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                  :class="getRoleBadgeClass(acc.role)">
                  {{ acc.role }}
                </span>
              </div>
              <span class="text-[11px] font-mono text-slate-500 block truncate">{{ acc.email }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['select-account'])

const isOpen = ref(false)
const copiedColor = ref<string | null>(null)

const testAccounts = [
  {
    name: 'Pedro Romero (Estudiante)',
    email: 'pedro.estudiante@unicor.edu.co',
    password: 'Test1234!',
    role: 'estudiante'
  },
  {
    name: 'Prof. Roberto Toscano (Docente)',
    email: 'rtoscano@correo.unicor.edu.co',
    password: 'Test1234!',
    role: 'docente'
  },
  {
    name: 'Admin Institucional (Administrador)',
    email: 'admin.stire@unicor.edu.co',
    password: 'Test1234!',
    role: 'administrador'
  }
]

function getRoleBadgeClass(role: string) {
  if (role === 'docente') return 'bg-stire-purple/10 text-stire-purple border-stire-purple/20'
  if (role === 'administrador') return 'bg-stire-blue/10 text-stire-blue border-stire-blue/20'
  return 'bg-stire-teal/10 text-stire-teal-dark border-stire-teal/20'
}

function copyHex(hex: string, name: string) {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(hex)
    copiedColor.value = `${name} (${hex})`
    setTimeout(() => {
      if (copiedColor.value?.includes(hex)) copiedColor.value = null
    }, 2500)
  }
}
</script>
