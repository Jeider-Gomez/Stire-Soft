import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registrar un nuevo usuario
   */
  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);

    const token = await this.generateToken(user.id, user.email, user.role);

    // 🔥 Eliminamos password antes de responder
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
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

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
