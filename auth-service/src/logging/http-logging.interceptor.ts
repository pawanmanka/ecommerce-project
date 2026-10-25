import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { catchError, tap, throwError, type Observable } from "rxjs";
import { DailyFileLogger } from "./daily-file.logger.js";

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: DailyFileLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const method = request.method;
    const path = request.route?.path ?? request.path;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() =>
        this.logger.log({
          type: "http",
          method,
          path,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
        }),
      ),
      catchError((error: unknown) => {
        this.logger.error({
          type: "http",
          method,
          path,
          statusCode:
            typeof error === "object" &&
            error !== null &&
            "getStatus" in error &&
            typeof error.getStatus === "function"
              ? error.getStatus()
              : 500,
          durationMs: Date.now() - startedAt,
        });
        return throwError(() => error);
      }),
    );
  }
}
