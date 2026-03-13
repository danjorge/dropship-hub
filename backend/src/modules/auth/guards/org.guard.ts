import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../../common/db/prisma.service";
import { OrgType } from "@prisma/client";

@Injectable()
export class OrgGuard implements CanActivate {
  private readonly logger = new Logger(OrgGuard.name);

  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user as { id: string; email: string } | undefined;
    if (!user?.id) {
      this.logger.warn('OrgGuard: No user found in request');
      return false;
    }

    const orgId = (req.headers["x-org-id"] as string | undefined)?.trim();
    if (!orgId) {
      this.logger.warn(`OrgGuard: Missing x-org-id header for user ${user.id}`);
      throw new BadRequestException("Missing x-org-id header");
    }

    // Validate UUID format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orgId)) {
      this.logger.warn(`OrgGuard: Invalid orgId format: ${orgId} for user ${user.id}`);
      throw new BadRequestException("Invalid organization ID format");
    }

    // Fetch membership with org details for enhanced security checks
    const membership = await this.prisma.orgMember.findUnique({
      where: { orgId_userId: { orgId, userId: user.id } },
      select: { 
        role: true,
        org: {
          select: {
            id: true,
            type: true,
            name: true,
          }
        }
      },
    });

    if (!membership) {
      // Log forbidden access attempt for security monitoring
      this.logger.warn(
        `OrgGuard: Forbidden access attempt - User ${user.id} (${user.email}) tried to access org ${orgId}`
      );
      throw new ForbiddenException("User is not a member of this organization");
    }

    // Attach org context to request for controllers and services
    req.orgId = orgId;
    req.orgRole = membership.role;
    req.orgType = membership.org.type;
    req.userId = user.id;

    return true;
  }
}