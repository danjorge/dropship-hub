import { Provider } from '@prisma/client';
export declare class GetOrdersDto {
    provider?: Provider;
    status?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
}
