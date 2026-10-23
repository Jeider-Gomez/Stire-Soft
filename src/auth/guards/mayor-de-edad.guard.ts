import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { MENSAJE_SIN_MAYORIA_DE_EDAD } from '../../user/aceptacion-terminos';

/**
 * El Tutor con Gemini solo para quien confirmó tener 18 años o más: los términos de la API de Gemini lo exigen y
 * prohíben servicios que probablemente usen menores (docs/PLAN_MENORES_Y_TRANSVERSALIDAD.md). Las cuentas de antes del
 * 22/10/2026 confirman una vez en la pantalla de términos.
 */
@Injectable()
export class MayorDeEdadGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user?.mayorDeEdadConfirmadoEn) throw new ForbiddenException(MENSAJE_SIN_MAYORIA_DE_EDAD);
    return true;
  }
}
