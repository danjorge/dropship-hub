import { PrismaService } from '../../common/db/prisma.service';
export interface DashboardStats {
    totalProducts: number;
    unpaidOrders: number;
    walletBalance: number;
    revenueToday: number;
    revenueLast7Days: number;
    revenueLast30Days: number;
    totalRevenue: number;
    bestSellingProducts: Array<{
        productId: string;
        productTitle: string;
        totalSold: number;
        revenue: number;
    }>;
}
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(orgId: string): Promise<DashboardStats>;
    private getSupplierStats;
    private getMerchantStats;
    private getEmptyStats;
}
