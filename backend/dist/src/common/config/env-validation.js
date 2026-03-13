"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentValidator = void 0;
const common_1 = require("@nestjs/common");
const REQUIRED_ENV_VARS = [
    {
        name: 'DATABASE_URL',
        description: 'PostgreSQL database connection string',
        minLength: 10,
        isSecret: true,
    },
    {
        name: 'JWT_SECRET',
        description: 'Secret key for JWT token signing',
        minLength: 32,
        isSecret: true,
    },
    {
        name: 'APP_ENC_KEY',
        description: 'Encryption key for sensitive data (AES-256)',
        minLength: 32,
        isSecret: true,
    },
    {
        name: 'REDIS_HOST',
        description: 'Redis server host',
    },
    {
        name: 'REDIS_PORT',
        description: 'Redis server port',
    },
    {
        name: 'NODE_ENV',
        description: 'Node environment (development, staging, production)',
    },
    {
        name: 'FRONTEND_URL',
        description: 'Frontend application URL for OAuth redirects',
    },
];
const OPTIONAL_ENV_VARS = [
    {
        name: 'SHOPEE_PARTNER_ID',
        description: 'Shopee Partner ID for marketplace integration',
    },
    {
        name: 'SHOPEE_PARTNER_KEY',
        description: 'Shopee Partner Key for API authentication',
        isSecret: true,
    },
    {
        name: 'MELI_CLIENT_ID',
        description: 'Mercado Livre Client ID',
    },
    {
        name: 'MELI_CLIENT_SECRET',
        description: 'Mercado Livre Client Secret',
        isSecret: true,
    },
];
class EnvironmentValidator {
    static validate() {
        this.logger.log('Validating environment variables...');
        const errors = [];
        const warnings = [];
        for (const envVar of REQUIRED_ENV_VARS) {
            const value = process.env[envVar.name];
            if (!value) {
                errors.push(`Missing required environment variable: ${envVar.name} - ${envVar.description}`);
                continue;
            }
            if (envVar.minLength && value.length < envVar.minLength) {
                errors.push(`Environment variable ${envVar.name} is too short (minimum ${envVar.minLength} characters)`);
            }
            if (envVar.isSecret) {
                this.logger.log(`✓ ${envVar.name}: ***${value.slice(-4)}`);
            }
            else {
                this.logger.log(`✓ ${envVar.name}: ${value}`);
            }
        }
        for (const envVar of OPTIONAL_ENV_VARS) {
            const value = process.env[envVar.name];
            if (!value) {
                warnings.push(`Optional environment variable not set: ${envVar.name} - ${envVar.description}`);
            }
            else if (envVar.isSecret) {
                this.logger.log(`✓ ${envVar.name}: ***${value.slice(-4)}`);
            }
            else {
                this.logger.log(`✓ ${envVar.name}: ${value}`);
            }
        }
        this.performSecurityChecks(errors, warnings);
        if (warnings.length > 0) {
            this.logger.warn('Environment warnings:');
            warnings.forEach(warning => this.logger.warn(`  ⚠ ${warning}`));
        }
        if (errors.length > 0) {
            this.logger.error('Environment validation failed:');
            errors.forEach(error => this.logger.error(`  ✗ ${error}`));
            throw new Error('Environment validation failed. Please check the logs above.');
        }
        this.logger.log('✓ Environment validation passed');
    }
    static performSecurityChecks(errors, warnings) {
        const nodeEnv = process.env.NODE_ENV;
        if (!['development', 'staging', 'production', 'test'].includes(nodeEnv || '')) {
            warnings.push(`NODE_ENV should be one of: development, staging, production, test (current: ${nodeEnv})`);
        }
        if (nodeEnv === 'production') {
            const jwtSecret = process.env.JWT_SECRET || '';
            const encKey = process.env.APP_ENC_KEY || '';
            if (jwtSecret.includes('dev') || jwtSecret.includes('test')) {
                errors.push('JWT_SECRET appears to be a development key. Use a strong production secret.');
            }
            if (encKey.includes('dev') || encKey.includes('test')) {
                errors.push('APP_ENC_KEY appears to be a development key. Use a strong production secret.');
            }
            const frontendUrl = process.env.FRONTEND_URL || '';
            if (frontendUrl && !frontendUrl.startsWith('https://')) {
                warnings.push('FRONTEND_URL should use HTTPS in production');
            }
            if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
                errors.push('FRONTEND_URL cannot use localhost in production');
            }
        }
        if (nodeEnv === 'development') {
            warnings.push('Running in development mode - ensure production secrets are not used');
        }
    }
    static getEnvironmentInfo() {
        return {
            nodeEnv: process.env.NODE_ENV || 'unknown',
            nodeVersion: process.version,
            platform: process.platform,
            hasDatabase: !!process.env.DATABASE_URL,
            hasRedis: !!process.env.REDIS_HOST,
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasEncryptionKey: !!process.env.APP_ENC_KEY,
            hasShopeeConfig: !!(process.env.SHOPEE_PARTNER_ID && process.env.SHOPEE_PARTNER_KEY),
            hasMeliConfig: !!(process.env.MELI_CLIENT_ID && process.env.MELI_CLIENT_SECRET),
        };
    }
}
exports.EnvironmentValidator = EnvironmentValidator;
EnvironmentValidator.logger = new common_1.Logger('EnvironmentValidator');
//# sourceMappingURL=env-validation.js.map