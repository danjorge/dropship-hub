import { PrismaService } from '../../common/db/prisma.service';
export declare class WebhooksService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleShopeeWebhook(payload: Record<string, unknown>, signature?: string): Promise<{
        status: string;
    }>;
    private verifySignature;
    private processOrderEvent;
}
