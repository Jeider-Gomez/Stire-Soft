// Recalcula el dominio guardado de todas las lecciones con el motor del dominio por evidencia (09/10;
// src/common/utils/motor-dominio.ts, docs/DISENO_DOMINIO.md). El dominio se guarda al entregar, así que un cambio de
// reglas solo llega a cada lección en su próxima entrega; mientras, una lección podía quedar en 96 % «sin salida».
// Se corre UNA vez después de desplegar. No avisa a nadie (no manda notificaciones) y no cuenta intentos.
//
// Uso, en el servidor (docs/DESPLIEGUE.md):
//   node dist/scripts/recalcular-dominio.js --simular   → solo dice qué cambiaría, no guarda nada
//   node dist/scripts/recalcular-dominio.js             → recalcula y guarda
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

/** Resumen en palabras de los cambios (lo que se imprime al final). */
export function resumenCambios(cambios: CambioDominio[]): string {
  const suben = cambios.filter((c) => c.despues > c.antes);
  const bajan = cambios.filter((c) => c.despues < c.antes);
  const llegan100 = suben.filter((c) => c.despues === 100).length;
  return [
    `${cambios.length} lecciones revisadas: ${suben.length} suben (${llegan100} llegan al 100 %), ${bajan.length} bajan y ${cambios.length - suben.length - bajan.length} quedan igual.`,
    ...bajan.map(
      (c) =>
        `  baja: estudiante ${c.studentId}, lección ${c.learningUnitId}: ${c.antes} % → ${c.despues} %`,
    ),
  ].join('\n');
}

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
      const nuevo = await servicio.recalculateMastery(
        p.studentId,
        p.learningUnitId,
        null,
        0,
        0,
        false,
        { silencioso: true, guardar: !simular },
      );
      cambios.push({
        studentId: p.studentId,
        learningUnitId: p.learningUnitId,
        antes,
        despues: Math.round(nuevo.mastery),
      });
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
