<!-- Barra de abajo del docente en el celular (v3, Fase B; cuadro D3-Cel-Inicio del lienzo): Clases, Asistencia,
     Estudiantes, Mensajes y el Asistente, siempre a un toque. Asistencia y Estudiantes son de la clase elegida en el menú
     (ClasesDelMenu.vue); sin clase, llevan a «Mis clases». El resto sigue en el menú (☰ arriba). Estilo compartido con
     la del estudiante en assets/css/menu-v3.css. -->
<template>
  <nav aria-label="Menú principal" class="barra-inferior">
    <NuxtLink to="/docente" class="tono-menta" :class="{ activo: route.path === '/docente' }" :aria-current="route.path === '/docente' ? 'page' : undefined">
      <span class="pildora"><LayoutGrid :size="19" aria-hidden="true" /></span>Clases
    </NuxtLink>
    <NuxtLink :to="clase ? enlacePestana('asistencia', clase) : '/docente'" class="tono-cielo" :class="{ activo: en('asistencia') }" :aria-current="en('asistencia') ? 'page' : undefined">
      <span class="pildora"><QrCode :size="19" aria-hidden="true" /></span>Asistencia
    </NuxtLink>
    <NuxtLink :to="clase ? enlacePestana('estudiantes', clase) : '/docente'" class="tono-lila" :class="{ activo: en('estudiantes') }" :aria-current="en('estudiantes') ? 'page' : undefined">
      <span class="pildora"><Users :size="19" aria-hidden="true" /></span>Estudiantes
    </NuxtLink>
    <NuxtLink to="/docente/mensajes" class="tono-rosa" :class="{ activo: route.path === '/docente/mensajes' }" :aria-current="route.path === '/docente/mensajes' ? 'page' : undefined">
      <span class="pildora"><Mail :size="19" aria-hidden="true" /></span>Mensajes
    </NuxtLink>
    <!-- El Asistente con su libreta (Libreta.vue), como el Tutor con su mascota en la barra del estudiante (Jeider, 12/11).
         Abre el mismo panel que «Asistente · Ctrl .» de la barra de arriba (docente/asistente/Panel.vue). -->
    <button type="button" :class="{ activo: asistenteAbierto }" :aria-expanded="asistenteAbierto" aria-controls="panel-asistente" @click="asistenteAbierto = !asistenteAbierto">
      <DocenteAsistenteLibreta :tamano="30" />Asistente
    </button>
  </nav>
</template>

<script setup lang="ts">
import { LayoutGrid, Mail, QrCode, Users } from 'lucide-vue-next'
import { enlacePestana, pestanaDeLaRuta, type PestanaClase } from '~/utils/pestanasClase'

const route = useRoute()
const clase = useState<number | null>('clase-docente-id', () => null)
const asistenteAbierto = useState('asistente-abierto', () => false)
/** La entrada se marca cuando el docente está en esa sección de una clase. */
const en = (p: PestanaClase) => pestanaDeLaRuta(route.path) === p
</script>
