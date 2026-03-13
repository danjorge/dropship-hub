import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/db/prisma.service';
import { TransactionType, TransactionCategory, PixPaymentStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // Get or create wallet for organization
  async getOrCreateWallet(orgId: string) {
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

  // Get wallet with balance
  async getWallet(orgId: string) {
    const wallet = await this.getOrCreateWallet(orgId);
    return {
      id: wallet.id,
      balanceCents: wallet.balanceCents,
      balance: wallet.balanceCents / 100,
      updatedAt: wallet.updatedAt,
    };
  }

  // Get transactions with pagination
  async getTransactions(orgId: string, page = 1, limit = 50) {
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

  // Create PIX payment request
  async createPixPayment(
    orgId: string,
    amountCents: number,
    payerName: string,
    payerDocument: string,
  ) {
    if (amountCents <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const wallet = await this.getOrCreateWallet(orgId);

    // Generate PIX data (in production, integrate with payment gateway)
    const qrCodeData = this.generateMockPixQrCode(amountCents, payerName, payerDocument);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiration

    const pixPayment = await this.prisma.pixPayment.create({
      data: {
        walletId: wallet.id,
        amountCents,
        payerName,
        payerDocument,
        qrCodeData,
        expiresAt,
        status: PixPaymentStatus.PENDING,
      },
    });

    return {
      ...pixPayment,
      amount: pixPayment.amountCents / 100,
    };
  }

  // Get PIX payment by ID
  async getPixPayment(orgId: string, pixPaymentId: string) {
    const wallet = await this.getOrCreateWallet(orgId);

    const pixPayment = await this.prisma.pixPayment.findFirst({
      where: {
        id: pixPaymentId,
        walletId: wallet.id,
      },
    });

    if (!pixPayment) {
      throw new NotFoundException('PIX payment not found');
    }

    return {
      ...pixPayment,
      amount: pixPayment.amountCents / 100,
    };
  }

  // Simulate PIX payment confirmation (in production, this would be a webhook)
  async confirmPixPayment(pixPaymentId: string) {
    const pixPayment = await this.prisma.pixPayment.findUnique({
      where: { id: pixPaymentId },
      include: { wallet: true },
    });

    if (!pixPayment) {
      throw new NotFoundException('PIX payment not found');
    }

    if (pixPayment.status !== PixPaymentStatus.PENDING) {
      throw new BadRequestException('PIX payment already processed');
    }

    // Create transaction and update wallet balance in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create credit transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: pixPayment.walletId,
          type: TransactionType.CREDIT,
          category: TransactionCategory.PIX_DEPOSIT,
          amountCents: pixPayment.amountCents,
          description: `Depósito PIX - ${pixPayment.payerName}`,
          referenceId: pixPayment.id,
        },
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { id: pixPayment.walletId },
        data: {
          balanceCents: {
            increment: pixPayment.amountCents,
          },
        },
      });

      // Update PIX payment status
      const updatedPixPayment = await tx.pixPayment.update({
        where: { id: pixPaymentId },
        data: {
          status: PixPaymentStatus.PAID,
          paidAt: new Date(),
          transactionId: transaction.id,
        },
      });

      return { transaction, pixPayment: updatedPixPayment };
    });

    return result;
  }

  // Debit wallet for order payment
  async debitForOrder(
    orgId: string,
    orderId: string,
    amountCents: number,
    description: string,
  ) {
    const wallet = await this.getOrCreateWallet(orgId);

    if (wallet.balanceCents < amountCents) {
      throw new BadRequestException('Insufficient balance');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Create debit transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          category: TransactionCategory.ORDER_PAYMENT,
          amountCents,
          description,
          referenceId: orderId,
        },
      });

      // Update wallet balance
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

  // Generate mock PIX QR Code (in production, use payment gateway API)
  private generateMockPixQrCode(
    amountCents: number,
    payerName: string,
    payerDocument: string,
  ): string {
    const amount = (amountCents / 100).toFixed(2);
    // This is a simplified PIX format - in production, use proper PIX EMV format
    return `00020126580014br.gov.bcb.pix0136${payerDocument}520400005303986540${amount}5802BR5913${payerName}6009SAO PAULO62070503***6304`;
  }

  // Get PIX payments history
  async getPixPayments(orgId: string, page = 1, limit = 20) {
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
}
