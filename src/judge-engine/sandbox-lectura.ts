/**
 * Las funciones para leer la entrada, listas para usar (31/10, Jeider, «Saludo personalizado»: «un arreglo que no sé ni qué
 * es»; P35 y P53 de docs/PENDIENTES.md). Antes, cada ejercicio de programar traía escritas dos líneas con `lineas` y
 * `require('fs')` que el estudiante no entendía y no debía tocar. Ahora basta pedir el dato:
 *
 *   const nombre = leerTexto();   // la siguiente línea de la entrada, como texto
 *   const edad = leerNumero();    // la siguiente línea, como número
 *   const todas = leerLineas();   // todas las líneas, para cuando ya se enseñe el arreglo
 *
 * Van en el archivo que el juez carga antes del código del estudiante (no en su editor), así que no cambian sus números de
 * línea. Si el estudiante define una función con el mismo nombre, la suya manda; y el código que lee la entrada a la
 * antigua (`require('fs').readFileSync(0, …)`) sigue funcionando igual. Va como texto, y no como función serializada, para
 * no depender de cómo el compilador o la cobertura de pruebas reescriban su cuerpo.
 */
export const PRELUDIO_LECTURA = `
(() => {
  let lineas = null;
  let siguiente = 0;
  const cargar = () => {
    if (lineas === null) {
      let crudo = '';
      try { crudo = require('fs').readFileSync(0, 'utf8'); } catch { crudo = ''; }
      lineas = crudo.trim().split(String.fromCharCode(10)).map((l) => l.replace(String.fromCharCode(13), ''));
    }
    return lineas;
  };
  const texto = () => { const todas = cargar(); return siguiente < todas.length ? todas[siguiente++] : ''; };
  const definir = (nombre, valor) => Object.defineProperty(globalThis, nombre, { value: valor, writable: true, configurable: true });
  definir('leerTexto', texto);
  definir('leerNumero', () => Number(texto()));
  definir('leerLineas', () => cargar().slice());
})();
`;
