import { ContentType } from '../../common/enums/content-type.enum';
import { metadatosDeRecurso } from './metadatos-recurso';
import { RecursoInvalidoError } from './normalizar-recurso';

describe('metadatosDeRecurso: el metadata de una lección multimedia se reconstruye, no se copia', () => {
  it('un recurso insertado guarda solo url, proveedor y la dirección armada por el servidor', () => {
    const m = metadatosDeRecurso(ContentType.EMBED, { url: 'https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0', embedUrl: 'javascript:alert(1)', extra: 1 });
    expect(m).toEqual({ url: 'https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0', provider: 'genially', embedUrl: 'https://view.genial.ly/64f0a1b2c3d4e5f6a7b8c9d0' });
  });

  it('VIDEO y PDF pasan por el mismo reconocedor', () => {
    expect(metadatosDeRecurso(ContentType.VIDEO, { url: 'https://youtu.be/dQw4w9WgXcQ' })).toMatchObject({ provider: 'youtube' });
    expect(metadatosDeRecurso(ContentType.PDF, { url: 'https://drive.google.com/file/d/1AbC/view' })).toMatchObject({ provider: 'google_drive' });
  });

  it('una imagen: https o subida a STIRE, con descripción obligatoria', () => {
    expect(metadatosDeRecurso(ContentType.IMAGE, { url: 'https://upload.wikimedia.org/a.png', alt: ' Diagrama de flujo ', onerror: 'x' })).toEqual({
      url: 'https://upload.wikimedia.org/a.png',
      alt: 'Diagrama de flujo',
    });
    expect(metadatosDeRecurso(ContentType.IMAGE, { url: '/media/0f8fad5b-d9cb-469f-a165-70867728950e', alt: 'Tabla', caption: 'Figura 1' })).toEqual({
      url: '/media/0f8fad5b-d9cb-469f-a165-70867728950e',
      alt: 'Tabla',
      caption: 'Figura 1',
    });
  });

  it('rechaza una imagen sin descripción, con javascript: o con una ruta interna que no es una imagen subida', () => {
    expect(() => metadatosDeRecurso(ContentType.IMAGE, { url: 'https://x.org/a.png' })).toThrow(RecursoInvalidoError);
    expect(() => metadatosDeRecurso(ContentType.IMAGE, { url: 'javascript:alert(1)', alt: 'a' })).toThrow(RecursoInvalidoError);
    expect(() => metadatosDeRecurso(ContentType.IMAGE, { url: '/admin/users', alt: 'a' })).toThrow(RecursoInvalidoError);
  });

  it('un recurso sin enlace da un mensaje claro', () => {
    expect(() => metadatosDeRecurso(ContentType.EMBED, {})).toThrow('Falta el enlace del recurso');
  });

  it('las lecciones de texto y código no cambian', () => {
    expect(metadatosDeRecurso(ContentType.MARKDOWN, { lo: 'que sea' })).toEqual({ lo: 'que sea' });
    expect(metadatosDeRecurso(ContentType.CODE, undefined)).toBeUndefined();
  });
});
