<template>
  <!-- Una regla de calificación de un ejercicio HTML/CSS: identidad, pista, peso y el tipo de comprobación con sus campos.
       Antes vivía dentro del v-for de HtmlCssExerciseBuilder.vue (645 líneas, PAT-04). -->
  <div
    class="rounded-lg border border-base-borde-fuerte bg-base-bg-secundario/40 p-3 space-y-3"
  >
    <!-- Cabecera de la regla -->
    <div class="flex items-center gap-2">
      <span class="w-5 h-5 rounded bg-acento-ambar/20 text-acento-ambar-fuerte font-bold text-[10px] flex items-center justify-center shrink-0">
        {{ idx + 1 }}
      </span>
      <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label :for="`hc-rule-id-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">ID (a-z0-9_-) *</label>
          <input
            :id="`hc-rule-id-${idx}`"
            v-model="rule.id"
            type="text"
            maxlength="40"
            placeholder="ej: tiene_h1"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono"
          />
        </div>
        <div>
          <label :for="`hc-rule-label-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Etiqueta visible *</label>
          <input
            :id="`hc-rule-label-${idx}`"
            v-model="rule.label"
            type="text"
            maxlength="160"
            placeholder="Hay un h1 con el texto Hola"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
          />
        </div>
      </div>
      <!-- Controles de orden y borrado -->
      <div class="flex items-center gap-0.5 shrink-0">
        <button
          :disabled="idx === 0"
          type="button"
          @click="$emit('mover', -1)"
          class="p-1 text-base-texto-secundario hover:text-base-texto-primario disabled:opacity-30 rounded"
          title="Subir regla" aria-label="Subir regla"
        ><ChevronUp :size="14" aria-hidden="true" /></button>
        <button
          :disabled="idx === total - 1"
          type="button"
          @click="$emit('mover', 1)"
          class="p-1 text-base-texto-secundario hover:text-base-texto-primario disabled:opacity-30 rounded"
          title="Bajar regla" aria-label="Bajar regla"
        ><ChevronDown :size="14" aria-hidden="true" /></button>
        <button
          type="button"
          @click="$emit('quitar')"
          class="p-1 text-semantico-falla hover:bg-semantico-falla/10 rounded transition-colors"
          :aria-label="`Eliminar regla ${idx + 1}`"
        ><X :size="14" aria-hidden="true" /></button>
      </div>
    </div>

    <!-- Pista, visibilidad y peso -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
      <div class="sm:col-span-2">
        <label :for="`hc-rule-hint-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Pista (opcional)</label>
        <input
          :id="`hc-rule-hint-${idx}`"
          v-model="rule.hint"
          type="text"
          maxlength="240"
          placeholder="Usa la etiqueta header..."
          class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
        />
      </div>
      <div class="flex items-center gap-3">
        <label :for="`hc-rule-public-${idx}`" class="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            :id="`hc-rule-public-${idx}`"
            type="checkbox"
            v-model="rule.isPublic"
            class="accent-acento-ambar-fuerte h-3.5 w-3.5 rounded"
          />
          <span class="text-[10px] font-semibold text-base-texto-primario">Pública</span>
        </label>
        <div class="flex-1">
          <label :for="`hc-rule-weight-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Peso (1-100)</label>
          <input
            :id="`hc-rule-weight-${idx}`"
            v-model.number="rule.weight"
            type="number"
            min="1"
            max="100"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono"
          />
        </div>
      </div>
    </div>

    <!-- Tipo de comprobación -->
    <div class="space-y-2">
      <div>
        <label :for="`hc-rule-kind-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Tipo de comprobación *</label>
        <select
          :id="`hc-rule-kind-${idx}`"
          v-model="rule.kind"
          @change="limpiarSegunTipo(rule)"
          class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none"
        >
          <option value="element_exists">element_exists — existe el selector (min. 1)</option>
          <option value="element_count">element_count — número exacto o rango de elementos</option>
          <option value="text">text — texto de un elemento (contiene / igual)</option>
          <option value="attribute">attribute — atributo de un elemento</option>
          <option value="css_property">css_property — propiedad CSS calculada</option>
          <option value="a11y">a11y — comprobación de accesibilidad</option>
        </select>
      </div>

      <!-- element_exists -->
      <div v-if="rule.kind === 'element_exists'" class="grid grid-cols-2 gap-2">
        <div>
          <label :for="`hc-rule-sel-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
          <input :id="`hc-rule-sel-${idx}`" v-model="rule.selector" type="text" placeholder="h1, .tarjeta, img"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
        </div>
        <div>
          <label :for="`hc-rule-min-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Min. ocurrencias (por defecto 1)</label>
          <input :id="`hc-rule-min-${idx}`" v-model.number="rule.min" type="number" min="1" placeholder="1"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
        </div>
      </div>

      <!-- element_count -->
      <div v-else-if="rule.kind === 'element_count'" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div class="sm:col-span-2">
          <label :for="`hc-rule-sel2-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
          <input :id="`hc-rule-sel2-${idx}`" v-model="rule.selector" type="text" placeholder="li, .item"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
        </div>
        <div>
          <label :for="`hc-rule-equals-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Exacto</label>
          <input :id="`hc-rule-equals-${idx}`" v-model.number="rule.equals" type="number" min="0"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
        </div>
        <div class="grid grid-cols-2 gap-1">
          <div>
            <label :for="`hc-rule-cmin-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Min.</label>
            <input :id="`hc-rule-cmin-${idx}`" v-model.number="rule.min" type="number" min="0"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
          </div>
          <div>
            <label :for="`hc-rule-cmax-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Max.</label>
            <input :id="`hc-rule-cmax-${idx}`" v-model.number="rule.max" type="number" min="0"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
          </div>
        </div>
      </div>

      <!-- text -->
      <div v-else-if="rule.kind === 'text'" class="space-y-2">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label :for="`hc-rule-sel3-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
            <input :id="`hc-rule-sel3-${idx}`" v-model="rule.selector" type="text" placeholder="h1, p.intro"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
          </div>
          <div>
            <label :for="`hc-rule-mode-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Modo *</label>
            <select :id="`hc-rule-mode-${idx}`" v-model="rule.mode"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
              <option value="contains">contains</option>
              <option value="equals">equals</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label :for="`hc-rule-value-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Valor *</label>
            <input :id="`hc-rule-value-${idx}`" v-model="rule.value" type="text" placeholder="Hola Mundo"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>
          <div class="flex items-end pb-1.5">
            <label :for="`hc-rule-case-${idx}`" class="flex items-center gap-1.5 cursor-pointer select-none">
              <input :id="`hc-rule-case-${idx}`" type="checkbox" v-model="rule.caseSensitive"
                class="accent-acento-ambar-fuerte h-3.5 w-3.5 rounded" />
              <span class="text-[10px] font-semibold text-base-texto-primario">Distinguir mayusculas</span>
            </label>
          </div>
        </div>
      </div>

      <!-- attribute -->
      <div v-else-if="rule.kind === 'attribute'" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label :for="`hc-rule-sel4-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
          <input :id="`hc-rule-sel4-${idx}`" v-model="rule.selector" type="text" placeholder="img, a"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
        </div>
        <div>
          <label :for="`hc-rule-attr-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Atributo *</label>
          <input :id="`hc-rule-attr-${idx}`" v-model="rule.name" type="text" placeholder="alt, href, lang"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
        </div>
        <div>
          <label :for="`hc-rule-amode-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Modo *</label>
          <select :id="`hc-rule-amode-${idx}`" v-model="rule.attrMode"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
            <option value="exists">exists</option>
            <option value="equals">equals</option>
            <option value="contains">contains</option>
          </select>
        </div>
        <div>
          <label :for="`hc-rule-aval-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Valor (si no es exists)</label>
          <input :id="`hc-rule-aval-${idx}`" v-model="rule.attrValue" type="text" :disabled="rule.attrMode === 'exists'" placeholder="es, https://..."
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none disabled:opacity-40" />
        </div>
      </div>

      <!-- css_property -->
      <div v-else-if="rule.kind === 'css_property'" class="space-y-2">
        <p class="text-[10px] text-base-texto-secundario">
          Compara el valor calculado de la propiedad. Los colores (#F00, red, rgb(255,0,0)) se consideran iguales.
          Para otras propiedades lista todas las variantes aceptables separadas por coma (ej: 0 auto, 0px auto).
        </p>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label :for="`hc-rule-sel5-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Selector CSS *</label>
            <input :id="`hc-rule-sel5-${idx}`" v-model="rule.selector" type="text" placeholder=".tarjeta, header"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
          </div>
          <div>
            <label :for="`hc-rule-prop-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Propiedad CSS *</label>
            <input :id="`hc-rule-prop-${idx}`" v-model="rule.property" type="text" placeholder="display, color"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none font-mono" />
          </div>
          <div>
            <label :for="`hc-rule-oneof-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Valores aceptados (sep. coma) *</label>
            <input :id="`hc-rule-oneof-${idx}`" v-model="rule.oneOfRaw" type="text" placeholder="flex, inline-flex"
              class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none" />
          </div>
        </div>
      </div>

      <!-- a11y -->
      <div v-else-if="rule.kind === 'a11y'" class="space-y-2">
        <p class="text-[10px] text-base-texto-secundario leading-relaxed">
          <strong>Si el elemento no existe, la comprobación pasa</strong> (sin imágenes, img_alt se cumple).
          Para exigir imágenes combina con element_exists sobre img.
          html_lang y document_title exigen un documento completo (doctype html); con un fragmento fallan.
        </p>
        <div>
          <label :for="`hc-rule-a11y-${idx}`" class="block text-[10px] font-semibold text-base-texto-secundario mb-0.5">Comprobación *</label>
          <select :id="`hc-rule-a11y-${idx}`" v-model="rule.a11yCheck"
            class="w-full px-2 py-1.5 text-[11px] rounded bg-base-blanco border border-base-borde-fuerte focus:border-acento-ambar-fuerte outline-none">
            <option value="img_alt">img_alt — todas las img tienen alt</option>
            <option value="form_labels">form_labels — todos los campos tienen label</option>
            <option value="html_lang">html_lang — html tiene atributo lang (doc. completo)</option>
            <option value="document_title">document_title — title no esta vacio (doc. completo)</option>
            <option value="single_h1">single_h1 — exactamente un h1</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronUp, X } from 'lucide-vue-next'
import { limpiarSegunTipo, type RuleItem } from '~/utils/reglasHtmlCss'

// La regla es un objeto reactivo de la lista del constructor: el editor cambia sus campos en el lugar (como antes).
defineProps<{ rule: RuleItem; idx: number; total: number }>()
defineEmits<{ (e: 'mover', direccion: -1 | 1): void; (e: 'quitar'): void }>()
</script>
