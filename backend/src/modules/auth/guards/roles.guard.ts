import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  SetMetadata,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrgMemberRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: OrgMemberRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<OrgMemberRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.orgRole as OrgMemberRole | undefined;
    const userId = request.userId as string | undefined;
    const orgId = request.orgId as string | undefined;

    if (!userRole) {
      this.logger.warn(
        `RolesGuard: No role found for user ${userId} in org ${orgId}`
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      this.logger.warn(
        `RolesGuard: User ${userId} with role ${userRole} attempted to access endpoint requiring roles: ${requiredRoles.join(', ')}`
      );
      throw new ForbiddenException(
        `This action requires one of the following roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}

