// El video que presenta STIRE (cuadros «Entrar» y «Video-mascota» del lienzo v3; docs/material-visual/video-presentacion).
import * as fs from 'fs';
import * as path from 'path';

const raiz = path.resolve(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => fs.readFileSync(path.join(raiz, ...p), 'utf8');

describe('Video de presentación', () => {
  const v = leer('components', 'presentacion', 'VideoSTIRE.vue');

  it('los archivos que usa existen en public/', () => {
    for (const f of ['stire-presentacion.mp4', 'stire-presentacion.jpg', 'stire-presentacion.es.vtt']) {
      expect(fs.existsSync(path.join(raiz, 'public', 'video', f))).toBe(true);
    }
  });

  it('no arranca solo, tiene subtítulos y transcripción (WCAG 1.2.1, 1.2.2 y 2.2.2)', () => {
    expect(v).not.toMatch(/autoplay/);
    expect(v).toContain('<track kind="captions" srclang="es" label="Español"');
    expect(v).toContain('Leer la transcripción');
  });

  it('se abre en una ventana nativa que devuelve el foco y para el video al cerrar (regla 13)', () => {
    expect(v).toContain('<dialog ref="dialogo" aria-labelledby="video-titulo"');
    expect(v).toContain('video.value?.pause()');
    expect(v).toContain('boton.value?.focus()');
  });

  it('dice cuánto dura de verdad y avisa si no carga (regla 15)', () => {
    expect(v).toContain('Conócelo en menos de 2 minutos');
    expect(v).toContain('El video no cargó.');
  });

  it('la transcripción es el guion del video', () => {
    const guion = fs.readFileSync(path.join(raiz, '..', 'docs', 'material-visual', 'video-presentacion', 'proyecto', 'GUION.md'), 'utf8');
    const t = leer('utils', 'videoPresentacion.ts');
    for (const frase of ['¡Hola! Soy el Tutor de STIRE.', 'Sin rachas, sin presión', 'Entra con el código de tu clase.']) {
      expect(guion).toContain(frase);
      expect(t).toContain(frase);
    }
  });
});
