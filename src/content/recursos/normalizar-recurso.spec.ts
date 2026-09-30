import { normalizarRecurso, RecursoInvalidoError } from './normalizar-recurso';

const embed = (entrada: string) => normalizarRecurso(entrada).embedUrl;
const proveedor = (entrada: string) => normalizarRecurso(entrada).proveedor;

describe('normalizarRecurso: el servidor arma la dirección de inserción', () => {
  it('YouTube en todas sus formas, por youtube-nocookie', () => {
    const esperado = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
    expect(embed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe(esperado);
    expect(embed('https://youtu.be/dQw4w9WgXcQ')).toBe(esperado);
    expect(embed('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(esperado);
    expect(embed('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(esperado);
  });

  it('del código para insertar toma solo la dirección (el HTML pegado nunca se guarda)', () => {
    const codigo = '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=x&amp;start=5" onload="alert(1)"></iframe>';
    expect(embed(codigo)).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(normalizarRecurso(codigo).url).not.toContain('onload');
  });

  it('Genially (enlace «Ver» o su código para insertar)', () => {
    expect(embed('https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0')).toBe('https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0');
    expect(embed('<div><iframe title="x" src="https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0" allowfullscreen></iframe></div>')).toBe(
      'https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0',
    );
  });

  it('Google Drive: PDF, Word o PowerPoint compartidos se ven con /preview', () => {
    expect(embed('https://drive.google.com/file/d/1AbC_dEf-123/view?usp=sharing')).toBe('https://drive.google.com/file/d/1AbC_dEf-123/preview');
    expect(embed('https://drive.google.com/open?id=1AbC_dEf-123')).toBe('https://drive.google.com/file/d/1AbC_dEf-123/preview');
  });

  it('Google Docs, Slides, Sheets y Forms', () => {
    expect(embed('https://docs.google.com/document/d/1xYz/edit')).toBe('https://docs.google.com/document/d/1xYz/preview');
    expect(embed('https://docs.google.com/presentation/d/1xYz/edit#slide=id.p')).toBe('https://docs.google.com/presentation/d/1xYz/embed');
    expect(embed('https://docs.google.com/spreadsheets/d/1xYz/edit')).toBe('https://docs.google.com/spreadsheets/d/1xYz/preview');
    expect(embed('https://docs.google.com/forms/d/e/1FAIpQL_abc/viewform?usp=sf_link')).toBe(
      'https://docs.google.com/forms/d/e/1FAIpQL_abc/viewform?embedded=true',
    );
  });

  it('Canva, Scratch, Vimeo y PhET', () => {
    expect(embed('https://www.canva.com/design/DAF1abc/Xyz_12/view?utm_content=a')).toBe('https://www.canva.com/design/DAF1abc/Xyz_12/view?embed');
    expect(embed('https://scratch.mit.edu/projects/123456789/')).toBe('https://scratch.mit.edu/projects/123456789/embed');
    expect(embed('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871');
    expect(embed('https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_es.html')).toBe(
      'https://phet.colorado.edu/sims/html/graphing-lines/latest/graphing-lines_es.html',
    );
  });

  it('Word, PowerPoint y Excel públicos: el visor de Office', () => {
    expect(embed('https://unicordoba.edu.co/archivos/guia.pptx')).toBe(
      'https://view.officeapps.live.com/op/embed.aspx?src=https%3A%2F%2Funicordoba.edu.co%2Farchivos%2Fguia.pptx',
    );
    expect(proveedor('https://ejemplo.org/plan.docx')).toBe('office');
  });

  it('un PDF suelto y un sitio desconocido quedan como enlace, sin iframe', () => {
    expect(normalizarRecurso('https://ejemplo.org/guia.pdf')).toMatchObject({ proveedor: 'pdf', embedUrl: null });
    expect(normalizarRecurso('https://kahoot.it/challenge/123')).toMatchObject({ proveedor: 'enlace', embedUrl: null });
  });

  it('un dominio que solo se parece al de un proveedor no se reconoce como ese proveedor', () => {
    expect(normalizarRecurso('https://youtube.com.malicioso.net/watch?v=dQw4w9WgXcQ')).toMatchObject({ proveedor: 'enlace', embedUrl: null });
    expect(normalizarRecurso('https://notdrive.google.com.evil.io/file/d/1AbC/view')).toMatchObject({ proveedor: 'enlace', embedUrl: null });
  });

  it('rechaza lo que no es https, direcciones con usuario y javascript:', () => {
    for (const mala of ['http://youtu.be/dQw4w9WgXcQ', 'javascript:alert(1)', 'https://user:pass@drive.google.com/file/d/1/view', 'no es un enlace', '']) {
      expect(() => normalizarRecurso(mala)).toThrow(RecursoInvalidoError);
    }
  });

  it('un enlace de un proveedor conocido pero sin el recurso da un mensaje claro', () => {
    expect(() => normalizarRecurso('https://www.youtube.com/@canal')).toThrow('No se encontró el video');
    expect(() => normalizarRecurso('https://app.genial.ly/editor/abc')).toThrow('Genially');
  });
});
