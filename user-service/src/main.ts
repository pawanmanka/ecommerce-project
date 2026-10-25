import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DailyFileLogger } from './logging/daily-file.logger.js';
import { HttpLoggingInterceptor } from './logging/http-logging.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(DailyFileLogger));
  app.useGlobalInterceptors(app.get(HttpLoggingInterceptor));
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3002);
}
await bootstrap();
