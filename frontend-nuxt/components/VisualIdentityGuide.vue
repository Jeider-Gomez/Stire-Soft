<template>
  <div class="w-full max-w-4xl mx-auto mb-6">
    <!-- Barra Superior Desplegable de la Guía de Identidad Visual -->
    <div class="bg-base-blanco border border-base-borde-fuerte rounded-xl shadow-sm overflow-hidden transition-all duration-300">
      <div 
        @click="isOpen = !isOpen"
        class="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none bg-base-blanco hover:bg-base-bg-secundario/50 transition-colors">
        
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-acento-ambar flex items-center justify-center text-base-blanco font-bold text-xs shadow-sm">
            🎨
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-base-texto-primario tracking-tight">
                Guía de Identidad Visual STIRE-Soft
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-acento-ambar/15 text-acento-ambar-fuerte border border-acento-ambar/30">
                Paleta Oficial & Roles
              </span>
            </div>
            <p class="text-[11px] text-base-texto-secundario">
              Paleta cromática cálida, accesibilidad WCAG 2.1 AA y usuarios de prueba (Modo Visual sin BD)
            </p>
          </div>
        </div>

        <button
          type="button"
          :aria-expanded="isOpen"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-base-texto-primario bg-base-bg-secundario border border-base-borde-sutil hover:border-acento-ambar-fuerte transition-all">
          <span>{{ isOpen ? 'Ocultar Guía' : 'Desplegar Guía' }}</span>
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
      <div v-show="isOpen" class="border-t border-base-borde-sutil bg-base-bg-primario/60 p-5 space-y-6">
        
        <!-- Bloque 1: Paleta de Colores -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-1.5">
              <span>●</span> Paleta Cromática Oficial del Sistema
            </h3>
            <span class="text-[11px] text-base-texto-secundario">Haz clic en cualquier color para copiar el código HEX</span>
          </div>

          <!-- Grupos de Colores -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            <!-- Grupo Base -->
            <div class="bg-base-blanco p-3 rounded-lg border border-base-borde-sutil shadow-2xs">
              <div class="text-[11px] font-bold text-base-texto-primario mb-2 border-b border-base-borde-sutil/60 pb-1 flex items-center justify-between">
                <span>Colores Base (Fondos y Textos)</span>
                <span class="text-[10px] text-base-texto-secundario font-normal">Neutros Cálidos</span>
              </div>
              <div class="space-y-1.5">
                <div 
                  v-for="color in baseColors" 
                  :key="color.hex"
                  @click="copyHex(color.hex)"
                  class="group flex items-center justify-between p-1.5 rounded hover:bg-base-bg-secundario/60 cursor-pointer transition-colors text-xs">
                  <div class="flex items-center gap-2">
                    <span 
                      class="w-5 h-5 rounded border border-base-borde-fuerte/40 shadow-2xs shrink-0" 
                      :style="{ backgroundColor: color.hex }"></span>
                    <div>
                      <div class="font-medium text-[11px] text-base-texto-primario leading-tight">{{ color.name }}</div>
                      <div class="text-[9px] text-base-texto-secundario font-mono">{{ color.token }}</div>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono text-base-texto-secundario group-hover:text-acento-ambar-fuerte font-semibold">
                    {{ copiedHex === color.hex ? '¡Copiado!' : color.hex }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Grupo Acento -->
            <div class="bg-base-blanco p-3 rounded-lg border border-base-borde-sutil shadow-2xs">
              <div class="text-[11px] font-bold text-base-texto-primario mb-2 border-b border-base-borde-sutil/60 pb-1 flex items-center justify-between">
                <span>Acentos de Marca</span>
                <span class="text-[10px] text-base-texto-secundario font-normal">Identidad Ámbar</span>
              </div>
              <div class="space-y-1.5">
                <div 
                  v-for="color in accentColors" 
                  :key="color.hex"
                  @click="copyHex(color.hex)"
                  class="group flex items-center justify-between p-1.5 rounded hover:bg-base-bg-secundario/60 cursor-pointer transition-colors text-xs">
                  <div class="flex items-center gap-2">
                    <span 
                      class="w-5 h-5 rounded border border-base-borde-fuerte/40 shadow-2xs shrink-0" 
                      :style="{ backgroundColor: color.hex }"></span>
                    <div>
                      <div class="font-medium text-[11px] text-base-texto-primario leading-tight">{{ color.name }}</div>
                      <div class="text-[9px] text-base-texto-secundario font-mono">{{ color.token }}</div>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono text-base-texto-secundario group-hover:text-acento-ambar-fuerte font-semibold">
                    {{ copiedHex === color.hex ? '¡Copiado!' : color.hex }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Grupo Semántico -->
            <div class="bg-base-blanco p-3 rounded-lg border border-base-borde-sutil shadow-2xs">
              <div class="text-[11px] font-bold text-base-texto-primario mb-2 border-b border-base-borde-sutil/60 pb-1 flex items-center justify-between">
                <span>Estados Semánticos</span>
                <span class="text-[10px] text-base-texto-secundario font-normal">Evaluación & Tutor</span>
              </div>
              <div class="space-y-1.5">
                <div 
                  v-for="color in semanticColors" 
                  :key="color.hex"
                  @click="copyHex(color.hex)"
                  class="group flex items-center justify-between p-1.5 rounded hover:bg-base-bg-secundario/60 cursor-pointer transition-colors text-xs">
                  <div class="flex items-center gap-2">
                    <span 
                      class="w-5 h-5 rounded border border-base-borde-fuerte/40 shadow-2xs shrink-0" 
                      :style="{ backgroundColor: color.hex }"></span>
                    <div>
                      <div class="font-medium text-[11px] text-base-texto-primario leading-tight">{{ color.name }}</div>
                      <div class="text-[9px] text-base-texto-secundario font-mono">{{ color.token }}</div>
                    </div>
                  </div>
                  <span class="text-[10px] font-mono text-base-texto-secundario group-hover:text-acento-ambar-fuerte font-semibold">
                    {{ copiedHex === color.hex ? '¡Copiado!' : color.hex }}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Bloque 2: Usuarios de Prueba por Rol (Sin Base de Datos) -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-base-texto-primario uppercase tracking-wider flex items-center gap-1.5">
              <span>●</span> Usuarios Preconfigurados por Rol (Cero Base de Datos)
            </h3>
            <span class="text-[11px] text-base-texto-secundario">Haz clic en "Auto-completar" para cargar en el formulario</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- Rol Estudiante -->
            <div class="bg-base-blanco p-3.5 rounded-lg border border-base-borde-sutil hover:border-acento-ambar-fuerte transition-all shadow-2xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xl">🎓</span>
                <div>
                  <div class="text-xs font-bold text-base-texto-primario leading-tight">Rol: Estudiante</div>
                  <div class="text-[10px] text-base-texto-secundario">Pedro Romero Mendoza</div>
                </div>
              </div>
              <div class="space-y-1 text-[11px] font-mono bg-base-bg-secundario/70 p-2 rounded border border-base-borde-sutil/60 text-base-texto-primario">
                <div><span class="text-base-texto-secundario">Email:</span> pedro.estudiante@unicor.edu.co</div>
                <div><span class="text-base-texto-secundario">Clave:</span> Test1234!</div>
              </div>
              <button 
                type="button"
                @click="$emit('select-account', { email: 'pedro.estudiante@unicor.edu.co', password: 'Test1234!', role: 'estudiante' })"
                class="mt-2.5 w-full py-1.5 px-2.5 rounded bg-base-bg-secundario hover:bg-acento-ambar hover:text-base-blanco border border-base-borde-sutil text-[11px] font-semibold text-base-texto-primario transition-colors flex items-center justify-center gap-1.5">
                <span>⚡ Auto-completar Estudiante</span>
              </button>
            </div>

            <!-- Rol Docente -->
            <div class="bg-base-blanco p-3.5 rounded-lg border border-base-borde-sutil hover:border-acento-ambar-fuerte transition-all shadow-2xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xl">👨‍🏫</span>
                <div>
                  <div class="text-xs font-bold text-base-texto-primario leading-tight">Rol: Docente</div>
                  <div class="text-[10px] text-base-texto-secundario">Prof. Roberto Toscano Miranda</div>
                </div>
              </div>
              <div class="space-y-1 text-[11px] font-mono bg-base-bg-secundario/70 p-2 rounded border border-base-borde-sutil/60 text-base-texto-primario">
                <div><span class="text-base-texto-secundario">Email:</span> roberto.toscano@unicor.edu.co</div>
                <div><span class="text-base-texto-secundario">Clave:</span> Test1234!</div>
              </div>
              <button 
                type="button"
                @click="$emit('select-account', { email: 'roberto.toscano@unicor.edu.co', password: 'Test1234!', role: 'docente' })"
                class="mt-2.5 w-full py-1.5 px-2.5 rounded bg-base-bg-secundario hover:bg-acento-ambar hover:text-base-blanco border border-base-borde-sutil text-[11px] font-semibold text-base-texto-primario transition-colors flex items-center justify-center gap-1.5">
                <span>⚡ Auto-completar Docente</span>
              </button>
            </div>

            <!-- Rol Administrador -->
            <div class="bg-base-blanco p-3.5 rounded-lg border border-base-borde-sutil hover:border-acento-ambar-fuerte transition-all shadow-2xs">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xl">⚙️</span>
                <div>
                  <div class="text-xs font-bold text-base-texto-primario leading-tight">Rol: Administrador</div>
                  <div class="text-[10px] text-base-texto-secundario">Administrador del Sistema</div>
                </div>
              </div>
              <div class="space-y-1 text-[11px] font-mono bg-base-bg-secundario/70 p-2 rounded border border-base-borde-sutil/60 text-base-texto-primario">
                <div><span class="text-base-texto-secundario">Email:</span> admin.sistema@unicor.edu.co</div>
                <div><span class="text-base-texto-secundario">Clave:</span> Admin1234!</div>
              </div>
              <button 
                type="button"
                @click="$emit('select-account', { email: 'admin.sistema@unicor.edu.co', password: 'Admin1234!', role: 'administrador' })"
                class="mt-2.5 w-full py-1.5 px-2.5 rounded bg-base-bg-secundario hover:bg-acento-ambar hover:text-base-blanco border border-base-borde-sutil text-[11px] font-semibold text-base-texto-primario transition-colors flex items-center justify-center gap-1.5">
                <span>⚡ Auto-completar Admin</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Bloque 3: Principios de Identidad & Accesibilidad -->
        <div class="bg-base-blanco p-3.5 rounded-lg border border-base-borde-sutil text-xs text-base-texto-secundario">
          <div class="font-bold text-base-texto-primario mb-1">
            Principios de Identidad & Accesibilidad Visual (WCAG 2.1 AA)
          </div>
          <p class="leading-relaxed">
            La interfaz de STIRE-Soft implementa un fondo cálido neutro (<span class="font-mono text-base-texto-primario">#F6F3EF</span>) para reducir la fatiga visual durante sesiones prolongadas de programación. Los textos mantienen un contraste superior a 4.5:1, con botones primarios en ámbar institucional (<span class="font-mono text-base-texto-primario">#C87B1E / #A76719</span>) y retroalimentación semántica de compilación en verde (<span class="font-mono text-base-texto-primario">#2F7D4F</span>) y rojo (<span class="font-mono text-base-texto-primario">#B3261E</span>).
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'select-account', account: { email: string; password: string; role: 'estudiante' | 'docente' | 'administrador' }): void
}>()

const isOpen = ref(true)
const copiedHex = ref<string | null>(null)

const baseColors = [
  { name: 'Fondo Primario', token: 'base-bg-primario', hex: '#F6F3EF' },
  { name: 'Fondo Secundario', token: 'base-bg-secundario', hex: '#EDE8E1' },
  { name: 'Blanco Puro', token: 'base-blanco', hex: '#FFFFFF' },
  { name: 'Borde Sutil', token: 'base-borde-sutil', hex: '#C9C1B8' },
  { name: 'Borde Fuerte', token: 'base-borde-fuerte', hex: '#998878' },
  { name: 'Texto Primario', token: 'base-texto-primario', hex: '#2B2622' },
  { name: 'Texto Secundario', token: 'base-texto-secundario', hex: '#6F6761' },
]

const accentColors = [
  { name: 'Ámbar Principal', token: 'acento-ambar', hex: '#C87B1E' },
  { name: 'Ámbar Fuerte', token: 'acento-ambar-fuerte', hex: '#A76719' },
]

const semanticColors = [
  { name: 'Pasa / Éxito', token: 'semantico-pasa', hex: '#2F7D4F' },
  { name: 'Falla / Error', token: 'semantico-falla', hex: '#B3261E' },
  { name: 'Información', token: 'semantico-info', hex: '#2B5D8A' },
]

function copyHex(hex: string) {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(hex)
  }
  copiedHex.value = hex
  setTimeout(() => {
    if (copiedHex.value === hex) {
      copiedHex.value = null
    }
  }, 2000)
}
</script>
