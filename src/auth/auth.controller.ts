import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  // El alta de cuentas escribe credenciales y puede ser abusada para llenar
  // la base de datos; no debe depender solo del límite global.
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  // P1-03: sin este límite específico, /auth/login solo dependía del límite
  // global de 100/min (y ese guard ni siquiera estaba registrado hasta este
  // mismo bloque) — abierto a fuerza bruta de contraseñas.
  // Límite por IP: con 5/min, un salón de 30 estudiantes tras la misma red de la
  // universidad quedaba bloqueado casi completo al iniciar la clase (simulación
  // del 23/09). 20/min sigue frenando la fuerza bruta sin castigar un salón.
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  // Sin este límite específico alguien podría llenar buzones ajenos con correos.
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.token, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: User) {
    return {
      user: user,
    };
  }
}
