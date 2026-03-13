import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { OrgMemberRole } from "@prisma/client";

export const OrgRole = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): OrgMemberRole => {
    const req = ctx.switchToHttp().getRequest();
    return req.orgRole;
  },
);
