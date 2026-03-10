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
