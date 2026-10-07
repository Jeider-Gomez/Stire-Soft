import { readFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Segunda versión de STIRE (v2.0.0), línea B: lista de chequeo de Sistemas Tutores Inteligentes (Caro, 2015).
// docs/calidad/listas-chequeo/PLAN_DE_MEJORA.md. Se prueban los archivos reales de frontend-nuxt/utils.
const raiz = path.join(__dirname, '..', '..', '..', 'frontend-nuxt');
const leer = (...p: string[]) => readFileSync(path.join(raiz, ...p), 'utf8');
function cargar<T>(nombre: string): T {
  const js = ts.transpileModule(leer('utils', `${nombre}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} as Record<string, unknown> };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, (r: string) => cargar(r.replace(/^\.\//, '')));
  return mod.exports as T;
}

describe('MOD-02 · el modelo del estudiante no se contradice', () => {
  const { nombreDelEstado, tocaRepasar } = cargar<{ nombreDelEstado: (d: number) => string; tocaRepasar: (d: number, u?: string) => boolean }>('progresoLeccion');

  it('una lección trabajada con 0 % es «Empezada», no «No visto»', () => {
    expect(nombreDelEstado(0)).toBe('Empezada');
    expect(nombreDelEstado(10)).toBe('Explorado');
    expect(nombreDelEstado(85)).toBe('Dominado');
  });

  it('«Toca repasarla» solo si ya se aprendió (60 % o más) y el repaso venció; con 0 % lo que toca es practicar', () => {
    expect(tocaRepasar(0, 'vencido')).toBe(false);
    expect(tocaRepasar(59, 'critico')).toBe(false);
    expect(tocaRepasar(60, 'vencido')).toBe(true);
    expect(tocaRepasar(95, 'al-dia')).toBe(false);
    expect(tocaRepasar(95, undefined)).toBe(false);
  });

  it('el inicio y «Mi progreso» usan la misma regla', () => {
    expect(leer('pages', 'estudiante', 'index.vue')).toContain('tocaRepasar(unit.masteryPercentage');
    expect(leer('pages', 'estudiante', 'progreso.vue')).toContain('tocaRepasar(item.mastery');
  });
});

describe('MOD-02 y MOD-04 · diagnóstico de una salida que no coincide', () => {
  type D = { tipo: string; mensaje: string } | null;
  const { diagnosticarSalida } = cargar<{ diagnosticarSalida: (e: string, o: string, i?: string) => D }>('diagnosticoSalida');

  it('el caso real del QA de Jorge: entrada 5 y 3, se esperaba 8 y se mostró 53 → números juntados como texto', () => {
    const d = diagnosticarSalida('8', '53', '5\n3');
    expect(d?.tipo).toBe('concatena');
    expect(d?.mensaje).toMatch(/conviértelo a número/);
  });

  it.each([
    ['8', '', '', 'vacia'],
    ['10', '5 5', '5 5', 'eco'],
    ['Hola, Ana.', 'Hola,  Ana.', '', 'espacios'],
    ['a\nb', 'a \n\nb', '', 'espacios'],
    ['Hola, Ana.', 'hola, ana.', '', 'mayusculas'],
    ['Hola, Ana.', 'Hola Ana', '', 'puntuacion'],
    ['10', '9', '', 'por-uno'],
    ['2.5', '2', '', 'redondeo'],
    ['20', '7', '', 'numero'],
    ['a\nb\nc', 'a\nx\nc', '', 'linea'],
  ])('esperada %j, obtenida %j → %s', (e, o, i, tipo) => {
    expect(diagnosticarSalida(e, o, i)?.tipo).toBe(tipo);
  });

  it('si coincide no hay diagnóstico, y ningún mensaje trae la solución', () => {
    expect(diagnosticarSalida('8', '8')).toBeNull();
    expect(diagnosticarSalida('20', '7')?.mensaje).not.toMatch(/console\.log\(20\)/);
  });

  it('el ejercicio muestra el diagnóstico bajo el caso y dice «Todavía no coincide», no «Falla en salida»', () => {
    const p = leer('pages', 'estudiante', 'evaluacion', '[activityId].vue');
    expect(p).toContain('diagnostico(tc)?.mensaje');
    expect(p).toContain('Todavía no coincide');
    expect(p).not.toContain('Falla en salida');
  });
});

describe('META-02 · juicio de confianza y calibración', () => {
  const c = cargar<{
    debePreguntarConfianza: (usados: number, decidio: boolean) => boolean;
    mensajeCalibracion: (x: { confianza: string; acerto: boolean }) => { texto: string; tono: string };
  }>('confianza');

  it('se pregunta solo antes de la primera entrega del ejercicio y una sola vez', () => {
    expect(c.debePreguntarConfianza(0, false)).toBe(true);
    expect(c.debePreguntarConfianza(0, true)).toBe(false);
    expect(c.debePreguntarConfianza(1, false)).toBe(false);
  });

  it('el contraste dice algo distinto en cada caso y nunca regaña', () => {
    const casos = [['seguro', true], ['seguro', false], ['dudo', true], ['dudo', false], ['adivino', true], ['adivino', false]] as const;
    const textos = casos.map(([confianza, acerto]) => c.mensajeCalibracion({ confianza, acerto }).texto);
    expect(new Set(textos).size).toBe(6);
    expect(c.mensajeCalibracion({ confianza: 'seguro', acerto: true }).tono).toBe('bien');
    // Hipercorrección (Butterfield y Metcalfe, 2001): el error con seguridad sorprende; se invita a mirar la diferencia.
    expect(c.mensajeCalibracion({ confianza: 'seguro', acerto: false }).texto).toMatch(/el error que más enseña.*qué esperabas y qué mostró/);
  });

  it('el store pregunta antes de entregar, se puede omitir, y el Tutor recibe la calibración', () => {
    const ws = leer('stores', 'workspace.ts');
    const entregar = ws.slice(ws.indexOf('async function submitSolution'));
    expect(entregar.indexOf('debePreguntarConfianza(')).toBeLessThan(entregar.indexOf('ensureActiveSubmission'));
    expect(leer('components', 'JuicioConfianza.vue')).toContain('Omitir y entregar');
    const tutor = leer('stores', 'tutor.ts');
    expect(tutor).toContain('confianza: workspaceStore.calibracion?.confianza');
    expect(tutor).toContain('errorProbable: workspaceStore.errorProbable');
  });
});

describe('MOD-01 y UI-02 · bloqueo suave por módulo', () => {
  type M = { id: number; titulo: string; lecciones: Array<{ dominio: number; empezada: boolean }> };
  type E = { id: number; abierto: boolean; dominio: number; requiere: { moduloId: number; dominio: number; umbral: number } | null };
  const b = cargar<{ estadoDeModulos: (m: M[], u: number) => E[]; proximoModuloCerrado: (m: M[], e: E[]) => { modulo: { id: number }; anterior: { id: number }; falta: number } | null }>('bloqueoModulos');
  const mod = (id: number, ...l: Array<[number, boolean]>): M => ({ id, titulo: `Unidad ${id}`, lecciones: l.map(([dominio, empezada]) => ({ dominio, empezada })) });

  it('el primer módulo siempre está abierto; el siguiente se abre con el promedio del anterior (las no empezadas suman 0)', () => {
    const modulos = [mod(1, [100, true], [0, false]), mod(2, [0, false])]; // promedio 50
    expect(b.estadoDeModulos(modulos, 50).map((e) => e.abierto)).toEqual([true, true]);
    expect(b.estadoDeModulos(modulos, 60).map((e) => e.abierto)).toEqual([true, false]);
  });

  it('lo que el estudiante ya empezó nunca se cierra, y con umbral 0 no hay bloqueo', () => {
    const modulos = [mod(1, [10, true]), mod(2, [5, true]), mod(3, [0, false])];
    expect(b.estadoDeModulos(modulos, 50).map((e) => e.abierto)).toEqual([true, true, false]);
    expect(b.estadoDeModulos(modulos, 0).every((e) => e.abierto)).toBe(true);
  });

  it('un módulo cerrado dice qué módulo trabajar y cuánto falta', () => {
    const modulos = [mod(1, [40, true], [20, true]), mod(2, [0, false])];
    const estados = b.estadoDeModulos(modulos, 50);
    expect(estados[1].requiere).toMatchObject({ moduloId: 1, dominio: 30, umbral: 50 });
    expect(b.proximoModuloCerrado(modulos, estados)).toMatchObject({ modulo: { id: 2 }, anterior: { id: 1 }, falta: 20 });
  });

  it('el docente cambia o apaga el umbral; la lección de un módulo cerrado muestra el aviso', () => {
    expect(readFileSync(path.join(__dirname, '..', '..', 'class', 'entities', 'class.entity.ts'), 'utf8')).toMatch(/@Column\(\{ type: 'int', default: 50 \}\)\s*dominioParaAvanzar/);
    expect(leer('components', 'docente', 'ajustes', 'SeccionAvance.vue')).toContain('ajustes.guardarAvance(v)');
    expect(leer('composables', 'useAjustesClase.ts')).toContain('dominioParaAvanzar: v');
    expect(leer('pages', 'estudiante', 'unidad', '[id].vue')).toMatch(/v-else-if="bloqueo"/);
  });
});

describe('META-01 · Mi autorregulación', () => {
  const { reflexionDeLaSemana } = cargar<{ reflexionDeLaSemana: (d: object) => { observacion: string; pregunta: string } }>('autorregulacion');
  const base = { diasSemana: 2, vencidos: 0, retencion: { repasos: 0, porcentaje: null }, lecciones: { enPractica: 0, dominadaReciente: 0, dominadaFirme: 0 } };

  it('elige la observación más útil, en orden: repasos pendientes, retención baja, muchas empezadas, constancia', () => {
    expect(reflexionDeLaSemana({ ...base, vencidos: 2 }).observacion).toMatch(/2 repasos pendientes/);
    expect(reflexionDeLaSemana({ ...base, retencion: { repasos: 4, porcentaje: 50 } }).observacion).toMatch(/aciertas el 50 %/);
    expect(reflexionDeLaSemana({ ...base, lecciones: { enPractica: 4, dominadaReciente: 1, dominadaFirme: 0 } }).observacion).toMatch(/4 lecciones empezadas/);
    expect(reflexionDeLaSemana({ ...base, diasSemana: 5 }).observacion).toMatch(/5 días esta semana/);
    expect(reflexionDeLaSemana({ ...base, diasSemana: 0 }).pregunta).toMatch(/reservar 15 minutos/);
  });

  it('siempre termina con una pregunta para pensar', () => {
    for (const d of [base, { ...base, vencidos: 1 }, { ...base, diasSemana: 6 }]) expect(reflexionDeLaSemana(d).pregunta).toMatch(/\?$/);
  });
});

describe('UI-01 · el algoritmo en pseudocódigo, diagrama de flujo y paso a paso', () => {
  type Paso = { numero: string; texto: string; hijos: Paso[] };
  const a = cargar<{
    esPseudocodigo: (c: string) => boolean;
    leerAlgoritmo: (c: string) => unknown[] | null;
    pasoAPaso: (n: unknown[]) => Paso[];
    diagramaDeFlujo: (n: unknown[]) => { svg: string };
  }>('algoritmoMultiformato');
  const PROMEDIO = 'Algoritmo Promedio\n    Leer nota1, nota2, nota3\n    promedio <- (nota1 + nota2 + nota3) / 3\n    Escribir promedio\nFinAlgoritmo';
  const CONTROL = 'Algoritmo Notas\n  Leer nota\n  Si nota >= 3 Entonces\n    Escribir "Aprobó"\n  SiNo\n    Escribir "Reprobó"\n  FinSi\n  Mientras i < 3 Hacer\n    i <- i + 1\n  FinMientras\nFinAlgoritmo';

  it('reconoce el pseudocódigo por su primera línea', () => {
    expect(a.esPseudocodigo(PROMEDIO)).toBe(true);
    expect(a.esPseudocodigo('const x = 1')).toBe(false);
  });

  it('el paso a paso dice lo mismo que el pseudocódigo, en palabras', () => {
    expect(a.pasoAPaso(a.leerAlgoritmo(PROMEDIO)!).map((p) => p.texto)).toEqual([
      'Empieza el algoritmo «Promedio».',
      'Pide nota1, nota2 y nota3 y los guarda.',
      'Calcula promedio como (nota1 + nota2 + nota3) / 3.',
      'Muestra promedio.',
      'Termina.',
    ]);
    const si = a.pasoAPaso(a.leerAlgoritmo(CONTROL)!)[2];
    expect(si.texto).toBe('Pregunta si nota >= 3:');
    expect(si.hijos.map((h) => h.texto)).toEqual(['Si sí:', 'Si no:']);
  });

  it('el diagrama usa las figuras de la lección: óvalo, paralelogramo, rectángulo y rombo con Sí y No', () => {
    const { svg } = a.diagramaDeFlujo(a.leerAlgoritmo(CONTROL)!);
    expect(svg).toContain('class="fg ov"'); // inicio y fin
    expect(svg).toContain('class="fg es"'); // leer y escribir
    expect(svg).toContain('class="fg pr"'); // proceso
    expect(svg).toContain('class="fg de"'); // decisión
    expect(svg).toContain('>Sí<');
    expect(svg).toContain('>No<');
  });

  it('el texto del docente va escapado en el SVG (se muestra con v-html)', () => {
    const { svg } = a.diagramaDeFlujo(a.leerAlgoritmo('Algoritmo X\n  Escribir "<img src=x onerror=alert(1)>"\nFinAlgoritmo')!);
    expect(svg).not.toContain('<img');
    expect(svg).toContain('&lt;img');
  });

  it('si los bloques no cierran no hay diagrama (nunca uno equivocado)', () => {
    expect(a.leerAlgoritmo('Algoritmo X\n  Si a Entonces\n    Escribir a\nFinAlgoritmo')).toBeNull();
    expect(a.leerAlgoritmo('Algoritmo X\n  FinMientras\nFinAlgoritmo')).toBeNull();
  });

  it('la lección muestra los tres formatos y recuerda la preferencia', () => {
    const c = leer('components', 'AlgoritmoMultiformato.vue');
    expect(c).toContain("localStorage.setItem(CLAVE, f)");
    expect(c).toContain('role="tablist"');
    expect(leer('components', 'ContenidoLeccion.vue')).toContain("<AlgoritmoMultiformato v-else-if=\"s.tipo === 'algoritmo'\"");
  });
});

describe('UI-04 · «¿Te sirvió esta explicación?» y recursos que fallan', () => {
  it('la lección pregunta al final y, con «No», el Tutor la explica de otra forma', () => {
    expect(leer('pages', 'estudiante', 'unidad', '[id].vue')).toContain('<ValorarLeccion :unit-id="unitId" />');
    const v = leer('components', 'ValorarLeccion.vue');
    expect(v).toContain('tutorStore.pedirOtraExplicacion(');
    expect(leer('stores', 'tutor.ts')).toMatch(/modoOtraExplicacion\.value \? 'otra-explicacion'/);
  });
  it('el docente ve el resultado en «Hoy», sin nombres', () => {
    expect(leer('pages', 'docente', 'clase', '[classId]', 'index.vue')).toContain('<DocenteValoracionesClase :class-id="classId" />');
  });
  it('si una imagen externa no carga, se muestra su descripción y un enlace; si un recurso no abre, se ofrece el Tutor', () => {
    const r = leer('components', 'LessonResource.vue');
    expect(r).toContain('@error="imagenFallo = true"');
    expect(r).toContain('Pedirle al Tutor que lo explique');
  });
});

describe('UI-05 y META-03 · resolver por pasos y «¿Por qué veo esto?»', () => {
  it('el ejercicio ofrece «Resolverlo por pasos con el Tutor» junto a la pista', () => {
    // El texto vive en utils/ofertaTutor.ts desde la ayuda escalonada (ayuda-escalonada.frontend.spec.ts).
    expect(leer('utils', 'ofertaTutor.ts')).toContain("'por-pasos': 'Resolverlo por pasos con el Tutor'");
    expect(leer('pages', 'estudiante', 'evaluacion', '[activityId].vue')).toContain('{{ TEXTO_AYUDA[ayuda.principal] }}');
    expect(leer('stores', 'tutor.ts')).toContain("'Quiero resolver este ejercicio por pasos.'");
  });
  it('el siguiente paso explica cómo elige STIRE y deja elegir otra cosa', () => {
    const i = leer('pages', 'estudiante', 'index.vue');
    expect(i).toContain('¿Por qué veo esto?');
    expect(i).toContain('Es una sugerencia: puedes abrir cualquier lección abierta');
  });
});

// Revisión del 04/10: 12 de los 13 bloques de código del curso están en JavaScript; con solo pseudocódigo, UI-01 casi
// no se veía. Ejemplos tomados de las lecciones reales (src/seeds/cursos/fundamentos-203413).
describe('UI-01 · los algoritmos en JavaScript también se ven como pseudocódigo, diagrama y pasos', () => {
  type N = unknown[];
  const a = cargar<{
    esJavaScriptAlgoritmo: (c: string) => boolean;
    leerJavaScript: (c: string) => N | null;
    aPseudocodigo: (n: N, nombre?: string) => string;
    pasoAPaso: (n: N) => Array<{ texto: string }>;
  }>('algoritmoMultiformato');

  it('distingue un algoritmo de HTML o CSS', () => {
    expect(a.esJavaScriptAlgoritmo('const nota = Number(lineas[0]);\nif (nota >= 3) {\n  console.log("Aprobó");\n}')).toBe(true);
    expect(a.esJavaScriptAlgoritmo('<!DOCTYPE html>\n<html>')).toBe(false);
    expect(a.esJavaScriptAlgoritmo('.diapositiva {\n  color: red;\n}')).toBe(false);
  });

  it('if / else if / else (lección «Varios caminos con else if») se vuelve Si anidados', () => {
    const codigo = 'if (nota >= 4.6) {\n  console.log("Superior");\n} else if (nota >= 4.0) {\n  console.log("Alto");\n} else {\n  console.log("Bajo");\n}';
    expect(a.aPseudocodigo(a.leerJavaScript(codigo)!, 'Nivel')).toBe(
      'Algoritmo Nivel\n    Si nota >= 4.6 Entonces\n        Escribir "Superior"\n    SiNo\n        Si nota >= 4.0 Entonces\n            Escribir "Alto"\n        SiNo\n            Escribir "Bajo"\n        FinSi\n    FinSi\nFinAlgoritmo',
    );
  });

  it('for con < y <=, while, acumulador y lectura de datos (lección «Contadores y acumuladores»)', () => {
    const codigo = 'const n = Number(lineas[0]);\nlet suma = 0;\nfor (let i = 1; i <= n; i++) {\n  const nota = Number(lineas[i]);\n  suma = suma + nota;\n}\nconsole.log(suma / n);';
    expect(a.aPseudocodigo(a.leerJavaScript(codigo)!, 'Promedio')).toBe(
      'Algoritmo Promedio\n    Leer n\n    suma <- 0\n    Para i <- 1 Hasta n Hacer\n        Leer nota\n        suma <- suma + nota\n    FinPara\n    Escribir suma / n\nFinAlgoritmo',
    );
    expect(a.aPseudocodigo(a.leerJavaScript('for (let i = 0; i < 3; i++) {\n  console.log(i);\n}')!)).toContain('Para i <- 0 Hasta 3 - 1 Hacer');
    expect(a.pasoAPaso(a.leerJavaScript('let n = 3;\nwhile (n > 0) {\n  console.log(n);\n  n = n - 1;\n}')!).map((p) => p.texto)).toEqual(['Calcula n como 3.', 'Mientras n > 0, repite:']);
  });

  it('operadores de JavaScript se escriben como en pseudocódigo (=== → =, && → y, Math.floor → trunc)', () => {
    expect(a.aPseudocodigo(a.leerJavaScript('const h = Math.floor(m / 60);\nif (a === b && !c) {\n  console.log(h);\n}')!)).toContain('h <- trunc(m / 60)\n    Si a = b y no c Entonces');
  });

  it('una plantilla con solo comentarios muestra los comentarios como pasos', () => {
    const plantilla = 'if (condición) {\n  // se ejecuta si la condición es verdadera\n} else {\n  // se ejecuta si es falsa\n}';
    expect(a.aPseudocodigo(a.leerJavaScript(plantilla)!)).toContain('(se ejecuta si la condición es verdadera)\n    SiNo\n        (se ejecuta si es falsa)');
  });

  it('funciones, objetos o el DOM no se dibujan (solo el código, nunca un diagrama equivocado)', () => {
    expect(a.leerJavaScript('function area(b, h) {\n  return b * h;\n}\nconsole.log(area(3, 4));')).toBeNull();
    expect(a.leerJavaScript('const boton = document.querySelector("#sumar");\nconsole.log(boton);')).toBeNull();
    expect(a.leerJavaScript('if (a) {\n  console.log(a);')).toBeNull(); // llave sin cerrar
  });

  it('la lección marca el lenguaje del bloque y el componente ofrece cuatro formatos para JavaScript', () => {
    expect(leer('utils', 'contenidoLeccion.ts')).toContain("segmentos.push({ tipo: 'algoritmo', codigo: cuerpo, lenguaje: 'javascript' })");
    const c = leer('components', 'AlgoritmoMultiformato.vue');
    expect(c).toContain("...(esJs.value ? [{ valor: 'pseudo' as const, texto: 'Pseudocódigo'");
    expect(leer('components', 'ContenidoLeccion.vue')).toContain(':lenguaje="s.lenguaje"');
  });
});
