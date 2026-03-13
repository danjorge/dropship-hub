"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let RequestContextMiddleware = class RequestContextMiddleware {
    constructor() {
        this.logger = new common_1.Logger('HTTP');
    }
    use(req, res, next) {
        const requestId = req.headers['x-request-id'] || (0, uuid_1.v4)();
        const startTime = Date.now();
        req.requestId = requestId;
        res.setHeader('X-Request-ID', requestId);
        this.addSecurityHeaders(res);
        this.logger.log(`${req.method} ${req.originalUrl} [${requestId}] - IP: ${this.getClientIp(req)}`);
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logLevel = res.statusCode >= 400 ? 'warn' : 'log';
            this.logger[logLevel](`${req.method} ${req.originalUrl} [${requestId}] - ${res.statusCode} - ${duration}ms`);
        });
        next();
    }
    addSecurityHeaders(res) {
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none';");
    }
    getClientIp(req) {
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        const realIp = req.headers['x-real-ip'];
        if (realIp) {
            return realIp;
        }
        return req.ip || req.socket.remoteAddress || 'unknown';
    }
};
exports.RequestContextMiddleware = RequestContextMiddleware;
exports.RequestContextMiddleware = RequestContextMiddleware = __decorate([
    (0, common_1.Injectable)()
], RequestContextMiddleware);
//# sourceMappingURL=request-context.middleware.js.map