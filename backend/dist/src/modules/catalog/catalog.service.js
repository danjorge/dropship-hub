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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
const client_1 = require("@prisma/client");
let CatalogService = class CatalogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createProduct(supplierOrgId, dto) {
        const org = await this.prisma.org.findUnique({
            where: { id: supplierOrgId },
            select: { type: true },
        });
        if (!org || org.type !== client_1.OrgType.SUPPLIER) {
            throw new common_1.ForbiddenException('Only SUPPLIER orgs can create products');
        }
        return this.prisma.product.create({
            data: {
                supplierOrgId,
                title: dto.title,
                description: dto.description,
                brand: dto.brand,
                isActive: dto.isActive ?? true,
                codigo: dto.codigo,
                unidade: dto.unidade,
                ncm: dto.ncm,
                origem: dto.origem,
                preco: dto.preco,
                valorIpiFixo: dto.valorIpiFixo,
                observacoes: dto.observacoes,
                situacao: dto.situacao,
                estoque: dto.estoque,
                precosDeCusto: dto.precosDeCusto,
                codNoFornecedor: dto.codNoFornecedor,
                fornecedor: dto.fornecedor,
                localizacao: dto.localizacao,
                estoqueMaximo: dto.estoqueMaximo,
                estoqueMinimo: dto.estoqueMinimo,
                pesoLiquidoKg: dto.pesoLiquidoKg,
                pesoBrutoKg: dto.pesoBrutoKg,
                gtinEan: dto.gtinEan,
                gtinEanDaEmbalagem: dto.gtinEanDaEmbalagem,
                larguraDoProduto: dto.larguraDoProduto,
                alturaDoProduto: dto.alturaDoProduto,
                profundidadeDoProduto: dto.profundidadeDoProduto,
                dataDeValidade: dto.dataDeValidade,
                descricaoDoProdutoNoFornecedor: dto.descricaoDoProdutoNoFornecedor,
                descricaoComplementar: dto.descricaoComplementar,
                itensPorCaixa: dto.itensPorCaixa,
                produtoVariacao: dto.produtoVariacao,
                tipoProducao: dto.tipoProducao,
                classeDeEnquadramentoDoIpi: dto.classeDeEnquadramentoDoIpi,
                codigoListaDeServicos: dto.codigoListaDeServicos,
                tipoDoItem: dto.tipoDoItem,
                grupoDeTags: dto.grupoDeTags,
                tributos: dto.tributos,
                codigoPai: dto.codigoPai,
                codigoIntegracao: dto.codigoIntegracao,
                grupoDeProdutos: dto.grupoDeProdutos,
                cest: dto.cest,
                volumes: dto.volumes,
                descricaoCurta: dto.descricaoCurta,
                crossDocking: dto.crossDocking,
                urlImagensExternas: dto.urlImagensExternas,
                linkExterno: dto.linkExterno,
                mesesGarantiaFornecedor: dto.mesesGarantiaFornecedor,
                clonarDadosDoPai: dto.clonarDadosDoPai,
                condicaoDoProduto: dto.condicaoDoProduto,
                freteGratis: dto.freteGratis,
                numeroFci: dto.numeroFci,
                video: dto.video,
                departamento: dto.departamento,
                unidadeDeMedida: dto.unidadeDeMedida,
                precoDeCompra: dto.precoDeCompra,
                valorBaseIcsmStParaRetencao: dto.valorBaseIcsmStParaRetencao,
                valorIcmsStParaRetencao: dto.valorIcmsStParaRetencao,
                valorIcmsProprioDoSubstituto: dto.valorIcmsProprioDoSubstituto,
                categoriaDoProduto: dto.categoriaDoProduto,
                informacoesAdicionais: dto.informacoesAdicionais,
            },
            include: {
                skus: true,
                images: true,
            },
        });
    }
    async getProducts(supplierOrgId) {
        return this.prisma.product.findMany({
            where: { supplierOrgId },
            include: {
                skus: true,
                images: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createSku(productId, supplierOrgId, dto) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { supplierOrgId: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.supplierOrgId !== supplierOrgId) {
            throw new common_1.ForbiddenException('Product does not belong to this org');
        }
        return this.prisma.sku.create({
            data: {
                productId,
                skuCode: dto.skuCode,
                variantJson: (dto.variantJson ?? {}),
                weightGrams: dto.weightGrams,
                lengthCm: dto.lengthCm,
                widthCm: dto.widthCm,
                heightCm: dto.heightCm,
                gtin: dto.gtin,
            },
        });
    }
    async createProductImage(productId, supplierOrgId, dto) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { supplierOrgId: true },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (product.supplierOrgId !== supplierOrgId) {
            throw new common_1.ForbiddenException('Product does not belong to this org');
        }
        return this.prisma.productImage.create({
            data: {
                productId,
                url: dto.url,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
    }
    async createOffer(supplierOrgId, dto) {
        const org = await this.prisma.org.findUnique({
            where: { id: supplierOrgId },
            select: { type: true },
        });
        if (!org || org.type !== client_1.OrgType.SUPPLIER) {
            throw new common_1.ForbiddenException('Only SUPPLIER orgs can create offers');
        }
        const sku = await this.prisma.sku.findUnique({
            where: { id: dto.skuId },
            include: { product: true },
        });
        if (!sku) {
            throw new common_1.NotFoundException('SKU not found');
        }
        if (sku.product.supplierOrgId !== supplierOrgId) {
            throw new common_1.ForbiddenException('SKU does not belong to this org');
        }
        return this.prisma.supplierOffer.create({
            data: {
                skuId: dto.skuId,
                supplierOrgId,
                costCents: dto.costCents,
                msrpCents: dto.msrpCents,
                stockQty: dto.stockQty,
                slaDays: dto.slaDays ?? 2,
                shipsFrom: dto.shipsFrom,
                allowRandomColor: dto.allowRandomColor ?? false,
            },
            include: {
                sku: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
    async getSuppliers(merchantOrgId) {
        const approvedSuppliers = await this.prisma.merchantSupplier.findMany({
            where: {
                merchantOrgId,
                status: 'APPROVED',
            },
            include: {
                supplier: true,
            },
        });
        return approvedSuppliers.map((ms) => ms.supplier);
    }
    async getSupplierProducts(merchantOrgId, supplierOrgId) {
        const relationship = await this.prisma.merchantSupplier.findUnique({
            where: {
                merchantOrgId_supplierOrgId: {
                    merchantOrgId,
                    supplierOrgId,
                },
            },
        });
        if (!relationship || relationship.status !== 'APPROVED') {
            throw new common_1.ForbiddenException('No approved relationship with this supplier');
        }
        const products = await this.prisma.product.findMany({
            where: {
                supplierOrgId,
                isActive: true,
            },
            include: {
                skus: {
                    include: {
                        offers: {
                            where: {
                                supplierOrgId,
                            },
                        },
                    },
                },
                images: true,
            },
        });
        return products;
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map