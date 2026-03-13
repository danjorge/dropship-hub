import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { StockReservationsService } from '../../inventory/stock-reservations.service';
export declare class StockReservationsProcessor extends WorkerHost {
    private stockReservations;
    private readonly logger;
    constructor(stockReservations: StockReservationsService);
    process(job: Job): Promise<void>;
}
