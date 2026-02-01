import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorator för att enkelt hämta inloggad användare i controllers
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
