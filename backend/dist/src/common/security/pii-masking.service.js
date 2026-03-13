"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiiMaskingService = void 0;
const common_1 = require("@nestjs/common");
let PiiMaskingService = class PiiMaskingService {
    maskEmail(email) {
        if (!email || !email.includes('@')) {
            return '***';
        }
        const [localPart, domain] = email.split('@');
        const maskedLocal = this.maskString(localPart, 1, 1);
        const maskedDomain = this.maskString(domain, 1, 0);
        return `${maskedLocal}@${maskedDomain}`;
    }
    maskPhone(phone) {
        if (!phone) {
            return '***';
        }
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 4) {
            return '***';
        }
        return `***${digits.slice(-4)}`;
    }
    maskAddress(address) {
        if (!address) {
            return '***';
        }
        const parts = [];
        if (address.city) {
            parts.push(address.city);
        }
        if (address.state) {
            parts.push(address.state);
        }
        return parts.length > 0 ? parts.join(', ') : '***';
    }
    maskCreditCard(cardNumber) {
        if (!cardNumber) {
            return '***';
        }
        const digits = cardNumber.replace(/\D/g, '');
        if (digits.length < 4) {
            return '***';
        }
        return `****${digits.slice(-4)}`;
    }
    maskToken(token) {
        if (!token) {
            return '***';
        }
        if (token.length <= 4) {
            return '***';
        }
        return `***${token.slice(-4)}`;
    }
    maskName(name) {
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
    maskTaxId(taxId) {
        if (!taxId) {
            return '***';
        }
        const digits = taxId.replace(/\D/g, '');
        if (digits.length === 11) {
            return `***.***.**${digits.slice(-3, -2)}-${digits.slice(-2)}`;
        }
        else if (digits.length === 14) {
            return `**.***.***/****-${digits.slice(-2)}`;
        }
        return '***';
    }
    maskString(str, prefixLength = 0, suffixLength = 0) {
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
    maskObject(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        const masked = { ...obj };
        for (const [key, value] of Object.entries(masked)) {
            const lowerKey = key.toLowerCase();
            if (this.isSensitiveField(lowerKey)) {
                if (typeof value === 'string') {
                    masked[key] = this.maskByFieldName(lowerKey, value);
                }
                else {
                    masked[key] = '***';
                }
            }
            else if (value && typeof value === 'object' && !Array.isArray(value)) {
                masked[key] = this.maskObject(value);
            }
            else if (Array.isArray(value)) {
                masked[key] = value.map(item => typeof item === 'object' ? this.maskObject(item) : item);
            }
        }
        return masked;
    }
    isSensitiveField(fieldName) {
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
    maskByFieldName(fieldName, value) {
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
        return this.maskString(value, 0, 4);
    }
    safeStringify(obj) {
        if (!obj) {
            return '';
        }
        try {
            if (typeof obj === 'object') {
                const masked = this.maskObject(obj);
                return JSON.stringify(masked);
            }
            return String(obj);
        }
        catch (error) {
            return '[Unable to stringify object]';
        }
    }
};
exports.PiiMaskingService = PiiMaskingService;
exports.PiiMaskingService = PiiMaskingService = __decorate([
    (0, common_1.Injectable)()
], PiiMaskingService);
//# sourceMappingURL=pii-masking.service.js.map