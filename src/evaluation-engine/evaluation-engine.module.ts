import { Module } from '@nestjs/common';
import { EvaluationEngineService } from './evaluation-engine.service';

@Module({
  providers: [EvaluationEngineService],
  exports: [EvaluationEngineService],
})
export class EvaluationEngineModule {}
