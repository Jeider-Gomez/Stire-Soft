<template>
  <!-- El marco de Entrar y Crear cuenta (cuadros «Entrar», «Entrar-estados» y «Entrar-celular» del lienzo v3): a la
       izquierda qué es STIRE con el video; a la derecha la tarjeta, con la turquesa asomando detrás como en el logo y la
       mascota asomada encima (decorativa). En el celular va primero el video corto y luego el formulario, sin mascota. -->
  <div class="w-full max-w-[1160px] grid lg:grid-cols-[1fr_520px] gap-6 sm:gap-10 items-center">
    <section class="flex-col gap-5 w-full max-w-[440px] lg:max-w-[560px] mx-auto lg:mx-0" :class="compacto ? 'hidden lg:flex' : 'flex'" aria-label="Qué es STIRE">
      <p class="hidden lg:block m-0 font-poppins font-bold text-[46px] leading-[1.1]">Aprende a programar con un Tutor que te ayuda a pensar</p>
      <p class="hidden lg:block m-0 text-lg leading-relaxed text-base-texto-secundario">Lecciones cortas, ayuda por pasos y repasos que vuelven justo a tiempo.</p>
      <PresentacionVideoSTIRE class="lg:self-start" />
    </section>

    <div class="flex justify-center" :class="compacto ? 'sm:pt-[60px]' : 'sm:pt-[72px]'">
      <div class="relative w-full max-w-[440px]">
        <div class="tarjeta-atras hidden sm:block" aria-hidden="true" />
        <AuthMascotaEntrar v-bind="mascota" />
        <section class="tarjeta-entrar relative flex flex-col gap-4 sm:px-9 sm:rounded-[28px] sm:bg-base-blanco" :class="compacto ? 'sm:pt-7 sm:pb-6' : 'sm:pt-9 sm:pb-7'">
          <slot />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Lo que la mascota ve: campo con el foco, si se ve la clave, error, listo y pestaña. */
  mascota: { campo: 'email' | 'password' | null; verClave: boolean; error: boolean; listo: boolean; pestana: 'codigo' | 'cuenta' }
  /** Menos aire y, en el celular, sin la tarjeta del video: el registro tiene más campos y «Crear mi cuenta» debe verse
   *  sin bajar en 390×844 y 1366×657 (BT-27). */
  compacto?: boolean
}>()
</script>
