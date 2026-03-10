import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queues.config';
import { StockReservationsService } from '../../inventory/stock-reservations.service';

@Processor(QUEUE_NAMES.STOCK_RESERVATIONS)
export class StockReservationsProcessor extends WorkerHost {
  private readonly logger = new Logger(StockReservationsProcessor.name);

  constructor(private stockReservations: StockReservationsService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing stock reservations cleanup job ${job.id}`);
    
    const released = await this.stockReservations.releaseExpiredReservations();
    
    this.logger.log(`Released ${released} expired reservations`);
  }
}
