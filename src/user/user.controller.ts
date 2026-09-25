import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAffiliationDto } from './dto/create-affiliation.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from './entities/user.entity';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Solo admin: crear cuentas de terceros fuera del auto-registro publico.
  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('me/affiliations')
  addAffiliation(
    @GetUser() user: User,
    @Body() dto: CreateAffiliationDto,
  ) {
    return this.userService.addAffiliation(user.id, dto);
  }

  // Rutas /me* declaradas ANTES de las rutas con :id para que 'me' no sea
  // capturado como valor del parametro :id.
  @Patch('me')
  updateProfile(@GetUser() user: User, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, updateProfileDto);
  }

  // P1-03: verificacion de credenciales, fuerza-brutable igual que el login.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch('me/password')
  async changePassword(@GetUser() user: User, @Body() changePasswordDto: ChangePasswordDto) {
    const result = await this.userService.changePassword(user.id, changePasswordDto);
    // F24-10: cambiar la clave cierra las OTRAS sesiones (sus tokens quedan anteriores a `passwordChangedAt`). La sesión que hizo el
    // cambio recibe un token nuevo para no quedarse fuera. (Se firma aquí con el JwtService global de AuthModule; mismo payload que el login.)
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwtService.signAsync(payload);
    return { ...result, token: access_token, access_token };
  }

  // Listado completo de la institución: solo admin. Un docente ve a sus
  // estudiantes por GET /enrollment/class/:id, no enumerando todas las cuentas
  // (correos de estudiantes de otras clases, de otros docentes y de admins).
  @Roles('admin')
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((u) => UserResponseDto.fromEntity(u));
  }

  // Lectura individual: admin, o el propio usuario. Nunca enumeracion libre.
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() requester: User,
  ): Promise<UserResponseDto> {
    if (requester.role !== UserRole.ADMIN && requester.id !== id) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }
    const found = await this.userService.findOne(id);
    return UserResponseDto.fromEntity(found);
  }

  // Administracion de terceros — SOLO admin. El :id nunca representa al
  // propio solicitante (para eso estan PATCH /users/me y /users/me/password).
  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() adminUpdateUserDto: AdminUpdateUserDto, @GetUser() admin: User) {
    return this.userService.update(id, adminUpdateUserDto, admin.id);
  }

  @Roles('admin')
  @Patch(':id/role')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto, @GetUser() admin: User) {
    return this.userService.updateRole(id, dto.role, admin.id);
  }
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() admin: User) {
    return this.userService.remove(id, admin.id);
  }
}
