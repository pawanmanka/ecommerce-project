import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { DailyFileLogger } from "./logging/daily-file.logger.js";
import { HttpLoggingInterceptor } from "./logging/http-logging.interceptor.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(DailyFileLogger));
  app.useGlobalInterceptors(app.get(HttpLoggingInterceptor));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ?? 3003);
}

await bootstrap();
