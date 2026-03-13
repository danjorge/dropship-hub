import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { OrgType, Provider } from '@prisma/client';
import { CreateListingDto } from './dto/create-listing.dto';
import { GetListingsDto } from './dto/get-listings.dto';
import { IntegrationsService } from '../integrations/integrations.service';

export interface ListingsResponse {
  providers: Provider[];
  items: Array<{
    id: string;
    provider: Provider;
    title: string;
    priceCents: number;
    isActive: boolean;
    syncStatus: string;
    externalListingId: string | null;
    createdAt: Date;
    supplierOffer: {
      id: string;
      sku: {
        id: string;
        skuCode: string;
        product: {
          id: string;
          title: string;
        };
      };
    };
  }>;
  total: number;
}

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
  ) {}

  async createListing(merchantOrgId: string, dto: CreateListingDto) {
    const org = await this.prisma.org.findUnique({
      where: { id: merchantOrgId },
      select: { type: true },
    });

    if (!org || org.type !== OrgType.MERCHANT) {
      throw new ForbiddenException('Only MERCHANT orgs can create listings');
    }

    // Validate that the provider is connected and active
    const isProviderActive = await this.integrationsService.isProviderActive(
      merchantOrgId,
      dto.provider,
    );

    if (!isProviderActive) {
      throw new BadRequestException(
        `Provider ${dto.provider} is not connected or not active. Please connect the marketplace integration first.`,
      );
    }

    const offer = await this.prisma.supplierOffer.findUnique({
      where: { id: dto.supplierOfferId },
      include: {
        sku: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException('Supplier offer not found');
    }

    const relationship = await this.prisma.merchantSupplier.findUnique({
      where: {
        merchantOrgId_supplierOrgId: {
          merchantOrgId,
          supplierOrgId: offer.supplierOrgId,
        },
      },
    });

    if (!relationship || relationship.status !== 'APPROVED') {
      throw new ForbiddenException('No approved relationship with this supplier');
    }

    return this.prisma.listing.create({
      data: {
        merchantOrgId,
        supplierOfferId: dto.supplierOfferId,
        provider: dto.provider,
        title: dto.title,
        priceCents: dto.priceCents,
        syncStatus: 'PENDING',
      },
      include: {
        supplierOffer: {
          include: {
            sku: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  async getListings(
    merchantOrgId: string,
    filters: GetListingsDto,
  ): Promise<ListingsResponse> {
    // Verify org is MERCHANT
    const org = await this.prisma.org.findUnique({
      where: { id: merchantOrgId },
      select: { type: true },
    });

    if (!org || org.type !== OrgType.MERCHANT) {
      throw new ForbiddenException('Only MERCHANT orgs can access listings');
    }

    // Get available providers (connected integrations)
    const availableProviders = await this.integrationsService.getAvailableProviders(
      merchantOrgId,
    );

    // If provider filter is specified, validate it's connected
    if (filters.provider) {
      if (!availableProviders.includes(filters.provider)) {
        throw new BadRequestException(
          `Provider ${filters.provider} is not connected. Please connect the marketplace integration first.`,
        );
      }
    }

    // Build where clause
    const where: any = {
      merchantOrgId,
    };

    // Only show listings for connected providers
    if (availableProviders.length > 0) {
      if (filters.provider) {
        // Filter by specific provider if requested
        where.provider = filters.provider;
      } else {
        // Show all listings from connected providers
        where.provider = {
          in: availableProviders,
        };
      }
    } else {
      // No integrations connected, return empty
      return {
        providers: [],
        items: [],
        total: 0,
      };
    }

    // Apply additional filters
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.syncStatus) {
      where.syncStatus = filters.syncStatus;
    }

    if (filters.search) {
      where.title = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    // Fetch listings
    const items = await this.prisma.listing.findMany({
      where,
      include: {
        supplierOffer: {
          include: {
            sku: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      providers: availableProviders,
      items,
      total: items.length,
    };
  }
}
