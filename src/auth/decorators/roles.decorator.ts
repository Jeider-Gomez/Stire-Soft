import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para especificar roles requeridos
 * Uso: @Roles('admin', 'moderator')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);