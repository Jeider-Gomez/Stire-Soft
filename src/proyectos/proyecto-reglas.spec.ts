import { accesoAProyectos, bytesDeArchivos, LIMITES_PROYECTOS, plantillaInicial, ProyectoInvalidoError, validarArchivos, validarTitulo } from './proyecto-reglas';

describe('Proyectos: reglas (docs/DISENO_PROYECTOS.md §4)', () => {
  it('una página web admite html, css, js y txt; un proyecto de JavaScript, solo js y txt', () => {
    expect(validarArchivos('web', [{ nombre: 'index.html', contenido: '<h1>a</h1>' }, { nombre: 'estilos.css', contenido: '' }])).toHaveLength(2);
    expect(() => validarArchivos('javascript', [{ nombre: 'index.html', contenido: '' }])).toThrow('admite archivos .js, .txt');
  });

  it('rechaza nombres con rutas, espacios o sin extensión, y nombres repetidos', () => {
    for (const nombre of ['../secreto.js', 'mi archivo.js', 'main', 'a/b.js', 'imagen.png']) {
      expect(() => validarArchivos('web', [{ nombre, contenido: '' }])).toThrow(ProyectoInvalidoError);
    }
    expect(() => validarArchivos('web', [{ nombre: 'a.js', contenido: '' }, { nombre: 'A.js', contenido: '' }])).toThrow('dos archivos');
  });

  it('hasta 10 archivos y 200 KB por proyecto', () => {
    const once = Array.from({ length: 11 }, (_, i) => ({ nombre: `f${i}.js`, contenido: '' }));
    expect(() => validarArchivos('javascript', once)).toThrow('10 archivos');
    const grande = [{ nombre: 'main.js', contenido: 'x'.repeat(LIMITES_PROYECTOS.bytesPorProyecto) }];
    expect(() => validarArchivos('javascript', grande)).toThrow('200 KB');
  });

  it('el tamaño se mide en bytes reales (UTF-8), no en caracteres', () => {
    expect(bytesDeArchivos([{ nombre: 'a.js', contenido: 'ñ' }])).toBe(4 + 2);
  });

  it('entradas que no son lo esperado se rechazan con un motivo', () => {
    expect(() => validarArchivos('web', null)).toThrow('al menos un archivo');
    expect(() => validarArchivos('web', [{ nombre: 'a.js' }])).toThrow('nombre y contenido');
    expect(() => validarTitulo('   ')).toThrow('nombre al proyecto');
    expect(() => validarTitulo('x'.repeat(101))).toThrow('100 caracteres');
  });

  it('la plantilla inicial cumple las reglas y el título no se cuela como HTML', () => {
    const web = plantillaInicial('web', 'Mi <script>página</script>');
    expect(validarArchivos('web', web)).toHaveLength(3);
    expect(web[0].contenido).not.toContain('<script>');
    expect(validarArchivos('javascript', plantillaInicial('javascript', 'X'))).toHaveLength(1);
  });

  describe('acceso en fase de prueba', () => {
    const base = { clasesPiloto: 'ALGO-203413-G2, SIM-6V738W' };
    it('en piloto: estudiante de una clase piloto sí; de otra clase no; docente y admin siempre', () => {
      expect(accesoAProyectos({ ...base, modo: 'piloto', rol: 'estudiante', codigosDeSusClases: ['algo-203413-g2'] })).toBe(true);
      expect(accesoAProyectos({ ...base, modo: 'piloto', rol: 'estudiante', codigosDeSusClases: ['ALGO-203413'] })).toBe(false);
      expect(accesoAProyectos({ ...base, modo: undefined, rol: 'docente', codigosDeSusClases: [] })).toBe(true);
    });
    it('«todos» lo abre y «apagado» lo cierra para todos', () => {
      expect(accesoAProyectos({ ...base, modo: 'todos', rol: 'estudiante', codigosDeSusClases: [] })).toBe(true);
      expect(accesoAProyectos({ ...base, modo: 'apagado', rol: 'admin', codigosDeSusClases: [] })).toBe(false);
    });
  });
});

describe('Proyectos: un proyecto lleno cabe en una petición', () => {
  // Un proyecto de 200 KB lleno de saltos de línea y comillas ocupa ~340 KB como JSON: con 300 KB daba 413.
  it('el límite de cuerpo JSON deja margen sobre los 200 KB (con el escape del JSON)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { LIMITE_CUERPO_JSON_BYTES } = require('../common/limite-cuerpo') as { LIMITE_CUERPO_JSON_BYTES: number };
    const lleno = [{ nombre: 'main.js', contenido: 'a\n"'.repeat(Math.floor((LIMITES_PROYECTOS.bytesPorProyecto - 20) / 3)) }];
    expect(validarArchivos('javascript', lleno)).toHaveLength(1);
    expect(Buffer.byteLength(JSON.stringify({ archivos: lleno }))).toBeLessThan(LIMITE_CUERPO_JSON_BYTES);
    // el peor caso realista: todo el código son caracteres que el JSON escapa a 2 bytes
    const todoEscapado = [{ nombre: 'main.js', contenido: '\n'.repeat(LIMITES_PROYECTOS.bytesPorProyecto - 20) }];
    expect(Buffer.byteLength(JSON.stringify({ archivos: todoEscapado }))).toBeLessThan(LIMITE_CUERPO_JSON_BYTES);
  });
});
