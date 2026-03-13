export declare class PiiMaskingService {
    maskEmail(email: string): string;
    maskPhone(phone: string): string;
    maskAddress(address: {
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    }): string;
    maskCreditCard(cardNumber: string): string;
    maskToken(token: string): string;
    maskName(name: string): string;
    maskTaxId(taxId: string): string;
    private maskString;
    maskObject<T extends Record<string, unknown>>(obj: T): T;
    private isSensitiveField;
    private maskByFieldName;
    safeStringify(obj: unknown): string;
}
