import { dataSource } from './data-source.js';

await dataSource.initialize();
try {
  const migrations = await dataSource.runMigrations();
  console.info(
    migrations.length
      ? `Applied migrations: ${migrations.map(({ name }) => name).join(', ')}`
      : 'No pending migrations.',
  );
} finally {
  await dataSource.destroy();
}
