import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queues.config';

@Processor(QUEUE_NAMES.LISTINGS_SYNC)
export class ListingsSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(ListingsSyncProcessor.name);

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing listings sync job ${job.id}`);
    
    const { listingId, merchantOrgId } = job.data;
    
    this.logger.log(`Syncing listing ${listingId} for merchant ${merchantOrgId}`);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    this.logger.log(`Completed listings sync job ${job.id}`);
  }
}
