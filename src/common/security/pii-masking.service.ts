import { Injectable } from '@nestjs/common';

/**
 * Service for masking Personally Identifiable Information (PII) in logs and responses
 * Compliant with Shopee Data Protection Policy
 */
@Injectable()
export class PiiMaskingService {
  /**
   * Mask email address
   * Example: john.doe@example.com -> j***e@e***.com
   */
  maskEmail(email: string): string {
    if (!email || !email.includes('@')) {
      return '***';
    }

    const [localPart, domain] = email.split('@');
    const maskedLocal = this.maskString(localPart, 1, 1);
    const maskedDomain = this.maskString(domain, 1, 0);
    
    return `${maskedLocal}@${maskedDomain}`;
  }

  /**
   * Mask phone number
   * Example: +55 11 98765-4321 -> ***4321
   */
  maskPhone(phone: string): string {
    if (!phone) {
      return '***';
    }

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length < 4) {
      return '***';
    }

    return `***${digits.slice(-4)}`;
  }

  /**
   * Mask address - show only city and state
   * Example: { street: "123 Main St", city: "São Paulo", state: "SP" } -> "São Paulo, SP"
   */
  maskAddress(address: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }): string {
    if (!address) {
      return '***';
    }

    const parts: string[] = [];
    
    if (address.city) {
      parts.push(address.city);
    }
    
    if (address.state) {
      parts.push(address.state);
    }

    return parts.length > 0 ? parts.join(', ') : '***';
  }

  /**
   * Mask credit card number
   * Example: 1234567890123456 -> ****3456
   */
  maskCreditCard(cardNumber: string): string {
    if (!cardNumber) {
      return '***';
    }

    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.length < 4) {
      return '***';
    }

    return `****${digits.slice(-4)}`;
  }

  /**
   * Mask access token
   * Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... -> ***JWT9
   */
  maskToken(token: string): string {
    if (!token) {
      return '***';
    }

    if (token.length <= 4) {
      return '***';
    }

    return `***${token.slice(-4)}`;
  }

  /**
   * Mask buyer name
   * Example: João da Silva -> J*** S***
   */
  maskName(name: string): string {
    if (!name) {
      return '***';
    }

    const parts = name.trim().split(/\s+/);
    
    if (parts.length === 1) {
      return this.maskString(parts[0], 1, 0);
    }

    const maskedParts = parts.map(part => this.maskString(part, 1, 0));
    return maskedParts.join(' ');
  }

  /**
   * Mask CPF/CNPJ (Brazilian tax ID)
   * Example: 123.456.789-00 -> ***.***.**9-00
   */
  maskTaxId(taxId: string): string {
    if (!taxId) {
      return '***';
    }

    const digits = taxId.replace(/\D/g, '');
    
    if (digits.length === 11) {
      // CPF: 123.456.789-00 -> ***.***.**9-00
      return `***.***.**${digits.slice(-3, -2)}-${digits.slice(-2)}`;
    } else if (digits.length === 14) {
      // CNPJ: 12.345.678/0001-00 -> **.***.***/****-00
      return `**.***.***/****-${digits.slice(-2)}`;
    }

    return '***';
  }

  /**
   * Generic string masking
   * @param str String to mask
   * @param prefixLength Number of characters to show at start
   * @param suffixLength Number of characters to show at end
   */
  private maskString(str: string, prefixLength: number = 0, suffixLength: number = 0): string {
    if (!str) {
      return '***';
    }

    if (str.length <= prefixLength + suffixLength) {
      return '***';
    }

    const prefix = str.slice(0, prefixLength);
    const suffix = str.slice(-suffixLength);
    
    return `${prefix}***${suffix}`;
  }

  /**
   * Mask entire object recursively for logging
   * Automatically detects and masks common PII fields
   */
  maskObject<T extends Record<string, unknown>>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const masked: Record<string, unknown> = { ...obj };

    for (const [key, value] of Object.entries(masked)) {
      const lowerKey = key.toLowerCase();

      // Mask based on field name
      if (this.isSensitiveField(lowerKey)) {
        if (typeof value === 'string') {
          masked[key] = this.maskByFieldName(lowerKey, value);
        } else {
          masked[key] = '***';
        }
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively mask nested objects
        masked[key] = this.maskObject(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        // Mask array elements
        masked[key] = value.map(item => 
          typeof item === 'object' ? this.maskObject(item as Record<string, unknown>) : item
        );
      }
    }

    return masked as T;
  }

  /**
   * Check if field name indicates sensitive data
   */
  private isSensitiveField(fieldName: string): boolean {
    const sensitivePatterns = [
      'email',
      'phone',
      'telephone',
      'mobile',
      'address',
      'street',
      'zipcode',
      'zip_code',
      'postal',
      'token',
      'password',
      'secret',
      'key',
      'credential',
      'buyer',
      'customer',
      'cpf',
      'cnpj',
      'tax_id',
      'taxid',
      'card',
      'credit',
    ];

    return sensitivePatterns.some(pattern => fieldName.includes(pattern));
  }

  /**
   * Mask value based on field name
   */
  private maskByFieldName(fieldName: string, value: string): string {
    if (fieldName.includes('email')) {
      return this.maskEmail(value);
    }
    if (fieldName.includes('phone') || fieldName.includes('mobile') || fieldName.includes('telephone')) {
      return this.maskPhone(value);
    }
    if (fieldName.includes('token') || fieldName.includes('key') || fieldName.includes('secret')) {
      return this.maskToken(value);
    }
    if (fieldName.includes('cpf') || fieldName.includes('cnpj') || fieldName.includes('tax')) {
      return this.maskTaxId(value);
    }
    if (fieldName.includes('card') || fieldName.includes('credit')) {
      return this.maskCreditCard(value);
    }
    if (fieldName.includes('name') || fieldName.includes('buyer') || fieldName.includes('customer')) {
      return this.maskName(value);
    }

    // Default masking
    return this.maskString(value, 0, 4);
  }

  /**
   * Safely stringify object for logging (with PII masking)
   */
  safeStringify(obj: unknown): string {
    if (!obj) {
      return '';
    }

    try {
      if (typeof obj === 'object') {
        const masked = this.maskObject(obj as Record<string, unknown>);
        return JSON.stringify(masked);
      }
      return String(obj);
    } catch (error) {
      return '[Unable to stringify object]';
    }
  }
}
