import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RegisterDto } from "../dist/auth/dto/register.dto.js";

const validCredentials = {
  email: "person@example.com",
  password: "a-valid-password",
};

test("registration requires a non-empty name", async () => {
  for (const payload of [
    validCredentials,
    { ...validCredentials, name: "" },
    { ...validCredentials, name: "   " },
  ]) {
    const errors = await validate(plainToInstance(RegisterDto, payload));
    assert.ok(errors.some((error) => error.property === "name"));
  }
});

test("registration accepts a provided name", async () => {
  const errors = await validate(
    plainToInstance(RegisterDto, {
      ...validCredentials,
      name: "Person Example",
    }),
  );

  assert.equal(errors.some((error) => error.property === "name"), false);
});
