<template>
  <!-- La ecuación de Toscano, a la vista (cuadros «E-Progreso-Competencias» y «D3-Competencias»): cómo se calcula el nivel,
       cuánto vale cada ejercicio y un ejemplo. La misma que calcula el servidor (src/common/utils/competencias.ts). -->
  <section class="tarjeta-competencias" aria-label="Cómo se calcula el nivel">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
      <div class="flex items-center gap-3 font-poppins text-xl font-bold text-base-texto-primario" role="math" aria-label="Nivel igual a puntos logrados más 1, dividido entre puntos posibles más 2">
        <span aria-hidden="true">Nivel</span><span aria-hidden="true">=</span>
        <span class="inline-flex flex-col items-center text-base leading-snug" aria-hidden="true">
          <span class="px-2 pb-1 border-b-[3px] border-base-texto-primario">puntos logrados + 1</span>
          <span class="pt-1">puntos posibles + 2</span>
        </span>
      </div>
      <div class="flex flex-col gap-1 text-[13px]">
        <span class="text-base-texto-secundario">Cada ejercicio de esa competencia vale:</span>
        <span class="flex flex-wrap gap-1.5">
          <span class="pastilla-dificultad dif-basico">Básico 1</span>
          <span class="pastilla-dificultad dif-intermedio">Intermedio 2</span>
          <span class="pastilla-dificultad dif-avanzado">Avanzado 3</span>
        </span>
      </div>
      <div class="sm:ml-auto px-3.5 py-2.5 rounded-[14px] bg-base-bg-secundario text-sm">
        <span class="text-base-texto-secundario">Ejemplo:</span>
        <strong class="font-poppins text-[17px] text-base-texto-primario"> (3 + 1) ÷ (3 + 2) = 80 %</strong>
        <span class="block text-xs text-base-texto-secundario">1 ejercicio avanzado bien: ya «Lo domina». No hacen falta 10.</span>
      </div>
    </div>
  </section>
</template>
