import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request Context Middleware
 * Adds request ID, timing, and security headers to all requests
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.headers['x-request-id'] as string || uuidv4();
    const startTime = Date.now();

    // Attach request ID to request object
    (req as any).requestId = requestId;

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    // Add security headers
    this.addSecurityHeaders(res);

    // Log request
    this.logger.log(
      `${req.method} ${req.originalUrl} [${requestId}] - IP: ${this.getClientIp(req)}`
    );

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'warn' : 'log';
      
      this.logger[logLevel](
        `${req.method} ${req.originalUrl} [${requestId}] - ${res.statusCode} - ${duration}ms`
      );
    });

    next();
  }

  /**
   * Add security headers to response
   */
  private addSecurityHeaders(res: Response): void {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy (adjust as needed)
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; frame-ancestors 'none';"
    );
  }

  /**
   * Get client IP address (handles proxies)
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    const realIp = req.headers['x-real-ip'] as string;
    if (realIp) {
      return realIp;
    }
    
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
