import { Provider } from '@prisma/client';
export declare class GetListingsDto {
    provider?: Provider;
    isActive?: boolean;
    search?: string;
    syncStatus?: string;
}
