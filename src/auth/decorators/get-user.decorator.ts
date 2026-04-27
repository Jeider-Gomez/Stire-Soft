import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador personalizado para extraer el usuario del request
 * Uso: @GetUser() user: User
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);