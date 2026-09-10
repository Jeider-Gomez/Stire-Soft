import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ExecutionResult } from './entities/execution-result.entity';
import { ExecutionResultsRepository } from './judge-engine.repository';
import { HardenedProcessSandboxAdapter } from './hardened-process-sandbox.adapter';
import { SANDBOX_ADAPTER } from './sandbox-adapter.interface';
import { JUDGE_QUEUE } from './judge-queue.interface';
import { JudgeExecutionService } from './judge-execution.service';
import { InlineJudgeQueueAdapter } from './adapters/inline-judge-queue.adapter';
import { BullJudgeQueueAdapter } from './adapters/bull-judge-queue.adapter';
import { JudgeWorker } from './judge.worker';

// ADR 08 — leido de process.env directamente (no de ConfigService) porque
// los decoradores de modulo se evaluan antes de que exista el contenedor de
// DI. 'dotenv/config' arriba garantiza que .env ya este cargado en este punto
// sin importar el orden de imports del resto de la app.
const QUEUE_DRIVER = process.env.QUEUE_DRIVER === 'redis' ? 'redis' : 'inline';

// Nota de diseño: este modulo NO importa SubmissionsModule. JudgeExecutionService
// reporta el resultado de la calificacion emitiendo 'judge.answer-graded' /
// 'judge.answer-failed' (EventEmitter2 global) en vez de inyectar
// SubmissionsService directamente — evita una dependencia circular real a
// nivel de instancia (SubmissionsService necesita JUDGE_QUEUE, que necesitaria
// JudgeExecutionService, que necesitaria SubmissionsService) y de paso cierra
// el hallazgo de arquitectura de la auditoria sobre llamadas imperativas
// cruzadas entre dominios. El listener que consume estos eventos vive en
// src/submissions/listeners/judge-graded.listener.ts.
@Module({
  imports: [
    ConfigModule,
    EventEmitterModule,
    TypeOrmModule.forFeature([ExecutionResult]),
    // BullModule SOLO se registra en modo redis — antes se importaba
    // incondicionalmente en app.module.ts sin usarse en ningun lado.
    ...(QUEUE_DRIVER === 'redis' ? [BullModule.registerQueue({ name: 'judge' })] : []),
  ],
  providers: [
    ExecutionResultsRepository,
    JudgeExecutionService,
    {
      provide: SANDBOX_ADAPTER,
      useFactory: (configService: ConfigService) => {
        // Fail-closed (P0-05): cualquier valor no reconocido cae en el
        // adaptador endurecido, NUNCA en un mock que finja calificar.
        const type = configService.get<string>('SANDBOX_TYPE', 'hardened');
        switch (type) {
          case 'docker':
            throw new Error(
              'SANDBOX_TYPE=docker no esta implementado (el antiguo DockerSandboxAdapter era un ' +
                'mock que aprobaba codigo por contener la palabra "correct"). Arranque abortado ' +
                'para evitar calificaciones falsas. Use SANDBOX_TYPE=hardened.',
            );
          case 'vm':
          case 'local':
            throw new Error(
              'SANDBOX_TYPE=vm/local esta deshabilitado: node:vm tiene un escape de sandbox ' +
                'confirmado y reproducido (P0-01, lectura de secretos + ejecucion de comandos). ' +
                'Use SANDBOX_TYPE=hardened.',
            );
          case 'hardened':
            return new HardenedProcessSandboxAdapter();
          default:
            throw new Error(
              `SANDBOX_TYPE="${type}" no reconocido. Valores validos: hardened. ` +
                'Arranque abortado en vez de degradar a un adaptador inseguro.',
            );
        }
      },
      inject: [ConfigService],
    },
    {
      provide: JUDGE_QUEUE,
      useFactory: (executionService: JudgeExecutionService, queue?: Queue) => {
        if (QUEUE_DRIVER === 'redis') {
          if (!queue) {
            throw new Error('QUEUE_DRIVER=redis pero no se pudo resolver la cola BullMQ "judge".');
          }
          return new BullJudgeQueueAdapter(queue);
        }
        return new InlineJudgeQueueAdapter(executionService);
      },
      inject:
        QUEUE_DRIVER === 'redis'
          ? [JudgeExecutionService, getQueueToken('judge')]
          : [JudgeExecutionService],
    },
    // El worker de BullMQ solo tiene sentido si hay una cola de la que consumir.
    ...(QUEUE_DRIVER === 'redis' ? [JudgeWorker] : []),
  ],
  // JudgeExecutionService ahora se exporta ademas de via JUDGE_QUEUE: el
  // endpoint "Probar código" (SubmissionsService.runPublicCases) necesita
  // invocar runPublicCases() directamente, sin pasar por la cola de
  // calificación — esa ruta es solo para gradeAnswer().
  exports: [ExecutionResultsRepository, JUDGE_QUEUE, JudgeExecutionService],
})
export class JudgeEngineModule {}
