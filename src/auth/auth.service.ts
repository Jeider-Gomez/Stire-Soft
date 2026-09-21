import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RoleRequestsService } from '../role-requests/role-requests.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly roleRequests: RoleRequestsService,
  ) {}

  /**
   * Registrar un nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const { requestedRole, roleRequestReason, ...accountData } = registerDto;
    const wantsTeacher = requestedRole === 'docente';

    // Se valida el correo ANTES de crear la cuenta: un rechazo no deja un usuario a medias.
    if (wantsTeacher) this.roleRequests.assertEmailAllowedForTeacher(accountData.email);

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
