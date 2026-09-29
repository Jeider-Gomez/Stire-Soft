<template>
  <!-- Fondo del prototipo de José: tres resplandores de la marca y una retícula de puntos. Solo CSS.
       Cada resplandor gira en una órbita pequeña a velocidad constante (nunca frena) y, por dentro, «respira».
       El resplandor es un degradado radial y no un filter: blur() — se ve igual, pero el navegador no tiene que
       recalcular un desenfoque de 120-160 px en cada cuadro. Con «reducir movimiento» queda quieto. -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
    <div class="absolute inset-0 bg-stire-canvas" />
    <div class="resplandor resplandor-azul"><div class="nucleo" /></div>
    <div class="resplandor resplandor-morado"><div class="nucleo" /></div>
    <div class="resplandor resplandor-turquesa"><div class="nucleo" /></div>
    <div class="absolute inset-0 reticula" />
  </div>
</template>

<style scoped>
/* Contenedor: posición y órbita. rotate → translate → rotate inverso mueve el centro en círculo sin girar el
   contenido, y con timing lineal la velocidad es la misma en todo el recorrido (no hay extremos donde frene). */
.resplandor {
  position: absolute;
  will-change: transform;
  animation: orbita var(--vuelta) linear infinite;
}
.nucleo {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  will-change: transform, opacity;
  animation: respirar var(--respiro) ease-in-out infinite alternate;
}

/* Los degradados reproducen el perfil de un círculo sólido desenfocado (el diseño anterior): los centros y los
   tamaños salen de ese círculo + 2 veces el radio del desenfoque. */
.resplandor-azul {
  --vuelta: 26s;
  --respiro: 6s;
  --radio-orbita: 22px;
  top: -368px;
  left: -368px;
  width: 864px;
  height: 864px;
}
.resplandor-azul .nucleo {
  --opacidad-min: 0.08;
  --opacidad-max: 0.14;
  --escala-max: 1.15;
  background: radial-gradient(closest-side, rgb(11 61 145 / 0.72) 0%, rgb(11 61 145 / 0.72) 17%, rgb(11 61 145 / 0.5) 44%, rgb(11 61 145 / 0.16) 72%, rgb(11 61 145 / 0) 100%);
}
.resplandor-morado {
  --vuelta: 32s;
  --respiro: 7s;
  --radio-orbita: 26px;
  bottom: -388px;
  right: -388px;
  width: 904px;
  height: 904px;
  animation-direction: reverse;
}
.resplandor-morado .nucleo {
  --opacidad-min: 0.07;
  --opacidad-max: 0.12;
  --escala-max: 1.2;
  animation-delay: -2s;
  background: radial-gradient(closest-side, rgb(123 47 191 / 0.66) 0%, rgb(123 47 191 / 0.66) 14%, rgb(123 47 191 / 0.5) 42%, rgb(123 47 191 / 0.16) 71%, rgb(123 47 191 / 0) 100%);
}
.resplandor-turquesa {
  --vuelta: 22s;
  --respiro: 5s;
  --radio-orbita: 18px;
  top: 50%;
  left: 50%;
  width: 1160px;
  height: 1160px;
  margin: -580px 0 0 -580px;
}
.resplandor-turquesa .nucleo {
  --opacidad-min: 0.06;
  --opacidad-max: 0.11;
  --escala-min: 0.9;
  --escala-max: 1.1;
  animation-delay: -4s;
  background: radial-gradient(closest-side, rgb(0 194 168 / 0.73) 0%, rgb(0 194 168 / 0.73) 17%, rgb(0 194 168 / 0.5) 45%, rgb(0 194 168 / 0.16) 72%, rgb(0 194 168 / 0) 100%);
}

.reticula {
  opacity: 0.035;
  background-image: radial-gradient(#0B3D91 1.2px, transparent 1.2px), radial-gradient(#7B2FBF 1.2px, transparent 1.2px);
  background-size: 28px 28px;
  background-position: 0 0, 14px 14px;
}

@keyframes orbita {
  from { transform: rotate(0deg) translateX(var(--radio-orbita)) rotate(0deg); }
  to { transform: rotate(360deg) translateX(var(--radio-orbita)) rotate(-360deg); }
}
@keyframes respirar {
  from { transform: scale(var(--escala-min, 1)); opacity: var(--opacidad-min); }
  to { transform: scale(var(--escala-max)); opacity: var(--opacidad-max); }
}

@media (prefers-reduced-motion: reduce) {
  .resplandor,
  .nucleo {
    animation: none;
  }
  .nucleo {
    transform: scale(var(--escala-min, 1));
    opacity: var(--opacidad-min);
  }
}
</style>
