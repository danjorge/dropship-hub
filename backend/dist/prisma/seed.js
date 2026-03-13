"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = "admin@dropship.local";
    const adminPassword = "admin123";
    const passwordHash = await bcrypt_1.default.hash(adminPassword, 10);
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
    const supplierOrg = await prisma.org.upsert({
        where: { id: "00000000-0000-0000-0000-000000000001" },
        update: { name: "Supplier Demo", type: client_1.OrgType.SUPPLIER },
        create: {
            id: "00000000-0000-0000-0000-000000000001",
            name: "Supplier Demo",
            type: client_1.OrgType.SUPPLIER,
        },
    });
    const merchantOrg = await prisma.org.upsert({
        where: { id: "00000000-0000-0000-0000-000000000002" },
        update: { name: "Merchant Demo", type: client_1.OrgType.MERCHANT },
        create: {
            id: "00000000-0000-0000-0000-000000000002",
            name: "Merchant Demo",
            type: client_1.OrgType.MERCHANT,
        },
    });
    await prisma.orgMember.upsert({
        where: { orgId_userId: { orgId: supplierOrg.id, userId: user.id } },
        update: { role: client_1.OrgMemberRole.OWNER },
        create: {
            orgId: supplierOrg.id,
            userId: user.id,
            role: client_1.OrgMemberRole.OWNER,
        },
    });
    await prisma.orgMember.upsert({
        where: { orgId_userId: { orgId: merchantOrg.id, userId: user.id } },
        update: { role: client_1.OrgMemberRole.OWNER },
        create: {
            orgId: merchantOrg.id,
            userId: user.id,
            role: client_1.OrgMemberRole.OWNER,
        },
    });
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
//# sourceMappingURL=seed.js.map