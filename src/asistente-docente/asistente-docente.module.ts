import { Module } from '@nestjs/common';
import { TutorModule } from '../tutor/tutor.module';
import { AsistenteDocenteController } from './asistente-docente.controller';
import { AsistenteDocenteService } from './asistente-docente.service';

/** Asistente del docente (docs/PLAN_ASISTENTE_DOCENTE.md): reutiliza la clave cifrada y el acceso a Gemini del Tutor. */
@Module({
  imports: [TutorModule],
  controllers: [AsistenteDocenteController],
  providers: [AsistenteDocenteService],
})
export class AsistenteDocenteModule {}
