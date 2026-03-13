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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/db/prisma.service");
const client_1 = require("@prisma/client");
let FinanceService = class FinanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOrCreateWallet(orgId) {
        let wallet = await this.prisma.wallet.findUnique({
            where: { orgId },
        });
        if (!wallet) {
            wallet = await this.prisma.wallet.create({
                data: { orgId },
            });
        }
        return wallet;
    }
    async getWallet(orgId) {
        const wallet = await this.getOrCreateWallet(orgId);
        return {
            id: wallet.id,
            balanceCents: wallet.balanceCents,
            balance: wallet.balanceCents / 100,
            updatedAt: wallet.updatedAt,
        };
    }
    async getTransactions(orgId, page = 1, limit = 50) {
        const wallet = await this.getOrCreateWallet(orgId);
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where: { walletId: wallet.id },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.transaction.count({
                where: { walletId: wallet.id },
            }),
        ]);
        return {
            transactions: transactions.map((t) => ({
                ...t,
                amount: t.amountCents / 100,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async createPixPayment(orgId, amountCents, payerName, payerDocument) {
        if (amountCents <= 0) {
            throw new common_1.BadRequestException('Amount must be greater than zero');
        }
        const wallet = await this.getOrCreateWallet(orgId);
        const qrCodeData = this.generateMockPixQrCode(amountCents, payerName, payerDocument);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const pixPayment = await this.prisma.pixPayment.create({
            data: {
                walletId: wallet.id,
                amountCents,
                payerName,
                payerDocument,
                qrCodeData,
                expiresAt,
                status: client_1.PixPaymentStatus.PENDING,
            },
        });
        return {
            ...pixPayment,
            amount: pixPayment.amountCents / 100,
        };
    }
    async getPixPayment(orgId, pixPaymentId) {
        const wallet = await this.getOrCreateWallet(orgId);
        const pixPayment = await this.prisma.pixPayment.findFirst({
            where: {
                id: pixPaymentId,
                walletId: wallet.id,
            },
        });
        if (!pixPayment) {
            throw new common_1.NotFoundException('PIX payment not found');
        }
        return {
            ...pixPayment,
            amount: pixPayment.amountCents / 100,
        };
    }
    async confirmPixPayment(pixPaymentId) {
        const pixPayment = await this.prisma.pixPayment.findUnique({
            where: { id: pixPaymentId },
            include: { wallet: true },
        });
        if (!pixPayment) {
            throw new common_1.NotFoundException('PIX payment not found');
        }
        if (pixPayment.status !== client_1.PixPaymentStatus.PENDING) {
            throw new common_1.BadRequestException('PIX payment already processed');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    walletId: pixPayment.walletId,
                    type: client_1.TransactionType.CREDIT,
                    category: client_1.TransactionCategory.PIX_DEPOSIT,
                    amountCents: pixPayment.amountCents,
                    description: `Depósito PIX - ${pixPayment.payerName}`,
                    referenceId: pixPayment.id,
                },
            });
            await tx.wallet.update({
                where: { id: pixPayment.walletId },
                data: {
                    balanceCents: {
                        increment: pixPayment.amountCents,
                    },
                },
            });
            const updatedPixPayment = await tx.pixPayment.update({
                where: { id: pixPaymentId },
                data: {
                    status: client_1.PixPaymentStatus.PAID,
                    paidAt: new Date(),
                    transactionId: transaction.id,
                },
            });
            return { transaction, pixPayment: updatedPixPayment };
        });
        return result;
    }
    async debitForOrder(orgId, orderId, amountCents, description) {
        const wallet = await this.getOrCreateWallet(orgId);
        if (wallet.balanceCents < amountCents) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: client_1.TransactionType.DEBIT,
                    category: client_1.TransactionCategory.ORDER_PAYMENT,
                    amountCents,
                    description,
                    referenceId: orderId,
                },
            });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balanceCents: {
                        decrement: amountCents,
                    },
                },
            });
            return transaction;
        });
        return {
            ...result,
            amount: result.amountCents / 100,
        };
    }
    generateMockPixQrCode(amountCents, payerName, payerDocument) {
        const amount = (amountCents / 100).toFixed(2);
        return `00020126580014br.gov.bcb.pix0136${payerDocument}520400005303986540${amount}5802BR5913${payerName}6009SAO PAULO62070503***6304`;
    }
    async getPixPayments(orgId, page = 1, limit = 20) {
        const wallet = await this.getOrCreateWallet(orgId);
        const [pixPayments, total] = await Promise.all([
            this.prisma.pixPayment.findMany({
                where: { walletId: wallet.id },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.pixPayment.count({
                where: { walletId: wallet.id },
            }),
        ]);
        return {
            pixPayments: pixPayments.map((p) => ({
                ...p,
                amount: p.amountCents / 100,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map