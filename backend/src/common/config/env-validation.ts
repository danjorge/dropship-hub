import { Logger } from '@nestjs/common';

/**
 * Environment Variable Validation
 * Ensures all required security-critical environment variables are set
 * Application will fail to start if validation fails
 */

interface RequiredEnvVar {
  name: string;
  description: string;
  minLength?: number;
  isSecret?: boolean;
}

const REQUIRED_ENV_VARS: RequiredEnvVar[] = [
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

const OPTIONAL_ENV_VARS: RequiredEnvVar[] = [
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

export class EnvironmentValidator {
  private static logger = new Logger('EnvironmentValidator');

  /**
   * Validate all required environment variables
   * Throws error if validation fails
   */
  static validate(): void {
    this.logger.log('Validating environment variables...');

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const envVar of REQUIRED_ENV_VARS) {
      const value = process.env[envVar.name];

      if (!value) {
        errors.push(
          `Missing required environment variable: ${envVar.name} - ${envVar.description}`
        );
        continue;
      }

      if (envVar.minLength && value.length < envVar.minLength) {
        errors.push(
          `Environment variable ${envVar.name} is too short (minimum ${envVar.minLength} characters)`
        );
      }

      // Log that variable is set (but don't log the value if it's a secret)
      if (envVar.isSecret) {
        this.logger.log(`✓ ${envVar.name}: ***${value.slice(-4)}`);
      } else {
        this.logger.log(`✓ ${envVar.name}: ${value}`);
      }
    }

    // Check optional variables (warn if missing)
    for (const envVar of OPTIONAL_ENV_VARS) {
      const value = process.env[envVar.name];

      if (!value) {
        warnings.push(
          `Optional environment variable not set: ${envVar.name} - ${envVar.description}`
        );
      } else if (envVar.isSecret) {
        this.logger.log(`✓ ${envVar.name}: ***${value.slice(-4)}`);
      } else {
        this.logger.log(`✓ ${envVar.name}: ${value}`);
      }
    }

    // Security checks
    this.performSecurityChecks(errors, warnings);

    // Log warnings
    if (warnings.length > 0) {
      this.logger.warn('Environment warnings:');
      warnings.forEach(warning => this.logger.warn(`  ⚠ ${warning}`));
    }

    // Fail if there are errors
    if (errors.length > 0) {
      this.logger.error('Environment validation failed:');
      errors.forEach(error => this.logger.error(`  ✗ ${error}`));
      throw new Error('Environment validation failed. Please check the logs above.');
    }

    this.logger.log('✓ Environment validation passed');
  }

  /**
   * Perform additional security checks
   */
  private static performSecurityChecks(errors: string[], warnings: string[]): void {
    const nodeEnv = process.env.NODE_ENV;

    // Check NODE_ENV
    if (!['development', 'staging', 'production', 'test'].includes(nodeEnv || '')) {
      warnings.push(
        `NODE_ENV should be one of: development, staging, production, test (current: ${nodeEnv})`
      );
    }

    // Production-specific checks
    if (nodeEnv === 'production') {
      // Ensure strong secrets in production
      const jwtSecret = process.env.JWT_SECRET || '';
      const encKey = process.env.APP_ENC_KEY || '';

      if (jwtSecret.includes('dev') || jwtSecret.includes('test')) {
        errors.push('JWT_SECRET appears to be a development key. Use a strong production secret.');
      }

      if (encKey.includes('dev') || encKey.includes('test')) {
        errors.push('APP_ENC_KEY appears to be a development key. Use a strong production secret.');
      }

      // Ensure HTTPS in production
      const frontendUrl = process.env.FRONTEND_URL || '';
      if (frontendUrl && !frontendUrl.startsWith('https://')) {
        warnings.push('FRONTEND_URL should use HTTPS in production');
      }

      // Check for localhost in production
      if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
        errors.push('FRONTEND_URL cannot use localhost in production');
      }
    }

    // Development-specific warnings
    if (nodeEnv === 'development') {
      warnings.push('Running in development mode - ensure production secrets are not used');
    }
  }

  /**
   * Get environment info (safe for logging)
   */
  static getEnvironmentInfo(): Record<string, string | boolean> {
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
