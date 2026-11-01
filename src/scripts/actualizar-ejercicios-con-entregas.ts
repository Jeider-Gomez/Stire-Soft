// Renueva el enunciado y los casos de los ejercicios de un curso pedagógico que ya tienen entregas (01/11, decisión de
// Jeider: 74 de 124 ejercicios seguían con `lineas[0]` y «Caso oculto 2», porque el servidor no deja cambiar lo entregado).
// Se corre UNA vez y a mano; a un docente lo sigue protegiendo el 409 de ActivityQuestionsService.update.
//
// Qué NO cambia: las notas, las entregas, el dominio y los intentos. El código que ya usaba `lineas` sigue funcionando.
// Lo que sí cambia con el tiempo: un resultado viejo cuyo caso cambió de nombre deja de contar en el análisis de errores
// (perfil-aprendizaje.ts: tipoDeFallo responde null), sin fallar.
//
// Uso, en el servidor, con el curso ya desplegado:
//   node dist/scripts/actualizar-ejercicios-con-entregas.js fundamentos --simular   → solo dice qué cambiaría
//   node dist/scripts/actualizar-ejercicios-con-entregas.js fundamentos --aplicar   → guarda
// Sin --aplicar no guarda nada. Se puede repetir: lo que ya está igual no se toca.
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { ActivityQuestionsService } from '../activity-questions/activity-questions.service';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityQuestion } from '../activity-questions/entities/activity-question.entity';
import { Class } from '../class/entities/class.entity';
import { LearningUnit } from '../learning-unit/entities/learning-unit.entity';
import { Section } from '../section/entities/section.entity';
import { Topic } from '../topic/entities/topic.entity';
import { ContentRenderingService } from '../content-rendering/content-rendering.service';
import { cursoFundamentos203413 } from '../seeds/cursos/fundamentos-203413';
import { cursoPensamientoAlgoritmico } from '../seeds/cursos/pensamiento-algoritmico';
import { aConfig, Curso, Ejercicio } from '../seeds/cursos/tipos';

/** JSON con las claves en orden: la base de datos puede devolver un objeto con sus claves en otro orden, y sigue siendo el mismo. */
export function jsonCanonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(jsonCanonico).join(',')}]`;
  if (valor && typeof valor === 'object') {
    const o = valor as Record<string, unknown>;
    return `{${Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${jsonCanonico(o[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(valor);
}

export type Decision = 'igual' | 'actualizar' | 'tipo-distinto';

/** Qué hacer con una pregunta guardada. Si cambió de tipo no se toca: las entregas viejas tendrían otra forma de respuesta. */
export function decidir(
  guardada: { type: string; question: string; config: unknown },
  nueva: { tipo: string; enunciadoSaneado: string; config: unknown },
): Decision {
  if (guardada.type !== nueva.tipo) return 'tipo-distinto';
  const igual = guardada.question === nueva.enunciadoSaneado && jsonCanonico(guardada.config) === jsonCanonico(nueva.config);
  return igual ? 'igual' : 'actualizar';
}

export interface Resumen {
  revisados: number;
  iguales: number;
  actualizados: string[];
  tipoDistinto: string[];
  sinEjercicio: string[];
  errores: string[];
}

export function textoResumen(r: Resumen, aplicar: boolean): string {
  return [
    `${aplicar ? 'GUARDADO' : '[SIMULACIÓN, no se guardó nada]'} ${r.revisados} ejercicios revisados: ${r.iguales} ya estaban igual, ${r.actualizados.length} ${aplicar ? 'actualizados' : 'se actualizarían'}.`,
    `Con otro tipo, no se tocan: ${r.tipoDistinto.length}. No están en el servidor: ${r.sinEjercicio.length}. Con error: ${r.errores.length}.`,
    ...r.tipoDistinto.map((t) => `  tipo distinto: ${t}`),
    ...r.sinEjercicio.map((t) => `  no está: ${t}`),
    ...r.errores.map((t) => `  error: ${t}`),
  ].join('\n');
}

const CURSOS: Record<string, Curso> = { fundamentos: cursoFundamentos203413, pensamiento: cursoPensamientoAlgoritmico };

async function main() {
  const curso = CURSOS[process.argv[2]];
  if (!curso) throw new Error('Indica el curso: fundamentos o pensamiento.');
  const aplicar = process.argv.includes('--aplicar');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const db = app.get(DataSource);
    const servicio = app.get(ActivityQuestionsService);
    const saneado = app.get(ContentRenderingService);
    const clase = await db.getRepository(Class).findOne({ where: { code: curso.codigo } });
    if (!clase) throw new Error(`No existe la clase ${curso.codigo}.`);

    const r: Resumen = { revisados: 0, iguales: 0, actualizados: [], tipoDistinto: [], sinEjercicio: [], errores: [] };
    const revisar = async (ruta: string, e: Ejercicio, unidadId: number | undefined) => {
      r.revisados++;
      const actividad = unidadId ? await db.getRepository(Activity).findOne({ where: { learningUnitId: unidadId, title: e.titulo } }) : null;
      const pregunta = actividad ? await db.getRepository(ActivityQuestion).findOne({ where: { activityId: actividad.id }, order: { order: 'ASC', id: 'ASC' } }) : null;
      if (!pregunta) return void r.sinEjercicio.push(ruta);
      const config = aConfig(e);
      const decision = decidir(pregunta, { tipo: e.tipo, enunciadoSaneado: saneado.sanitizeRichText(e.enunciado), config });
      if (decision === 'igual') return void r.iguales++;
      if (decision === 'tipo-distinto') return void r.tipoDistinto.push(ruta);
      try {
        // Pasa por la misma validación y el mismo saneado que la edición del docente.
        if (aplicar) await servicio.actualizarDesdeElCurso(pregunta, { question: e.enunciado, config });
        r.actualizados.push(ruta);
      } catch (err) {
        r.errores.push(`${ruta}: ${String(err)}`);
      }
    };

    for (const s of curso.secciones) {
      const seccion = await db.getRepository(Section).findOne({ where: { classId: clase.id, title: s.titulo } });
      for (const t of s.temas) {
        const tema = seccion ? await db.getRepository(Topic).findOne({ where: { sectionId: seccion.id, title: t.titulo } }) : null;
        for (const u of t.unidades) {
          const unidad = tema ? await db.getRepository(LearningUnit).findOne({ where: { topicId: tema.id, title: u.titulo } }) : null;
          for (const e of u.ejercicios) await revisar(`${u.titulo} › ${e.titulo}`, e, unidad?.id);
        }
      }
    }
    console.log(textoResumen(r, aplicar));
    if (r.errores.length > 0) process.exitCode = 1;
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
