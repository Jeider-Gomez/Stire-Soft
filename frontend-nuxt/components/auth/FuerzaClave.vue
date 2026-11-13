<!-- La fuerza de la clave al registrarse (JEIDER-S08-12): una barra que se llena y dice en palabras qué tan fuerte es,
     y debajo las reglas del servidor, siempre a la vista (utils/fuerzaClave.ts). v3 (13/11, cuadro «Entrar-estados»):
     los colores de las secciones (rojo, sol, menta) y las reglas como pastillas que se marcan solas. Color Y texto. -->
<template>
  <div class="flex flex-col gap-1.5">
    <div v-if="fuerza.nivel > 0" class="flex items-center gap-2.5">
      <div class="flex-1 grid grid-cols-4 gap-1" aria-hidden="true">
        <span v-for="i in 4" :key="i" class="h-1.5 rounded-full bg-base-bg-secundario overflow-hidden">
          <span class="block h-full rounded-full transition-all duration-300 ease-out"
            :style="{ width: i <= fuerza.nivel ? '100%' : '0%', background: `rgb(var(${COLOR[fuerza.nivel]}))` }" />
        </span>
      </div>
      <span class="text-xs font-bold whitespace-nowrap" :style="{ color: `rgb(var(${TEXTO[fuerza.nivel]}))` }">{{ fuerza.texto }} · {{ clave.length }} caracteres</span>
    </div>
    <p v-if="fuerza.nivel > 0 && fuerza.nivel < 3" class="m-0 text-xs text-base-texto-secundario" aria-live="polite">
      <span class="sr-only">Contraseña {{ fuerza.texto.toLowerCase() }}. </span>{{ fuerza.consejo }}
    </p>
    <ul v-if="!todasCumplidas" class="m-0 p-0 list-none flex flex-wrap gap-1.5">
      <li v-for="regla in reglas" :key="regla.texto" class="regla" :class="regla.cumple ? 'cumple' : falta ? 'falta' : ''">
        <Check v-if="regla.cumple" :size="12" aria-hidden="true" />
        {{ regla.texto }}<span class="sr-only">{{ regla.cumple ? ' (cumplido)' : ' (pendiente)' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { fuerzaDeClave, reglasDeClave } from '~/utils/fuerzaClave'

const props = defineProps<{ clave: string; falta?: boolean }>()
const reglas = computed(() => reglasDeClave(props.clave))
const fuerza = computed(() => fuerzaDeClave(props.clave))
/** Con todas las reglas cumplidas sobra la lista: queda la barra con «Buena» o «Fuerte», como en el cuadro. */
const todasCumplidas = computed(() => reglas.value.every((r) => r.cumple))

/** Débil en rojo, aceptable en sol, buena y fuerte en menta (las variables de temas.css, también en oscuro). */
const COLOR: Record<number, string> = {
  1: '--c-semantico-falla',
  2: '--c-sec-sol',
  3: '--c-sec-menta',
  4: '--c-sec-menta',
}
const TEXTO: Record<number, string> = {
  1: '--c-semantico-falla',
  2: '--c-base-texto-primario',
  3: '--c-semantico-pasa',
  4: '--c-semantico-pasa',
}
</script>

<style scoped>
.regla {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid rgb(var(--c-base-borde-sutil));
  color: rgb(var(--c-base-texto-secundario));
}
.regla.cumple { border-color: transparent; background: rgb(var(--c-sec-menta-fondo)); color: rgb(var(--c-base-texto-primario)); font-weight: 600; }
.regla.falta { border-color: rgb(var(--c-semantico-falla) / 0.5); color: rgb(var(--c-semantico-falla)); font-weight: 600; }
</style>
