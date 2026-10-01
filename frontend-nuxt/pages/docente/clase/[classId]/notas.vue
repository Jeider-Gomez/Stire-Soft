<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <DocentePestanasClase :class-id="classId" activa="notas" :nombre="clase?.name" :codigo="clase?.code" />

    <header class="bg-base-blanco rounded-xl border border-base-borde-fuerte p-6 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-xl font-bold text-base-texto-primario tracking-tight">Notas de la clase</h1>
        <p class="text-xs text-base-texto-secundario mt-1 max-w-2xl">
          Opcional y a tu manera. Agrega las notas que quieras: las que STIRE calcula (el dominio de las lecciones, las
          entregas) y las que pones tú, también de actividades en el salón. Cada una puede ser del curso entero o de un
          módulo; usas porcentajes, promedias o solo registras. Las notas oficiales van a Moodle: descarga el archivo y
          súbelo en «Importar calificaciones».
        </p>
      </div>
      <button v-if="libro?.esquema" type="button" :disabled="libro.filas.length === 0" @click="descargarCsv"
        class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs inline-flex items-center gap-1.5 shrink-0 self-start disabled:opacity-40">
        <Download :size="14" aria-hidden="true" /> Descargar para Moodle (CSV)
      </button>
    </header>

    <p v-if="cargando" role="status" class="flex items-center gap-2 text-xs text-base-texto-secundario">
      <Loader2 :size="14" class="animate-spin" aria-hidden="true" /> Calculando las notas…
    </p>
    <p v-if="error" role="alert" class="text-xs text-semantico-falla">{{ error }}</p>

    <template v-if="libro">
      <!-- ─── Sin notas: es opcional. Formas de empezar, que después se cambian por completo. ─── -->
      <section v-if="!libro.esquema && !borrador" class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm p-6 space-y-4">
        <div>
          <h2 class="text-sm font-bold text-base-texto-primario">Esta clase no lleva notas en STIRE</h2>
          <p class="text-xs text-base-texto-secundario mt-1">No es obligatorio. Si quieres llevarlas aquí, elige cómo empezar; después cambias lo que quieras.</p>
        </div>
        <ul class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <li v-for="forma in formasDeEmpezar(libro.modulos)" :key="forma.id">
            <button type="button" class="w-full h-full text-left rounded-lg border border-base-borde-fuerte p-4 hover:border-acento-ambar-fuerte hover:bg-acento-ambar/5 transition-colors" @click="empezarCon(forma.esquema)">
              <span class="block text-sm font-bold text-base-texto-primario">{{ forma.titulo }}</span>
              <span class="block text-[11px] text-base-texto-secundario mt-1">{{ forma.descripcion }}</span>
            </button>
          </li>
        </ul>
      </section>

      <!-- ─── Cómo se arman las notas ─── -->
      <section v-if="borrador" class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm" aria-labelledby="titulo-esquema">
        <button v-if="libro.esquema" type="button" class="w-full flex items-center justify-between gap-3 p-5 text-left min-h-[44px]" :aria-expanded="editando" @click="editando = !editando">
          <span class="min-w-0">
            <span id="titulo-esquema" class="block text-sm font-bold text-base-texto-primario">Cómo se arman las notas</span>
            <span class="block text-[11px] text-base-texto-secundario mt-0.5">{{ resumenEsquema }}</span>
          </span>
          <ChevronDown :size="16" class="shrink-0 transition-transform" :class="editando ? 'rotate-180' : ''" aria-hidden="true" />
        </button>
        <h2 v-else id="titulo-esquema" class="p-5 pb-3 text-sm font-bold text-base-texto-primario">Arma las notas de la clase</h2>

        <form v-if="editando || !libro.esquema" class="px-5 pb-5 space-y-5" @submit.prevent="guardarEsquema">
          <!-- Las notas -->
          <fieldset class="space-y-3">
            <legend class="text-xs font-bold text-base-texto-primario mb-2">Las notas</legend>
            <div v-for="(c, i) in borrador.componentes" :key="i" class="rounded-lg border border-base-borde-sutil p-3 space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_13rem_13rem_6rem_auto] gap-3 items-end">
                <div>
                  <label :for="`comp-nombre-${i}`" class="block text-[11px] font-semibold text-base-texto-primario mb-1">Nombre</label>
                  <input :id="`comp-nombre-${i}`" v-model="c.nombre" maxlength="60" required placeholder="Ej.: Quiz en el salón" class="w-full px-3 py-2 text-xs rounded-md border border-base-borde-fuerte bg-base-blanco" />
                </div>
                <div>
                  <label :for="`comp-tipo-${i}`" class="block text-[11px] font-semibold text-base-texto-primario mb-1">De dónde sale</label>
                  <select :id="`comp-tipo-${i}`" v-model="c.tipo" class="w-full px-3 py-2 text-xs rounded-md border border-base-borde-fuerte bg-base-blanco" @change="alCambiarTipo(c)">
                    <option v-for="(t, clave) in TIPO_COMPONENTE" :key="clave" :value="clave">{{ t.nombre }}</option>
                  </select>
                </div>
                <div>
                  <label :for="`comp-modulo-${i}`" class="block text-[11px] font-semibold text-base-texto-primario mb-1">Es de</label>
                  <select :id="`comp-modulo-${i}`" v-model="c.moduloId" class="w-full px-3 py-2 text-xs rounded-md border border-base-borde-fuerte bg-base-blanco" @change="alCambiarModulo(c)">
                    <option :value="null">Todo el curso</option>
                    <option v-for="m in libro.modulos" :key="m.id" :value="m.id">{{ m.titulo }}</option>
                  </select>
                </div>
                <div v-if="usaPorcentajes(c)">
                  <label :for="`comp-peso-${i}`" class="block text-[11px] font-semibold text-base-texto-primario mb-1">Porcentaje</label>
                  <input :id="`comp-peso-${i}`" v-model.number="c.peso" type="number" min="0" max="100" step="1" class="w-full px-3 py-2 text-xs rounded-md border border-base-borde-fuerte bg-base-blanco" :aria-describedby="`comp-peso-ayuda-${i}`" />
                  <span :id="`comp-peso-ayuda-${i}`" class="sr-only">{{ c.moduloId === null ? 'en la nota final' : 'en la nota del módulo' }}</span>
                </div>
                <button type="button" :disabled="borrador.componentes.length === 1" class="px-3 py-2 rounded-md text-xs font-semibold text-semantico-falla hover:bg-semantico-falla/10 disabled:opacity-40 inline-flex items-center gap-1 justify-center" @click="borrador.componentes.splice(i, 1)">
                  <Trash2 :size="14" aria-hidden="true" /> Quitar
                </button>
              </div>
              <p class="text-[11px] text-base-texto-secundario">{{ TIPO_COMPONENTE[c.tipo].ayuda }}</p>

              <!-- Qué cuenta: las lecciones del módulo, todas, o las que elija; las entregas, todas o algunas. -->
              <fieldset v-if="c.tipo !== 'manual'" class="text-xs space-y-2">
                <legend class="text-[11px] font-semibold text-base-texto-primario mb-1">{{ c.tipo === 'dominio' ? 'Lecciones que cuentan' : 'Entregas que cuentan' }}</legend>
                <div class="flex flex-wrap gap-4">
                  <label class="inline-flex items-center gap-1.5"><input type="radio" :name="`alcance-${i}`" :checked="lista(c) === null" @change="elegirTodas(c)" /> {{ textoTodas(c) }}</label>
                  <label class="inline-flex items-center gap-1.5"><input type="radio" :name="`alcance-${i}`" :checked="lista(c) !== null" @change="elegirAlgunas(c)" /> Elegir</label>
                </div>
                <div v-if="lista(c) !== null && c.tipo === 'dominio'" class="max-h-64 overflow-y-auto rounded-md border border-base-borde-sutil p-2 space-y-2">
                  <div v-for="m in modulosParaElegir(c)" :key="m.id">
                    <label class="inline-flex items-center gap-1.5 font-semibold min-w-0">
                      <input type="checkbox" :disabled="m.lecciones.length === 0" :checked="m.lecciones.length > 0 && m.lecciones.every((id) => lista(c)!.includes(id))" @change="alternarModulo(c, m.lecciones)" />
                      <span class="truncate">Todo «{{ m.titulo }}»</span>
                    </label>
                    <div class="pl-5 grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                      <label v-for="id in m.lecciones" :key="id" class="inline-flex items-center gap-1.5 min-w-0">
                        <input type="checkbox" :checked="lista(c)!.includes(id)" @change="alternar(c, id)" />
                        <span class="truncate">{{ tituloLeccion(id) }}</span>
                      </label>
                      <span v-if="m.lecciones.length === 0" class="text-base-texto-secundario">Sin lecciones publicadas todavía.</span>
                    </div>
                  </div>
                </div>
                <div v-if="lista(c) !== null && c.tipo === 'entregas'" class="max-h-48 overflow-y-auto rounded-md border border-base-borde-sutil p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  <label v-for="op in libro.entregas" :key="op.id" class="inline-flex items-center gap-1.5 min-w-0">
                    <input type="checkbox" :checked="lista(c)!.includes(op.id)" @change="alternar(c, op.id)" />
                    <span class="truncate">{{ op.titulo }}</span>
                  </label>
                  <p v-if="libro.entregas.length === 0" class="text-base-texto-secundario">No hay entregas con nota.</p>
                </div>
              </fieldset>
            </div>
            <button type="button" :disabled="borrador.componentes.length >= 40" class="px-3 py-2 rounded-md borde-afordancia text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40" @click="agregarComponente">
              <Plus :size="14" aria-hidden="true" /> Agregar nota
            </button>
          </fieldset>

          <!-- La nota de cada módulo que tenga notas -->
          <fieldset v-if="borrador.grupos.length" class="space-y-2">
            <legend class="text-xs font-bold text-base-texto-primario mb-2">Nota de cada módulo</legend>
            <div v-for="g in borrador.grupos" :key="g.moduloId" class="rounded-lg bg-base-bg-secundario p-3 flex flex-col lg:flex-row lg:items-center gap-3 text-xs">
              <span class="font-semibold text-base-texto-primario lg:w-56 truncate">{{ tituloModulo(g.moduloId) }}</span>
              <label class="inline-flex items-center gap-2">
                <span>Sus notas se combinan</span>
                <select v-model="g.calculo" class="px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco">
                  <option value="promedio">promediando</option>
                  <option value="porcentajes">con porcentajes</option>
                </select>
              </label>
              <span v-if="g.calculo === 'porcentajes'" class="text-[11px]" :class="sumaModulo(g.moduloId) === 100 ? 'text-semantico-pasa' : 'text-base-texto-secundario'">
                Suman {{ sumaModulo(g.moduloId) }} %{{ sumaModulo(g.moduloId) === 100 ? '' : ': se reparte en proporción' }}
              </span>
              <label v-if="borrador.calculo === 'porcentajes'" class="inline-flex items-center gap-2 lg:ml-auto">
                <span>Pesa en la final</span>
                <input v-model.number="g.peso" type="number" min="0" max="100" step="1" class="w-16 px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco" :aria-label="`Porcentaje de ${tituloModulo(g.moduloId)} en la nota final`" /> %
              </label>
            </div>
          </fieldset>

          <!-- La nota final -->
          <fieldset class="rounded-lg border border-base-borde-sutil p-3 space-y-2 text-xs">
            <legend class="text-xs font-bold text-base-texto-primario px-1">Nota final</legend>
            <div class="flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-2">
              <label v-for="(texto, modo) in MODO_CALCULO" :key="modo" class="inline-flex items-center gap-1.5">
                <input v-model="borrador.calculo" type="radio" name="calculo-final" :value="modo" /> {{ texto }}
              </label>
            </div>
            <p class="text-[11px] text-base-texto-secundario">
              <template v-if="borrador.calculo === 'porcentajes'">
                Cuentan {{ itemsDeLaFinal }}. Suman {{ sumaFinal }} %{{ sumaFinal === 100 ? '.' : ': si no suman 100, se reparte en proporción.' }} Con 0 % una nota se registra pero no cuenta.
              </template>
              <template v-else-if="borrador.calculo === 'promedio'">La final es el promedio de {{ itemsDeLaFinal }}, con lo que ya tenga nota.</template>
              <template v-else>STIRE no calcula una final: registras las notas y, si quieres, pones la final a mano en la tabla.</template>
            </p>
          </fieldset>

          <div class="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
            <label class="inline-flex items-center gap-2">
              <span class="font-semibold text-base-texto-primario">Nota aprobatoria</span>
              <input v-model="aprobatoriaTexto" inputmode="decimal" required class="w-16 px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco" aria-describedby="ayuda-aprobatoria" />
            </label>
            <span id="ayuda-aprobatoria" class="text-[11px] text-base-texto-secundario">De 0,0 a 5,0. Confírmala con el reglamento de la Universidad.</span>
          </div>
          <label class="flex items-start gap-2 text-xs">
            <input v-model="borrador.visibleParaEstudiantes" type="checkbox" class="mt-0.5" />
            <span><span class="font-semibold">Cada estudiante ve sus notas</span> en «Mi progreso». Ve la nota final, no el motivo de un ajuste.</span>
          </label>

          <div class="flex flex-wrap items-center gap-3">
            <button type="submit" :disabled="guardandoEsquema" class="px-4 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs disabled:opacity-40">
              {{ guardandoEsquema ? 'Guardando…' : 'Guardar' }}
            </button>
            <button type="button" class="px-4 py-2 rounded-md borde-afordancia text-xs font-semibold" @click="descartar">{{ libro.esquema ? 'Descartar cambios' : 'Cancelar' }}</button>
            <button v-if="libro.esquema" type="button" class="px-4 py-2 rounded-md text-xs font-semibold text-semantico-falla hover:bg-semantico-falla/10 sm:ml-auto" @click="dejarDeUsar">Dejar de usar notas en esta clase</button>
            <span v-if="errorEsquema" role="alert" class="text-xs text-semantico-falla">{{ errorEsquema }}</span>
          </div>
        </form>
      </section>

      <template v-if="libro.esquema">
        <!-- ─── Resumen ─── -->
        <section v-if="libro.esquema.calculo !== 'ninguno' || libro.filas.some((f) => f.final !== null)" aria-label="Resumen de la clase" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
            <p class="text-[11px] text-base-texto-secundario">Promedio de la clase</p>
            <p class="text-xl font-bold text-base-texto-primario">{{ libro.resumen.promedio === null ? '—' : notaComa(libro.resumen.promedio) }}</p>
          </div>
          <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
            <p class="text-[11px] text-base-texto-secundario">Aprueban</p>
            <p class="text-xl font-bold text-semantico-pasa">{{ libro.resumen.aprueban }}</p>
          </div>
          <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
            <p class="text-[11px] text-base-texto-secundario">Por debajo de {{ notaComa(libro.esquema.notaAprobatoria) }}</p>
            <p class="text-xl font-bold text-semantico-falla">{{ libro.resumen.reprueban }}</p>
          </div>
          <div class="bg-base-blanco rounded-xl border border-base-borde-sutil p-4">
            <p class="text-[11px] text-base-texto-secundario">Sin nota todavía</p>
            <p class="text-xl font-bold text-base-texto-primario">{{ libro.resumen.sinNota }}</p>
          </div>
        </section>

        <!-- ─── Tabla ─── -->
        <p v-if="libro.filas.length === 0" class="text-xs text-base-texto-secundario bg-base-blanco rounded-xl border border-base-borde-sutil p-6 text-center">
          Todavía no hay estudiantes en la clase.
        </p>
        <section v-else class="bg-base-blanco rounded-xl border border-base-borde-fuerte shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <caption class="sr-only">Notas por estudiante: cada nota, la de cada módulo, la que propone STIRE y la final</caption>
              <thead class="bg-base-bg-secundario text-base-texto-secundario">
                <tr>
                  <th scope="col" class="text-left font-semibold px-3 py-2 sticky left-0 bg-base-bg-secundario min-w-[10rem]">Estudiante</th>
                  <th v-for="col in columnas" :key="col.clave" scope="col" class="text-left font-semibold px-3 py-2 min-w-[8rem]" :class="col.tipo === 'modulo' ? 'bg-acento-ambar/10 text-base-texto-primario' : ''">
                    {{ col.titulo }} <span v-if="col.porcentaje" class="font-normal">({{ col.porcentaje }})</span>
                  </th>
                  <th v-if="libro.esquema.calculo !== 'ninguno'" scope="col" class="text-left font-semibold px-3 py-2 min-w-[7rem]">Propuesta</th>
                  <th scope="col" class="text-left font-semibold px-3 py-2 min-w-[9rem]">Final</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="f in libro.filas" :key="f.studentId">
                  <tr class="border-t border-base-borde-sutil align-top">
                    <th scope="row" class="text-left font-semibold px-3 py-2 sticky left-0 bg-base-blanco">
                      <NuxtLink :to="`/docente/estudiante/${f.studentId}?clase=${classId}`" class="hover:underline">{{ f.nombre }}</NuxtLink>
                    </th>
                    <td v-for="col in columnas" :key="col.clave" class="px-3 py-2" :class="col.tipo === 'modulo' ? 'bg-acento-ambar/5' : ''">
                      <template v-if="col.tipo === 'modulo'">
                        <span class="font-bold" :class="claseNota(notaModulo(f, col.moduloId))">{{ notaModulo(f, col.moduloId) === null ? '—' : notaComa(notaModulo(f, col.moduloId)) }}</span>
                        <span v-if="f.modulos[String(col.moduloId)]?.faltan.length" class="block text-[10px] text-base-texto-secundario">Falta: {{ f.modulos[String(col.moduloId)]?.faltan.join(', ') }}</span>
                      </template>
                      <template v-else-if="col.componente.tipo === 'manual'">
                        <input
                          :value="notaComa(f.componentes[col.clave]?.nota)"
                          inputmode="decimal"
                          :aria-label="`${col.titulo} de ${f.nombre}`"
                          :aria-invalid="errorCelda[celdaId(f.studentId, col.clave)] ? true : undefined"
                          placeholder="—"
                          class="w-16 px-2 py-1.5 rounded-md border bg-base-blanco"
                          :class="errorCelda[celdaId(f.studentId, col.clave)] ? 'border-semantico-falla' : 'border-base-borde-fuerte'"
                          @change="(ev) => guardarManual(f, col.clave, (ev.target as HTMLInputElement).value)"
                        />
                        <span v-if="guardandoCelda === celdaId(f.studentId, col.clave)" class="block text-[10px] text-base-texto-secundario">Guardando…</span>
                        <span v-else-if="errorCelda[celdaId(f.studentId, col.clave)]" role="alert" class="block text-[10px] text-semantico-falla">{{ errorCelda[celdaId(f.studentId, col.clave)] }}</span>
                      </template>
                      <template v-else>
                        <span class="font-bold" :class="claseNota(f.componentes[col.clave]?.nota)">{{ f.componentes[col.clave]?.nota == null ? '—' : notaComa(f.componentes[col.clave]?.nota) }}</span>
                        <span class="block text-[10px] text-base-texto-secundario">{{ f.componentes[col.clave]?.detalle }}</span>
                      </template>
                    </td>
                    <td v-if="libro.esquema.calculo !== 'ninguno'" class="px-3 py-2">
                      <span class="font-bold" :class="claseNota(f.propuesta)">{{ f.propuesta === null ? '—' : notaComa(f.propuesta) }}</span>
                      <span v-if="f.faltan.length" class="block text-[10px] text-base-texto-secundario">Falta: {{ f.faltan.join(', ') }}</span>
                    </td>
                    <td class="px-3 py-2">
                      <span class="font-bold text-sm" :class="claseNota(f.final)">{{ f.final === null ? '—' : notaComa(f.final) }}</span>
                      <span v-if="f.ajuste" class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-semantico-info/10 text-semantico-info">{{ libro.esquema.calculo === 'ninguno' ? 'Puesta por ti' : 'Ajustada' }}</span>
                      <button type="button" class="block mt-1 text-[11px] font-semibold text-acento-ambar-fuerte hover:underline" @click="abrirAjuste(f)">
                        {{ abierto === f.studentId ? 'Cerrar' : libro.esquema.calculo === 'ninguno' ? 'Poner final · historial' : 'Ajustar · historial' }}
                      </button>
                    </td>
                  </tr>
                  <!-- Ajuste (o nota final a mano) con motivo, e historial de lo que cambió -->
                  <tr v-if="abierto === f.studentId" class="bg-base-bg-secundario/60">
                    <td :colspan="columnas.length + (libro.esquema.calculo !== 'ninguno' ? 3 : 2)" class="px-3 py-4">
                      <form class="flex flex-col lg:flex-row gap-3 lg:items-end max-w-3xl" @submit.prevent="guardarAjuste(f)">
                        <label class="text-[11px] font-semibold text-base-texto-primario">
                          Nota final
                          <input v-model="ajuste.nota" inputmode="decimal" required class="block mt-1 w-20 px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco font-normal" />
                        </label>
                        <label class="text-[11px] font-semibold text-base-texto-primario flex-1">
                          Motivo (queda en el historial)
                          <input v-model="ajuste.motivo" maxlength="500" required placeholder="Ej.: presentó el supletorio del parcial" class="block mt-1 w-full px-2 py-1.5 rounded-md border border-base-borde-fuerte bg-base-blanco font-normal" />
                        </label>
                        <div class="flex gap-2">
                          <button type="submit" :disabled="guardandoAjuste" class="px-3 py-2 rounded-md bg-acento-ambar-fuerte text-base-blanco font-bold text-xs disabled:opacity-40">Guardar</button>
                          <button v-if="f.ajuste" type="button" :disabled="guardandoAjuste" class="px-3 py-2 rounded-md borde-afordancia text-xs font-semibold" @click="quitarAjuste(f)">Quitar</button>
                        </div>
                      </form>
                      <p v-if="errorAjuste" role="alert" class="text-xs text-semantico-falla mt-2">{{ errorAjuste }}</p>
                      <div class="mt-4">
                        <h3 class="text-[11px] font-bold uppercase tracking-wider text-base-texto-secundario">Historial</h3>
                        <p v-if="historial.length === 0" class="text-xs text-base-texto-secundario mt-1">Sin cambios todavía.</p>
                        <ol v-else class="mt-1 space-y-1 text-xs">
                          <li v-for="h in historial" :key="h.id">
                            <span class="text-base-texto-secundario">{{ fechaCorta(h.createdAt) }} ·</span>
                            {{ h.nombre }}: {{ h.antes === null ? '—' : notaComa(h.antes) }} → {{ h.despues === null ? '—' : notaComa(h.despues) }}
                            <span v-if="h.motivo" class="text-base-texto-secundario">· «{{ h.motivo }}»</span>
                          </li>
                        </ol>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ChevronDown, Download, Loader2, Plus, Trash2 } from 'lucide-vue-next'
import { useApi } from '~/composables/useApi'
import { fechaCorta } from '~/utils/entregas'
import {
  MODO_CALCULO, TIPO_COMPONENTE, columnasDelLibro, csvParaMoodle, formasDeEmpezar, leerNota, nombreArchivoNotas, notaComa,
  sincronizarGrupos, sumaPesos,
  type Componente, type Esquema, type FilaLibro, type Libro,
} from '~/utils/calificaciones'

definePageMeta({ layout: 'teacher' })

interface EventoNota { id: number; nombre: string; antes: number | null; despues: number | null; motivo: string | null; createdAt: string }

const route = useRoute()
const api = useApi()
const { messageOf } = useApiErrorMessage()
const classId = Number(route.params.classId)

const clase = ref<{ id: number; name: string; code?: string } | null>(null)
const libro = ref<Libro | null>(null)
const borrador = ref<Esquema | null>(null)
const aprobatoriaTexto = ref('3,0')
const cargando = ref(true)
const error = ref<string | null>(null)
const editando = ref(false)
const guardandoEsquema = ref(false)
const errorEsquema = ref<string | null>(null)
const guardandoCelda = ref<string | null>(null)
const errorCelda = reactive<Record<string, string>>({})
const abierto = ref<number | null>(null)
const ajuste = reactive({ nota: '', motivo: '' })
const guardandoAjuste = ref(false)
const errorAjuste = ref<string | null>(null)
const historial = ref<EventoNota[]>([])

const celdaId = (studentId: number, clave: string) => `${studentId}-${clave}`
const columnas = computed(() => (libro.value?.esquema ? columnasDelLibro(libro.value.esquema, libro.value.modulos) : []))
const notaModulo = (f: FilaLibro, moduloId: number) => f.modulos[String(moduloId)]?.nota ?? null
const tituloModulo = (id: number) => libro.value?.modulos.find((m) => m.id === id)?.titulo ?? 'Módulo'
const titulosLeccion = computed(() => new Map((libro.value?.lecciones ?? []).map((l) => [l.id, l.titulo])))
const tituloLeccion = (id: number) => titulosLeccion.value.get(id) ?? `Lección ${id}`

function claseNota(n: number | null | undefined): string {
  const esquema = libro.value?.esquema
  if (n === null || n === undefined || !esquema) return 'text-base-texto-secundario'
  return n >= esquema.notaAprobatoria ? 'text-base-texto-primario' : 'text-semantico-falla'
}

const resumenEsquema = computed(() => {
  const e = libro.value?.esquema
  if (!e) return ''
  const n = e.componentes.length
  const modulos = e.grupos.length ? ` en ${e.grupos.length} ${e.grupos.length === 1 ? 'módulo' : 'módulos'}` : ''
  return `${n} ${n === 1 ? 'nota' : 'notas'}${modulos} · final: ${MODO_CALCULO[e.calculo].toLowerCase()} · aprueba con ${notaComa(e.notaAprobatoria)}`
})

// ─── Porcentajes del borrador ───
/** Una nota lleva porcentaje si su nivel (el módulo o la final) los usa. */
function usaPorcentajes(c: Componente): boolean {
  const b = borrador.value
  if (!b) return false
  if (c.moduloId === null) return b.calculo === 'porcentajes'
  return b.grupos.find((g) => g.moduloId === c.moduloId)?.calculo === 'porcentajes'
}
const sumaModulo = (moduloId: number) => sumaPesos((borrador.value?.componentes ?? []).filter((c) => c.moduloId === moduloId))
const sumaFinal = computed(() => {
  const b = borrador.value
  if (!b) return 0
  return sumaPesos(b.componentes.filter((c) => c.moduloId === null)) + sumaPesos(b.grupos)
})
const itemsDeLaFinal = computed(() => {
  const b = borrador.value
  if (!b) return ''
  const partes = [...b.grupos.map((g) => `la nota de ${tituloModulo(g.moduloId)}`), ...b.componentes.filter((c) => c.moduloId === null).map((c) => `«${c.nombre || 'sin nombre'}»`)]
  return partes.length ? partes.join(', ') : 'nada todavía'
})

// Cada módulo que tenga notas tiene su nota de módulo; se crea o se quita sola al cambiar de qué es cada nota.
watch(() => borrador.value?.componentes.map((c) => c.moduloId).join(','), () => {
  if (borrador.value && libro.value) borrador.value.grupos = sincronizarGrupos(borrador.value, libro.value.modulos)
})

function copiarEsquema(e: Esquema): Esquema {
  return JSON.parse(JSON.stringify(e)) as Esquema
}

function aplicar(nuevo: Libro) {
  libro.value = nuevo
  borrador.value = nuevo.esquema ? copiarEsquema(nuevo.esquema) : null
  aprobatoriaTexto.value = notaComa(nuevo.esquema?.notaAprobatoria ?? 3)
}

/** Una forma de empezar: solo llena el formulario; nada se guarda hasta «Guardar». */
function empezarCon(esquema: Esquema) {
  borrador.value = copiarEsquema(esquema)
  aprobatoriaTexto.value = notaComa(esquema.notaAprobatoria)
  editando.value = true
}

async function cargar() {
  cargando.value = true
  error.value = null
  try {
    const [c, l] = await Promise.all([
      api.get<{ id: number; name: string; code?: string }>(`/class/${classId}`),
      api.get<Libro>(`/calificaciones/clase/${classId}`),
    ])
    clase.value = c
    aplicar(l)
    editando.value = false
  } catch (err) {
    error.value = messageOf(err, 'No se pudieron cargar las notas.')
  } finally {
    cargando.value = false
  }
}

// ─── Qué cuenta en cada nota ───
const lista = (c: Componente) => (c.tipo === 'dominio' ? c.lecciones : c.entregas)
const textoTodas = (c: Componente) => (c.tipo === 'entregas' ? 'Todas las que llevan nota' : c.moduloId !== null ? 'Todas las del módulo' : 'Todas las de módulos publicados')
const modulosParaElegir = (c: Componente) => (libro.value?.modulos ?? []).filter((m) => c.moduloId === null || m.id === c.moduloId)

function alCambiarTipo(c: Componente) {
  c.lecciones = null
  c.entregas = null
}
function alCambiarModulo(c: Componente) {
  c.lecciones = null
}
function elegirTodas(c: Componente) {
  if (c.tipo === 'dominio') c.lecciones = null
  else c.entregas = null
}
function elegirAlgunas(c: Componente) {
  if (c.tipo === 'dominio') c.lecciones = []
  else c.entregas = []
}
function alternar(c: Componente, id: number) {
  const actual = lista(c) ?? []
  const nueva = actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]
  if (c.tipo === 'dominio') c.lecciones = nueva
  else c.entregas = nueva
}
function alternarModulo(c: Componente, ids: number[]) {
  const actual = lista(c) ?? []
  const todas = ids.every((id) => actual.includes(id))
  const nueva = todas ? actual.filter((id) => !ids.includes(id)) : [...new Set([...actual, ...ids])]
  if (c.tipo === 'dominio') c.lecciones = nueva
}
function agregarComponente() {
  borrador.value?.componentes.push({ clave: '', nombre: '', tipo: 'manual', peso: 0, moduloId: null, lecciones: null, entregas: null })
}
function descartar() {
  if (libro.value) aplicar(libro.value)
  editando.value = false
  errorEsquema.value = null
}

async function dejarDeUsar() {
  if (!confirm('¿Dejar de usar notas en esta clase? Las notas que pusiste y su historial se conservan por si vuelves a armarlas.')) return
  try {
    aplicar(await api.del<Libro>(`/calificaciones/clase/${classId}/esquema`))
    editando.value = false
  } catch (err) {
    errorEsquema.value = messageOf(err, 'No se pudo quitar.')
  }
}

async function guardarEsquema() {
  if (!borrador.value) return
  const aprobatoria = leerNota(aprobatoriaTexto.value)
  if (aprobatoria === undefined || aprobatoria === null) {
    errorEsquema.value = 'La nota aprobatoria va de 0,0 a 5,0.'
    return
  }
  guardandoEsquema.value = true
  errorEsquema.value = null
  try {
    aplicar(await api.put<Libro>(`/calificaciones/clase/${classId}/esquema`, { ...borrador.value, notaAprobatoria: aprobatoria }))
    editando.value = false
  } catch (err) {
    errorEsquema.value = messageOf(err, 'No se pudo guardar.')
  } finally {
    guardandoEsquema.value = false
  }
}

// ─── Notas a mano ───
// Tras poner una nota se recalcula la tabla; lo que el docente esté editando arriba no se toca.
async function recargarLibro() {
  libro.value = await api.get<Libro>(`/calificaciones/clase/${classId}`)
}

async function guardarManual(f: FilaLibro, clave: string, texto: string) {
  const id = celdaId(f.studentId, clave)
  const valor = leerNota(texto)
  if (valor === undefined) {
    errorCelda[id] = 'De 0,0 a 5,0'
    return
  }
  delete errorCelda[id]
  guardandoCelda.value = id
  try {
    await api.put(`/calificaciones/clase/${classId}/estudiante/${f.studentId}/nota`, { clave, nota: valor })
    await recargarLibro()
  } catch (err) {
    errorCelda[id] = messageOf(err, 'No se guardó')
  } finally {
    guardandoCelda.value = null
  }
}

async function cargarHistorial(studentId: number) {
  try {
    historial.value = await api.get<EventoNota[]>(`/calificaciones/clase/${classId}/estudiante/${studentId}/historial`)
  } catch {
    historial.value = []
  }
}

async function abrirAjuste(f: FilaLibro) {
  if (abierto.value === f.studentId) {
    abierto.value = null
    return
  }
  abierto.value = f.studentId
  ajuste.nota = notaComa(f.final)
  ajuste.motivo = f.ajuste?.motivo ?? ''
  errorAjuste.value = null
  historial.value = []
  await cargarHistorial(f.studentId)
}

async function enviarAjuste(f: FilaLibro, cuerpo: { nota: number | null; motivo?: string }) {
  guardandoAjuste.value = true
  errorAjuste.value = null
  try {
    await api.put(`/calificaciones/clase/${classId}/estudiante/${f.studentId}/nota`, { clave: 'final', ...cuerpo })
    await Promise.all([recargarLibro(), cargarHistorial(f.studentId)])
  } catch (err) {
    errorAjuste.value = messageOf(err, 'No se pudo guardar.')
  } finally {
    guardandoAjuste.value = false
  }
}

async function guardarAjuste(f: FilaLibro) {
  const valor = leerNota(ajuste.nota)
  if (valor === undefined || valor === null) {
    errorAjuste.value = 'La nota va de 0,0 a 5,0.'
    return
  }
  await enviarAjuste(f, { nota: valor, motivo: ajuste.motivo })
}

async function quitarAjuste(f: FilaLibro) {
  await enviarAjuste(f, { nota: null })
  ajuste.nota = notaComa(libro.value?.filas.find((x) => x.studentId === f.studentId)?.final)
  ajuste.motivo = ''
}

// ─── Exportar ───
function descargarCsv() {
  if (!libro.value) return
  const url = URL.createObjectURL(new Blob([csvParaMoodle(libro.value)], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivoNotas(clase.value?.name ?? 'clase', new Date())
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

onMounted(cargar)
</script>
