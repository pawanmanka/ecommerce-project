import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { map, type Observable } from "rxjs";

export interface ApiResponse<T> {
  data: T;
  message: string;
  errors: string[];
  pagination?: PaginationMetadata;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMetadata;
}

@Injectable()
export class ApiResponseInterceptor
  implements NestInterceptor<unknown, ApiResponse<unknown>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((result): ApiResponse<unknown> => {
        if (isPaginatedData(result)) {
          return {
            data: result.data,
            pagination: result.pagination,
            message: "Request successful",
            errors: [],
          };
        }
        return {
          data: result,
          message: "Request successful",
          errors: [],
        };
      }),
    );
  }
}

function isPaginatedData<T>(value: T): value is T & PaginatedData<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray(value.data) &&
    "pagination" in value
  );
}
