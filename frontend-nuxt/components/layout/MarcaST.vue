<template>
  <!-- Distintivo «ST» del prototipo de José: marco con degradado azul → morado. Con `escudo`, el marco pasa a
       morado → turquesa y muestra un escudo (se usa mientras el foco está en la contraseña). -->
  <div
    class="rounded-2xl p-[2px] transition-all duration-300 shrink-0"
    :class="[
      escudo ? 'bg-gradient-to-br from-stire-purple to-stire-teal shadow-lg shadow-stire-purple/30 marca-pulso' : 'bg-gradient-to-br from-stire-blue to-stire-purple shadow-md shadow-stire-blue/20',
      tamano === 'grande' ? 'w-14 h-14' : 'w-10 h-10 rounded-xl'
    ]"
    aria-hidden="true"
  >
    <div
      class="w-full h-full bg-white flex items-center justify-center"
      :class="tamano === 'grande' ? 'rounded-[14px]' : 'rounded-[10px]'"
    >
      <ShieldCheck v-if="escudo" :size="tamano === 'grande' ? 28 : 20" class="text-stire-purple" />
      <span
        v-else
        class="font-poppins font-black tracking-tighter text-stire-blue"
        :class="tamano === 'grande' ? 'text-xl' : 'text-sm'"
      >ST</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'

withDefaults(defineProps<{ tamano?: 'grande' | 'normal'; escudo?: boolean }>(), { tamano: 'normal', escudo: false })
</script>

<style scoped>
.marca-pulso {
  animation: marca-pulso 0.3s ease-out;
}
@keyframes marca-pulso {
  0% { transform: scale(1); }
  50% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
</style>
