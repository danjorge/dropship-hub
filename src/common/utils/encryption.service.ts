import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private config: ConfigService) {
    const encKey = this.config.get<string>('APP_ENC_KEY');
    
    if (!encKey) {
      this.logger.error('APP_ENC_KEY environment variable is not set');
      throw new Error('Encryption key not configured');
    }

    if (encKey.length < 32) {
      this.logger.warn('APP_ENC_KEY is shorter than recommended 32 characters');
    }

    // Ensure key is exactly 32 bytes for AES-256
    this.key = Buffer.from(encKey.padEnd(32, '0').slice(0, 32));
  }

  /**
   * Encrypt plain text string
   * @param text Plain text to encrypt
   * @returns Encrypted string in format: iv:authTag:encryptedData
   */
  encrypt(text: string): string {
    if (!text) {
      throw new Error('Cannot encrypt empty text');
    }

    try {
      const iv = randomBytes(16);
      const cipher = createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Encryption failed', error.stack);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt encrypted string
   * @param encryptedData Encrypted string in format: iv:authTag:encryptedData
   * @returns Decrypted plain text
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData) {
      throw new Error('Cannot decrypt empty data');
    }

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error.stack);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt JSON object
   * @param data Object to encrypt
   * @returns Encrypted string
   */
  encryptJson<T = unknown>(data: T): string {
    if (data === null || data === undefined) {
      throw new Error('Cannot encrypt null or undefined data');
    }

    try {
      const jsonString = JSON.stringify(data);
      return this.encrypt(jsonString);
    } catch (error) {
      this.logger.error('JSON encryption failed', error.stack);
      throw new Error('Failed to encrypt JSON data');
    }
  }

  /**
   * Decrypt JSON object
   * @param encryptedData Encrypted string
   * @returns Decrypted object
   */
  decryptJson<T = unknown>(encryptedData: string): T {
    try {
      const decrypted = this.decrypt(encryptedData);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      this.logger.error('JSON decryption failed', error.stack);
      throw new Error('Failed to decrypt JSON data');
    }
  }

  /**
   * Securely mask sensitive data for logging
   * @param value Value to mask
   * @param visibleChars Number of characters to show at end (default: 4)
   * @returns Masked string
   */
  maskSensitiveData(value: string, visibleChars: number = 4): string {
    if (!value || value.length <= visibleChars) {
      return '***';
    }
    return `***${value.slice(-visibleChars)}`;
  }
}

