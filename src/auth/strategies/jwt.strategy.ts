import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('La variable de entorno JWT_SECRET no está configurada.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any): Promise<User> {
    const { sub: id } = payload;

    const user = (await this.userService.findOne(id)) as any;

    if (!user || !user['isActive']) {
      throw new UnauthorizedException('Usuario inválido o inactivo');
    }

    // Un cambio de contraseña (recuperación o por un admin) invalida las sesiones anteriores.
    const changedAt: Date | null | undefined = user.passwordChangedAt;
    if (changedAt && typeof payload.iat === 'number' && payload.iat < Math.floor(new Date(changedAt).getTime() / 1000)) {
      throw new UnauthorizedException('La sesión venció porque la contraseña cambió. Inicia sesión de nuevo.');
    }

    return user as User;
  }
}