import { readFileSync } from 'fs';
import * as path from 'path';

const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8').replace(/\r\n/g, '\n');

describe('Activar el Tutor sin cortar el aprendizaje (17/11, audio de Pedro)', () => {
  const panel = leer('components', 'tutor', 'TutorKeyPanel.vue');
  const campo = leer('components', 'tutor', 'CampoClave.vue');

  it('el campo, «Pegar» y «Guardar» quedan fijos abajo, a la vista aunque la guía sea larga', () => {
    expect(panel).toContain('<form class="sticky bottom-0');
    expect(panel).toContain('con-pegar @pegar="pegar"');
    expect(panel).toContain('Guardar y activar el Tutor');
    expect(panel).toContain('<GuiaClaveGoogle />');
  });

  it('al volver de Google a la pestaña, dice dónde pegarla y deja el campo listo', () => {
    expect(panel).toContain("document.addEventListener('visibilitychange', alVolver)");
    expect(panel).toContain('¿Ya la copiaste? Pégala aquí.');
  });

  it('«Pegar» lee el portapapeles y, si el navegador no deja, explica cómo pegar a mano', () => {
    expect(panel).toContain('navigator.clipboard.readText()');
    expect(panel).toContain('Mantén presionado el campo y elige «Pegar».');
  });

  it('se lee y se toca bien en el celular: letra de 16 px en el campo, toques de 44 px y sin emojis', () => {
    expect(campo).toContain('text-base sm:text-sm');
    expect(campo).toContain('w-11 h-11');
    expect(campo).not.toMatch(/🙈|👁/);
    expect(panel).not.toMatch(/text-\[10px\]|text-\[11px\]/);
    expect(leer('components', 'GuiaClaveGoogle.vue')).not.toContain('min-h-[36px]');
  });

  it('el aviso de privacidad sigue, plegado', () => {
    expect(panel).toContain('Qué pasa con tu clave y tus preguntas');
    expect(panel).toContain('no escribas datos personales ni contraseñas');
  });
});

describe('La invitación del inicio: recomendada, no obligatoria', () => {
  const inv = leer('components', 'estudiante', 'inicio', 'ActivaTutor.vue');

  it('sale en el inicio solo si el servidor confirmó que no hay clave', () => {
    expect(leer('pages', 'estudiante', 'index.vue')).toContain('<EstudianteInicioActivaTutor />');
    expect(inv).toContain("tutorStore.hasKey === false && tutorStore.claveConsultada");
  });

  it('con el Tutor abierto al lado, la tarjeta se acomoda al espacio que le queda (a 1024 px quedaba una palabra por línea)', () => {
    expect(inv).toContain('flex flex-wrap items-center gap-4');
    expect(inv).toContain('flex-1 basis-64 min-w-0');
    expect(inv).not.toContain('sm:flex-row');
  });

  it('«Activar el Tutor» abre el panel ahí mismo y «Ahora no» la oculta para siempre', () => {
    expect(inv).toContain('tutorStore.openDrawer()');
    expect(inv).toContain('Ahora no');
    expect(inv).toContain("localStorage.setItem(clave(), '1')");
  });

  it('el primer paso «Activa tu Tutor» se cumple al tener la clave, no solo por abrirlo', () => {
    expect(leer('utils', 'primerosPasos.ts')).toContain("texto: 'Activa tu Tutor'");
    const pp = leer('composables', 'usePrimerosPasos.ts');
    expect(pp).toContain("if (useTutorStore().hasKey === true) deDatos.push('tutor')");
    // Lo guardado antes (cuando bastaba abrirlo) no lo da por hecho.
    expect(pp).toContain("estado.value.hechos.filter((h) => h !== 'tutor')");
  });
});

describe('Con el Tutor abierto al lado, la página conserva espacio para leerse', () => {
  const m = leer('composables', 'useMenuColapsado.ts');
  it('entre 1024 y 1439 px el menú pasa a íconos mientras el Tutor está abierto (a 1024 px quedaban 285 px)', () => {
    expect(m).toContain("window.matchMedia('(min-width: 1024px) and (max-width: 1439px)')");
    expect(m).toContain('if (tutorAlLado.value && !abiertoConTutor.value) { colapsado.value = true; return }');
  });
  it('al cerrar el Tutor vuelve a lo que estaba, y si lo abre a mano se respeta', () => {
    expect(m).toContain('watch(tutorAlLado, (alLado) => { if (!alLado) abiertoConTutor.value = false; ajustar() })');
    expect(m).toContain('abiertoConTutor.value = !abiertoConTutor.value');
  });
});
