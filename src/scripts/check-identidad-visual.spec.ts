// eslint-disable-next-line @typescript-eslint/no-require-imports
const { classify, compareVue } = require('../../scripts/check-identidad-visual');

const vue = (script: string, template: string) => `<template>\n${template}\n</template>\n<script setup lang="ts">\n${script}\n</script>\n`;

describe('check-identidad-visual', () => {
  describe('classify', () => {
    it.each([
      'frontend-nuxt/tailwind.config.ts',
      'frontend-nuxt/assets/css/main.css',
      'frontend-nuxt/public/logo.svg',
      'frontend-nuxt/components/tutor/TutorChatDrawer.vue',
      'frontend-nuxt/layouts/student.vue',
      'frontend-nuxt/pages/estudiante/evaluacion/[activityId].vue',
      'docs/identidad-visual/PROPUESTA_IDENTIDAD.md',
    ])('%s es territorio libre', (ruta) => {
      expect(classify(ruta)).toBe('libre');
    });

    it.each([
      'src/tutor/tutor.service.ts',
      'test/app.e2e-spec.ts',
      'package.json',
      'package-lock.json',
      'frontend-nuxt/package.json',
      'frontend-nuxt/stores/tutor.ts',
      'frontend-nuxt/composables/useApiErrorMessage.ts',
      'frontend-nuxt/middleware/auth.ts',
      'frontend-nuxt/types/index.ts',
      'docs/PLAN_MAESTRO.md',
      '.env.example',
    ])('%s queda fuera', (ruta) => {
      expect(classify(ruta)).toBe('fuera');
    });

    it('nuxt.config.ts se puede tocar pero con cuidado (mezcla marca y configuración)', () => {
      expect(classify('frontend-nuxt/nuxt.config.ts')).toBe('cuidado');
    });
  });

  describe('compareVue', () => {
    const script = 'const x = ref(1)\nfunction save() { x.value++ }';
    const template = '<button id="guardar" @click="save" v-if="x" class="bg-acento-ambar">Guardar</button>';

    it('cambiar solo clases, textos y estructura visual no da avisos', () => {
      const after = vue(script, '<div class="p-lg"><button id="guardar" @click="save" v-if="x" class="rounded-lg bg-red-600">Guardar</button></div>');
      expect(compareVue(vue(script, template), after)).toEqual([]);
    });

    it('reformatear el script (espacios, saltos de línea) no cuenta como cambio', () => {
      const after = vue('const x   = ref(1)\n\n\nfunction save() {\n  x.value++\n}', template);
      expect(compareVue(vue(script, template), after)).toEqual([]);
    });

    it('cambiar la lógica del script avisa', () => {
      const avisos = compareVue(vue(script, template), vue('const x = ref(2)\nfunction save() { x.value-- }', template));
      expect(avisos.join(' ')).toMatch(/bloque <script>/);
    });

    it('quitar un v-if o un @click avisa con el nombre de la directiva', () => {
      const avisos = compareVue(vue(script, template), vue(script, '<button id="guardar" class="x">Guardar</button>'));
      const texto = avisos.join(' ');
      expect(texto).toContain('v-if');
      expect(texto).toContain('@click');
    });

    it('quitar un id o un aria-label que usan las pruebas y los lectores de pantalla avisa', () => {
      const antes = vue(script, '<input id="email" aria-label="Correo" @input="save" />');
      const avisos = compareVue(antes, vue(script, '<input class="campo" @input="save" />'));
      const texto = avisos.join(' ');
      expect(texto).toContain('id="email"');
      expect(texto).toContain('aria-label="Correo"');
    });

    it('mover una directiva a otro elemento no da aviso (se cuenta por nombre, no por posición)', () => {
      const antes = vue(script, '<div><button @click="save">A</button></div>');
      const despues = vue(script, '<section><footer><button @click="save">A</button></footer></section>');
      expect(compareVue(antes, despues)).toEqual([]);
    });
  });
});
