import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DailyFileLogger } from './daily-file.logger.js';

describe('DailyFileLogger', () => {
  it('writes info records to the current day info file', () => {
    const logger = new DailyFileLogger();
    const record = {
      type: 'test',
      method: 'GET',
      path: '/health',
      statusCode: 200,
    };
    logger.log(record);

    const timestamp = new Date().toISOString();
    const dayDirectory = timestamp.slice(0, 10);
    const lines = readFileSync(
      join(process.cwd(), 'logs', dayDirectory, 'info.log'),
      'utf8',
    )
      .trim()
      .split('\n');
    const [, formattedTimestamp, content] = lines
      .at(-1)!
      .match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} Utc) : (.+)$/)!;
    const loggedRecord = JSON.parse(content);

    expect(loggedRecord).toMatchObject(record);
    expect(formattedTimestamp.slice(0, 10)).toBe(dayDirectory);
    expect(loggedRecord.level).toBe('log');
  });

  it('writes error records to the current day error file', () => {
    const logger = new DailyFileLogger();
    logger.error({ type: 'test-error', message: 'Expected test error' });

    const timestamp = new Date().toISOString();
    const dayDirectory = timestamp.slice(0, 10);
    const lines = readFileSync(
      join(process.cwd(), 'logs', dayDirectory, 'error.log'),
      'utf8',
    )
      .trim()
      .split('\n');
    const [, formattedTimestamp, content] = lines
      .at(-1)!
      .match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} Utc) : (.+)$/)!;
    const loggedRecord = JSON.parse(content);

    expect(loggedRecord).toMatchObject({
      type: 'test-error',
      level: 'error',
    });
    expect(formattedTimestamp.slice(0, 10)).toBe(dayDirectory);
  });
});
