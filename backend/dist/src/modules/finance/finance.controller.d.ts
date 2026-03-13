import { FinanceService } from './finance.service';
import { CreatePixPaymentDto, ConfirmPixPaymentDto } from './dto/finance.dto';
export declare class FinanceController {
    private financeService;
    constructor(financeService: FinanceService);
    getWallet(orgId: string): Promise<{
        id: string;
        balanceCents: number;
        balance: number;
        updatedAt: Date;
    }>;
    getTransactions(orgId: string, page?: string, limit?: string): Promise<{
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
    createPixPayment(orgId: string, dto: CreatePixPaymentDto): Promise<{
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
    getPixPayments(orgId: string, page?: string, limit?: string): Promise<{
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
    getPixPayment(orgId: string, id: string): Promise<{
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
    confirmPixPayment(id: string, dto: ConfirmPixPaymentDto): Promise<{
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
}
