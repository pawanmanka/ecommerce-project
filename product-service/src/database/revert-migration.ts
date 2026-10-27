import { dataSource } from "./data-source.js";

await dataSource.initialize();
try {
  await dataSource.undoLastMigration();
  console.info("Reverted the last migration.");
} finally {
  await dataSource.destroy();
}
