import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { CreateUserProfiles1710000000000 } from './migrations/1710000000000-create-user-profiles.js';
import { UseUserIdAsUserProfilePrimaryKey1720000000000 } from './migrations/1720000000000-use-user-id-as-user-profile-primary-key.js';
import { UserProfile } from '../users/user-profile.entity.js';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.DB_PORT ?? 3306);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535');
}

export const dataSource = new DataSource({
  type: 'mysql',
  host: requiredEnv('DB_HOST'),
  port,
  username: requiredEnv('DB_USERNAME'),
  password: requiredEnv('DB_PASSWORD'),
  database: requiredEnv('DB_DATABASE'),
  entities: [UserProfile],
  migrations: [
    CreateUserProfiles1710000000000,
    UseUserIdAsUserProfilePrimaryKey1720000000000,
  ],
  synchronize: false,
});
