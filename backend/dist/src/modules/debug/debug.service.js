"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
let DebugService = class DebugService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserOrgs(userId) {
        const memberships = await this.prisma.orgMember.findMany({
            where: { userId },
            include: {
                org: true,
            },
        });
        return {
            userId,
            orgs: memberships.map((m) => ({
                orgId: m.orgId,
                name: m.org.name,
                type: m.org.type,
                role: m.role,
            })),
        };
    }
    async getDbHealth() {
        const [usersCount, orgsCount, productsCount, offersCount, listingsCount, ordersCount, fulfillmentsCount,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.org.count(),
            this.prisma.product.count(),
            this.prisma.supplierOffer.count(),
            this.prisma.listing.count(),
            this.prisma.marketplaceOrder.count(),
            this.prisma.fulfillmentOrder.count(),
        ]);
        return {
            status: 'healthy',
            counts: {
                users: usersCount,
                orgs: orgsCount,
                products: productsCount,
                offers: offersCount,
                listings: listingsCount,
                orders: ordersCount,
                fulfillments: fulfillmentsCount,
            },
        };
    }
};
exports.DebugService = DebugService;
exports.DebugService = DebugService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DebugService);
//# sourceMappingURL=debug.service.js.map