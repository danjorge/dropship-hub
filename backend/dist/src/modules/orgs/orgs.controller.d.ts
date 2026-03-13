import { OrgsService } from "./orgs.service";
export declare class OrgsController {
    private readonly orgsService;
    constructor(orgsService: OrgsService);
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        members: {
            orgId: string;
            role: import("@prisma/client").$Enums.OrgMemberRole;
            userId: string;
        }[];
    } & {
        id: string;
        name: string;
        type: import("@prisma/client").$Enums.OrgType;
        createdAt: Date;
    })[]>;
}
