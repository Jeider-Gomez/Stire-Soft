<template>
  <!-- Fondo del prototipo de José: tres resplandores de la marca que «respiran» y una retícula de puntos.
       Solo CSS (sin librerías de animación); con «reducir movimiento» queda quieto. -->
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
    <div class="absolute inset-0 bg-stire-canvas" />
    <div class="resplandor resplandor-azul" />
    <div class="resplandor resplandor-morado" />
    <div class="resplandor resplandor-turquesa" />
    <div class="absolute inset-0 reticula" />
  </div>
</template>

<style scoped>
.resplandor {
  position: absolute;
  border-radius: 9999px;
  will-change: transform, opacity;
}
.resplandor-azul {
  top: -8rem;
  left: -8rem;
  width: 24rem;
  height: 24rem;
  background: #0B3D91;
  filter: blur(120px);
  animation: respirar-azul 12s ease-in-out infinite;
}
.resplandor-morado {
  bottom: -8rem;
  right: -8rem;
  width: 24rem;
  height: 24rem;
  background: #7B2FBF;
  filter: blur(130px);
  animation: respirar-morado 14s ease-in-out 1s infinite;
}
.resplandor-turquesa {
  top: 50%;
  left: 50%;
  width: 520px;
  height: 520px;
  margin: -260px 0 0 -260px;
  background: #00C2A8;
  filter: blur(160px);
  animation: respirar-turquesa 10s ease-in-out 2s infinite;
}
.reticula {
  opacity: 0.035;
  background-image: radial-gradient(#0B3D91 1.2px, transparent 1.2px), radial-gradient(#7B2FBF 1.2px, transparent 1.2px);
  background-size: 28px 28px;
  background-position: 0 0, 14px 14px;
}

@keyframes respirar-azul {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.08; }
  50% { transform: translate(20px, -15px) scale(1.15); opacity: 0.14; }
}
@keyframes respirar-morado {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.07; }
  50% { transform: translate(-25px, 20px) scale(1.2); opacity: 0.12; }
}
@keyframes respirar-turquesa {
  0%, 100% { transform: scale(0.9); opacity: 0.06; }
  50% { transform: scale(1.1); opacity: 0.11; }
}
</style>
