import { PrismaService } from "../common/db/prisma.service";
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    health(): Promise<{
        status: string;
        database: string;
        orgs: number;
        timestamp: Date;
    }>;
}
