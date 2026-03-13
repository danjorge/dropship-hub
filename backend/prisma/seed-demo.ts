import { PrismaClient, OrgType, OrgMemberRole, Provider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting demo seed...');

  // Clean existing demo data
  console.log('🧹 Cleaning existing demo data...');
  await prisma.integration.deleteMany({
    where: {
      org: {
        name: {
          in: ['Demo Store', 'Demo Supplier Co.']
        }
      }
    }
  });
  
  await prisma.orgMember.deleteMany({
    where: {
      user: {
        email: {
          in: ['demo-merchant@dropshiphub.com', 'demo-supplier@dropshiphub.com']
        }
      }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['demo-merchant@dropshiphub.com', 'demo-supplier@dropshiphub.com']
      }
    }
  });

  await prisma.org.deleteMany({
    where: {
      name: {
        in: ['Demo Store', 'Demo Supplier Co.']
      }
    }
  });

  // Create Demo Merchant User
  console.log('👤 Creating demo merchant user...');
  const merchantPasswordHash = await bcrypt.hash('DemoMerchant2024!', 10);
  const merchantUser = await prisma.user.create({
    data: {
      email: 'demo-merchant@dropshiphub.com',
      passwordHash: merchantPasswordHash,
      fullName: 'Demo Merchant User',
    },
  });

  // Create Demo Supplier User
  console.log('👤 Creating demo supplier user...');
  const supplierPasswordHash = await bcrypt.hash('DemoSupplier2024!', 10);
  const supplierUser = await prisma.user.create({
    data: {
      email: 'demo-supplier@dropshiphub.com',
      passwordHash: supplierPasswordHash,
      fullName: 'Demo Supplier User',
    },
  });

  // Create Merchant Organization
  console.log('🏢 Creating merchant organization...');
  const merchantOrg = await prisma.org.create({
    data: {
      name: 'Demo Store',
      type: OrgType.MERCHANT,
    },
  });

  // Create Supplier Organization
  console.log('🏢 Creating supplier organization...');
  const supplierOrg = await prisma.org.create({
    data: {
      name: 'Demo Supplier Co.',
      type: OrgType.SUPPLIER,
    },
  });

  // Add merchant user to merchant org
  console.log('🔗 Linking merchant user to organization...');
  await prisma.orgMember.create({
    data: {
      orgId: merchantOrg.id,
      userId: merchantUser.id,
      role: OrgMemberRole.OWNER,
    },
  });

  // Add supplier user to supplier org
  console.log('🔗 Linking supplier user to organization...');
  await prisma.orgMember.create({
    data: {
      orgId: supplierOrg.id,
      userId: supplierUser.id,
      role: OrgMemberRole.OWNER,
    },
  });

  // Create demo Mercado Livre integration (ACTIVE state to show multi-platform capability)
  console.log('🔌 Creating demo Mercado Livre integration (ACTIVE)...');
  await prisma.integration.create({
    data: {
      orgId: merchantOrg.id,
      provider: Provider.MERCADOLIVRE,
      status: 'ACTIVE',
      credentialsEnc: 'demo_meli_credentials_encrypted', // Demo encrypted credentials
    },
  });

  // Create demo Shopee integration (ACTIVE state with mock credentials for ISV review)
  console.log('🔌 Creating demo Shopee integration (ACTIVE - DEMO MODE)...');
  await prisma.integration.create({
    data: {
      orgId: merchantOrg.id,
      provider: Provider.SHOPEE,
      status: 'ACTIVE',
      credentialsEnc: JSON.stringify({
        access_token: 'DEMO_ACCESS_TOKEN_FOR_ISV_REVIEW',
        refresh_token: 'DEMO_REFRESH_TOKEN_FOR_ISV_REVIEW',
        shop_id: 'DEMO_SHOP_123',
        expires_at: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
      }),
    },
  });

  // Create some demo products from supplier
  console.log('📦 Creating demo products...');
  const product1 = await prisma.product.create({
    data: {
      supplierOrgId: supplierOrg.id,
      title: 'Smartphone XYZ Pro',
      description: 'Latest smartphone with 128GB storage and 5G connectivity',
      brand: 'TechBrand',
      isActive: true,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      supplierOrgId: supplierOrg.id,
      title: 'Wireless Headphones Premium',
      description: 'Noise-cancelling wireless headphones with 30h battery',
      brand: 'AudioTech',
      isActive: true,
    },
  });

  // Create SKUs for products
  console.log('🏷️ Creating product SKUs...');
  const sku1 = await prisma.sku.create({
    data: {
      productId: product1.id,
      skuCode: 'PHONE-XYZ-BLK-128',
      variantJson: { color: 'Black', size: '128GB' },
    },
  });

  const sku2 = await prisma.sku.create({
    data: {
      productId: product2.id,
      skuCode: 'HEADPHONE-PREM-BLK',
      variantJson: { color: 'Black', size: 'One Size' },
    },
  });

  // Create supplier offers
  console.log('💰 Creating supplier offers...');
  const offer1 = await prisma.supplierOffer.create({
    data: {
      skuId: sku1.id,
      supplierOrgId: supplierOrg.id,
      costCents: 89900, // R$ 899.00
      msrpCents: 129900, // R$ 1,299.00
      stockQty: 100,
      slaDays: 3,
      shipsFrom: 'São Paulo, SP',
    },
  });

  const offer2 = await prisma.supplierOffer.create({
    data: {
      skuId: sku2.id,
      supplierOrgId: supplierOrg.id,
      costCents: 34900, // R$ 349.00
      msrpCents: 49900, // R$ 499.00
      stockQty: 50,
      slaDays: 2,
      shipsFrom: 'São Paulo, SP',
    },
  });

  // Create product images
  console.log('🖼️ Creating product images...');
  await prisma.productImage.create({
    data: {
      productId: product1.id,
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      sortOrder: 0,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product2.id,
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      sortOrder: 0,
    },
  });

  // Create merchant-supplier relationship
  console.log('🤝 Creating merchant-supplier relationship...');
  await prisma.merchantSupplier.create({
    data: {
      merchantOrgId: merchantOrg.id,
      supplierOrgId: supplierOrg.id,
      status: 'APPROVED',
    },
  });

  // Create demo listings (anúncios)
  console.log('📢 Creating demo listings...');
  const listing1 = await prisma.listing.create({
    data: {
      merchantOrgId: merchantOrg.id,
      supplierOfferId: offer1.id,
      provider: Provider.SHOPEE,
      externalListingId: 'SHOPEE_LISTING_123456',
      title: 'Smartphone XYZ Pro 128GB - Preto',
      priceCents: 119900, // R$ 1,199.00
      isActive: true,
      syncStatus: 'SYNCED',
      lastSyncedAt: new Date(),
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      merchantOrgId: merchantOrg.id,
      supplierOfferId: offer2.id,
      provider: Provider.SHOPEE,
      externalListingId: 'SHOPEE_LISTING_789012',
      title: 'Fone de Ouvido Premium Sem Fio',
      priceCents: 44900, // R$ 449.00
      isActive: true,
      syncStatus: 'SYNCED',
      lastSyncedAt: new Date(),
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      merchantOrgId: merchantOrg.id,
      supplierOfferId: offer1.id,
      provider: Provider.MERCADOLIVRE,
      externalListingId: 'MLB123456789',
      title: 'Smartphone XYZ Pro 128GB - Preto [NOVO]',
      priceCents: 124900, // R$ 1,249.00
      isActive: true,
      syncStatus: 'SYNCED',
      lastSyncedAt: new Date(),
    },
  });

  // Create demo marketplace orders (pedidos)
  console.log('🛒 Creating demo marketplace orders...');
  const order1 = await prisma.marketplaceOrder.create({
    data: {
      merchantOrgId: merchantOrg.id,
      provider: Provider.SHOPEE,
      externalOrderId: 'SHOPEE_ORDER_001',
      status: 'PENDING',
      buyerName: 'João Silva',
      totalCents: 119900,
      shippingAddressJson: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
      },
    },
  });

  const order2 = await prisma.marketplaceOrder.create({
    data: {
      merchantOrgId: merchantOrg.id,
      provider: Provider.SHOPEE,
      externalOrderId: 'SHOPEE_ORDER_002',
      status: 'CONFIRMED',
      buyerName: 'Maria Santos',
      totalCents: 44900,
      shippingAddressJson: {
        street: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
      },
    },
  });

  const order3 = await prisma.marketplaceOrder.create({
    data: {
      merchantOrgId: merchantOrg.id,
      provider: Provider.MERCADOLIVRE,
      externalOrderId: 'MLB_ORDER_003',
      status: 'SHIPPED',
      buyerName: 'Pedro Costa',
      totalCents: 124900,
      shippingAddressJson: {
        street: 'Rua do Comércio, 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000',
      },
    },
  });

  // Create order items
  console.log('📦 Creating order items...');
  await prisma.marketplaceOrderItem.create({
    data: {
      marketplaceOrderId: order1.id,
      listingId: listing1.id,
      supplierOfferId: offer1.id,
      qty: 1,
      priceCents: 119900,
    },
  });

  await prisma.marketplaceOrderItem.create({
    data: {
      marketplaceOrderId: order2.id,
      listingId: listing2.id,
      supplierOfferId: offer2.id,
      qty: 1,
      priceCents: 44900,
    },
  });

  await prisma.marketplaceOrderItem.create({
    data: {
      marketplaceOrderId: order3.id,
      listingId: listing3.id,
      supplierOfferId: offer1.id,
      qty: 1,
      priceCents: 124900,
    },
  });

  console.log('✅ Demo seed completed successfully!');
  console.log('\n📋 Demo Accounts Created:');
  console.log('\n🛍️  MERCHANT ACCOUNT:');
  console.log('   Email: demo-merchant@dropshiphub.com');
  console.log('   Password: DemoMerchant2024!');
  console.log('   Organization: Demo Store');
  console.log('   Type: MERCHANT');
  console.log('   Role: OWNER');
  console.log('\n📦 SUPPLIER ACCOUNT:');
  console.log('   Email: demo-supplier@dropshiphub.com');
  console.log('   Password: DemoSupplier2024!');
  console.log('   Organization: Demo Supplier Co.');
  console.log('   Type: SUPPLIER');
  console.log('   Role: OWNER');
  console.log('\n🔌 INTEGRATIONS:');
  console.log('   Mercado Livre: ACTIVE (demo mode)');
  console.log('   Shopee: ACTIVE (demo mode)');
  console.log('\n📦 PRODUCTS & SUPPLIERS:');
  console.log('   2 demo products with SKUs and supplier offers');
  console.log('   1 approved merchant-supplier relationship');
  console.log('\n📢 LISTINGS:');
  console.log('   3 active listings (2 Shopee + 1 Mercado Livre)');
  console.log('\n🛒 ORDERS:');
  console.log('   3 demo marketplace orders with items');
  console.log('   - 1 PENDING, 1 CONFIRMED, 1 SHIPPED');
  console.log('\n🚀 Ready for complete system demonstration!');
  console.log('\n💡 Note: All integrations work in DEMO MODE (no real credentials needed)');
  console.log('   Full OAuth flows, listings, and orders are functional for testing');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
