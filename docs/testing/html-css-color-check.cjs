// Verificación en NODE REAL de la equivalencia de colores del evaluador html_css (Fase 25).
//
// Por qué existe: jest.config.js sustituye `@asamuzakjp/css-color` por un stub inerte (es ESM puro y Jest no puede cargarlo), así
// que las pruebas de Jest solo ven colores por nombre. En Node real (el del Dockerfile, Node 24) jsdom sí interpreta hexadecimales
// y rgb(): este script lo comprueba contra el código COMPILADO.
//
//   npm run build && node docs/testing/html-css-color-check.cjs      → exit 0 si todo coincide
//
// Requiere Node >= 22.12 (jsdom carga un módulo ESM con require()). En una versión anterior los colores hex/rgb no se aplicarían
// y este script falla: es la señal para no desplegar en ese Node. (La solución modelo obligatoria también lo delata al crear el
// ejercicio: una regla de color con CSS hex no la cumpliría.)

const path = require('path');
const { evaluateRules } = require(path.join(__dirname, '..', '..', 'dist', 'evaluation-engine', 'html-css', 'html-css.checker.js'));

const rule = (oneOf) => [{ id: 'r', label: 'r', isPublic: true, weight: 1, check: { kind: 'css_property', selector: 'h1', property: 'color', oneOf } }];
const pass = (css, oneOf) => evaluateRules('<h1>t</h1>', css, rule(oneOf))[0].passed;

const equivalent = ['#F00', '#ff0000', 'red', 'rgb(255,0,0)', 'rgb(255, 0, 0)', 'RED'];
const failures = [];
for (const declared of equivalent) {
  for (const accepted of equivalent) {
    if (!pass(`h1{color:${declared}}`, [accepted])) failures.push(`declarado ${declared} vs aceptado ${accepted}`);
  }
}
if (pass('h1{color:blue}', ['#ff0000', 'red'])) failures.push('blue no debe aceptarse como rojo');
if (!pass('h1{margin:0 auto}', ['0 auto', '0px auto']) && !pass('h1{margin:0 auto}', ['0px auto'])) failures.push('margin 0 auto');

if (failures.length) {
  console.error('FALLA la equivalencia de colores en este Node (' + process.version + '):\n - ' + failures.join('\n - '));
  process.exit(1);
}
console.log(`OK: ${equivalent.length * equivalent.length} combinaciones de color equivalentes en Node ${process.version}`);
