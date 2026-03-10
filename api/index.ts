import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

const expressApp = express();
const adapter = new ExpressAdapter(expressApp);
let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, adapter, {
      logger: ['error', 'warn', 'log'],
    });
    
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });
    
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    const config = new DocumentBuilder()
      .setTitle('Dropship Hub API')
      .setDescription('SaaS Multi-Tenant Dropshipping Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
  }
  
  return expressApp;
}

export default async (req, res) => {
  await bootstrap();
  expressApp(req, res);
};
