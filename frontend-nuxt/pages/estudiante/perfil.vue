<template>
  <!-- Mi cuenta del estudiante (v3, Fase D, paso 5; cuadro «E-Cuenta»): la portada con la foto y el nombre, y debajo las tarjetas
       en columnas (datos, clases, apariencia y lectura, investigación). Las piezas son las mismas que usan el docente y el
       administrador (components/perfil/); aquí solo cambia cómo se acomodan (assets/css/cuenta-v3.css). -->
  <div class="max-w-6xl mx-auto space-y-[18px]">
    <section class="heroe-inicio flex flex-wrap items-center gap-5" aria-labelledby="titulo-mi-cuenta">
      <span class="foto-cuenta flex-none"><AvatarUsuario :nombre="authStore.user?.fullName" :foto-id="authStore.user?.fotoId" tamano="w-24 h-24 text-3xl" decorativo /></span>
      <div class="min-w-0 flex-1">
        <p class="m-0 text-[13px] font-bold uppercase opacity-80">Mi cuenta</p>
        <h1 id="titulo-mi-cuenta" class="m-0 font-poppins font-bold text-[24px] sm:text-[30px] leading-tight">{{ authStore.user?.fullName }}</h1>
        <p v-if="studentStore.currentContexto" class="m-0 mt-1 text-[15px]">{{ studentStore.currentContexto }}</p>
        <a href="#perfil-foto-titulo" class="boton-heroe boton-principal inline-flex mt-3 min-h-[44px]">Cambiar foto</a>
      </div>
      <p class="globo-cuenta hidden md:block m-0 max-w-[260px] text-sm leading-relaxed">Ayuda a tu docente a reconocerte. Si no pones una foto, se ven tus iniciales.</p>
    </section>

    <div class="cuenta-v3">
      <PerfilForm data-recorrido="datos-perfil" />
      <section class="tarjeta-mis-clases" aria-labelledby="titulo-mis-clases-cuenta">
        <h2 id="titulo-mis-clases-cuenta" class="text-sm font-bold text-base-texto-primario">Mis clases</h2>
        <ul class="m-0 p-0 list-none">
          <li v-for="c in studentStore.enrolledClasses" :key="c.classId" class="border-t border-base-borde-sutil first:border-t-0">
            <NuxtLink to="/estudiante/clases" class="flex items-center gap-3 min-h-[52px] py-1.5">
              <span class="w-9 h-9 rounded-xl bg-base-bg-secundario flex items-center justify-center text-xs font-bold" aria-hidden="true">{{ siglas[c.classId] }}</span>
              <span class="flex-1 min-w-0">
                <span class="block text-[15px] font-semibold truncate">{{ c.name }}</span>
                <span v-if="c.teacherName" class="block text-xs text-base-texto-secundario">Prof. {{ c.teacherName }}</span>
              </span>
              <ChevronRight :size="16" class="text-base-texto-secundario" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink to="/estudiante/clases" class="borde-afordancia inline-flex items-center gap-1.5 min-h-[44px] mt-2 px-4 rounded-xl text-sm font-semibold"><Plus :size="15" aria-hidden="true" /> Unirme con un código</NuxtLink>
      </section>
      <PerfilVinculos />
      <PerfilAparienciaLectura class="mt-6" />
      <PerfilInvestigacion />
      <section aria-labelledby="titulo-encuesta-cuenta">
        <h2 id="titulo-encuesta-cuenta" class="text-sm font-bold text-base-texto-primario">Tu opinión</h2>
        <p class="text-sm text-base-texto-secundario mt-1">
          ¿Cómo te ha parecido usar STIRE?
          <NuxtLink to="/estudiante/encuesta" class="font-semibold underline">Responder la encuesta de usabilidad</NuxtLink>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Plus } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useStudentStore } from '~/stores/student'
import { siglasDeClases } from '~/utils/contextoAcademico'

definePageMeta({ layout: 'student' })

const authStore = useAuthStore()
const studentStore = useStudentStore()
const siglas = computed(() => siglasDeClases(studentStore.enrolledClasses.map((c) => ({ id: c.classId, name: c.name }))))
onMounted(() => { if (!studentStore.hasLoaded) studentStore.fetchStudentData() })
</script>

<style scoped>
.foto-cuenta { padding: 4px; border-radius: 999px; background: rgb(var(--c-base-blanco)); }
.globo-cuenta { padding: 10px 14px; border-radius: 14px; background: var(--heroe-pista); }
</style>
