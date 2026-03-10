import { Injectable } from '@nestjs/common';
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

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(orgId: string): Promise<DashboardStats> {
    // Get organization type
    const org = await this.prisma.org.findUnique({
      where: { id: orgId },
      select: { type: true },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    if (org.type === 'SUPPLIER') {
      return this.getSupplierStats(orgId);
    } else if (org.type === 'MERCHANT') {
      return this.getMerchantStats(orgId);
    }

    // Default empty stats
    return this.getEmptyStats();
  }

  private async getSupplierStats(orgId: string): Promise<DashboardStats> {
    // Total products
    const totalProducts = await this.prisma.product.count({
      where: { supplierOrgId: orgId },
    });

    // Mock data for now until Orders/Fulfillments are implemented
    const unpaidOrders = 0;
    const walletBalance = 0;
    const revenueToday = 0;
    const revenueLast7Days = 0;
    const revenueLast30Days = 0;
    const totalRevenue = 0;
    const bestSellingProducts: Array<{
      productId: string;
      productTitle: string;
      totalSold: number;
      revenue: number;
    }> = [];

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

  private async getMerchantStats(orgId: string): Promise<DashboardStats> {
    // Count active listings for this merchant
    const totalProducts = await this.prisma.listing.count({
      where: { merchantOrgId: orgId },
    });

    // Mock data for now until Orders are implemented
    const unpaidOrders = 0; // Will be total orders count
    const walletBalance = 0; // Will be pending supplier payments
    const revenueToday = 0;
    const revenueLast7Days = 0;
    const revenueLast30Days = 0;
    const totalRevenue = 0;
    const bestSellingProducts: Array<{
      productId: string;
      productTitle: string;
      totalSold: number;
      revenue: number;
    }> = [];

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

  private getEmptyStats(): DashboardStats {
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

}
