import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { RoleRequestsService } from '../role-requests/role-requests.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly roleRequests: RoleRequestsService,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokens: Repository<PasswordResetToken>,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  private static hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  /**
   * «Olvidé mi contraseña». Responde SIEMPRE lo mismo exista o no el correo (no
   * revela qué cuentas existen). El enlace vale 30 minutos, es de un solo uso, y
   * pedir uno nuevo invalida los anteriores; en la base solo queda su hash.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const generic = {
      message: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.',
    };
    const user = await this.userService.findOneByEmail(email.trim()).catch(() => null);
    if (!user || !user.isActive) return generic;

    await this.resetTokens.update({ userId: user.id, usedAt: IsNull() }, { usedAt: new Date() });
    const raw = randomBytes(32).toString('hex');
    await this.resetTokens.save(
      this.resetTokens.create({
        userId: user.id,
        tokenHash: AuthService.hashToken(raw),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        usedAt: null,
      }),
    );

    const base = (this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000').replace(/\/$/, '');
    const link = `${base}/auth/reset-password?token=${raw}`;
    const safeName = user.fullName.replace(/[<>&"]/g, '');
    // Sin await: la respuesta no debe tardar distinto si el correo existe (evita enumeración por tiempo).
    void this.mail
      .send({
        to: user.email,
        subject: 'Restablece tu contraseña de STIRE',
        text:
          `Hola ${safeName},\n\nRecibimos una solicitud para restablecer tu contraseña de STIRE. ` +
          `Abre este enlace (vale 30 minutos y solo funciona una vez):\n\n${link}\n\n` +
          'Si no fuiste tú, ignora este mensaje: tu contraseña no cambia.',
        html:
          `<p>Hola ${safeName},</p>` +
          '<p>Recibimos una solicitud para restablecer tu contraseña de STIRE. El enlace vale 30 minutos y solo funciona una vez:</p>' +
          `<p><a href="${link}">Restablecer mi contraseña</a></p>` +
          '<p>Si no fuiste tú, ignora este mensaje: tu contraseña no cambia.</p>',
      })
      .catch((e) => this.logger.error(`Fallo inesperado al enviar correo: ${e?.message}`));
    return generic;
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<{ message: string }> {
    const invalid = new BadRequestException('El enlace no es válido o ya venció. Solicita uno nuevo.');
    const row = await this.resetTokens.findOne({
      where: { tokenHash: AuthService.hashToken(rawToken), usedAt: IsNull(), expiresAt: MoreThan(new Date()) },
    });
    if (!row) throw invalid;
    // Reclamo atómico: si dos peticiones usan el mismo enlace a la vez, solo una gana.
    const claimed = await this.resetTokens.update({ id: row.id, usedAt: IsNull() }, { usedAt: new Date() });
    if (!claimed.affected) throw invalid;
    await this.userService.resetPassword(row.userId, newPassword);
    return { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
  }

  /**
   * Registrar un nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { requestedRole, roleRequestReason, ...accountData } = registerDto;
    const wantsTeacher = requestedRole === 'docente';

    // Siempre estudiante: el rol no viene del cliente (ValidationPipe rechaza un campo `role`).
    const user = await this.userService.create(accountData);
    const roleRequest = wantsTeacher ? await this.roleRequests.create(user.id, roleRequestReason) : null;

    const token = await this.generateToken(user.id, user.email, user.role);

    // 🔥 Eliminamos password antes de responder
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      access_token: token,
      roleRequest,
    };
  }

  /**
   * Login de usuario
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = await this.generateToken(user.id, user.email, user.role);

    // 🔥 Eliminamos password antes de responder
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      access_token: token,
    };
  }

  /**
   * Generar token JWT
   */
  private async generateToken(
    userId: number,
    email: string,
    role: string,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    return await this.jwtService.signAsync(payload);
  }

  /**
   * Validar token
   */
  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      const user = await this.userService.findOne(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario inválido o inactivo');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
