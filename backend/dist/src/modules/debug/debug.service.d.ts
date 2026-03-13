import { PrismaService } from '../../common/db/prisma.service';
export declare class DebugService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserOrgs(userId: string): Promise<{
        userId: string;
        orgs: {
            orgId: string;
            name: string;
            type: import("@prisma/client").$Enums.OrgType;
            role: import("@prisma/client").$Enums.OrgMemberRole;
        }[];
    }>;
    getDbHealth(): Promise<{
        status: string;
        counts: {
            users: number;
            orgs: number;
            products: number;
            offers: number;
            listings: number;
            orders: number;
            fulfillments: number;
        };
    }>;
}
