import { Module } from '@nestjs/common';
import { FulfillmentsController } from './fulfillments.controller';
import { FulfillmentsService } from './fulfillments.service';
import { PrismaModule } from '../../common/db/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FulfillmentsController],
  providers: [FulfillmentsService],
  exports: [FulfillmentsService],
})
export class FulfillmentsModule {}
