import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { inspect } from 'node:util';

const enabledLevels: LogLevel[] = [
  'verbose',
  'debug',
  'log',
  'warn',
  'error',
  'fatal',
];

@Injectable()
export class DailyFileLogger implements LoggerService {
  private readonly logsDirectory = join(process.cwd(), 'logs');
  private levels = new Set<LogLevel>(enabledLevels);

  constructor() {
    mkdirSync(this.logsDirectory, { recursive: true });
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.write('fatal', message, optionalParams);
  }

  setLogLevels(levels: LogLevel[]): void {
    this.levels = new Set(levels);
  }

  private write(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): void {
    if (!this.levels.has(level)) {
      return;
    }

    const context =
      typeof optionalParams.at(-1) === 'string'
        ? String(optionalParams.pop())
        : undefined;
    const stack =
      level === 'error' && typeof optionalParams[0] === 'string'
        ? String(optionalParams.shift())
        : undefined;
    const details = optionalParams.length
      ? this.format(optionalParams)
      : undefined;
    const timestamp = new Date().toISOString();
    const fields =
      typeof message === 'object' &&
      message !== null &&
      !(message instanceof Error) &&
      !Array.isArray(message)
        ? message
        : undefined;
    const record = {
      level,
      ...fields,
      ...(context && { context }),
      ...(!fields && { message: this.format(message) }),
      ...(stack && { stack }),
      ...(details && { details }),
    };
    const formattedTimestamp = `${timestamp.slice(0, 10)} ${timestamp.slice(11, 19)} Utc`;
    const line = `${formattedTimestamp} : ${JSON.stringify(record)}\n`;
    const dayDirectory = join(this.logsDirectory, timestamp.slice(0, 10));
    const category = level === 'error' || level === 'fatal' ? 'error' : 'info';
    const fileName = `${category}.log`;

    mkdirSync(dayDirectory, { recursive: true });
    appendFileSync(join(dayDirectory, fileName), line, {
      encoding: 'utf8',
      mode: 0o600,
    });
    (level === 'error' || level === 'fatal'
      ? process.stderr
      : process.stdout
    ).write(line);
  }

  private format(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (value instanceof Error) {
      return value.stack ?? `${value.name}: ${value.message}`;
    }
    return inspect(value, { depth: 5, breakLength: Infinity });
  }
}
