import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { EncuestaSus } from './entities/encuesta-sus.entity';
import { ResponderSusDto } from './dto/responder-sus.dto';
import { debeInvitar, EncuestaInvalidaError, puedeResponder, puntajeSus, resumirSus, validarTareas, type ResumenSus } from './sus';

@Injectable()
export class UsabilidadService {
  constructor(@InjectRepository(EncuestaSus) private readonly encuestas: Repository<EncuestaSus>) {}

  private ultimaDe(userId: number) {
    return this.encuestas.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  /** Si ya respondió, cuándo; si puede responder ahora, y si conviene invitarle (lleva unos días usando STIRE). */
  async estado(user: User, ahora = new Date()) {
    const ultima = await this.ultimaDe(user.id);
    const fecha = ultima?.createdAt ?? null;
    return {
      ultima: fecha,
      puntaje: ultima?.puntaje ?? null,
      puedeResponder: puedeResponder(fecha, ahora),
      invitar: debeInvitar(new Date(user.createdAt), fecha, ahora),
    };
  }

  async responder(user: User, dto: ResponderSusDto, ahora = new Date()) {
    const ultima = await this.ultimaDe(user.id);
    if (!puedeResponder(ultima?.createdAt ?? null, ahora)) {
      throw new ConflictException('Ya respondiste la encuesta hace poco. Podrás volver a responderla más adelante.');
    }
    let tareas: Record<string, number> | null;
    try {
      tareas = validarTareas(user.role, dto.tareas);
    } catch (e) {
      if (e instanceof EncuestaInvalidaError) throw new BadRequestException(e.message);
      throw e;
    }
    const puntaje = puntajeSus(dto.respuestas);
    const comentario = dto.comentario?.trim() ? dto.comentario.trim() : null;
    await this.encuestas.save(this.encuestas.create({ userId: user.id, rol: user.role, respuestas: dto.respuestas, puntaje, comentario, tareas }));
    return { puntaje };
  }

  /** Resultados sin nombres, con la última respuesta de cada persona. */
  async resultados(): Promise<ResumenSus> {
    const todas = await this.encuestas.find({ order: { createdAt: 'DESC' } });
    const vistas = new Set<number>();
    const ultimas = todas.filter((e) => {
      if (vistas.has(e.userId)) return false;
      vistas.add(e.userId);
      return true;
    });
    return resumirSus(ultimas.map((e) => ({ rol: e.rol, respuestas: e.respuestas, puntaje: e.puntaje, comentario: e.comentario, tareas: e.tareas, fecha: e.createdAt })));
  }
}
