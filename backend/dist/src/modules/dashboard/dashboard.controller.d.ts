import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: any): Promise<import("./dashboard.service").DashboardStats>;
}
