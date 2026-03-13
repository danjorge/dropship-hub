import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const OrgId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest();
    return req.orgId;
  },
);
