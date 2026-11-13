<template>
  <!-- «¿Tienes el código de tu clase?» (final del cuadro «Pagina-inicio»): el código se guarda como el del QR y se va a
       Entrar, donde se ve la clase mientras entra o crea la cuenta; al terminar, STIRE la une sola. -->
  <form novalidate class="flex flex-col gap-3.5" @submit.prevent="seguir">
    <h2 class="m-0 font-poppins font-bold text-[28px] sm:text-[36px] leading-tight">¿Tienes el código de tu clase?</h2>
    <div class="flex flex-col sm:flex-row gap-2.5">
      <div class="flex-1 sm:max-w-[360px] flex flex-col gap-1.5">
        <label for="codigo-inicio" class="text-sm font-semibold">Código de la clase</label>
        <input id="codigo-inicio" ref="campo" v-model="codigo" type="text" autocapitalize="characters" autocomplete="off" spellcheck="false"
          placeholder="Ej.: ALGO-203413" class="campo-codigo" :aria-invalid="!!falta || undefined" :aria-describedby="falta ? 'codigo-inicio-falta' : undefined"
          @input="codigo = codigoMientrasEscribe(codigo); falta = ''">
      </div>
      <button type="submit" class="sm:self-end min-h-[52px] px-6 rounded-xl font-bold boton-oscuro">Entrar</button>
    </div>
    <p v-if="falta" id="codigo-inicio-falta" class="m-0 text-sm font-semibold">{{ falta }}</p>
    <p class="m-0 text-[15px]">
      ¿No lo tienes? Pídeselo a tu docente o <NuxtLink to="/auth/register" class="font-semibold underline">crea una cuenta</NuxtLink>.
    </p>
  </form>
</template>

<script setup lang="ts">
import { codigoMientrasEscribe, normalizarCodigo } from '~/utils/codigoClase'

const codigo = ref('')
const falta = ref('')
const campo = ref<HTMLInputElement | null>(null)

function seguir() {
  const limpio = normalizarCodigo(codigo.value)
  if (!limpio) {
    falta.value = 'Escribe el código de tu clase, por ejemplo ALGO-203413.'
    campo.value?.focus()
    return
  }
  navigateTo({ path: '/auth/login', query: { volver: `/estudiante/clases?codigo=${encodeURIComponent(limpio)}` } })
}
</script>

<style scoped>
.campo-codigo {
  min-height: 52px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #c9d6ea;
  background: #fff;
  color: #14213d;
  font: 700 20px 'JetBrains Mono', monospace;
}
.campo-codigo::placeholder { color: #4a5873; font-weight: 500; font-size: 17px; }
.campo-codigo:focus { outline: 3px solid #14213d; outline-offset: 2px; }
/* Sobre el cielo de la franja, el botón y el texto van en azul noche en todos los temas (contraste AA). */
.boton-oscuro { background: #14213d; color: #fff; }
</style>
