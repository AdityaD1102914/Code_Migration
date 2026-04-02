import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ORIGINS_TO_ALLOW } from './config/config';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ErrorHandlingInterceptor } from './interceptors/errorhandling.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = process.env.PORT || configService.get<number>('SERVER_PORT');
  const chekOtherDBInfo = configService.get<string>('DBNAME')
  const allowedOrigins = configService.get<string>('ORIGINS_TO_ALLOW');
  console.log(`Server is running on port ${port}`, chekOtherDBInfo);
  app.enableCors({
    origin: ORIGINS_TO_ALLOW,
    credentials: false,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
  });
  app.useGlobalInterceptors(new LoggingInterceptor(), new ErrorHandlingInterceptor(), new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe());//to enable validaiton pipe globally
  app.enableVersioning({
    type: VersioningType.URI
  })
  app.setGlobalPrefix('api/v1');
  console.log('port', port);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
