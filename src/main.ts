import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from "@nestjs/common";
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { EnvironmentValidator } from './common/config/env-validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Validate environment variables before starting
  try {
    EnvironmentValidator.validate();
  } catch (error) {
    logger.error('Environment validation failed. Application cannot start.');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  
  app.use(helmet({
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
  
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  app.useGlobalFilters(new HttpExceptionFilter());
  
  const config = new DocumentBuilder()
    .setTitle('Dropship Hub API')
    .setDescription('Multi-tenant SaaS backend for dropshipping with Shopee and Mercado Livre integration')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-org-id',
        in: 'header',
        description: 'Organization ID for multi-tenant access',
      },
      'x-org-id',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Catalog', 'Catalog management (products, SKUs, offers)')
    .addTag('Listings', 'Merchant listings management')
    .addTag('Fulfillments', 'Supplier fulfillment operations')
    .addTag('Webhooks', 'Marketplace webhook handlers')
    .addTag('Debug', 'Developer tools and debugging')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  // Log startup information
  const envInfo = EnvironmentValidator.getEnvironmentInfo();
  logger.log(`Application started successfully on port ${port}`);
  logger.log(`Environment: ${envInfo.nodeEnv}`);
  logger.log(`Node version: ${envInfo.nodeVersion}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api`);
  
  // Log security status
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
