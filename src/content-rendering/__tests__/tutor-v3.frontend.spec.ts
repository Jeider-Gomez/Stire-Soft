// El Tutor en la v3 (13/11, Jeider: «no quiero que lo que hicimos con el Tutor se pierda»). La v3 cambia su aspecto
// (cuadro «E-Tutor»), no lo que se ajustó durante semanas: el prompt, el nivel de ayuda y dónde está el estudiante.
import { readFileSync } from 'fs';
import * as path from 'path';

const raiz = path.join(__dirname, '..', '..', '..');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');

describe('el Tutor conserva lo ajustado', () => {
  const panel = leer('frontend-nuxt', 'components', 'tutor', 'TutorChatDrawer.vue');

  it('el prompt sigue en la v17 (concepto primero, no dicta la solución, orienta al entregar)', () => {
    // Si se cambia el prompt a propósito, se sube esta versión y se anota en docs/prompts/README.md.
    expect(leer('src', 'tutor', 'tutor-context.service.ts')).toContain("export const VERSION_PROMPT_TUTOR = 'v17 · 2026-11-03';");
  });

  it('muestra el nivel de ayuda, con texto y no solo con los puntos', () => {
    expect(panel).toContain('Nivel de ayuda: <strong class="font-semibold">{{ guidanceLevelLabel }}</strong>');
    expect(panel).toContain(':aria-label="`Nivel de ayuda actual: ${tutorStore.guidanceLevel} de 3 — ${guidanceLevelLabel}`"');
    expect(panel).toContain('Ayuda ampliada: este ejercicio es parte de tu refuerzo');
  });

  it('dice dónde está el estudiante, como el cuadro: «Estás en: lección · %»', () => {
    expect(panel).toContain('etiquetaDeContexto(route.path, workspaceStore.currentExercise, studentStore.modules, studentStore.activeUnit)');
    expect(leer('frontend-nuxt', 'utils', 'planLateral.ts')).toContain('`Estás en: ${u.title} · ${u.masteryPercentage} %`');
  });

  it('se abre desde cualquier pantalla con Ctrl+. y la cabecera es blanca, nunca sobre morado', () => {
    expect(panel).toContain("if ((event.ctrlKey || event.metaKey) && event.key === '.') {");
    expect(panel).toContain('<h3 class="font-bold text-base font-poppins tracking-tight">Tu Tutor</h3>');
    expect(panel).not.toContain('to-stire-purple text-white');
  });
});
