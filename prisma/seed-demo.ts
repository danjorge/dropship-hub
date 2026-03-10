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

  // Create demo Shopee integration (PENDING state for demonstration)
  console.log('🔌 Creating demo Shopee integration...');
  await prisma.integration.create({
    data: {
      orgId: merchantOrg.id,
      provider: Provider.SHOPEE,
      status: 'PENDING',
      credentialsEnc: '', // Empty for demo - will be filled when user connects
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
  await prisma.supplierOffer.create({
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

  await prisma.supplierOffer.create({
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

  // Create merchant-supplier relationship
  console.log('🤝 Creating merchant-supplier relationship...');
  await prisma.merchantSupplier.create({
    data: {
      merchantOrgId: merchantOrg.id,
      supplierOrgId: supplierOrg.id,
      status: 'APPROVED',
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
  console.log('   Shopee: PENDING (ready to connect)');
  console.log('\n📦 PRODUCTS:');
  console.log('   2 demo products with SKUs and offers');
  console.log('\n🚀 Ready for Shopee ISV verification!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
