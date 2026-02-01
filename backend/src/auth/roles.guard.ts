import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Om inga roller krävs, tillåt åtkomst
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Ingen användare hittades');
    }

    const userRole = user.role || Role.VIEWER;
    const hasRole = requiredRoles.includes(userRole as Role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Du har inte behörighet för denna åtgärd. Krävs: ${requiredRoles.join(' eller ')}`,
      );
    }

    return true;
  }
}
