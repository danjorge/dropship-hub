import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('integrations')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('shopee/webhook')
  @SkipThrottle()
  @ApiOperation({ 
    summary: 'Shopee webhook handler', 
    description: 'Receive and process Shopee marketplace webhooks (order events, etc.) with idempotency' 
  })
  @ApiHeader({ name: 'x-shopee-signature', description: 'Shopee webhook signature for verification', required: false })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - invalid webhook payload' })
  @ApiResponse({ status: 403, description: 'Forbidden - invalid signature' })
  async handleShopeeWebhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-shopee-signature') signature?: string,
  ) {
    this.logger.log('Received Shopee webhook');
    
    return this.webhooksService.handleShopeeWebhook(payload, signature);
  }
}
