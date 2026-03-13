import { PrismaService } from '../../common/db/prisma.service';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getOrCreateWallet(orgId: string): Promise<{
        id: string;
        createdAt: Date;
        orgId: string;
        balanceCents: number;
        updatedAt: Date;
    }>;
    getWallet(orgId: string): Promise<{
        id: string;
        balanceCents: number;
        balance: number;
        updatedAt: Date;
    }>;
    getTransactions(orgId: string, page?: number, limit?: number): Promise<{
        transactions: {
            amount: number;
            id: string;
            type: import("@prisma/client").$Enums.TransactionType;
            createdAt: Date;
            description: string;
            walletId: string;
            category: import("@prisma/client").$Enums.TransactionCategory;
            amountCents: number;
            referenceId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createPixPayment(orgId: string, amountCents: number, payerName: string, payerDocument: string): Promise<{
        amount: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PixPaymentStatus;
        expiresAt: Date;
        walletId: string;
        amountCents: number;
        payerName: string;
        payerDocument: string;
        qrCodeData: string | null;
        qrCodeImageUrl: string | null;
        paidAt: Date | null;
        transactionId: string | null;
    }>;
    getPixPayment(orgId: string, pixPaymentId: string): Promise<{
        amount: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PixPaymentStatus;
        expiresAt: Date;
        walletId: string;
        amountCents: number;
        payerName: string;
        payerDocument: string;
        qrCodeData: string | null;
        qrCodeImageUrl: string | null;
        paidAt: Date | null;
        transactionId: string | null;
    }>;
    confirmPixPayment(pixPaymentId: string): Promise<{
        transaction: {
            id: string;
            type: import("@prisma/client").$Enums.TransactionType;
            createdAt: Date;
            description: string;
            walletId: string;
            category: import("@prisma/client").$Enums.TransactionCategory;
            amountCents: number;
            referenceId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        };
        pixPayment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PixPaymentStatus;
            expiresAt: Date;
            walletId: string;
            amountCents: number;
            payerName: string;
            payerDocument: string;
            qrCodeData: string | null;
            qrCodeImageUrl: string | null;
            paidAt: Date | null;
            transactionId: string | null;
        };
    }>;
    debitForOrder(orgId: string, orderId: string, amountCents: number, description: string): Promise<{
        amount: number;
        id: string;
        type: import("@prisma/client").$Enums.TransactionType;
        createdAt: Date;
        description: string;
        walletId: string;
        category: import("@prisma/client").$Enums.TransactionCategory;
        amountCents: number;
        referenceId: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    private generateMockPixQrCode;
    getPixPayments(orgId: string, page?: number, limit?: number): Promise<{
        pixPayments: {
            amount: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PixPaymentStatus;
            expiresAt: Date;
            walletId: string;
            amountCents: number;
            payerName: string;
            payerDocument: string;
            qrCodeData: string | null;
            qrCodeImageUrl: string | null;
            paidAt: Date | null;
            transactionId: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
