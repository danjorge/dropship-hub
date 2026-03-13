import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    private readonly logger;
    constructor(webhooksService: WebhooksService);
    handleShopeeWebhook(payload: Record<string, unknown>, signature?: string): Promise<{
        status: string;
    }>;
}
