import { readdirSync, readFileSync, statSync } from 'fs';
import * as path from 'path';

// Revisión de textos e íconos (pedido del dueño, 05/10: «esas palabras en botones… a veces son muy genéricas»).
// Guardas para que no vuelvan los errores encontrados: clases de color que no existen (el botón «Quitar de la clase»
// salía sin su rojo y las ventanas del admin sin fondo oscuro), símbolos usados como íconos y botones de un solo verbo.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function vues(dir: string): string[] {
  return readdirSync(path.join(raiz, dir)).flatMap((f) => {
    const rel = path.join(dir, f);
    return statSync(path.join(raiz, rel)).isDirectory() ? vues(rel) : rel.endsWith('.vue') ? [rel] : [];
  });
}
const plantillas = ['pages', 'components', 'layouts'].flatMap(vues).map((f) => ({
  f,
  t: leer(f).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, ''),
}));

describe('colores: solo tokens que existen en tailwind.config.ts', () => {
  const config = leer('tailwind.config.ts');
  const grupo = (nombre: string) => {
    const i = config.indexOf(`${nombre}: {`) >= 0 ? config.indexOf(`${nombre}: {`) : config.indexOf(`'${nombre}': {`);
    const bloque = config.slice(i, config.indexOf('}', i));
    return new Set([...bloque.matchAll(/^\s*'?([a-z-]+)'?:/gm)].map((m) => m[1]).filter((k) => k !== nombre));
  };
  const grupos: Record<string, Set<string>> = {
    base: grupo('base'), acento: grupo('acento'), semantico: grupo('semantico'),
    'estado-unidad': grupo('estado-unidad'), 'urgencia-repaso': grupo('urgencia-repaso'),
  };

  it('ninguna pantalla usa un color semántico inventado (semantico-error, semantico-exito, base-negro…)', () => {
    const malos: string[] = [];
    for (const { f, t } of plantillas) {
      for (const m of t.matchAll(/\b(?:text|bg|border|ring|from|to|via|divide|outline|fill|stroke)-(base|acento|semantico|estado-unidad|urgencia-repaso)-([a-z-]+?)(?=[\s"'/:\]`]|$)/g)) {
        if (!grupos[m[1]].has(m[2])) malos.push(`${f}: ${m[0]}`);
      }
    }
    expect(malos).toEqual([]);
  });
});

describe('íconos: Lucide, no símbolos de texto', () => {
  // Las formas decorativas de una leyenda (■ ▲ ⬤ en Repasos, para no depender solo del color) van con aria-hidden.
  it('sin ✕ ▲ ▼ ▶ ✓ ✖ como ícono en botones y avisos', () => {
    const malos = plantillas.flatMap(({ f, t }) =>
      t.split('\n').flatMap((l, i) => (/^\s*[✕▲▼]\s*$|>[✕▲▼▶]<|✓ |<span>✖/.test(l) && !l.includes('aria-hidden="true"') ? [`${f}:${i + 1}`] : [])),
    );
    expect(malos).toEqual([]);
  });

  it('subir y bajar tienen nombre accesible', () => {
    for (const f of ['components/docente/exercise-builders/OrderingExerciseBuilder.vue', 'components/docente/exercise-builders/HtmlCssExerciseBuilder.vue']) {
      expect(leer(f)).toMatch(/aria-label="Subir (paso|regla)"/);
    }
  });
});

describe('botones que dicen qué hacen', () => {
  it('sin botones de un solo verbo genérico donde no se entiende sobre qué actúan', () => {
    const genericos = plantillas.flatMap(({ f, t }) =>
      [...t.matchAll(/<(button|NuxtLink)\b[^>]*>([\s\S]*?)<\/\1>/g)]
        .map((m) => m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
        .filter((x) => /^(Abrir|Crear|Atrás|Remover|Mensaje|Reto|Terminar|Ver detalle|Usar esta|Agregar)$/.test(x))
        .map((x) => `${f}: «${x}»`),
    );
    expect(genericos).toEqual([]);
  });
});

describe('números como se escriben en español', () => {
  it('porcentajes con espacio antes del signo (97 %), no «97%»', () => {
    const malos = plantillas.flatMap(({ f, t }) => (/\}\}%/.test(t) ? [f] : []));
    expect(malos).toEqual([]);
  });

  it('la comparación semanal dice con qué se compara', () => {
    expect(readFileSync(path.join(raiz, 'pages', 'docente', 'clase', '[classId]', 'index.vue'), 'utf8')).not.toContain('· la anterior {{');
  });
});

describe('el docente en el celular', () => {
  it('Rendimiento: tarjetas por estudiante en el celular y la tabla desde 768 px; diagnóstico sin etiquetar («Necesita apoyo»)', () => {
    const r = readFileSync(path.join(raiz, 'pages', 'docente', 'rendimiento.vue'), 'utf8');
    expect(r).toContain('<ul class="md:hidden divide-y divide-base-borde-sutil" aria-label="Estudiantes">');
    expect(r).toContain('<div class="hidden md:block overflow-x-auto">');
    expect(r).toContain("'Necesita apoyo'");
  });
  it('las pestañas de la clase muestran que hay más y dejan la activa a la vista', () => {
    const p = readFileSync(path.join(raiz, 'components', 'docente', 'PestanasClase.vue'), 'utf8');
    expect(p).toContain('mask-image: linear-gradient(to right, #000 85%, transparent)');
    expect(p).toContain("scrollIntoView({ inline: 'center', block: 'nearest' })");
  });
});

describe('mapa de calor: reconocer antes que recordar', () => {
  it('cada columna dice el nombre de la lección (antes «L1… L17»)', () => {
    const m = readFileSync(path.join(raiz, 'components', 'docente', 'MapaDeCalor.vue'), 'utf8');
    expect(m).toContain('<span class="encabezado-vertical">{{ i + 1 }}. {{ u.title }}</span>');
    expect(m).not.toContain('L{{ i + 1 }}');
    expect(m).toContain('writing-mode: vertical-rl');
  });
});
