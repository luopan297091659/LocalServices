import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { AppModule } from './app.module';
import { ApiResponseInterceptor } from './common/api-response.interceptor';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });
  const config = app.get(ConfigService);
  const uploadDirectory = config.get<string>('UPLOAD_DIR') ?? join(process.cwd(), 'uploads');
  await mkdir(uploadDirectory, { recursive: true });
  app.setGlobalPrefix('api/v1');
  app.set('trust proxy', config.get<string | boolean>('TRUST_PROXY') ?? false);
  app.enableShutdownHooks();
  app.use(helmet());
  app.useStaticAssets(uploadDirectory, { prefix: '/uploads/', fallthrough: false, dotfiles: 'deny' });
  app.enableCors({
    origin: (config.get<string>('APP_URL') ?? 'http://localhost:3000').split(',').map((origin) => origin.trim()),
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  if (config.get<boolean>('SWAGGER_ENABLED') ?? true) {
    const swagger = new DocumentBuilder()
      .setTitle('まちサービス API')
      .setDescription('日本ローカルサービスプラットフォーム MVP')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));
  }

  await app.listen(config.get<number>('PORT') ?? 3001, config.get<string>('HOST') ?? '127.0.0.1');
}

void bootstrap();
