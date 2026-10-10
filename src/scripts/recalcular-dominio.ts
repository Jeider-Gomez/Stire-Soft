// Recalcula el dominio guardado de todas las lecciones con el motor del dominio por evidencia (09/10;
// src/common/utils/motor-dominio.ts, docs/DISENO_DOMINIO.md). El dominio se guarda al entregar, así que un cambio de
// reglas solo llega a cada lección en su próxima entrega; mientras, una lección podía quedar en 96 % «sin salida».
// Se corre UNA vez después de desplegar. No avisa a nadie (no manda notificaciones) y no cuenta intentos.
//
// Uso, en el servidor (docs/DESPLIEGUE.md):
//   node dist/scripts/recalcular-dominio.js --simular   → solo dice qué cambiaría, no guarda nada
//   node dist/scripts/recalcular-dominio.js             → guarda SOLO las lecciones que suben (nunca baja nada), y en
//                                                         las que bajarían deja lo ganado como piso (dominioConservado),
//                                                         para que tampoco bajen en su próxima entrega
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { LearningProgressService } from '../learning-progress/learning-progress.service';
import { Repository } from 'typeorm';

export interface CambioDominio {
  studentId: number;
  learningUnitId: number;
  antes: number;
  despues: number;
}

/**
 * Resumen en palabras (lo que se imprime al final). Solo se GUARDA lo que sube: nunca se baja un dominio ya ganado en
 * plena prueba (pedido de Jeider, 10/10). Los que bajarían se listan como «se conservan»: suele ser una lección a la que
 * se le agregaron ejercicios después (el estudiante 4 llegó al 100 % con 1 ejercicio y luego la lección tuvo 8).
 */
export function resumenCambios(cambios: CambioDominio[]): string {
  const suben = cambios.filter((c) => c.despues > c.antes);
  const seConservan = cambios.filter((c) => c.despues < c.antes);
  const llegan100 = suben.filter((c) => c.despues === 100).length;
  return [
    `${cambios.length} lecciones revisadas: ${suben.length} suben (${llegan100} llegan al 100 %), ${cambios.length - suben.length - seConservan.length} quedan igual y ${seConservan.length} se conservan (bajarían, pero no se baja nada: 0 bajan).`,
    ...suben.map(
      (c) =>
        `  sube: estudiante ${c.studentId}, lección ${c.learningUnitId}: ${c.antes} % → ${c.despues} %`,
    ),
    ...seConservan.map(
      (c) =>
        `  se conserva: estudiante ${c.studentId}, lección ${c.learningUnitId}: queda en ${c.antes} % (el cálculo da ${c.despues} %)`,
    ),
  ].join('\n');
}

/** Solo se guarda si sube. */
export const debeGuardarse = (c: CambioDominio): boolean => c.despues > c.antes;

async function main() {
  const simular = process.argv.includes('--simular');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    const progresos = app.get<Repository<LearningProgress>>(
      getRepositoryToken(LearningProgress),
    );
    const servicio = app.get(LearningProgressService);
    const cambios: CambioDominio[] = [];
    for (const p of await progresos.find()) {
      const antes = Math.round(p.mastery ?? 0);
      // Primero se calcula sin guardar; solo si sube se guarda (nunca se baja un dominio ya ganado).
      const calculado = await servicio.recalculateMastery(
        p.studentId,
        p.learningUnitId,
        null,
        0,
        0,
        false,
        {
          silencioso: true,
          guardar: false,
        },
      );
      const cambio = {
        studentId: p.studentId,
        learningUnitId: p.learningUnitId,
        antes,
        despues: Math.round(calculado.mastery),
      };
      if (!simular && debeGuardarse(cambio)) {
        await servicio.recalculateMastery(
          p.studentId,
          p.learningUnitId,
          null,
          0,
          0,
          false,
          { silencioso: true },
        );
      } else if (!simular && cambio.despues < cambio.antes) {
        // Se conserva: lo ya ganado queda como piso de esa lección, también en sus próximas entregas (10/10).
        await progresos.update(p.id, { dominioConservado: p.mastery });
      }
      cambios.push(cambio);
    }
    console.log(
      `${simular ? '[SIMULACIÓN, no se guardó nada] ' : ''}${resumenCambios(cambios)}`,
    );
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
