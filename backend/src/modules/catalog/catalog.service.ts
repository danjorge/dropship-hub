import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { OrgType } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateSkuDto } from './dto/create-sku.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async createProduct(supplierOrgId: string, dto: CreateProductDto) {
    const org = await this.prisma.org.findUnique({
      where: { id: supplierOrgId },
      select: { type: true },
    });

    if (!org || org.type !== OrgType.SUPPLIER) {
      throw new ForbiddenException('Only SUPPLIER orgs can create products');
    }

    return this.prisma.product.create({
      data: {
        supplierOrgId,
        title: dto.title,
        description: dto.description,
        brand: dto.brand,
        isActive: dto.isActive ?? true,
        // Brazilian product fields
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

  async getProducts(supplierOrgId: string) {
    return this.prisma.product.findMany({
      where: { supplierOrgId },
      include: {
        skus: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSku(productId: string, supplierOrgId: string, dto: CreateSkuDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { supplierOrgId: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplierOrgId !== supplierOrgId) {
      throw new ForbiddenException('Product does not belong to this org');
    }

    return this.prisma.sku.create({
      data: {
        productId,
        skuCode: dto.skuCode,
        variantJson: (dto.variantJson ?? {}) as never,
        weightGrams: dto.weightGrams,
        lengthCm: dto.lengthCm,
        widthCm: dto.widthCm,
        heightCm: dto.heightCm,
        gtin: dto.gtin,
      },
    });
  }

  async createProductImage(productId: string, supplierOrgId: string, dto: CreateProductImageDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { supplierOrgId: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.supplierOrgId !== supplierOrgId) {
      throw new ForbiddenException('Product does not belong to this org');
    }

    return this.prisma.productImage.create({
      data: {
        productId,
        url: dto.url,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async createOffer(supplierOrgId: string, dto: CreateOfferDto) {
    const org = await this.prisma.org.findUnique({
      where: { id: supplierOrgId },
      select: { type: true },
    });

    if (!org || org.type !== OrgType.SUPPLIER) {
      throw new ForbiddenException('Only SUPPLIER orgs can create offers');
    }

    const sku = await this.prisma.sku.findUnique({
      where: { id: dto.skuId },
      include: { product: true },
    });

    if (!sku) {
      throw new NotFoundException('SKU not found');
    }

    if (sku.product.supplierOrgId !== supplierOrgId) {
      throw new ForbiddenException('SKU does not belong to this org');
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

  async getSuppliers(merchantOrgId: string) {
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

  async getSupplierProducts(merchantOrgId: string, supplierOrgId: string) {
    const relationship = await this.prisma.merchantSupplier.findUnique({
      where: {
        merchantOrgId_supplierOrgId: {
          merchantOrgId,
          supplierOrgId,
        },
      },
    });

    if (!relationship || relationship.status !== 'APPROVED') {
      throw new ForbiddenException('No approved relationship with this supplier');
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
}
