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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(orgId) {
        const org = await this.prisma.org.findUnique({
            where: { id: orgId },
            select: { type: true },
        });
        if (!org) {
            throw new Error('Organization not found');
        }
        if (org.type === 'SUPPLIER') {
            return this.getSupplierStats(orgId);
        }
        else if (org.type === 'MERCHANT') {
            return this.getMerchantStats(orgId);
        }
        return this.getEmptyStats();
    }
    async getSupplierStats(orgId) {
        const totalProducts = await this.prisma.product.count({
            where: { supplierOrgId: orgId },
        });
        const unpaidOrders = 0;
        const walletBalance = 0;
        const revenueToday = 0;
        const revenueLast7Days = 0;
        const revenueLast30Days = 0;
        const totalRevenue = 0;
        const bestSellingProducts = [];
        return {
            totalProducts,
            unpaidOrders,
            walletBalance,
            revenueToday,
            revenueLast7Days,
            revenueLast30Days,
            totalRevenue,
            bestSellingProducts,
        };
    }
    async getMerchantStats(orgId) {
        const totalProducts = await this.prisma.listing.count({
            where: { merchantOrgId: orgId },
        });
        const unpaidOrders = 0;
        const walletBalance = 0;
        const revenueToday = 0;
        const revenueLast7Days = 0;
        const revenueLast30Days = 0;
        const totalRevenue = 0;
        const bestSellingProducts = [];
        return {
            totalProducts,
            unpaidOrders,
            walletBalance,
            revenueToday,
            revenueLast7Days,
            revenueLast30Days,
            totalRevenue,
            bestSellingProducts,
        };
    }
    getEmptyStats() {
        return {
            totalProducts: 0,
            unpaidOrders: 0,
            walletBalance: 0,
            revenueToday: 0,
            revenueLast7Days: 0,
            revenueLast30Days: 0,
            totalRevenue: 0,
            bestSellingProducts: [],
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map