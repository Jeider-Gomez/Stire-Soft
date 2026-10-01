import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refuerzo } from './entities/refuerzo.entity';
import { RefuerzoPasoHecho } from './entities/refuerzo-paso-hecho.entity';
import { RefuerzosService } from './refuerzos.service';
import { RefuerzosController } from './refuerzos.controller';
import { Activity } from '../activities/entities/activity.entity';
import { Entrega } from '../proyectos/entities/entrega.entity';
import { ProyectoEnvio } from '../proyectos/entities/proyecto-envio.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { LearningProgress } from '../learning-progress/entities/learning-progress.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { User } from '../user/entities/user.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Refuerzo, RefuerzoPasoHecho, Activity, Entrega, ProyectoEnvio, Enrollment, LearningProgress, Submission, User]),
    AuthorizationModule,
    MessageModule,
  ],
  controllers: [RefuerzosController],
  providers: [RefuerzosService],
})
export class RefuerzosModule {}
