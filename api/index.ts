import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    app.use(helmet());
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
  
  return app;
}

export default async (req, res) => {
  const server = await bootstrap();
  const expressApp = server.getHttpAdapter().getInstance();
  return expressApp(req, res);
};
