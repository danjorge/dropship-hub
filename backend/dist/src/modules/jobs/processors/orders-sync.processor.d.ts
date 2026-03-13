import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
export declare class OrdersSyncProcessor extends WorkerHost {
    private readonly logger;
    process(job: Job): Promise<void>;
}
