import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ApiExceptionFilter } from "./common/api-exception.filter.js";
import { ApiResponseInterceptor } from "./common/api-response.interceptor.js";

const app = await NestFactory.create(AppModule);
app.setGlobalPrefix("api/v1");
app.useGlobalInterceptors(new ApiResponseInterceptor());
app.useGlobalFilters(new ApiExceptionFilter());
await app.listen(process.env.PORT ?? 3003);
