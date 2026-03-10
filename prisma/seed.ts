import "dotenv/config";
import { PrismaClient, OrgType, OrgMemberRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // ⚠️ Troque depois. Aqui é só pra começar.
  const adminEmail = "admin@dropship.local";
  const adminPassword = "admin123";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // 1) Usuário
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: "Admin",
      passwordHash,
    },
    create: {
      email: adminEmail,
      fullName: "Admin",
      passwordHash,
    },
  });

  // 2) Orgs (Supplier + Merchant)
  const supplierOrg = await prisma.org.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" }, // baseline estável p/ dev (opcional)
    update: { name: "Supplier Demo", type: OrgType.SUPPLIER },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Supplier Demo",
      type: OrgType.SUPPLIER,
    },
  });

  const merchantOrg = await prisma.org.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: { name: "Merchant Demo", type: OrgType.MERCHANT },
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Merchant Demo",
      type: OrgType.MERCHANT,
    },
  });

  // 3) Memberships (user OWNER nas duas orgs)
  await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: supplierOrg.id, userId: user.id } },
    update: { role: OrgMemberRole.OWNER },
    create: {
      orgId: supplierOrg.id,
      userId: user.id,
      role: OrgMemberRole.OWNER,
    },
  });

  await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: merchantOrg.id, userId: user.id } },
    update: { role: OrgMemberRole.OWNER },
    create: {
      orgId: merchantOrg.id,
      userId: user.id,
      role: OrgMemberRole.OWNER,
    },
  });

  // 4) Aprovar relacionamento merchant <-> supplier
  await prisma.merchantSupplier.upsert({
    where: {
      merchantOrgId_supplierOrgId: {
        merchantOrgId: merchantOrg.id,
        supplierOrgId: supplierOrg.id,
      },
    },
    update: { status: "APPROVED" },
    create: {
      merchantOrgId: merchantOrg.id,
      supplierOrgId: supplierOrg.id,
      status: "APPROVED",
    },
  });

  console.log("✅ Seed concluído!");
  console.log("Login dev:", adminEmail, "/", adminPassword);
  console.log("Supplier org:", supplierOrg.id);
  console.log("Merchant org:", merchantOrg.id);
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });