import { Provider } from '@prisma/client';
export declare class CreateListingDto {
    supplierOfferId: string;
    provider: Provider;
    title: string;
    priceCents: number;
}
