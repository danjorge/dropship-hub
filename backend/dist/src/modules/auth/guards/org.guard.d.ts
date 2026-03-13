import { CanActivate, ExecutionContext } from "@nestjs/common";
import { PrismaService } from "../../../common/db/prisma.service";
export declare class OrgGuard implements CanActivate {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
