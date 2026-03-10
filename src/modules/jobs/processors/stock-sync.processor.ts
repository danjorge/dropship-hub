import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queues.config';

@Processor(QUEUE_NAMES.STOCK_SYNC)
export class StockSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(StockSyncProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing stock sync job ${job.id}`);
    
    const { supplierOrgId } = job.data;
    
    this.logger.log(`Syncing stock for supplier ${supplierOrgId}`);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    this.logger.log(`Completed stock sync job ${job.id}`);
  }
}
