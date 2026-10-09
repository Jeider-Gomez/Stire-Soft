import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 09/10, Jeider: «indicarle al docente qué debe tener cada lección para abarcar los diferentes estilos de aprendizaje».
// Sin estilos (no tienen evidencia): varias formas de entrar a la misma idea y práctica variada. Opcional, no bloquea.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargarUtil(nombre: string): Record<string, unknown> {
  const codigo = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const m = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', codigo)(m, m.exports, (r: string) => cargarUtil(r.replace(/^\.\//, '')));
  return m.exports;
}
type Punto = { ok: boolean; texto: string; porque: string };
const { revisarLeccion, CONSEJOS_LECCION } = cargarUtil('guiaLeccion') as {
  revisarLeccion: (e: { explicaciones: unknown[]; ejercicios: unknown[] }) => Punto[];
  CONSEJOS_LECCION: string[];
};
const ok = (puntos: Punto[]) => puntos.filter((p) => p.ok).map((p) => p.texto);

const completa = {
  explicaciones: [{
    type: 'markdown',
    body: `## La idea\n\n${'Antes de programar hay que entender el problema. '.repeat(6)}\n\n## Un ejemplo\n\n\`\`\`\nAlgoritmo Promedio\n  Leer a\nFinAlgoritmo\n\`\`\`\n\n## Error común\n\nConfundir la salida con una entrada.`,
  }],
  ejercicios: [
    ...[1, 2, 3].map(() => ({ questionType: 'mcq', difficulty: 'basico' })),
    { questionType: 'coding', difficulty: 'intermedio' },
  ],
};

describe('guía para armar una buena lección (docente)', () => {
  it('una lección como las de los cursos cumple todo: texto, ejemplo, pseudocódigo (se dibuja), error común y práctica variada', () => {
    const puntos = revisarLeccion(completa);
    expect(puntos.every((p) => p.ok)).toBe(true);
    expect(puntos.every((p) => p.porque.length > 20)).toBe(true);
  });

  it('una lección vacía: todo falta salvo la opción múltiple (no hay ninguna que completar)', () => {
    expect(ok(revisarLeccion({ explicaciones: [], ejercicios: [] }))).toEqual(['En opción múltiple, 3 parecidos por nivel']);
  });

  it('cuenta imágenes y videos (bloque, en el texto o insertados); no cuenta lo oculto', () => {
    const visual = (e: unknown) => revisarLeccion({ explicaciones: [e], ejercicios: [] })[2].ok;
    expect(visual({ type: 'image' })).toBe(true);
    expect(visual({ type: 'markdown', body: 'Mira ![flujo](https://x.org/a.png)' })).toBe(true);
    expect(visual({ type: 'markdown', body: 'Video', metadata: { insertados: { 'https://youtu.be/x': {} } } })).toBe(true);
    expect(visual({ type: 'markdown', body: 'Solo texto' })).toBe(false);
    expect(visual({ type: 'image', isVisible: false })).toBe(false);
  });

  it('opción múltiple con menos de 3 parecidos en un nivel: lo dice (con un intento, el parecido es el reintento)', () => {
    const puntos = revisarLeccion({ ...completa, ejercicios: [...completa.ejercicios, { questionType: 'mcq', difficulty: 'intermedio' }] });
    const mcq = puntos.find((p) => p.texto.startsWith('En opción múltiple'))!;
    expect(mcq.ok).toBe(false);
    expect(mcq.porque).toContain('un solo intento');
  });

  it('no habla de estilos de aprendizaje como algo que STIRE adivina; dice que es opcional', () => {
    expect(CONSEJOS_LECCION.join(' ')).toContain('no hay evidencia');
    expect(CONSEJOS_LECCION.join(' ')).toContain('opcional');
  });

  it('está en el panel de cada lección en «Contenidos», con lo que ya se carga', () => {
    expect(leer('components', 'docente', 'UnitExercisesPanel.vue')).toContain('<DocenteGuiaLeccion v-if="explicaciones" :explicaciones="explicaciones" :ejercicios="deLaUnidadEnBanco" />');
    expect(leer('components', 'docente', 'ArbolContenidos.vue')).toContain(':explicaciones="lessonsByUnit[unit.id]"');
  });
});
