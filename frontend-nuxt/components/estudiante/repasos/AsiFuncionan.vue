<template>
  <!-- «Así funcionan los repasos» (cuadros «E-Repasos» y «E-Repasos-Oculto»): si aciertas, el tema vuelve más tarde; si fallas,
       vuelve pronto. Una ficha vuela a la casilla en que vuelve. Se recoge hacia el lado y se recuerda (lección 17: lo que se
       oculta sigue oculto al recargar). -->
  <section v-if="!recogida" class="tarjeta-inicio" style="--acento: 124 58 237; --acento2: 10 127 112" aria-labelledby="asi-funcionan">
    <div class="flex items-center gap-2.5 mb-2.5">
      <h2 id="asi-funcionan" class="titulo-tarjeta">Así funcionan los repasos</h2>
      <button type="button" class="w-11 h-11 -m-1.5 rounded-[10px] inline-flex items-center justify-center hover:bg-base-bg-secundario"
        title="Recoger hacia el lado" aria-label="Recoger la explicación" :aria-expanded="true" aria-controls="asi-funcionan" @click="recoger(true)">
        <PanelRightClose :size="18" aria-hidden="true" />
      </button>
    </div>

    <div v-for="f in FILAS" :key="f.clave" class="flex gap-3 items-start mb-3.5">
      <span class="hidden sm:flex w-[72px] flex-none justify-center pt-1" aria-hidden="true"><TutorMascota :expresion="f.cara" :tamano="56" /></span>
      <div class="flex-1 min-w-0">
        <p class="m-0 text-[15px] leading-snug"><strong>{{ f.si }}</strong> {{ f.luego }}</p>
        <div class="fila-dias relative flex gap-1.5 mt-2" :style="{ '--hasta': f.casilla }" aria-hidden="true">
          <span v-for="(d, i) in DIAS" :key="d" class="flex flex-col items-center gap-1 w-[38px]">
            <span class="casilla-dia" :class="i === f.casilla ? `llega llega-${f.clave}` : ''" />
            <span class="text-[11px]" :class="i === f.casilla ? 'font-bold text-base-texto-primario' : 'text-base-texto-secundario'">{{ d }}</span>
          </span>
          <span class="ficha-vuela" :class="`ficha-${f.clave}`" />
        </div>
        <p class="m-0 mt-1.5 text-[13px] font-bold">{{ f.resultado }}</p>
      </div>
    </div>

    <details class="group">
      <summary class="min-h-[44px] inline-flex items-center gap-1 cursor-pointer text-[13px] font-bold texto-menta list-none">
        ¿Por qué funciona? <ChevronDown :size="15" class="transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <p class="m-0 text-sm leading-relaxed text-base-texto-secundario">
        Lo que aprendes se va olvidando con los días. Si lo recuerdas justo cuando empezaba a borrarse, el recuerdo queda más firme
        y tarda más en irse: por eso cada acierto aleja el siguiente repaso, y un fallo lo trae pronto para volver a explicártelo.
        Dejar pasar un repaso no te baja el dominio; solo hace más probable que lo olvides.
      </p>
    </details>
  </section>

  <!-- Recogida: una franja al lado, como el panel del ejercicio. -->
  <button v-else type="button" class="franja-repasos hidden lg:flex flex-col items-center gap-2 py-3 w-12 rounded-[18px] border border-base-borde-sutil bg-base-blanco text-sm font-bold hover:bg-base-bg-secundario"
    :aria-expanded="false" aria-label="Mostrar cómo funcionan los repasos" @click="recoger(false)">
    <PanelRightOpen :size="18" aria-hidden="true" />
    <span class="[writing-mode:vertical-rl] rotate-180">Así funcionan los repasos</span>
  </button>
</template>

<script setup lang="ts">
import { ChevronDown, PanelRightClose, PanelRightOpen } from 'lucide-vue-next'

const { plegado: recogida, plegar: recoger } = usePanelPlegable('stire.repasos.explicacionRecogida')

const DIAS = ['Hoy', 'Mañana', '2 d', '3 d', '4 d', '5 d', '6 d']
const FILAS = [
  { clave: 'acierta', cara: 'acierto', si: 'Si aciertas,', luego: 'el tema vuelve más tarde:', casilla: 6, resultado: 'Vuelve en 6 días' },
  { clave: 'falla', cara: 'animo', si: 'Si fallas,', luego: 'vuelve pronto:', casilla: 1, resultado: 'Vuelve mañana y te lo explico otra vez' },
] as const
</script>

<style scoped>
.casilla-dia { width: 38px; height: 30px; border-radius: 9px; border: 2px solid rgb(var(--c-base-borde-sutil)); background: rgb(var(--c-base-blanco)); }
.llega-acierta { --c: rgb(var(--c-sec-menta-fondo)); --b: #00c2a8; }
.llega-falla { --c: rgb(var(--c-sec-sol-fondo)); --b: #ffc94d; }
.llega { border-color: var(--b); animation: se-llena 2.4s ease both 0.4s; }
@keyframes se-llena { 0%, 80% { background: rgb(var(--c-base-blanco)); } 100% { background: var(--c); } }

/* La ficha sale de «Hoy» y vuela a su casilla: 38 px de casilla y 6 de espacio por día. */
.ficha-vuela { position: absolute; left: 6px; top: 5px; width: 26px; height: 20px; border-radius: 6px; border: 3px solid; background: rgb(var(--c-base-blanco));
  animation: vuela 1.8s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both; --a: calc(var(--hasta) * 44px); }
.ficha-acierta { border-color: #00c2a8; }
.ficha-falla { border-color: #ffc94d; }
@keyframes vuela {
  0% { transform: translate(0, 0) scale(0.7); opacity: 0; }
  15% { opacity: 1; }
  70% { transform: translate(var(--a), -14px) scale(1); }
  100% { transform: translate(var(--a), 0) scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .ficha-vuela { animation: none; transform: translate(var(--a), 0); }
  .llega { animation: none; background: var(--c); }
}
.franja-repasos { position: sticky; top: 16px; }
</style>
