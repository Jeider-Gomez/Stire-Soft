import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { DecideRoleRequestDto } from './dto/role-request.dto';
import { RoleRequest, RoleRequestStatus } from './entities/role-request.entity';

export interface RoleRequestView {
  id: number;
  status: RoleRequestStatus;
  requestedRole: 'docente';
  reason: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  reviewNote: string | null;
  user?: { id: number; email: string; fullName: string; role: UserRole };
}

@Injectable()
export class RoleRequestsService {
  private readonly logger = new Logger(RoleRequestsService.name);

  constructor(
    @InjectRepository(RoleRequest) private readonly repo: Repository<RoleRequest>,
    private readonly config: ConfigService,
  ) {}

  /**
   * Restringe quién puede PEDIR el rol docente por dominio de correo. `TEACHER_EMAIL_DOMAINS` es una
   * lista separada por comas (por ejemplo `unicor.edu.co`); vacía o ausente = sin restricción. Se evalúa
   * antes de crear la cuenta, para que un rechazo no deje un usuario a medias.
   */
  assertEmailAllowedForTeacher(email: string): void {
    const allowed = (this.config.get<string>('TEACHER_EMAIL_DOMAINS') ?? '')
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);
    if (allowed.length === 0) return;
    const domain = email.split('@').pop()?.toLowerCase() ?? '';
    if (!allowed.includes(domain)) {
      throw new BadRequestException(
        `Para solicitar el rol docente usa tu correo institucional (${allowed.map((d) => '@' + d).join(', ')}).`,
      );
    }
  }

  async create(userId: number, reason?: string | null): Promise<RoleRequestView> {
    const pending = await this.repo.findOne({ where: { userId, status: 'pending' } });
    if (pending) throw new ConflictException('Ya tienes una solicitud de rol docente pendiente');
    const saved = await this.repo.save(
      this.repo.create({ userId, requestedRole: 'docente', status: 'pending', reason: reason?.trim() || null }),
    );
    return this.toView(saved);
  }

  /** La solicitud más reciente del propio usuario (o null si nunca pidió el rol). */
  async findMine(userId: number): Promise<RoleRequestView | null> {
    const latest = await this.repo.findOne({ where: { userId }, order: { createdAt: 'DESC', id: 'DESC' } });
    return latest ? this.toView(latest) : null;
  }

  async list(status?: RoleRequestStatus): Promise<RoleRequestView[]> {
    const rows = await this.repo.find({
      where: status ? { status } : {},
      relations: ['user'],
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    return rows.map((r) => this.toView(r, true));
  }

  /** Aprobar convierte al solicitante en docente (solo si hoy es estudiante); rechazar no toca su rol. */
  async decide(id: number, dto: DecideRoleRequestDto, adminId: number): Promise<RoleRequestView> {
    return this.repo.manager.transaction(async (manager) => {
      const request = await manager.findOne(RoleRequest, { where: { id }, relations: ['user'] });
      if (!request) throw new NotFoundException('Solicitud no encontrada');
      if (request.status !== 'pending') throw new ConflictException('Esta solicitud ya fue resuelta');

      const approve = dto.decision === 'approve';
      request.status = approve ? 'approved' : 'rejected';
      request.reviewedById = adminId;
      request.reviewedAt = new Date();
      request.reviewNote = dto.note?.trim() || null;

      if (approve && request.user.role === UserRole.ESTUDIANTE) {
        request.user.role = UserRole.DOCENTE;
        await manager.save(User, request.user);
      }
      await manager.save(RoleRequest, request);
      this.logger.log(`Solicitud ${id} de rol docente ${approve ? 'aprobada' : 'rechazada'} por el admin ${adminId}.`);
      return this.toView(request, true);
    });
  }

  private toView(r: RoleRequest, withUser = false): RoleRequestView {
    return {
      id: r.id,
      status: r.status,
      requestedRole: r.requestedRole,
      reason: r.reason,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      reviewNote: r.reviewNote,
      ...(withUser && r.user
        ? { user: { id: r.user.id, email: r.user.email, fullName: r.user.fullName, role: r.user.role } }
        : {}),
    };
  }
}
