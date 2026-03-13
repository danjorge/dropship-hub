import { PrismaService } from "../../common/db/prisma.service";
export declare class OrgsService {
    private prisma;
    constructor(prisma: PrismaService);
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
