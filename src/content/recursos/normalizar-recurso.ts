/**
 * Recursos multimedia de una lección (videos, documentos, presentaciones, actividades interactivas).
 *
 * El docente pega un enlace o el «código para insertar» que dan YouTube, Genially, Canva, Google Drive… Nunca se
 * guarda ese HTML: se extrae la dirección, se reconoce el proveedor y se ARMA aquí la dirección de inserción, siempre
 * https y de una lista cerrada de sitios. Así un recurso no puede meter código propio en la página de STIRE. Un sitio
 * que no está en la lista queda como enlace para abrir en otra pestaña (sin iframe).
 *
 * Los archivos de Word, PowerPoint o PDF no se suben a STIRE: se enlazan desde Google Drive u OneDrive, o desde una
 * dirección pública (el visor de Office los muestra). Así no ocupan disco del servidor.
 */

export type ProveedorRecurso =
  | 'youtube'
  | 'vimeo'
  | 'google_drive'
  | 'google_docs'
  | 'google_slides'
  | 'google_sheets'
  | 'google_forms'
  | 'genially'
  | 'canva'
  | 'scratch'
  | 'phet'
  | 'office'
  | 'pdf'
  | 'enlace';

export interface RecursoNormalizado {
  proveedor: ProveedorRecurso;
  /** La dirección que dio el docente (la del código de inserción, si pegó uno), para «Abrir en otra pestaña». */
  url: string;
  /** Dirección para el iframe; null si el sitio no se puede insertar y solo se muestra como enlace. */
  embedUrl: string | null;
}

export class RecursoInvalidoError extends Error {}

const MAX_URL = 2000;

/** Si el docente pegó un código de inserción (`<iframe src="…">`), toma solo la dirección. */
function extraerDireccion(entrada: string): string {
  const texto = entrada.trim();
  const src = /<iframe[^>]*\ssrc\s*=\s*["']([^"']+)["']/i.exec(texto);
  return (src ? src[1] : texto).replace(/&amp;/g, '&').trim();
}

function parsear(direccion: string): URL {
  if (direccion.length > MAX_URL) throw new RecursoInvalidoError('La dirección es demasiado larga.');
  let url: URL;
  try {
    url = new URL(direccion);
  } catch {
    throw new RecursoInvalidoError('Eso no es una dirección web. Copia el enlace completo (empieza por https://).');
  }
  if (url.protocol !== 'https:') throw new RecursoInvalidoError('Solo se aceptan direcciones seguras (https://).');
  if (url.username || url.password) throw new RecursoInvalidoError('La dirección no puede llevar usuario ni contraseña.');
  return url;
}

const esHost = (url: URL, ...hosts: string[]) => hosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));
const ID = /^[A-Za-z0-9_-]+$/;
const segmento = (url: URL, i: number) => url.pathname.split('/').filter(Boolean)[i] ?? '';

export function normalizarRecurso(entrada: string): RecursoNormalizado {
  if (!entrada || !entrada.trim()) throw new RecursoInvalidoError('Pega el enlace del recurso.');
  const url = parsear(extraerDireccion(entrada));
  const original = url.toString();
  const resultado = (proveedor: ProveedorRecurso, embedUrl: string | null): RecursoNormalizado => ({ proveedor, url: original, embedUrl });

  // YouTube: watch?v=, youtu.be/, /shorts/, /embed/. Se usa youtube-nocookie (no deja cookies de seguimiento).
  if (esHost(url, 'youtube.com', 'youtu.be', 'youtube-nocookie.com')) {
    let id = '';
    if (url.hostname.endsWith('youtu.be')) id = segmento(url, 0);
    else if (url.searchParams.get('v')) id = url.searchParams.get('v') ?? '';
    else if (['embed', 'shorts', 'live'].includes(segmento(url, 0))) id = segmento(url, 1);
    if (!/^[A-Za-z0-9_-]{6,20}$/.test(id)) throw new RecursoInvalidoError('No se encontró el video en ese enlace de YouTube.');
    return resultado('youtube', `https://www.youtube-nocookie.com/embed/${id}`);
  }

  if (esHost(url, 'vimeo.com')) {
    const id = url.hostname === 'player.vimeo.com' ? segmento(url, 1) : segmento(url, 0);
    if (!/^\d+$/.test(id)) throw new RecursoInvalidoError('No se encontró el video en ese enlace de Vimeo.');
    return resultado('vimeo', `https://player.vimeo.com/video/${id}`);
  }

  // Google Drive: cualquier archivo compartido (PDF, Word, PowerPoint, video, imagen) se ve con /preview.
  if (url.hostname === 'drive.google.com') {
    const id = segmento(url, 0) === 'file' && segmento(url, 1) === 'd' ? segmento(url, 2) : url.searchParams.get('id') ?? '';
    if (!ID.test(id)) throw new RecursoInvalidoError('No se encontró el archivo en ese enlace de Google Drive.');
    return resultado('google_drive', `https://drive.google.com/file/d/${id}/preview`);
  }

  if (url.hostname === 'docs.google.com') {
    const tipo = segmento(url, 0);
    // /forms/d/e/<id>/viewform (enlace publicado) o /forms/d/<id>/
    if (tipo === 'forms') {
      const publicado = segmento(url, 2) === 'e';
      const id = publicado ? segmento(url, 3) : segmento(url, 2);
      if (!ID.test(id)) throw new RecursoInvalidoError('No se encontró el formulario en ese enlace.');
      return resultado('google_forms', `https://docs.google.com/forms/d/${publicado ? 'e/' : ''}${id}/viewform?embedded=true`);
    }
    const id = segmento(url, 2);
    if (segmento(url, 1) !== 'd' || !ID.test(id)) throw new RecursoInvalidoError('No se encontró el documento en ese enlace de Google.');
    if (tipo === 'document') return resultado('google_docs', `https://docs.google.com/document/d/${id}/preview`);
    if (tipo === 'presentation') return resultado('google_slides', `https://docs.google.com/presentation/d/${id}/embed`);
    if (tipo === 'spreadsheets') return resultado('google_sheets', `https://docs.google.com/spreadsheets/d/${id}/preview`);
    throw new RecursoInvalidoError('Ese tipo de archivo de Google no se puede mostrar en la lección.');
  }

  // Genially: view.genial.ly/<id> (enlace para ver o del código de inserción).
  if (esHost(url, 'genial.ly', 'genially.com')) {
    const id = url.hostname.startsWith('view.') ? segmento(url, 0) : '';
    if (!/^[a-f0-9]{16,40}$/i.test(id)) {
      throw new RecursoInvalidoError('Usa el enlace «Ver» de Genially (view.genial.ly/…) o su código para insertar.');
    }
    return resultado('genially', `https://view.genial.ly/${id}`);
  }

  // Canva: /design/<id>/<clave>/view (enlace público de «Ver»); se inserta con ?embed.
  if (esHost(url, 'canva.com')) {
    const partes = url.pathname.split('/').filter(Boolean);
    if (partes[0] !== 'design' || !ID.test(partes[1] ?? '') || !ID.test(partes[2] ?? '')) {
      throw new RecursoInvalidoError('Usa el enlace público de Canva («Compartir» → «Ver»).');
    }
    return resultado('canva', `https://www.canva.com/design/${partes[1]}/${partes[2]}/view?embed`);
  }

  // Scratch: /projects/<número>
  if (esHost(url, 'scratch.mit.edu')) {
    const id = segmento(url, 1);
    if (segmento(url, 0) !== 'projects' || !/^\d+$/.test(id)) throw new RecursoInvalidoError('No se encontró el proyecto de Scratch.');
    return resultado('scratch', `https://scratch.mit.edu/projects/${id}/embed`);
  }

  // Simulaciones PhET (HTML5).
  if (url.hostname === 'phet.colorado.edu' && url.pathname.startsWith('/sims/html/') && url.pathname.endsWith('.html')) {
    return resultado('phet', `https://phet.colorado.edu${url.pathname}`);
  }

  // Visor de Office ya armado (OneDrive / SharePoint lo dan en «Insertar»).
  if (url.hostname === 'view.officeapps.live.com' && url.pathname === '/op/embed.aspx' && url.searchParams.get('src')) {
    const src = parsear(url.searchParams.get('src') ?? '');
    return resultado('office', `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src.toString())}`);
  }
  if (url.hostname === 'onedrive.live.com' && url.pathname === '/embed') {
    return resultado('office', original);
  }

  // Word, PowerPoint o Excel públicos en la web: el visor de Office de Microsoft los muestra.
  const extension = url.pathname.toLowerCase().split('.').pop() ?? '';
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(extension)) {
    return resultado('office', `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(original)}`);
  }
  // Un PDF de cualquier sitio no se inserta: podría ser otra cosa con nombre .pdf, y Chrome no muestra PDF dentro de un
  // iframe aislado. Queda como enlace; para verlo dentro de la lección, se sube a Google Drive.
  if (extension === 'pdf') return resultado('pdf', null);

  return resultado('enlace', null);
}
