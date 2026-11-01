import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// 01/11, probando «¿Dónde vive?» como Santiago: la ventana decía «0 de 1 ejercicio» con 7 de 20 puntos, y el chat mostraba
// respuestas sobre otro ejercicio sin distinguirlas de lo que se hablaba ahí.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

function cargarTema() {
  const js = ts.transpileModule(leer('utils', 'temaDelChat.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', js)(mod, mod.exports);
  return mod.exports as {
    textoDelTema: (titulo: string) => string;
    faltaMarcarTema: (mensajes: Array<{ text: string; separador?: boolean }>, titulo: string) => boolean;
  };
}

describe('La ventana del resultado de un ejercicio de programar', () => {
  const ventana = leer('components', 'exercise', 'ResultadoEntrega.vue');

  it('muestra lo que dijo el juez en el globo del Tutor', () => {
    expect(ventana).toContain('<p v-if="r.feedback" class="mt-1.5">{{ r.feedback }}</p>');
  });

  it('no cuenta «0 de 1 ejercicio» si el juez ya dijo qué casos pasaron', () => {
    expect(ventana).toContain('<p v-if="contarEjercicios">');
    expect(ventana).toContain("(r.value.totalCount ?? 0) > 0 && !r.value.feedback");
  });
});

describe('El chat marca dónde empieza cada ejercicio', () => {
  const { textoDelTema, faltaMarcarTema } = cargarTema();
  const viejo = { text: 'Tu código ya quedó perfecto.' };

  it('con mensajes anteriores se marca; con el chat vacío no hay nada que separar', () => {
    expect(faltaMarcarTema([viejo], '¿Dónde vive?')).toBe(true);
    expect(faltaMarcarTema([], '¿Dónde vive?')).toBe(false);
  });

  it('no se repite al volver a abrir el panel en el mismo ejercicio, aunque ya se haya conversado', () => {
    const marca = { text: textoDelTema('¿Dónde vive?'), separador: true };
    expect(faltaMarcarTema([viejo, marca, { text: 'una pregunta' }], '¿Dónde vive?')).toBe(false);
  });

  it('se marca otra vez al pasar a otro ejercicio', () => {
    const marca = { text: textoDelTema('¿Dónde vive?'), separador: true };
    expect(faltaMarcarTema([viejo, marca], 'Saludo personalizado')).toBe(true);
  });

  it('la pantalla la pinta como una línea y no como un mensaje del Tutor', () => {
    const chat = leer('components', 'tutor', 'TutorChatDrawer.vue');
    expect(chat).toContain('<p v-if="msg.separador"');
    expect(chat.indexOf('<p v-if="msg.separador"')).toBeLessThan(chat.indexOf('TutorMascota v-if="msg.sender'));
  });

  it('la marca no viaja al servidor: el chat envía solo el texto del estudiante', () => {
    const store = leer('stores', 'tutor.ts');
    expect(store).toContain("separador: true");
    expect(store).not.toMatch(/history:\s*messages/);
  });
});
