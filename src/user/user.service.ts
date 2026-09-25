import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { UserAffiliation } from './entities/user-affiliation.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAffiliationDto } from './dto/create-affiliation.dto';
import { InstitutionService } from '../institution/institution.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserAffiliation)
    private readonly affiliationRepository: Repository<UserAffiliation>,
    private readonly institutionService: InstitutionService,
  ) {}
  /**
   * Crear un nuevo usuario
   * Encripta la contraseña antes de guardarla
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear nueva instancia de usuario
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Guardar en la base de datos
    return await this.userRepository.save(user);
  }

  /**
   * Obtener todos los usuarios
   * No incluye las contraseñas
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * Obtener un usuario por ID
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return user;
  }

  /**
   * Buscar usuario por email
   * Incluye la contraseña (para autenticación)
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'fullName', 'role', 'isActive'],
    });
  }

  /**
   * Actualizar un usuario (uso exclusivo de administradores sobre terceros).
   * Ver updateProfile/changePassword para la auto-edición del propio usuario.
   */
  async update(id: number, adminUpdateUserDto: AdminUpdateUserDto, actorId?: number): Promise<User> {
    const user = await this.findOne(id);

    // Un admin no puede quitarse el rol ni desactivar su propia cuenta (así nunca se queda sin admins).
    if (actorId !== undefined && (adminUpdateUserDto.role !== undefined || adminUpdateUserDto.isActive === false)) {
      this.assertNotSelf(actorId, id);
    }

    // Si se actualiza la contraseña, encriptarla
    if (adminUpdateUserDto.password) {
      adminUpdateUserDto.password = await bcrypt.hash(adminUpdateUserDto.password, 10);
      user.passwordChangedAt = new Date();
    }

    // Actualizar los campos
    Object.assign(user, adminUpdateUserDto);

    return await this.userRepository.save(user);
  }

  /**
   * Auto-edición de perfil: solo campos no sensibles (fullName).
   * El id SIEMPRE viene del JWT del solicitante, nunca de un parámetro de ruta.
   */
  async updateProfile(id: number, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateProfileDto);
    return await this.userRepository.save(user);
  }

  /**
   * Cambio de contraseña del propio usuario. Exige la contraseña actual.
   */
  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    // F24-10: marca el cambio para que los tokens emitidos ANTES dejen de valer (JwtStrategy compara `iat` con esta fecha).
    // El controlador emite un token nuevo para la sesión que hizo el cambio.
    user.passwordChangedAt = new Date();
    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada con éxito' };
  }

  /**
   * Restablece la contraseña (recuperación por correo). Marca `passwordChangedAt`
   * para que los JWT anteriores dejen de valer.
   */
  async resetPassword(id: number, newPassword: string): Promise<void> {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update({ id }, { password: hashed, passwordChangedAt: new Date() });
  }

  /**
   * Actualizar el rol de un usuario
   */
  async updateRole(id: number, role: UserRole, actorId?: number): Promise<{ message: string }> {
    if (actorId !== undefined) this.assertNotSelf(actorId, id);
    const user = await this.findOne(id);

    user.role = role;
    await this.userRepository.save(user);

    return { message: 'Rol de usuario actualizado con éxito' };
  }

  /**
   * Agregar afiliación académica a un usuario
   */
  async addAffiliation(userId: number, data: CreateAffiliationDto) {
    const user = await this.findOne(userId);
    const program = await this.institutionService.findProgramById(data.programId);

    const affiliation = this.affiliationRepository.create({
      user,
      program,
      roleType: data.roleType,
      currentSemester: data.currentSemester,
    });

    return await this.affiliationRepository.save(affiliation);
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  /** Regla común: sobre la propia cuenta el admin no cambia rol, no la desactiva ni la elimina. */
  private assertNotSelf(actorId: number, targetId: number): void {
    if (actorId === targetId) {
      throw new ForbiddenException('No puedes cambiar tu propio rol ni desactivar o eliminar tu propia cuenta');
    }
  }

  async remove(id: number, actorId?: number): Promise<void> {
    if (actorId !== undefined) this.assertNotSelf(actorId, id);
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }
}