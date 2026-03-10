import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';

@Injectable()
export class DebugService {
  constructor(private prisma: PrismaService) {}

  async getUserOrgs(userId: string) {
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
    const [
      usersCount,
      orgsCount,
      productsCount,
      offersCount,
      listingsCount,
      ordersCount,
      fulfillmentsCount,
    ] = await Promise.all([
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
}
