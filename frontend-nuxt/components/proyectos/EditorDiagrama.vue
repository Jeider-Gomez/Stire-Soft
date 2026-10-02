<template>
  <div class="space-y-3 text-xs">
    <!-- Estado de error al leer el archivo JSON -->
    <div
      v-if="parseError"
      role="alert"
      class="p-6 bg-base-blanco rounded-xl border border-semantico-falla/30 text-center space-y-3"
    >
      <AlertCircle :size="32" class="text-semantico-falla mx-auto" aria-hidden="true" />
      <p class="font-bold text-base-texto-primario text-sm">{{ parseError }}</p>
      <p class="text-base-texto-secundario">El archivo del diagrama no se puede mostrar.</p>
      <button
        v-if="!soloLectura"
        type="button"
        @click="restablecerDiagrama"
        class="min-h-[44px] px-4 py-2 rounded-md bg-acento-ambar-fuerte hover:bg-acento-ambar text-base-blanco font-bold transition-colors shadow-sm inline-flex items-center gap-1.5"
      >
        <RefreshCw :size="15" aria-hidden="true" />
        <span>Empezar de nuevo</span>
      </button>
    </div>

    <template v-else>
      <!-- Paleta de figuras (solo si no es de solo lectura) -->
      <div
        v-if="!soloLectura"
        class="bg-base-blanco rounded-xl border border-base-borde-sutil p-2.5 shadow-sm space-y-2"
        role="toolbar"
        aria-label="Herramientas para agregar figuras"
      >
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-[11px] font-bold text-base-texto-secundario uppercase tracking-wider">
            Agregar figura
          </span>
          <span
            v-if="diagrama.figuras.length >= limiteFiguras"
            class="text-[11px] font-bold text-semantico-falla bg-semantico-falla/10 px-2 py-0.5 rounded"
          >
            Límite alcanzado: {{ limiteFiguras }} figuras
          </span>
          <span v-else class="text-[11px] text-base-texto-secundario">
            {{ diagrama.figuras.length }} de {{ limiteFiguras }} figuras
          </span>
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
          <!-- Botón Inicio: solo si no hay inicio -->
          <button
            v-if="!hayInicio"
            type="button"
            :disabled="diagrama.figuras.length >= limiteFiguras"
            @click="agregarFigura('inicio')"
            class="min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg border border-base-borde-fuerte bg-base-blanco hover:bg-base-bg-secundario disabled:opacity-50 text-base-texto-primario font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" class="text-acento-ambar-fuerte">
              <rect x="1" y="1" width="16" height="10" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <span>Inicio</span>
          </button>

          <!-- Entrada -->
          <button
            type="button"
            :disabled="diagrama.figuras.length >= limiteFiguras"
            @click="agregarFigura('entrada')"
            class="min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg border border-base-borde-fuerte bg-base-blanco hover:bg-base-bg-secundario disabled:opacity-50 text-base-texto-primario font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" class="text-acento-ambar-fuerte">
              <polygon points="4,1 17,1 14,11 1,11" fill="none" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <span>Entrada</span>
          </button>

          <!-- Proceso -->
          <button
            type="button"
            :disabled="diagrama.figuras.length >= limiteFiguras"
            @click="agregarFigura('proceso')"
            class="min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg border border-base-borde-fuerte bg-base-blanco hover:bg-base-bg-secundario disabled:opacity-50 text-base-texto-primario font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" class="text-acento-ambar-fuerte">
              <rect x="1" y="2" width="16" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <span>Proceso</span>
          </button>

          <!-- Decisión -->
          <button
            type="button"
            :disabled="diagrama.figuras.length >= limiteFiguras"
            @click="agregarFigura('decision')"
            class="min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg border border-base-borde-fuerte bg-base-blanco hover:bg-base-bg-secundario disabled:opacity-50 text-base-texto-primario font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" class="text-acento-ambar-fuerte">
              <polygon points="9,1 17,6 9,11 1,6" fill="none" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <span>Decisión</span>
          </button>

          <!-- Salida -->
          <button
            type="button"
            :disabled="diagrama.figuras.length >= limiteFiguras"
            @click="agregarFigura('salida')"
            class="min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg border border-base-borde-fuerte bg-base-blanco hover:bg-base-bg-secundario disabled:opacity-50 text-base-texto-primario font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" class="text-acento-ambar-fuerte">
              <polygon points="4,1 17,1 14,11 1,11" fill="none" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <span>Salida</span>
          </button>

          <!-- Fin -->
          <button
            type="button"
            :disabled="diagrama.figuras.length >= limiteFiguras"
            @click="agregarFigura('fin')"
            class="min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-lg border border-base-borde-fuerte bg-base-blanco hover:bg-base-bg-secundario disabled:opacity-50 text-base-texto-primario font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" class="text-acento-ambar-fuerte">
              <rect x="1" y="1" width="16" height="10" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.8" />
            </svg>
            <span>Fin</span>
          </button>
        </div>
      </div>

      <!-- Aviso de modo unión interactivo (para celular y teclado) -->
      <div
        v-if="modoUnion"
        role="status"
        class="p-2.5 bg-acento-ambar/15 border border-acento-ambar-fuerte/40 rounded-lg flex items-center justify-between gap-3 text-xs"
      >
        <div class="flex items-center gap-2">
          <Link2 :size="16" class="text-acento-ambar-fuerte shrink-0" aria-hidden="true" />
          <span>
            Toca o pulsa Enter en la figura de destino
            <strong v-if="modoUnion.salida === 'si'">(rama «Sí»)</strong>
            <strong v-else-if="modoUnion.salida === 'no'">(rama «No»)</strong>
          </span>
        </div>
        <button
          type="button"
          @click="cancelarModoUnion"
          class="min-h-[44px] sm:min-h-[32px] px-2.5 py-1 rounded bg-base-blanco border border-base-borde-fuerte hover:bg-base-bg-secundario font-semibold text-xs"
        >
          Cancelar
        </button>
      </div>

      <!-- Contenedor principal: Lienzo SVG y panel de edición -->
      <div class="flex flex-col lg:flex-row gap-3 items-start">
        <!-- Lienzo SVG con scroll propio -->
        <div
          ref="lienzoContenedorRef"
          class="relative w-full flex-1 bg-base-blanco rounded-xl border border-base-borde-sutil shadow-sm overflow-auto min-h-[22rem] max-h-[36rem]"
          tabindex="-1"
          @pointermove="onSvgPointerMove"
          @pointerup="onSvgPointerUp"
          @click.self="deseleccionarTodo"
        >
          <svg
            ref="svgRef"
            :width="dimensionesLienzo.ancho"
            :height="dimensionesLienzo.alto"
            class="block select-none font-sans"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <!-- Cuadrícula suave de 20px -->
              <pattern id="patron-rejilla" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.8" opacity="0.6" />
              </pattern>

              <!-- Punta de flecha normal -->
              <marker
                id="punta-flecha"
                viewBox="0 0 10 8"
                refX="9"
                refY="4"
                markerWidth="8"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 4 L 0 8 z" fill="#64748b" />
              </marker>

              <!-- Punta de flecha seleccionada -->
              <marker
                id="punta-flecha-seleccionada"
                viewBox="0 0 10 8"
                refX="9"
                refY="4"
                markerWidth="8"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 4 L 0 8 z" fill="#d97706" />
              </marker>
            </defs>

            <!-- Fondo con cuadrícula -->
            <rect
              x="0"
              y="0"
              :width="dimensionesLienzo.ancho"
              :height="dimensionesLienzo.alto"
              fill="url(#patron-rejilla)"
              @click="deseleccionarTodo"
            />

            <!-- Flechas entre figuras -->
            <g class="flechas-conexiones">
              <g
                v-for="fl in listaFlechas"
                :key="`${fl.origenId}-${fl.salida}-${fl.destinoId}`"
                class="cursor-pointer"
                @click.stop="seleccionarFlecha(fl.origenId, fl.salida)"
              >
                <!-- Línea invisible más ancha para facilitar clic/toque -->
                <path
                  :d="fl.ruta"
                  fill="none"
                  stroke="transparent"
                  stroke-width="18"
                />

                <!-- Línea visible de la flecha -->
                <path
                  :d="fl.ruta"
                  fill="none"
                  :stroke="esFlechaSeleccionada(fl) ? '#d97706' : '#64748b'"
                  :stroke-width="esFlechaSeleccionada(fl) ? 3 : 2"
                  :marker-end="esFlechaSeleccionada(fl) ? 'url(#punta-flecha-seleccionada)' : 'url(#punta-flecha)'"
                />

                <!-- Etiqueta Sí / No sobre la línea para decisiones -->
                <g v-if="fl.etiqueta" :transform="`translate(${fl.etiquetaX}, ${fl.etiquetaY})`">
                  <rect
                    x="-12"
                    y="-10"
                    width="24"
                    height="18"
                    rx="4"
                    fill="#ffffff"
                    :stroke="esFlechaSeleccionada(fl) ? '#d97706' : '#94a3b8'"
                    stroke-width="1.2"
                  />
                  <text
                    x="0"
                    y="3"
                    text-anchor="middle"
                    class="text-[10px] font-bold"
                    :fill="fl.etiqueta === 'Sí' ? '#16a34a' : '#dc2626'"
                  >
                    {{ fl.etiqueta }}
                  </text>
                </g>
              </g>
            </g>

            <!-- Flecha temporal mientras se arrastra una conexión -->
            <g v-if="arrastrandoConexion">
              <line
                :x1="arrastrandoConexion.origenX"
                :y1="arrastrandoConexion.origenY"
                :x2="arrastrandoConexion.actualX"
                :y2="arrastrandoConexion.actualY"
                stroke="#d97706"
                stroke-width="2.5"
                stroke-dasharray="4 4"
                marker-end="url(#punta-flecha-seleccionada)"
              />
            </g>

            <!-- Figuras -->
            <g
              v-for="fig in diagrama.figuras"
              :key="fig.id"
              :data-figura-id="fig.id"
              :transform="`translate(${fig.x}, ${fig.y})`"
              :tabindex="soloLectura ? -1 : 0"
              role="button"
              :style="soloLectura ? undefined : 'touch-action: none'"
              :aria-label="ariaLabelFigura(fig)"
              :class="[
                'outline-none focus:ring-2 focus:ring-acento-ambar-fuerte',
                soloLectura ? 'cursor-default' : 'cursor-move'
              ]"
              @pointerdown="onFiguraPointerDown(fig, $event)"
              @pointermove="onFiguraPointerMove(fig, $event)"
              @pointerup="onFiguraPointerUp(fig, $event)"
              @click.stop="onFiguraClick(fig)"
              @keydown.enter.prevent="iniciarEdicionTeclado(fig)"
              @keydown.delete.prevent="borrarFigura(fig)"
              @keydown.up.prevent="moverFiguraTeclado(fig, 0, -10)"
              @keydown.down.prevent="moverFiguraTeclado(fig, 0, 10)"
              @keydown.left.prevent="moverFiguraTeclado(fig, -10, 0)"
              @keydown.right.prevent="moverFiguraTeclado(fig, 10, 0)"
            >
              <!-- Geometría de la figura según su forma -->
              <!-- 1. Óvalo (Inicio / Fin) -->
              <rect
                v-if="TIPO_FIGURA[fig.tipo].forma === 'ovalo'"
                x="0"
                y="0"
                :width="geometriaFigura(fig).w"
                :height="geometriaFigura(fig).h"
                :rx="geometriaFigura(fig).h / 2"
                :ry="geometriaFigura(fig).h / 2"
                :fill="colorFondoFigura(fig)"
                :stroke="colorBordeFigura(fig)"
                :stroke-width="anchoBordeFigura(fig)"
                class="transition-colors"
              />

              <!-- 2. Paralelogramo (Entrada / Salida) -->
              <polygon
                v-else-if="TIPO_FIGURA[fig.tipo].forma === 'paralelogramo'"
                :points="`18,0 ${geometriaFigura(fig).w},0 ${geometriaFigura(fig).w - 18},${geometriaFigura(fig).h} 0,${geometriaFigura(fig).h}`"
                :fill="colorFondoFigura(fig)"
                :stroke="colorBordeFigura(fig)"
                :stroke-width="anchoBordeFigura(fig)"
                class="transition-colors"
              />

              <!-- 3. Rectángulo (Proceso) -->
              <rect
                v-else-if="TIPO_FIGURA[fig.tipo].forma === 'rectangulo'"
                x="0"
                y="0"
                :width="geometriaFigura(fig).w"
                :height="geometriaFigura(fig).h"
                rx="6"
                ry="6"
                :fill="colorFondoFigura(fig)"
                :stroke="colorBordeFigura(fig)"
                :stroke-width="anchoBordeFigura(fig)"
                class="transition-colors"
              />

              <!-- 4. Rombo (Decisión) -->
              <polygon
                v-else-if="TIPO_FIGURA[fig.tipo].forma === 'rombo'"
                :points="`${geometriaFigura(fig).w / 2},0 ${geometriaFigura(fig).w},${geometriaFigura(fig).h / 2} ${geometriaFigura(fig).w / 2},${geometriaFigura(fig).h} 0,${geometriaFigura(fig).h / 2}`"
                :fill="colorFondoFigura(fig)"
                :stroke="colorBordeFigura(fig)"
                :stroke-width="anchoBordeFigura(fig)"
                class="transition-colors"
              />

              <!-- Texto dentro de la figura, partido en líneas -->
              <text
                :x="geometriaFigura(fig).w / 2"
                :y="posicionInicialTexto(fig)"
                text-anchor="middle"
                class="text-xs font-semibold fill-base-texto-primario pointer-events-none"
              >
                <tspan
                  v-for="(linea, idx) in lineasTexto(fig)"
                  :key="idx"
                  :x="geometriaFigura(fig).w / 2"
                  :dy="idx === 0 ? 0 : 16"
                >
                  {{ linea }}
                </tspan>
              </text>

              <!-- Icono de error si la figura no valida con traducirDiagrama -->
              <g
                v-if="tieneError(fig)"
                :transform="`translate(${geometriaFigura(fig).w - 14}, -8)`"
                class="pointer-events-none"
              >
                <circle r="9" fill="#ef4444" />
                <!-- Icono de exclamación -->
                <path d="M 0 -4 L 0 1 M 0 3.5 L 0 5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
              </g>

              <!-- Puntos de salida (puertos de conexión) si no es solo lectura -->
              <template v-if="!soloLectura">
                <!-- Puerto normal (todas menos decisión y fin) -->
                <g
                  v-if="fig.tipo !== 'decision' && fig.tipo !== 'fin'"
                  :transform="`translate(${geometriaFigura(fig).w / 2}, ${geometriaFigura(fig).h})`"
                  class="cursor-crosshair group"
                  style="touch-action: none"
                  @pointerdown.stop="onPuertoPointerDown(fig, 'siguiente', $event)"
                >
                  <circle r="12" fill="transparent" />
                  <circle
                    r="5"
                    fill="#ffffff"
                    stroke="#d97706"
                    stroke-width="2"
                    class="group-hover:scale-125 transition-transform"
                  />
                </g>

                <!-- Puertos de decisión: Sí (abajo) y No (derecha) -->
                <template v-else-if="fig.tipo === 'decision'">
                  <!-- Puerto Sí (abajo) -->
                  <g
                    :transform="`translate(${geometriaFigura(fig).w / 2}, ${geometriaFigura(fig).h})`"
                    class="cursor-crosshair group"
                    style="touch-action: none"
                    @pointerdown.stop="onPuertoPointerDown(fig, 'si', $event)"
                  >
                    <circle r="12" fill="transparent" />
                    <circle
                      r="5"
                      fill="#ffffff"
                      stroke="#16a34a"
                      stroke-width="2"
                      class="group-hover:scale-125 transition-transform"
                    />
                    <text x="0" y="16" text-anchor="middle" class="text-[9px] font-bold fill-[#16a34a]">Sí</text>
                  </g>

                  <!-- Puerto No (derecha) -->
                  <g
                    :transform="`translate(${geometriaFigura(fig).w}, ${geometriaFigura(fig).h / 2})`"
                    class="cursor-crosshair group"
                    style="touch-action: none"
                    @pointerdown.stop="onPuertoPointerDown(fig, 'no', $event)"
                  >
                    <circle r="12" fill="transparent" />
                    <circle
                      r="5"
                      fill="#ffffff"
                      stroke="#dc2626"
                      stroke-width="2"
                      class="group-hover:scale-125 transition-transform"
                    />
                    <text x="14" y="3" text-anchor="start" class="text-[9px] font-bold fill-[#dc2626]">No</text>
                  </g>
                </template>
              </template>
            </g>
          </svg>
        </div>

        <!-- Panel lateral/inferior de edición (solo si hay selección y no es solo lectura) -->
        <aside
          v-if="!soloLectura && (figuraSeleccionada || flechaSeleccionadaData)"
          class="w-full lg:w-72 bg-base-blanco rounded-xl border border-base-borde-fuerte p-4 shadow-sm space-y-3 shrink-0"
          aria-label="Panel de edición"
        >
          <!-- Si hay una flecha seleccionada -->
          <div v-if="flechaSeleccionadaData" class="space-y-3">
            <div class="flex items-center justify-between border-b border-base-borde-sutil pb-2">
              <span class="font-bold text-base-texto-primario text-xs flex items-center gap-1.5">
                <Link2 :size="14" class="text-acento-ambar-fuerte" aria-hidden="true" />
                Flecha de conexión
              </span>
              <button
                type="button"
                @click="deseleccionarTodo"
                class="p-1 rounded text-base-texto-secundario hover:text-base-texto-primario"
                aria-label="Cerrar panel"
              >
                <X :size="14" aria-hidden="true" />
              </button>
            </div>

            <p class="text-xs text-base-texto-secundario">
              De: <strong class="text-base-texto-primario">{{ flechaSeleccionadaData.origenTitulo }}</strong>
              <br />
              A: <strong class="text-base-texto-primario">{{ flechaSeleccionadaData.destinoTitulo }}</strong>
              <span v-if="flechaSeleccionadaData.rama" class="block font-semibold mt-0.5 text-acento-ambar-fuerte">
                Rama: {{ flechaSeleccionadaData.rama }}
              </span>
            </p>

            <button
              type="button"
              @click="quitarFlechaSeleccionada"
              class="w-full min-h-[44px] sm:min-h-[36px] px-3 py-2 rounded-lg bg-semantico-falla/10 hover:bg-semantico-falla/20 text-semantico-falla font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Unlink :size="14" aria-hidden="true" />
              <span>Quitar flecha</span>
            </button>
          </div>

          <!-- Si hay una figura seleccionada -->
          <div v-else-if="figuraSeleccionada" class="space-y-3">
            <div class="flex items-center justify-between border-b border-base-borde-sutil pb-2">
              <div>
                <span class="font-bold text-base-texto-primario text-xs">
                  {{ TIPO_FIGURA[figuraSeleccionada.tipo].nombre }}
                </span>
                <span class="text-[10px] font-mono text-base-texto-secundario ml-1.5">
                  ({{ figuraSeleccionada.id }})
                </span>
              </div>
              <button
                type="button"
                @click="deseleccionarTodo"
                class="p-1 rounded text-base-texto-secundario hover:text-base-texto-primario"
                aria-label="Cerrar panel"
              >
                <X :size="14" aria-hidden="true" />
              </button>
            </div>

            <p class="text-[11px] text-base-texto-secundario leading-relaxed">
              {{ TIPO_FIGURA[figuraSeleccionada.tipo].ayuda }}
            </p>

            <!-- Campo de texto (Inicio y Fin no tienen texto editable) -->
            <div v-if="figuraSeleccionada.tipo !== 'inicio' && figuraSeleccionada.tipo !== 'fin'" class="space-y-1">
              <label for="editor-texto-figura" class="block font-semibold text-[11px] text-base-texto-primario">
                Contenido
              </label>

              <!-- Multilínea para Proceso -->
              <textarea
                v-if="figuraSeleccionada.tipo === 'proceso'"
                id="editor-texto-figura"
                ref="campoTextoRef"
                v-model="figuraSeleccionada.texto"
                rows="4"
                maxlength="200"
                placeholder="Una instrucción por línea..."
                class="w-full px-2.5 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco text-xs font-mono outline-none focus:border-acento-ambar-fuerte leading-relaxed"
                @input="emitirCambios"
              />

              <!-- Una línea para Entrada, Decisión y Salida -->
              <input
                v-else
                id="editor-texto-figura"
                ref="campoTextoRef"
                v-model="figuraSeleccionada.texto"
                type="text"
                maxlength="200"
                :placeholder="figuraSeleccionada.tipo === 'decision' ? 'x >= 10' : 'valor'"
                class="w-full px-2.5 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco text-xs font-mono outline-none focus:border-acento-ambar-fuerte"
                @input="emitirCambios"
              />
              <span class="text-[10px] text-base-texto-secundario block text-right">
                {{ figuraSeleccionada.texto.length }} / 200
              </span>
            </div>

            <!-- Acciones de conexión por botón -->
            <div class="space-y-1.5 pt-1 border-t border-base-borde-sutil">
              <!-- No es Fin: puede conectar -->
              <template v-if="figuraSeleccionada.tipo !== 'fin'">
                <!-- Decisión: conectar Sí y conectar No -->
                <template v-if="figuraSeleccionada.tipo === 'decision'">
                  <div class="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      @click="activarModoUnion('si')"
                      class="min-h-[44px] sm:min-h-[32px] flex-1 px-2.5 py-1 rounded bg-base-blanco border border-base-borde-fuerte hover:bg-base-bg-secundario font-semibold text-xs text-left"
                    >
                      Unir «Sí» con…
                    </button>
                    <button
                      v-if="figuraSeleccionada.si"
                      type="button"
                      @click="quitarSalida('si')"
                      class="min-h-[44px] sm:min-h-[32px] px-2 py-1 text-semantico-falla hover:bg-semantico-falla/10 rounded font-semibold text-xs"
                      title="Quitar flecha del Sí"
                    >
                      Quitar
                    </button>
                  </div>

                  <div class="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      @click="activarModoUnion('no')"
                      class="min-h-[44px] sm:min-h-[32px] flex-1 px-2.5 py-1 rounded bg-base-blanco border border-base-borde-fuerte hover:bg-base-bg-secundario font-semibold text-xs text-left"
                    >
                      Unir «No» con…
                    </button>
                    <button
                      v-if="figuraSeleccionada.no"
                      type="button"
                      @click="quitarSalida('no')"
                      class="min-h-[44px] sm:min-h-[32px] px-2 py-1 text-semantico-falla hover:bg-semantico-falla/10 rounded font-semibold text-xs"
                      title="Quitar flecha del No"
                    >
                      Quitar
                    </button>
                  </div>
                </template>

                <!-- Otras figuras: botón Unir con… -->
                <div v-else class="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    @click="activarModoUnion('siguiente')"
                    class="min-h-[44px] sm:min-h-[32px] flex-1 px-2.5 py-1 rounded bg-base-blanco border border-base-borde-fuerte hover:bg-base-bg-secundario font-semibold text-xs text-left flex items-center gap-1.5"
                  >
                    <Link2 :size="13" class="text-acento-ambar-fuerte" aria-hidden="true" />
                    <span>Unir con…</span>
                  </button>
                  <button
                    v-if="figuraSeleccionada.siguiente"
                    type="button"
                    @click="quitarSalida('siguiente')"
                    class="min-h-[44px] sm:min-h-[32px] px-2 py-1 text-semantico-falla hover:bg-semantico-falla/10 rounded font-semibold text-xs"
                    title="Quitar flecha"
                  >
                    Quitar flecha
                  </button>
                </div>
              </template>

              <!-- Botón Borrar Figura -->
              <button
                type="button"
                @click="borrarFigura(figuraSeleccionada)"
                class="w-full min-h-[44px] sm:min-h-[32px] mt-2 px-3 py-1.5 rounded-lg border border-semantico-falla/40 text-semantico-falla hover:bg-semantico-falla/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 :size="13" aria-hidden="true" />
                <span>Borrar figura</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- Aviso en vivo de validación (traducirDiagrama) bajo el lienzo -->
      <div
        v-if="errorTraduccion && !soloLectura"
        role="alert"
        class="p-3 bg-semantico-falla/10 border border-semantico-falla/30 text-semantico-falla rounded-xl text-xs flex items-center gap-2.5 shadow-sm"
      >
        <AlertTriangle :size="16" class="shrink-0 text-semantico-falla" aria-hidden="true" />
        <span class="font-medium leading-relaxed">{{ errorTraduccion.mensaje }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { AlertCircle, AlertTriangle, Link2, RefreshCw, Trash2, Unlink, X } from 'lucide-vue-next'
import {
  type Diagrama,
  type ErrorDiagrama,
  type Figura,
  LIMITES_DIAGRAMA,
  TIPO_FIGURA,
  type TipoFigura,
  diagramaInicial,
  leerDiagrama,
  traducirDiagrama
} from '~/utils/diagramaFlujo'

const props = withDefaults(
  defineProps<{
    modelValue: string
    soloLectura?: boolean
  }>(),
  {
    soloLectura: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const limiteFiguras = LIMITES_DIAGRAMA.figuras

const diagrama = ref<Diagrama>(diagramaInicial())
const parseError = ref<string | null>(null)
const ultimoJsonEmitido = ref('')
const errorTraduccion = ref<ErrorDiagrama | null>(null)

const figuraSeleccionadaId = ref<string | null>(null)
const flechaSeleccionada = ref<{ origenId: string; salida: 'siguiente' | 'si' | 'no' } | null>(null)
const modoUnion = ref<{ origenId: string; salida: 'siguiente' | 'si' | 'no' } | null>(null)

const lienzoContenedorRef = ref<HTMLDivElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const campoTextoRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

// Estado del arrastre de figuras
interface EstadoArrastre {
  id: string
  pointerId: number
  startClientX: number
  startClientY: number
  initX: number
  initY: number
  haMovido: boolean
}
const arrastreActual = ref<EstadoArrastre | null>(null)

// Estado del arrastre de conexiones interactivas
interface EstadoArrastreConexion {
  origenId: string
  salida: 'siguiente' | 'si' | 'no'
  origenX: number
  origenY: number
  actualX: number
  actualY: number
}
const arrastrandoConexion = ref<EstadoArrastreConexion | null>(null)

const hayInicio = computed(() => diagrama.value.figuras.some((f) => f.tipo === 'inicio'))

const figuraSeleccionada = computed(() => {
  if (!figuraSeleccionadaId.value) return null
  return diagrama.value.figuras.find((f) => f.id === figuraSeleccionadaId.value) ?? null
})

const flechaSeleccionadaData = computed(() => {
  if (!flechaSeleccionada.value) return null
  const origen = diagrama.value.figuras.find((f) => f.id === flechaSeleccionada.value!.origenId)
  if (!origen) return null
  const destinoId = origen[flechaSeleccionada.value.salida]
  if (!destinoId) return null
  const destino = diagrama.value.figuras.find((f) => f.id === destinoId)
  return {
    origenTitulo: `${TIPO_FIGURA[origen.tipo].nombre} (${origen.id})`,
    destinoTitulo: destino ? `${TIPO_FIGURA[destino.tipo].nombre} (${destino.id})` : destinoId,
    rama: flechaSeleccionada.value.salida === 'si' ? 'Sí' : flechaSeleccionada.value.salida === 'no' ? 'No' : null
  }
})

// Dimensiones dinámicas del lienzo para scroll nativo
const dimensionesLienzo = computed(() => {
  let maxX = 750
  let maxY = 550
  for (const f of diagrama.value.figuras) {
    const geo = geometriaFigura(f)
    if (f.x + geo.w + 120 > maxX) maxX = f.x + geo.w + 120
    if (f.y + geo.h + 120 > maxY) maxY = f.y + geo.h + 120
  }
  return { ancho: maxX, alto: maxY }
})

// Declarado antes del watch inmediato de abajo: ese watch valida al cargar y usa este reloj durante el setup.
let timerValidacion: ReturnType<typeof setTimeout> | null = null

// Cargar modelValue inicial o cuando cambie externamente
watch(
  () => props.modelValue,
  (nuevo) => {
    cargarModelo(nuevo)
  },
  { immediate: true }
)

function cargarModelo(jsonStr: string) {
  if (jsonStr === ultimoJsonEmitido.value) return
  const res = leerDiagrama(jsonStr)
  if (res.ok) {
    parseError.value = null
    diagrama.value = res.diagrama
    ultimoJsonEmitido.value = jsonStr
    ejecutarValidacionEnVivo()
  } else {
    parseError.value = res.mensaje
  }
}

function emitirCambios() {
  const json = JSON.stringify(diagrama.value, null, 2)
  ultimoJsonEmitido.value = json
  emit('update:modelValue', json)
  ejecutarValidacionEnVivo()
}

function restablecerDiagrama() {
  const inicial = diagramaInicial()
  diagrama.value = inicial
  parseError.value = null
  figuraSeleccionadaId.value = null
  flechaSeleccionada.value = null
  modoUnion.value = null
  emitirCambios()
}

// ─── Validación en vivo con debounce de 400 ms ──────────────────────────────
function ejecutarValidacionEnVivo() {
  if (props.soloLectura) {
    errorTraduccion.value = null
    return
  }
  if (timerValidacion) clearTimeout(timerValidacion)
  timerValidacion = setTimeout(() => {
    const res = traducirDiagrama(diagrama.value)
    if (!res.ok) {
      errorTraduccion.value = res.error
    } else {
      errorTraduccion.value = null
    }
  }, 400)
}

// Esc cancela «Unir con…» (o quita la selección); Supr quita la flecha elegida. Las flechas no reciben foco, por eso se
// escucha en la ventana, sin tocar lo que se escribe en un campo de texto.
function onTeclaGlobal(e: KeyboardEvent) {
  if (props.soloLectura) return
  const t = e.target as HTMLElement | null
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
  if (e.key === 'Escape' && (modoUnion.value || flechaSeleccionada.value)) {
    deseleccionarTodo()
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && flechaSeleccionada.value) {
    e.preventDefault()
    quitarFlechaSeleccionada()
  }
}
onMounted(() => {
  window.addEventListener('keydown', onTeclaGlobal)
  // En un celular el lienzo es más angosto que el diagrama: se abre desplazado hasta la primera figura, no cortado.
  nextTick(() => {
    const c = lienzoContenedorRef.value
    if (!c || !diagrama.value.figuras.length || c.scrollWidth <= c.clientWidth) return
    c.scrollLeft = Math.max(0, Math.min(...diagrama.value.figuras.map((f) => f.x)) - 16)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onTeclaGlobal)
  if (timerValidacion) clearTimeout(timerValidacion)
})

// ─── Geometría y cálculo de texto ───────────────────────────────────────────
function lineasTexto(fig: Figura): string[] {
  if (fig.tipo === 'inicio') return ['Inicio']
  if (fig.tipo === 'fin') return ['Fin']
  const texto = fig.texto.trim()
  if (!texto) return ['…']

  const parrafos = texto.split('\n')
  const resultado: string[] = []
  const maxPorLinea = fig.tipo === 'decision' ? 16 : 20

  for (const p of parrafos) {
    if (p.length <= maxPorLinea) {
      resultado.push(p)
    } else {
      const palabras = p.split(' ')
      let actual = ''
      for (const pal of palabras) {
        if (!actual) {
          actual = pal
        } else if ((actual + ' ' + pal).length <= maxPorLinea) {
          actual += ' ' + pal
        } else {
          resultado.push(actual)
          actual = pal
        }
      }
      if (actual) resultado.push(actual)
    }
  }
  return resultado.slice(0, 5)
}

function geometriaFigura(fig: Figura): { w: number; h: number } {
  const lineas = lineasTexto(fig)
  const maxChars = Math.max(...lineas.map((l) => l.length), 4)

  if (fig.tipo === 'inicio' || fig.tipo === 'fin') {
    return { w: 140, h: 48 }
  }
  if (fig.tipo === 'decision') {
    const w = Math.max(150, Math.min(260, 48 + maxChars * 9))
    const h = Math.max(68, Math.min(130, 36 + lineas.length * 18))
    return { w, h }
  }
  if (fig.tipo === 'entrada' || fig.tipo === 'salida') {
    const w = Math.max(140, Math.min(260, 44 + maxChars * 8))
    const h = Math.max(50, Math.min(120, 24 + lineas.length * 16))
    return { w, h }
  }
  // Rectángulo
  const w = Math.max(140, Math.min(250, 36 + maxChars * 8))
  const h = Math.max(50, Math.min(130, 26 + lineas.length * 16))
  return { w, h }
}

function posicionInicialTexto(fig: Figura): number {
  const geo = geometriaFigura(fig)
  const lineas = lineasTexto(fig)
  const alturaTotalTexto = (lineas.length - 1) * 16
  return (geo.h - alturaTotalTexto) / 2 + 4
}

// ─── Colores y estilos de figuras ───────────────────────────────────────────
function tieneError(fig: Figura): boolean {
  return errorTraduccion.value?.figuraId === fig.id
}

function esFiguraSeleccionada(fig: Figura): boolean {
  return figuraSeleccionadaId.value === fig.id
}

function colorFondoFigura(fig: Figura): string {
  if (esFiguraSeleccionada(fig)) return '#fef3c7' // acento-ambar sutil
  return '#ffffff'
}

function colorBordeFigura(fig: Figura): string {
  if (tieneError(fig)) return '#ef4444' // semantico-falla
  if (esFiguraSeleccionada(fig)) return '#d97706' // acento-ambar-fuerte
  return '#94a3b8' // base-borde-fuerte
}

function anchoBordeFigura(fig: Figura): number {
  if (tieneError(fig)) return 2.5
  if (esFiguraSeleccionada(fig)) return 2.2
  return 1.5
}

function ariaLabelFigura(fig: Figura): string {
  const errorInfo = tieneError(fig) ? `, con error: ${errorTraduccion.value?.mensaje}` : ''
  return `${TIPO_FIGURA[fig.tipo].nombre}: ${fig.texto || 'sin texto'}${errorInfo}`
}

// ─── Flechas de conexión ───────────────────────────────────────────────────
interface InfoFlecha {
  origenId: string
  destinoId: string
  salida: 'siguiente' | 'si' | 'no'
  ruta: string
  etiqueta?: string
  etiquetaX: number
  etiquetaY: number
}

const listaFlechas = computed<InfoFlecha[]>(() => {
  const flechas: InfoFlecha[] = []

  for (const f of diagrama.value.figuras) {
    if (f.tipo === 'decision') {
      if (f.si) {
        const dest = diagrama.value.figuras.find((d) => d.id === f.si)
        if (dest) {
          const ruta = calcularRuta(f, 'si', dest)
          flechas.push({
            origenId: f.id,
            destinoId: dest.id,
            salida: 'si',
            ruta: ruta.path,
            etiqueta: 'Sí',
            etiquetaX: ruta.labelX,
            etiquetaY: ruta.labelY
          })
        }
      }
      if (f.no) {
        const dest = diagrama.value.figuras.find((d) => d.id === f.no)
        if (dest) {
          const ruta = calcularRuta(f, 'no', dest)
          flechas.push({
            origenId: f.id,
            destinoId: dest.id,
            salida: 'no',
            ruta: ruta.path,
            etiqueta: 'No',
            etiquetaX: ruta.labelX,
            etiquetaY: ruta.labelY
          })
        }
      }
    } else if (f.tipo !== 'fin' && f.siguiente) {
      const dest = diagrama.value.figuras.find((d) => d.id === f.siguiente)
      if (dest) {
        const ruta = calcularRuta(f, 'siguiente', dest)
        flechas.push({
          origenId: f.id,
          destinoId: dest.id,
          salida: 'siguiente',
          ruta: ruta.path,
          etiquetaX: ruta.labelX,
          etiquetaY: ruta.labelY
        })
      }
    }
  }

  return flechas
})

function calcularRuta(
  orig: Figura,
  salida: 'siguiente' | 'si' | 'no',
  dest: Figura
): { path: string; labelX: number; labelY: number } {
  const geoOrig = geometriaFigura(orig)
  const geoDest = geometriaFigura(dest)

  let x1: number
  let y1: number

  if (salida === 'no') {
    x1 = orig.x + geoOrig.w
    y1 = orig.y + geoOrig.h / 2
  } else {
    // siguiente o si
    x1 = orig.x + geoOrig.w / 2
    y1 = orig.y + geoOrig.h
  }

  // Punto de llegada a la figura destino
  let x2: number
  let y2: number

  // Si destino está abajo
  if (dest.y >= y1) {
    x2 = dest.x + geoDest.w / 2
    y2 = dest.y
  } else if (salida === 'no' && dest.x > orig.x) {
    // Si sale por la derecha y destino está arriba a la derecha
    x2 = dest.x
    y2 = dest.y + geoDest.h / 2
  } else {
    // Bucle hacia arriba
    x2 = dest.x + geoDest.w / 2
    y2 = dest.y
  }

  let path = ''
  let labelX = (x1 + x2) / 2
  let labelY = (y1 + y2) / 2

  if (Math.abs(x1 - x2) < 4 && y2 >= y1) {
    // Línea vertical recta
    path = `M ${x1} ${y1} L ${x2} ${y2}`
    labelX = x1 + 14
    labelY = (y1 + y2) / 2
  } else if (y2 >= y1 + 20) {
    // Curva suave descendente
    const deltaY = (y2 - y1) * 0.5
    path = `M ${x1} ${y1} C ${x1} ${y1 + deltaY}, ${x2} ${y2 - deltaY}, ${x2} ${y2}`
    labelX = (x1 + x2) / 2
    labelY = (y1 + y2) / 2
  } else {
    // Retorno hacia arriba o hacia el lateral
    const margenLateral = Math.max(x1, x2) + 60
    path = `M ${x1} ${y1} C ${margenLateral} ${y1}, ${margenLateral} ${y2 - 30}, ${x2} ${y2}`
    labelX = margenLateral - 10
    labelY = (y1 + y2) / 2
  }

  return { path, labelX, labelY }
}

function esFlechaSeleccionada(fl: InfoFlecha): boolean {
  if (!flechaSeleccionada.value) return false
  return flechaSeleccionada.value.origenId === fl.origenId && flechaSeleccionada.value.salida === fl.salida
}

function seleccionarFlecha(origenId: string, salida: 'siguiente' | 'si' | 'no') {
  if (props.soloLectura) return
  figuraSeleccionadaId.value = null
  flechaSeleccionada.value = { origenId, salida }
}

function quitarFlechaSeleccionada() {
  if (!flechaSeleccionada.value) return
  const origen = diagrama.value.figuras.find((f) => f.id === flechaSeleccionada.value!.origenId)
  if (origen) {
    origen[flechaSeleccionada.value.salida] = null
    flechaSeleccionada.value = null
    emitirCambios()
  }
}

function quitarSalida(salida: 'siguiente' | 'si' | 'no') {
  if (!figuraSeleccionada.value) return
  figuraSeleccionada.value[salida] = null
  emitirCambios()
}

// ─── Arrastre de figuras con Pointer Events y setPointerCapture ─────────────
function onFiguraPointerDown(fig: Figura, e: PointerEvent) {
  if (props.soloLectura) return
  if (modoUnion.value) {
    completarModoUnion(fig)
    return
  }

  seleccionarFigura(fig)

  const el = e.currentTarget as Element | null
  if (el && typeof el.setPointerCapture === 'function') {
    try {
      el.setPointerCapture(e.pointerId)
    } catch {}
  }

  arrastreActual.value = {
    id: fig.id,
    pointerId: e.pointerId,
    startClientX: e.clientX,
    startClientY: e.clientY,
    initX: fig.x,
    initY: fig.y,
    haMovido: false
  }
}

function onFiguraPointerMove(fig: Figura, e: PointerEvent) {
  if (!arrastreActual.value || arrastreActual.value.id !== fig.id) return
  const dx = e.clientX - arrastreActual.value.startClientX
  const dy = e.clientY - arrastreActual.value.startClientY

  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    arrastreActual.value.haMovido = true
  }

  fig.x = Math.max(10, Math.round((arrastreActual.value.initX + dx) / 10) * 10)
  fig.y = Math.max(10, Math.round((arrastreActual.value.initY + dy) / 10) * 10)
}

function onFiguraPointerUp(fig: Figura, e: PointerEvent) {
  if (!arrastreActual.value || arrastreActual.value.id !== fig.id) return
  const el = e.currentTarget as Element | null
  if (el && typeof el.releasePointerCapture === 'function') {
    try {
      el.releasePointerCapture(e.pointerId)
    } catch {}
  }
  if (arrastreActual.value.haMovido) {
    emitirCambios()
  }
  arrastreActual.value = null
}

function onFiguraClick(fig: Figura) {
  if (props.soloLectura) return
  if (modoUnion.value) {
    completarModoUnion(fig)
    return
  }
  seleccionarFigura(fig)
}

function seleccionarFigura(fig: Figura) {
  if (props.soloLectura) return
  flechaSeleccionada.value = null
  figuraSeleccionadaId.value = fig.id
}

function deseleccionarTodo() {
  figuraSeleccionadaId.value = null
  flechaSeleccionada.value = null
  modoUnion.value = null
}

function iniciarEdicionTeclado(fig: Figura) {
  seleccionarFigura(fig)
  nextTick(() => {
    campoTextoRef.value?.focus()
  })
}

function moverFiguraTeclado(fig: Figura, deltaX: number, deltaY: number) {
  if (props.soloLectura) return
  fig.x = Math.max(10, fig.x + deltaX)
  fig.y = Math.max(10, fig.y + deltaY)
  emitirCambios()
}

// ─── Conexiones por arrastre desde puertos ───────────────────────────────────
function onPuertoPointerDown(fig: Figura, salida: 'siguiente' | 'si' | 'no', e: PointerEvent) {
  if (props.soloLectura) return
  const el = e.currentTarget as Element | null
  if (el && typeof el.setPointerCapture === 'function') {
    try {
      el.setPointerCapture(e.pointerId)
    } catch {}
  }

  const geo = geometriaFigura(fig)
  let origX = fig.x + geo.w / 2
  let origY = fig.y + geo.h
  if (salida === 'no') {
    origX = fig.x + geo.w
    origY = fig.y + geo.h / 2
  }

  arrastrandoConexion.value = {
    origenId: fig.id,
    salida,
    origenX: origX,
    origenY: origY,
    actualX: origX,
    actualY: origY
  }
}

function onSvgPointerMove(e: PointerEvent) {
  if (!arrastrandoConexion.value || !svgRef.value) return
  const rect = svgRef.value.getBoundingClientRect()
  arrastrandoConexion.value.actualX = e.clientX - rect.left
  arrastrandoConexion.value.actualY = e.clientY - rect.top
}

function onSvgPointerUp(e: PointerEvent) {
  if (!arrastrandoConexion.value) return
  const conn = arrastrandoConexion.value
  arrastrandoConexion.value = null

  // Detectar figura bajo el puntero
  const elem = document.elementFromPoint(e.clientX, e.clientY)
  const figElem = elem?.closest('[data-figura-id]')
  const targetId = figElem?.getAttribute('data-figura-id')

  if (targetId && targetId !== conn.origenId) {
    const origen = diagrama.value.figuras.find((f) => f.id === conn.origenId)
    if (origen) {
      origen[conn.salida] = targetId
      emitirCambios()
    }
  }
}

// ─── Modo Unión por botones (para celular y teclado) ─────────────────────────
function activarModoUnion(salida: 'siguiente' | 'si' | 'no') {
  if (!figuraSeleccionada.value) return
  modoUnion.value = { origenId: figuraSeleccionada.value.id, salida }
}

function cancelarModoUnion() {
  modoUnion.value = null
}

function completarModoUnion(destino: Figura) {
  if (!modoUnion.value) return
  if (destino.id === modoUnion.value.origenId) return

  const origen = diagrama.value.figuras.find((f) => f.id === modoUnion.value!.origenId)
  if (origen) {
    origen[modoUnion.value.salida] = destino.id
    emitirCambios()
  }
  modoUnion.value = null
}

// ─── Agregar y borrar figuras ───────────────────────────────────────────────
function generarNuevoId(tipo: TipoFigura, figuras: Figura[]): string {
  if (tipo === 'inicio' && !figuras.some((f) => f.id === 'inicio')) return 'inicio'
  if (tipo === 'fin' && !figuras.some((f) => f.id === 'fin')) return 'fin'

  let n = 1
  while (figuras.some((f) => f.id === `f${n}`)) {
    n++
  }
  return `f${n}`
}

function encontrarLugarLibre(): { x: number; y: number } {
  if (diagrama.value.figuras.length === 0) return { x: 160, y: 30 }
  const maxY = Math.max(...diagrama.value.figuras.map((f) => f.y))
  const ultima = diagrama.value.figuras[diagrama.value.figuras.length - 1]
  return {
    x: ultima ? ultima.x : 160,
    y: maxY + 100
  }
}

function agregarFigura(tipo: TipoFigura) {
  if (props.soloLectura) return
  if (diagrama.value.figuras.length >= limiteFiguras) return

  const id = generarNuevoId(tipo, diagrama.value.figuras)
  const pos = encontrarLugarLibre()

  let textoPredeterminado = ''
  if (tipo === 'inicio') textoPredeterminado = 'Inicio'
  else if (tipo === 'fin') textoPredeterminado = 'Fin'
  else if (tipo === 'entrada') textoPredeterminado = 'variable'
  else if (tipo === 'proceso') textoPredeterminado = 'x <- 1'
  else if (tipo === 'decision') textoPredeterminado = 'x >= 0'
  else if (tipo === 'salida') textoPredeterminado = '"Listo"'

  const nueva: Figura = {
    id,
    tipo,
    texto: textoPredeterminado,
    x: pos.x,
    y: pos.y,
    siguiente: null,
    si: null,
    no: null
  }

  diagrama.value.figuras.push(nueva)
  seleccionarFigura(nueva)
  emitirCambios()

  nextTick(() => {
    if (tipo !== 'inicio' && tipo !== 'fin') {
      campoTextoRef.value?.focus()
    }
  })
}

function borrarFigura(fig: Figura) {
  if (props.soloLectura) return
  const idx = diagrama.value.figuras.findIndex((f) => f.id === fig.id)
  if (idx === -1) return

  diagrama.value.figuras.splice(idx, 1)

  // Limpiar flechas que apuntaban a esta figura
  for (const f of diagrama.value.figuras) {
    if (f.siguiente === fig.id) f.siguiente = null
    if (f.si === fig.id) f.si = null
    if (f.no === fig.id) f.no = null
  }

  if (figuraSeleccionadaId.value === fig.id) {
    figuraSeleccionadaId.value = null
  }

  emitirCambios()
}
</script>
