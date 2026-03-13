import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queues.config';

@Processor(QUEUE_NAMES.ORDERS_SYNC)
export class OrdersSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(OrdersSyncProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing orders sync job ${job.id}`);
    
    const { merchantOrgId, provider } = job.data;
    
    this.logger.log(`Polling orders for merchant ${merchantOrgId} from ${provider}`);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    this.logger.log(`Completed orders sync job ${job.id}`);
  }
}
