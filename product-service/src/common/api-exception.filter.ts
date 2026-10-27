import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import type { ApiResponse } from "./api-response.interceptor.js";

interface HttpResponse {
  status(code: number): this;
  json(body: ApiResponse<[]>): void;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<HttpResponse>();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : 500;
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : undefined;
    const errors = getErrors(exceptionResponse, exception);
    const message = isHttpException
      ? getMessage(exceptionResponse, errors)
      : "Internal server error";

    if (!isHttpException) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ApiResponse<[]> = {
      data: [],
      message,
      errors,
    };
    response.status(statusCode).json(body);
  }
}

function getErrors(response: unknown, exception: unknown): string[] {
  if (isRecord(response) && Array.isArray(response.message)) {
    return response.message.map(String);
  }
  if (isRecord(response) && typeof response.message === "string") {
    return [response.message];
  }
  if (typeof response === "string") {
    return [response];
  }
  if (exception instanceof Error) {
    return [exception.message];
  }
  return ["Internal server error"];
}

function getMessage(response: unknown, errors: string[]): string {
  if (isRecord(response) && typeof response.message === "string") {
    return response.message;
  }
  return errors[0] ?? "Request failed";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
