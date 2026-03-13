import { Module } from '@nestjs/common';
import { StockReservationsService } from './stock-reservations.service';
import { PrismaModule } from '../../common/db/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [StockReservationsService],
  exports: [StockReservationsService],
})
export class InventoryModule {}
