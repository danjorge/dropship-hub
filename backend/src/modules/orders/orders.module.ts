import { Module } from '@nestjs/common';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { PrismaModule } from '../../common/db/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [PrismaModule, IntegrationsModule, FinanceModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
