import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ValoracionLeccion } from './entities/valoracion-leccion.entity';
import { ValorarLeccionDto } from './dto/valorar.dto';
import { LearningUnitService } from '../learning-unit/learning-unit.service';
import { AuthorizationService } from '../common/authorization/authorization.service';
import { User, UserRole } from '../user/entities/user.entity';
import { resumenPorLeccion } from './valoraciones-reglas';

@Injectable()
export class ValoracionesService {
  constructor(
    @InjectRepository(ValoracionLeccion) private readonly repo: Repository<ValoracionLeccion>,
    private readonly lecciones: LearningUnitService,
    private readonly autorizacion: AuthorizationService,
  ) {}

  /** El estudiante vota (o cambia su voto) sobre una lección de una clase en la que está inscrito. */
  async valorar(user: User, learningUnitId: number, dto: ValorarLeccionDto) {
    if (user.role !== UserRole.ESTUDIANTE) throw new ForbiddenException('Solo un estudiante valora una lección.');
    await this.lecciones.findOne(learningUnitId, user); // 403/404 si no está inscrito o no existe
    const comentario = !dto.util && dto.comentario?.trim() ? dto.comentario.trim().slice(0, 300) : null;
    const existente = await this.repo.findOne({ where: { studentId: user.id, learningUnitId } });
    const guardado = await this.repo.save(
      existente
        ? Object.assign(existente, { util: dto.util, comentario })
        : this.repo.create({ studentId: user.id, learningUnitId, util: dto.util, comentario }),
    );
    return { util: guardado.util, comentario: guardado.comentario };
  }

  async mia(user: User, learningUnitId: number) {
    const v = await this.repo.findOne({ where: { studentId: user.id, learningUnitId } });
    return v ? { util: v.util, comentario: v.comentario } : null;
  }

  /** El docente de la clase ve, por lección, cuántos dijeron «Sí» y «No» y qué no quedó claro (sin nombres). */
  async deLaClase(user: User, classId: number) {
    await this.autorizacion.assertTeacherOwnsClass(user, classId);
    const lecciones = await this.lecciones.findByClass(classId);
    if (!lecciones.length) return [];
    const votos = await this.repo
      .createQueryBuilder('v')
      .where('v.learningUnitId IN (:...ids)', { ids: lecciones.map((l) => l.id) })
      .getMany();
    return resumenPorLeccion(lecciones.map((l) => ({ id: l.id, title: l.title })), votos);
  }
}
