import { DebugService } from './debug.service';
export declare class DebugController {
    private readonly debugService;
    constructor(debugService: DebugService);
    getMeOrgs(user: {
        id: string;
    }): Promise<{
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
