import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private config;
    private readonly logger;
    private readonly algorithm;
    private readonly key;
    constructor(config: ConfigService);
    encrypt(text: string): string;
    decrypt(encryptedData: string): string;
    encryptJson<T = unknown>(data: T): string;
    decryptJson<T = unknown>(encryptedData: string): T;
    maskSensitiveData(value: string, visibleChars?: number): string;
}
