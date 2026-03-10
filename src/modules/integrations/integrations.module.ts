import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhooksController } from './webhooks.controller';
import { IntegrationsController } from './integrations/integrations.controller';
import { WebhooksService } from './webhooks.service';
import { IntegrationsService } from './integrations.service';
import { PrismaModule } from '../../common/db/prisma.module';
import { EncryptionService } from '../../common/utils/encryption.service';
import { ShopeeProvider } from './providers/shopee.provider';
import { MercadoLivreProvider } from './providers/mercadolivre.provider';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [WebhooksController, IntegrationsController],
  providers: [
    WebhooksService,
    IntegrationsService,
    EncryptionService,
    ShopeeProvider,
    MercadoLivreProvider,
  ],
  exports: [WebhooksService, IntegrationsService],
})
export class IntegrationsModule {}
