import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { of } from "rxjs";
import { ApiExceptionFilter } from "../dist/common/api-exception.filter.js";
import { ApiResponseInterceptor } from "../dist/common/api-response.interceptor.js";

test("wraps successful array responses in the standard envelope", async () => {
  const interceptor = new ApiResponseInterceptor();
  const response = await new Promise((resolve, reject) => {
    interceptor
      .intercept({}, { handle: () => of([{ id: "uuid" }]) })
      .subscribe({ next: resolve, error: reject });
  });

  test("keeps pagination metadata alongside array data in the standard envelope", async () => {
    const interceptor = new ApiResponseInterceptor();
    const response = await new Promise((resolve, reject) => {
      interceptor
        .intercept(
          {},
          {
            handle: () =>
              of({
                data: [{ id: "uuid" }],
                pagination: {
                  page: 1,
                  limit: 10,
                  total: 1,
                  totalPages: 1,
                },
              }),
          },
        )
        .subscribe({ next: resolve, error: reject });
    });

    assert.deepEqual(response, {
      data: [{ id: "uuid" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      message: "Request successful",
      errors: [],
    });
  });

  assert.deepEqual(response, {
    data: [{ id: "uuid" }],
    message: "Request successful",
    errors: [],
  });
});

test("wraps HTTP errors in the standard envelope", () => {
  const filter = new ApiExceptionFilter();
  const result = captureException(filter, new NotFoundException("Missing"));

  assert.equal(result.statusCode, 404);
  assert.deepEqual(result.body, {
    data: [],
    message: "Missing",
    errors: ["Missing"],
  });
});

test("keeps validation messages as an errors array", () => {
  const filter = new ApiExceptionFilter();
  const filterResponse = {
    statusCode: 400,
    message: ["categoryId must be a UUID", "search must be a string"],
    error: "Bad Request",
  };
  const result = captureException(
    filter,
    new BadRequestException(filterResponse),
  );

  assert.equal(result.statusCode, 400);
  assert.deepEqual(result.body, {
    data: [],
    message: "categoryId must be a UUID",
    errors: ["categoryId must be a UUID", "search must be a string"],
  });
});

function captureException(filter, exception) {
  const result = { statusCode: undefined, body: undefined };
  const response = {
    status(statusCode) {
      result.statusCode = statusCode;
      return this;
    },
    json(body) {
      result.body = body;
    },
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  };
  filter.catch(exception, host);
  return result;
}
