import { dataSource } from './data-source.js';
import { UserProfile } from '../users/user-profile.entity.js';

const userId = process.env.SEED_PROFILE_USER_ID?.trim();
const name = process.env.SEED_PROFILE_NAME?.trim();
if (!userId || !name) {
  throw new Error(
    'Set SEED_PROFILE_USER_ID and SEED_PROFILE_NAME in .env before running the seed command',
  );
}
if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(userId)) {
  throw new Error(
    'SEED_PROFILE_USER_ID must be a valid UUID from auth-service',
  );
}
if (name.length > 150) {
  throw new Error('SEED_PROFILE_NAME must be 150 characters or fewer');
}

await dataSource.initialize();
try {
  const profiles = dataSource.getRepository(UserProfile);
  const existingProfile = await profiles.findOneBy({ userId });
  if (existingProfile) {
    console.info(`A profile for user ${userId} already exists; skipping.`);
  } else {
    await profiles.save(profiles.create({ userId, name }));
    console.info(`Created profile for user ${userId}.`);
  }
} finally {
  await dataSource.destroy();
}
