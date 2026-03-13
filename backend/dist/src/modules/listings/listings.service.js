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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
const client_1 = require("@prisma/client");
const integrations_service_1 = require("../integrations/integrations.service");
let ListingsService = class ListingsService {
    constructor(prisma, integrationsService) {
        this.prisma = prisma;
        this.integrationsService = integrationsService;
    }
    async createListing(merchantOrgId, dto) {
        const org = await this.prisma.org.findUnique({
            where: { id: merchantOrgId },
            select: { type: true },
        });
        if (!org || org.type !== client_1.OrgType.MERCHANT) {
            throw new common_1.ForbiddenException('Only MERCHANT orgs can create listings');
        }
        const isProviderActive = await this.integrationsService.isProviderActive(merchantOrgId, dto.provider);
        if (!isProviderActive) {
            throw new common_1.BadRequestException(`Provider ${dto.provider} is not connected or not active. Please connect the marketplace integration first.`);
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
            throw new common_1.NotFoundException('Supplier offer not found');
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
            throw new common_1.ForbiddenException('No approved relationship with this supplier');
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
    async getListings(merchantOrgId, filters) {
        const org = await this.prisma.org.findUnique({
            where: { id: merchantOrgId },
            select: { type: true },
        });
        if (!org || org.type !== client_1.OrgType.MERCHANT) {
            throw new common_1.ForbiddenException('Only MERCHANT orgs can access listings');
        }
        const availableProviders = await this.integrationsService.getAvailableProviders(merchantOrgId);
        if (filters.provider) {
            if (!availableProviders.includes(filters.provider)) {
                throw new common_1.BadRequestException(`Provider ${filters.provider} is not connected. Please connect the marketplace integration first.`);
            }
        }
        const where = {
            merchantOrgId,
        };
        if (availableProviders.length > 0) {
            if (filters.provider) {
                where.provider = filters.provider;
            }
            else {
                where.provider = {
                    in: availableProviders,
                };
            }
        }
        else {
            return {
                providers: [],
                items: [],
                total: 0,
            };
        }
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
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        integrations_service_1.IntegrationsService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map