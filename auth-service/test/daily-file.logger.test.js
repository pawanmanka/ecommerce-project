import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { DailyFileLogger } from "../dist/logging/daily-file.logger.js";

test("writes info records to the current day's info file", () => {
  const logger = new DailyFileLogger();
  const record = {
    type: "test",
    method: "GET",
    path: "/health",
    statusCode: 200,
  };
  logger.log(record);

  const timestamp = new Date().toISOString();
  const dayDirectory = timestamp.slice(0, 10);
  const lines = readFileSync(
    join(
      process.cwd(),
      "logs",
      dayDirectory,
      "info.log",
    ),
    "utf8",
  )
    .trim()
    .split("\n");
  const [, formattedTimestamp, content] = lines.at(-1).match(
    /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} Utc) : (.+)$/,
  );
  const loggedRecord = JSON.parse(content);

  assert.deepEqual(
    {
      type: loggedRecord.type,
      method: loggedRecord.method,
      path: loggedRecord.path,
      statusCode: loggedRecord.statusCode,
    },
    record,
  );
  assert.equal(formattedTimestamp.slice(0, 10), dayDirectory);
  assert.equal(loggedRecord.level, "log");
});

test("writes error records to the current day's error file", () => {
  const logger = new DailyFileLogger();
  logger.error({ type: "test-error", message: "Expected test error" });

  const timestamp = new Date().toISOString();
  const dayDirectory = timestamp.slice(0, 10);
  const lines = readFileSync(
    join(
      process.cwd(),
      "logs",
      dayDirectory,
      "error.log",
    ),
    "utf8",
  )
    .trim()
    .split("\n");
  const [, formattedTimestamp, content] = lines.at(-1).match(
    /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} Utc) : (.+)$/,
  );
  const loggedRecord = JSON.parse(content);

  assert.equal(loggedRecord.type, "test-error");
  assert.equal(formattedTimestamp.slice(0, 10), dayDirectory);
  assert.equal(loggedRecord.level, "error");
});
