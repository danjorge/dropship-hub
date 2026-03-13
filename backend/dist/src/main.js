"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const env_validation_1 = require("./common/config/env-validation");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        env_validation_1.EnvironmentValidator.validate();
    }
    catch (error) {
        logger.error('Environment validation failed. Application cannot start.');
        process.exit(1);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Dropship Hub API')
        .setDescription('Multi-tenant SaaS backend for dropshipping with Shopee and Mercado Livre integration')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addApiKey({
        type: 'apiKey',
        name: 'x-org-id',
        in: 'header',
        description: 'Organization ID for multi-tenant access',
    }, 'x-org-id')
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Catalog', 'Catalog management (products, SKUs, offers)')
        .addTag('Listings', 'Merchant listings management')
        .addTag('Fulfillments', 'Supplier fulfillment operations')
        .addTag('Webhooks', 'Marketplace webhook handlers')
        .addTag('Debug', 'Developer tools and debugging')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    const envInfo = env_validation_1.EnvironmentValidator.getEnvironmentInfo();
    logger.log(`Application started successfully on port ${port}`);
    logger.log(`Environment: ${envInfo.nodeEnv}`);
    logger.log(`Node version: ${envInfo.nodeVersion}`);
    logger.log(`Swagger documentation: http://localhost:${port}/api`);
    logger.log('Security features enabled:');
    logger.log(`  ✓ Helmet security headers`);
    logger.log(`  ✓ CORS protection`);
    logger.log(`  ✓ Input validation`);
    logger.log(`  ✓ JWT authentication`);
    logger.log(`  ✓ Multi-tenant isolation`);
    logger.log(`  ✓ Audit logging`);
    logger.log(`  ✓ Data encryption: ${envInfo.hasEncryptionKey ? 'Enabled' : 'DISABLED'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map