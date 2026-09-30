export enum ContentType {
  VIDEO = 'video',
  MARKDOWN = 'markdown',
  CODE = 'code',
  PDF = 'pdf',
  IMAGE = 'image',
  /** Recurso insertado (Genially, Canva, Drive, Office, Scratch…): ver src/content/recursos/normalizar-recurso.ts. */
  EMBED = 'embed',
}
